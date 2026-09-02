-- 037_admin_ai.sql
-- Admin AI assistant (Groq chat Edge Function) backend.
-- Part A: cancellation tracking on service_requests.
-- Part B: admin-guarded, parameterised, read-only RPCs the AI tool-calls to query REAL data.
--
-- Design rules (do not break without updating the chat Edge Function + tests):
--   * Every ai_* RPC is SECURITY DEFINER and first checks public.is_admin().
--   * Every ai_* RPC accepts only fixed typed parameters (dates, enums, ids) --
--     the AI model NEVER supplies SQL. No dynamic SQL / format() with user input.
--   * All date-range filters follow the EXACT convention used by the existing
--     get_analytics_timeseries (migration 030):
--         created_at >= p_start_date AND created_at < (p_end_date + interval '1 day')
--   * Definitions mirror the dashboard:
--       - 'commission_earned_total' = sum(commission_amount)  => matches Analytics "revenue"
--       - 'job_amount_total'        = sum(job_amount)         => matches BI "revenue"
--         (The panel has TWO revenue definitions; we expose both and label clearly.)
--       - completion rate is exact to 2 decimals (Analytics RPC is unrounded;
--         BI rounds to an integer -- documented difference, no dashboard change).

-- ============================================================
-- Part A — cancellation fields on service_requests
-- ============================================================
alter table public.service_requests
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text;

-- ============================================================
-- Part B — admin AI RPCs
-- ============================================================

