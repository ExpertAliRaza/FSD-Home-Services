import { BadgeCheck, ClipboardList, Star, UserCheck } from 'lucide-react';

const stats = [
  { icon: <UserCheck size={20} />, value: '47+', label: 'Verified Workers' },
  { icon: <BadgeCheck size={20} />, value: '132', label: 'Completed Jobs' },
  { icon: <ClipboardList size={20} />, value: '148+', label: 'Service Requested' },
  {
    icon: <Star size={20} className="fill-current" />,
    value: (
      <span className="inline-flex items-baseline gap-1.5">
        4.8
        <Star aria-hidden="true" className="h-[0.85em] w-[0.85em] fill-current text-brand-500" />
      </span>
    ),
    label: 'Google Rating'
  }
];

export function StatsBar() {
  return (
    <section className="border-b border-slate-200 bg-white" aria-label="FSD Home Services statistics">
      <div className="mx-auto max-w-7xl px-4 py-7 lg:py-9">
        <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x lg:divide-slate-200">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center text-brand-700">{stat.icon}</div>
              <div className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
