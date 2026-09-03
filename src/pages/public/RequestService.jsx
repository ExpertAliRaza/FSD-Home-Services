import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Zap
} from 'lucide-react';
import { RequestForm } from '../../components/forms/RequestForm';
import { PageHeader } from '../../components/layout/PageHeader';
import { WhatsAppButton, WHATSAPP_URL } from '../../components/support/WhatsAppButton';
import { areas } from '../../data/catalog';
import { useCatalog } from '../../contexts/CatalogContext';

const faqItems = [
  {
    q: 'How long does it take to assign a worker?',
    a: 'Our admin team reviews requests during working hours and assigns a suitable verified worker as quickly as possible. The assigned worker then contacts you directly to schedule the visit.'
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Customers can submit a service request without creating an account. Just fill in your name, phone number, area and a brief description of the problem.'
  },
  {
    q: 'Is submitting a request free?',
    a: 'Yes. Submitting a service request is completely free. There are no charges to submit a request or receive a response from a verified worker.'
  },
  {
    q: 'Will my phone number remain private?',
    a: 'Yes. Your phone number is never publicly listed on the platform. It is only shared with the verified worker assigned to your request so they can contact you directly.'
  },
  {
    q: 'Can I request emergency service?',
    a: 'Yes. When submitting a request you can select the Emergency option and our team will prioritise your case for urgent situations.'
  },
  {
    q: 'Which areas of Faisalabad do you cover?',
    a: 'We provide services across all major residential and commercial areas of Faisalabad including Madina Town, D Ground, Peoples Colony, Wapda City, Susan Road, Satiana Road, Canal Road, G.M. Abad, Gulberg and many more.'
  },
  {
    q: 'Can I upload photos of the problem?',
    a: 'Yes. The request form includes an optional photo upload field where you can attach images of the issue to help the worker understand the problem before visiting.'
  },
  {
    q: 'How do you verify workers?',
    a: 'Every worker goes through a manual review process that includes identity verification before being approved and listed on the platform. This helps maintain service quality.'
  }
];

