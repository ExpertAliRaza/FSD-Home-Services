create or replace function public.get_analytics_timeseries(
  p_start_date date,
  p_end_date date,
  p_granularity text -- 'day', 'week', 'month'
)
returns table (
  period timestamp,
  total_requests bigint,
  completed_requests bigint,
  new_customers bigint,
  new_workers bigint,
  revenue numeric
) language plpgsql security definer as $$
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;

  return query
  with periods as (
    select generate_series(
      date_trunc(p_granularity, p_start_date::timestamp),
      date_trunc(p_granularity, p_end_date::timestamp),
      ('1 ' || p_granularity)::interval
    ) as p_date
  ),
  reqs as (
    select date_trunc(p_granularity, created_at) as p_date,
           count(*) as total,
           count(*) filter (where status in ('completed', 'assigned', 'in_progress')) as completed
    from public.service_requests
    where created_at >= p_start_date and created_at < (p_end_date + interval '1 day')
    group by 1
  ),
  custs as (
    select date_trunc(p_granularity, created_at) as p_date, count(*) as total
    from public.customers
    where created_at >= p_start_date and created_at < (p_end_date + interval '1 day')
    group by 1
  ),
  wrkrs as (
    select date_trunc(p_granularity, created_at) as p_date, count(*) as total
    from public.workers
    where created_at >= p_start_date and created_at < (p_end_date + interval '1 day')
    group by 1
  ),
  rev as (
    select date_trunc(p_granularity, created_at) as p_date, sum(commission_amount) as total
    from public.commission_transactions
    where created_at >= p_start_date and created_at < (p_end_date + interval '1 day')
    group by 1
  )
  select 
    p.p_date,
    coalesce(r.total, 0) as total_requests,
    coalesce(r.completed, 0) as completed_requests,
    coalesce(c.total, 0) as new_customers,
    coalesce(w.total, 0) as new_workers,
    coalesce(v.total, 0) as revenue
  from periods p
  left join reqs r on p.p_date = r.p_date
  left join custs c on p.p_date = c.p_date
  left join wrkrs w on p.p_date = w.p_date
  left join rev v on p.p_date = v.p_date
  order by p.p_date asc;
end;
$$;

create or replace function public.get_analytics_breakdown(
  p_start_date date,
  p_end_date date
)
returns json language plpgsql security definer as $$
declare
  top_services json;
  top_areas json;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;

  select coalesce(json_agg(row_to_json(t)), '[]'::json) into top_services from (
    select sc.name, count(*) as total
    from public.service_requests sr
    join public.service_categories sc on sc.id = sr.service_category_id
    where sr.created_at >= p_start_date and sr.created_at < (p_end_date + interval '1 day')
    group by sc.name
    order by total desc
    limit 10
  ) t;

  select coalesce(json_agg(row_to_json(t)), '[]'::json) into top_areas from (
    select a.name, count(*) as total
    from public.service_requests sr
    join public.areas a on a.id = sr.area_id
    where sr.created_at >= p_start_date and sr.created_at < (p_end_date + interval '1 day')
    group by a.name
    order by total desc
    limit 10
  ) t;

  return json_build_object(
    'top_services', top_services,
    'top_areas', top_areas
  );
end;
$$;
