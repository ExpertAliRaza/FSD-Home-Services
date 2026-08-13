-- Drop old 2-arg function to avoid ambiguity
drop function if exists public.assign_worker_to_request(uuid, uuid);

-- 036_multiple_worker_assignments.sql

-- 1. Add assigned_service column to lead_assignments
alter table public.lead_assignments
add column if not exists assigned_service text;

-- 2. Modify assign_worker_to_request to accept a service and NOT cancel other services
create or replace function public.assign_worker_to_request(
  p_request_id uuid,
  p_worker_id uuid,
  p_service text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;
  if not exists (
    select 1 from public.service_requests
    where id = p_request_id
      and status not in ('completed', 'cancelled')
  ) then
    raise exception 'This request cannot be assigned.';
  end if;

  -- Cancel any existing assignment FOR THIS SPECIFIC SERVICE ONLY
  -- so that if they re-assign the CCTV Technician, the old CCTV Technician is cancelled.
  if p_service is not null then
    update public.lead_assignments
    set status = 'cancelled'
    where service_request_id = p_request_id
      and assigned_service = p_service
      and status in ('assigned', 'accepted');
  end if;

  insert into public.lead_assignments (
    service_request_id, worker_id, assigned_service, assigned_by, status, assigned_at
  )
  values (
    p_request_id, p_worker_id, p_service, auth.uid(), 'assigned', now()
  )
  on conflict (service_request_id, worker_id)
  do update set
    assigned_service = excluded.assigned_service,
    assigned_by = excluded.assigned_by,
    status = 'assigned',
    assigned_at = now(),
    worker_response_at = null,
    completed_at = null
  returning id into assignment_id;

  update public.service_requests
  set status = 'assigned', updated_at = now()
  where id = p_request_id;

  return assignment_id;
end;
$$;

revoke all on function public.assign_worker_to_request(uuid, uuid, text) from public;
grant execute on function public.assign_worker_to_request(uuid, uuid, text) to authenticated;

-- 3. Create unassign_worker_from_request
create or replace function public.unassign_worker_from_request(
  p_request_id uuid,
  p_worker_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;

  update public.lead_assignments
  set status = 'cancelled'
  where service_request_id = p_request_id
    and worker_id = p_worker_id
    and status in ('assigned', 'accepted');

  -- If no active assignments are left, revert the request status to 'new' (if it was 'assigned')
  if not exists (
    select 1 from public.lead_assignments
    where service_request_id = p_request_id
      and status in ('assigned', 'accepted', 'in_progress', 'completed')
  ) then
    update public.service_requests
    set status = 'new', updated_at = now()
    where id = p_request_id and status = 'assigned';
  end if;
end;
$$;

revoke all on function public.unassign_worker_from_request(uuid, uuid) from public;
grant execute on function public.unassign_worker_from_request(uuid, uuid) to authenticated;
