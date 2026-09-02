-- ============================================================
-- 039_worker_self_review_tokens.sql
-- Adds worker-self-service review links.
--
-- Workers can generate a shareable /review/<token> URL from
-- their dashboard. Quota is enforced: reviews accepted <=
-- workers.completed_jobs_count.
--
-- The existing admin-triggered review_invitations flow is
-- intentionally untouched.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Allow NULL on reviews columns that worker-token reviews
--    won't have (no specific service request or invitation).
--    Existing rows and existing insert paths are unaffected.
-- ────────────────────────────────────────────────────────────
alter table public.reviews
  alter column review_invitation_id drop not null,
  alter column service_request_id   drop not null;

-- ────────────────────────────────────────────────────────────
-- 2. worker_review_tokens table
-- ────────────────────────────────────────────────────────────
create table if not exists public.worker_review_tokens (
  id          uuid primary key default gen_random_uuid(),
  worker_id   uuid not null references public.workers(id) on delete cascade,
  token       uuid not null unique default gen_random_uuid(),
  expires_at  timestamptz not null default (now() + interval '90 days'),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists worker_review_tokens_worker_idx
  on public.worker_review_tokens(worker_id);

alter table public.worker_review_tokens enable row level security;

-- Workers can view their own tokens (to display status in dashboard).
create policy "workers view own review tokens"
  on public.worker_review_tokens
  for select
  using (
    exists (
      select 1 from public.workers w
      where w.id = worker_review_tokens.worker_id
        and w.profile_id = auth.uid()
    )
  );

-- Admins can manage all tokens.
create policy "admins manage worker review tokens"
  on public.worker_review_tokens
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 3. get_or_create_worker_review_token()
--    Called by the authenticated worker from their dashboard.
--    Returns { token, slots_remaining } where:
--      token           – the UUID to embed in /review/<token>
--      slots_remaining – how many more reviews can be collected
-- ────────────────────────────────────────────────────────────
create or replace function public.get_or_create_worker_review_token()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_worker          public.workers%rowtype;
  v_slots_remaining integer;
  v_token           uuid;
begin
  -- Identify the calling worker
  select w.*
  into   v_worker
  from   public.workers w
  where  w.profile_id = auth.uid();

  if not found then
    raise exception 'Worker profile not found for the current user.';
  end if;

  if v_worker.status <> 'approved' then
    raise exception 'Only approved workers can generate review links.';
  end if;

  -- How many review slots remain?
  v_slots_remaining := v_worker.completed_jobs_count - v_worker.review_count;

  if v_slots_remaining <= 0 then
    raise exception 'You have used all review slots (% review% for % completed job%). Complete more jobs to earn more reviews.',
      v_worker.review_count,
      case when v_worker.review_count = 1 then '' else 's' end,
      v_worker.completed_jobs_count,
      case when v_worker.completed_jobs_count = 1 then '' else 's' end;
  end if;

  -- Prune expired, unused tokens (housekeeping)
  delete from public.worker_review_tokens
  where  worker_id = v_worker.id
    and  used_at is null
    and  expires_at < now();

  -- Reuse an existing live, unused token if one exists
  select token
  into   v_token
  from   public.worker_review_tokens
  where  worker_id = v_worker.id
    and  used_at is null
    and  expires_at >= now()
  order  by created_at desc
  limit  1;

  if not found then
    -- Create a new token
    insert into public.worker_review_tokens (worker_id)
    values (v_worker.id)
    returning token into v_token;
  end if;

  return jsonb_build_object(
    'token',           v_token,
    'slots_remaining', v_slots_remaining
  );
end;
$$;

revoke all on function public.get_or_create_worker_review_token() from public;
grant execute on function public.get_or_create_worker_review_token() to authenticated;

-- ────────────────────────────────────────────────────────────
-- 4. get_review_context_for_worker_token(p_token)
--    Public (anon) — used by Review.jsx to render the form.
--    Returns null if token not found.
-- ────────────────────────────────────────────────────────────
create or replace function public.get_review_context_for_worker_token(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'valid',           true,
    'worker_name',     w.display_name,
    'service_name',    null,
    'area_name',       null,
    'submitted',       wrt.used_at is not null
                         or (w.completed_jobs_count - w.review_count) <= 0,
    'expired',         wrt.expires_at < now(),
    'slots_remaining', greatest(w.completed_jobs_count - w.review_count, 0),
    'is_worker_token', true
  )
  from   public.worker_review_tokens wrt
  join   public.workers w on w.id = wrt.worker_id
  where  wrt.token = p_token
$$;

revoke all on function public.get_review_context_for_worker_token(uuid) from public;
grant execute on function public.get_review_context_for_worker_token(uuid) to anon, authenticated;

-- ────────────────────────────────────────────────────────────
-- 5. submit_worker_review_by_token(p_token, p_rating, p_text)
--    Public (anon) — submits a review via a worker-token link.
-- ────────────────────────────────────────────────────────────
create or replace function public.submit_worker_review_by_token(
  p_token       uuid,
  p_rating      integer,
  p_review_text text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token_row   public.worker_review_tokens%rowtype;
  v_worker      public.workers%rowtype;
  v_slots_left  integer;
begin
  -- Validate inputs
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5.';
  end if;
  if char_length(trim(p_review_text)) < 10
     or char_length(trim(p_review_text)) > 1000 then
    raise exception 'Review must be between 10 and 1000 characters.';
  end if;

  -- Lock the token row
  select * into v_token_row
  from   public.worker_review_tokens
  where  token = p_token
  for update;

  if not found then
    raise exception 'Invalid review link.';
  end if;
  if v_token_row.used_at is not null then
    raise exception 'This review link has already been used.';
  end if;
  if v_token_row.expires_at < now() then
    raise exception 'This review link has expired.';
  end if;

  -- Fetch the worker and check quota
  select * into v_worker
  from   public.workers
  where  id = v_token_row.worker_id;

  v_slots_left := v_worker.completed_jobs_count - v_worker.review_count;

  if v_slots_left <= 0 then
    raise exception 'This worker has received the maximum number of reviews allowed for their completed jobs.';
  end if;

  -- Insert review (no invitation or request ids — worker-token review)
  insert into public.reviews (
    worker_id,
    rating,
    review_text
  )
  values (
    v_token_row.worker_id,
    p_rating,
    trim(p_review_text)
  );

  -- Mark token as used
  update public.worker_review_tokens
  set    used_at = now()
  where  id = v_token_row.id;

  -- Update worker rating stats
  perform set_config('fsd.allow_worker_review_stats', 'on', true);

  update public.workers w
  set
    rating_avg   = stats.rating_avg,
    review_count = stats.review_count
  from (
    select
      worker_id,
      round(avg(rating)::numeric, 2) as rating_avg,
      count(*)::integer               as review_count
    from public.reviews
    where worker_id = v_token_row.worker_id
    group by worker_id
  ) stats
  where w.id = stats.worker_id;

  perform set_config('fsd.allow_worker_review_stats', 'off', true);

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.submit_worker_review_by_token(uuid, integer, text) from public;
grant execute on function public.submit_worker_review_by_token(uuid, integer, text) to anon, authenticated;