-- ai_overview: platform totals & KPIs for a date range (mirrors BI summary + Analytics RPC).
create or replace function public.ai_overview(
  p_start_date date,
  p_end_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;

  select jsonb_build_object(
    'range', jsonb_build_object('start', p_start_date, 'end', p_end_date),
    'total_requests', count(*),
    'requests_by_status', (
      select coalesce(jsonb_object_agg(status, total), '{}'::jsonb)
      from (
        select status, count(*) as total
        from public.service_requests
        where created_at >= p_start_date and created_at < (p_end_date + interval '1 day')
        group by status
      ) status_counts
    ),
    'new_requests', count(*) filter (where sr.status = 'new'),
    'reviewing_requests', count(*) filter (where sr.status = 'reviewing'),
    'assigned_requests', count(*) filter (where sr.status = 'assigned'),
    'in_progress_requests', count(*) filter (where sr.status = 'in_progress'),
    'completed_requests', count(*) filter (where sr.status = 'completed'),
    'cancelled_requests', count(*) filter (where sr.status = 'cancelled'),
    'assigned_jobs', count(*) filter (where sr.status in ('assigned', 'in_progress', 'completed')),
    'completion_rate', case
      when count(*) > 0 then round((count(*) filter (where sr.status = 'completed'))::numeric * 100 / count(*), 2)
      else 0
    end,
    'new_customers', (select count(*) from public.customers c where c.created_at >= p_start_date and c.created_at < (p_end_date + interval '1 day')),
    'distinct_customers', (
      select count(distinct customer_phone)
      from public.service_requests
      where created_at >= p_start_date and created_at < (p_end_date + interval '1 day')
    ),
    'new_workers', (select count(*) from public.workers w where w.created_at >= p_start_date and w.created_at < (p_end_date + interval '1 day')),
    'total_workers', (select count(*) from public.workers),
    'approved_workers', (select count(*) from public.workers where status = 'approved'),
    'pending_workers', (select count(*) from public.workers where status = 'pending'),
    'average_worker_rating', (select coalesce(round(avg(rating_avg), 2), 0) from public.workers where rating_avg > 0),
    'job_amount_total', (select coalesce(sum(ct.job_amount), 0) from public.commission_transactions ct where ct.created_at >= p_start_date and ct.created_at < (p_end_date + interval '1 day')),
    'commission_earned_total', (select coalesce(sum(ct.commission_amount), 0) from public.commission_transactions ct where ct.created_at >= p_start_date and ct.created_at < (p_end_date + interval '1 day')),
    'commission_paid', (select coalesce(sum(ct.commission_amount), 0) from public.commission_transactions ct where ct.payment_status = 'paid' and ct.created_at >= p_start_date and ct.created_at < (p_end_date + interval '1 day')),
    'commission_due', (select coalesce(sum(ct.commission_amount), 0) from public.commission_transactions ct where ct.payment_status = 'due' and ct.created_at >= p_start_date and ct.created_at < (p_end_date + interval '1 day')),
    'open_complaints', (select count(*) from public.complaints x where x.resolution_status in ('open', 'investigating') and x.created_at >= p_start_date and x.created_at < (p_end_date + interval '1 day')),
    'resolved_complaints', (select count(*) from public.complaints x where x.resolution_status in ('resolved', 'dismissed') and x.created_at >= p_start_date and x.created_at < (p_end_date + interval '1 day')),
    'reviews_count', (select count(*) from public.reviews r where r.created_at >= p_start_date and r.created_at < (p_end_date + interval '1 day'))
  )
  into result
  from public.service_requests sr
  where sr.created_at >= p_start_date and sr.created_at < (p_end_date + interval '1 day');

  return result;
end;
$$;

revoke all on function public.ai_overview(date, date) from public;
grant execute on function public.ai_overview(date, date) to authenticated;
-- ai_requests: filtered service requests with joined context
-- (service/area names, assignments+worker names, admin notes, commission, review link state).
create or replace function public.ai_requests(
  p_start_date date default null,
  p_end_date date default null,
  p_status text default null,
  p_service text default null,
  p_area text default null,
  p_search text default null,
  p_limit integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text := nullif(trim(coalesce(p_status, '')), '');
  v_service text := nullif(trim(coalesce(p_service, '')), '');
  v_area text := nullif(trim(coalesce(p_area, '')), '');
  v_search text := nullif(trim(coalesce(p_search, '')), '');
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if v_status is not null and v_status not in ('new', 'reviewing', 'assigned', 'in_progress', 'completed', 'cancelled') then
    raise exception 'Invalid status filter. Allowed values: new, reviewing, assigned, in_progress, completed, cancelled.';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 50), 1), 200);

  select jsonb_build_object(
    'total_matching', (
      select count(*)
      from public.service_requests sr
      left join public.service_categories sc on sc.id = sr.service_category_id
      left join public.areas a on a.id = sr.area_id
      where (p_start_date is null or sr.created_at >= p_start_date)
        and (p_end_date is null or sr.created_at < (p_end_date + interval '1 day'))
        and (v_status is null or sr.status = v_status)
        and (v_service is null or sc.name = v_service or sc.id = v_service or v_service = any(sr.additional_services))
        and (v_area is null or sr.area_id = v_area or a.name = v_area)
        and (v_search is null or sr.customer_name ilike '%' || v_search || '%' or sr.problem_description ilike '%' || v_search || '%')
    ),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'id', sr.id,
          'customer_name', sr.customer_name,
          'customer_phone', sr.customer_phone,
          'status', sr.status,
          'area_id', sr.area_id,
          'area_name', a.name,
          'service_category_id', sr.service_category_id,
          'service_name', sc.name,
          'additional_services', sr.additional_services,
          'urgency', sr.urgency,
          'preferred_time', sr.preferred_time,
          'problem_description', sr.problem_description,
          'created_at', sr.created_at,
          'updated_at', sr.updated_at,
          'cancelled_at', sr.cancelled_at,
          'cancellation_reason', sr.cancellation_reason,
          'coupon_id', sr.coupon_id,
          'discount_amount', sr.discount_amount,
          'preferred_worker_name', pw.display_name,
          'assignments', (
            select coalesce(jsonb_agg(jsonb_build_object(
              'worker_id', la.worker_id,
              'worker_name', w2.display_name,
              'assigned_service', la.assigned_service,
              'assignment_status', la.status,
              'assigned_at', la.assigned_at
            )), '[]'::jsonb)
            from public.lead_assignments la
            left join public.workers w2 on w2.id = la.worker_id
            where la.service_request_id = sr.id
          ),
          'admin_notes', (
            select coalesce(jsonb_agg(an.note order by an.created_at asc), '[]'::jsonb)
            from public.admin_notes an
            where an.entity_type = 'request' and an.entity_id = sr.id
          ),
          'commission', (
            select case when count(*) = 0 then null else jsonb_build_object(
              'job_amount', max(ct.job_amount),
              'commission_amount', max(ct.commission_amount),
              'payment_status', max(ct.payment_status),
              'paid_date', max(ct.paid_date)
            ) end
            from public.commission_transactions ct
            where ct.request_id = sr.id
          )
        ) as row
        from public.service_requests sr
        left join public.areas a on a.id = sr.area_id
        left join public.service_categories sc on sc.id = sr.service_category_id
        left join public.workers pw on pw.id = sr.preferred_worker_id
        where (p_start_date is null or sr.created_at >= p_start_date)
          and (p_end_date is null or sr.created_at < (p_end_date + interval '1 day'))
          and (v_status is null or sr.status = v_status)
          and (v_service is null or sc.name = v_service or sc.id = v_service or v_service = any(sr.additional_services))
          and (v_area is null or sr.area_id = v_area or a.name = v_area)
          and (v_search is null or sr.customer_name ilike '%' || v_search || '%' or sr.problem_description ilike '%' || v_search || '%')
        order by sr.created_at desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_requests(date, date, text, text, text, text, integer) from public;
