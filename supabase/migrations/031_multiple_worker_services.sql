-- 031_multiple_worker_services.sql

-- Add additional_services column to workers
alter table public.workers
add column if not exists additional_services text[] not null default '{}';

-- Validate that additional_services does not exceed length 2 (max 3 services total)
alter table public.workers
add constraint check_additional_services_length
check (cardinality(additional_services) <= 2);

-- Update public_worker_cards view to include additional_services
drop view if exists public.public_worker_cards;
create view public.public_worker_cards
with (security_barrier = true) as
select
  w.id,
  w.display_name,
  w.profile_photo_url,
  w.experience_years,
  w.areas_covered[1] as area_name,
  sc.name as service_name,
  w.rating_avg,
  w.completed_jobs_count,
  w.repeat_customers_count,
  w.reliability_score,
  w.trust_badges as badges,
  w.service_category_id,
  w.additional_services
from public.workers w
left join public.service_categories sc on sc.id = w.service_category_id
where w.status = 'approved';

-- Recreate submit_worker_application to accept additional_services
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
  p_work_photo_urls text[],
  p_additional_services text[] default '{}'
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

  if cardinality(p_additional_services) > 2 then
    raise exception 'You can select up to a maximum of 3 services in total.';
  end if;
  
  if cardinality(p_additional_services) > 0 and not (p_additional_services <@ array(select sc.id from public.service_categories sc where sc.is_active)) then
    raise exception 'One or more additional service categories are invalid.';
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

  insert into public.workers (
    profile_id, display_name, phone, email, cnic_number, cnic_front_url, cnic_back_url, profile_photo_url,
    service_category_id, additional_services, experience_years, areas_covered, availability, expected_visit_charges, status
  )
  values (
    auth.uid(), trim(p_display_name), p_phone, p_email, p_cnic_number, p_cnic_front_url, p_cnic_back_url, p_profile_photo_url,
    p_service_category_id, p_additional_services, p_experience_years, p_areas_covered, p_availability, p_expected_visit_charges, 'pending'
  )
  returning * into new_worker;

  if p_work_photo_urls is not null and cardinality(p_work_photo_urls) > 0 then
    foreach work_photo_url in array p_work_photo_urls loop
      if work_photo_url like auth.uid()::text || '/%' then
        insert into public.worker_photos (worker_id, photo_url, photo_type, status)
        values (new_worker.id, work_photo_url, 'work_photo', 'pending');
      end if;
    end loop;
  end if;

  return new_worker;
end;
$$;
