import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = await readFile(new URL('../supabase/migrations/001_phase1_schema.sql', import.meta.url), 'utf8');
const rls = await readFile(new URL('../supabase/migrations/002_phase1_rls.sql', import.meta.url), 'utf8');
const notificationsReviews = await readFile(new URL('../supabase/migrations/004_notifications_reviews.sql', import.meta.url), 'utf8');
const launchV1 = await readFile(new URL('../supabase/migrations/005_launch_v1.sql', import.meta.url), 'utf8');
const releaseV11 = await readFile(new URL('../supabase/migrations/006_release_v1_1_worker_dashboard.sql', import.meta.url), 'utf8');
const releaseV11Security = await readFile(new URL('../supabase/migrations/007_release_v1_1_worker_security.sql', import.meta.url), 'utf8');
const releaseV11RpcFix = await readFile(new URL('../supabase/migrations/008_release_v1_1_rpc_fix.sql', import.meta.url), 'utf8');
const workerSignupFix = await readFile(new URL('../supabase/migrations/009_fix_worker_signup.sql', import.meta.url), 'utf8');
const publicWorkerApplications = await readFile(new URL('../supabase/migrations/010_public_worker_applications.sql', import.meta.url), 'utf8');
const removeLegacyWorkerAuth = await readFile(new URL('../supabase/migrations/011_remove_legacy_worker_auth_onboarding.sql', import.meta.url), 'utf8');
const workerPhonePassword = await readFile(new URL('../supabase/migrations/012_worker_phone_password_access.sql', import.meta.url), 'utf8');
const workerRpcHardening = await readFile(new URL('../supabase/migrations/013_harden_worker_application_rpc.sql', import.meta.url), 'utf8');
const adminDeleteRecords = await readFile(new URL('../supabase/migrations/014_admin_delete_records.sql', import.meta.url), 'utf8');
const createWorkerAccount = await readFile(new URL('../supabase/functions/create-worker-account/index.ts', import.meta.url), 'utf8');
const seed = await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8');
const router = await readFile(new URL('../src/app/router.jsx', import.meta.url), 'utf8');
const api = await readFile(new URL('../src/lib/api.js', import.meta.url), 'utf8');
const workerSignupForm = await readFile(new URL('../src/components/forms/WorkerSignupForm.jsx', import.meta.url), 'utf8');
const workerDirectory = await readFile(new URL('../src/pages/public/WorkerDirectory.jsx', import.meta.url), 'utf8');
const layout = await readFile(new URL('../src/components/layout/Layout.jsx', import.meta.url), 'utf8');
const routeMeta = await readFile(new URL('../src/components/layout/RouteMeta.jsx', import.meta.url), 'utf8');
const home = await readFile(new URL('../src/pages/public/Home.jsx', import.meta.url), 'utf8');
const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const manifest = await readFile(new URL('../public/manifest.json', import.meta.url), 'utf8');
const pwaInstall = await readFile(new URL('../src/components/pwa/PwaInstall.jsx', import.meta.url), 'utf8');
const workerViews = await readFile(new URL('../src/pages/worker/WorkerViews.jsx', import.meta.url), 'utf8');
const workerCard = await readFile(new URL('../src/components/cards/WorkerCard.jsx', import.meta.url), 'utf8');
const verificationCard = await readFile(new URL('../src/components/worker/VerificationCard.jsx', import.meta.url), 'utf8');
const publicWorkerProfile = await readFile(new URL('../src/pages/public/WorkerProfile.jsx', import.meta.url), 'utf8');
const publicWorkerProfilesMigration = await readFile(new URL('../supabase/migrations/015_public_worker_profiles.sql', import.meta.url), 'utf8');
const clearNotificationsMigration = await readFile(new URL('../supabase/migrations/016_clear_my_notifications.sql', import.meta.url), 'utf8');
const createReviewInvitationMigration = await readFile(new URL('../supabase/migrations/017_create_review_invitation_for_completed_request.sql', import.meta.url), 'utf8');
const allowReviewStatsMigration = await readFile(new URL('../supabase/migrations/018_allow_review_stat_updates.sql', import.meta.url), 'utf8');
const optionalWorkPhotosMigration = await readFile(new URL('../supabase/migrations/019_make_worker_work_photos_optional.sql', import.meta.url), 'utf8');
const optionalWorkerSignupFieldsMigration = await readFile(new URL('../supabase/migrations/020_make_worker_signup_optional_documents_and_pricing.sql', import.meta.url), 'utf8');
const noWorkPhotosHotfixMigration = await readFile(new URL('../supabase/migrations/021_hotfix_worker_signup_no_work_photos.sql', import.meta.url), 'utf8');
const samundriRoadAreaMigration = await readFile(new URL('../supabase/migrations/022_add_samundri_road_area.sql', import.meta.url), 'utf8');
const minimalWorkerSignupMigration = await readFile(new URL('../supabase/migrations/023_make_worker_signup_minimal_required_fields.sql', import.meta.url), 'utf8');
const adminWorkerAssetUploadsMigration = await readFile(new URL('../supabase/migrations/024_allow_admin_worker_asset_uploads.sql', import.meta.url), 'utf8');
const identityVerifiedMigration = await readFile(new URL('../supabase/migrations/025_public_worker_identity_verified_flag.sql', import.meta.url), 'utf8');
const clearFallbackCnicsMigration = await readFile(new URL('../supabase/migrations/026_clear_fallback_worker_cnics.sql', import.meta.url), 'utf8');
const adminPanel = await readFile(new URL('../src/components/dashboard/AdminPanel.jsx', import.meta.url), 'utf8');
const businessIntelligenceCenter = await readFile(new URL('../src/components/dashboard/BusinessIntelligenceCenter.jsx', import.meta.url), 'utf8');
const businessIntelligence = await readFile(new URL('../src/lib/businessIntelligence.js', import.meta.url), 'utf8');
const reportCenter = await readFile(new URL('../src/lib/reportCenter.js', import.meta.url), 'utf8');
const exportCenter = await readFile(new URL('../src/lib/exportCenter.js', import.meta.url), 'utf8');
const catalog = await readFile(new URL('../src/data/catalog.js', import.meta.url), 'utf8');
const vercelConfig = await readFile(new URL('../vercel.json', import.meta.url), 'utf8');
const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');