grant execute on function public.ai_requests(date, date, text, text, text, text, integer) to authenticated;
-- ai_workers: filtered worker roster with derived stats (jobs, commission, reviews, identity flag).
create or replace function public.ai_workers(
  p_status text default null,
  p_service text default null,
  p_area text default null,
  p_search text default null,
  p_limit integer default 150
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text := nullif(trim(coalesce(p_status, '')), '');
  v_service text := nullif(trim(coalesce(p_service, '')), '');
  v_area text := nullif(trim(coalesce(p_area, '')), '');
  v_search text := nullif(trim(coalesce(p_search, '')), '');
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if v_status is not null and v_status not in ('pending', 'approved', 'rejected', 'needs_changes', 'suspended') then
    raise exception 'Invalid worker status filter. Allowed values: pending, approved, rejected, needs_changes, suspended.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 150), 1), 500);

  select jsonb_build_object(
    'total_matching', (
      select count(*)
      from public.workers w
      left join public.service_categories sc on sc.id = w.service_category_id
      where (v_status is null or w.status = v_status)
        and (v_service is null or sc.name = v_service or sc.id = v_service or v_service = any(w.additional_services))
        and (v_area is null or v_area = any(w.areas_covered))
        and (v_search is null or w.display_name ilike '%' || v_search || '%' or w.phone ilike '%' || v_search || '%')
    ),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'id', w.id,
          'display_name', w.display_name,
          'phone', w.phone,
          'email', w.email,
          'status', w.status,
          'service_category_id', w.service_category_id,
          'service_name', sc.name,
          'additional_services', w.additional_services,
          'areas_covered', w.areas_covered,
          'experience_years', w.experience_years,
          'expected_visit_charges', w.expected_visit_charges,
          'availability', w.availability,
          'bio', w.bio,
          'admin_rejection_reason', w.admin_rejection_reason,
          'rating_avg', w.rating_avg,
          'review_count', w.review_count,
          'completed_jobs_count', w.completed_jobs_count,
          'repeat_customers_count', w.repeat_customers_count,
          'reliability_score', w.reliability_score,
          'trust_badges', w.trust_badges,
          'identity_verified', public.has_real_worker_cnic(w.phone, w.cnic_number),
          'created_at', w.created_at,
          'updated_at', w.updated_at,
          'jobs_summary', (
            select jsonb_build_object(
              'total_jobs', count(*),
              'completed', count(*) filter (where sr.status = 'completed'),
              'cancelled', count(*) filter (where sr.status = 'cancelled'),
              'in_progress', count(*) filter (where sr.status = 'in_progress')
            )
            from public.lead_assignments la
            join public.service_requests sr on sr.id = la.service_request_id
            where la.worker_id = w.id
          ),
          'commission_summary', (
            select jsonb_build_object(
              'job_amount_total', coalesce(sum(ct.job_amount), 0),
              'commission_earned_total', coalesce(sum(ct.commission_amount), 0),
              'paid', coalesce(sum(ct.commission_amount) filter (where ct.payment_status = 'paid'), 0),
              'due', coalesce(sum(ct.commission_amount) filter (where ct.payment_status = 'due'), 0)
            )
            from public.commission_transactions ct
            where ct.worker_id = w.id
          )
        ) as row
        from public.workers w
        left join public.service_categories sc on sc.id = w.service_category_id
        where (v_status is null or w.status = v_status)
          and (v_service is null or sc.name = v_service or sc.id = v_service or v_service = any(w.additional_services))
          and (v_area is null or v_area = any(w.areas_covered))
          and (v_search is null or w.display_name ilike '%' || v_search || '%' or w.phone ilike '%' || v_search || '%')
        order by w.created_at desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_workers(text, text, text, text, integer) from public;
grant execute on function public.ai_workers(text, text, text, text, integer) to authenticated;
-- ai_commissions: commission transactions + totals (job_amount vs commission_earned, payment buckets).
create or replace function public.ai_commissions(
  p_start_date date default null,
  p_end_date date default null,
  p_worker text default null,
  p_payment_status text default null,
  p_limit integer default 200
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker text := nullif(trim(coalesce(p_worker, '')), '');
  v_payment_status text := nullif(trim(coalesce(p_payment_status, '')), '');
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  if v_payment_status is not null and v_payment_status not in ('due', 'paid', 'waived') then
    raise exception 'Invalid payment status. Allowed values: due, paid, waived.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 200), 1), 500);

  select jsonb_build_object(
    'range', jsonb_build_object('start', p_start_date, 'end', p_end_date),
    'totals', (
      select jsonb_build_object(
        'job_amount_total', coalesce(sum(ct.job_amount), 0),
        'commission_earned_total', coalesce(sum(ct.commission_amount), 0),
        'paid', coalesce(sum(ct.commission_amount) filter (where ct.payment_status = 'paid'), 0),
        'due', coalesce(sum(ct.commission_amount) filter (where ct.payment_status = 'due'), 0),
        'waived', coalesce(sum(ct.commission_amount) filter (where ct.payment_status = 'waived'), 0),
        'transaction_count', count(*)
      )
      from public.commission_transactions ct
      join public.workers w on w.id = ct.worker_id
      left join public.service_requests sr on sr.id = ct.request_id
      where (p_start_date is null or ct.created_at >= p_start_date)
        and (p_end_date is null or ct.created_at < (p_end_date + interval '1 day'))
        and (v_worker is null or w.display_name ilike '%' || v_worker || '%')
        and (v_payment_status is null or ct.payment_status = v_payment_status)
    ),
    'top_workers', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'worker_id', w.id,
          'worker_name', w.display_name,
          'job_amount_total', sum(ct.job_amount),
          'commission_earned_total', sum(ct.commission_amount)
        ) as row
        from public.commission_transactions ct
        join public.workers w on w.id = ct.worker_id
        where (p_start_date is null or ct.created_at >= p_start_date)
          and (p_end_date is null or ct.created_at < (p_end_date + interval '1 day'))
          and (v_payment_status is null or ct.payment_status = v_payment_status)
        group by w.id, w.display_name
        order by sum(ct.commission_amount) desc
        limit 10
      ) t
    ), '[]'::jsonb),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'id', ct.id,
          'worker_id', ct.worker_id,
          'worker_name', w.display_name,
          'request_id', ct.request_id,
          'job_amount', ct.job_amount,
          'commission_percentage', ct.commission_percentage,
          'commission_amount', ct.commission_amount,
          'payment_status', ct.payment_status,
          'paid_date', ct.paid_date,
          'notes', ct.notes,
          'created_at', ct.created_at
        ) as row
        from public.commission_transactions ct
        join public.workers w on w.id = ct.worker_id
        where (p_start_date is null or ct.created_at >= p_start_date)
          and (p_end_date is null or ct.created_at < (p_end_date + interval '1 day'))
          and (v_worker is null or w.display_name ilike '%' || v_worker || '%')
          and (v_payment_status is null or ct.payment_status = v_payment_status)
        order by ct.created_at desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_commissions(date, date, text, text, integer) from public;
