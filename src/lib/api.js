import { hasSupabaseConfig, supabase } from './supabaseClient';
import { normalizeCnic, normalizePhone, safeFileName, workerAuthEmail } from './validation';

const requestPhotoBucket = 'request-photos';
const workerPrivateBucket = 'worker-private';
const workerPublicBucket = 'worker-public';

function requireSupabaseConfig() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Service configuration is unavailable. Please contact FSD Home Services support.');
  }
}

async function triggerAdminEmail(type, entityId) {
  if (!entityId) return;
  requireSupabaseConfig();
  const { error } = await supabase.functions.invoke('notify-admin', {
    body: { type, entityId }
  });
  if (error) {
    console.warn('Admin email notification could not be sent.', error.message);
  }
}

export async function verifyTurnstileToken(token, purpose) {
  requireSupabaseConfig();
  if (!token) throw new Error('Complete the human verification first.');
  const { data, error } = await supabase.functions.invoke('verify-turnstile', {
    body: { token, purpose }
  });
  if (error) throw new Error(error.message || 'Human verification failed.');
  if (!data?.verificationId) throw new Error(data?.error || 'Human verification failed.');
  return data.verificationId;
}

export async function getPublicWorkers() {
  requireSupabaseConfig();

  const { data, error } = await supabase
    .from('public_worker_cards')
    .select('*')
    .order('display_name');

  if (error) throw error;
  return Promise.all((data || []).map(async (worker) => ({
    ...worker,
    profile_photo_url: worker.profile_photo_url
      ? await signStoragePath(workerPublicBucket, worker.profile_photo_url)
      : ''
  })));
}

export async function getPublicWorkerProfile(workerId) {
  requireSupabaseConfig();

  const { data: worker, error } = await supabase
    .from('public_worker_profiles')
    .select('*')
    .eq('id', workerId)
    .single();

  if (error) throw error;
  if (!worker) throw new Error('Worker profile was not found.');

  const reviewsResult = await supabase
    .from('public_worker_reviews')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });

  if (reviewsResult.error) throw reviewsResult.error;

  return {
    worker: {
      ...worker,
      profile_photo_url: worker.profile_photo_url
        ? await signStoragePath(workerPublicBucket, worker.profile_photo_url)
        : ''
    },
    reviews: reviewsResult.data || []
  };
}

async function signStoragePath(bucket, path, expiresIn = 3600) {
  if (!path || path.startsWith('http') || path.startsWith('/')) return path || '';
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return '';
  return data.signedUrl;
}

function workerSignupError(error) {
  const message = error?.message || '';
  const normalized = message.toLowerCase();

  if (normalized.includes('phone number')) {
    return new Error('An active worker application already exists with this phone number.');
  }
  if (normalized.includes('cnic')) {
    return new Error('An active worker application already exists with this CNIC number.');
  }
  if (normalized.includes('human verification')) {
    return new Error('Human verification expired. Please complete it again.');
  }
  return error instanceof Error ? error : new Error(message || 'Could not submit worker application.');
}

