create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'worker', 'customer')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true
);

create table if not exists public.areas (
  id text primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text not null check (char_length(display_name) between 2 and 100),
  phone text not null check (phone ~ '^03[0-9]{9}$'),
  cnic_number text not null check (cnic_number ~ '^[0-9]{5}-[0-9]{7}-[0-9]$'),
  cnic_front_url text,
  cnic_back_url text,
  profile_photo_url text,
  service_category_id text references public.service_categories(id),
  experience_years integer not null default 0 check (experience_years between 0 and 80),
  areas_covered text[] not null default '{}',
  availability text check (char_length(availability) <= 300),
  expected_visit_charges integer check (expected_visit_charges between 0 and 100000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'needs_changes', 'suspended')),
  admin_rejection_reason text,
  rating_avg numeric(3,2) not null default 0,
  completed_jobs_count integer not null default 0,
  repeat_customers_count integer not null default 0,
  reliability_score integer not null default 0,
  trust_badges text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  area_id text references public.areas(id),
  created_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  area_id text references public.areas(id),
  service_category_id text references public.service_categories(id),
  preferred_worker_id uuid references public.workers(id) on delete set null,
  problem_description text not null check (char_length(problem_description) between 10 and 2000),
  urgency text not null default 'Normal' check (urgency in ('Normal', 'Today', 'Emergency')),
  preferred_time text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'assigned', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  status text not null default 'assigned' check (status in ('assigned', 'accepted', 'rejected', 'completed', 'cancelled')),
  assigned_at timestamptz not null default now(),
  worker_response_at timestamptz,
  completed_at timestamptz,
  unique (service_request_id, worker_id)
);

create table if not exists public.worker_photos (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.workers(id) on delete cascade,
  photo_url text not null,
  photo_type text not null default 'work_photo' check (photo_type in ('work_photo', 'profile', 'cnic_front', 'cnic_back')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.request_photos (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('worker', 'request', 'lead')),
  entity_id uuid not null,
  admin_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
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
    customer_name,
    customer_phone,
    area_id,
    service_category_id,
    preferred_worker_id,
    problem_description,
    urgency,
    preferred_time,
    status
  )
  values (
    trim(p_customer_name),
    p_customer_phone,
    p_area_id,
    p_service_category_id,
    p_preferred_worker_id,
    trim(p_problem_description),
    p_urgency,
    nullif(trim(p_preferred_time), ''),
    'new'
  )
  returning id into new_request_id;

  if p_photo_path is not null then
    insert into public.request_photos (service_request_id, photo_url)
    values (new_request_id, p_photo_path);
  end if;

  return new_request_id;
end;
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

create index if not exists workers_status_idx on public.workers(status);
create unique index if not exists workers_profile_id_unique_idx
  on public.workers(profile_id)
  where profile_id is not null;
create index if not exists service_requests_status_idx on public.service_requests(status);
create index if not exists lead_assignments_worker_idx on public.lead_assignments(worker_id);
