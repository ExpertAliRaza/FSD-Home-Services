import { dummyWorkers } from '../data/catalog';
import { hasSupabaseConfig, supabase } from './supabaseClient';
import { normalizeCnic, normalizePhone, safeFileName } from './validation';

const requestPhotoBucket = 'request-photos';
const workerPrivateBucket = 'worker-private';
const workerPublicBucket = 'worker-public';
const demoWorkerPhotos = {
  'Muhammad Ali': '/images/workers/muhammad-ali.jpg',
  'Ahmed Raza': '/images/workers/ahmed-raza.jpg',
  'Bilal Hussain': '/images/workers/bilal-hussain.jpg',
  'Usman Tariq': '/images/workers/usman-tariq.jpg',
  'Hassan Shah': '/images/workers/hassan-shah.jpg',
  'Imran Akram': '/images/workers/imran-akram.jpg'
};

export async function getPublicWorkers() {
  if (!hasSupabaseConfig) return dummyWorkers;

  const { data, error } = await supabase
    .from('public_worker_cards')
    .select('*')
    .order('display_name');

  if (error) throw error;
  return Promise.all((data || []).map(async (worker) => ({
    ...worker,
    profile_photo_url: worker.profile_photo_url
      ? await signStoragePath(workerPublicBucket, worker.profile_photo_url)
      : demoWorkerPhotos[worker.display_name] || ''
  })));
}

async function signStoragePath(bucket, path, expiresIn = 3600) {
  if (!path || path.startsWith('http') || path.startsWith('/')) return path || '';
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return '';
  return data.signedUrl;
}

export async function submitServiceRequest(form) {
  if (!hasSupabaseConfig) return { id: crypto.randomUUID() };

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
    p_photo_path: photoUrl
  });

  if (error) throw error;
  return { id: data };
}

export async function signUpWorker(payload) {
  if (!hasSupabaseConfig) return { id: crypto.randomUUID(), status: 'pending' };

  const { data: signUpData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: { data: { full_name: payload.full_name, role: 'worker' } }
  });
  if (authError) throw authError;

  let authData = signUpData;
  if (!authData.session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });
    if (signInError) {
      throw new Error('Check your email and confirm the account, then submit this form again with the same email and password.');
    }
    authData = signInData;
  }

  const profileId = authData.user?.id;
  if (!profileId) throw new Error('Worker account was not created.');

  const { data: existingWorker, error: existingWorkerError } = await supabase
    .from('workers')
    .select('id, status')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (existingWorkerError) throw existingWorkerError;
  if (existingWorker) return existingWorker;

  const uploads = {};
  const uploadPrivate = async (file, prefix) => {
    if (!file) return null;
    const path = `${profileId}/${prefix}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(workerPrivateBucket).upload(path, file);
    if (error) throw error;
    return path;
  };
  const uploadPublic = async (file, prefix) => {
    if (!file) return null;
    const path = `${profileId}/${prefix}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(workerPublicBucket).upload(path, file);
    if (error) throw error;
    return path;
  };

  uploads.cnic_front_url = await uploadPrivate(payload.cnic_front, 'cnic-front');
  uploads.cnic_back_url = await uploadPrivate(payload.cnic_back, 'cnic-back');
  uploads.profile_photo_url = await uploadPublic(payload.profile_photo, 'profile');

  const { data: worker, error } = await supabase
    .from('workers')
    .insert({
      profile_id: profileId,
      display_name: payload.full_name,
      phone: normalizePhone(payload.phone),
      cnic_number: normalizeCnic(payload.cnic_number),
      service_category_id: payload.service_category_id,
      experience_years: Number(payload.experience_years || 0),
      areas_covered: payload.areas_covered,
      availability: payload.availability,
      expected_visit_charges: Number(payload.expected_visit_charges || 0),
      status: 'pending',
      ...uploads
    })
    .select()
    .single();

  if (error) throw error;

  const workFiles = Array.from(payload.work_photos || []);
  for (const file of workFiles) {
    const path = await uploadPublic(file, 'work');
    const { error: photoError } = await supabase.from('worker_photos').insert({
      worker_id: worker.id,
      photo_url: path,
      photo_type: 'work_photo',
      status: 'pending'
    });
    if (photoError) throw photoError;
  }

  return worker;
}

export async function getAdminData() {
  if (!hasSupabaseConfig) {
    return { workers: [], requests: [], assignments: [] };
  }

  const [workers, requests, assignments, notes] = await Promise.all([
    supabase.from('workers').select('*, service_categories(name), worker_photos(*)').order('created_at', { ascending: false }),
    supabase.from('service_requests').select('*, areas(name), service_categories(name), request_photos(*), lead_assignments(*, workers(display_name))').order('created_at', { ascending: false }),
    supabase.from('lead_assignments').select('*'),
    supabase.from('admin_notes').select('*').order('created_at', { ascending: false })
  ]);

  if (workers.error) throw workers.error;
  if (requests.error) throw requests.error;
  if (assignments.error) throw assignments.error;
  if (notes.error) throw notes.error;

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
    notes: notes.data || []
  };
}

export async function updateWorkerStatus(workerId, status, adminRejectionReason = null) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase
    .from('workers')
    .update({ status, admin_rejection_reason: adminRejectionReason })
    .eq('id', workerId);
  if (error) throw error;
}

export async function updateRequestStatus(requestId, status) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.from('service_requests').update({ status }).eq('id', requestId);
  if (error) throw error;
}

export async function assignWorkerToRequest(serviceRequestId, workerId) {
  if (!hasSupabaseConfig) return;
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('lead_assignments').upsert({
    service_request_id: serviceRequestId,
    worker_id: workerId,
    assigned_by: userData.user?.id || null,
    status: 'assigned'
  }, { onConflict: 'service_request_id,worker_id' });
  if (error) throw error;
  await updateRequestStatus(serviceRequestId, 'assigned');
}

export async function addAdminNote(entityType, entityId, note) {
  if (!hasSupabaseConfig) return;
  const { error } = await supabase.from('admin_notes').insert({
    entity_type: entityType,
    entity_id: entityId,
    note
  });
  if (error) throw error;
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
