import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  X
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { services } from '../../data/catalog';
import { WHATSAPP_URL } from '../../components/support/WhatsAppButton';

const categories = [
  'All',
  'Home Repair',
  'Electrical',
  'Construction',
  'Security',
  'Solar',
  'Moving'
];

const serviceCategoryMap = {
  'Plumber': 'Home Repair',
  'Electrician': 'Electrical',
  'AC Technician': 'Home Repair',
  'Carpenter': 'Construction',
  'Painter': 'Construction',
  'Mason': 'Construction',
  'Labor': 'Moving',
  'CCTV Technician': 'Security',
  'Solar Technician': 'Solar'
};

const faqItems = [
  {
    q: 'How does FSD Home Services work?',
    a: 'Choose a service, submit a request describing your problem, and our admin team will review it and assign a suitable verified worker who will contact you directly.'
  },
  {
    q: 'Are all workers verified?',
    a: 'Yes. Every worker on our platform goes through a manual review process that includes identity verification before being approved and listed.'
  },
  {
    q: 'Can I request emergency services?',
    a: 'Yes. When submitting a request you can select the Emergency option and our team will prioritise your case.'
  },
  {
    q: 'Which areas of Faisalabad do you cover?',
    a: 'We provide services across all major residential and commercial areas of Faisalabad including Madina Town, D Ground, Peoples Colony, Wapda City, Susan Road, Satiana Road, Canal Road, G.M. Abad, Gulberg and many more.'
  },
  {
    q: 'Is customer signup required?',
    a: 'No. Customers can submit a service request without creating an account. Just fill in your name, phone number, area and a brief description of the problem.'
  }
];

export function Services() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openFaq, setOpenFaq] = useState(null);

  const filtered = useMemo(() => {
    let result = services;
    if (activeCategory !== 'All') {
      result = result.filter((s) => serviceCategoryMap[s.name] === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, search]);

  return (
    <>
      {/* ── Hero ── */}
      <PageHeader eyebrow="Services" title="Verified home services across Faisalabad">
        Select a category, choose your area, and our admin team will assign an approved worker.
      </PageHeader>

      {/* ── Trust badges + buttons ── */}
      <section className="-mt-4 border-b border-slate-200 bg-white pb-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-brand-700" /> 9 Verified Home Services</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-brand-700" /> 130+ Areas Covered</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={16} className="text-brand-700" /> Admin Assigned Workers</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-brand-700" /> No Customer Signup Required</span>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-600"
            >
              Request a Service <ArrowRight size={18} />
            </Link>
            <Link
              to="/workers"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 hover:border-brand-500 hover:text-brand-700"
            >
              View Approved Workers <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Search + Filters ── */}
      <section className="border-b border-slate-100 bg-white pb-6 pt-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-700">{filtered.length} Verified Services Available</p>
            <p className="mt-1 text-slate-600">Choose the service you need and submit your request.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-slate-500">No services match your search. Try a different keyword.</p>
          )}
          {filtered.map((service) => (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-brand-500 hover:shadow-soft"
            >
              <div className="relative overflow-hidden">
                <img
                  src={service.image}
                  alt={`${service.name} working in a Faisalabad home`}
                  className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-brand-700/90 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                  VERIFIED
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-slate-950">{service.name} Faisalabad</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-700">
                  <MapPin size={12} /> Available across Faisalabad
                </p>
                <div className="mt-4 grid gap-1.5">
                  {['Verified Worker', 'Admin Assigned', 'Fast Response'].map((item) => (
                    <span key={item} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CheckCircle2 size={12} className="text-brand-700" /> {item}
                    </span>
                  ))}
                </div>
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm font-bold text-brand-700">
                  Request {service.name} <ArrowRight size={14} className="inline" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why Choose FSD Home Services ── */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why choose us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Choose FSD Home Services?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <ShieldCheck size={22} />, title: 'Verified Workers', desc: 'Every worker is manually reviewed before approval.' },
              { icon: <CheckCircle2 size={22} />, title: 'Privacy Protected', desc: 'Your phone number is never publicly listed.' },
              { icon: <ArrowRight size={22} />, title: 'Quick Assignment', desc: 'Our admin team connects you with the right worker.' },
              { icon: <MapPin size={22} />, title: 'Wide Coverage', desc: 'Serving 130+ areas across Faisalabad.' },
              { icon: <ShieldCheck size={22} />, title: 'Trusted Platform', desc: 'Reliable local professionals for everyday home services.' },
              { icon: <MessageCircle size={22} />, title: 'Responsive Support', desc: 'Contact us anytime through WhatsApp or phone.' }
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Process</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How It Works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { step: 1, title: 'Choose Service', desc: 'Browse our services and select the one you need.' },
              { step: 2, title: 'Submit Request', desc: 'Tell us about your problem and our team will review it.' },
              { step: 3, title: 'Verified Worker Assigned', desc: 'We assign a suitable verified worker who contacts you directly.' }
            ].map((item) => (
              <div key={item.step} className="relative text-center">
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

      {/* ── FAQ ── */}
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

      {/* ── Final CTA ── */}
      <section className="bg-brand-700 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Can't Decide Which Service You Need?</h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">
            Tell us about your problem and we'll help you find the right verified worker anywhere in Faisalabad.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-brand-700 shadow-sm hover:bg-brand-50"
            >
              Request a Service <ArrowRight size={18} />
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