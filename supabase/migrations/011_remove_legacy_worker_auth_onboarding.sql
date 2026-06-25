-- Worker applications are public and phone-first. Login access can be linked
-- later by an admin, so the old self-service auth preparation RPC is removed.

drop function if exists public.prepare_worker_application_account(text, text);
