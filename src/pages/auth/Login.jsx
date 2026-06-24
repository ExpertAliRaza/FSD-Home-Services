import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, inputClass } from '../../components/forms/Field';
import { PageHeader } from '../../components/layout/PageHeader';
import { hasSupabaseConfig, supabase } from '../../lib/supabaseClient';
import { getCurrentUserRole } from '../../lib/api';

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!hasSupabaseConfig) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable login.');
      setLoading(false);
      return;
    }

    const data = new FormData(event.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.get('email'),
      password: data.get('password')
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }
    try {
      const role = await getCurrentUserRole();
      if (role !== 'admin') {
        await supabase.auth.signOut();
        setError('This account does not have admin access.');
        setLoading(false);
        return;
      }
    } catch (roleError) {
      setError(roleError.message || 'Could not verify admin access.');
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate('/admin', { replace: true });
  };

  return (
    <>
      <PageHeader eyebrow="Secure access" title="Admin login">
        Sign in with an approved admin account to manage private worker and customer information.
      </PageHeader>
      <section className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <Field label="Email">
            <input className={inputClass} name="email" type="email" required />
          </Field>
          <Field label="Password">
            <input className={inputClass} name="password" type="password" required />
          </Field>
          {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p>}
          <button className="rounded-lg bg-brand-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </>
  );
}
