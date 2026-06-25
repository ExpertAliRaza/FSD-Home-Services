-- Fix PL/pgSQL variable ambiguity in worker RPCs.
-- Apply after 007_release_v1_1_worker_security.sql.

create or replace function public.respond_to_lead(
  p_assignment_id uuid,
  p_response text
)
returns public.lead_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment public.lead_assignments;
  v_worker_id uuid;
begin
  v_worker_id := public.require_worker_account();
  if p_response not in ('accepted', 'rejected') then
    raise exception 'Invalid lead response.';
  end if;

  select la.*
  into assignment
  from public.lead_assignments la
  where la.id = p_assignment_id
    and la.worker_id = v_worker_id
  for update;

  if not found then raise exception 'Lead assignment not found.'; end if;
  if assignment.status <> 'assigned' then
    raise exception 'This lead has already been answered.';
  end if;

  update public.lead_assignments
  set status = p_response, worker_response_at = now()
  where id = p_assignment_id
  returning * into assignment;

  update public.service_requests
  set status = case when p_response = 'accepted' then 'in_progress' else 'reviewing' end
  where id = assignment.service_request_id
    and status <> 'completed';

  return assignment;
end;
$$;

create or replace function public.remove_worker_work_photo(p_photo_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker_id uuid;
  removed_path text;
begin
  v_worker_id := public.require_worker_account();
  delete from public.worker_photos wp
  where wp.id = p_photo_id
    and wp.worker_id = v_worker_id
    and wp.photo_type = 'work_photo'
  returning wp.photo_url into removed_path;
  if removed_path is null then raise exception 'Work photo not found.'; end if;
  return removed_path;
end;
$$;
