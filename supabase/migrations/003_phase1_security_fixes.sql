-- Apply this migration to projects that already ran 001 and 002.

update public.profiles
set role = 'customer'
where role = 'admin'
  and exists (
    select 1
    from auth.users u
    where u.id = profiles.id
      and u.raw_user_meta_data->>'role' = 'admin'
  );

create unique index if not exists lead_assignments_request_worker_idx
  on public.lead_assignments(service_request_id, worker_id);

create unique index if not exists workers_profile_id_unique_idx
  on public.workers(profile_id)
  where profile_id is not null;

alter table public.workers drop constraint if exists workers_experience_years_check;
alter table public.workers add constraint workers_experience_years_check
  check (experience_years between 0 and 80);

alter table public.workers drop constraint if exists workers_expected_visit_charges_check;
alter table public.workers add constraint workers_expected_visit_charges_check
  check (expected_visit_charges between 0 and 100000);

alter table public.workers drop constraint if exists workers_display_name_check;
alter table public.workers add constraint workers_display_name_check
  check (char_length(display_name) between 2 and 100);

alter table public.workers drop constraint if exists workers_phone_check;
alter table public.workers add constraint workers_phone_check
  check (phone ~ '^03[0-9]{9}$');

alter table public.workers drop constraint if exists workers_cnic_number_check;
alter table public.workers add constraint workers_cnic_number_check
  check (cnic_number ~ '^[0-9]{5}-[0-9]{7}-[0-9]$');

alter table public.workers drop constraint if exists workers_availability_check;
alter table public.workers add constraint workers_availability_check
  check (char_length(availability) <= 300);

alter table public.service_requests drop constraint if exists service_requests_problem_description_check;
alter table public.service_requests add constraint service_requests_problem_description_check
  check (char_length(problem_description) between 10 and 2000);

create or replace view public.public_worker_cards
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
  w.trust_badges as badges
from public.workers w
left join public.service_categories sc on sc.id = w.service_category_id
where w.status = 'approved';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'role' = 'worker' then 'worker'
      else 'customer'
    end,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.submit_service_request(
  p_customer_name text,
  p_customer_phone text,
  p_area_id text,
  p_service_category_id text,
  p_problem_description text,
  p_urgency text,
  p_preferred_time text default null,
  p_preferred_worker_id uuid default null,
  p_photo_path text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_request_id uuid;
begin
  if char_length(trim(p_customer_name)) < 2 or char_length(trim(p_customer_name)) > 100 then
    raise exception 'Customer name must be between 2 and 100 characters.';
  end if;
  if p_customer_phone !~ '^(\+92|0)?3[0-9]{9}$' then
    raise exception 'Enter a valid Pakistani mobile number.';
  end if;
  if char_length(trim(p_problem_description)) < 10 or char_length(trim(p_problem_description)) > 2000 then
    raise exception 'Problem description must be between 10 and 2000 characters.';
  end if;
  if p_urgency not in ('Normal', 'Today', 'Emergency') then
    raise exception 'Invalid urgency.';
  end if;
  if not exists (select 1 from public.areas where id = p_area_id and is_active) then
    raise exception 'Invalid service area.';
  end if;
  if not exists (select 1 from public.service_categories where id = p_service_category_id and is_active) then
    raise exception 'Invalid service category.';
  end if;
  if p_preferred_worker_id is not null and not exists (
    select 1
    from public.workers
    where id = p_preferred_worker_id
      and status = 'approved'
      and service_category_id = p_service_category_id
  ) then
    raise exception 'The selected worker is not approved for this service.';
  end if;
  if p_photo_path is not null and p_photo_path not like 'public/%' then
    raise exception 'Invalid request photo path.';
  end if;

  insert into public.service_requests (
    customer_name, customer_phone, area_id, service_category_id,
    preferred_worker_id, problem_description, urgency, preferred_time, status
  )
  values (
    trim(p_customer_name), p_customer_phone, p_area_id, p_service_category_id,
    p_preferred_worker_id, trim(p_problem_description), p_urgency,
    nullif(trim(p_preferred_time), ''), 'new'
  )
  returning id into new_request_id;

  if p_photo_path is not null then
    insert into public.request_photos (service_request_id, photo_url)
    values (new_request_id, p_photo_path);
  end if;

  return new_request_id;
end;
$$;

create or replace function public.is_approved_worker_asset(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1
    from public.workers w
    where w.profile_id::text = (storage.foldername(object_name))[1]
      and w.status = 'approved'
  )
$$;

create or replace function public.protect_worker_managed_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.profile_id is distinct from old.profile_id
      or new.status is distinct from old.status
      or new.admin_rejection_reason is distinct from old.admin_rejection_reason
      or new.rating_avg is distinct from old.rating_avg
      or new.completed_jobs_count is distinct from old.completed_jobs_count
      or new.repeat_customers_count is distinct from old.repeat_customers_count
      or new.reliability_score is distinct from old.reliability_score
      or new.trust_badges is distinct from old.trust_badges then
      raise exception 'Only an admin can update approval and trust fields.';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_worker_managed_fields on public.workers;
create trigger protect_worker_managed_fields
before update on public.workers
for each row execute function public.protect_worker_managed_fields();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not public.is_admin() then
    raise exception 'Only an admin can change account roles.';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row execute function public.protect_profile_role();

create or replace function public.require_approved_assignment_worker()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.workers
    where id = new.worker_id and status = 'approved'
  ) then
    raise exception 'Only approved workers can be assigned.';
  end if;
  return new;