export async function submitServiceRequest(form, turnstileVerificationId) {
  requireSupabaseConfig();

  let photoUrl = null;
  if (form.problem_photo) {
    const path = `public/${crypto.randomUUID()}-${safeFileName(form.problem_photo.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(requestPhotoBucket)
      .upload(path, form.problem_photo);
    if (uploadError) throw uploadError;
    photoUrl = path;
  }

  const { data, error } = await supabase.rpc('submit_service_request', {
    p_customer_name: form.customer_name.trim(),
    p_customer_phone: normalizePhone(form.customer_phone),
    p_area_id: form.area_id,
    p_service_category_id: form.service_category_id,
    p_problem_description: form.problem_description.trim(),
    p_urgency: form.urgency,
    p_preferred_time: form.preferred_time?.trim() || null,
    p_preferred_worker_id: form.preferred_worker_id || null,
    p_photo_path: photoUrl,
    p_turnstile_verification_id: turnstileVerificationId
  });

  if (error) throw error;
  await triggerAdminEmail('new_customer_request', data);
  return { id: data };
}

export async function signUpWorker(payload, turnstileVerificationId) {
  requireSupabaseConfig();

  const phone = normalizePhone(payload.phone);
  const authEmail = workerAuthEmail(phone);
  const { error: accountError } = await supabase.functions.invoke('create-worker-account', {
    body: {
      phone,
      password: payload.password,
      fullName: payload.full_name.trim(),
      cnicNumber: normalizeCnic(payload.cnic_number),
      verificationId: turnstileVerificationId
    }
  });

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: payload.password
  });
  if (signInError || !signInData.user) {
    if (accountError) {
      let accountMessage = accountError.message;
      try {
        const body = await accountError.context?.json();
        accountMessage = body?.error || accountMessage;
      } catch {
        // The function client may already have consumed the error response.
      }
      throw new Error(accountMessage || 'Could not create worker account.');
    }
    throw new Error('Worker account was created but login failed. Check your phone number and password.');
  }

  const profileId = signInData.user.id;
  const uploads = {};
  const uploadedObjects = [];
  const uploadPrivate = async (file, prefix) => {
    if (!file) return null;
    const path = `${profileId}/${prefix}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(workerPrivateBucket).upload(path, file);
    if (error) throw new Error(`Upload failed for ${prefix.replace('-', ' ')}: ${error.message}`);
    uploadedObjects.push({ bucket: workerPrivateBucket, path });
    return path;
  };
  const uploadPublic = async (file, prefix) => {
    if (!file) return null;
    const path = `${profileId}/${prefix}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(workerPublicBucket).upload(path, file);
    if (error) throw new Error(`Upload failed for ${prefix.replace('-', ' ')}: ${error.message}`);
    uploadedObjects.push({ bucket: workerPublicBucket, path });
    return path;
  };

  try {
    uploads.cnic_front_url = await uploadPrivate(payload.cnic_front, 'cnic-front');
    uploads.cnic_back_url = await uploadPrivate(payload.cnic_back, 'cnic-back');
    uploads.profile_photo_url = await uploadPublic(payload.profile_photo, 'profile');

    const { data: worker, error } = await supabase.rpc('submit_worker_application', {
      p_display_name: payload.full_name.trim(),
      p_phone: phone,
      p_email: payload.email?.trim().toLowerCase() || null,
      p_cnic_number: normalizeCnic(payload.cnic_number),
      p_cnic_front_url: uploads.cnic_front_url,
      p_cnic_back_url: uploads.cnic_back_url,
      p_profile_photo_url: uploads.profile_photo_url,
      p_service_category_id: payload.service_category_id,
      p_experience_years: Number(payload.experience_years || 0),
      p_areas_covered: payload.areas_covered,
      p_availability: payload.availability,
      p_expected_visit_charges: Number(payload.expected_visit_charges || 0),
      p_work_photo_urls: []
    });
    if (error) throw workerSignupError(error);

    const workerRecord = Array.isArray(worker) ? worker[0] : worker;
    await triggerAdminEmail('new_worker_signup', workerRecord.id);
    return workerRecord;
  } catch (error) {
    const removals = uploadedObjects.reduce((groups, object) => {
      groups[object.bucket] ||= [];
      groups[object.bucket].push(object.path);
      return groups;
    }, {});
    await Promise.all(Object.entries(removals).map(([bucket, paths]) => (
      supabase.storage.from(bucket).remove(paths)
    )));
    throw workerSignupError(error);
  }
}

export async function getAdminData() {
  requireSupabaseConfig();

  const [workers, requests, assignments, notes, notifications, commissions, complaints] = await Promise.all([
    supabase.from('workers').select('*, service_categories(name), worker_photos(*)').order('created_at', { ascending: false }),
    supabase.from('service_requests').select('*, areas(name), service_categories(name), request_photos(*), review_invitations(token, expires_at, used_at), lead_assignments(*, workers(display_name))').order('created_at', { ascending: false }),
    supabase.from('lead_assignments').select('*'),
    supabase.from('admin_notes').select('*').order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('commission_transactions').select('*, workers(display_name), service_requests(service_category_id, area_id)').order('created_at', { ascending: false }),
    supabase.from('complaints').select('*, workers(display_name)').order('created_at', { ascending: false })
  ]);

  if (workers.error) throw workers.error;
  if (requests.error) throw requests.error;
  if (assignments.error) throw assignments.error;
  if (notes.error) throw notes.error;
  if (notifications.error) throw notifications.error;
  if (commissions.error) throw commissions.error;
  if (complaints.error) throw complaints.error;

  const workersWithAssets = await Promise.all((workers.data || []).map(async (worker) => ({
    ...worker,
    profile_photo_signed_url: await signStoragePath(workerPublicBucket, worker.profile_photo_url),
    cnic_front_signed_url: await signStoragePath(workerPrivateBucket, worker.cnic_front_url, 900),
    cnic_back_signed_url: await signStoragePath(workerPrivateBucket, worker.cnic_back_url, 900),
    worker_photos: await Promise.all((worker.worker_photos || []).map(async (photo) => ({
      ...photo,
      signed_url: await signStoragePath(workerPublicBucket, photo.photo_url, 900)
    })))
  })));

  const requestsWithAssets = await Promise.all((requests.data || []).map(async (request) => ({
    ...request,
    request_photos: await Promise.all((request.request_photos || []).map(async (photo) => ({
      ...photo,
      signed_url: await signStoragePath(requestPhotoBucket, photo.photo_url, 900)
    })))
  })));

  return {
    workers: workersWithAssets,
    requests: requestsWithAssets,
    assignments: assignments.data || [],
    notes: notes.data || [],
    notifications: notifications.data || [],
    commissions: commissions.data || [],
    complaints: complaints.data || []
  };
}

export async function updateWorkerStatus(workerId, status, adminRejectionReason = null) {
  requireSupabaseConfig();
  const { error } = await supabase
    .from('workers')
    .update({ status, admin_rejection_reason: adminRejectionReason })
    .eq('id', workerId);
  if (error) throw error;
}

async function removeStoragePaths(bucket, paths) {
  const validPaths = (paths || []).filter(Boolean);
  if (!validPaths.length) return;
  const { error } = await supabase.storage.from(bucket).remove(validPaths);
  if (error) {
    console.warn(`Could not remove deleted record assets from ${bucket}.`, error.message);
  }
}

export async function deleteWorker(workerId) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('admin_delete_worker', {
    p_worker_id: workerId
  });
  if (error) throw error;
  await Promise.all([
    removeStoragePaths(workerPublicBucket, data?.worker_public_paths),
    removeStoragePaths(workerPrivateBucket, data?.worker_private_paths)
  ]);
}

export async function deleteServiceRequest(requestId) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('admin_delete_service_request', {
    p_request_id: requestId
  });
  if (error) throw error;
  await removeStoragePaths(requestPhotoBucket, data?.request_photo_paths);
}

export async function updateRequestStatus(requestId, status) {
  if (status === 'completed') {
    throw new Error('Use the completion form to record the actual job value.');
  }
  requireSupabaseConfig();
  const { error } = await supabase.from('service_requests').update({ status }).eq('id', requestId);
  if (error) throw error;
}

export async function assignWorkerToRequest(serviceRequestId, workerId) {
  requireSupabaseConfig();
  const { error } = await supabase.rpc('assign_worker_to_request', {
    p_request_id: serviceRequestId,
    p_worker_id: workerId
  });
  if (error) throw error;
}

export async function completeServiceRequest(requestId, jobAmount, notes = '') {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('complete_service_request', {
    p_request_id: requestId,
    p_job_amount: Number(jobAmount),
    p_notes: notes.trim() || null
  });
  if (error) throw error;
  return data;
}

export async function createReviewInvitationForRequest(requestId) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('create_review_invitation_for_request', {
    p_request_id: requestId
  });
  if (error) throw error;
  return data;
}

export async function updateCommissionPayment(transactionId, paymentStatus) {
  requireSupabaseConfig();
  const { error } = await supabase
    .from('commission_transactions')
    .update({
      payment_status: paymentStatus,
      paid_date: paymentStatus === 'paid' ? new Date().toISOString().slice(0, 10) : null
    })
    .eq('id', transactionId);
  if (error) throw error;
}

export async function createComplaint(payload) {
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('complaints')
    .insert({
      request_id: payload.request_id,
      worker_id: payload.worker_id,
      customer_name: payload.customer_name.trim(),
      customer_phone: normalizePhone(payload.customer_phone),
      complaint_text: payload.complaint_text.trim(),
      resolution_status: 'open',
      notes: payload.notes?.trim() || null
    })
    .select('id')
    .single();
  if (error) throw error;
  await triggerAdminEmail('new_complaint', data.id);
  return data;
}

export async function updateComplaintStatus(complaintId, resolutionStatus) {
  requireSupabaseConfig();
  const { error } = await supabase
    .from('complaints')
    .update({ resolution_status: resolutionStatus })
    .eq('id', complaintId);
  if (error) throw error;
}

export async function addAdminNote(entityType, entityId, note) {
  requireSupabaseConfig();
  const { error } = await supabase.from('admin_notes').insert({
    entity_type: entityType,
    entity_id: entityId,
    note,
    admin_id: (await supabase.auth.getUser()).data.user?.id || null
  });
  if (error) throw error;
}

export async function markNotificationRead(notificationId) {
  requireSupabaseConfig();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  requireSupabaseConfig();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw error;
}

export async function clearMyNotifications() {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('clear_my_notifications');
  if (error) throw error;
  return data;
}

export async function getReviewContext(token) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('get_review_context', { p_token: token });
  if (error) throw error;
  if (!data) throw new Error('This review link is invalid.');
  return data;
}

export async function submitWorkerReview(token, rating, reviewText) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('submit_worker_review', {
    p_token: token,
    p_rating: Number(rating),
    p_review_text: reviewText.trim()
  });
  if (error) throw error;
  return data;
}

export async function getCurrentUserRole() {
  if (!hasSupabaseConfig) return null;
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();
  if (error) throw error;
  return data.role;
}

export async function signOutAdmin() {
  requireSupabaseConfig();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getWorkerDashboardData() {
  requireSupabaseConfig();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Worker authentication is required.');

  const [workerResult, assignments, commissions, reviews, notifications, profile] = await Promise.all([
    supabase
      .from('workers')
      .select('*, service_categories(name), worker_photos(*)')
      .eq('profile_id', userData.user.id)
      .single(),
    supabase
      .from('lead_assignments')
      .select('*, service_requests(*, areas(name), service_categories(name), request_photos(*))')
      .order('assigned_at', { ascending: false }),
    supabase
      .from('commission_transactions')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('full_name, phone, notification_preferences')
      .eq('id', userData.user.id)
      .single()
  ]);

  for (const result of [workerResult, assignments, commissions, reviews, notifications, profile]) {
    if (result.error) throw result.error;
  }

  const worker = {
    ...workerResult.data,
    profile_photo_signed_url: await signStoragePath(workerPublicBucket, workerResult.data.profile_photo_url),
    cnic_front_signed_url: await signStoragePath(workerPrivateBucket, workerResult.data.cnic_front_url, 900),
    cnic_back_signed_url: await signStoragePath(workerPrivateBucket, workerResult.data.cnic_back_url, 900),
    worker_photos: await Promise.all((workerResult.data.worker_photos || []).map(async (photo) => ({
      ...photo,
      signed_url: await signStoragePath(workerPublicBucket, photo.photo_url, 900)
    })))
  };

  const assignmentRows = await Promise.all((assignments.data || []).map(async (assignment) => ({
    ...assignment,
    service_requests: {
      ...assignment.service_requests,
      request_photos: await Promise.all((assignment.service_requests?.request_photos || []).map(async (photo) => ({
        ...photo,
        signed_url: await signStoragePath(requestPhotoBucket, photo.photo_url, 900)
      })))
    }
  })));

  return {
    user: userData.user,
    worker,
    profile: profile.data,
    assignments: assignmentRows,
    commissions: commissions.data || [],
    reviews: reviews.data || [],
    notifications: notifications.data || []
  };
}

export async function respondToLead(assignmentId, response) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('respond_to_lead', {
    p_assignment_id: assignmentId,
    p_response: response
  });
  if (error) throw error;
  return data;
}

export async function updateWorkerProfile(payload) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('update_worker_profile', {
    p_bio: payload.bio,
    p_experience_years: Number(payload.experience_years),
    p_areas_covered: payload.areas_covered,
    p_availability: payload.availability,
    p_expected_visit_charges: Number(payload.expected_visit_charges)
  });
  if (error) throw error;
  return data;
}

export async function replaceWorkerDocuments(files) {
  requireSupabaseConfig();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Worker authentication is required.');
  const profileId = userData.user.id;
  const upload = async (bucket, file, prefix) => {
    if (!file?.name) return null;
    const path = `${profileId}/${prefix}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return path;
  };
  const front = await upload(workerPrivateBucket, files.cnic_front, 'cnic-front');
  const back = await upload(workerPrivateBucket, files.cnic_back, 'cnic-back');
  const profilePhoto = await upload(workerPublicBucket, files.profile_photo, 'profile');
  const { data, error } = await supabase.rpc('replace_worker_documents', {
    p_cnic_front_url: front,
    p_cnic_back_url: back,
    p_profile_photo_url: profilePhoto
  });
  if (error) throw error;
  return data;
}