grant execute on function public.ai_commissions(date, date, text, text, integer) to authenticated;
-- ai_complaints: filtered complaints with request/worker context.
create or replace function public.ai_complaints(
  p_start_date date default null,
  p_end_date date default null,
  p_status text default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text := nullif(trim(coalesce(p_status, '')), '');
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  if v_status is not null and v_status not in ('open', 'investigating', 'resolved', 'dismissed') then
    raise exception 'Invalid complaint status. Allowed values: open, investigating, resolved, dismissed.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 100), 1), 300);

  select jsonb_build_object(
    'total_matching', (
      select count(*)
      from public.complaints c
      where (p_start_date is null or c.created_at >= p_start_date)
        and (p_end_date is null or c.created_at < (p_end_date + interval '1 day'))
        and (v_status is null or c.resolution_status = v_status)
    ),
    'by_status', (
      select coalesce(jsonb_object_agg(resolution_status, total), '{}'::jsonb)
      from (
        select resolution_status, count(*) as total
        from public.complaints c
        where (p_start_date is null or c.created_at >= p_start_date)
          and (p_end_date is null or c.created_at < (p_end_date + interval '1 day'))
        group by resolution_status
      ) status_counts
    ),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'id', c.id,
          'request_id', c.request_id,
          'worker_id', c.worker_id,
          'worker_name', w.display_name,
          'customer_name', c.customer_name,
          'customer_phone', c.customer_phone,
          'complaint_text', c.complaint_text,
          'resolution_status', c.resolution_status,
          'notes', c.notes,
          'created_at', c.created_at,
          'request_status', (select sr.status from public.service_requests sr where sr.id = c.request_id)
        ) as row
        from public.complaints c
        left join public.workers w on w.id = c.worker_id
        where (p_start_date is null or c.created_at >= p_start_date)
          and (p_end_date is null or c.created_at < (p_end_date + interval '1 day'))
          and (v_status is null or c.resolution_status = v_status)
        order by c.created_at desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_complaints(date, date, text, integer) from public;
grant execute on function public.ai_complaints(date, date, text, integer) to authenticated;
-- ai_customers: distinct-by-phone customer insights from service_requests (matches BI uniqueCount by phone).
create or replace function public.ai_customers(
  p_start_date date default null,
  p_end_date date default null,
  p_search text default null,
  p_limit integer default 200
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_search text := nullif(trim(coalesce(p_search, '')), '');
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 200), 1), 500);

  select jsonb_build_object(
    'distinct_customers', (
      select count(distinct customer_phone)
      from public.service_requests sr
      where (p_start_date is null or sr.created_at >= p_start_date)
        and (p_end_date is null or sr.created_at < (p_end_date + interval '1 day'))
        and (v_search is null or sr.customer_name ilike '%' || v_search || '%' or sr.customer_phone ilike '%' || v_search || '%')
    ),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'customer_name', name_row.customer_name,
          'customer_phone', name_row.customer_phone,
          'first_request_at', min(sr.created_at),
          'last_request_at', max(sr.created_at),
          'total_requests', count(*),
          'completed', count(*) filter (where sr.status = 'completed'),
          'cancelled', count(*) filter (where sr.status = 'cancelled'),
          'job_amount_total', coalesce(sum(ct.job_amount), 0)
        ) as row
        from (
          select sr.customer_phone, max(sr.customer_name) as customer_name
          from public.service_requests sr
          where (p_start_date is null or sr.created_at >= p_start_date)
            and (p_end_date is null or sr.created_at < (p_end_date + interval '1 day'))
            and (v_search is null or sr.customer_name ilike '%' || v_search || '%' or sr.customer_phone ilike '%' || v_search || '%')
          group by sr.customer_phone
        ) name_row
        join public.service_requests sr on sr.customer_phone = name_row.customer_phone
        left join public.commission_transactions ct on ct.request_id = sr.id
        where (p_start_date is null or sr.created_at >= p_start_date)
          and (p_end_date is null or sr.created_at < (p_end_date + interval '1 day'))
        group by name_row.customer_name, name_row.customer_phone
        order by min(sr.created_at) desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_customers(date, date, text, integer) from public;
