-- 034_multiple_service_requests.sql

-- Add additional_services column to service_requests
alter table public.service_requests
add column if not exists additional_services text[] not null default '{}';

-- Validate that additional_services does not exceed length 2 (max 3 services total)
alter table public.service_requests
add constraint check_additional_services_length_requests
check (cardinality(additional_services) <= 2);

-- Drop previous submit_service_request
drop function if exists public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid, text, text);
drop function if exists public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid);

-- Recreate submit_service_request with additional_services
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
  p_referral_code text default null,
  p_additional_services text[] default '{}'
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
  
  -- Worker validation now allows matching any requested service
  if p_preferred_worker_id is not null and not exists (
    select 1
    from public.workers
    where id = p_preferred_worker_id
      and status = 'approved'
      and (
        service_category_id = p_service_category_id
        or service_category_id = any(p_additional_services)
        or p_service_category_id = any(additional_services)
        or additional_services && p_additional_services
      )
  ) then
    raise exception 'The selected worker is not approved for any of the requested services.';
  end if;
  
  if p_photo_path is not null and p_photo_path not like 'public/%' then
    raise exception 'Invalid request photo path.';
  end if;
  
  if cardinality(p_additional_services) > 2 then
    raise exception 'You can select a maximum of 3 services in total.';
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
    customer_name, customer_phone, area_id, service_category_id, additional_services,
    preferred_worker_id, problem_description, urgency, preferred_time, status,
    coupon_id, discount_amount
  )
  values (
    trim(p_customer_name), p_customer_phone, p_area_id, p_service_category_id, p_additional_services,
    p_preferred_worker_id, trim(p_problem_description), p_urgency,
    nullif(trim(p_preferred_time), ''), 'new',
    v_coupon_record.id,
    case when v_coupon_record.id is not null then v_coupon_record.discount_value else 0 end
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

revoke all on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid, text, text, text[]) from public;
grant execute on function public.submit_service_request(text, text, text, text, text, text, text, uuid, text, uuid, text, text, text[]) to anon, authenticated;

-- Also update admin_update_service_request if it exists
drop function if exists public.admin_update_service_request(uuid, text, text, text, text, text, text, text, text);

create or replace function public.admin_update_service_request(
  p_request_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_area_id text,
  p_service_category_id text,
  p_problem_description text,
  p_urgency text,
  p_preferred_time text,
  p_status text,
  p_additional_services text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role' = 'admin') then
    raise exception 'Admin privileges required.';
  end if;

  update public.service_requests
  set
    customer_name = trim(p_customer_name),
    customer_phone = p_customer_phone,
    area_id = p_area_id,
    service_category_id = p_service_category_id,
    additional_services = p_additional_services,
    problem_description = trim(p_problem_description),
    urgency = p_urgency,
    preferred_time = nullif(trim(p_preferred_time), ''),
    status = p_status
  where id = p_request_id;
end;
$$;
