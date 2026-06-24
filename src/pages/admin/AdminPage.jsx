import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPanel } from '../../components/dashboard/AdminPanel';
import { getCurrentUserRole } from '../../lib/api';

export function AdminPage() {
  const [state, setState] = useState({ loading: true, role: null, error: '' });

  useEffect(() => {
    getCurrentUserRole()
      .then((role) => setState({ loading: false, role, error: '' }))
      .catch((error) => setState({ loading: false, role: null, error: error.message }));
  }, []);

  if (state.loading) {
    return <AccessMessage title="Checking admin access..." />;
  }

  if (state.role !== 'admin') {
    return (
      <AccessMessage title="Admin access required">
        <p className="mt-2 text-slate-600">{state.error || 'Sign in with an account whose profiles.role is admin.'}</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 font-bold text-white">Go to Admin Login</Link>
      </AccessMessage>
    );
  }

  return <AdminPanel />;
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
