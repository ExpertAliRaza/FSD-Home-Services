import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  LogIn,
  Lock,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  UserCheck,
  Zap,
  Filter,
  X
} from 'lucide-react';
import { WorkerCard } from '../../components/cards/WorkerCard';
import { PageHeader } from '../../components/layout/PageHeader';
import { getPublicWorkers } from '../../lib/api';
import { areas, services } from '../../data/catalog';
import { WHATSAPP_URL } from '../../components/support/WhatsAppButton';

const SERVICE_OPTIONS = [
  'All',
  ...services.map((service) => service.name)
];

const faqItems = [
  {
    q: 'How are workers verified?',
    a: 'Every worker goes through a manual review process that includes identity verification before being approved and listed on the platform. This helps maintain service quality.'
  },
  {
    q: 'Can I contact workers directly?',
    a: 'Once a verified worker is assigned to your request, they will contact you directly using the phone number you provided. You can discuss the details and schedule the visit.'
  },
  {
    q: 'How do I request a specific worker?',
    a: 'When submitting a service request, you can specify a preferred worker. Our admin team will check their availability and assign them if possible.'
  },
  {
    q: 'Are worker phone numbers public?',
    a: 'No. Worker phone numbers are never publicly displayed on the platform. All communication is coordinated through the request process.'
  },
  {
    q: 'Which areas of Faisalabad are covered?',
    a: 'We provide services across all major residential and commercial areas of Faisalabad including Madina Town, D Ground, Peoples Colony, Wapda City, Susan Road, Satiana Road, Canal Road, G.M. Abad, Gulberg and many more.'
  },
  {
    q: 'What if my selected worker is unavailable?',
    a: 'If your preferred worker is unavailable, our admin team will assign a suitable verified worker based on your location and service requirements.'
  },
  {
    q: 'Is there any booking fee?',
    a: 'No. Submitting a service request is completely free. There are no booking fees or hidden charges for requesting a worker through our platform.'
  },
  {
    q: 'Can I request more than one service?',
    a: 'Yes. You can submit separate requests for different services. Each request is reviewed and assigned to the appropriate verified worker.'
  }
];

export function WorkerDirectory() {
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

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
      {/* ── Hero ── */}
      <PageHeader eyebrow="Approved workers only" title="Worker Directory">
        Browse public cards for approved workers. Phone numbers, CNIC, customer details, and admin notes are never shown here.
      </PageHeader>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Stats Bar
         ══════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200 bg-white pb-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-950">{workers.length}+ Verified Workers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-950">{services.length} Professional Services</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-950">{areas.length}+ Areas Across Faisalabad</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-950">Admin Approved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & Filter + Worker Cards (unchanged) ── */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by worker, service or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-brand-700"
              />
            </div>
            <div className="relative w-full md:w-64">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-brand-700"
              >
                {SERVICE_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            {(search || service !== 'All') && (
              <button onClick={clearFilters} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50">
                <X size={16} /> Clear
              </button>
            )}
          </div>
          <Link to="/worker/login" className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-700 bg-white px-4 font-bold text-brand-800 hover:bg-brand-50">
            <LogIn size={18} /> Worker Login
          </Link>
        </div>

        {!loading && !error && (
          <div className="mb-5 text-sm font-medium text-slate-600">
            Showing <span className="font-bold">{filteredWorkers.length}</span> of{' '}
            <span className="font-bold">{workers.length}</span> workers
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
        )}

        {loading && (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">Loading approved workers...</p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>

        {!loading && !error && filteredWorkers.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-slate-600">No workers found matching your search.</p>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — How to Hire a Verified Worker
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">How to hire</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How to Hire a Verified Worker</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Finding a trusted professional is simple with our verified worker directory.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { step: 1, title: 'Browse Workers', desc: 'Search by service, worker name or area.' },
              { step: 2, title: 'View Profile', desc: 'Check experience, service category and profile information.' },
              { step: 3, title: 'Submit a Request', desc: 'Request your preferred worker or submit a general service request.' },
              { step: 4, title: 'Get Connected', desc: 'Our admin team coordinates with the worker and helps complete your request.' }
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 3 && (
                  <div className="absolute left-1/2 top-11 hidden h-px w-[calc(100%-3rem)] bg-slate-200 md:block" />
                )}
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Search size={22} />
                </div>
                <div className="mx-auto mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — Why Our Workers Are Verified
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why trust us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Homeowners Trust Our Workers</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Every public profile goes through a verification process before appearing in our directory.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <ShieldCheck size={22} />, title: 'Admin Verified Profiles', desc: 'Every worker is reviewed before approval.' },
              { icon: <MapPin size={22} />, title: 'Genuine Local Professionals', desc: 'Workers serve customers across Faisalabad.' },
              { icon: <UserCheck size={22} />, title: 'Experience Displayed', desc: 'See years of experience before requesting.' },
              { icon: <Lock size={22} />, title: 'Customer Privacy', desc: 'Private contact information is protected.' },
              { icon: <CheckCircle2 size={22} />, title: 'Trusted Platform', desc: 'No random or unverified listings.' },
              { icon: <ClipboardList size={22} />, title: 'Fair Assignment Process', desc: 'Customer requests are handled professionally by our admin team.' }
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-soft">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — FAQ
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-bold text-brand-700">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Frequently Asked Questions</h2>
            <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {faqItems.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900 transition hover:bg-slate-50 md:px-6 md:py-5"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-slate-400 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
                      <p className="px-5 pb-5 text-slate-600 md:px-6 md:pb-6">{faq.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — Final CTA
         ══════════════════════════════════════════════════════ */}
      <section className="bg-brand-700 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Need Help Finding the Right Worker?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Whether you need a plumber, electrician, AC technician, carpenter, painter, mason, CCTV technician, solar technician or general labor, our admin team will help you connect with a trusted verified professional anywhere in Faisalabad.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-brand-700 shadow-sm hover:bg-brand-50"
            >
              Request a Worker <ArrowRight size={18} />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-transparent px-6 py-3 font-bold text-white hover:border-white hover:bg-white/10"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}