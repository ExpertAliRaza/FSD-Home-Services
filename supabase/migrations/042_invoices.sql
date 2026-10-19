-- ============================================================
-- 042_invoices.sql
-- Adds invoice table and RPC for generating invoice numbers
-- ============================================================

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete restrict,
  invoice_number text not null unique,
  invoice_date date not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invoices_request_id on public.invoices(request_id);
create index if not exists idx_invoices_invoice_number on public.invoices(invoice_number);

alter table public.invoices enable row level security;

create policy "admins manage invoices" on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.generate_invoice(
  p_request_id uuid
)
returns public.invoices
language plpgsql
security definer
set search_path = public
as $$
declare
  new_invoice public.invoices;
  seq integer;
  year_text text;
  invoice_num text;
begin
  if not public.is_admin() then
    raise exception 'Admin access is required.';
  end if;

  if not exists (
    select 1 from public.service_requests
    where id = p_request_id and status = 'completed'
  ) then
    raise exception 'Only completed requests can have invoices.';
  end if;

  if exists (
    select 1 from public.invoices
    where request_id = p_request_id
  ) then
    raise exception 'An invoice already exists for this request.';
  end if;

  year_text := to_char(now(), 'YYYY');

  select coalesce(max(
    cast(split_part(invoice_number, '-', 4) as integer)
  ), 0) + 1
  into seq
  from public.invoices
  where invoice_number like 'FSD-INV-' || year_text || '-%';

  invoice_num := 'FSD-INV-' || year_text || '-' || lpad(seq::text, 4, '0');

  insert into public.invoices (request_id, invoice_number, invoice_date)
  values (p_request_id, invoice_num, now()::date)
  returning * into new_invoice;

  return new_invoice;
end;
$$;

revoke all on function public.generate_invoice(uuid) from public;
grant execute on function public.generate_invoice(uuid) to authenticated;
