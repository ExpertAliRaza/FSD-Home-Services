import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { areas } from '../../data/catalog';
import {
  markNotificationRead, replaceWorkerDocuments,
  respondToLead, updateNotificationPreferences, updateWorkerPassword, updateWorkerProfile
} from '../../lib/api';
import { validateImage } from '../../lib/validation';
import { VerificationCardPanel } from '../../components/worker/VerificationCard';

export function WorkerHome() {
  const data = useOutletContext();
  const metrics = workerMetrics(data);
  const completion = profileCompletion(data.worker);
  return (
    <WorkerSection title="Dashboard Home" subtitle="Your verification, workload and commission summary.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Verification Status" value={titleCase(data.worker.status)} />
        <Metric label="Profile Completion" value={`${completion}%`} />
        <Metric label="Active Leads" value={metrics.activeLeads} />
        <Metric label="Completed Jobs" value={metrics.completedJobs} />
        <Metric label="Pending Jobs" value={metrics.pendingJobs} />
        <Metric label="Average Rating" value={Number(data.worker.rating_avg || 0).toFixed(1)} />
        <Metric label="Commission Due" value={rupees(metrics.commissionDue)} />
        <Metric label="Total Job Value" value={rupees(metrics.totalJobValue)} />
      </div>
      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-bold">Recent Notifications</h3>
        <NotificationList notifications={data.notifications.slice(0, 5)} />
      </div>
    </WorkerSection>
  );
}

export function WorkerLeads() {
  const data = useOutletContext();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const pending = data.assignments.filter((item) => item.status === 'assigned');
  const act = async (id, response) => {
    setBusy(id);
    setMessage('');
    try {
      await respondToLead(id, response);
      await data.reload();
    } catch (error) {
      setMessage(error.message || 'Could not update this lead.');
    } finally {
      setBusy('');
    }
  };
  return (
    <WorkerSection title="My Leads" subtitle="Review new assignments and respond promptly.">
      <div className="grid gap-4">
        {pending.map((lead) => (
          <LeadCard key={lead.id} assignment={lead}>
            <button disabled={busy === lead.id} onClick={() => act(lead.id, 'accepted')} className="min-h-11 rounded-lg bg-brand-700 px-4 font-bold text-white disabled:opacity-50">Accept Lead</button>
            <button disabled={busy === lead.id} onClick={() => act(lead.id, 'rejected')} className="min-h-11 rounded-lg border border-red-300 px-4 font-bold text-red-700 disabled:opacity-50">Reject Lead</button>
          </LeadCard>
        ))}
        {!pending.length && <Empty>No pending leads.</Empty>}
        {message && <ErrorStatus>{message}</ErrorStatus>}
      </div>
    </WorkerSection>
  );
}

export function WorkerJobs() {
  const { assignments } = useOutletContext();
  const groups = {
    Pending: assignments.filter((item) => item.status === 'assigned'),
    'In Progress': assignments.filter((item) => item.status === 'accepted'),
    Completed: assignments.filter((item) => item.status === 'completed'),
    Cancelled: assignments.filter((item) => ['cancelled', 'rejected'].includes(item.status))
  };
  return (
    <WorkerSection title="My Jobs" subtitle="Track assigned work by status.">
      {Object.entries(groups).map(([label, jobs]) => (
        <div key={label} className="mb-6">
          <h3 className="mb-3 text-lg font-bold">{label} ({jobs.length})</h3>
          <div className="grid gap-3">{jobs.map((job) => <LeadCard key={job.id} assignment={job} />)}{!jobs.length && <Empty>No {label.toLowerCase()} jobs.</Empty>}</div>
        </div>
      ))}
    </WorkerSection>
  );
}

export function WorkerEarnings() {
  const { commissions } = useOutletContext();
  const total = commissions.reduce((sum, item) => sum + Number(item.job_amount || 0), 0);
  const due = commissions.filter((item) => item.payment_status === 'due').reduce((sum, item) => sum + Number(item.commission_amount || 0), 0);
  return (
    <WorkerSection title="Earnings" subtitle="Completed job values and platform commission records.">
      <div className="grid gap-3 sm:grid-cols-2"><Metric label="Total Job Value" value={rupees(total)} /><Metric label="Commission Due" value={rupees(due)} /></div>
      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3">Date</th><th className="p-3">Job Value</th><th className="p-3">Commission</th><th className="p-3">Status</th></tr></thead>
          <tbody>{commissions.map((item) => <tr key={item.id} className="border-t"><td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td><td className="p-3">{rupees(item.job_amount)}</td><td className="p-3">{rupees(item.commission_amount)}</td><td className="p-3 font-bold">{titleCase(item.payment_status)}</td></tr>)}</tbody>
        </table>
        {!commissions.length && <Empty>No commission records yet.</Empty>}
      </div>
    </WorkerSection>
  );
}

