-- Release v1.1 worker dashboard security hardening.
-- Apply after 006_release_v1_1_worker_dashboard.sql.

create or replace function public.require_worker_account()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  worker_id uuid;
begin
  if auth.uid() is null or public.current_user_role() <> 'worker' then
    raise exception 'Worker authentication is required.';
  end if;
  select id into worker_id
  from public.workers
  where profile_id = auth.uid();
  if worker_id is null then
    raise exception 'Worker profile not found.';
  end if;
  return worker_id;
end;
$$;

revoke all on function public.require_worker_account() from public;

create policy "workers read assigned request photos" on public.request_photos
  for select using (
    exists (
      select 1
      from public.lead_assignments la
      join public.workers w on w.id = la.worker_id
      where la.service_request_id = request_photos.service_request_id
        and w.profile_id = auth.uid()
    )
  );

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
  worker_id uuid;
begin
  worker_id := public.require_worker_account();
  if p_response not in ('accepted', 'rejected') then
    raise exception 'Invalid lead response.';
  end if;

  select *
  into assignment
  from public.lead_assignments
  where id = p_assignment_id
    and lead_assignments.worker_id = worker_id
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

create or replace function public.update_worker_profile(
  p_bio text,
  p_experience_years integer,
  p_areas_covered text[],
  p_availability text,
  p_expected_visit_charges integer
)
returns public.workers
language plpgsql
security definer
set search_path = public
as $$
declare
  worker_id uuid;
  updated_worker public.workers;
begin
  worker_id := public.require_worker_account();
  if cardinality(p_areas_covered) = 0
    or not (p_areas_covered <@ array(select id from public.areas where is_active)) then
    raise exception 'Select valid service areas.';
  end if;
  if p_experience_years not between 0 and 80 then
    raise exception 'Invalid experience value.';
  end if;
  if p_expected_visit_charges not between 0 and 100000 then
    raise exception 'Invalid visit charges.';
  end if;

  update public.workers
  set
    bio = nullif(trim(p_bio), ''),
    experience_years = p_experience_years,
    areas_covered = p_areas_covered,
    availability = nullif(trim(p_availability), ''),
    expected_visit_charges = p_expected_visit_charges,
    updated_at = now()
  where id = worker_id
  returning * into updated_worker;
  return updated_worker;
end;
$$;

create or replace function public.replace_worker_documents(
  p_cnic_front_url text,
  p_cnic_back_url text,
  p_profile_photo_url text default null
)
returns public.workers
language plpgsql
security definer
set search_path = public
as $$
declare
  worker_id uuid;
  updated_worker public.workers;
begin
  worker_id := public.require_worker_account();
  if p_cnic_front_url not like auth.uid()::text || '/%'
    or p_cnic_back_url not like auth.uid()::text || '/%'
    or (p_profile_photo_url is not null and p_profile_photo_url not like auth.uid()::text || '/%') then
    raise exception 'Invalid document paths.';
  end if;

  update public.workers
  set
    cnic_front_url = p_cnic_front_url,
    cnic_back_url = p_cnic_back_url,
    profile_photo_url = coalesce(p_profile_photo_url, profile_photo_url),
    status = 'pending',
    admin_rejection_reason = null,
    updated_at = now()
  where id = worker_id
    and status in ('needs_changes', 'rejected', 'pending')
  returning * into updated_worker;

  if not found then raise exception 'Document replacement is not currently available.'; end if;
  return updated_worker;
end;
$$;

create or replace function public.add_worker_work_photos(p_photo_urls text[])
returns setof public.worker_photos
language plpgsql
security definer
set search_path = public
as $$
declare
  worker_id uuid;
  photo_url text;
  created_photo public.worker_photos;
begin
  worker_id := public.require_worker_account();
  if cardinality(p_photo_urls) = 0 or cardinality(p_photo_urls) > 6 then
    raise exception 'Upload between 1 and 6 work photos.';
  end if;

  foreach photo_url in array p_photo_urls loop
    if photo_url not like auth.uid()::text || '/%' then
      raise exception 'Invalid work photo path.';
    end if;
    insert into public.worker_photos (worker_id, photo_url, photo_type, status)
    values (worker_id, photo_url, 'work_photo', 'pending')
    returning * into created_photo;
    return next created_photo;
  end loop;
end;
$$;

create or replace function public.remove_worker_work_photo(p_photo_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  worker_id uuid;
  removed_path text;
begin
  worker_id := public.require_worker_account();
  delete from public.worker_photos
  where id = p_photo_id
    and worker_photos.worker_id = worker_id
    and photo_type = 'work_photo'
  returning photo_url into removed_path;
  if removed_path is null then raise exception 'Work photo not found.'; end if;
  return removed_path;
end;
$$;

create or replace function public.update_notification_preferences(p_preferences jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  preferences jsonb;
begin
  perform public.require_worker_account();
  preferences := jsonb_build_object(
    'in_app', coalesce((p_preferences->>'in_app')::boolean, true),
    'email', coalesce((p_preferences->>'email')::boolean, true)
  );
  update public.profiles
  set notification_preferences = preferences, updated_at = now()
  where id = auth.uid();
  return preferences;
end;
$$;

