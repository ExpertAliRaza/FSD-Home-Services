-- FSD Home Services Launch Release v1.0
-- Apply after 004_notifications_reviews.sql.

delete from public.workers
where profile_id is null;

update public.workers
set
  rating_avg = 0,
  completed_jobs_count = 0,
  repeat_customers_count = 0,
  reliability_score = 0,
  trust_badges = '{}'::text[];

alter table public.workers alter column reliability_score set default 0;
alter table public.workers alter column trust_badges set default '{}'::text[];
alter table public.service_categories drop column if exists base_lead_fee;

create table if not exists public.commission_transactions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete restrict,
  worker_id uuid not null references public.workers(id) on delete restrict,
  job_amount numeric(12,2) not null check (job_amount > 0),
  commission_percentage numeric(5,2) not null default 10 check (commission_percentage = 10),
  commission_amount numeric(12,2) generated always as (round(job_amount * commission_percentage / 100, 2)) stored,
  payment_status text not null default 'due' check (payment_status in ('due', 'paid', 'waived')),
  paid_date date,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  check (
    (payment_status = 'paid' and paid_date is not null)
    or (payment_status <> 'paid')
  )
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete restrict,
  worker_id uuid not null references public.workers(id) on delete restrict,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (customer_phone ~ '^03[0-9]{9}$'),
  complaint_text text not null check (char_length(trim(complaint_text)) between 10 and 2000),
  resolution_status text not null default 'open' check (resolution_status in ('open', 'investigating', 'resolved', 'dismissed')),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.turnstile_verifications (
  id uuid primary key default gen_random_uuid(),
  purpose text not null check (purpose in ('service_request', 'worker_signup')),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists commission_transactions_worker_idx
  on public.commission_transactions(worker_id, payment_status);
create index if not exists complaints_status_idx
  on public.complaints(resolution_status, created_at desc);
create index if not exists turnstile_verifications_expiry_idx
  on public.turnstile_verifications(expires_at);

alter table public.commission_transactions enable row level security;
alter table public.complaints enable row level security;
alter table public.turnstile_verifications enable row level security;

create policy "admins manage commission transactions" on public.commission_transactions
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage complaints" on public.complaints
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('new_service_request', 'new_worker_application', 'complaint_submitted'));
alter table public.notifications drop constraint if exists notifications_entity_type_check;
alter table public.notifications add constraint notifications_entity_type_check
  check (entity_type in ('request', 'worker', 'complaint'));

create or replace function public.create_complaint_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, message, entity_type, entity_id)
  values (
    'complaint_submitted',
    'Complaint Submitted',
    'Complaint recorded for request ' || new.request_id::text,
    'complaint',
    new.id
  );
  return new;
end;
$$;

drop trigger if exists create_complaint_notification on public.complaints;
create trigger create_complaint_notification
after insert on public.complaints
for each row execute function public.create_complaint_notification();

create or replace function public.consume_turnstile_verification(
  p_verification_id uuid,
  p_purpose text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  consumed_id uuid;
begin
  update public.turnstile_verifications
  set used_at = now()
  where id = p_verification_id
    and purpose = p_purpose
    and used_at is null
    and expires_at > now()
  returning id into consumed_id;

  return consumed_id is not null;
end;
$$;

revoke all on function public.consume_turnstile_verification(uuid, text) from public;

drop function if exists public.submit_service_request(text, text, text, text, text, text, text, uuid, text);

create or replace function public.submit_service_request(
  p_customer_name text,
  p_customer_phone text,
  p_area_id text,
  p_service_category_id text,
  p_problem_description text,
  p_urgency text,
  p_preferred_time text default null,
  p_preferred_worker_id uuid default null,
  p_photo_path text default null,
  p_turnstile_verification_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_request_id uuid;
begin
  if p_turnstile_verification_id is null
    or not public.consume_turnstile_verification(p_turnstile_verification_id, 'service_request') then
    raise exception 'Human verification is required.';
  end if;
  if char_length(trim(p_customer_name)) < 2 or char_length(trim(p_customer_name)) > 100 then
    raise exception 'Customer name must be between 2 and 100 characters.';
  end if;
  if p_customer_phone !~ '^03[0-9]{9}$' then
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

revoke all on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid) from public;
grant execute on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid)
  to anon, authenticated;

drop policy if exists "workers insert own pending" on public.workers;
drop policy if exists "workers manage own photos" on public.worker_photos;
create policy "admins manage worker photos" on public.worker_photos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "workers read own photos" on public.worker_photos
  for select using (
    exists (
      select 1 from public.workers w
      where w.id = worker_id and w.profile_id = auth.uid()
    )
  );

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
  if public.current_user_role() <> 'worker' then
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

