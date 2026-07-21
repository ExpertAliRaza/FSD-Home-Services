drop policy if exists "admins upload worker assets" on storage.objects;
create policy "admins upload worker assets" on storage.objects
  for insert
  to authenticated
  with check (
    public.is_admin()
    and bucket_id in ('worker-public', 'worker-private')
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  );
