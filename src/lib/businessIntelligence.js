import { areas, services } from '../data/catalog';

export const reportRanges = [
  ['today', 'Today'],
  ['7d', 'Last 7 Days'],
  ['30d', 'Last 30 Days'],
  ['month', 'This Month'],
  ['year', 'This Year'],
  ['custom', 'Custom']
];

const monthFormatter = new Intl.DateTimeFormat('en-PK', { month: 'short', year: 'numeric' });

export function buildBusinessIntelligence(data, filters) {
  const source = normalizeAdminData(data);
  const range = resolveDateRange(filters);
  const previousRange = previousDateRange(range);
  const scoped = scopeData(source, range);
  const previous = scopeData(source, previousRange);

  const totalRequests = scoped.requests.length;
  const completedJobs = scoped.requests.filter((request) => request.status === 'completed').length;
  const assignedJobs = scoped.requests.filter((request) => ['assigned', 'in_progress', 'completed'].includes(request.status)).length;
  const cancelledJobs = scoped.requests.filter((request) => request.status === 'cancelled').length;
  const completionRate = percent(completedJobs, totalRequests);
  const commissionEarned = sum(scoped.commissions, 'commission_amount');
  const pendingCommission = sum(scoped.commissions.filter((item) => item.payment_status === 'due'), 'commission_amount');
  const revenue = sum(scoped.commissions, 'job_amount');
  const averageRating = average(source.workers.map((worker) => Number(worker.rating_avg || 0)).filter(Boolean));
  const customers = uniqueCount(source.requests.map((request) => normalizedPhone(request.customer_phone) || request.customer_name));
  const scopedCustomers = uniqueCount(scoped.requests.map((request) => normalizedPhone(request.customer_phone) || request.customer_name));
  const previousRequests = previous.requests.length;

  const topServices = rankBy(scoped.requests, (request) => request.service_categories?.name || request.service_category_id || 'Unknown');
  const topAreas = rankBy(scoped.requests, (request) => request.areas?.name || request.area_id || 'Unknown');
  const monthly = monthlySeries(source);
  const healthScore = businessHealthScore({
    approvedWorkers: source.workers.filter((worker) => worker.status === 'approved').length,
    complaints: scoped.complaints.length,
    completionRate,
    pendingCommission,
    totalRequests
  });

  return {
    range,
    filters,
    scoped,
    summary: {
      totalWorkers: source.workers.length,
      approvedWorkers: source.workers.filter((worker) => worker.status === 'approved').length,
      pendingWorkers: source.workers.filter((worker) => worker.status === 'pending').length,
      customers,
      scopedCustomers,
      totalRequests,
      assignedJobs,
      completedJobs,
      cancelledJobs,
      completionRate,
      revenue,
      commissionEarned,
      pendingCommission,
      averageRating,
      complaints: scoped.complaints.length,
      topService: topServices[0]?.label || 'Not enough data',
      topArea: topAreas[0]?.label || 'Not enough data',
      newWorkers: scoped.workers.length,
      newCustomers: scopedCustomers,
      monthlyGrowth: growthRate(totalRequests, previousRequests),
      healthScore
    },
    charts: {
      topServices,
      topAreas,
      monthly
    }
  };
}

export function investorReportRows(bi) {
  return [
    { metric: 'Total Workers', value: bi.summary.totalWorkers },
    { metric: 'Approved Workers', value: bi.summary.approvedWorkers },
    { metric: 'Pending Workers', value: bi.summary.pendingWorkers },
    { metric: 'Total Customers', value: bi.summary.customers },
    { metric: 'Service Requests', value: bi.summary.totalRequests },
    { metric: 'Completed Jobs', value: bi.summary.completedJobs },
    { metric: 'Completion Rate', value: `${bi.summary.completionRate}%` },
    { metric: 'Revenue', value: bi.summary.revenue },
    { metric: 'Platform Commission', value: bi.summary.commissionEarned },
    { metric: 'Pending Commission', value: bi.summary.pendingCommission },
    { metric: 'Average Rating', value: bi.summary.averageRating.toFixed(1) },
    { metric: 'Complaints', value: bi.summary.complaints },
    { metric: 'Top Service', value: bi.summary.topService },
    { metric: 'Top Area', value: bi.summary.topArea },
    { metric: 'Monthly Growth', value: `${bi.summary.monthlyGrowth}%` },
    { metric: 'Business Health Score', value: `${bi.summary.healthScore}/100` }
  ];
}

