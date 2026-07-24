import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  MapPin,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { areas, services } from '../../data/catalog';
import { WHATSAPP_URL } from '../../components/support/WhatsAppButton';

const POPULAR_AREAS_COUNT = 22;

export function About() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Hero
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-slate-950 md:text-4xl lg:text-5xl">About FSD Home Services</h1>
            <p className="mt-4 text-lg text-slate-600">
              FSD Home Services helps homeowners across Faisalabad connect with verified local professionals through a simple, trusted and transparent process.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-600"
              >
                Request a Worker <ArrowRight size={18} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 hover:border-brand-500 hover:text-brand-700"
              >
                View Services <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-brand-700" /> Verified Workers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-brand-700" /> Local Platform
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-brand-700" /> Manual Approval
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-brand-700" /> Faisalabad Coverage
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Our Mission
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-sm font-bold text-brand-700">Our mission</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Our Mission</h2>
              <p className="mt-4 text-slate-600">
                Our mission is to make it easier for homeowners across Faisalabad to find trusted local professionals without relying on random phone numbers or unverified contacts.
              </p>
              <p className="mt-3 text-slate-600">
                We focus on connecting customers with manually approved workers through a simple and transparent request process.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 lg:p-8">
              <h3 className="font-bold text-slate-950">What we stand for</h3>
              <div className="mt-5 grid gap-4">
                {[
                  { icon: <ShieldCheck size={20} />, title: 'Verified Workers', desc: 'Every worker is manually reviewed before joining.' },
                  { icon: <ClipboardList size={20} />, title: 'Transparent Process', desc: 'No hidden listings. Every request is handled by our team.' },
                  { icon: <UserCheck size={20} />, title: 'Customer First', desc: 'We prioritise connecting you with the right professional.' }
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-0.5 shrink-0 text-brand-700">{item.icon}</div>
                    <div>
                      <p className="font-bold text-slate-950">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — How FSD Home Services Works
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Process</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How FSD Home Services Works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <HowItWorksCard
              step={1}
              icon={<ClipboardList size={22} />}
              title="Submit a Request"
              description="Customer submits a request."
              hasConnector
            />
            <HowItWorksCard
              step={2}
              icon={<Search size={22} />}
              title="Admin Assigns Worker"
              description="Admin reviews and assigns a suitable verified worker."
              hasConnector
            />
            <HowItWorksCard
              step={3}
              icon={<PhoneCall size={22} />}
              title="Worker Contacts You"
              description="Worker contacts customer and completes the service."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — What Makes Us Different
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why choose us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">What Makes Us Different</h2>
          <p className="mt-3 text-slate-600">
            We are focused on creating a reliable local service platform for Faisalabad homeowners.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DifferenceCard
              icon={<ShieldCheck size={22} />}
              title="Verified Workers"
              description="Every worker is manually reviewed before joining the platform."
            />
            <DifferenceCard
              icon={<ClipboardList size={22} />}
              title="No Random Listings"
              description="Customers request services instead of browsing unverified phone numbers."
            />
            <DifferenceCard
              icon={<MapPin size={22} />}
              title="Local Faisalabad Focus"
              description="Built specifically for homeowners across Faisalabad and nearby areas."
            />
            <DifferenceCard
              icon={<UserCheck size={22} />}
              title="Growing Community"
              description="We continue expanding our network of trusted local professionals."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — Worker Verification Timeline
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-bold text-brand-700">Verification</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How Workers Are Verified</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl gap-0">
            {[
              { step: 1, title: 'Application', desc: 'Workers submit their details and service information through the application form.' },
              { step: 2, title: 'Manual Review', desc: 'Our admin team manually reviews each application to check for completeness and legitimacy.' },
              { step: 3, title: 'Identity Verification', desc: 'The worker provides identity documents which are verified before proceeding.' },
              { step: 4, title: 'Approval', desc: 'Once verified, the worker is approved and granted access to service requests.' },
              { step: 5, title: 'Public Listing', desc: 'The approved worker becomes visible to customers requesting services in their area.' }
            ].map((item, index) => (
              <div key={item.step} className="relative flex gap-5 pb-8 last:pb-0">
                {index < 4 && (
                  <div className="absolute left-[11px] top-8 h-full w-px bg-slate-200" />
                )}
                <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                  {item.step}
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/worker-verification-policy"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 hover:border-brand-500 hover:text-brand-700"
            >
              Learn About Worker Verification <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — Services We Cover
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Services</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Services We Cover</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {services.slice(0, 9).map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-brand-500 hover:shadow-soft"
              >
                <img
                  src={service.image}
                  alt={`${service.name} service`}
                  className="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="p-3">
                  <h3 className="font-bold text-slate-950">{service.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 hover:border-brand-500 hover:text-brand-700"
            >
              View All Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — Serving Faisalabad
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Coverage</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Proudly Serving Faisalabad</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            We help homeowners connect with verified professionals across major residential and commercial areas throughout Faisalabad.
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
          SECTION 8 — FAQ
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-bold text-brand-700">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Frequently Asked Questions</h2>
            <div className="mt-8">
              <FaqAccordion />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 9 — Final CTA
         ══════════════════════════════════════════════════════ */}
      <section className="bg-brand-700 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Need a Verified Worker in Faisalabad?</h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">
            Submit your request today and let our team connect you with a trusted local professional.
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

/* ── How It Works step card ── */
function HowItWorksCard({ step, icon, title, description, hasConnector }) {
  return (
    <div className="relative text-center">
      {hasConnector && (
        <div className="absolute left-1/2 top-11 hidden h-px w-[calc(100%-3rem)] bg-slate-200 md:block" />
      )}
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        {icon}
      </div>
      <div className="mx-auto mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
        {step}
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

/* ── Difference card ── */
function DifferenceCard({ icon, title, description }) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-6 transition hover:border-brand-200 hover:shadow-soft">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

/* ── Coverage Areas with Show More / Show Less ── */
function CoverageAreas() {
  const [showAll, setShowAll] = useState(false);
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

/* ── FAQ Accordion ── */
const faqs = [
  {
    q: 'What is FSD Home Services?',
    a: 'FSD Home Services is a local platform that connects homeowners across Faisalabad with manually verified workers for plumbing, electrical work, AC services, carpentry, painting, masonry and more.'
  },
  {
    q: 'How are workers verified?',
    a: 'Every worker goes through a manual review process that includes identity verification before being approved and listed on the platform.'
  },
  {
    q: 'Do customers need an account?',
    a: 'No. Customers can submit a service request without creating an account.'
  },
  {
    q: 'Which areas do you serve?',
    a: 'We provide services across major residential and commercial areas throughout Faisalabad.'
  },
  {
    q: 'How can I become a worker?',
    a: 'Visit the Become a Worker page and submit your application. Our admin team will review it and guide you through the verification process.'
  }
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900 transition hover:bg-slate-50 md:px-6 md:py-5"
            >
              <span>{faq.q}</span>
              <ChevronDown
                size={20}
                className={`shrink-0 text-slate-400 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'}`}
            >
              <p className="px-5 pb-5 text-slate-600 md:px-6 md:pb-6">{faq.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}