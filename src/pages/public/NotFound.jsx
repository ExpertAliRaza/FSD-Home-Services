import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-sm font-bold text-brand-700">404</p>
      <h1 className="mt-2 text-4xl font-bold text-slate-950">This page could not be found</h1>
      <p className="mt-4 text-lg text-slate-600">Return home or submit a request for a verified worker in Faisalabad.</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/" className="min-h-11 rounded-lg bg-brand-700 px-5 py-3 font-bold text-white">Back to Home</Link>
        <Link to="/request-service" className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900">Request a Worker</Link>
      </div>
    </section>
  );
}