export function buildExportDatasets(data, range) {
  const source = normalizeAdminData(data);
  const scoped = scopeData(source, range);
  return {
    workers: source.workers.map(safeWorkerRow),
    customers: customerRows(source.requests),
    service_requests: scoped.requests.map(safeRequestRow),
    jobs: scoped.requests.filter((request) => request.status === 'completed').map(safeRequestRow),
    revenue: scoped.commissions.map(revenueRow),
    commissions: scoped.commissions.map(commissionRow),
    reviews: source.workers.map(reviewStatsRow),
    complaints: scoped.complaints.map(complaintRow),
    services: services.map((service) => ({ name: service.name, slug: service.slug, description: service.description })),
    notifications: scoped.notifications.map(notificationRow),
    assignments: source.assignments.map(assignmentRow),
    areas: areas.map((area) => ({ area }))
  };
}

export function sanitizeBackupData(data) {
  const source = normalizeAdminData(data);
  return {
    workers: source.workers.map(safeWorkerRow),
    service_requests: source.requests.map(safeRequestRow),
    assignments: source.assignments.map(assignmentRow),
    commissions: source.commissions.map(commissionRow),
    complaints: source.complaints.map(complaintRow),
    notifications: source.notifications.map(notificationRow),
    admin_notes: source.notes.map((note) => ({
      id: note.id,
      entity_type: note.entity_type,
      entity_id: note.entity_id,
      note: note.note,
      created_at: note.created_at
    })),
    service_catalog: services.map((service) => ({ name: service.name, slug: service.slug, description: service.description })),
    areas: areas.map((area) => ({ area }))
  };
}

export function archiveKeyFor(date = new Date()) {
  return monthFormatter.format(date);
}

export function normalizeAdminData(data = {}) {
  return {
    workers: data.workers || [],
    requests: data.requests || [],
    assignments: data.assignments || [],
    notes: data.notes || [],
    notifications: data.notifications || [],
    commissions: data.commissions || [],
    complaints: data.complaints || []
  };
}

function scopeData(data, range) {
  return {
    workers: byDate(data.workers, range),
    requests: byDate(data.requests, range),
    commissions: byDate(data.commissions, range),
    complaints: byDate(data.complaints, range),
    notifications: byDate(data.notifications, range)
  };
}

function byDate(rows, range) {
  return (rows || []).filter((row) => withinRange(row.created_at, range));
}

function withinRange(value, range) {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return time >= range.start.getTime() && time <= range.end.getTime();
}

function resolveDateRange(filters) {
  const now = new Date();
  const end = endOfDay(now);
  if (filters.range === 'custom' && filters.startDate && filters.endDate) {
    return {
      start: startOfDay(new Date(filters.startDate)),
      end: endOfDay(new Date(filters.endDate))
    };
  }
  if (filters.range === 'today') return { start: startOfDay(now), end };
  if (filters.range === '7d') return { start: startOfDay(addDays(now, -6)), end };
  if (filters.range === '30d') return { start: startOfDay(addDays(now, -29)), end };
  if (filters.range === 'year') return { start: new Date(now.getFullYear(), 0, 1), end };
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
}

function previousDateRange(range) {
  const duration = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - duration - 1),
    end: new Date(range.start.getTime() - 1)
  };
}

function monthlySeries(data) {
  const buckets = new Map();
  data.requests.forEach((request) => {
    const date = new Date(request.created_at);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = buckets.get(key) || { label: monthFormatter.format(date), requests: 0, completed: 0, commission: 0 };
    current.requests += 1;
    if (request.status === 'completed') current.completed += 1;
    buckets.set(key, current);
  });
  data.commissions.forEach((item) => {
    const date = new Date(item.created_at);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = buckets.get(key) || { label: monthFormatter.format(date), requests: 0, completed: 0, commission: 0 };
    current.commission += Number(item.commission_amount || 0);
    buckets.set(key, current);
  });
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([, value]) => value);
}

