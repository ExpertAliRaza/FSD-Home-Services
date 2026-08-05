alter table public.service_categories 
add column if not exists image_url text,
add column if not exists description text,
add column if not exists keywords text,
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

-- Update existing services with data from catalog.js to prevent breakage
update public.service_categories set 
  image_url = '/images/services/plumber.jpg', 
  description = 'Leak repair, bathroom fittings, water tanks, drainage, and pipe work across Faisalabad.', 
  keywords = 'plumber in Faisalabad, pipe leakage repair, bathroom plumber Faisalabad'
where name = 'Plumber';

update public.service_categories set 
  image_url = '/images/services/electrician.jpg', 
  description = 'Switches, wiring, fans, lights, DB work, and electrical fault repair by verified electricians.', 
  keywords = 'electrician in Faisalabad, wiring repair, fan installation Faisalabad'
where name = 'Electrician';

update public.service_categories set 
  image_url = '/images/services/ac-technician.jpg', 
  description = 'AC service, gas filling, installation, repair, and seasonal maintenance in Faisalabad.', 
  keywords = 'AC repair Faisalabad, AC technician Faisalabad, AC service near me'
where name = 'AC Technician';

update public.service_categories set 
  image_url = '/images/services/carpenter.jpg', 
  description = 'Furniture repair, doors, cabinets, shelves, and custom wood work for homes and shops.', 
  keywords = 'carpenter in Faisalabad, furniture repair, door carpenter Faisalabad'
where name = 'Carpenter';

update public.service_categories set 
  image_url = '/images/services/painter.jpg', 
  description = 'Home painting, wall touchups, polish, texture, and repainting for Faisalabad properties.', 
  keywords = 'painter in Faisalabad, house painting Faisalabad, wall paint service'
where name = 'Painter';

update public.service_categories set 
  image_url = '/images/services/mason.jpg', 
  description = 'Brick work, plaster, tile base, concrete repair, and small construction work.', 
  keywords = 'mason in Faisalabad, construction worker Faisalabad, plaster repair'
where name = 'Mason';

update public.service_categories set 
  image_url = '/images/services/laborer.jpg', 
  description = 'Daily labor, shifting help, loading, cleaning support, and helper work in Faisalabad.', 
  keywords = 'labor in Faisalabad, daily wage worker, helper Faisalabad'
where name = 'Laborer';

update public.service_categories set 
  image_url = '/images/services/cctv-technician.jpg', 
  description = 'CCTV camera installation, repair, maintenance, and security system setup in Faisalabad.', 
  keywords = 'CCTV technician in Faisalabad, camera installation Faisalabad, security system repair'
where name = 'CCTV Technician';

update public.service_categories set 
  image_url = '/images/services/solar-technician.jpg', 
  description = 'Solar panel installation, inverter repair, battery maintenance, and solar system servicing in Faisalabad.', 
  keywords = 'solar technician in Faisalabad, solar panel installation, inverter repair Faisalabad'
where name = 'Solar Technician';

-- Ensure RLS policies allow admins to insert/update/delete service_categories
drop policy if exists "Admins can insert service_categories" on public.service_categories;
create policy "Admins can insert service_categories" on public.service_categories for insert with check (public.is_admin());

drop policy if exists "Admins can update service_categories" on public.service_categories;
create policy "Admins can update service_categories" on public.service_categories for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete service_categories" on public.service_categories;
create policy "Admins can delete service_categories" on public.service_categories for delete using (public.is_admin());