export function WorkerReviews() {
  const { reviews, worker } = useOutletContext();
  return (
    <WorkerSection title="Reviews" subtitle={`${reviews.length} review${reviews.length === 1 ? '' : 's'} · Average ${Number(worker.rating_avg || 0).toFixed(1)}`}>
      <div className="grid gap-3">
        {reviews.map((review) => <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-4"><p className="font-bold text-amber-600">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p><p className="mt-2 text-slate-700">{review.review_text}</p><p className="mt-2 text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p></article>)}
        {!reviews.length && <Empty>No reviews yet.</Empty>}
      </div>
    </WorkerSection>
  );
}

export function WorkerNotifications() {
  const data = useOutletContext();
  const read = async (id) => {
    await markNotificationRead(id);
    data.setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
  };
  return (
    <WorkerSection title="Notifications" subtitle="Lead, profile, review and commission updates.">
      <NotificationList notifications={data.notifications} onRead={read} />
    </WorkerSection>
  );
}

export function WorkerProfile() {
  const data = useOutletContext();
  const [form, setForm] = useState({
    bio: data.worker.bio || '',
    experience_years: data.worker.experience_years || 0,
    areas_covered: data.worker.areas_covered || [],
    availability: data.worker.availability || '',
    expected_visit_charges: data.worker.expected_visit_charges || 0
  });
  const [message, setMessage] = useState('');
  const save = async (event) => {
    event.preventDefault();
    try {
      await updateWorkerProfile(form);
      setMessage('Profile updated.');
      await data.reload();
    } catch (error) {
      setMessage(error.message || 'Could not update profile.');
    }
  };
  return (
    <WorkerSection title="Profile" subtitle="Keep your public service information current.">
      <VerificationCardPanel worker={data.worker} />
      <form onSubmit={save} className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <Input label="Bio"><textarea rows="4" maxLength="1000" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Input>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Experience years"><input type="number" min="0" max="80" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} /></Input>
          <Input label="Visit charges"><input type="number" min="0" max="100000" value={form.expected_visit_charges} onChange={(e) => setForm({ ...form, expected_visit_charges: e.target.value })} /></Input>
        </div>
        <Input label="Availability"><input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} /></Input>
        <fieldset><legend className="text-sm font-bold text-slate-700">Areas covered</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{areas.map((area) => <label key={area} className="flex gap-2 text-sm"><input type="checkbox" checked={form.areas_covered.includes(area)} onChange={(e) => setForm({ ...form, areas_covered: e.target.checked ? [...form.areas_covered, area] : form.areas_covered.filter((item) => item !== area) })} />{area}</label>)}</div></fieldset>
        <button className="min-h-11 rounded-lg bg-brand-700 px-4 font-bold text-white">Save Profile</button>
      </form>
      {message && <Status>{message}</Status>}
    </WorkerSection>
  );
}

export function WorkerDocuments() {
  const data = useOutletContext();
  const [message, setMessage] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const files = { cnic_front: form.get('cnic_front'), cnic_back: form.get('cnic_back'), profile_photo: form.get('profile_photo') };
    const errors = [validateImage(files.cnic_front, 'CNIC front', true), validateImage(files.cnic_back, 'CNIC back', true), validateImage(files.profile_photo, 'Profile photo')].filter(Boolean);
    if (errors.length) return setMessage(errors[0]);
    try {
      await replaceWorkerDocuments(files);
      formElement.reset();
      setMessage('Replacement documents submitted for review.');
      await data.reload();
    } catch (error) {
      setMessage(error.message || 'Could not replace documents.');
    }
  };
  const allowed = ['needs_changes', 'rejected', 'pending'].includes(data.worker.status);
  return (
    <WorkerSection title="Documents" subtitle="Private verification files are visible only to you and authorized admins.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Document title="CNIC Front" url={data.worker.cnic_front_signed_url} />
        <Document title="CNIC Back" url={data.worker.cnic_back_signed_url} />
        <Document title="Profile Photo" url={data.worker.profile_photo_signed_url} />
      </div>
      {allowed ? <form onSubmit={submit} className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white p-5"><Input label="Replacement CNIC front"><input name="cnic_front" type="file" accept="image/jpeg,image/png,image/webp" required /></Input><Input label="Replacement CNIC back"><input name="cnic_back" type="file" accept="image/jpeg,image/png,image/webp" required /></Input><Input label="Replacement profile photo (optional)"><input name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp" /></Input><button className="min-h-11 rounded-lg bg-brand-700 px-4 font-bold text-white">Submit Replacements</button></form> : <Status>Document replacement is enabled when admin requests changes.</Status>}
      {message && <Status>{message}</Status>}
    </WorkerSection>
  );
}

