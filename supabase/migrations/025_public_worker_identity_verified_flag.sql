create or replace function public.has_real_worker_cnic(p_phone text, p_cnic_number text)
returns boolean
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select
      regexp_replace(coalesce(p_phone, ''), '\D', '', 'g') as phone_digits,
      regexp_replace(coalesce(p_cnic_number, ''), '\D', '', 'g') as cnic_digits
  ),
  fallback as (
    select '98' || substring(phone_digits from 2) || '1' as fallback_digits,
           cnic_digits
    from normalized
  )
  select cnic_digits ~ '^[0-9]{13}$'
    and cnic_digits <> fallback_digits
  from fallback;
$$;

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
  w.trust_badges as badges,
  public.has_real_worker_cnic(w.phone, w.cnic_number) as identity_verified
from public.workers w
left join public.service_categories sc on sc.id = w.service_category_id
where w.status = 'approved';

create or replace view public.public_worker_profiles
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
  w.created_at,
  public.has_real_worker_cnic(w.phone, w.cnic_number) as identity_verified
from public.workers w
left join public.service_categories sc on sc.id = w.service_category_id
where w.status = 'approved';

grant select on public.public_worker_cards to anon, authenticated;
grant select on public.public_worker_profiles to anon, authenticated;
