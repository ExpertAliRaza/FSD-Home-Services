-- ============================================================
-- 040_new_service_categories.sql
-- Adds the 7 missing service categories to service_categories
-- and populates their image_url, description, and keywords.
--
-- This is idempotent: ON CONFLICT (id) DO UPDATE prevents
-- duplicates if the migration is rerun.
-- ============================================================

-- Insert missing service categories
insert into public.service_categories (id, name, slug)
values
  ('Contractor / Thekedaar', 'Contractor / Thekedaar', 'contractor-faisalabad'),
  ('Construction & Renovation', 'Construction & Renovation', 'construction-renovation-faisalabad'),
  ('Marble & Tile Fitting', 'Marble & Tile Fitting', 'marble-tile-fitting-faisalabad'),
  ('Welding & Metal Fabrication', 'Welding & Metal Fabrication', 'welding-metal-fabrication-faisalabad'),
  ('Ceiling / False Ceiling', 'Ceiling / False Ceiling', 'ceiling-faisalabad'),
  ('Waterproofing', 'Waterproofing', 'waterproofing-faisalabad'),
  ('Cleaning Services', 'Cleaning Services', 'cleaning-services-faisalabad')
on conflict (id) do update
  set name = excluded.name,
      slug = excluded.slug;

-- Populate metadata for the newly added categories
update public.service_categories set
  image_url = '/images/services/contractor(thekedaar).jfif',
  description = 'Residential and commercial construction, renovation, remodeling, and complete project contracting services in Faisalabad.',
  keywords = 'contractor in Faisalabad, thekedaar Faisalabad, construction contractor, house construction Faisalabad'
where id = 'Contractor / Thekedaar';

update public.service_categories set
  image_url = '/images/services/construction & renovation.jfif',
  description = 'Residential and commercial construction, renovation, remodeling, extensions, and property improvement services in Faisalabad.',
  keywords = 'construction and renovation in Faisalabad, house renovation Faisalabad, construction services Faisalabad, renovation contractor Faisalabad'
where id = 'Construction & Renovation';

update public.service_categories set
  image_url = '/images/services/marble & tiles.jfif',
  description = 'Professional marble and tile fitting, installation, repair, replacement, grouting, and finishing services in Faisalabad.',
  keywords = 'marble and tile fitting in Faisalabad, tile fixing Faisalabad, marble installation Faisalabad, tile fitting services Faisalabad'
where id = 'Marble & Tile Fitting';

update public.service_categories set
  image_url = '/images/services/welding & metal-fabrication.jfif',
  description = 'Professional welding, ironwork, metal fabrication, gates, grills, railings, frames, repairs, and custom metalwork services in Faisalabad.',
  keywords = 'welding services Faisalabad, metal fabrication Faisalabad, welder Faisalabad, iron work Faisalabad'
where id = 'Welding & Metal Fabrication';

update public.service_categories set
  image_url = '/images/services/ceiling-work.jfif',
  description = 'False ceiling installation, ceiling design, repair, replacement, and finishing services for homes, offices, shops, and commercial spaces in Faisalabad.',
  keywords = 'false ceiling Faisalabad, ceiling services Faisalabad, gypsum ceiling Faisalabad, PVC ceiling Faisalabad'
where id = 'Ceiling / False Ceiling';

update public.service_categories set
  image_url = '/images/services/waterproofing.jfif',
  description = 'Roof, terrace, wall, bathroom, basement, water tank, leakage repair, seepage treatment, and related waterproofing services in Faisalabad.',
  keywords = 'waterproofing Faisalabad, roof waterproofing Faisalabad, roof leakage repair Faisalabad, wall seepage treatment Faisalabad, terrace waterproofing Faisalabad, bathroom waterproofing Faisalabad, dampness treatment Faisalabad'
where id = 'Waterproofing';

update public.service_categories set
  image_url = '/images/services/cleaning-services.jfif',
  description = 'Home, deep, bathroom, kitchen, sofa, carpet, office, shop, move-in, move-out, regular, and post-construction cleaning services in Faisalabad.',
  keywords = 'cleaning services Faisalabad, home cleaning Faisalabad, deep cleaning Faisalabad, office cleaning Faisalabad, bathroom cleaning Faisalabad, kitchen cleaning Faisalabad, sofa cleaning Faisalabad, carpet cleaning Faisalabad, post construction cleaning Faisalabad'
where id = 'Cleaning Services';
