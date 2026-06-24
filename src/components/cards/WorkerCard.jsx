import { Link } from 'react-router-dom';
import { BadgeCheck, BriefcaseBusiness, Repeat, Star, TimerReset } from 'lucide-react';
import { WHATSAPP_REQUEST_URL } from '../support/WhatsAppButton';

export function WorkerCard({ worker }) {
  const initials = worker.display_name?.split(' ').map((part) => part[0]).slice(0, 2).join('');

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-4 border-b border-slate-100 p-4">
        {worker.profile_photo_url ? (
          <img src={worker.profile_photo_url} alt={`${worker.display_name}, ${worker.service_name}`} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xl font-bold text-brand-700">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-950">{worker.display_name}</h3>
          <p className="text-sm text-slate-600">{worker.service_name} | {worker.area_name}</p>
          <p className="mt-1 text-sm text-slate-600">{worker.experience_years || 0}+ years experience</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 pb-0 text-sm">
        <Stat icon={<Star size={16} />} label="Rating" value={worker.rating_avg || 'New'} />
        <Stat icon={<BriefcaseBusiness size={16} />} label="Jobs" value={worker.completed_jobs_count || 0} />
        <Stat icon={<Repeat size={16} />} label="Repeat" value={worker.repeat_customers_count || 0} />
        <Stat icon={<TimerReset size={16} />} label="Reliable" value={`${worker.reliability_score || 80}%`} />
      </div>

      <div className="flex min-h-10 flex-wrap gap-2 px-4 pt-4">
        {(worker.badges || ['CNIC Verified', 'New Worker']).slice(0, 3).map((badge) => (
          <span key={badge} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <BadgeCheck size={13} /> {badge}
          </span>
        ))}
      </div>

      <Link
        to={`/request-service?worker=${encodeURIComponent(worker.id)}&service=${encodeURIComponent(worker.service_name)}`}
        className="mx-4 mt-4 block min-h-11 rounded-lg bg-brand-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-600"
      >
        Request This Worker
      </Link>
      <a
        href={WHATSAPP_REQUEST_URL}
        target="_blank"
        rel="noreferrer"
        className="mx-4 mb-4 mt-3 block min-h-11 py-2 text-center text-sm font-semibold text-[#128C4A] hover:underline"
      >
        Need help choosing? WhatsApp our support team.
      </a>
    </article>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="flex items-center gap-1 text-brand-700">{icon}<span className="text-xs font-semibold">{label}</span></div>
      <div className="mt-1 font-bold text-slate-950">{value}</div>
    </div>
  );
}