grant execute on function public.ai_customers(date, date, text, integer) to authenticated;
-- ai_reviews: rating stats + recent review text (optionally per worker).
create or replace function public.ai_reviews(
  p_start_date date default null,
  p_end_date date default null,
  p_worker text default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker text := nullif(trim(coalesce(p_worker, '')), '');
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 100), 1), 300);

  select jsonb_build_object(
    'total_reviews', (
      select count(*)
      from public.reviews r
      where (p_start_date is null or r.created_at >= p_start_date)
        and (p_end_date is null or r.created_at < (p_end_date + interval '1 day'))
        and (v_worker is null or exists (
          select 1 from public.workers w where w.id = r.worker_id and w.display_name ilike '%' || v_worker || '%'
        ))
    ),
    'average_rating', (
      select coalesce(round(avg(r.rating)::numeric, 2), 0)
      from public.reviews r
      where (p_start_date is null or r.created_at >= p_start_date)
        and (p_end_date is null or r.created_at < (p_end_date + interval '1 day'))
        and (v_worker is null or exists (
          select 1 from public.workers w where w.id = r.worker_id and w.display_name ilike '%' || v_worker || '%'
        ))
    ),
    'rating_breakdown', (
      select coalesce(jsonb_object_agg(rating, total), '{}'::jsonb)
      from (
        select rating, count(*) as total
        from public.reviews r
        where (p_start_date is null or r.created_at >= p_start_date)
          and (p_end_date is null or r.created_at < (p_end_date + interval '1 day'))
          and (v_worker is null or exists (
            select 1 from public.workers w where w.id = r.worker_id and w.display_name ilike '%' || v_worker || '%'
          ))
        group by rating
      ) ratings
    ),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'id', r.id,
          'worker_id', r.worker_id,
          'worker_name', w.display_name,
          'rating', r.rating,
          'review_text', r.review_text,
          'created_at', r.created_at
        ) as row
        from public.reviews r
        left join public.workers w on w.id = r.worker_id
        where (p_start_date is null or r.created_at >= p_start_date)
          and (p_end_date is null or r.created_at < (p_end_date + interval '1 day'))
          and (v_worker is null or w.display_name ilike '%' || v_worker || '%')
        order by r.created_at desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_reviews(date, date, text, integer) from public;
