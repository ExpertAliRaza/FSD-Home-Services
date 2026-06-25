import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, inputClass } from '../../components/forms/Field';
import { PageHeader } from '../../components/layout/PageHeader';
import { getCurrentUserRole } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

export function WorkerLogin() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: false, error: '' });

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: '' });
    const form = new FormData(event.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.get('email'),
        password: form.get('password')
      });
      if (error) throw error;
      const role = await getCurrentUserRole();
      if (role !== 'worker') {
        await supabase.auth.signOut();
        throw new Error('This account is not a worker account.');
      }
      navigate('/worker', { replace: true });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Could not sign in.' });
    }
  };

  return (
    <>
      <PageHeader eyebrow="Worker access" title="Worker login">
        View assigned leads, jobs, commission, reviews, documents and profile status.
      </PageHeader>
      <section className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <Field label="Email"><input className={inputClass} name="email" type="email" autoComplete="email" required /></Field>
          <Field label="Password"><input className={inputClass} name="password" type="password" autoComplete="current-password" required /></Field>
          {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{state.error}</p>}
          <button disabled={state.loading} className="min-h-11 rounded-lg bg-brand-700 px-4 font-bold text-white disabled:opacity-60">
            {state.loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </>
  );
}
