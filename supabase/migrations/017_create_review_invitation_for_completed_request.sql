create or replace function public.create_review_invitation_for_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_worker_id uuid;
  invitation_token uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;

  select la.worker_id
  into assigned_worker_id
  from public.lead_assignments la
  join public.service_requests sr on sr.id = la.service_request_id
  where la.service_request_id = p_request_id
    and sr.status = 'completed'
    and la.status <> 'cancelled'
  order by la.assigned_at desc
  limit 1;

  if assigned_worker_id is null then
    raise exception 'Complete and assign this request before creating a review link.';
  end if;

  insert into public.review_invitations (service_request_id, worker_id)
  values (p_request_id, assigned_worker_id)
  on conflict (service_request_id) do update
    set service_request_id = excluded.service_request_id
  returning token into invitation_token;

  return invitation_token;
end;
$$;

revoke all on function public.create_review_invitation_for_request(uuid) from public;
grant execute on function public.create_review_invitation_for_request(uuid) to authenticated;
