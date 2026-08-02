import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Clipboard, Edit3, LogOut, Trash2, X,
  ChevronDown, ChevronUp, Search, UserCheck, Clock, AlertTriangle, ShieldCheck,
  Users, FileText, MessageSquareWarning, Filter as FilterIcon, RotateCcw, Megaphone, BarChart3
} from 'lucide-react';
import { BusinessIntelligenceCenter } from './BusinessIntelligenceCenter';
import { BannerGenerator } from './BannerGenerator';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { NotificationBell } from '../notifications/NotificationBell';
import { areas, services } from '../../data/catalog';
import { hasRealCnic } from '../../lib/validation';
import {
  addAdminNote,
  assignWorkerToRequest,
  clearMyNotifications,
  completeServiceRequest,
  createReviewInvitationForRequest,
  createComplaint,
  deleteServiceRequest,
  deleteWorker,
  getAdminData,
  markAllNotificationsRead,
  markNotificationRead,
  signOutAdmin,
  updateCommissionPayment,
  updateComplaintStatus,
  updateAdminWorkerProfile,
  updateRequestStatus,
  updateWorkerStatus,
  createCoupon,
  updateCouponStatus,
  updateReferralStatus
} from '../../lib/api';

const workerStatuses = ['pending', 'approved', 'rejected', 'needs_changes', 'suspended'];
const requestStatuses = ['new', 'reviewing', 'assigned', 'in_progress', 'cancelled'];
const complaintStatuses = ['open', 'investigating', 'resolved', 'dismissed'];

