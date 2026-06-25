-- Permanent admin-only deletion for workers and service requests.

create or replace function public.admin_delete_worker(p_worker_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  worker_record public.workers;
  public_paths text[];
  private_paths text[];
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;

  select * into worker_record
  from public.workers
  where id = p_worker_id
  for update;

  if worker_record.id is null then
    raise exception 'Worker not found.';
  end if;

  select coalesce(array_agg(photo_url), '{}'::text[])
  into public_paths
  from public.worker_photos
  where worker_id = p_worker_id;

  public_paths := array_remove(
    array_append(public_paths, worker_record.profile_photo_url),
    null
  );
  private_paths := array_remove(
    array[worker_record.cnic_front_url, worker_record.cnic_back_url],
    null
  );

  delete from public.notifications where related_id = p_worker_id;
  delete from public.admin_notes where entity_type = 'worker' and entity_id = p_worker_id;
  delete from public.admin_notes
  where entity_type = 'lead'
    and entity_id in (
      select id from public.lead_assignments where worker_id = p_worker_id
    );
  delete from public.complaints where worker_id = p_worker_id;
  delete from public.commission_transactions where worker_id = p_worker_id;
  delete from public.workers where id = p_worker_id;

  if worker_record.profile_id is not null then
    delete from auth.users where id = worker_record.profile_id;
  end if;

  return jsonb_build_object(
    'worker_public_paths', to_jsonb(public_paths),
    'worker_private_paths', to_jsonb(private_paths)
  );
end;
$$;

revoke all on function public.admin_delete_worker(uuid) from public;
grant execute on function public.admin_delete_worker(uuid) to authenticated;

create or replace function public.admin_delete_service_request(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  request_paths text[];
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;

  if not exists (
    select 1 from public.service_requests where id = p_request_id
  ) then
    raise exception 'Service request not found.';
  end if;

  select coalesce(array_agg(photo_url), '{}'::text[])
  into request_paths
  from public.request_photos
  where service_request_id = p_request_id;

  delete from public.notifications where related_id = p_request_id;
  delete from public.admin_notes where entity_type = 'request' and entity_id = p_request_id;
  delete from public.admin_notes
  where entity_type = 'lead'
    and entity_id in (
      select id from public.lead_assignments where service_request_id = p_request_id
    );
  delete from public.complaints where request_id = p_request_id;
  delete from public.commission_transactions where request_id = p_request_id;
  delete from public.service_requests where id = p_request_id;

  return jsonb_build_object(
    'request_photo_paths', to_jsonb(request_paths)
  );
end;
$$;

revoke all on function public.admin_delete_service_request(uuid) from public;
grant execute on function public.admin_delete_service_request(uuid) to authenticated;

drop policy if exists "admins delete managed storage objects" on storage.objects;
create policy "admins delete managed storage objects" on storage.objects
  for delete
  to authenticated
  using (
    public.is_admin()
    and bucket_id in ('worker-public', 'worker-private', 'request-photos')
  );
