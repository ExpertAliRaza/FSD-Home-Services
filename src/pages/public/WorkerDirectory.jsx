import { useEffect, useState } from 'react';
import { WorkerCard } from '../../components/cards/WorkerCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { getPublicWorkers } from '../../lib/api';

export function WorkerDirectory() {
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicWorkers()
      .then(setWorkers)
      .catch((err) => setError(err.message || 'Could not load workers.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Approved workers only" title="Worker Directory">
        Browse public cards for approved workers. Phone numbers, CNIC, customer details, and admin notes are never shown here.
      </PageHeader>
      <section className="mx-auto max-w-7xl px-4 py-8">
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        {loading && <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">Loading approved workers...</p>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => <WorkerCard key={worker.id} worker={worker} />)}
        </div>
        {!loading && !error && !workers.length && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-slate-600">
            No approved workers are available yet.
          </p>
        )}
      </section>
    </>
  );
}