grant execute on function public.ai_reviews(date, date, text, integer) to authenticated;

-- ai_cancellations: cancelled requests + cancellation_reason + linked admin notes (fallback).
create or replace function public.ai_cancellations(
  p_start_date date default null,
  p_end_date date default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 100), 1), 300);

  select jsonb_build_object(
    'total_cancelled', (
      select count(*)
      from public.service_requests sr
      where sr.status = 'cancelled'
        and (p_start_date is null or coalesce(sr.cancelled_at, sr.created_at) >= p_start_date)
        and (p_end_date is null or coalesce(sr.cancelled_at, sr.created_at) < (p_end_date + interval '1 day'))
    ),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'id', sr.id,
          'customer_name', sr.customer_name,
          'customer_phone', sr.customer_phone,
          'service_category_id', sr.service_category_id,
          'service_name', sc.name,
          'area_id', sr.area_id,
          'area_name', a.name,
          'cancelled_at', sr.cancelled_at,
          'cancellation_reason', sr.cancellation_reason,
          'created_at', sr.created_at,
          'admin_notes', (
            select coalesce(jsonb_agg(an.note order by an.created_at asc), '[]'::jsonb)
            from public.admin_notes an
            where an.entity_type = 'request' and an.entity_id = sr.id
          )
        ) as row
        from public.service_requests sr
        left join public.service_categories sc on sc.id = sr.service_category_id
        left join public.areas a on a.id = sr.area_id
        where sr.status = 'cancelled'
          and (p_start_date is null or coalesce(sr.cancelled_at, sr.created_at) >= p_start_date)
          and (p_end_date is null or coalesce(sr.cancelled_at, sr.created_at) < (p_end_date + interval '1 day'))
        order by coalesce(sr.cancelled_at, sr.created_at) desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_cancellations(date, date, integer) from public;
