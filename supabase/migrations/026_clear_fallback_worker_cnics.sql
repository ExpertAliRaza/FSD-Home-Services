alter table public.workers
  alter column cnic_number drop not null;

update public.workers
set cnic_number = null,
    updated_at = now()
where regexp_replace(coalesce(cnic_number, ''), '\D', '', 'g') =
      '98' || substring(regexp_replace(coalesce(phone, ''), '\D', '', 'g') from 2) || '1';
