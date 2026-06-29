create or replace function public.clear_my_notifications()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  delete from public.notifications
  where recipient_id = auth.uid();

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.clear_my_notifications() from public;
grant execute on function public.clear_my_notifications() to authenticated;