export async function addWorkerWorkPhotos(files) {
  requireSupabaseConfig();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Worker authentication is required.');
  const paths = [];
  for (const file of files) {
    const path = `${userData.user.id}/work-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(workerPublicBucket).upload(path, file);
    if (error) throw error;
    paths.push(path);
  }
  const { data, error } = await supabase.rpc('add_worker_work_photos', { p_photo_urls: paths });
  if (error) throw error;
  return data;
}

export async function removeWorkerWorkPhoto(photoId, photoPath) {
  requireSupabaseConfig();
  const { error: rowError } = await supabase.rpc('remove_worker_work_photo', { p_photo_id: photoId });
  if (rowError) throw rowError;
  const { error: storageError } = await supabase.storage.from(workerPublicBucket).remove([photoPath]);
  if (storageError) throw storageError;
}

export async function updateWorkerPassword(password) {
  requireSupabaseConfig();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function updateNotificationPreferences(preferences) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc('update_notification_preferences', {
    p_preferences: preferences
  });
  if (error) throw error;
  return data;
}

export function subscribeToNotifications(recipientId, onNotification) {
  requireSupabaseConfig();
  return supabase
    .channel(`notifications:${recipientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${recipientId}`
      },
      (payload) => onNotification(payload.new)
    )
    .subscribe();
}

export async function signOut() {
  return signOutAdmin();
}
