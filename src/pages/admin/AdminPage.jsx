import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminPanel } from '../../components/dashboard/AdminPanel';
import { ChatWidget } from '../../components/dashboard/ChatWidget';
import { getCurrentUserRole } from '../../lib/api';
import { hasSupabaseConfig, supabase } from '../../lib/supabaseClient';

export function AdminPage() {
  const [state, setState] = useState({ loading: true, role: null, error: '' });

  useEffect(() => {
    let active = true;
    getCurrentUserRole()
      .then((role) => active && setState({ loading: false, role, error: '' }))
      .catch((error) => active && setState({ loading: false, role: null, error: error.message }));

    const authSubscription = hasSupabaseConfig
      ? supabase.auth.onAuthStateChange((event, session) => {
        if (!session || event === 'SIGNED_OUT') {
          setState({ loading: false, role: null, error: 'Your session has expired. Please sign in again.' });
        }
      }).data.subscription
      : null;

    return () => {
      active = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  if (state.loading) {
    return <AccessMessage title="Checking admin access..." />;
  }

  if (state.role !== 'admin') {
    return <Navigate to="/login" replace state={{ message: state.error || 'Admin access is required.' }} />;
  }

  return (
    <>
      <AdminPanel />
      <ChatWidget />
    </>
  );
}

function AccessMessage({ title, children }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        {children}
      </div>
    </section>
  );
}