end;
$$;

drop trigger if exists require_approved_assignment_worker on public.lead_assignments;
create trigger require_approved_assignment_worker
before insert or update of worker_id on public.lead_assignments
for each row execute function public.require_approved_assignment_worker();

drop policy if exists "approved workers public read" on public.workers;
drop policy if exists "workers own or admin read" on public.workers;
create policy "workers own or admin read" on public.workers
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "profiles admin insert" on public.profiles;
create policy "profiles admin insert" on public.profiles for insert
  with check ((id = auth.uid() and role in ('customer', 'worker')) or public.is_admin());

drop policy if exists "workers insert own pending" on public.workers;
create policy "workers insert own pending" on public.workers
  for insert with check (
    profile_id = auth.uid()
    and status = 'pending'
    and admin_rejection_reason is null
    and rating_avg = 0
    and completed_jobs_count = 0
    and repeat_customers_count = 0
    and reliability_score = 80
    and trust_badges = array['New Worker']::text[]
    and cardinality(areas_covered) > 0
    and areas_covered <@ array(select a.id from public.areas a where a.is_active)
    and exists (
      select 1 from public.service_categories sc
      where sc.id = workers.service_category_id and sc.is_active
    )
    and cnic_front_url like auth.uid()::text || '/%'
    and cnic_back_url like auth.uid()::text || '/%'
    and profile_photo_url like auth.uid()::text || '/%'
  );

drop policy if exists "workers respond own assignments" on public.lead_assignments;
drop policy if exists "workers update own non status" on public.workers;
drop policy if exists "public read approved worker photos" on public.worker_photos;
drop policy if exists "workers manage own photos" on public.worker_photos;
create policy "workers manage own photos" on public.worker_photos
  for all using (
    public.is_admin()
    or exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
  )
  with check (
    public.is_admin()
    or (
      exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
      and status = 'pending'
      and photo_type = 'work_photo'
      and photo_url like auth.uid()::text || '/%'
    )
  );
drop policy if exists "anonymous can create requests" on public.service_requests;
drop policy if exists "anonymous can create request photos" on public.request_photos;
drop policy if exists "customers insert public" on public.customers;

grant select on public.public_worker_cards to anon, authenticated;
revoke all on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text)
  from public;
grant execute on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text)
  to anon, authenticated;

update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('worker-public', 'worker-private', 'request-photos');

drop policy if exists "public worker assets are readable" on storage.objects;
drop policy if exists "approved worker assets are readable" on storage.objects;
create policy "approved worker assets are readable" on storage.objects
  for select using (
    bucket_id = 'worker-public'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
      or public.is_approved_worker_asset(name)
    )
  );

drop policy if exists "workers upload public assets" on storage.objects;
create policy "workers upload public assets" on storage.objects
  for insert with check (
    bucket_id = 'worker-public'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "workers upload private verification" on storage.objects;
create policy "workers upload private verification" on storage.objects
  for insert with check (
    bucket_id = 'worker-private'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "admins read private worker assets" on storage.objects;
create policy "admins read private worker assets" on storage.objects
  for select using (
    bucket_id = 'worker-private'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

drop policy if exists "anonymous upload request photos" on storage.objects;
create policy "anonymous upload request photos" on storage.objects
  for insert with check (
    bucket_id = 'request-photos'
    and name like 'public/%'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );
