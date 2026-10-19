-- ============================================================
-- 041_commission_rate_update_and_monthly_fees.sql
-- 1. Makes commission_percentage date-aware (10% before 2026-09-12, 15% from 2026-09-12 onward)
-- 2. Adds monthly_platform_fees table for Rs. 300 per-worker-per-month tracking
-- ============================================================

-- Allow commission_percentage to be 10 or 15 (was locked to 10)
alter table public.commission_transactions drop constraint if exists commission_transactions_commission_percentage_check;
alter table public.commission_transactions add constraint commission_transactions_commission_percentage_check check (commission_percentage in (10, 15));

-- Update complete_service_request to use the correct rate based on request creation date
create or replace function public.complete_service_request(
  p_request_id uuid,
  p_job_amount numeric,
  p_notes text default null
)
returns public.commission_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_worker_id uuid;
  transaction_record public.commission_transactions;
  request_created_at timestamptz;
  commission_rate numeric(5,2);
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;
  if p_job_amount <= 0 then
    raise exception 'Actual job value must be greater than zero.';
  end if;
  if exists (
    select 1 from public.service_requests
    where id = p_request_id and status = 'completed'
  ) then
    raise exception 'This request is already completed.';
  end if;

  select la.worker_id, sr.created_at
  into assigned_worker_id, request_created_at
  from public.lead_assignments la
  join public.service_requests sr on sr.id = la.service_request_id
  where la.service_request_id = p_request_id
    and la.status in ('assigned', 'accepted')
  order by la.assigned_at desc
  limit 1;

  if assigned_worker_id is null then
    raise exception 'Assign an approved matching worker before completion.';
  end if;

  if request_created_at::date < '2026-09-12'::date then
    commission_rate := 10;
  else
    commission_rate := 15;
  end if;

  insert into public.commission_transactions (
    request_id, worker_id, job_amount, commission_percentage, payment_status, notes
  )
  values (
    p_request_id, assigned_worker_id, round(p_job_amount, 2), commission_rate, 'due', nullif(trim(p_notes), '')
  )
  returning * into transaction_record;

  update public.service_requests
  set status = 'completed'
  where id = p_request_id;

  return transaction_record;
end;
$$;

revoke all on function public.complete_service_request(uuid, numeric, text) from public;
grant execute on function public.complete_service_request(uuid, numeric, text) to authenticated;

-- Monthly platform fees table
create table if not exists public.monthly_platform_fees (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.workers(id) on delete restrict,
  month text not null,
  amount numeric(12,2) not null default 300,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  payment_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(worker_id, month)
);

create index if not exists idx_monthly_platform_fees_worker on public.monthly_platform_fees(worker_id);
create index if not exists idx_monthly_platform_fees_month on public.monthly_platform_fees(month);

-- Seed September 2026 monthly fees for Rizwan (Electrician) and Awais (Plumber)
insert into public.monthly_platform_fees (worker_id, month, amount, status)
select id, '2026-09', 300, 'pending'
from public.workers
where display_name in ('Rizwan', 'Awais')
on conflict (worker_id, month) do nothing;
