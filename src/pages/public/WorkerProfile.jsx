import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MessageCircle, Star } from 'lucide-react';
import { PublicVerificationBadge, formatWorkerId } from '../../components/worker/VerificationCard';
import { WHATSAPP_REQUEST_URL } from '../../components/support/WhatsAppButton';
import { getPublicWorkerProfile } from '../../lib/api';

export function WorkerProfile() {
  const { workerId } = useParams();
  const [state, setState] = useState({ loading: true, worker: null, reviews: [], error: '' });

  useEffect(() => {
    setState({ loading: true, worker: null, reviews: [], error: '' });
    getPublicWorkerProfile(workerId)
      .then((data) => setState({ loading: false, error: '', ...data }))
      .catch((error) => setState({ loading: false, worker: null, reviews: [], error: error.message || 'Worker profile is unavailable.' }));
  }, [workerId]);

  if (state.loading) {
    return <ProfileShell><p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">Loading worker profile...</p></ProfileShell>;
  }

  if (state.error || !state.worker) {
    return (
      <ProfileShell>
        <div className="rounded-lg border border-red-100 bg-red-50 p-5">
          <p className="font-bold text-red-700">{state.error || 'Worker profile was not found.'}</p>
          <Link to="/workers" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-white px-4 font-bold text-red-700 hover:bg-red-100">Back to workers</Link>
        </div>
      </ProfileShell>
    );
  }

  const worker = state.worker;
  const initials = worker.display_name?.split(' ').map((part) => part[0]).slice(0, 2).join('');
  const rating = Number(worker.rating_avg || 0);

  return (
    <ProfileShell>
      <Link to="/workers" className="mb-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-brand-700 hover:underline">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to workers
      </Link>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="bg-brand-700 px-5 py-6 text-white sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {worker.profile_photo_url ? (
              <img src={worker.profile_photo_url} alt={worker.display_name} className="h-28 w-28 rounded-lg border-4 border-white/25 object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-lg border-4 border-white/25 bg-white/15 text-3xl font-black">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase">
                <BadgeCheck size={14} aria-hidden="true" />
                Verified Professional
              </p>
              <h1 className="break-words text-3xl font-black sm:text-4xl">{worker.display_name}</h1>
              <p className="mt-2 text-brand-50">{worker.service_name} in {worker.area_name || 'Faisalabad'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_18rem] lg:p-6">
          <div className="min-w-0">
            <PublicVerificationBadge worker={worker} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info label="Worker ID" value={formatWorkerId(worker.id)} />
              <Info label="Experience" value={`${worker.experience_years || 0}+ years`} />
              <Info label="Rating" value={worker.review_count ? `${rating.toFixed(1)} / 5 (${worker.review_count} reviews)` : 'No reviews yet'} />
              <Info label="Member since" value={formatDate(worker.created_at)} />
              <Info label="Availability" value={worker.availability || 'Contact support'} />
              <Info label="Visit charges" value={worker.expected_visit_charges ? `Rs ${Number(worker.expected_visit_charges).toLocaleString('en-PK')}` : 'Confirm with support'} />
            </div>

            {worker.bio && (
              <section className="mt-6">
                <h2 className="text-lg font-bold text-slate-950">About</h2>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{worker.bio}</p>
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-lg font-bold text-slate-950">Areas Covered</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(worker.areas_covered?.length ? worker.areas_covered : ['Faisalabad']).map((area) => (
                  <span key={area} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">{area}</span>
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="font-bold text-slate-950">Request this worker</h2>
            <p className="mt-2 text-sm text-slate-600">Submit a request and our admin team will confirm availability.</p>
            <Link
              to={`/request-service?worker=${encodeURIComponent(worker.id)}&service=${encodeURIComponent(worker.service_name)}`}
              className="mt-4 block min-h-11 rounded-lg bg-brand-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-600"
            >
              Request This Worker
            </Link>
            <a
              href={WHATSAPP_REQUEST_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-[#128C4A] hover:bg-slate-50"
            >
              <MessageCircle size={17} aria-hidden="true" />
              WhatsApp Support
            </a>
          </aside>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Star size={19} className="text-amber-500" aria-hidden="true" />
          <h2 className="text-xl font-bold text-slate-950">Customer Reviews</h2>
        </div>
        {state.reviews.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {state.reviews.map((review) => (
              <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-bold text-amber-600">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                <p className="mt-2 text-slate-700">{review.review_text}</p>
                <p className="mt-3 text-xs font-semibold text-slate-500">{formatDate(review.created_at)}</p>
              </article>
            ))}
          </div>
        ) : (
          <Empty>No customer reviews yet.</Empty>
        )}
      </section>
    </ProfileShell>
  );
}

function ProfileShell({ children }) {
  return <section className="mx-auto max-w-7xl px-4 py-8">{children}</section>;
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Empty({ children }) {
  return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">{children}</p>;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}
