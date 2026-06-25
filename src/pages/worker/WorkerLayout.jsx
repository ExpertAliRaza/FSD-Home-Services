import { useCallback, useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell, BriefcaseBusiness, CircleDollarSign, FileCheck2, Home, LogOut,
  Settings, Star, UserRound, Wrench
} from 'lucide-react';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { getCurrentUserRole, getWorkerDashboardData, signOut } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

const links = [
  ['/worker', 'Dashboard', Home, true],
  ['/worker/leads', 'My Leads', BriefcaseBusiness],
  ['/worker/jobs', 'My Jobs', Wrench],
  ['/worker/earnings', 'Earnings', CircleDollarSign],
  ['/worker/reviews', 'Reviews', Star],
  ['/worker/notifications', 'Notifications', Bell],
  ['/worker/profile', 'Profile', UserRound],
  ['/worker/documents', 'Documents', FileCheck2],
  ['/worker/settings', 'Settings', Settings]
];

export function WorkerLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, role: null, data: null, error: '' });

  const load = useCallback(async () => {
    try {
      const role = await getCurrentUserRole();
      if (role !== 'worker') {
        setState({ loading: false, role, data: null, error: '' });
        return;
      }
      const data = await getWorkerDashboardData();
      setState({ loading: false, role, data, error: '' });
    } catch (error) {
      setState({ loading: false, role: null, data: null, error: error.message || 'Could not load worker dashboard.' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') navigate('/worker/login', { replace: true });
    }).data.subscription;
    return () => subscription.unsubscribe();
  }, [navigate]);

  const setNotifications = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: current.data
        ? { ...current.data, notifications: typeof updater === 'function' ? updater(current.data.notifications) : updater }
        : current.data
    }));
  }, []);

  const logout = async () => {
    await signOut();
    navigate('/worker/login', { replace: true });
  };

  if (state.loading) return <WorkerMessage>Loading worker dashboard...</WorkerMessage>;
  if (state.role !== 'worker') return <Navigate to="/worker/login" replace />;
  if (!state.data) return <WorkerMessage error>{state.error}</WorkerMessage>;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand-700">Worker Dashboard</p>
          <h1 className="truncate text-2xl font-bold text-slate-950">{state.data.worker.display_name}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Profile status: <span className="capitalize text-slate-900">{state.data.worker.status.replace('_', ' ')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={state.data.notifications}
            onChange={setNotifications}
            resolveLink={(notification) => workerNotificationLink(notification)}
          />
          <button onClick={logout} aria-label="Logout" className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50">
            <LogOut size={19} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:content-start lg:overflow-visible lg:pb-0">
          {links.map(([to, label, Icon, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold ${
                isActive ? 'bg-brand-700 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0">
          <Outlet context={{ ...state.data, reload: load, setNotifications, logout }} />
        </main>
      </div>
    </section>
  );
}

function WorkerMessage({ children, error = false }) {
  return <p className={`mx-auto my-12 max-w-xl rounded-lg p-5 font-semibold ${error ? 'bg-red-50 text-red-700' : 'bg-white text-slate-600'}`}>{children}</p>;
}

function workerNotificationLink(notification) {
  if (['new_lead_assigned', 'lead_cancelled'].includes(notification.type)) return '/worker/leads';
  if (notification.type === 'new_review') return '/worker/reviews';
  if (notification.type === 'commission_due') return '/worker/earnings';
  if (notification.type.startsWith('profile_')) return '/worker/profile';
  return '/worker/notifications';
}