grant execute on function public.ai_cancellations(date, date, integer) to authenticated;

-- ai_coupons_referrals: coupon usage & referral status for a range.
create or replace function public.ai_coupons_referrals(
  p_start_date date default null,
  p_end_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;

  select jsonb_build_object(
    'coupons', (
      select coalesce(jsonb_agg(t.row), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'code', c.code,
          'discount_type', c.discount_type,
          'discount_value', c.discount_value,
          'used_count', c.used_count,
          'usage_limit', c.usage_limit,
          'is_active', c.is_active,
          'created_at', c.created_at,
          'recent_usage_count', (
            select count(*)
            from public.coupon_usage cu
            where cu.coupon_id = c.id
              and (p_start_date is null or cu.used_at >= p_start_date)
              and (p_end_date is null or cu.used_at < (p_end_date + interval '1 day'))
          )
        ) as row
        from public.coupons c
        order by c.created_at desc
      ) t
    ),
    'referrals', (
      select coalesce(jsonb_agg(t.row), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'referrer_phone', r.referrer_phone,
          'referred_customer_phone', r.referred_customer_phone,
          'status', r.status,
          'reward_amount', r.reward_amount,
          'created_at', r.created_at
        ) as row
        from public.referrals r
        where (p_start_date is null or r.created_at >= p_start_date)
          and (p_end_date is null or r.created_at < (p_end_date + interval '1 day'))
        order by r.created_at desc
      ) t
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_coupons_referrals(date, date) from public;
grant execute on function public.ai_coupons_referrals(date, date) to authenticated;

-- ai_notes: admin notes ledger (optional filter by entity).
create or replace function public.ai_notes(
  p_start_date date default null,
  p_end_date date default null,
  p_entity_type text default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_type text := nullif(trim(coalesce(p_entity_type, '')), '');
  v_limit integer;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date is not null and p_end_date is not null and p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  if v_entity_type is not null and v_entity_type not in ('worker', 'request', 'lead') then
    raise exception 'Invalid entity type. Allowed values: worker, request, lead.';
  end if;
  v_limit := least(greatest(coalesce(p_limit, 100), 1), 300);

  select jsonb_build_object(
    'total_notes', (
      select count(*)
      from public.admin_notes an
      where (p_start_date is null or an.created_at >= p_start_date)
        and (p_end_date is null or an.created_at < (p_end_date + interval '1 day'))
        and (v_entity_type is null or an.entity_type = v_entity_type)
    ),
    'rows', coalesce((
      select jsonb_agg(t.row)
      from (
        select jsonb_build_object(
          'id', an.id,
          'entity_type', an.entity_type,
          'entity_id', an.entity_id,
          'note', an.note,
          'created_at', an.created_at
        ) as row
        from public.admin_notes an
        where (p_start_date is null or an.created_at >= p_start_date)
          and (p_end_date is null or an.created_at < (p_end_date + interval '1 day'))
          and (v_entity_type is null or an.entity_type = v_entity_type)
        order by an.created_at desc
        limit v_limit
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_notes(date, date, text, integer) from public;
grant execute on function public.ai_notes(date, date, text, integer) to authenticated;-- ai_timeseries: per-period totals for trend/percentage questions.
-- Extends get_analytics_timeseries (030) with cancelled, complaints and commission_earned buckets.
create or replace function public.ai_timeseries(
  p_start_date date,
  p_end_date date,
  p_granularity text -- 'day', 'week', 'month'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_granularity text;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_date > p_end_date then
    raise exception 'Start date must be on or before end date.';
  end if;
  v_granularity := lower(nullif(trim(p_granularity), ''));
  if v_granularity not in ('day', 'week', 'month') then
    raise exception 'Invalid granularity. Allowed values: day, week, month.';
  end if;

  select jsonb_build_object(
    'granularity', v_granularity,
    'rows', coalesce(jsonb_agg(t.row), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'period', p.p_date,
      'total_requests', coalesce(r.total_req, 0),
      'completed_requests', coalesce(r.completed_req, 0),
      'cancelled_requests', coalesce(r.cancelled_req, 0),
      'new_customers', coalesce(c.total_cust, 0),
      'new_workers', coalesce(w.total_workers, 0),
      'revenue', coalesce(rev.commission_earned, 0),
      'job_amount_total', coalesce(rev.job_amount, 0),
      'commission_earned_total', coalesce(rev.commission_earned, 0),
      'open_complaints', coalesce(comp.total_open, 0)
    ) as row
    from (
      select generate_series(
        date_trunc(v_granularity, p_start_date::timestamp),
        date_trunc(v_granularity, p_end_date::timestamp),
        ('1 ' || v_granularity)::interval
      ) as p_date
    ) p
    left join (
      select date_trunc(v_granularity, sr.created_at) as p_date,
             count(*) as total_req,
             count(*) filter (where sr.status = 'completed') as completed_req,
             count(*) filter (where sr.status = 'cancelled') as cancelled_req
      from public.service_requests sr
      where sr.created_at >= p_start_date and sr.created_at < (p_end_date + interval '1 day')
      group by 1
    ) r on p.p_date = r.p_date
    left join (
      select date_trunc(v_granularity, c.created_at) as p_date, count(*) as total_cust
      from public.customers c
      where c.created_at >= p_start_date and c.created_at < (p_end_date + interval '1 day')
      group by 1
    ) c on p.p_date = c.p_date
    left join (
      select date_trunc(v_granularity, w.created_at) as p_date, count(*) as total_workers
      from public.workers w
      where w.created_at >= p_start_date and w.created_at < (p_end_date + interval '1 day')
      group by 1
    ) w on p.p_date = w.p_date
    left join (
      select date_trunc(v_granularity, ct.created_at) as p_date,
             coalesce(sum(ct.job_amount), 0) as job_amount,
             coalesce(sum(ct.commission_amount), 0) as commission_earned
      from public.commission_transactions ct
      where ct.created_at >= p_start_date and ct.created_at < (p_end_date + interval '1 day')
      group by 1
    ) rev on p.p_date = rev.p_date
    left join (
      select date_trunc(v_granularity, comp.created_at) as p_date,
             count(*) filter (where comp.resolution_status in ('open', 'investigating')) as total_open
      from public.complaints comp
      where comp.created_at >= p_start_date and comp.created_at < (p_end_date + interval '1 day')
      group by 1
    ) comp on p.p_date = comp.p_date
    order by p.p_date asc
  ) t;

  return result;
end;
$$;

revoke all on function public.ai_timeseries(date, date, text) from public;
grant execute on function public.ai_timeseries(date, date, text) to authenticated;
-- ai_compare: run ai_overview semantics for two ranges side-by-side (for "this vs last period", "March vs April").
create or replace function public.ai_compare(
  p_start_1 date,
  p_end_1 date,
  p_start_2 date,
  p_end_2 date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Access denied';
  end if;
  if p_start_1 > p_end_1 or p_start_2 > p_end_2 then
    raise exception 'Start date must be on or before end date for each range.';
  end if;

  select jsonb_build_object(
    'period_1', jsonb_build_object('start', p_start_1, 'end', p_end_1, 'data', public.ai_overview(p_start_1, p_end_1)),
    'period_2', jsonb_build_object('start', p_start_2, 'end', p_end_2, 'data', public.ai_overview(p_start_2, p_end_2))
  ) into result;

  return result;
end;
$$;

revoke all on function public.ai_compare(date, date, date, date) from public;
grant execute on function public.ai_compare(date, date, date, date) to authenticated;

-- ============================================================
-- Add indexes that support the AI queries (cheap, useful to dashboard too)
-- ============================================================
create index if not exists service_requests_created_at_idx
  on public.service_requests(created_at);
create index if not exists commission_transactions_created_at_idx
  on public.commission_transactions(created_at);
create index if not exists complaints_created_at_idx
  on public.complaints(created_at);
create index if not exists admin_notes_entity_idx
  on public.admin_notes(entity_type, entity_id, created_at);