-- One-time production cleanup for records created during prelaunch testing.
-- IDs were inspected and classified before deletion. Future records are untouched.

begin;

create temporary table cleanup_request_ids (id uuid primary key) on commit drop;
insert into cleanup_request_ids values
  ('04f5242b-2841-4457-a04a-9ed2d5fd99fc'),
  ('f0856eed-4ff0-4989-9dd6-d7b4a9357d7a'),
  ('d6f20116-2392-4f48-92d2-351d217b926d'),
  ('3d7ea06c-a5dc-4630-aee3-2d92eb40dc05'),
  ('22eadb39-467a-4a7f-bb4b-b4f16379955a'),
  ('3a28acd8-ee08-40d9-9739-dc220fa256fd'),
  ('b1b972fc-8ed1-4eec-8ca6-774ddd6396c4'),
  ('260db0b2-a30b-401c-9999-744e8a025ff4');

create temporary table cleanup_worker_ids (id uuid primary key) on commit drop;
insert into cleanup_worker_ids values
  ('cc4a2024-ebf5-48f6-a48d-448b1c7680d4');

delete from public.notifications
where related_id in (
  select id from cleanup_request_ids
  union all
  select id from cleanup_worker_ids
);
delete from public.admin_notes
where entity_id in (
  select id from cleanup_request_ids
  union all
  select id from cleanup_worker_ids
);
delete from public.complaints where request_id in (select id from cleanup_request_ids);
delete from public.commission_transactions where request_id in (select id from cleanup_request_ids);
delete from public.reviews where service_request_id in (select id from cleanup_request_ids);
delete from public.review_invitations where service_request_id in (select id from cleanup_request_ids);
delete from public.lead_assignments where service_request_id in (select id from cleanup_request_ids);
delete from public.service_requests where id in (select id from cleanup_request_ids);
delete from public.workers where id in (select id from cleanup_worker_ids);

commit;
