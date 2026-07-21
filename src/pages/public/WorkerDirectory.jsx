import { useEffect, useMemo, useState } from 'react';
import { LogIn, Search, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkerCard } from '../../components/cards/WorkerCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { getPublicWorkers } from '../../lib/api';
import { services } from '../../data/catalog';

const SERVICE_OPTIONS = [
  'All',
  ...services.map((service) => service.name)
];

export function WorkerDirectory() {
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [service, setService] = useState('All');

  useEffect(() => {
    getPublicWorkers()
      .then(setWorkers)
      .catch((err) => setError(err.message || 'Could not load workers.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        keyword === '' ||
        (worker.display_name || '').toLowerCase().includes(keyword) ||
        (worker.service_name || '').toLowerCase().includes(keyword) ||
        (worker.area_name || '').toLowerCase().includes(keyword);

      const matchesService =
        service === 'All' ||
        (worker.service_name || '').toLowerCase() === service.toLowerCase();

      return matchesSearch && matchesService;
    });
  }, [workers, search, service]);

  const clearFilters = () => {
    setSearch('');
    setService('All');
  };

  return (
    <>
      <PageHeader eyebrow="Approved workers only" title="Worker Directory">
        Browse public cards for approved workers. Phone numbers, CNIC, customer details, and admin notes are never shown here.
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-1 flex-col gap-3 md:flex-row">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search by worker, service or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-brand-700"
              />
            </div>

            <div className="relative w-full md:w-64">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-brand-700"
              >
                {SERVICE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {(search || service !== 'All') && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          <Link
            to="/worker/login"
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-700 bg-white px-4 font-bold text-brand-800 hover:bg-brand-50"
          >
            <LogIn size={18} />
            Worker Login
          </Link>
        </div>

        {!loading && !error && (
          <div className="mb-5 text-sm font-medium text-slate-600">
            Showing <span className="font-bold">{filteredWorkers.length}</span> of{' '}
            <span className="font-bold">{workers.length}</span> workers
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {loading && (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">
            Loading approved workers...
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>

        {!loading && !error && filteredWorkers.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-slate-600">
            No workers found matching your search.
          </p>
        )}
      </section>
    </>
  );
}