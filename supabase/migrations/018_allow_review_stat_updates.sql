create or replace function public.protect_worker_managed_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if current_setting('fsd.allow_worker_review_stats', true) = 'on'
      and new.profile_id is not distinct from old.profile_id
      and new.status is not distinct from old.status
      and new.admin_rejection_reason is not distinct from old.admin_rejection_reason
      and new.completed_jobs_count is not distinct from old.completed_jobs_count
      and new.repeat_customers_count is not distinct from old.repeat_customers_count
      and new.reliability_score is not distinct from old.reliability_score
      and new.trust_badges is not distinct from old.trust_badges then
      new.updated_at = now();
      return new;
    end if;

    if new.profile_id is distinct from old.profile_id
      or new.status is distinct from old.status
      or new.admin_rejection_reason is distinct from old.admin_rejection_reason
      or new.rating_avg is distinct from old.rating_avg
      or new.review_count is distinct from old.review_count
      or new.completed_jobs_count is distinct from old.completed_jobs_count
      or new.repeat_customers_count is distinct from old.repeat_customers_count
      or new.reliability_score is distinct from old.reliability_score
      or new.trust_badges is distinct from old.trust_badges then
      raise exception 'Only an admin can update approval and trust fields.';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.submit_worker_review(
  p_token uuid,
  p_rating integer,
  p_review_text text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.review_invitations%rowtype;
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5.';
  end if;
  if char_length(trim(p_review_text)) < 10 or char_length(trim(p_review_text)) > 1000 then
    raise exception 'Review must be between 10 and 1000 characters.';
  end if;

  select *
  into invitation
  from public.review_invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'Invalid review link.';
  end if;
  if invitation.used_at is not null then
    raise exception 'This review link has already been used.';
  end if;
  if invitation.expires_at < now() then
    raise exception 'This review link has expired.';
  end if;

  insert into public.reviews (
    review_invitation_id,
    service_request_id,
    worker_id,
    rating,
    review_text
  )
  values (
    invitation.id,
    invitation.service_request_id,
    invitation.worker_id,
    p_rating,
    trim(p_review_text)
  );

  update public.review_invitations
  set used_at = now()
  where id = invitation.id;

  perform set_config('fsd.allow_worker_review_stats', 'on', true);

  update public.workers w
  set
    rating_avg = stats.rating_avg,
    review_count = stats.review_count
  from (
    select
      worker_id,
      round(avg(rating)::numeric, 2) as rating_avg,
      count(*)::integer as review_count
    from public.reviews
    where worker_id = invitation.worker_id
    group by worker_id
  ) stats
  where w.id = stats.worker_id;

  perform set_config('fsd.allow_worker_review_stats', 'off', true);

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.submit_worker_review(uuid, integer, text) from public;
grant execute on function public.submit_worker_review(uuid, integer, text) to anon, authenticated;
