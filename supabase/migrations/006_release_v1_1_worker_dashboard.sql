-- FSD Home Services Release v1.1
-- Apply after 005_launch_v1.sql.

alter table public.workers
  add column if not exists bio text check (char_length(bio) <= 1000);

alter table public.profiles
  add column if not exists notification_preferences jsonb not null default
    '{"in_app": true, "email": true}'::jsonb;

alter table public.notifications
  rename column read_status to is_read;

alter table public.notifications
  rename column entity_id to related_id;

alter table public.notifications
  add column if not exists recipient_id uuid references public.profiles(id) on delete cascade,
  add column if not exists recipient_role text;

alter table public.notifications drop constraint if exists notifications_entity_type_check;
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications drop constraint if exists notifications_recipient_role_check;
alter table public.notifications add constraint notifications_recipient_role_check
  check (recipient_role in ('admin', 'worker'));

update public.notifications
set
  type = case type
    when 'new_service_request' then 'new_customer_request'
    when 'new_worker_application' then 'new_worker_signup'
    when 'complaint_submitted' then 'new_complaint'
    else type
  end,
  recipient_role = 'admin'
where recipient_role is null;

insert into public.notifications (
  recipient_id, recipient_role, type, title, message, related_id,
  is_read, email_sent_at, created_at
)
select
  p.id, 'admin', n.type, n.title, n.message, n.related_id,
  n.is_read, n.email_sent_at, n.created_at
from public.notifications n
cross join public.profiles p
where n.recipient_id is null
  and p.role = 'admin';

delete from public.notifications
where recipient_id is null;

alter table public.notifications
  drop column if exists entity_type;

alter table public.notifications add constraint notifications_type_check
  check (type in (
    'new_worker_signup',
    'new_customer_request',
    'worker_accepted_lead',
    'worker_rejected_lead',
    'job_completed',
    'new_complaint',
    'new_review',
    'commission_recorded',
    'profile_approved',
    'profile_rejected',
    'new_lead_assigned',
    'lead_cancelled',
    'commission_due'
  ));

alter table public.notifications
  alter column recipient_id set not null,
  alter column recipient_role set not null;

drop index if exists notifications_unread_created_idx;
create index if not exists notifications_recipient_unread_created_idx
  on public.notifications(recipient_id, is_read, created_at desc);
create index if not exists notifications_related_idx
  on public.notifications(related_id);
create index if not exists lead_assignments_worker_status_idx
  on public.lead_assignments(worker_id, status, assigned_at desc);
create index if not exists service_requests_status_created_idx
  on public.service_requests(status, created_at desc);
create index if not exists admin_notes_entity_idx
  on public.admin_notes(entity_type, entity_id, created_at desc);
create index if not exists worker_photos_worker_idx
  on public.worker_photos(worker_id, created_at desc);
create index if not exists request_photos_request_idx
  on public.request_photos(service_request_id);

drop policy if exists "admins manage notifications" on public.notifications;
create policy "recipients read notifications" on public.notifications
  for select using (recipient_id = auth.uid());
