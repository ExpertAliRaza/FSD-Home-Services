-- Create a new bucket for service images
insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;


-- Policy: Anyone can read from the service-images bucket
create policy "Public can read service images"
  on storage.objects for select
  using ( bucket_id = 'service-images' );

-- Policy: Only admins can upload new images to service-images
create policy "Admins can upload service images"
  on storage.objects for insert
  with check (
    bucket_id = 'service-images'
    and public.is_admin()
  );

-- Policy: Only admins can update images in service-images
create policy "Admins can update service images"
  on storage.objects for update
  using (
    bucket_id = 'service-images'
    and public.is_admin()
  );

-- Policy: Only admins can delete images in service-images
create policy "Admins can delete service images"
  on storage.objects for delete
  using (
    bucket_id = 'service-images'
    and public.is_admin()
  );
