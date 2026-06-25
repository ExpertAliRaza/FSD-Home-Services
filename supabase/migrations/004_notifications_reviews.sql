alter table public.workers
  add column if not exists review_count integer not null default 0;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('new_service_request', 'new_worker_application')),
  title text not null,
  message text not null,
  read_status boolean not null default false,
  entity_type text not null check (entity_type in ('request', 'worker')),
  entity_id uuid not null,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.review_invitations (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null unique references public.service_requests(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  review_invitation_id uuid not null unique references public.review_invitations(id) on delete cascade,
  service_request_id uuid not null unique references public.service_requests(id) on delete cascade,
  worker_id uuid not null references public.workers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(trim(review_text)) between 10 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_created_idx
  on public.notifications(read_status, created_at desc);
create index if not exists reviews_worker_idx
  on public.reviews(worker_id);

alter table public.notifications enable row level security;
alter table public.review_invitations enable row level security;
alter table public.reviews enable row level security;

create policy "admins manage notifications" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage review invitations" on public.review_invitations
  for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read reviews" on public.reviews
  for select using (public.is_admin());

create or replace function public.create_request_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, message, entity_type, entity_id)
  values (
    'new_service_request',
    'New Service Request',
    new.service_category_id || ' request from ' || new.customer_name || ' in ' || new.area_id,
    'request',
    new.id
  );
  return new;
end;
$$;

drop trigger if exists create_request_notification on public.service_requests;
create trigger create_request_notification
after insert on public.service_requests
for each row execute function public.create_request_notification();

create or replace function public.create_worker_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (type, title, message, entity_type, entity_id)
  values (
    'new_worker_application',
    'New Worker Application',
    new.display_name || ' applied as ' || new.service_category_id,
    'worker',
    new.id
  );
  return new;
end;
$$;

drop trigger if exists create_worker_notification on public.workers;
create trigger create_worker_notification
after insert on public.workers
for each row
when (new.profile_id is not null)
execute function public.create_worker_notification();

create or replace function public.handle_request_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_worker_id uuid;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    select la.worker_id
    into assigned_worker_id
    from public.lead_assignments la
    where la.service_request_id = new.id
      and la.status <> 'cancelled'
    order by la.assigned_at desc
    limit 1;

    if assigned_worker_id is null then
      raise exception 'Assign an approved worker before completing this request.';
    end if;

    update public.lead_assignments
    set status = 'completed', completed_at = coalesce(completed_at, now())
    where service_request_id = new.id
      and worker_id = assigned_worker_id;

    insert into public.review_invitations (service_request_id, worker_id)
    values (new.id, assigned_worker_id)
    on conflict (service_request_id) do nothing;

    update public.workers
    set completed_jobs_count = completed_jobs_count + 1
    where id = assigned_worker_id;
  end if;
  return new;
end;
$$;

drop trigger if exists handle_request_completion on public.service_requests;
create trigger handle_request_completion
after update of status on public.service_requests
for each row execute function public.handle_request_completion();

create or replace function public.get_review_context(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'valid', true,
    'worker_name', w.display_name,
    'service_name', sc.name,
    'area_name', a.name,
    'submitted', ri.used_at is not null,
    'expired', ri.expires_at < now()
  )
  from public.review_invitations ri
  join public.workers w on w.id = ri.worker_id
  join public.service_requests sr on sr.id = ri.service_request_id
  left join public.service_categories sc on sc.id = sr.service_category_id
  left join public.areas a on a.id = sr.area_id
  where ri.token = p_token
$$;

create or replace function public.submit_worker_review(
  p_token uuid,
  p_rating integer,
  p_review_text text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.review_invitations%rowtype;
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5.';
  end if;
  if char_length(trim(p_review_text)) < 10 or char_length(trim(p_review_text)) > 1000 then
    raise exception 'Review must be between 10 and 1000 characters.';
  end if;

  select *
  into invitation
  from public.review_invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'Invalid review link.';
  end if;
  if invitation.used_at is not null then
    raise exception 'This review link has already been used.';
  end if;
  if invitation.expires_at < now() then
    raise exception 'This review link has expired.';
  end if;

  insert into public.reviews (
    review_invitation_id,
    service_request_id,
    worker_id,
    rating,
    review_text
  )
  values (
    invitation.id,
    invitation.service_request_id,
    invitation.worker_id,
    p_rating,
    trim(p_review_text)
  );

  update public.review_invitations
  set used_at = now()
  where id = invitation.id;

  update public.workers w
  set
    rating_avg = stats.rating_avg,
    review_count = stats.review_count
  from (
    select
      worker_id,
      round(avg(rating)::numeric, 2) as rating_avg,
      count(*)::integer as review_count
    from public.reviews
    where worker_id = invitation.worker_id
    group by worker_id
  ) stats
  where w.id = stats.worker_id;

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.get_review_context(uuid) from public;
revoke all on function public.submit_worker_review(uuid, integer, text) from public;
grant execute on function public.get_review_context(uuid) to anon, authenticated;
grant execute on function public.submit_worker_review(uuid, integer, text) to anon, authenticated;

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
  w.review_count,
  w.completed_jobs_count,
  w.repeat_customers_count,
  w.reliability_score,
  w.trust_badges as badges
from public.workers w
left join public.service_categories sc on sc.id = w.service_category_id
where w.status = 'approved';

grant select on public.public_worker_cards to anon, authenticated;