test('public worker view excludes private columns and filters approval', () => {
  const view = schema.slice(
    schema.indexOf('create or replace view public.public_worker_cards'),
    schema.indexOf('create or replace function public.handle_new_user')
  );
  assert.match(view, /where w\.status = 'approved'/);
  assert.doesNotMatch(view, /\bw\.phone\b|\bw\.cnic_number\b|admin_rejection_reason/);
});

test('Samundri Road is available anywhere service areas are sourced', () => {
  assert.match(catalog, /'Samundri Road'/);
  assert.match(seed, /\('Samundri Road', 'Samundri Road', 'samundri-road'\)/);
  assert.match(samundriRoadAreaMigration, /values \('Samundri Road', 'Samundri Road', 'samundri-road'\)/);
  assert.match(samundriRoadAreaMigration, /is_active = true/);
});

test('homepage hero links to worker signup instead of WhatsApp chat', () => {
  const hero = home.slice(home.indexOf('<section className="bg-white">'), home.indexOf('<Trust icon={<ShieldCheck />}'));
  assert.match(hero, /to="\/request-service"/);
  assert.match(hero, /Request a Worker/);
  assert.match(hero, /to="\/become-a-worker"/);
  assert.match(hero, /Become a Worker/);
  assert.doesNotMatch(hero, /WhatsAppButton|Chat on WhatsApp/);
});

test('raw workers are not publicly readable', () => {
  assert.match(rls, /workers own or admin read/);
  assert.doesNotMatch(rls, /status = 'approved' or profile_id = auth\.uid\(\)/);
});

test('anonymous requests use a constrained RPC instead of table inserts', () => {
  assert.match(schema, /create or replace function public\.submit_service_request/);
  assert.match(schema, /status = 'approved'\s+and service_category_id = p_service_category_id/);
  assert.doesNotMatch(rls, /create policy "anonymous can create requests"/);
});

test('self signup cannot request admin and workers cannot approve themselves', () => {
  assert.match(schema, /when new\.raw_user_meta_data->>'role' = 'worker' then 'worker'/);
  assert.match(schema, /Only an admin can update approval and trust fields/);
  assert.match(schema, /Only an admin can change account roles/);
});

test('each auth account can own only one worker application', () => {
  assert.match(schema, /workers_profile_id_unique_idx/);
});

test('lead assignments reject non-approved workers', () => {
  assert.match(schema, /Only approved workers can be assigned/);
});