export function RequestService() {
  const { services } = useCatalog();

  const [params] = useSearchParams();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      {/* ── Hero ── */}
      <PageHeader eyebrow="Free customer request" title="Request a verified worker">
        Need a trusted plumber, electrician, AC technician, carpenter, painter, mason, CCTV technician, solar technician or skilled worker in Faisalabad? Submit a free request and our admin team will connect you with a verified professional for your required service.
      </PageHeader>

      {/* ── WhatsApp Banner + Request Form ── */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-5 flex flex-col gap-4 rounded-lg border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-brand-950">Not sure which worker you need? WhatsApp us and our team will guide you.</p>
          <WhatsAppButton prefilled className="shrink-0">Ask on WhatsApp</WhatsAppButton>
        </div>
        <RequestForm preferredWorkerId={params.get('worker')} initialService={params.get('service')} />
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Why Choose FSD Home Services
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why choose us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Request Through FSD Home Services?</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Every customer request is manually reviewed before being assigned to a verified local worker.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <ShieldCheck size={22} />, title: 'Verified Workers', desc: 'Every worker is reviewed before approval.' },
              { icon: <Zap size={22} />, title: 'Fast Assignment', desc: 'We quickly connect you with the right professional.' },
              { icon: <Lock size={22} />, title: 'Private Contact Information', desc: 'Your phone number remains protected throughout the process.' },
              { icon: <MapPin size={22} />, title: 'Trusted Local Platform', desc: 'Serving homeowners across Faisalabad.' },
              { icon: <ClipboardList size={22} />, title: 'Multiple Services', desc: 'Request plumbers, electricians, AC technicians, painters, carpenters, masons, CCTV and solar technicians.' },
              { icon: <CheckCircle2 size={22} />, title: 'Free Request Submission', desc: 'Submit your request without any registration fee.' }
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
          SECTION 3 — How Request Assignment Works
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Process</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How It Works</h2>
          <div className="mx-auto mt-10 grid max-w-2xl gap-0">
            {[
              { step: 1, title: 'Submit Your Request', desc: 'Choose your required service, area and describe your problem.' },
              { step: 2, title: 'Admin Reviews Request', desc: 'Our team checks availability and matches the right worker.' },
              { step: 3, title: 'Verified Worker Assigned', desc: 'An approved professional is selected for your request.' },
              { step: 4, title: 'Worker Contacts You', desc: 'The assigned worker contacts you and completes the job.' }
            ].map((item, index) => (
              <div key={item.step} className="relative flex gap-5 pb-8 last:pb-0">
                {index < 3 && (
                  <div className="absolute left-[11px] top-8 h-full w-px bg-slate-200" />
                )}
                <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                  {item.step}
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — Why Customers Trust Us
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why trust us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Homeowners Trust Our Platform</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <ShieldCheck size={22} />, title: 'Verified Professionals', desc: 'Every worker is manually reviewed before approval.' },
              { icon: <UserCheck size={22} />, title: 'Manual Worker Approval', desc: 'Applications are reviewed by our admin team.' },
              { icon: <Lock size={22} />, title: 'No Random Listings', desc: 'Phone numbers are never publicly displayed.' },
              { icon: <MapPin size={22} />, title: 'Coverage Across Faisalabad', desc: 'Serving 130+ areas across the city.' },
              { icon: <MessageCircle size={22} />, title: 'Quick Customer Support', desc: 'Reach us anytime through WhatsApp or phone.' },
              { icon: <ClipboardList size={22} />, title: 'Transparent Process', desc: 'Every request is handled by our admin team.' },
              { icon: <CheckCircle2 size={22} />, title: 'Customer Privacy', desc: 'Your details stay protected throughout.' },
              { icon: <Zap size={22} />, title: 'Reliable Local Network', desc: 'Trusted professionals serving Faisalabad.' }
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 text-center transition hover:border-brand-200 hover:shadow-soft">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — Popular Services
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Services</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Popular Services</h2>
          <p className="mt-3 text-slate-600">Choose a service and submit a free request.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-brand-500 hover:shadow-soft"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={`${service.name} service`}
                    className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-950">{service.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{service.description}</p>
                  <p className="mt-3 text-sm font-bold text-brand-700">
                    Request {service.name} <ArrowRight size={14} className="inline" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — Coverage Areas
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Coverage</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Services Across Faisalabad</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            We provide home services across all major residential and commercial areas of Faisalabad.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
              <MapPin size={14} />
              {areas.length}+ Areas Covered
            </span>
          </div>
          <CoverageAreas />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — FAQ
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
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
          SECTION 8 — Final CTA
         ══════════════════════════════════════════════════════ */}
      <section className="bg-brand-700 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Ready to Request a Verified Worker?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Whether you need plumbing, electrical work, AC repair, painting, carpentry, masonry, CCTV installation, solar services or general labor, submit your request today and let our admin team connect you with a trusted professional anywhere in Faisalabad.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-brand-700 shadow-sm hover:bg-brand-50"
            >
              Submit Request <ArrowRight size={18} />
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

/* ── Coverage Areas with Show More / Show Less ── */
function CoverageAreas() {
  const [showAll, setShowAll] = useState(false);
  const POPULAR_AREAS_COUNT = 20;
  const visible = showAll ? areas : areas.slice(0, POPULAR_AREAS_COUNT);

  return (
    <>
      <div
        className="mt-6 flex flex-wrap gap-2 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: showAll ? '9999px' : '8rem' }}
      >
        {visible.map((area) => (
          <span
            key={area}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          >
            {area}
          </span>
        ))}
      </div>
      <button
        onClick={() => setShowAll((prev) => !prev)}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
      >
        {showAll ? (
          <>Show Less <ChevronUp size={16} /></>
        ) : (
          <>Show More Areas <ChevronDown size={16} /></>
        )}
      </button>
    </>
  );
}