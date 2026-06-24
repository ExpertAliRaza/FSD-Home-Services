insert into public.areas (id, name, slug) values
  ('People Colony', 'People Colony', 'people-colony'),
  ('Madina Town', 'Madina Town', 'madina-town'),
  ('D Ground', 'D Ground', 'd-ground'),
  ('Samanabad', 'Samanabad', 'samanabad'),
  ('Jinnah Colony', 'Jinnah Colony', 'jinnah-colony'),
  ('Gulberg', 'Gulberg', 'gulberg'),
  ('Susan Road', 'Susan Road', 'susan-road'),
  ('Canal Road', 'Canal Road', 'canal-road'),
  ('Satiana Road', 'Satiana Road', 'satiana-road'),
  ('Millat Town', 'Millat Town', 'millat-town'),
  ('Ghulam Muhammad Abad', 'Ghulam Muhammad Abad', 'ghulam-muhammad-abad')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into public.service_categories (id, name, slug, base_lead_fee) values
  ('Plumber', 'Plumber', 'plumber-faisalabad', 100),
  ('Electrician', 'Electrician', 'electrician-faisalabad', 100),
  ('AC Technician', 'AC Technician', 'ac-repair-faisalabad', 150),
  ('Carpenter', 'Carpenter', 'carpenter-faisalabad', 100),
  ('Painter', 'Painter', 'painter-faisalabad', 100),
  ('Mason', 'Mason', 'mason-faisalabad', 150),
  ('Laborer', 'Laborer', 'labor-faisalabad', 100)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, base_lead_fee = excluded.base_lead_fee;

insert into public.workers (
  display_name,
  phone,
  cnic_number,
  service_category_id,
  experience_years,
  areas_covered,
  availability,
  expected_visit_charges,
  status,
  rating_avg,
  completed_jobs_count,
  repeat_customers_count,
  reliability_score,
  trust_badges
) values
  ('Muhammad Ali', '03000000001', '33100-0000000-1', 'Plumber', 7, array['Madina Town'], 'Daily 10am to 8pm', 500, 'approved', 4.8, 126, 31, 92, array['CNIC Verified', 'Trusted Worker']),
  ('Ahmed Raza', '03000000002', '33100-0000000-2', 'Electrician', 6, array['People Colony'], 'Daily 9am to 7pm', 500, 'approved', 4.7, 98, 22, 89, array['CNIC Verified', 'Fast Response']),
  ('Bilal Hussain', '03000000003', '33100-0000000-3', 'AC Technician', 8, array['D Ground'], 'Daily 11am to 9pm', 800, 'approved', 4.9, 143, 38, 95, array['Top Rated', 'CNIC Verified']),
  ('Usman Tariq', '03000000004', '33100-0000000-4', 'Carpenter', 9, array['Samanabad'], 'Daily 10am to 6pm', 700, 'approved', 4.6, 77, 19, 86, array['Active Worker']),
  ('Hassan Shah', '03000000005', '33100-0000000-5', 'Painter', 5, array['Canal Road'], 'Daily 8am to 6pm', 600, 'approved', 4.5, 64, 15, 83, array['CNIC Verified']),
  ('Imran Akram', '03000000006', '33100-0000000-6', 'Mason', 10, array['Ghulam Muhammad Abad'], 'Daily 8am to 5pm', 900, 'approved', 4.7, 112, 26, 90, array['Super Reliable'])
on conflict do nothing;
