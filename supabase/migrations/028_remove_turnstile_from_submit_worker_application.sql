-- Drop ALL overloaded versions of submit_worker_application to ensure no
-- stale function with a consume_turnstile_verification check remains.
drop function if exists public.submit_worker_application(
  p_display_name text,
  p_phone text,
  p_email text,
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
);

drop function if exists public.submit_worker_application(
  p_display_name text,
  p_phone text,
  p_email text,
  p_cnic_number text,
  p_cnic_front_url text,
  p_cnic_back_url text,
  p_profile_photo_url text,
  p_service_category_id text,
  p_experience_years integer,
  p_areas_covered text[],
  p_availability text,
  p_expected_visit_charges integer,
  p_work_photo_urls text[]
);

-- Recreate with the latest schema — NO Turnstile check, NO work photos requirement,
-- optional CNIC, optional documents, matching migration 023 behaviour.
create or replace function public.submit_worker_application(
  p_display_name text,
  p_phone text,
  p_email text,
  p_cnic_number text,
  p_cnic_front_url text,
  p_cnic_back_url text,
  p_profile_photo_url text,
  p_service_category_id text,
  p_experience_years integer,
  p_areas_covered text[],
  p_availability text,
  p_expected_visit_charges integer,
  p_work_photo_urls text[]
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
    raise exception 'Worker authentication is required.';
  end if;

  if exists (select 1 from public.workers where profile_id = auth.uid()) then
    raise exception 'A worker application already exists for this account.';
  end if;

  if exists (
    select 1 from public.workers
    where phone = p_phone
      and status in ('pending', 'approved', 'needs_changes', 'suspended')
  ) then
    raise exception 'A worker application already exists with this phone number.';
  end if;

  if p_cnic_number is not null and exists (
    select 1 from public.workers
    where cnic_number = p_cnic_number
      and status in ('pending', 'approved', 'needs_changes', 'suspended')
  ) then
    raise exception 'A worker application already exists with this CNIC.';
  end if;

  if cardinality(p_areas_covered) = 0
    or not (p_areas_covered <@ array(select a.id from public.areas a where a.is_active)) then
    raise exception 'Select at least one valid service area.';
  end if;

  if not exists (
    select 1 from public.service_categories sc
    where sc.id = p_service_category_id
      and sc.is_active
  ) then
    raise exception 'Select a valid service category.';
  end if;

  if p_cnic_front_url is not null and p_cnic_front_url not like auth.uid()::text || '/%' then
    raise exception 'Invalid uploaded document path.';
  end if;

  if p_cnic_back_url is not null and p_cnic_back_url not like auth.uid()::text || '/%' then
    raise exception 'Invalid uploaded document path.';
  end if;

  if p_profile_photo_url is not null and p_profile_photo_url not like auth.uid()::text || '/%' then
    raise exception 'Invalid uploaded document path.';
  end if;

  foreach work_photo_url in array coalesce(p_work_photo_urls, '{}'::text[]) loop
    if work_photo_url not like auth.uid()::text || '/%' then
      raise exception 'Invalid work photo path.';
    end if;
  end loop;

  insert into public.workers (
    profile_id, display_name, phone, email, cnic_number,
    cnic_front_url, cnic_back_url, profile_photo_url,
    service_category_id, experience_years, areas_covered,
    availability, expected_visit_charges, status
  )
  values (
    auth.uid(), trim(p_display_name), p_phone, nullif(trim(p_email), ''), nullif(p_cnic_number, ''),
    p_cnic_front_url, p_cnic_back_url, p_profile_photo_url,
    p_service_category_id, coalesce(p_experience_years, 0), p_areas_covered,
    nullif(trim(p_availability), ''), p_expected_visit_charges, 'pending'
  )
  returning * into new_worker;

  update public.profiles
  set full_name = trim(p_display_name), phone = p_phone, updated_at = now()
  where id = auth.uid();

  foreach work_photo_url in array coalesce(p_work_photo_urls, '{}'::text[]) loop
    insert into public.worker_photos (worker_id, photo_url, photo_type, status)
    values (new_worker.id, work_photo_url, 'work_photo', 'pending');
  end loop;

  return new_worker;
end;
$$;

revoke all on function public.submit_worker_application(
  text, text, text, text, text, text, text, text, integer,
  text[], text, integer, text[]
) from public;
grant execute on function public.submit_worker_application(
  text, text, text, text, text, text, text, text, integer,
  text[], text, integer, text[]
) to authenticated;