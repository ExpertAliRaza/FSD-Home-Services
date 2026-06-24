import { useEffect, useMemo, useState } from 'react';
import { addAdminNote, assignWorkerToRequest, getAdminData, updateRequestStatus, updateWorkerStatus } from '../../lib/api';

const workerStatuses = ['pending', 'approved', 'rejected', 'needs_changes', 'suspended'];
const requestStatuses = ['new', 'reviewing', 'assigned', 'in_progress', 'completed', 'cancelled'];

export function AdminPanel() {
  const [data, setData] = useState({ workers: [], requests: [], notes: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setData(await getAdminData());
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load admin data. Make sure you are logged in as admin and RLS policies are applied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approvedWorkers = useMemo(() => data.workers.filter((worker) => worker.status === 'approved'), [data.workers]);
  const metrics = [
    ['Workers', data.workers.length],
    ['Pending', data.workers.filter((worker) => worker.status === 'pending').length],
    ['Approved', approvedWorkers.length],
    ['Requests', data.requests.length]
  ];

  const runAction = async (key, action) => {
    setActionKey(key);
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message || 'The admin action could not be completed.');
    } finally {
      setActionKey('');
    }
  };

  const setWorkerStatus = async (worker, status) => {
    let reason = null;
    if (status === 'rejected' || status === 'needs_changes') {
      reason = window.prompt(status === 'rejected' ? 'Reason for rejection' : 'Changes needed');
      if (!reason?.trim()) return;
    }
    await runAction(`worker-${worker.id}`, () => updateWorkerStatus(worker.id, status, reason?.trim() || null));
  };

  const setRequestStatus = async (id, status) => {
    await runAction(`request-${id}`, () => updateRequestStatus(id, status));
  };

  const assign = async (requestId, workerId) => {
    if (!workerId) return;
    await runAction(`request-${requestId}`, () => assignWorkerToRequest(requestId, workerId));
  };

  const note = async (entityType, entityId) => {
    const value = window.prompt('Internal admin note');
    if (!value?.trim()) return;
    await runAction(`${entityType}-${entityId}`, () => addAdminNote(entityType, entityId, value.trim()));
  };

  const notesFor = (entityType, entityId) =>
    data.notes.filter((item) => item.entity_type === entityType && item.entity_id === entityId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Approve workers, manage requests, assign approved workers, and keep private notes.</p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p>}
      {loading && <p className="rounded-lg bg-white p-4 text-slate-600">Loading dashboard...</p>}

      <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-brand-700">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">Workers</h2>
        <div className="grid gap-4">
          {data.workers.map((worker) => (
            <div key={worker.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-bold">{worker.display_name}</h3>
                  <p className="text-sm text-slate-600">{worker.service_categories?.name || worker.service_category_id} · {worker.experience_years} years · Status: <strong>{worker.status}</strong></p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Worker phone: {worker.phone}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">CNIC: {worker.cnic_number}</p>
                  <p className="mt-1 text-sm text-slate-600">Areas: {(worker.areas_covered || []).join(', ') || 'Not set'}</p>
                  {worker.admin_rejection_reason && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">Admin feedback: {worker.admin_rejection_reason}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {workerStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setWorkerStatus(worker, status)}
                      disabled={actionKey === `worker-${worker.id}` || worker.status === status}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${worker.status === status ? 'border-brand-700 bg-brand-50 text-brand-800' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      {status}
                    </button>
                  ))}
                  <button disabled={actionKey === `worker-${worker.id}`} onClick={() => note('worker', worker.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Add note</button>
                </div>
              </div>
              <AssetGallery assets={[
                { label: 'Profile', url: worker.profile_photo_signed_url },
                { label: 'CNIC front', url: worker.cnic_front_signed_url },
                { label: 'CNIC back', url: worker.cnic_back_signed_url },
                ...(worker.worker_photos || []).map((photo, index) => ({ label: `Work ${index + 1}`, url: photo.signed_url }))
              ]} />
              <Notes items={notesFor('worker', worker.id)} />
            </div>
          ))}
          {!data.workers.length && <Empty text="No workers yet. Worker signup submissions will appear here." />}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">Service Requests</h2>
        <div className="grid gap-4">
          {data.requests.map((request) => (
            <div key={request.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-bold">{request.service_categories?.name || request.service_category_id} in {request.areas?.name || request.area_id}</h3>
                  <p className="text-sm text-slate-600">Customer: {request.customer_name} · Phone: {request.customer_phone} · Urgency: {request.urgency} · Status: {request.status}</p>
                  {request.preferred_time && <p className="mt-1 text-sm text-slate-600">Preferred time: {request.preferred_time}</p>}
                  <p className="mt-2 text-slate-700">{request.problem_description}</p>
                  {!!request.lead_assignments?.length && (
                    <p className="mt-2 text-sm font-semibold text-brand-800">
                      Assigned: {request.lead_assignments.map((assignment) => assignment.workers?.display_name).filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="grid gap-2 md:min-w-64">
                  <select disabled={actionKey === `request-${request.id}`} className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-60" value={request.status} onChange={(event) => setRequestStatus(request.id, event.target.value)}>
                    {requestStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                  <select disabled={actionKey === `request-${request.id}`} className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-60" onChange={(event) => assign(request.id, event.target.value)} defaultValue="">
                    <option value="">Assign approved worker</option>
                    {approvedWorkers.map((worker) => <option key={worker.id} value={worker.id}>{worker.display_name}</option>)}
                  </select>
                  <button disabled={actionKey === `request-${request.id}`} onClick={() => note('request', request.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Add note</button>
                </div>
              </div>
              <AssetGallery assets={(request.request_photos || []).map((photo, index) => ({ label: `Problem ${index + 1}`, url: photo.signed_url }))} />
              <Notes items={notesFor('request', request.id)} />
            </div>
          ))}
          {!data.requests.length && <Empty text="No service requests yet. Customer submissions will appear here." />}
        </div>
      </section>
    </div>
  );
}

function Empty({ text }) {
  return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-500">{text}</p>;
}

function AssetGallery({ assets }) {
  const visibleAssets = assets.filter((asset) => asset.url);
  if (!visibleAssets.length) return <p className="mt-3 text-xs text-slate-500">No uploaded images available.</p>;
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {visibleAssets.map((asset) => (
        <a key={`${asset.label}-${asset.url}`} href={asset.url} target="_blank" rel="noreferrer" className="group min-w-0">
          <img src={asset.url} alt={asset.label} className="aspect-square w-full rounded-lg border border-slate-200 object-cover" />
          <span className="mt-1 block truncate text-xs font-semibold text-slate-600 group-hover:text-brand-700">{asset.label}</span>
        </a>
      ))}
    </div>
  );
}

function Notes({ items }) {
  if (!items.length) return null;
  return (
    <div className="mt-4 rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">Internal notes</p>
      {items.map((item) => <p key={item.id} className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{item.note}</p>)}
    </div>
  );
}
