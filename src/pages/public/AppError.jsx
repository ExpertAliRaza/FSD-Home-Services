import { Link, useRouteError } from 'react-router-dom';

export function AppError() {
  const error = useRouteError();
  const errorMessage = error?.message || error?.statusText || String(error);
  const errorStack = error?.stack || '';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-ink">
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-brand-700">FSD Home Services</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Page could not load</h1>
        
        <div className="mt-6 mb-8 text-left bg-red-50 p-4 rounded text-sm text-red-900 overflow-auto max-h-64">
          <p className="font-bold">{errorMessage}</p>
          <pre className="mt-2 text-xs font-mono">{errorStack}</pre>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/" className="focus-ring rounded-lg bg-brand-700 px-4 py-3 font-bold text-white hover:bg-brand-600">
            Go Home
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="focus-ring rounded-lg border border-slate-300 bg-white px-4 py-3 font-bold hover:bg-slate-50"
          >
            Reload
          </button>
        </div>
      </section>
    </main>
  );
}
