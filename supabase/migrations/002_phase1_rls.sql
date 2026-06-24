alter table public.profiles enable row level security;
alter table public.workers enable row level security;
alter table public.customers enable row level security;
alter table public.service_categories enable row level security;
alter table public.areas enable row level security;
alter table public.service_requests enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.worker_photos enable row level security;
alter table public.request_photos enable row level security;
alter table public.admin_notes enable row level security;

create policy "service categories are public" on public.service_categories for select using (true);
create policy "areas are public" on public.areas for select using (true);

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin());
create policy "profiles admin insert" on public.profiles for insert
  with check ((id = auth.uid() and role in ('customer', 'worker')) or public.is_admin());

create policy "workers own or admin read" on public.workers
  for select using (profile_id = auth.uid() or public.is_admin());
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
create policy "admins manage workers" on public.workers for all using (public.is_admin()) with check (public.is_admin());

create policy "customers own read" on public.customers for select using (profile_id = auth.uid() or public.is_admin());
create policy "admins manage customers" on public.customers for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage requests" on public.service_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "workers read assigned requests" on public.service_requests
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.lead_assignments la
      join public.workers w on w.id = la.worker_id
      where la.service_request_id = service_requests.id and w.profile_id = auth.uid()
    )
  );

create policy "admins manage lead assignments" on public.lead_assignments for all using (public.is_admin()) with check (public.is_admin());
create policy "workers read own assignments" on public.lead_assignments
  for select using (exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid()));
create policy "workers manage own photos" on public.worker_photos
  for all using (public.is_admin() or exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid()))
  with check (
    public.is_admin()
    or (
      exists (select 1 from public.workers w where w.id = worker_id and w.profile_id = auth.uid())
      and status = 'pending'
      and photo_type = 'work_photo'
      and photo_url like auth.uid()::text || '/%'
    )
  );

create policy "admins manage request photos" on public.request_photos for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage notes" on public.admin_notes for all using (public.is_admin()) with check (public.is_admin());

grant select on public.public_worker_cards to anon, authenticated;
revoke all on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text) from public;
grant execute on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('worker-public', 'worker-public', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('worker-private', 'worker-private', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('request-photos', 'request-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "approved worker assets are readable" on storage.objects
  for select using (
    bucket_id = 'worker-public'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
      or public.is_approved_worker_asset(name)
    )
  );
create policy "workers upload public assets" on storage.objects
  for insert with check (
    bucket_id = 'worker-public'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "workers upload private verification" on storage.objects
  for insert with check (
    bucket_id = 'worker-private'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "admins read private worker assets" on storage.objects
  for select using (
    bucket_id = 'worker-private'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );
create policy "anonymous upload request photos" on storage.objects
  for insert with check (
    bucket_id = 'request-photos'
    and name like 'public/%'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );
create policy "admins read request photos" on storage.objects
  for select using (bucket_id = 'request-photos' and public.is_admin());
