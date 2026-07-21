insert into public.areas (id, name, slug)
values ('Samundri Road', 'Samundri Road', 'samundri-road')
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    is_active = true;