function rankBy(rows, getLabel) {
  const counts = new Map();
  rows.forEach((row) => {
    const label = getLabel(row);
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 5);
}

function safeWorkerRow(worker) {
  return {
    id: worker.id,
    display_name: worker.display_name,
    phone: worker.phone,
    email: worker.email || '',
    service: worker.service_categories?.name || worker.service_category_id || '',
    status: worker.status,
    experience_years: worker.experience_years || 0,
    areas_covered: (worker.areas_covered || []).join('; '),
    rating_avg: worker.rating_avg || 0,
    review_count: worker.review_count || 0,
    completed_jobs_count: worker.completed_jobs_count || 0,
    created_at: worker.created_at
  };
}

function safeRequestRow(request) {
  return {
    id: request.id,
    customer_name: request.customer_name,
    customer_phone: request.customer_phone,
    service: request.service_categories?.name || request.service_category_id || '',
    area: request.areas?.name || request.area_id || '',
    status: request.status,
    urgency: request.urgency || '',
    preferred_time: request.preferred_time || '',
    created_at: request.created_at
  };
}

function customerRows(requests) {
  const customers = new Map();
  requests.forEach((request) => {
    const key = normalizedPhone(request.customer_phone) || request.customer_name;
    if (!key) return;
    const current = customers.get(key) || {
      customer_name: request.customer_name,
      customer_phone: request.customer_phone,
      requests: 0,
      first_request_at: request.created_at,
      last_request_at: request.created_at
    };
    current.requests += 1;
    if (new Date(request.created_at) < new Date(current.first_request_at)) current.first_request_at = request.created_at;
    if (new Date(request.created_at) > new Date(current.last_request_at)) current.last_request_at = request.created_at;
    customers.set(key, current);
  });
  return Array.from(customers.values());
}

function revenueRow(item) {
  return {
    id: item.id,
    worker: item.workers?.display_name || '',
    job_amount: item.job_amount,
    commission_amount: item.commission_amount,
    payment_status: item.payment_status,
    created_at: item.created_at
  };
}

function commissionRow(item) {
  return {
    id: item.id,
    worker: item.workers?.display_name || '',
    job_amount: item.job_amount,
    commission_percentage: item.commission_percentage,
    commission_amount: item.commission_amount,
    payment_status: item.payment_status,
    notes: item.notes || '',
    created_at: item.created_at
  };
}

function reviewStatsRow(worker) {
  return {
    worker_id: worker.id,
    worker: worker.display_name,
    service: worker.service_categories?.name || worker.service_category_id || '',
    rating_avg: worker.rating_avg || 0,
    review_count: worker.review_count || 0
  };
}

function complaintRow(complaint) {
  return {
    id: complaint.id,
    customer_name: complaint.customer_name,
    worker: complaint.workers?.display_name || '',
    status: complaint.resolution_status,
    complaint_text: complaint.complaint_text,
    created_at: complaint.created_at
  };
}

function notificationRow(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    is_read: notification.is_read,
    created_at: notification.created_at
  };
}

function assignmentRow(assignment) {
  return {
    id: assignment.id,
    request_id: assignment.request_id,
    worker_id: assignment.worker_id,
    status: assignment.status,
    assigned_at: assignment.assigned_at,
    responded_at: assignment.responded_at || ''
  };
}

function businessHealthScore({ approvedWorkers, complaints, completionRate, pendingCommission, totalRequests }) {
  let score = 50;
  score += Math.min(approvedWorkers, 10) * 2;
  score += Math.min(completionRate, 100) * 0.25;
  score -= Math.min(complaints * 5, 25);
  if (pendingCommission > 0) score -= 5;
  if (totalRequests > 0) score += 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizedPhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function growthRate(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}
