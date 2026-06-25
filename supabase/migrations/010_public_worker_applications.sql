-- Allow workers to apply without Supabase Auth. Applications stay private and
-- pending until an admin reviews them.

alter table public.workers
  add column if not exists email text;

alter table public.workers drop constraint if exists workers_email_check;
alter table public.workers add constraint workers_email_check
  check (
    email is null
    or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );

create unique index if not exists workers_active_phone_unique_idx
  on public.workers(phone)
  where status in ('pending', 'approved', 'needs_changes', 'suspended');

create unique index if not exists workers_active_cnic_unique_idx
  on public.workers(cnic_number)
  where status in ('pending', 'approved', 'needs_changes', 'suspended');

create or replace function public.is_approved_worker_asset(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workers w
    where w.status = 'approved'
      and (
        w.profile_photo_url = object_name
        or exists (
          select 1
          from public.worker_photos wp
          where wp.worker_id = w.id
            and wp.photo_url = object_name
            and wp.status = 'approved'
        )
      )
  )
$$;

drop policy if exists "public worker application uploads" on storage.objects;
create policy "public worker application uploads" on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id in ('worker-public', 'worker-private')
    and name ~ '^applications/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[^/]+$'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );

drop policy if exists "public worker application cleanup" on storage.objects;

create or replace function public.create_worker_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_role(
    'admin',
    'new_worker_signup',
    'New Worker Application',
    new.display_name || ' applied as ' || new.service_category_id,
    new.id
  );
  return new;
end;
$$;

drop function if exists public.submit_worker_application(
  text, text, text, text, text, text, text, integer, text[], text, integer, text[], uuid
);

create or replace function public.submit_worker_application(
  p_application_id uuid,
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
)
returns public.workers
language plpgsql
security definer
set search_path = public
as $$
declare
  new_worker public.workers;
  work_photo_url text;
  application_prefix text := 'applications/' || p_application_id::text || '/';
begin
  if not public.consume_turnstile_verification(p_turnstile_verification_id, 'worker_signup') then
    raise exception 'Human verification is required.';
  end if;
  if char_length(trim(p_display_name)) < 2 or char_length(trim(p_display_name)) > 100 then
    raise exception 'Worker name must be between 2 and 100 characters.';
  end if;
  if p_phone !~ '^03[0-9]{9}$' then
    raise exception 'Enter a valid Pakistani mobile number.';
  end if;
  if p_email is not null
    and trim(p_email) <> ''
    and p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Enter a valid email address.';
  end if;
  if p_cnic_number !~ '^[0-9]{5}-[0-9]{7}-[0-9]$' then
    raise exception 'Enter a valid CNIC.';
  end if;
  if exists (
    select 1 from public.workers
    where phone = p_phone
      and status in ('pending', 'approved', 'needs_changes', 'suspended')
  ) then
    raise exception 'An active worker application already exists with this phone number.';
  end if;
  if exists (
    select 1 from public.workers
    where cnic_number = p_cnic_number
      and status in ('pending', 'approved', 'needs_changes', 'suspended')
  ) then
    raise exception 'An active worker application already exists with this CNIC.';
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
  if p_experience_years not between 0 and 80 then
    raise exception 'Experience must be between 0 and 80 years.';
  end if;
  if p_expected_visit_charges not between 0 and 100000 then
    raise exception 'Visit charges must be between Rs 0 and Rs 100,000.';
  end if;
  if char_length(trim(p_availability)) < 2 or char_length(trim(p_availability)) > 300 then
    raise exception 'Enter valid availability details.';
  end if;
  if p_cnic_front_url not like application_prefix || '%'
    or p_cnic_back_url not like application_prefix || '%'
    or p_profile_photo_url not like application_prefix || '%' then
    raise exception 'Invalid worker upload paths.';
  end if;
  if cardinality(p_work_photo_urls) = 0 then
    raise exception 'At least one work photo is required.';
  end if;

  foreach work_photo_url in array p_work_photo_urls loop
    if work_photo_url not like application_prefix || '%' then
      raise exception 'Invalid work photo path.';
    end if;
  end loop;

  insert into public.workers (
    profile_id, display_name, phone, email, cnic_number,
    cnic_front_url, cnic_back_url, profile_photo_url,
    service_category_id, experience_years, areas_covered,
    availability, expected_visit_charges, status,
    rating_avg, completed_jobs_count, repeat_customers_count,
    reliability_score, trust_badges
  )
  values (
    null, trim(p_display_name), p_phone, nullif(lower(trim(p_email)), ''), p_cnic_number,
    p_cnic_front_url, p_cnic_back_url, p_profile_photo_url,
    p_service_category_id, p_experience_years, p_areas_covered,
    trim(p_availability), p_expected_visit_charges, 'pending',
    0, 0, 0, 0, '{}'::text[]
  )
  returning * into new_worker;

  foreach work_photo_url in array p_work_photo_urls loop
    insert into public.worker_photos (worker_id, photo_url, photo_type, status)
    values (new_worker.id, work_photo_url, 'work_photo', 'pending');
  end loop;

  return new_worker;
exception
  when unique_violation then
    if exists (
      select 1 from public.workers
      where phone = p_phone
        and status in ('pending', 'approved', 'needs_changes', 'suspended')
    ) then
      raise exception 'An active worker application already exists with this phone number.';
    end if;
    raise exception 'An active worker application already exists with this CNIC.';
end;
$$;

revoke all on function public.submit_worker_application(
  uuid, text, text, text, text, text, text, text, text, integer,
  text[], text, integer, text[], uuid
) from public;
grant execute on function public.submit_worker_application(
  uuid, text, text, text, text, text, text, text, text, integer,
  text[], text, integer, text[], uuid
) to anon, authenticated;
