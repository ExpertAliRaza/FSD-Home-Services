-- Make first-time worker applications resilient to profile-trigger timing and
-- allow an authenticated customer account to intentionally become a worker.

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not public.is_admin()
    and not (old.role = 'customer' and new.role = 'worker') then
    raise exception 'Only an admin can change account roles.';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prepare_worker_application_account(
  p_full_name text,
  p_phone text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  account_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if char_length(trim(p_full_name)) < 2 or char_length(trim(p_full_name)) > 100 then
    raise exception 'Worker name must be between 2 and 100 characters.';
  end if;

  if p_phone !~ '^03[0-9]{9}$' then
    raise exception 'Enter a valid Pakistani mobile number.';
  end if;

  if exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Admin accounts cannot submit worker applications.';
  end if;

  if exists (
    select 1 from public.workers
    where profile_id = auth.uid()
  ) then
    raise exception 'A worker application already exists for this account.';
  end if;

  insert into public.profiles (id, role, full_name, phone)
  values (auth.uid(), 'worker', trim(p_full_name), p_phone)
  on conflict (id) do update
  set role = 'worker',
      full_name = excluded.full_name,
      phone = excluded.phone,
      updated_at = now()
  returning * into account_profile;

  return account_profile;
end;
$$;

revoke all on function public.prepare_worker_application_account(text, text) from public;
grant execute on function public.prepare_worker_application_account(text, text) to authenticated;

create or replace function public.submit_worker_application(
  p_display_name text,
  p_phone text,
  p_cnic_number text,
  p_cnic_front_url text,
  p_cnic_back_url text,
  p_profile_photo_url text,
  p_service_category_id text,
  p_experience_years integer,
  p_areas_covered text[],
  p_availability text,
  p_expected_visit_charges integer,
  p_work_photo_urls text[],
  p_turnstile_verification_id uuid
)
returns public.workers
language plpgsql
security definer
set search_path = public
as $$
declare
  new_worker public.workers;
  work_photo_url text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'worker'
  ) then
    raise exception 'A worker account is required.';
  end if;
  if not public.consume_turnstile_verification(p_turnstile_verification_id, 'worker_signup') then
    raise exception 'Human verification is required.';
  end if;
  if exists (select 1 from public.workers where profile_id = auth.uid()) then
    raise exception 'A worker application already exists for this account.';
  end if;
  if p_phone !~ '^03[0-9]{9}$' then
    raise exception 'Enter a valid Pakistani mobile number.';
  end if;
  if p_cnic_number !~ '^[0-9]{5}-[0-9]{7}-[0-9]$' then
    raise exception 'Enter a valid CNIC.';
  end if;
  if cardinality(p_areas_covered) = 0
    or not (p_areas_covered <@ array(select a.id from public.areas a where a.is_active)) then
    raise exception 'Select valid service areas.';
  end if;
  if not exists (
    select 1 from public.service_categories sc
    where sc.id = p_service_category_id and sc.is_active
  ) then
    raise exception 'Invalid service category.';
  end if;
  if p_cnic_front_url not like auth.uid()::text || '/%'
    or p_cnic_back_url not like auth.uid()::text || '/%'
    or p_profile_photo_url not like auth.uid()::text || '/%' then
    raise exception 'Invalid worker upload paths.';
  end if;
  if cardinality(p_work_photo_urls) = 0 then
    raise exception 'At least one work photo is required.';
  end if;

  insert into public.workers (
    profile_id, display_name, phone, cnic_number,
    cnic_front_url, cnic_back_url, profile_photo_url,
    service_category_id, experience_years, areas_covered,
    availability, expected_visit_charges, status,
    rating_avg, completed_jobs_count, repeat_customers_count,
    reliability_score, trust_badges
  )
  values (
    auth.uid(), trim(p_display_name), p_phone, p_cnic_number,
    p_cnic_front_url, p_cnic_back_url, p_profile_photo_url,
    p_service_category_id, p_experience_years, p_areas_covered,
    trim(p_availability), p_expected_visit_charges, 'pending',
    0, 0, 0, 0, '{}'::text[]
  )
  returning * into new_worker;

  foreach work_photo_url in array p_work_photo_urls loop
    if work_photo_url not like auth.uid()::text || '/%' then
      raise exception 'Invalid work photo path.';
    end if;
    insert into public.worker_photos (worker_id, photo_url, photo_type, status)
    values (new_worker.id, work_photo_url, 'work_photo', 'pending');
  end loop;

  return new_worker;
end;
$$;

revoke all on function public.submit_worker_application(
  text, text, text, text, text, text, text, integer, text[], text, integer, text[], uuid
) from public;
grant execute on function public.submit_worker_application(
  text, text, text, text, text, text, text, integer, text[], text, integer, text[], uuid
) to authenticated;