create policy "recipients update notifications" on public.notifications
  for update using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create or replace function public.protect_notification_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and (
    new.recipient_id is distinct from old.recipient_id
    or new.recipient_role is distinct from old.recipient_role
    or new.type is distinct from old.type
    or new.title is distinct from old.title
    or new.message is distinct from old.message
    or new.related_id is distinct from old.related_id
    or new.email_sent_at is distinct from old.email_sent_at
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Only the notification read state can be changed.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_notification_fields on public.notifications;
create trigger protect_notification_fields
before update on public.notifications
for each row execute function public.protect_notification_fields();

create or replace function public.notify_role(
  p_role text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (
    recipient_id, recipient_role, type, title, message, related_id
  )
  select id, role, p_type, p_title, p_message, p_related_id
  from public.profiles
  where role = p_role
    and coalesce((notification_preferences->>'in_app')::boolean, true);
$$;

create or replace function public.notify_worker(
  p_worker_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (
    recipient_id, recipient_role, type, title, message, related_id
  )
  select profile_id, 'worker', p_type, p_title, p_message, p_related_id
  from public.workers w
  join public.profiles p on p.id = w.profile_id
  where w.id = p_worker_id
    and w.profile_id is not null
    and coalesce((p.notification_preferences->>'in_app')::boolean, true);
$$;

revoke all on function public.notify_role(text, text, text, text, uuid) from public;
revoke all on function public.notify_worker(uuid, text, text, text, uuid) from public;

create or replace function public.create_request_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_role(
    'admin',
    'new_customer_request',
    'New Customer Request',
    new.service_category_id || ' request from ' || new.customer_name || ' in ' || new.area_id,
    new.id
  );
  return new;
end;
$$;

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
    'New Worker Signup',
    new.display_name || ' applied as ' || new.service_category_id,
    new.id
  );
  return new;
end;
$$;

create or replace function public.create_complaint_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_role(
    'admin',
    'new_complaint',
    'New Complaint',
    'Complaint recorded for request ' || new.request_id::text,
    new.id
  );
  return new;
end;
$$;

create or replace function public.notify_worker_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'approved' then
      perform public.notify_worker(
        new.id, 'profile_approved', 'Profile Approved',
        'Your worker profile is approved and now eligible for leads.', new.id
      );
    elsif new.status in ('rejected', 'needs_changes', 'suspended') then
      perform public.notify_worker(
        new.id, 'profile_rejected',
        case when new.status = 'needs_changes' then 'Profile Changes Required' else 'Profile Status Updated' end,
        coalesce(new.admin_rejection_reason, 'Your worker profile status is now ' || new.status || '.'),
        new.id
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists notify_worker_status_change on public.workers;
create trigger notify_worker_status_change
after update of status on public.workers
for each row execute function public.notify_worker_status_change();

create or replace function public.notify_assignment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or (
    new.status = 'assigned'
    and (old.status is distinct from 'assigned' or old.assigned_at is distinct from new.assigned_at)
  ) then
    perform public.notify_worker(
      new.worker_id, 'new_lead_assigned', 'New Lead Assigned',
      'A new service lead has been assigned to you.', new.service_request_id
    );
  elsif new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    perform public.notify_worker(
      new.worker_id, 'lead_cancelled', 'Lead Cancelled',
      'A previously assigned lead has been cancelled.', new.service_request_id
    );
  elsif new.status = 'accepted' and old.status is distinct from 'accepted' then
    perform public.notify_role(
      'admin', 'worker_accepted_lead', 'Worker Accepted Lead',
      'A worker accepted the assigned lead.', new.service_request_id
    );
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    perform public.notify_role(
      'admin', 'worker_rejected_lead', 'Worker Rejected Lead',
      'A worker rejected the assigned lead.', new.service_request_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_assignment_change on public.lead_assignments;
create trigger notify_assignment_change
after insert or update of status, assigned_at on public.lead_assignments
for each row execute function public.notify_assignment_change();

create or replace function public.notify_commission_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_role(
    'admin', 'commission_recorded', 'Commission Recorded',
    'A commission of Rs ' || new.commission_amount::text || ' was recorded.',
    new.request_id
  );
  perform public.notify_worker(
    new.worker_id, 'commission_due', 'Commission Due',
    'Commission due: Rs ' || new.commission_amount::text || ' for a completed job.',
    new.request_id
  );
  return new;
end;
$$;

drop trigger if exists notify_commission_created on public.commission_transactions;
create trigger notify_commission_created
after insert on public.commission_transactions
for each row execute function public.notify_commission_created();

create or replace function public.notify_review_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_role(
    'admin', 'new_review', 'New Review',
    'A customer submitted a ' || new.rating::text || '-star review.',
    new.service_request_id
  );
  perform public.notify_worker(
    new.worker_id, 'new_review', 'New Review',
    'You received a new ' || new.rating::text || '-star review.',
    new.service_request_id
  );
  return new;
end;
$$;

drop trigger if exists notify_review_created on public.reviews;
create trigger notify_review_created
after insert on public.reviews
for each row execute function public.notify_review_created();

create or replace function public.notify_job_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    perform public.notify_role(
      'admin', 'job_completed', 'Job Completed',
      'A service request was marked completed.', new.id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_job_completed on public.service_requests;
create trigger notify_job_completed
after update of status on public.service_requests
for each row execute function public.notify_job_completed();

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
begin
  if p_response not in ('accepted', 'rejected') then
    raise exception 'Invalid lead response.';
  end if;

  select la.*
  into assignment
  from public.lead_assignments la
  join public.workers w on w.id = la.worker_id
  where la.id = p_assignment_id
    and w.profile_id = auth.uid()
  for update;

  if not found then
    raise exception 'Lead assignment not found.';
  end if;
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

revoke all on function public.respond_to_lead(uuid, text) from public;
grant execute on function public.respond_to_lead(uuid, text) to authenticated;

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
  updated_worker public.workers;
begin
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
  where profile_id = auth.uid()
  returning * into updated_worker;

  if not found then raise exception 'Worker profile not found.'; end if;
  return updated_worker;
end;
$$;

revoke all on function public.update_worker_profile(text, integer, text[], text, integer) from public;
grant execute on function public.update_worker_profile(text, integer, text[], text, integer) to authenticated;

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
  updated_worker public.workers;
begin
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
  where profile_id = auth.uid()
    and status in ('needs_changes', 'rejected', 'pending')
  returning * into updated_worker;

  if not found then raise exception 'Document replacement is not currently available.'; end if;
  return updated_worker;
end;
$$;

revoke all on function public.replace_worker_documents(text, text, text) from public;
grant execute on function public.replace_worker_documents(text, text, text) to authenticated;

create or replace function public.add_worker_work_photos(p_photo_urls text[])
returns setof public.worker_photos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker_id uuid;
  photo_url text;
  created_photo public.worker_photos;
begin
  select id into v_worker_id
  from public.workers
  where profile_id = auth.uid();
  if v_worker_id is null then raise exception 'Worker profile not found.'; end if;
  if cardinality(p_photo_urls) = 0 or cardinality(p_photo_urls) > 6 then
    raise exception 'Upload between 1 and 6 work photos.';
  end if;

  foreach photo_url in array p_photo_urls loop
    if photo_url not like auth.uid()::text || '/%' then
      raise exception 'Invalid work photo path.';
    end if;
    insert into public.worker_photos (worker_id, photo_url, photo_type, status)
    values (v_worker_id, photo_url, 'work_photo', 'pending')
    returning * into created_photo;
    return next created_photo;
  end loop;
end;
$$;

revoke all on function public.add_worker_work_photos(text[]) from public;
grant execute on function public.add_worker_work_photos(text[]) to authenticated;

create or replace function public.remove_worker_work_photo(p_photo_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  removed_path text;
begin
  delete from public.worker_photos wp
  using public.workers w
  where wp.id = p_photo_id
    and wp.worker_id = w.id
    and w.profile_id = auth.uid()
    and wp.photo_type = 'work_photo'
  returning wp.photo_url into removed_path;
  if removed_path is null then raise exception 'Work photo not found.'; end if;
  return removed_path;
end;
$$;

revoke all on function public.remove_worker_work_photo(uuid) from public;
grant execute on function public.remove_worker_work_photo(uuid) to authenticated;

create or replace function public.update_notification_preferences(p_preferences jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  preferences jsonb;
begin
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

revoke all on function public.update_notification_preferences(jsonb) from public;
grant execute on function public.update_notification_preferences(jsonb) to authenticated;

create policy "workers read own commissions" on public.commission_transactions
  for select using (
    exists (
      select 1 from public.workers w
      where w.id = worker_id and w.profile_id = auth.uid()
    )
  );
create policy "workers read own reviews" on public.reviews
  for select using (
    exists (
      select 1 from public.workers w
      where w.id = worker_id and w.profile_id = auth.uid()
    )
  );

drop policy if exists "workers delete public assets" on storage.objects;
create policy "workers delete public assets" on storage.objects
  for delete using (
    bucket_id = 'worker-public'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
drop policy if exists "workers delete private assets" on storage.objects;
create policy "workers delete private assets" on storage.objects
  for delete using (
    bucket_id = 'worker-private'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;
