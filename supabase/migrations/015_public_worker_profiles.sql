drop view if exists public.public_worker_reviews;
drop view if exists public.public_worker_photos;
drop view if exists public.public_worker_profiles;

create view public.public_worker_profiles
with (security_barrier = true) as
select
  w.id,
  w.display_name,
  w.profile_photo_url,
  w.service_category_id,
  sc.name as service_name,
  w.experience_years,
  w.areas_covered,
  w.areas_covered[1] as area_name,
  w.availability,
  w.expected_visit_charges,
  w.bio,
  w.rating_avg,
  w.review_count,
  w.created_at
from public.workers w
left join public.service_categories sc on sc.id = w.service_category_id
where w.status = 'approved';

create view public.public_worker_photos
with (security_barrier = true) as
select
  wp.id,
  wp.worker_id,
  wp.photo_url,
  wp.created_at
from public.worker_photos wp
join public.workers w on w.id = wp.worker_id
where w.status = 'approved'
  and wp.status = 'approved'
  and wp.photo_type = 'work_photo';

create view public.public_worker_reviews
with (security_barrier = true) as
select
  r.id,
  r.worker_id,
  r.rating,
  r.review_text,
  r.created_at
from public.reviews r
join public.workers w on w.id = r.worker_id
where w.status = 'approved';

grant select on public.public_worker_profiles to anon, authenticated;
grant select on public.public_worker_photos to anon, authenticated;
grant select on public.public_worker_reviews to anon, authenticated;