export function WorkerSettings() {
  const data = useOutletContext();
  const [preferences, setPreferences] = useState(data.profile.notification_preferences || { in_app: true, email: true });
  const [message, setMessage] = useState('');
  const savePreferences = async () => {
    try {
      await updateNotificationPreferences(preferences);
      setMessage('Notification preferences saved.');
    } catch (error) {
      setMessage(error.message || 'Could not save notification preferences.');
    }
  };
  const password = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const value = new FormData(formElement).get('password');
    try {
      await updateWorkerPassword(value);
      formElement.reset();
      setMessage('Password updated.');
    } catch (error) {
      setMessage(error.message || 'Could not update password.');
    }
  };
  return (
    <WorkerSection title="Settings" subtitle="Security and notification preferences.">
      <div className="grid gap-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5"><h3 className="font-bold">Notifications</h3><label className="mt-3 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={preferences.in_app} onChange={(e) => setPreferences({ ...preferences, in_app: e.target.checked })} />In-app notifications</label><button onClick={savePreferences} className="mt-4 min-h-11 rounded-lg bg-brand-700 px-4 font-bold text-white">Save Preferences</button></div>
        <form onSubmit={password} className="rounded-lg border border-slate-200 bg-white p-5"><h3 className="font-bold">Change Password</h3><input name="password" type="password" minLength="8" autoComplete="new-password" className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 px-3" required /><button className="mt-3 min-h-11 rounded-lg bg-slate-900 px-4 font-bold text-white">Update Password</button></form>
        <div className="rounded-lg border border-slate-200 bg-white p-5"><h3 className="font-bold">Session</h3><p className="mt-1 text-sm text-slate-600">Sign out of this worker account on the current device.</p><button onClick={data.logout} className="mt-3 min-h-11 rounded-lg border border-red-300 px-4 font-bold text-red-700">Logout</button></div>
      </div>
      {message && <Status>{message}</Status>}
    </WorkerSection>
  );
}

function workerMetrics(data) {
  return {
    activeLeads: data.assignments.filter((item) => ['assigned', 'accepted'].includes(item.status)).length,
    completedJobs: data.assignments.filter((item) => item.status === 'completed').length,
    pendingJobs: data.assignments.filter((item) => item.status === 'assigned').length,
    commissionDue: data.commissions.filter((item) => item.payment_status === 'due').reduce((sum, item) => sum + Number(item.commission_amount || 0), 0),
    totalJobValue: data.commissions.reduce((sum, item) => sum + Number(item.job_amount || 0), 0)
  };
}
function profileCompletion(worker) {
  const values = [worker.display_name, worker.phone, worker.cnic_front_url, worker.cnic_back_url, worker.profile_photo_url, worker.service_category_id, worker.experience_years !== null, worker.areas_covered?.length, worker.availability, worker.expected_visit_charges !== null, worker.bio];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}
function LeadCard({ assignment, children }) {
  const request = assignment.service_requests || {};
  return <article className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{request.service_categories?.name || request.service_category_id} in {request.areas?.name || request.area_id}</h3><span className="text-sm font-bold text-brand-700">{titleCase(assignment.status)}</span></div><p className="mt-2 text-sm text-slate-600">Customer: {request.customer_name} · {request.customer_phone}</p><p className="mt-2 text-slate-700">{request.problem_description}</p><p className="mt-2 text-sm text-slate-500">Urgency: {request.urgency}{request.preferred_time ? ` · Preferred: ${request.preferred_time}` : ''}</p>{children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}</article>;
}
function NotificationList({ notifications, onRead }) {
  return <div className="mt-3 grid gap-2">{notifications.map((item) => <button key={item.id} onClick={() => onRead?.(item.id)} className={`rounded-lg border p-3 text-left ${item.is_read ? 'bg-white' : 'border-brand-200 bg-brand-50'}`}><strong className="text-sm">{item.title}</strong><p className="mt-1 text-sm text-slate-600">{item.message}</p></button>)}{!notifications.length && <Empty>No notifications yet.</Empty>}</div>;
}
function WorkerSection({ title, subtitle, children }) { return <div><h2 className="text-2xl font-bold text-slate-950">{title}</h2><p className="mt-1 text-slate-600">{subtitle}</p><div className="mt-5">{children}</div></div>; }
function Metric({ label, value }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-brand-700">{value}</p></div>; }
function Empty({ children }) { return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">{children}</p>; }
function Status({ children }) { return <p className="mt-4 rounded-lg bg-brand-50 p-3 text-sm font-semibold text-brand-800">{children}</p>; }
function ErrorStatus({ children }) { return <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{children}</p>; }
function Input({ label, children }) { return <label className="grid gap-1.5 text-sm font-bold text-slate-700">{label}<span className="[&>*]:min-h-11 [&>*]:w-full [&>*]:rounded-lg [&>*]:border [&>*]:border-slate-300 [&>*]:px-3 [&>textarea]:py-2">{children}</span></label>; }
function Document({ title, url }) { return <a href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 bg-white p-3"><img src={url} alt={title} className="aspect-[4/3] w-full rounded-lg object-cover" /><p className="mt-2 text-sm font-bold">{title}</p></a>; }
function titleCase(value) { return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function rupees(value) { return `Rs ${Number(value || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`; }