export function AdminPanel() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    workers: [],
    requests: [],
    assignments: [],
    notes: [],
    notifications: [],
    commissions: [],
    complaints: [],
    coupons: [],
    referrals: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState('');
  const [editingWorkerId, setEditingWorkerId] = useState('');
  const [workerEditForm, setWorkerEditForm] = useState(null);
  const [copiedReviewToken, setCopiedReviewToken] = useState('');
  const [completionInputs, setCompletionInputs] = useState({});
  const [complaintForm, setComplaintForm] = useState({
    request_id: '',
    complaint_text: '',
    notes: ''
  });
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'fixed',
    discount_value: '',
    usage_limit: '',
    per_customer_limit: 1,
    is_active: true
  });
  const [activeTab, setActiveTab] = useState('workers');
  // Worker filters
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerStatusFilter, setWorkerStatusFilter] = useState('all');
  const [workerServiceFilter, setWorkerServiceFilter] = useState('all');
  const [workerAreaFilter, setWorkerAreaFilter] = useState('all');
  // Request filters
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestServiceFilter, setRequestServiceFilter] = useState('all');
  const [requestUrgencyFilter, setRequestUrgencyFilter] = useState('all');
  const [requestAreaFilter, setRequestAreaFilter] = useState('all');
  const dataRef = useRef(data);
  dataRef.current = data;

  const setAdminNotifications = useCallback((updater) => {
    setData((current) => ({
      ...current,
      notifications: typeof updater === 'function' ? updater(current.notifications) : updater
    }));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getAdminData());
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkersInState = useCallback((updater) => {
    setData((current) => ({ ...current, workers: updater(current.workers) }));
  }, []);

  const updateRequestsInState = useCallback((updater) => {
    setData((current) => ({ ...current, requests: updater(current.requests) }));
  }, []);

  const updateCommissionsInState = useCallback((updater) => {
    setData((current) => ({ ...current, commissions: updater(current.commissions) }));
  }, []);

  const updateComplaintsInState = useCallback((updater) => {
    setData((current) => ({ ...current, complaints: updater(current.complaints) }));
  }, []);

  const updateNotificationsInState = useCallback((updater) => {
    setData((current) => ({ ...current, notifications: updater(current.notifications) }));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const runAction = async (key, action, reloadTargets = []) => {
    setActionKey(key);
    setError('');
    try {
      await action();
      const needsWorkers = reloadTargets.includes('workers');
      const needsRequests = reloadTargets.includes('requests');
      const needsCommissions = reloadTargets.includes('commissions');
      const needsComplaints = reloadTargets.includes('complaints');
      const needsNotifications = reloadTargets.includes('notifications');

      if (!needsWorkers && !needsRequests && !needsCommissions && !needsComplaints && !needsNotifications) {
        return;
      }

      const fresh = await getAdminData();
      setData((current) => ({
        ...current,
        ...(needsWorkers ? { workers: fresh.workers } : {}),
        ...(needsRequests ? { requests: fresh.requests } : {}),
        ...(needsCommissions ? { commissions: fresh.commissions } : {}),
        ...(needsComplaints ? { complaints: fresh.complaints } : {}),
        ...(needsNotifications ? { notifications: fresh.notifications } : {})
      }));
    } catch (err) {
      setError(err.message || 'The admin action could not be completed.');
    } finally {
      setActionKey('');
    }
  };

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return data.workers.filter((worker) => {
      // Search filter
      if (workerSearch) {
        const keyword = workerSearch.toLowerCase();
        const matchesSearch =
          (worker.display_name || '').toLowerCase().includes(keyword) ||
          (worker.phone || '').toLowerCase().includes(keyword) ||
          (worker.email || '').toLowerCase().includes(keyword);
        if (!matchesSearch) return false;
      }
      // Status filter
      if (workerStatusFilter !== 'all' && worker.status !== workerStatusFilter) return false;
      // Service filter
      if (workerServiceFilter !== 'all') {
        const workerService = worker.service_categories?.name || worker.service_category_id || '';
        if (workerService !== workerServiceFilter) return false;
      }
      // Area filter
      if (workerAreaFilter !== 'all') {
        const workerAreas = worker.areas_covered || [];
        if (!workerAreas.includes(workerAreaFilter)) return false;
      }
      return true;
    });
  }, [data.workers, workerSearch, workerStatusFilter, workerServiceFilter, workerAreaFilter]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return data.requests.filter((request) => {
      // Search filter
      if (requestSearch) {
        const keyword = requestSearch.toLowerCase();
        const matchesSearch =
          (request.customer_name || '').toLowerCase().includes(keyword) ||
          (request.customer_phone || '').toLowerCase().includes(keyword) ||
          (request.problem_description || '').toLowerCase().includes(keyword);
        if (!matchesSearch) return false;
      }
      // Status filter
      if (requestStatusFilter !== 'all' && request.status !== requestStatusFilter) return false;
      // Service filter
      if (requestServiceFilter !== 'all') {
        const reqService = request.service_categories?.name || request.service_category_id || '';
        if (reqService !== requestServiceFilter) return false;
      }
      // Urgency filter
      if (requestUrgencyFilter !== 'all' && request.urgency !== requestUrgencyFilter) return false;
      // Area filter
      if (requestAreaFilter !== 'all') {
        const reqArea = request.areas?.name || request.area_id || '';
        if (reqArea !== requestAreaFilter) return false;
      }
      return true;
    });
  }, [data.requests, requestSearch, requestStatusFilter, requestServiceFilter, requestUrgencyFilter, requestAreaFilter]);

  // Clear worker filters
  const clearWorkerFilters = () => {
    setWorkerSearch('');
    setWorkerStatusFilter('all');
    setWorkerServiceFilter('all');
    setWorkerAreaFilter('all');
  };

  // Clear request filters
  const clearRequestFilters = () => {
    setRequestSearch('');
    setRequestStatusFilter('all');
    setRequestServiceFilter('all');
    setRequestUrgencyFilter('all');
    setRequestAreaFilter('all');
  };

  const approvedWorkers = useMemo(() => data.workers.filter((worker) => worker.status === 'approved'), [data.workers]);
  const unreadNotifications = useMemo(
    () => data.notifications.filter((notification) => !notification.is_read),
    [data.notifications]
  );


  const commissionTotals = useMemo(() => data.commissions.reduce((totals, item) => ({
    jobValue: totals.jobValue + Number(item.job_amount || 0),
    earned: totals.earned + Number(item.commission_amount || 0),
    paid: totals.paid + (item.payment_status === 'paid' ? Number(item.commission_amount || 0) : 0),
    due: totals.due + (item.payment_status === 'due' ? Number(item.commission_amount || 0) : 0)
  }), { jobValue: 0, earned: 0, paid: 0, due: 0 }), [data.commissions]);

  const setWorkerStatus = async (worker, status) => {
    let reason = null;
    if (status === 'rejected' || status === 'needs_changes') {
      reason = window.prompt(status === 'rejected' ? 'Reason for rejection' : 'Changes needed');
      if (!reason?.trim()) return;
    }
    updateWorkersInState((workers) =>
      workers.map((w) => w.id === worker.id ? { ...w, status, admin_rejection_reason: reason?.trim() || w.admin_rejection_reason } : w)
    );
    await runAction(`worker-${worker.id}`, () => updateWorkerStatus(worker.id, status, reason?.trim() || null), ['workers']);
  };

  const editWorker = (worker) => {
    const realCnic = hasRealCnic(worker.cnic_number, worker.phone);
    setEditingWorkerId(worker.id);
    setWorkerEditForm({
      display_name: worker.display_name || '',
      phone: worker.phone || '',
      email: worker.email || '',
      cnic_number: realCnic ? worker.cnic_number : '',
      service_category_id: worker.service_category_id || services[0]?.name || '',
      experience_years: worker.experience_years ?? 0,
      areas_covered: worker.areas_covered?.length ? worker.areas_covered : [],
      bio: worker.bio || ''
    });
  };

  const cancelWorkerEdit = () => {
    setEditingWorkerId('');
    setWorkerEditForm(null);
  };

  const setWorkerEditField = (field, value) => {
    setWorkerEditForm((current) => ({ ...current, [field]: value }));
  };

  const toggleWorkerEditArea = (area, checked) => {
    setWorkerEditForm((current) => ({
      ...current,
      areas_covered: checked
        ? [...new Set([...(current.areas_covered || []), area])]
        : (current.areas_covered || []).filter((item) => item !== area)
    }));
  };

  const saveWorkerEdit = async (event, worker) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await runAction(`worker-edit-${worker.id}`, async () => {
      await updateAdminWorkerProfile(worker.id, {
        ...workerEditForm,
        profile_photo: formData.get('profile_photo'),
        cnic_front: formData.get('cnic_front'),
        cnic_back: formData.get('cnic_back'),
        current_profile_photo_url: worker.profile_photo_url,
        current_cnic_front_url: worker.cnic_front_url,
        current_cnic_back_url: worker.cnic_back_url
      });
      cancelWorkerEdit();
    }, ['workers']);
  };

  const setRequestStatus = async (id, status) => {
    updateRequestsInState((requests) =>
      requests.map((r) => r.id === id ? { ...r, status } : r)
    );
    await runAction(`request-${id}`, () => updateRequestStatus(id, status), ['requests']);
  };

  const removeWorker = async (worker) => {
    const confirmed = window.confirm(
      `Permanently delete ${worker.display_name}? This removes the worker account, documents, assignments, reviews, complaints and commission records. This cannot be undone.`
    );
    if (!confirmed) return;
    updateWorkersInState((workers) => workers.filter((w) => w.id !== worker.id));
    await runAction(`worker-${worker.id}`, () => deleteWorker(worker.id), ['workers', 'requests', 'commissions', 'complaints']);
  };

  const removeRequest = async (request) => {
    const confirmed = window.confirm(
      `Permanently delete this ${request.service_categories?.name || request.service_category_id} request for ${request.customer_name}? Related assignments, complaints, reviews, commission records and photos will also be deleted. This cannot be undone.`
    );
    if (!confirmed) return;
    updateRequestsInState((requests) => requests.filter((r) => r.id !== request.id));
    await runAction(`request-${request.id}`, () => deleteServiceRequest(request.id), ['requests', 'commissions', 'complaints']);
  };

  const assign = async (requestId, workerId) => {
    if (!workerId) return;
    await runAction(`request-${requestId}`, () => assignWorkerToRequest(requestId, workerId), ['requests']);
  };

  const complete = async (requestId) => {
    const input = completionInputs[requestId] || {};
    if (!Number(input.jobAmount)) {
      setError('Enter the actual job value before completing the request.');
      return;
    }
    await runAction(`request-${requestId}`, () =>
      completeServiceRequest(requestId, input.jobAmount, input.notes || ''),
      ['requests', 'commissions']
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
    await runAction(`${entityType}-${entityId}`, () => addAdminNote(entityType, entityId, value.trim()), []);
    await loadAll();
  };

  const readNotification = async (notificationId) => {
    updateNotificationsInState((notifications) =>
      notifications.map((n) => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    await runAction(`notification-${notificationId}`, () => markNotificationRead(notificationId), ['notifications']);
  };

  const readAllNotifications = async () => {
    updateNotificationsInState((notifications) =>
      notifications.map((n) => ({ ...n, is_read: true }))
    );
    await runAction('notifications-all', markAllNotificationsRead, ['notifications']);
  };

  const clearNotifications = async () => {
    const confirmed = window.confirm('Clear all notifications from this admin inbox?');
    if (!confirmed) return;
    updateNotificationsInState(() => []);
    await runAction('notifications-clear', clearMyNotifications, ['notifications']);
  };

  const copyReviewLink = async (token) => {
    await navigator.clipboard.writeText(`${window.location.origin}/review/${token}`);
    setCopiedReviewToken(token);
    window.setTimeout(() => setCopiedReviewToken(''), 2500);
  };

  const createReviewLink = async (requestId) => {
    setActionKey(`review-link-${requestId}`);
    setError('');
    try {
      const token = await createReviewInvitationForRequest(requestId);
      updateRequestsInState((requests) =>
        requests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                review_invitations: [{
                  token,
                  expires_at: null,
                  used_at: null
                }]
              }
            : request
        )
      );
      await copyReviewLink(token);
    } catch (err) {
      setError(err.message || 'Could not create the review link.');
    } finally {
      setActionKey('');
    }
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
    }), ['complaints']);
    setComplaintForm({ request_id: '', complaint_text: '', notes: '' });
  };

  const submitCoupon = async (event) => {
    event.preventDefault();
    try {
      await createCoupon(couponForm);
      await loadAll();
      setCouponForm({
        code: '', discount_type: 'fixed', discount_value: '', usage_limit: '', per_customer_limit: 1, is_active: true
      });
    } catch (err) {
      alert(err.message || 'Could not create coupon.');
    }
  };

  const toggleCoupon = async (coupon) => {
    try {
      await updateCouponStatus(coupon.id, !coupon.is_active);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Could not update coupon.');
    }
  };

  const updateReferral = async (referral, status) => {
    try {
      await updateReferralStatus(referral.id, status);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Could not update referral.');
    }
  };

  const notesFor = (entityType, entityId) =>
    data.notes.filter((item) => item.entity_type === entityType && item.entity_id === entityId);

  const adminTabs = [
    { key: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
    { key: 'workers', label: 'Workers', icon: Users, count: data.workers.length },
    { key: 'requests', label: 'Service Requests', icon: FileText, count: data.requests.length },
    { key: 'commissions', label: 'Commissions', icon: CheckCheck, count: data.commissions.length },
    { key: 'complaints', label: 'Complaints', icon: MessageSquareWarning, count: data.complaints.length },
    { key: 'referrals', label: 'Referrals', icon: Users, count: data.referrals.filter(r => r.status === 'pending' || r.status === 'completed').length },
    { key: 'coupons', label: 'Coupons', icon: Clipboard, count: data.coupons.length },
    { key: 'marketing', label: 'Banners', icon: Megaphone, count: null },
    { key: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifications.length > 0 ? `${unreadNotifications.length} new` : null }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">Admin Dashboard</h1>
              <p className="mt-1 text-slate-500">Manage workers, service requests, commissions, and complaints</p>
            </div>
            <NotificationBell
              notifications={data.notifications}
              onChange={setAdminNotifications}
              resolveLink={adminNotificationLink}
            />
          </div>
          <button onClick={logout} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white px-5 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
            <p className="text-sm font-medium text-slate-600">Loading dashboard data...</p>
          </div>
        </div>
      )}


      {/* Business Intelligence */}
      <div className={loading ? 'pointer-events-none opacity-60' : ''}>
        <BusinessIntelligenceCenter data={data} loading={false} />
      </div>

      {/* Admin Management Tabs */}
      <div className="mt-8">
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== null && tab.count !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {/* ===== WORKERS TAB ===== */}
        {activeTab === 'workers' && (
          <section id="workers" className="scroll-mt-20">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <Users size={20} className="text-brand-700" />
                  Workers
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{data.workers.length} total</span>
                </h2>
              </div>
              <div className="p-5">
                {/* Worker Filters */}
                <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, phone, email..."
                      value={workerSearch}
                      onChange={(e) => setWorkerSearch(e.target.value)}
                      className="min-h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                  <select
                    value={workerStatusFilter}
                    onChange={(e) => setWorkerStatusFilter(e.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    {workerStatuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <select
                    value={workerServiceFilter}
                    onChange={(e) => setWorkerServiceFilter(e.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All Services</option>
                    {services.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                  <select
                    value={workerAreaFilter}
                    onChange={(e) => setWorkerAreaFilter(e.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All Areas</option>
                    {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                {/* Filter Status & Clear */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-700">{filteredWorkers.length}</span> of{' '}
                    <span className="font-bold text-slate-700">{data.workers.length}</span> workers
                  </p>
                  {(workerSearch || workerStatusFilter !== 'all' || workerServiceFilter !== 'all' || workerAreaFilter !== 'all') && (
                    <button onClick={clearWorkerFilters} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      <RotateCcw size={13} />
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="grid gap-4">
                  {filteredWorkers.map((worker) => {
                    const realCnic = hasRealCnic(worker.cnic_number, worker.phone);
                    return (
                    <div key={worker.id} className="rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-sm">
                      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-950">{worker.display_name}</h3>
                            <StatusBadge status={worker.status} />
                          </div>
                          <div className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
                            <InfoRow label="Service" value={worker.service_categories?.name || worker.service_category_id || 'Not set'} />
                            <InfoRow label="Experience" value={`${worker.experience_years || 0} years`} />
                            <InfoRow label="Phone" value={worker.phone} />
                            <InfoRow label="Email" value={worker.email || 'Not provided'} />
                            <InfoRow label="CNIC" value={realCnic ? worker.cnic_number : 'Not provided'} />
                            <InfoRow label="Areas" value={
                              !(worker.areas_covered?.length) ? 'Not set' :
                              worker.areas_covered.length === areas.length ? 'All over Faisalabad' :
                              worker.areas_covered.length > 3 ? `${worker.areas_covered.slice(0, 3).join(', ')} ... +${worker.areas_covered.length - 3} more` :
                              worker.areas_covered.join(', ')
                            } />
                            <InfoRow label="Rating" value={worker.rating_avg ? `${Number(worker.rating_avg).toFixed(1)} ★` : 'No ratings'} />
                            <InfoRow label="Completed Jobs" value={worker.completed_jobs_count || 0} />
                          </div>
                          {worker.admin_rejection_reason && (
                            <div className="mt-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900">
                              Rejection reason: {worker.admin_rejection_reason}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-1.5 md:flex-col md:items-end">
                          <div className="flex flex-wrap gap-1.5">
                            {workerStatuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => setWorkerStatus(worker, status)}
                                disabled={actionKey === `worker-${worker.id}` || worker.status === status}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                  worker.status === status
                                    ? 'border-brand-700 bg-brand-50 text-brand-800'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                              >
                                {status.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <button
                              disabled={actionKey === `worker-${worker.id}`}
                              onClick={() => editWorker(worker)}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button
                              disabled={actionKey === `worker-${worker.id}`}
                              onClick={() => note('worker', worker.id)}
                              className="min-h-9 rounded-lg bg-slate-800 px-3 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                              Note
                            </button>
                            <button
                              disabled={actionKey === `worker-${worker.id}`}
                              onClick={() => removeWorker(worker)}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {editingWorkerId === worker.id && workerEditForm && (
                        <form onSubmit={(event) => saveWorkerEdit(event, worker)} className="border-t border-brand-100 bg-brand-50/50 p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-bold text-slate-950">Edit Worker Profile</h4>
                            <button type="button" onClick={cancelWorkerEdit} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                              <X size={15} />
                              Cancel
                            </button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <AdminField label="Name">
                              <input value={workerEditForm.display_name} onChange={(event) => setWorkerEditField('display_name', event.target.value)} minLength="2" maxLength="100" className={adminInputClass} required />
                            </AdminField>
                            <AdminField label="Phone">
                              <input value={workerEditForm.phone} onChange={(event) => setWorkerEditField('phone', event.target.value)} inputMode="tel" className={adminInputClass} required />
                            </AdminField>
                            <AdminField label="Email">
                              <input value={workerEditForm.email} onChange={(event) => setWorkerEditField('email', event.target.value)} type="email" className={adminInputClass} />
                            </AdminField>
                            <AdminField label="CNIC">
                              <input value={workerEditForm.cnic_number} onChange={(event) => setWorkerEditField('cnic_number', event.target.value)} inputMode="numeric" className={adminInputClass} />
                            </AdminField>
                            <AdminField label="Service">
                              <select value={workerEditForm.service_category_id} onChange={(event) => setWorkerEditField('service_category_id', event.target.value)} className={adminInputClass} required>
                                {services.map((service) => <option key={service.name} value={service.name}>{service.name}</option>)}
                              </select>
                            </AdminField>
                            <AdminField label="Experience years">
                              <input value={workerEditForm.experience_years} onChange={(event) => setWorkerEditField('experience_years', event.target.value)} type="number" min="0" max="80" className={adminInputClass} />
                            </AdminField>
                          </div>
                          <AdminField label="Areas covered">
                            <div className="mt-1 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
                              {areas.map((area) => (
                                <label key={area} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                                  <input
                                    type="checkbox"
                                    checked={(workerEditForm.areas_covered || []).includes(area)}
                                    onChange={(event) => toggleWorkerEditArea(area, event.target.checked)}
                                    className="rounded border-slate-300"
                                  />
                                  {area}
                                </label>
                              ))}
                            </div>
                          </AdminField>
                          <AdminField label="Bio">
                            <textarea value={workerEditForm.bio} onChange={(event) => setWorkerEditField('bio', event.target.value)} rows="3" maxLength="1000" className={adminInputClass} />
                          </AdminField>
                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <AdminField label="Replace profile photo">
                              <input name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp" className={adminInputClass} />
                            </AdminField>
                            <AdminField label="Replace CNIC front">
                              <input name="cnic_front" type="file" accept="image/jpeg,image/png,image/webp" className={adminInputClass} />
                            </AdminField>
                            <AdminField label="Replace CNIC back">
                              <input name="cnic_back" type="file" accept="image/jpeg,image/png,image/webp" className={adminInputClass} />
                            </AdminField>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button disabled={actionKey === `worker-edit-${worker.id}`} className="min-h-10 rounded-lg bg-brand-700 px-5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
                              {actionKey === `worker-edit-${worker.id}` ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={cancelWorkerEdit} className="min-h-10 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                          </div>
                        </form>
                      )}

                      <div className="border-t border-slate-100 px-5 py-4">
                        <AssetGallery assets={[
                          { label: 'Profile', url: worker.profile_photo_signed_url },
                          { label: 'CNIC front', url: worker.cnic_front_signed_url },
                          { label: 'CNIC back', url: worker.cnic_back_signed_url },
                          ...(worker.worker_photos || []).map((photo, index) => ({ label: `Work ${index + 1}`, url: photo.signed_url }))
                        ]} />
                        <Notes items={notesFor('worker', worker.id)} />
                      </div>
                    </div>
                  );})}
                  {!filteredWorkers.length && (
                    <Empty text={data.workers.length === 0 ? 'No workers yet. Worker signup submissions will appear here.' : 'No workers match your filters.'} />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== SERVICE REQUESTS TAB ===== */}
        {activeTab === 'requests' && (
          <section id="requests" className="scroll-mt-20">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <FileText size={20} className="text-brand-700" />
                  Service Requests
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{data.requests.length} total</span>
                </h2>
              </div>
              <div className="p-5">
                {/* Request Filters */}
                <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="min-h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                  <select
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    {requestStatuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <select
                    value={requestServiceFilter}
                    onChange={(e) => setRequestServiceFilter(e.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All Services</option>
                    {services.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                  <select
                    value={requestUrgencyFilter}
                    onChange={(e) => setRequestUrgencyFilter(e.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All Urgency</option>
                    <option value="Normal">Normal</option>
                    <option value="Today">Today</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                  <select
                    value={requestAreaFilter}
                    onChange={(e) => setRequestAreaFilter(e.target.value)}
                    className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All Areas</option>
                    {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                {/* Filter Status & Clear */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-700">{filteredRequests.length}</span> of{' '}
                    <span className="font-bold text-slate-700">{data.requests.length}</span> requests
                  </p>
                  {(requestSearch || requestStatusFilter !== 'all' || requestServiceFilter !== 'all' || requestUrgencyFilter !== 'all' || requestAreaFilter !== 'all') && (
                    <button onClick={clearRequestFilters} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      <RotateCcw size={13} />
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="grid gap-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-sm">
                      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-950">{request.service_categories?.name || request.service_category_id}</h3>
                            <StatusBadge status={request.status} />
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{request.areas?.name || request.area_id}</span>
                          </div>
                          <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                            <InfoRow label="Customer" value={request.customer_name} />
                            <InfoRow label="Phone" value={request.customer_phone} />
                            <InfoRow label="Urgency" value={request.urgency} />
                            {request.preferred_time && <InfoRow label="Preferred time" value={request.preferred_time} />}
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-700">{request.problem_description}</p>
                          {!!request.lead_assignments?.length && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-brand-50 px-4 py-2.5 text-sm">
                              <span className="font-semibold text-brand-800">Assigned:</span>
                              {request.lead_assignments.map((assignment) => (
                                <span key={assignment.id} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-brand-700">
                                  {assignment.workers?.display_name}
                                </span>
                              ))}
                            </div>
                          )}
                          {!!request.review_invitations?.length && (
                            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                              <p className="text-sm font-semibold text-blue-950">
                                {request.review_invitations[0].used_at ? '✓ Review submitted by customer' : 'Customer review link'}
                              </p>
                              {!request.review_invitations[0].used_at && (
                                <button
                                  type="button"
                                  onClick={() => copyReviewLink(request.review_invitations[0].token)}
                                  className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                                >
                                  <Clipboard size={15} />
                                  {copiedReviewToken === request.review_invitations[0].token ? 'Copied' : 'Copy Review Link'}
                                </button>
                              )}
                            </div>
                          )}
                          {request.status === 'completed' && !request.review_invitations?.length && (
                            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                              <p className="text-sm font-semibold text-blue-950">Customer review link</p>
                              <p className="mt-0.5 text-sm text-blue-800">No review link exists yet.</p>
                              <button
                                type="button"
                                onClick={() => createReviewLink(request.id)}
                                disabled={actionKey === `review-link-${request.id}`}
                                className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                              >
                                <Clipboard size={15} />
                                {actionKey === `review-link-${request.id}` ? 'Creating...' : 'Create Review Link'}
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="grid shrink-0 gap-2 md:min-w-56">
                          {request.status === 'completed' ? (
                            <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-center text-sm font-bold text-emerald-800">Completed</div>
                          ) : (
                            <select
                              disabled={actionKey === `request-${request.id}`}
                              className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-50"
                              value={request.status}
                              onChange={(event) => setRequestStatus(request.id, event.target.value)}
                            >
                              {requestStatuses.map((status) => <option key={status}>{status}</option>)}
                            </select>
                          )}
                          <select
                            disabled={actionKey === `request-${request.id}` || request.status === 'completed'}
                            className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:opacity-50"
                            onChange={(event) => assign(request.id, event.target.value)}
                            defaultValue=""
                          >
                            <option value="">Assign approved worker...</option>
                            {approvedWorkers
                              .filter((worker) => worker.service_category_id === request.service_category_id)
                              .sort((a, b) => Number((b.areas_covered || []).includes(request.area_id)) - Number((a.areas_covered || []).includes(request.area_id)))
                              .map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.display_name}{(worker.areas_covered || []).includes(request.area_id) ? ' ✓ Area match' : ''}
                                </option>
                              ))}
                          </select>
                          {request.status !== 'completed' && request.status !== 'cancelled' && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <label className="text-xs font-semibold text-slate-600">
                                Job Value (Rs)
                                <input
                                  type="number"
                                  min="1"
                                  value={completionInputs[request.id]?.jobAmount || ''}
                                  onChange={(event) => setCompletionInput(request.id, 'jobAmount', event.target.value)}
                                  className="mt-1 min-h-9 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal"
                                />
                              </label>
                              <p className="mt-1 text-xs text-slate-500">
                                10% commission: {formatRupees(Number(completionInputs[request.id]?.jobAmount || 0) * 0.1)}
                              </p>
                              <input
                                value={completionInputs[request.id]?.notes || ''}
                                onChange={(event) => setCompletionInput(request.id, 'notes', event.target.value)}
                                placeholder="Optional note"
                                className="mt-1 min-h-9 w-full rounded-lg border border-slate-300 px-3 text-sm"
                              />
                              <button
                                onClick={() => complete(request.id)}
                                disabled={actionKey === `request-${request.id}` || !request.lead_assignments?.some((item) => ['assigned', 'accepted'].includes(item.status))}
                                className="mt-2 min-h-9 w-full rounded-lg bg-brand-700 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                              >
                                Complete & Record
                              </button>
                            </div>
                          )}
                          <div className="flex gap-1.5">
                            <button
                              disabled={actionKey === `request-${request.id}`}
                              onClick={() => note('request', request.id)}
                              className="min-h-9 flex-1 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                              Note
                            </button>
                            <button
                              disabled={actionKey === `request-${request.id}`}
                              onClick={() => removeRequest(request)}
                              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-white text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 px-5 py-4">
                        <AssetGallery assets={(request.request_photos || []).map((photo, index) => ({ label: `Problem ${index + 1}`, url: photo.signed_url }))} />
                        <Notes items={notesFor('request', request.id)} />
                      </div>
                    </div>
                  ))}
                  {!filteredRequests.length && (
                    <Empty text={data.requests.length === 0 ? 'No service requests yet. Customer submissions will appear here.' : 'No requests match your filters.'} />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== COMMISSIONS TAB ===== */}
        {activeTab === 'commissions' && (
          <section id="commissions" className="scroll-mt-20">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <CheckCheck size={20} className="text-brand-700" />
                  Commission Reports
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{data.commissions.length} entries</span>
                </h2>
              </div>
              <div className="p-5">
                <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric label="Total Job Value" value={formatRupees(commissionTotals.jobValue)} />
                  <Metric label="Commission Earned" value={formatRupees(commissionTotals.earned)} />
                  <Metric label="Commission Paid" value={formatRupees(commissionTotals.paid)} variant="success" />
                  <Metric label="Commission Due" value={formatRupees(commissionTotals.due)} variant={commissionTotals.due > 0 ? 'warning' : 'default'} />
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Worker</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Job Value</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Commission</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Payment</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.commissions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">{transaction.workers?.display_name || 'Unknown Worker'}</td>
                          <td className="px-4 py-3 text-slate-700">{formatRupees(transaction.job_amount)}</td>
                          <td className="px-4 py-3 text-slate-700">{formatRupees(transaction.commission_amount)}</td>
                          <td className="px-4 py-3">
                            <select
                              value={transaction.payment_status}
                              onChange={(event) => runAction(
                                `commission-${transaction.id}`,
                                () => updateCommissionPayment(transaction.id, event.target.value),
                                ['commissions']
                              )}
                              className={`min-h-10 rounded-lg border px-3 text-sm font-medium ${
                                transaction.payment_status === 'paid'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : transaction.payment_status === 'waived'
                                  ? 'border-slate-200 bg-slate-50 text-slate-600'
                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                              }`}
                            >
                              <option value="due">Due</option>
                              <option value="paid">Paid</option>
                              <option value="waived">Waived</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(transaction.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {!data.commissions.length && (
                        <tr><td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">No completed-job commission entries yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== COMPLAINTS TAB ===== */}
        {activeTab === 'complaints' && (
          <section id="complaints" className="scroll-mt-20">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <MessageSquareWarning size={20} className="text-brand-700" />
                  Complaints
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{data.complaints.length} total</span>
                </h2>
              </div>
              <div className="p-5">
                <form onSubmit={submitComplaint} className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 font-bold text-slate-950">Log New Complaint</h3>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <select
                      value={complaintForm.request_id}
                      onChange={(event) => setComplaintForm((current) => ({ ...current, request_id: event.target.value }))}
                      className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
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
                      className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    />
                    <textarea
                      value={complaintForm.complaint_text}
                      onChange={(event) => setComplaintForm((current) => ({ ...current, complaint_text: event.target.value }))}
                      minLength="10"
                      maxLength="2000"
                      rows="3"
                      placeholder="Complaint details"
                      className="rounded-lg border border-slate-300 bg-white p-3 text-sm lg:col-span-2"
                      required
                    />
                    <button disabled={actionKey === 'complaint-new'} className="min-h-10 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors">
                      Record Complaint
                    </button>
                  </div>
                </form>

                <div className="grid gap-3">
                  {data.complaints.map((complaint) => (
                    <div key={complaint.id} className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-950">{complaint.customer_name}</h3>
                            <span className="text-sm text-slate-500">vs</span>
                            <span className="font-semibold text-slate-700">{complaint.workers?.display_name}</span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-700">{complaint.complaint_text}</p>
                          {complaint.notes && <p className="mt-2 text-xs text-slate-500">Notes: {complaint.notes}</p>}
                        </div>
                        <select
                          value={complaint.resolution_status}
                          onChange={(event) => runAction(
                            `complaint-${complaint.id}`,
                            () => updateComplaintStatus(complaint.id, event.target.value),
                            ['complaints']
                          )}
                          className={`min-h-10 rounded-lg border px-3 text-sm font-medium ${
                            complaint.resolution_status === 'resolved'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : complaint.resolution_status === 'dismissed'
                              ? 'border-slate-200 bg-slate-50 text-slate-500'
                              : complaint.resolution_status === 'investigating'
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {complaintStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {!data.complaints.length && <Empty text="No complaints recorded." />}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== NOTIFICATIONS TAB ===== */}
        {activeTab === 'notifications' && (
          <section id="notifications" className="scroll-mt-20">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                    <Bell size={20} className="text-brand-700" />
                    Notifications
                    {unreadNotifications.length > 0 && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{unreadNotifications.length}</span>
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={readAllNotifications}
                        disabled={actionKey === 'notifications-all'}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                      >
                        <CheckCheck size={16} />
                        Mark all read
                      </button>
                    )}
                    {data.notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        disabled={actionKey === 'notifications-clear'}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={16} />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="mb-4 text-sm text-slate-500">{data.notifications.length} total notifications</p>
                <div className="grid gap-2">
                  {data.notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => !notification.is_read && readNotification(notification.id)}
                      disabled={notification.is_read || actionKey === `notification-${notification.id}`}
                      className={`w-full rounded-lg border p-4 text-left transition-colors disabled:cursor-default ${
                        notification.is_read
                          ? 'border-slate-100 bg-white hover:bg-slate-50'
                          : 'border-brand-200 bg-brand-50 hover:bg-brand-100'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!notification.is_read && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                          <strong className={`text-sm ${notification.is_read ? 'text-slate-700' : 'text-slate-950'}`}>{notification.title}</strong>
                        </div>
                        <span className="whitespace-nowrap text-xs text-slate-400">{new Date(notification.created_at).toLocaleString()}</span>
                      </div>
                      <p className={`mt-1 text-sm ${notification.is_read ? 'text-slate-500' : 'text-slate-700'}`}>{notification.message}</p>
                    </button>
                  ))}
                  {!data.notifications.length && <Empty text="No notifications yet." />}
                </div>
              </div>
            </div>
          </section>
        )}
        {/* ===== REFERRALS TAB ===== */}
        {activeTab === 'referrals' && (
          <section id="referrals" className="scroll-mt-20">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <Users size={20} className="text-brand-700" />
                  Referral Program
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{data.referrals.length} total</span>
                </h2>
              </div>
              <div className="p-5 grid gap-4">
                {data.referrals.map(referral => (
                  <div key={referral.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Referrer: <span className="font-bold">{referral.referrer_phone}</span></p>
                      <p className="text-sm text-slate-600">Referred: {referral.referred_customer_phone} ({referral.service_requests?.customer_name})</p>
                      <p className="text-sm text-slate-600 mt-1">Reward: Rs {referral.reward_amount}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={referral.status === 'rewarded' ? 'approved' : referral.status === 'completed' ? 'pending' : 'needs_changes'} />
                      <p className="text-xs text-slate-500 uppercase">{referral.status}</p>
                      {referral.status === 'completed' && (
                        <button onClick={() => updateReferral(referral, 'rewarded')} className="bg-brand-600 text-white px-3 py-1 text-xs font-bold rounded">
                          Mark Rewarded
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {data.referrals.length === 0 && <p className="text-slate-500 text-sm">No referrals yet.</p>}
              </div>
            </div>
          </section>
        )}

        {/* ===== COUPONS TAB ===== */}
        {activeTab === 'coupons' && (
          <section id="coupons" className="scroll-mt-20">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <Clipboard size={20} className="text-brand-700" />
                  Coupons
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{data.coupons.length} total</span>
                </h2>
              </div>
              <div className="p-5">
                <form onSubmit={submitCoupon} className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <h3 className="col-span-full font-bold text-brand-900">Create New Coupon</h3>
                  <input placeholder="Code (e.g. FSD200)" required value={couponForm.code} onChange={e => setCouponForm(c => ({...c, code: e.target.value}))} className="rounded border border-brand-200 p-2 text-sm" />
                  <select value={couponForm.discount_type} onChange={e => setCouponForm(c => ({...c, discount_type: e.target.value}))} className="rounded border border-brand-200 p-2 text-sm">
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage %</option>
                  </select>
                  <input type="number" placeholder="Value (e.g. 200)" required value={couponForm.discount_value} onChange={e => setCouponForm(c => ({...c, discount_value: e.target.value}))} className="rounded border border-brand-200 p-2 text-sm" />
                  <input type="number" placeholder="Total Uses Limit (Optional)" value={couponForm.usage_limit} onChange={e => setCouponForm(c => ({...c, usage_limit: e.target.value}))} className="rounded border border-brand-200 p-2 text-sm" />
                  <button className="col-span-full bg-brand-700 text-white font-bold py-2 rounded">Create Coupon</button>
                </form>

                <div className="grid gap-4">
                  {data.coupons.map(coupon => (
                    <div key={coupon.id} className="rounded-lg border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-lg">{coupon.code} <span className="text-sm font-normal text-slate-500">({coupon.discount_type === 'fixed' ? 'Rs' : ''}{coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ''})</span></p>
                        <p className="text-sm text-slate-600 mt-1">Used: {coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : 'times'}</p>
                      </div>
                      <button onClick={() => toggleCoupon(coupon)} className={`px-4 py-1.5 rounded text-sm font-bold ${coupon.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}
                  {data.coupons.length === 0 && <p className="text-slate-500 text-sm">No coupons created yet.</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== ANALYTICS TAB ===== */}
        {activeTab === 'analytics' && (
          <section id="analytics" className="scroll-mt-20">
            <AnalyticsDashboard />
          </section>
        )}

        {/* ===== MARKETING TAB ===== */}
        {activeTab === 'marketing' && (
          <section id="marketing" className="scroll-mt-20">
            <BannerGenerator />
          </section>
        )}
      </div>
    </div>
  );
}

/* ===== Helper Components ===== */

function StatusBadge({ status }) {
  const config = {
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    needs_changes: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    suspended: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    reviewing: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    assigned: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    in_progress: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
    cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  };
  const style = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} px-2.5 py-0.5 text-xs font-semibold ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function Empty({ text }) {
  return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">{text}</p>;
}

const adminInputClass = 'min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

function AdminField({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, variant = 'default' }) {
  const variants = {
    default: 'bg-white border-slate-200',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200'
  };
  return (
    <div className={`rounded-lg border p-4 ${variants[variant] || variants.default}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-700">{value}</p>
    </div>
  );
}

function formatRupees(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
}

function AssetGallery({ assets }) {
  const visibleAssets = assets.filter((asset) => asset.url);
  if (!visibleAssets.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {visibleAssets.map((asset) => (
        <a key={`${asset.label}-${asset.url}`} href={asset.url} target="_blank" rel="noreferrer" className="group min-w-0">
          <img src={asset.url} alt={asset.label} className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover transition group-hover:border-brand-400" />
          <span className="mt-1 block truncate text-xs font-semibold text-slate-500 group-hover:text-brand-700">{asset.label}</span>
        </a>
      ))}
    </div>
  );
}

function Notes({ items }) {
  if (!items.length) return null;
  return (
    <div className="mt-4 rounded-lg bg-slate-50 p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Internal notes</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg bg-white p-3">
            <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{item.note}</p>
            <p className="mt-1 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
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