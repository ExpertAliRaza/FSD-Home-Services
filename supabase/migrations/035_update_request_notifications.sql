-- 035_update_request_notifications.sql

create or replace function public.notify_admin_on_new_request()
returns trigger
language plpgsql
security definer
as $$
declare
  services_text text;
begin
  if new.additional_services is not null and array_length(new.additional_services, 1) > 0 then
    services_text := new.service_category_id || ', ' || array_to_string(new.additional_services, ', ');
  else
    services_text := new.service_category_id;
  end if;

  insert into public.notifications (user_id, title, message, type, reference_id)
  values (
    (select id from auth.users where raw_user_meta_data->>'role' = 'admin' limit 1),
    'New Customer Request',
    services_text || ' request from ' || new.customer_name || ' in ' || new.area_id,
    'request_new',
    new.id
  );
  return new;
end;
$$;