with ranked_assignments as (
  select
    id,
    row_number() over (
      partition by service_request_id
      order by assigned_at desc, id desc
    ) as row_number
  from public.lead_assignments
  where status in ('assigned', 'accepted')
)
update public.lead_assignments la
set status = 'cancelled'
from ranked_assignments ranked
where la.id = ranked.id
  and ranked.row_number > 1;

create unique index if not exists one_active_assignment_per_request_idx
  on public.lead_assignments(service_request_id)
  where status in ('assigned', 'accepted');

create or replace function public.require_approved_assignment_worker()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  request_category text;
begin
  select service_category_id
  into request_category
  from public.service_requests
  where id = new.service_request_id;

  if not exists (
    select 1 from public.workers
    where id = new.worker_id
      and status = 'approved'
      and service_category_id = request_category
  ) then
    raise exception 'Only an approved worker from the matching service category can be assigned.';
  end if;
  return new;
end;
$$;

create or replace function public.assign_worker_to_request(
  p_request_id uuid,
  p_worker_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;
  if not exists (
    select 1 from public.service_requests
    where id = p_request_id
      and status not in ('completed', 'cancelled')
  ) then
    raise exception 'This request cannot be assigned.';
  end if;

  update public.lead_assignments
  set status = 'cancelled'
  where service_request_id = p_request_id
    and status in ('assigned', 'accepted');

  insert into public.lead_assignments (
    service_request_id, worker_id, assigned_by, status, assigned_at
  )
  values (
    p_request_id, p_worker_id, auth.uid(), 'assigned', now()
  )
  on conflict (service_request_id, worker_id)
  do update set
    assigned_by = excluded.assigned_by,
    status = 'assigned',
    assigned_at = now(),
    worker_response_at = null,
    completed_at = null
  returning id into assignment_id;

  update public.service_requests
  set status = 'assigned', updated_at = now()
  where id = p_request_id;

  return assignment_id;
end;
$$;

revoke all on function public.assign_worker_to_request(uuid, uuid) from public;
grant execute on function public.assign_worker_to_request(uuid, uuid) to authenticated;

create or replace function public.require_commission_before_completion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = 'completed' and new.status is distinct from 'completed' then
    raise exception 'A completed request cannot be reopened.';
  end if;
  if new.status = 'completed'
    and old.status is distinct from 'completed'
    and not exists (
      select 1 from public.commission_transactions
      where request_id = new.id
    ) then
    raise exception 'Record the actual job value before completing this request.';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists require_commission_before_completion on public.service_requests;
create trigger require_commission_before_completion
before update of status on public.service_requests
for each row execute function public.require_commission_before_completion();

create or replace function public.complete_service_request(
  p_request_id uuid,
  p_job_amount numeric,
  p_notes text default null
)
returns public.commission_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_worker_id uuid;
  transaction_record public.commission_transactions;
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;
  if p_job_amount <= 0 then
    raise exception 'Actual job value must be greater than zero.';
  end if;
  if exists (
    select 1 from public.service_requests
    where id = p_request_id and status = 'completed'
  ) then
    raise exception 'This request is already completed.';
  end if;

  select worker_id
  into assigned_worker_id
  from public.lead_assignments
  where service_request_id = p_request_id
    and status in ('assigned', 'accepted')
  order by assigned_at desc
  limit 1;

  if assigned_worker_id is null then
    raise exception 'Assign an approved matching worker before completion.';
  end if;

  insert into public.commission_transactions (
    request_id, worker_id, job_amount, commission_percentage, payment_status, notes
  )
  values (
    p_request_id, assigned_worker_id, round(p_job_amount, 2), 10, 'due', nullif(trim(p_notes), '')
  )
  returning * into transaction_record;

  update public.service_requests
  set status = 'completed'
  where id = p_request_id;

  return transaction_record;
end;
$$;

revoke all on function public.complete_service_request(uuid, numeric, text) from public;
grant execute on function public.complete_service_request(uuid, numeric, text) to authenticated;

drop view if exists public.public_worker_cards;
create view public.public_worker_cards
with (security_barrier = true) as
select
  w.id,
  w.display_name,
  w.profile_photo_url,
  w.experience_years,
  w.areas_covered[1] as area_name,
  sc.name as service_name
from public.workers w
left join public.service_categories sc on sc.id = w.service_category_id
where w.status = 'approved';

grant select on public.public_worker_cards to anon, authenticated;