test('worker media is private and approval-aware', () => {
  assert.match(rls, /\('worker-public', 'worker-public', false,/);
  assert.match(rls, /public\.is_approved_worker_asset\(name\)/);
  assert.doesNotMatch(rls, /create policy "public read approved worker photos"/);
});

test('notifications are admin-only and created for both submission types', () => {
  assert.match(notificationsReviews, /admins manage notifications/);
  assert.match(notificationsReviews, /new_service_request/);
  assert.match(notificationsReviews, /new_worker_application/);
});

test('review tokens are unique, expiring, and single-use', () => {
  assert.match(notificationsReviews, /token uuid not null unique default gen_random_uuid/);
  assert.match(notificationsReviews, /expires_at timestamptz not null/);
  assert.match(notificationsReviews, /This review link has already been used/);
  assert.match(notificationsReviews, /This review link has expired/);
});

test('review submission validates rating and updates worker aggregates', () => {
  assert.match(notificationsReviews, /rating integer not null check \(rating between 1 and 5\)/);
  assert.match(notificationsReviews, /rating_avg = stats\.rating_avg/);
  assert.match(notificationsReviews, /review_count = stats\.review_count/);
  assert.match(notificationsReviews, /w\.review_count/);
  assert.match(allowReviewStatsMigration, /fsd\.allow_worker_review_stats/);
  assert.match(allowReviewStatsMigration, /set_config\('fsd\.allow_worker_review_stats', 'on', true\)/);
  assert.match(allowReviewStatsMigration, /new\.status is not distinct from old\.status/);
  assert.match(allowReviewStatsMigration, /Only an admin can update approval and trust fields/);
});

test('completion creates one review invitation and requires an assignment', () => {
  assert.match(notificationsReviews, /service_request_id uuid not null unique/);
  assert.match(notificationsReviews, /Assign an approved worker before completing this request/);
  assert.match(notificationsReviews, /old\.status is distinct from 'completed'/);
});

test('launch v1 records a fixed ten percent commission atomically', () => {
  assert.match(launchV1, /create table if not exists public\.commission_transactions/);
  assert.match(launchV1, /commission_percentage numeric\(5,2\) not null default 10/);
  assert.match(launchV1, /commission_amount numeric\(12,2\) generated always/);
  assert.match(launchV1, /create or replace function public\.complete_service_request/);
  assert.match(launchV1, /Record the actual job value before completing this request/);
});

test('launch v1 enforces assignment category and one active worker', () => {
  assert.match(launchV1, /one_active_assignment_per_request_idx/);
  assert.match(launchV1, /matching service category/);
  assert.match(launchV1, /status = 'approved'/);
});

test('launch v1 requires single-use Turnstile proofs for both public submissions', () => {
  assert.match(launchV1, /consume_turnstile_verification/);
  assert.match(launchV1, /'service_request'/);
  assert.match(launchV1, /'worker_signup'/);
  assert.match(launchV1, /drop policy if exists "workers insert own pending"/);
});

test('complaints are admin-only and create notifications', () => {
  assert.match(launchV1, /create table if not exists public\.complaints/);
  assert.match(launchV1, /admins manage complaints/);
  assert.match(launchV1, /complaint_submitted/);
});

test('launch seed contains no fake public workers or trust metrics', () => {
  assert.doesNotMatch(seed, /insert into public\.workers/);
  assert.match(launchV1, /delete from public\.workers\s+where profile_id is null/);
  assert.match(launchV1, /trust_badges = '\{\}'::text\[\]/);
  const launchView = launchV1.slice(launchV1.lastIndexOf('create view public.public_worker_cards'));
  assert.doesNotMatch(launchView, /rating_avg|completed_jobs_count|repeat_customers_count|reliability_score|trust_badges/);
});

test('release v1.1 notifications are recipient-scoped and realtime enabled', () => {
  assert.match(releaseV11, /recipient_id uuid references public\.profiles/);
  assert.match(releaseV11, /recipient_role in \('admin', 'worker'\)/);
  assert.match(releaseV11, /recipients read notifications/);
  assert.match(releaseV11, /recipient_id = auth\.uid\(\)/);
  assert.match(releaseV11, /alter publication supabase_realtime add table public\.notifications/);
  assert.match(releaseV11, /Only the notification read state can be changed/);
});

test('release v1.1 workers can only respond to their own assigned leads', () => {
  const responseFunction = releaseV11.slice(
    releaseV11.indexOf('create or replace function public.respond_to_lead'),
    releaseV11.indexOf('create or replace function public.update_worker_profile')
  );
  assert.match(responseFunction, /w\.profile_id = auth\.uid\(\)/);
  assert.match(responseFunction, /assignment\.status <> 'assigned'/);
  assert.match(responseFunction, /p_response not in \('accepted', 'rejected'\)/);
});

test('release v1.1 creates required admin and worker notification events', () => {
  for (const type of [
    'new_worker_signup', 'new_customer_request', 'worker_accepted_lead',
    'worker_rejected_lead', 'job_completed', 'new_complaint', 'new_review',
    'commission_recorded', 'profile_approved', 'profile_rejected',
    'new_lead_assigned', 'lead_cancelled', 'commission_due'
  ]) {
    assert.match(releaseV11, new RegExp(`'${type}'`));
  }
});

test('release v1.1 includes every protected worker dashboard page', () => {
  for (const path of [
    'leads', 'jobs', 'earnings', 'reviews', 'notifications',
    'profile', 'documents', 'settings'
  ]) {
    assert.match(router, new RegExp(`path: '${path}'`));
  }
  assert.match(router, /path: '\/worker'/);
  assert.match(router, /path: '\/worker\/login'/);
});

test('release v1.1 client subscribes to recipient-filtered realtime notifications', () => {
  assert.match(api, /postgres_changes/);
  assert.match(api, /filter: `recipient_id=eq\.\$\{recipientId\}`/);
  assert.match(api, /respond_to_lead/);
  assert.match(api, /update_worker_profile/);
  assert.match(api, /replace_worker_documents/);
});

test('release v1.1 worker RPCs require an authenticated worker account', () => {
  assert.match(releaseV11Security, /create or replace function public\.require_worker_account/);
  assert.match(releaseV11Security, /Worker authentication is required/);
  for (const routine of [
    'respond_to_lead',
    'update_worker_profile',
    'replace_worker_documents',
    'add_worker_work_photos',
    'remove_worker_work_photo',
    'update_notification_preferences'
  ]) {
    const start = releaseV11Security.indexOf(`create or replace function public.${routine}`);
    assert.notEqual(start, -1);
    assert.match(releaseV11Security.slice(start, start + 1800), /require_worker_account/);
  }
});

test('release v1.1 assigned workers can read request photos', () => {
  assert.match(releaseV11Security, /workers read assigned request photos/);
  assert.match(releaseV11Security, /w\.profile_id = auth\.uid\(\)/);
});

test('release v1.1 worker RPC fix avoids ambiguous worker identifiers', () => {
  assert.match(releaseV11RpcFix, /v_worker_id uuid/);
  assert.match(releaseV11RpcFix, /la\.worker_id = v_worker_id/);
  assert.match(releaseV11RpcFix, /wp\.worker_id = v_worker_id/);
});

test('public workers route keeps the public layout and remains indexable', () => {
  assert.match(layout, /pathname === '\/worker'/);
  assert.match(layout, /pathname\.startsWith\('\/worker\/'\)/);
  assert.doesNotMatch(layout, /pathname\.startsWith\('\/worker'\) &&/);
  assert.match(routeMeta, /pathname === '\/worker'/);
  assert.match(routeMeta, /pathname\.startsWith\('\/worker\/'\)/);
});

test('app has production error handling, hardened exports, headers, and service-worker freshness', () => {
  assert.match(router, /errorElement: <AppError \/>/);
  assert.match(exportCenter, /escapeSpreadsheetFormula/);
  assert.match(exportCenter, /\^\[=\+\\-@\]/);
  assert.match(vercelConfig, /Strict-Transport-Security/);
  assert.match(vercelConfig, /X-Download-Options/);
  assert.match(serviceWorker, /fsd-home-services-v8/);
  assert.match(serviceWorker, /\['style', 'script'\]\.includes/);
});

test('public worker directory ranks verified and complete profiles before name sorting', () => {
  assert.match(api, /function comparePublicWorkers/);
  assert.match(api, /function getPublicWorkerRank/);
  assert.match(api, /worker\.identity_verified \? 10000 : 0/);
  assert.match(api, /worker\.profile_photo_url/);
  assert.match(api, /worker\.service_name/);
  assert.match(api, /worker\.area_name/);
  assert.match(api, /worker\.rating_avg/);
  assert.match(api, /worker\.completed_jobs_count/);
  assert.match(api, /worker\.repeat_customers_count/);
  assert.match(api, /worker\.reliability_score/);
  assert.match(api, /\.sort\(comparePublicWorkers\)/);
  assert.doesNotMatch(api, /public_worker_cards'\)\s*\n\s*\.select\('\*'\)\s*\n\s*\.order\('display_name'\)/);
});

test('site exposes local-business and service structured data for SEO', () => {
  assert.match(indexHtml, /application\/ld\+json/);
  assert.match(indexHtml, /HomeAndConstructionBusiness/);
  assert.match(indexHtml, /https:\/\/share\.google\/hN8X2NRB0svp7ZQdb/);
  assert.match(indexHtml, /hasOfferCatalog/);
  assert.match(indexHtml, /Plumber in Faisalabad/);
  assert.match(indexHtml, /Electrician in Faisalabad/);
  assert.match(indexHtml, /Samundri Road/);
  assert.match(indexHtml, /facebook\.com\/FSD\.Home\.Services/);
  assert.match(indexHtml, /instagram\.com\/fsd_home_services/);
  assert.match(indexHtml, /linkedin\.com\/company\/134874243/);
  assert.match(routeMeta, /setRouteStructuredData/);
  assert.match(routeMeta, /'@type': 'Service'/);
  assert.match(routeMeta, /'@type': 'ItemList'/);
  assert.match(routeMeta, /'@type': 'BreadcrumbList'/);
  assert.match(routeMeta, /areaServedStructuredData/);
  assert.match(routeMeta, /termsOfService: `\$\{siteUrl\}\/terms`/);
  assert.match(routeMeta, /element\?\.remove\(\)/);
});

test('worker login remains in the public layout while dashboard routes use the private shell', () => {
  assert.match(layout, /pathname !== '\/worker\/login'/);
  assert.doesNotMatch(layout, /\['\/worker\/login', 'Worker Login'\]/);
  assert.match(workerDirectory, /to="\/worker\/login"/);
  assert.match(workerDirectory, /Worker Login/);
});

test('public footer is trust-focused, responsive, and contains official social links', () => {
  assert.doesNotMatch(layout, /Workers pay a 10% platform commission/);
  assert.match(layout, /Verified Workers/);
  assert.match(layout, /Manual Approval/);
  assert.match(layout, /Local Support/);
  assert.match(layout, /facebook\.com\/FSD\.Home\.Services/);
  assert.match(layout, /instagram\.com\/fsd_home_services/);
  assert.match(layout, /linkedin\.com\/company\/134874243/);
  assert.match(layout, /xl:grid-cols-\[1\.55fr_repeat\(4,minmax\(0,1fr\)\)\]/);
  assert.match(layout, /Privacy Policy/);
  assert.match(layout, /Terms of Service/);
  assert.match(layout, /Commission Policy/);
  assert.match(layout, /Worker Verification Policy/);
  assert.match(router, /path: '\/commission-policy'/);
  assert.match(router, /path: '\/worker-verification-policy'/);
  assert.match(routeMeta, /'\/commission-policy'/);
  assert.match(routeMeta, /'\/worker-verification-policy'/);
  assert.match(sitemap, /\/commission-policy/);
  assert.match(sitemap, /\/worker-verification-policy/);
});

test('PWA install experience uses the browser prompt and iPhone fallback copy', () => {
  const parsedManifest = JSON.parse(manifest);

  assert.equal(parsedManifest.name, 'FSD Home Services');
  assert.equal(parsedManifest.short_name, 'FSD Services');
  assert.equal(parsedManifest.theme_color, '#0f766e');
  assert.equal(parsedManifest.background_color, '#ffffff');
  assert.equal(parsedManifest.display, 'standalone');
  assert.equal(parsedManifest.start_url, '/');
  assert.equal(parsedManifest.scope, '/');
  assert.match(manifest, /icon-192\.png/);
  assert.match(manifest, /icon-512\.png/);
  assert.match(manifest, /maskable-512\.png/);
  assert.match(pwaInstall, /beforeinstallprompt/);
  assert.match(pwaInstall, /appinstalled/);
  assert.match(pwaInstall, /installPrompt\.prompt\(\)/);
  assert.match(pwaInstall, /Add to Home Screen/);
  assert.match(layout, /<InstallAppButton compact className="min-h-10" \/>/);
  assert.match(layout, /<InstallAppButton className="mt-3 w-full sm:w-auto" showIosNote variant="dark" \/>/);
  assert.doesNotMatch(home, /InstallAppButton/);
});

test('worker verification card can be downloaded and public workers show badge', () => {
  assert.match(workerViews, /<VerificationCardPanel worker=\{data\.worker\} \/>/);
  assert.match(workerCard, /isWorkerIdentityVerified\(worker\)/);
  assert.match(workerCard, /<PublicVerificationBadge worker=\{worker\} \/>/);
  assert.match(workerCard, /id=\{workerAnchorId\}/);
  assert.match(verificationCard, /isWorkerIdentityVerified/);
  assert.match(verificationCard, /hasRealCnic\(worker\.cnic_number, worker\.phone\)/);
  assert.match(verificationCard, /Verified Professional/);
  assert.match(verificationCard, /Download PNG/);
  assert.match(verificationCard, /Download PDF/);
  assert.match(verificationCard, /QRCode\.toDataURL/);
  assert.match(verificationCard, /new jsPDF/);
  assert.match(verificationCard, /profile_photo_signed_url \|\| worker\.profile_photo_url/);
  assert.match(verificationCard, /drawWorkerPhoto/);
  assert.match(verificationCard, /Scan to verify/);
  assert.match(verificationCard, /fsd-home-services\.vercel\.app/);
  assert.match(verificationCard, /03099018308/);
  assert.match(verificationCard, /FSD-0001/);
  assert.match(verificationCard, /worker\.verified_at \|\| worker\.approved_at \|\| worker\.created_at/);
  assert.match(verificationCard, /logoPath/);
});

test('dummy fallback CNIC does not grant public identity verification', () => {
  assert.match(identityVerifiedMigration, /has_real_worker_cnic/);
  assert.match(identityVerifiedMigration, /identity_verified/);
  assert.match(identityVerifiedMigration, /cnic_digits <> fallback_digits/);
  assert.match(clearFallbackCnicsMigration, /set cnic_number = null/);
  assert.match(clearFallbackCnicsMigration, /'98' \|\| substring/);
  assert.match(adminPanel, /hasRealCnic\(worker\.cnic_number, worker\.phone\)/);
  assert.match(adminPanel, /CNIC: \{realCnic \? worker\.cnic_number : 'Not provided'\}/);
  assert.match(publicWorkerProfile, /isWorkerIdentityVerified\(worker\)/);
  assert.match(publicWorkerProfile, /identityVerified && <PublicVerificationBadge worker=\{worker\} \/>/);
});

test('public worker profiles are routable and expose only approved profile data', () => {
  assert.match(router, /path: '\/workers\/:workerId'/);
  assert.match(api, /getPublicWorkerProfile/);
  assert.match(api, /public_worker_profiles/);
  assert.match(api, /public_worker_reviews/);
  assert.match(workerCard, /to=\{`\/workers\/\$\{encodeURIComponent\(worker\.id\)\}`\}/);
  assert.match(verificationCard, /\/workers\/\$\{encodeURIComponent\(worker\.id\)\}/);
  assert.match(publicWorkerProfile, /Customer Reviews/);
  assert.doesNotMatch(publicWorkerProfile, /Work Photos|work photo|public_worker_photos/);
  assert.match(publicWorkerProfile, /Request This Worker/);
  assert.match(publicWorkerProfilesMigration, /where w\.status = 'approved'/);
  assert.match(publicWorkerProfilesMigration, /wp\.status = 'approved'/);
  assert.match(publicWorkerProfilesMigration, /grant select on public\.public_worker_profiles to anon, authenticated/);
  assert.doesNotMatch(publicWorkerProfilesMigration, /phone|cnic_number|admin_rejection_reason/);
});

test('admin can copy review links and clear own notification inbox', () => {
  assert.match(adminPanel, /Copy Review Link/);
  assert.match(adminPanel, /Create Review Link/);
  assert.match(adminPanel, /copiedReviewToken/);
  assert.match(adminPanel, /Clear notifications/);
  assert.match(adminPanel, /clearMyNotifications/);
  assert.match(api, /createReviewInvitationForRequest/);
  assert.match(api, /clear_my_notifications/);
  assert.match(clearNotificationsMigration, /create or replace function public\.clear_my_notifications/);
  assert.match(clearNotificationsMigration, /where recipient_id = auth\.uid\(\)/);
  assert.match(clearNotificationsMigration, /grant execute on function public\.clear_my_notifications\(\) to authenticated/);
  assert.match(createReviewInvitationMigration, /create or replace function public\.create_review_invitation_for_request/);
  assert.match(createReviewInvitationMigration, /sr\.status = 'completed'/);
  assert.match(createReviewInvitationMigration, /insert into public\.review_invitations/);
  assert.match(createReviewInvitationMigration, /return invitation_token/);
});

test('admin can edit worker profile details from the dashboard', () => {
  assert.match(adminPanel, /Edit Profile/);
  assert.match(adminPanel, /saveWorkerEdit/);
  assert.match(adminPanel, /updateAdminWorkerProfile/);
  assert.match(adminPanel, /workerEditForm\.display_name/);
  assert.match(adminPanel, /workerEditForm\.phone/);
  assert.match(adminPanel, /workerEditForm\.service_category_id/);
  assert.match(adminPanel, /workerEditForm\.areas_covered/);
  assert.match(adminPanel, /name="profile_photo"/);
  assert.match(adminPanel, /name="cnic_front"/);
  assert.match(adminPanel, /name="cnic_back"/);
  assert.match(api, /export async function updateAdminWorkerProfile/);
  assert.match(api, /uploadAdminWorkerImage/);
  assert.match(api, /`\$\{userData\.user\.id\}\/admin-\$\{workerId\}\//);
  assert.match(api, /profile_photo_url = profilePhotoUrl/);
  assert.match(api, /cnic_front_url = cnicFrontUrl/);
  assert.match(api, /cnic_back_url = cnicBackUrl/);
  assert.match(api, /from\('workers'\)\s*\n\s*\.update\(updates\)/);
  assert.match(api, /from\('profiles'\)\s*\n\s*\.update/);
  assert.match(adminWorkerAssetUploadsMigration, /admins upload worker assets/);
  assert.match(adminWorkerAssetUploadsMigration, /bucket_id in \('worker-public', 'worker-private'\)/);
  assert.match(rls, /admins manage workers/);
});

test('admin dashboard includes a sanitized business intelligence and backup center', () => {
  assert.match(adminPanel, /<BusinessIntelligenceCenter data=\{data\} loading=\{loading\} \/>/);
  assert.match(businessIntelligenceCenter, /Executive Dashboard/);
  assert.match(businessIntelligenceCenter, /Investor Reports/);
  assert.match(businessIntelligenceCenter, /Business Snapshot/);
  assert.match(businessIntelligenceCenter, /Admin Data Archive/);
  assert.match(businessIntelligenceCenter, /Export Center/);
  assert.match(businessIntelligenceCenter, /Backup Center/);
  assert.match(businessIntelligenceCenter, /Create Full Backup/);
  assert.match(businessIntelligence, /buildBusinessIntelligence/);
  assert.match(businessIntelligence, /buildExportDatasets/);
  assert.match(businessIntelligence, /sanitizeBackupData/);
  assert.match(businessIntelligence, /normalizeAdminData/);
  assert.match(businessIntelligence, /assignments: data\.assignments \|\| \[\]/);
  assert.match(adminPanel, /assignments: \[\]/);
  assert.match(businessIntelligence, /safeWorkerRow/);
  assert.doesNotMatch(businessIntelligence, /cnic_front_signed_url|cnic_back_signed_url|cnic_front_url|cnic_back_url|profile_photo_signed_url/);
  assert.match(reportCenter, /standard-admin-backup/);
  assert.match(reportCenter, /checksum_sha256/);
  assert.match(reportCenter, /CNIC images, signed URLs, passwords, private worker documents/);
  assert.match(reportCenter, /archiveStorageKey/);
  assert.match(reportCenter, /auditStorageKey/);
  assert.match(reportCenter, /exportInvestorReport/);
  assert.match(reportCenter, /exportBusinessSnapshot/);
  assert.match(reportCenter, /createFullBackup/);
  assert.match(exportCenter, /JSZip/);
  assert.match(exportCenter, /downloadXlsx/);
  assert.match(exportCenter, /sha256/);
});

test('worker document replacements can update only the selected file', () => {
  assert.match(workerViews, /Choose at least one replacement file/);
  assert.match(workerViews, /Replacement CNIC front \(optional\)/);
  assert.match(workerViews, /Replacement CNIC back \(optional\)/);
  assert.doesNotMatch(workerViews, /name="cnic_front"[^>]+required/);
  assert.doesNotMatch(workerViews, /name="cnic_back"[^>]+required/);
  assert.match(api, /replaceWorkerDocuments\(files, currentWorker = \{\}\)/);
  assert.match(api, /p_cnic_front_url: front \|\| currentWorker\.cnic_front_url \|\| null/);
  assert.match(api, /p_cnic_back_url: back \|\| currentWorker\.cnic_back_url \|\| null/);
});

test('worker signup prepares the authenticated profile and keeps applications pending', () => {
  assert.match(workerSignupFix, /prepare_worker_application_account/);
  assert.match(workerSignupFix, /values \(auth\.uid\(\), 'worker'/);
  assert.match(workerSignupFix, /profile_id, display_name/);
  assert.match(workerSignupFix, /auth\.uid\(\), trim\(p_display_name\)/);
  assert.match(workerSignupFix, /p_expected_visit_charges, 'pending'/);
  assert.match(workerSignupFix, /A worker application already exists for this account/);
});

test('worker applications use phone and password without email confirmation', () => {
  assert.doesNotMatch(api, /auth\.signUp|getWorkerSignupSession|requiresEmailConfirmation/);
  assert.doesNotMatch(workerSignupForm, /Confirm Your Email/);
  assert.match(workerSignupForm, /name="password"/);
  assert.match(workerSignupForm, /Email \(optional\)/);
  assert.match(workerSignupForm, /navigate\('\/worker', \{ replace: true \}\)/);
  assert.doesNotMatch(workerSignupForm, /Application Submitted|Open Worker Dashboard/);
  assert.doesNotMatch(workerSignupForm, /Work photos|work_photos|Work photo/);
  assert.match(api, /create-worker-account/);
  assert.match(api, /signInWithPassword/);
  assert.match(api, /p_email: payload\.email/);
  assert.match(api, /uploadedObjects/);
  assert.match(api, /storage\.from\(bucket\)\.remove\(paths\)/);
  assert.match(removeLegacyWorkerAuth, /drop function if exists public\.prepare_worker_application_account/);
});

test('phone-password access creates a confirmed worker Auth account', () => {
  assert.match(createWorkerAccount, /consume_turnstile_verification/);
  assert.match(createWorkerAccount, /email_confirm: true/);
  assert.match(createWorkerAccount, /role: 'worker'/);
  assert.match(createWorkerAccount, /auth\.fsdhomeservices\.pk/);
  assert.match(createWorkerAccount, /cnicNumber/);
  assert.match(createWorkerAccount, /active worker application already exists with this phone number/i);
  assert.doesNotMatch(createWorkerAccount, /\.eq\('cnic_number', cnicNumber\)/);
  assert.match(workerPhonePassword, /profile_id, display_name, phone, email/);
  assert.match(workerPhonePassword, /auth\.uid\(\), trim\(p_display_name\)/);
  assert.match(workerPhonePassword, /p_expected_visit_charges, 'pending'/);
  assert.match(workerPhonePassword, /to authenticated/);
  assert.match(workerRpcHardening, /from anon/);
});

test('admin delete RPCs require admin access and clean dependent private records', () => {
  assert.match(adminDeleteRecords, /admin_delete_worker/);
  assert.match(adminDeleteRecords, /admin_delete_service_request/);
  assert.match(adminDeleteRecords, /if not public\.is_admin\(\)/);
  assert.match(adminDeleteRecords, /delete from public\.commission_transactions/);
  assert.match(adminDeleteRecords, /delete from public\.complaints/);
  assert.match(adminDeleteRecords, /delete from auth\.users/);
  assert.match(adminDeleteRecords, /admins delete managed storage objects/);
});

test('public worker application RPC is Turnstile protected and creates pending private workers', () => {
  assert.match(publicWorkerApplications, /profile_id, display_name, phone, email/);
  assert.match(publicWorkerApplications, /null, trim\(p_display_name\)/);
  assert.match(publicWorkerApplications, /p_expected_visit_charges, 'pending'/);
  assert.match(publicWorkerApplications, /consume_turnstile_verification/);
  assert.match(publicWorkerApplications, /to anon, authenticated/);
  assert.match(publicWorkerApplications, /New Worker Application/);
});

test('public worker applications block active duplicate phone and CNIC records', () => {
  assert.match(publicWorkerApplications, /workers_active_phone_unique_idx/);
  assert.match(publicWorkerApplications, /workers_active_cnic_unique_idx/);
  assert.match(publicWorkerApplications, /already exists with this phone number/);
  assert.match(publicWorkerApplications, /already exists with this CNIC/);
});

test('worker-facing profile and signup no longer collect work photos', () => {
  assert.doesNotMatch(workerViews, /Work Photos|addWorkerWorkPhotos|removeWorkerWorkPhoto|Work photo/);
  assert.doesNotMatch(workerViews, /worker\.worker_photos\?\.length/);
  assert.match(optionalWorkPhotosMigration, /coalesce\(p_work_photo_urls, '\{\}'::text\[\]\)/);
  assert.match(optionalWorkerSignupFieldsMigration, /drop function if exists public\.submit_worker_application/);
  assert.match(optionalWorkerSignupFieldsMigration, /coalesce\(p_work_photo_urls, '\{\}'::text\[\]\)/);
  assert.match(noWorkPhotosHotfixMigration, /coalesce\(p_work_photo_urls, '\{\}'::text\[\]\)/);
  assert.doesNotMatch(optionalWorkPhotosMigration, /Upload at least one work photo/);
  assert.doesNotMatch(optionalWorkerSignupFieldsMigration, /At least one work photo is required/);
  assert.doesNotMatch(noWorkPhotosHotfixMigration, /At least one work photo is required/);
});

test('worker signup only requires name, phone, service, and area fields', () => {
  assert.match(workerSignupForm, /name="full_name"[^>]+required/);
  assert.match(workerSignupForm, /name="phone"[^>]+required/);
  assert.match(workerSignupForm, /name="service_category_id"[^>]+required/);
  assert.match(workerSignupForm, /name="area_covered"[^>]+required/);
  assert.match(workerSignupForm, /Password \(optional\)/);
  assert.match(workerSignupForm, /CNIC number \(optional\)/);
  assert.match(workerSignupForm, /CNIC front image \(optional\)/);
  assert.match(workerSignupForm, /CNIC back image \(optional\)/);
  assert.match(workerSignupForm, /Experience years \(optional\)/);
  assert.match(workerSignupForm, /Profile photo \(optional\)/);
  assert.doesNotMatch(workerSignupForm, /Availability \(optional\)|Expected visit charges \(optional\)/);
  assert.doesNotMatch(workerSignupForm, /validateImage\(payload\.cnic_front, 'CNIC front image', true\)/);
  assert.doesNotMatch(workerSignupForm, /validateImage\(payload\.cnic_back, 'CNIC back image', true\)/);
  assert.match(api, /const accountPassword = payload\.password \|\| crypto\.randomUUID\(\)/);
  assert.match(api, /fallbackCnicForPhone/);
  assert.match(api, /const cnicNumber = payload\.cnic_number \? normalizeCnic\(payload\.cnic_number\) : fallbackCnicForPhone\(phone\)/);
  assert.match(api, /p_availability: null/);
  assert.match(api, /p_expected_visit_charges: null/);
  assert.match(api, /normalized\.includes\('already exists'\) && normalized\.includes\('cnic'\)/);
  assert.match(optionalWorkerSignupFieldsMigration, /p_cnic_front_url is not null/);
  assert.match(optionalWorkerSignupFieldsMigration, /p_cnic_back_url is not null/);
  assert.match(optionalWorkerSignupFieldsMigration, /nullif\(trim\(p_availability\), ''\)/);
  assert.match(createWorkerAccount, /cnicNumber && !\/\^\[0-9\]/);
  assert.match(minimalWorkerSignupMigration, /alter column cnic_number drop not null/);
  assert.match(minimalWorkerSignupMigration, /p_cnic_number is not null and exists/);
  assert.match(minimalWorkerSignupMigration, /p_profile_photo_url is not null/);
});
