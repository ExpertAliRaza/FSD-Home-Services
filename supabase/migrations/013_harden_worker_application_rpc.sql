-- Keep the application insert RPC available only after the worker Auth session
-- has been created by the Turnstile-protected Edge Function.

revoke execute on function public.submit_worker_application(
  text, text, text, text, text, text, text, text, integer,
  text[], text, integer, text[]
) from anon;

grant execute on function public.submit_worker_application(
  text, text, text, text, text, text, text, text, integer,
  text[], text, integer, text[]
) to authenticated;
