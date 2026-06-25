import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clipboard, LogOut } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import {
  addAdminNote,
  assignWorkerToRequest,
  completeServiceRequest,
  createComplaint,
  getAdminData,
  markAllNotificationsRead,
  markNotificationRead,
  signOutAdmin,
  updateCommissionPayment,
  updateComplaintStatus,
  updateRequestStatus,
  updateWorkerStatus
} from '../../lib/api';

const workerStatuses = ['pending', 'approved', 'rejected', 'needs_changes', 'suspended'];
const requestStatuses = ['new', 'reviewing', 'assigned', 'in_progress', 'cancelled'];
const complaintStatuses = ['open', 'investigating', 'resolved', 'dismissed'];

export function AdminPanel() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    workers: [],
    requests: [],
    notes: [],
    notifications: [],
    commissions: [],
    complaints: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState('');
  const [completionInputs, setCompletionInputs] = useState({});
  const [complaintForm, setComplaintForm] = useState({
    request_id: '',
    complaint_text: '',
    notes: ''
  });
  const setAdminNotifications = useCallback((updater) => {
    setData((current) => ({
      ...current,
      notifications: typeof updater === 'function' ? updater(current.notifications) : updater
    }));
  }, []);

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
  const unreadNotifications = useMemo(
    () => data.notifications.filter((notification) => !notification.is_read),
    [data.notifications]
  );
  const metrics = [
    ['Workers', data.workers.length],
    ['Pending', data.workers.filter((worker) => worker.status === 'pending').length],
    ['Approved', approvedWorkers.length],
    ['Requests', data.requests.length]
  ];
  const commissionTotals = useMemo(() => data.commissions.reduce((totals, item) => ({
    jobValue: totals.jobValue + Number(item.job_amount || 0),
    earned: totals.earned + Number(item.commission_amount || 0),
    paid: totals.paid + (item.payment_status === 'paid' ? Number(item.commission_amount || 0) : 0),
    due: totals.due + (item.payment_status === 'due' ? Number(item.commission_amount || 0) : 0)
  }), { jobValue: 0, earned: 0, paid: 0, due: 0 }), [data.commissions]);

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

  const complete = async (requestId) => {
    const input = completionInputs[requestId] || {};
    if (!Number(input.jobAmount)) {
      setError('Enter the actual job value before completing the request.');
      return;
    }
    await runAction(`request-${requestId}`, () =>
      completeServiceRequest(requestId, input.jobAmount, input.notes || '')
    );
  };

  const setCompletionInput = (requestId, field, value) => {
    setCompletionInputs((current) => ({
      ...current,
      [requestId]: { ...current[requestId], [field]: value }
    }));
  };

  const note = async (entityType, entityId) => {
    const value = window.prompt('Internal admin note');
    if (!value?.trim()) return;
    await runAction(`${entityType}-${entityId}`, () => addAdminNote(entityType, entityId, value.trim()));
  };

  const readNotification = async (notificationId) => {
    await runAction(`notification-${notificationId}`, () => markNotificationRead(notificationId));
  };

  const readAllNotifications = async () => {
    await runAction('notifications-all', markAllNotificationsRead);
  };

  const copyReviewLink = async (token) => {
    await navigator.clipboard.writeText(`${window.location.origin}/review/${token}`);
  };

  const logout = async () => {
    await signOutAdmin();
    navigate('/login', { replace: true });
  };

  const submitComplaint = async (event) => {
    event.preventDefault();
    const request = data.requests.find((item) => item.id === complaintForm.request_id);
    const assignment = request?.lead_assignments?.find((item) =>
      ['assigned', 'accepted', 'completed'].includes(item.status)
    );
    if (!request || !assignment) {
      setError('Select a request with an assigned worker.');
      return;
    }
    await runAction('complaint-new', () => createComplaint({
      request_id: request.id,
      worker_id: assignment.worker_id,
      customer_name: request.customer_name,
      customer_phone: request.customer_phone,
      complaint_text: complaintForm.complaint_text,
      notes: complaintForm.notes
    }));
    setComplaintForm({ request_id: '', complaint_text: '', notes: '' });
  };

  const notesFor = (entityType, entityId) =>
    data.notes.filter((item) => item.entity_type === entityType && item.entity_id === entityId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-950">Admin Dashboard</h1>
            <NotificationBell
              notifications={data.notifications}
              onChange={setAdminNotifications}
              resolveLink={adminNotificationLink}
            />
          </div>
          <button onClick={logout} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold hover:bg-slate-50">
            <LogOut size={17} />
            Logout
          </button>
        </div>
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

      <section id="notifications" className="mt-8 scroll-mt-24">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Bell size={20} />
            Notifications
            {unreadNotifications.length > 0 && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{unreadNotifications.length}</span>
            )}
          </h2>
          {unreadNotifications.length > 0 && (
            <button
              onClick={readAllNotifications}
              disabled={actionKey === 'notifications-all'}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              <CheckCheck size={17} />
              Mark all read
            </button>
          )}
        </div>
        <div className="grid gap-3">
          {data.notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => !notification.is_read && readNotification(notification.id)}
              disabled={notification.is_read || actionKey === `notification-${notification.id}`}
              className={`min-h-16 rounded-lg border p-4 text-left disabled:cursor-default ${notification.is_read ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50'}`}
            >
              <span className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-slate-950">{notification.title}</strong>
                <span className="text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</span>
              </span>
              <span className="mt-1 block text-sm text-slate-600">{notification.message}</span>
            </button>
          ))}
          {!data.notifications.length && <Empty text="No notifications yet." />}
        </div>
      </section>

      <section id="commissions" className="mt-8 scroll-mt-24">
        <h2 className="mb-3 text-xl font-bold">Commission Reports</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total Job Value" value={formatRupees(commissionTotals.jobValue)} />
          <Metric label="Commission Earned" value={formatRupees(commissionTotals.earned)} />
          <Metric label="Commission Paid" value={formatRupees(commissionTotals.paid)} />
          <Metric label="Commission Due" value={formatRupees(commissionTotals.due)} />
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Worker</th>
                <th className="p-3">Job Value</th>
                <th className="p-3">Commission</th>
                <th className="p-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {data.commissions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold">{transaction.workers?.display_name || 'Worker'}</td>
                  <td className="p-3">{formatRupees(transaction.job_amount)}</td>
                  <td className="p-3">{formatRupees(transaction.commission_amount)}</td>
                  <td className="p-3">
                    <select
                      value={transaction.payment_status}
                      onChange={(event) => runAction(
                        `commission-${transaction.id}`,
                        () => updateCommissionPayment(transaction.id, event.target.value)
                      )}
                      className="min-h-11 rounded-lg border border-slate-300 px-3"
                    >
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!data.commissions.length && (
                <tr><td colSpan="4" className="p-4 text-slate-500">No completed-job commission entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="workers" className="mt-8 scroll-mt-24">
        <h2 className="mb-3 text-xl font-bold">Workers</h2>
        <div className="grid gap-4">
          {data.workers.map((worker) => (
            <div key={worker.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-bold">{worker.display_name}</h3>
                  <p className="text-sm text-slate-600">{worker.service_categories?.name || worker.service_category_id} · {worker.experience_years} years · Status: <strong>{worker.status}</strong></p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Worker phone: {worker.phone}</p>
                  <p className="mt-1 text-sm text-slate-600">Email: {worker.email || 'Not provided'}</p>
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

      <section id="requests" className="mt-8 scroll-mt-24">
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
                  {!!request.review_invitations?.length && (
                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
                      <p className="font-bold text-blue-950">
                        {request.review_invitations[0].used_at ? 'Review submitted' : 'Customer review link'}
                      </p>
                      {!request.review_invitations[0].used_at && (
                        <button
                          type="button"
                          onClick={() => copyReviewLink(request.review_invitations[0].token)}
                          className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-700 px-4 font-bold text-white hover:bg-blue-600"
                        >
                          <Clipboard size={17} />
                          Copy Review Link
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid gap-2 md:min-w-64">
                  {request.status === 'completed' ? (
                    <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-800">Completed</p>
                  ) : (
                    <select disabled={actionKey === `request-${request.id}`} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 disabled:opacity-60" value={request.status} onChange={(event) => setRequestStatus(request.id, event.target.value)}>
                      {requestStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  )}
                  <select disabled={actionKey === `request-${request.id}` || request.status === 'completed'} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 disabled:opacity-60" onChange={(event) => assign(request.id, event.target.value)} defaultValue="">
                    <option value="">Assign approved matching worker</option>
                    {approvedWorkers
                      .filter((worker) => worker.service_category_id === request.service_category_id)
                      .sort((a, b) => Number((b.areas_covered || []).includes(request.area_id)) - Number((a.areas_covered || []).includes(request.area_id)))
                      .map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.display_name}{(worker.areas_covered || []).includes(request.area_id) ? ' - Area match' : ''}
                        </option>
                      ))}
                  </select>
                  {request.status !== 'completed' && request.status !== 'cancelled' && (
                    <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <label className="text-xs font-bold text-slate-700">
                        Actual Job Value (Rs)
                        <input
                          type="number"
                          min="1"
                          value={completionInputs[request.id]?.jobAmount || ''}
                          onChange={(event) => setCompletionInput(request.id, 'jobAmount', event.target.value)}
                          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal"
                        />
                      </label>
                      <p className="text-xs text-slate-600">
                        10% commission: {formatRupees(Number(completionInputs[request.id]?.jobAmount || 0) * 0.1)}
                      </p>
                      <input
                        value={completionInputs[request.id]?.notes || ''}
                        onChange={(event) => setCompletionInput(request.id, 'notes', event.target.value)}
                        placeholder="Optional commission note"
                        className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm"
                      />
                      <button
                        onClick={() => complete(request.id)}
                        disabled={actionKey === `request-${request.id}` || !request.lead_assignments?.some((item) => ['assigned', 'accepted'].includes(item.status))}
                        className="min-h-11 rounded-lg bg-brand-700 px-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        Complete Job & Record Commission
                      </button>
                    </div>
                  )}
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

      <section id="complaints" className="mt-8 scroll-mt-24">
        <h2 className="mb-3 text-xl font-bold">Complaints</h2>
        <form onSubmit={submitComplaint} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-2">
          <select
            value={complaintForm.request_id}
            onChange={(event) => setComplaintForm((current) => ({ ...current, request_id: event.target.value }))}
            className="min-h-11 rounded-lg border border-slate-300 px-3"
            required
          >
            <option value="">Select assigned request</option>
            {data.requests
              .filter((request) => request.lead_assignments?.some((item) =>
                ['assigned', 'accepted', 'completed'].includes(item.status)
              ))
              .map((request) => (
                <option key={request.id} value={request.id}>
                  {request.customer_name} - {request.service_category_id} - {request.area_id}
                </option>
              ))}
          </select>
          <input
            value={complaintForm.notes}
            onChange={(event) => setComplaintForm((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Optional internal notes"
            className="min-h-11 rounded-lg border border-slate-300 px-3"
          />
          <textarea
            value={complaintForm.complaint_text}
            onChange={(event) => setComplaintForm((current) => ({ ...current, complaint_text: event.target.value }))}
            minLength="10"
            maxLength="2000"
            rows="3"
            placeholder="Complaint details"
            className="rounded-lg border border-slate-300 p-3 lg:col-span-2"
            required
          />
          <button disabled={actionKey === 'complaint-new'} className="min-h-11 rounded-lg bg-slate-900 px-4 font-bold text-white disabled:opacity-50">
            Record Complaint
          </button>
        </form>
        <div className="mt-4 grid gap-3">
          {data.complaints.map((complaint) => (
            <div key={complaint.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold">{complaint.customer_name} - {complaint.workers?.display_name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{complaint.complaint_text}</p>
                  {complaint.notes && <p className="mt-2 text-sm text-slate-500">Notes: {complaint.notes}</p>}
                </div>
                <select
                  value={complaint.resolution_status}
                  onChange={(event) => runAction(
                    `complaint-${complaint.id}`,
                    () => updateComplaintStatus(complaint.id, event.target.value)
                  )}
                  className="min-h-11 rounded-lg border border-slate-300 px-3"
                >
                  {complaintStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
          ))}
          {!data.complaints.length && <Empty text="No complaints recorded." />}
        </div>
      </section>
    </div>
  );
}

function Empty({ text }) {
  return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-500">{text}</p>;
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-700">{value}</p>
    </div>
  );
}

function formatRupees(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
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

function adminNotificationLink(notification) {
  if (notification.type === 'new_worker_signup') return '/admin#workers';
  if (['new_customer_request', 'worker_accepted_lead', 'worker_rejected_lead', 'job_completed'].includes(notification.type)) {
    return '/admin#requests';
  }
  if (notification.type === 'new_complaint') return '/admin#complaints';
  if (['commission_recorded', 'commission_due'].includes(notification.type)) return '/admin#commissions';
  return '/admin#notifications';
}
