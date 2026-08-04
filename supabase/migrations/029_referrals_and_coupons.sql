-- 029_referrals_and_coupons.sql

-- Create Coupons Table
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null,
  min_order_value numeric default 0,
  usage_limit int default null,
  used_count int default 0,
  per_customer_limit int default 1,
  expiry_date timestamptz default null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Create Coupon Usage Table
create table public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id) on delete cascade,
  request_id uuid, -- will reference service_requests later
  customer_phone text not null,
  used_at timestamptz default now()
);

-- Create Referrals Table
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_phone text not null,
  referred_customer_phone text not null,
  request_id uuid, -- will reference service_requests later
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  reward_amount numeric not null default 200,
  created_at timestamptz default now()
);

-- Modify Service Requests Table
alter table public.service_requests
add column coupon_id uuid references public.coupons(id),
add column discount_amount numeric default 0,
add column referral_id uuid references public.referrals(id);

-- Alter coupon_usage and referrals to reference service_requests
alter table public.coupon_usage
add constraint fk_coupon_usage_request foreign key (request_id) references public.service_requests(id) on delete cascade;

alter table public.referrals
add constraint fk_referrals_request foreign key (request_id) references public.service_requests(id) on delete cascade;

-- RLS for new tables
alter table public.coupons enable row level security;
alter table public.coupon_usage enable row level security;
alter table public.referrals enable row level security;

-- Only authenticated users (admins) can view/manage coupons and referrals
create policy "Admins can manage coupons" on public.coupons for all to authenticated using (true) with check (true);
create policy "Admins can view coupon usage" on public.coupon_usage for all to authenticated using (true);
create policy "Admins can manage referrals" on public.referrals for all to authenticated using (true) with check (true);

-- Drop previous submit_service_request
drop function if exists public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid);

-- Recreate submit_service_request with coupon and referral support
create or replace function public.submit_service_request(
  p_customer_name text,
  p_customer_phone text,
  p_area_id text,
  p_service_category_id text,
  p_problem_description text,
  p_urgency text,
  p_preferred_time text default null,
  p_preferred_worker_id uuid default null,
  p_photo_path text default null,
  p_turnstile_verification_id uuid default null,
  p_coupon_code text default null,
  p_referral_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_request_id uuid;
  v_coupon_record public.coupons;
  v_usage_count int;
  v_referral_id uuid;
begin
  if p_turnstile_verification_id is null
    or not public.consume_turnstile_verification(p_turnstile_verification_id, 'service_request') then
    raise exception 'Human verification is required.';
  end if;
  if char_length(trim(p_customer_name)) < 2 or char_length(trim(p_customer_name)) > 100 then
    raise exception 'Customer name must be between 2 and 100 characters.';
  end if;
  if p_customer_phone !~ '^03[0-9]{9}$' then
    raise exception 'Enter a valid Pakistani mobile number.';
  end if;
  if char_length(trim(p_problem_description)) < 10 or char_length(trim(p_problem_description)) > 2000 then
    raise exception 'Problem description must be between 10 and 2000 characters.';
  end if;
  if p_urgency not in ('Normal', 'Today', 'Emergency') then
    raise exception 'Invalid urgency.';
  end if;
  if not exists (select 1 from public.areas where id = p_area_id and is_active) then
    raise exception 'Invalid service area.';
  end if;
  if not exists (select 1 from public.service_categories where id = p_service_category_id and is_active) then
    raise exception 'Invalid service category.';
  end if;
  if p_preferred_worker_id is not null and not exists (
    select 1
    from public.workers
    where id = p_preferred_worker_id
      and status = 'approved'
      and service_category_id = p_service_category_id
  ) then
    raise exception 'The selected worker is not approved for this service.';
  end if;
  if p_photo_path is not null and p_photo_path not like 'public/%' then
    raise exception 'Invalid request photo path.';
  end if;

  -- Coupon Validation
  if p_coupon_code is not null and trim(p_coupon_code) != '' then
    select * into v_coupon_record from public.coupons where code = upper(trim(p_coupon_code));
    if not found then
      raise exception 'Invalid coupon code.';
    end if;
    if not v_coupon_record.is_active then
      raise exception 'This coupon is no longer active.';
    end if;
    if v_coupon_record.expiry_date is not null and v_coupon_record.expiry_date < now() then
      raise exception 'This coupon has expired.';
    end if;
    if v_coupon_record.usage_limit is not null and v_coupon_record.used_count >= v_coupon_record.usage_limit then
      raise exception 'This coupon has reached its usage limit.';
    end if;
    
    -- Check per customer limit
    select count(*) into v_usage_count from public.coupon_usage where coupon_id = v_coupon_record.id and customer_phone = p_customer_phone;
    if v_usage_count >= v_coupon_record.per_customer_limit then
      raise exception 'You have already used this coupon the maximum allowed times.';
    end if;
  end if;

  -- Referral Validation
  if p_referral_code is not null and trim(p_referral_code) != '' then
    if p_referral_code = p_customer_phone then
      raise exception 'You cannot use your own phone number as a referral code.';
    end if;
    
    -- Optional: Check if referred customer is genuinely new (has no previous requests)
    if exists (select 1 from public.service_requests where customer_phone = p_customer_phone) then
      raise exception 'Referral codes can only be used for your first service request.';
    end if;
  end if;

  -- Insert Service Request
  insert into public.service_requests (
    customer_name, customer_phone, area_id, service_category_id,
    preferred_worker_id, problem_description, urgency, preferred_time, status,
    coupon_id, discount_amount
  )
  values (
    trim(p_customer_name), p_customer_phone, p_area_id, p_service_category_id,
    p_preferred_worker_id, trim(p_problem_description), p_urgency,
    nullif(trim(p_preferred_time), ''), 'new',
    v_coupon_record.id,
    case when v_coupon_record.id is not null then v_coupon_record.discount_value else 0 end -- Simplified discount storage
  )
  returning id into new_request_id;

  -- Handle Photo
  if p_photo_path is not null then
    insert into public.request_photos (service_request_id, photo_url)
    values (new_request_id, p_photo_path);
  end if;

  -- Handle Coupon Usage Record
  if v_coupon_record.id is not null then
    insert into public.coupon_usage (coupon_id, request_id, customer_phone)
    values (v_coupon_record.id, new_request_id, p_customer_phone);
    
    update public.coupons set used_count = used_count + 1 where id = v_coupon_record.id;
  end if;

  -- Handle Referral Record
  if p_referral_code is not null and trim(p_referral_code) != '' then
    insert into public.referrals (referrer_phone, referred_customer_phone, request_id, reward_amount)
    values (trim(p_referral_code), p_customer_phone, new_request_id, 200)
    returning id into v_referral_id;
    
    update public.service_requests set referral_id = v_referral_id where id = new_request_id;
  end if;

  return new_request_id;
end;
$$;

revoke all on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid, text, text) from public;
grant execute on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid, text, text)
  to anon, authenticated;

-- Add a trigger to mark referral as completed when service request is completed
create or replace function public.trg_complete_referral_on_request_completion()
returns trigger
language plpgsql
security definer
as $$
begin
  if NEW.status = 'completed' and OLD.status != 'completed' then
    if NEW.referral_id is not null then
      update public.referrals set status = 'completed' where id = NEW.referral_id and status = 'pending';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_request_completion_update_referral on public.service_requests;
create trigger on_request_completion_update_referral
after update on public.service_requests
for each row
execute function public.trg_complete_referral_on_request_completion();
