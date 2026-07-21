insert into public.areas (id, name, slug) values
  ('People Colony', 'People Colony', 'people-colony'),
  ('Madina Town', 'Madina Town', 'madina-town'),
  ('D Ground', 'D Ground', 'd-ground'),
  ('Samanabad', 'Samanabad', 'samanabad'),
  ('Jinnah Colony', 'Jinnah Colony', 'jinnah-colony'),
  ('Gulberg', 'Gulberg', 'gulberg'),
  ('Susan Road', 'Susan Road', 'susan-road'),
  ('Samundri Road', 'Samundri Road', 'samundri-road'),
  ('Canal Road', 'Canal Road', 'canal-road'),
  ('Satiana Road', 'Satiana Road', 'satiana-road'),
  ('Millat Town', 'Millat Town', 'millat-town'),
  ('Ghulam Muhammad Abad', 'Ghulam Muhammad Abad', 'ghulam-muhammad-abad')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into public.service_categories (id, name, slug) values
  ('Plumber', 'Plumber', 'plumber-faisalabad'),
  ('Electrician', 'Electrician', 'electrician-faisalabad'),
  ('AC Technician', 'AC Technician', 'ac-repair-faisalabad'),
  ('Carpenter', 'Carpenter', 'carpenter-faisalabad'),
  ('Painter', 'Painter', 'painter-faisalabad'),
  ('Mason', 'Mason', 'mason-faisalabad'),
  ('Laborer', 'Laborer', 'labor-faisalabad')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;
