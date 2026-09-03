import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Home,
  Key,
  Lightbulb,
  MapPin,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';
import { areas, services } from '../../data/catalog';
import { WHATSAPP_URL } from '../../components/support/WhatsAppButton';
import { StatsBar } from '../../components/sections/StatsBar';

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
              FSD Home Services helps homeowners and businesses in Faisalabad connect with trusted local professionals through a simple, trusted and transparent process.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/request-service"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-600"
              >
                Request a Service <ArrowRight size={18} />
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
                FSD Home Services exists to make it easier for homeowners and businesses across Faisalabad to find trusted local professionals without relying on random phone numbers, unverified contacts, or risky recommendations.
              </p>
              <p className="mt-3 text-slate-600">
                We connect customers with manually approved workers through a simple, transparent request process so you can get the right professional for your service needs.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 lg:p-8">
              <h3 className="font-bold text-slate-950">What we stand for</h3>
              <div className="mt-5 grid gap-4">
                {[
                  { icon: <ShieldCheck size={20} />, title: 'Verified Workers', desc: 'Every worker is manually reviewed and approved before joining the platform.' },
                  { icon: <ClipboardList size={20} />, title: 'Transparent Process', desc: 'Requests are handled by our team, not through random public listings.' },
                  { icon: <UserCheck size={20} />, title: 'Customer First', desc: 'We focus on helping you find a suitable professional for your service needs.' },
                  { icon: <MapPin size={20} />, title: 'Local Expertise', desc: 'Built specifically for Faisalabad, with services and professionals focused on local residential and commercial needs.' }
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
          SECTION 3 — Why FSD Home Services Was Built
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-brand-700">Our Story</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why FSD Home Services Was Built</h2>
            <p className="mt-4 text-slate-600">
              Homeowners and businesses across Faisalabad often find local workers through random phone numbers, WhatsApp groups, personal references, or unverified contacts. That can make it difficult to know who to trust, what rates are fair, or whether the work will be completed properly.
            </p>
            <p className="mt-3 text-slate-600">
              FSD Home Services was built to simplify that process. We give people in Faisalabad one place to submit a service request, and our team connects it with a suitable approved professional — so customers do not have to search, guess, or rely on unverified contacts.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — How FSD Home Services Works
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Process</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How FSD Home Services Works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <HowItWorksCard
              step={1}
              icon={<ClipboardList size={22} />}
              title="Submit a Request"
              description="Tell us what service you need and provide the relevant details."
              hasConnector
            />
            <HowItWorksCard
              step={2}
              icon={<Search size={22} />}
              title="We Review Your Request"
              description="Our team reviews the request and looks for a suitable available professional."
              hasConnector
            />
            <HowItWorksCard
              step={3}
              icon={<PhoneCall size={22} />}
              title="Worker Contacts You"
              description="The assigned professional contacts you and coordinates the service."
              hasConnector
            />
            <HowItWorksCard
              step={4}
              icon={<BadgeCheck size={22} />}
              title="Service Is Completed"
              description="The worker completes the requested work based on the agreed requirements."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — Why Choose FSD Home Services
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why choose us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Choose FSD Home Services</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            We are focused on creating a reliable local service platform for homeowners and businesses across Faisalabad.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <DifferenceCard
              icon={<ShieldCheck size={22} />}
              title="Verified Professionals"
              description="Workers are reviewed and manually approved before being listed on the platform."
            />
            <DifferenceCard
              icon={<ClipboardList size={22} />}
              title="No Random Listings"
              description="Customers submit a request instead of relying on random or unverified phone numbers."
            />
            <DifferenceCard
              icon={<MapPin size={22} />}
              title="Local Faisalabad Focus"
              description="The platform is built around service needs across Faisalabad and nearby areas."
            />
            <DifferenceCard
              icon={<CheckCircle2 size={22} />}
              title="One Simple Request Process"
              description="Customers can submit their service requirements through one straightforward platform."
            />
            <DifferenceCard
              icon={<Home size={22} />}
              title="Residential & Commercial Services"
              description="Services are available for homeowners as well as businesses and other local property needs."
            />
            <DifferenceCard
              icon={<TrendingUp size={22} />}
              title="Growing Local Network"
              description="FSD Home Services is building a broader network of local professionals across Faisalabad."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — Worker Verification Timeline
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
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
          SECTION 7 — Trust Metrics
         ══════════════════════════════════════════════════════ */}
      <StatsBar />

      {/* ══════════════════════════════════════════════════════
          SECTION 8 — Services We Cover
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Services</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Services We Cover</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
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
                  <h3 className="font-bold text-slate-950">{service.name === 'Laborer' ? 'Labor' : service.name}</h3>
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
          SECTION 9 — Who We Serve
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Our Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Who We Serve</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            FSD Home Services is built for anyone in Faisalabad who needs a reliable local professional for home or property-related work.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center transition hover:border-brand-200 hover:shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Home size={22} />
              </div>
              <h3 className="mt-4 font-bold text-slate-950">Homeowners</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                For everyday repairs, maintenance, installations, improvements and renovation needs.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center transition hover:border-brand-200 hover:shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Building2 size={22} />
              </div>
              <h3 className="mt-4 font-bold text-slate-950">Businesses</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                For offices, shops, commercial properties and ongoing maintenance requirements.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center transition hover:border-brand-200 hover:shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Key size={22} />
              </div>
              <h3 className="mt-4 font-bold text-slate-950">Property Owners</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                For construction, renovation, maintenance and property-related service needs.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center transition hover:border-brand-200 hover:shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Users size={22} />
              </div>
              <h3 className="mt-4 font-bold text-slate-950">Renovation & Construction Projects</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                For customers planning larger construction, renovation, finishing or improvement work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 10 — Serving Faisalabad
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Coverage</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Proudly Serving Faisalabad</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            We connect homeowners and businesses with verified professionals across major residential and commercial areas throughout Faisalabad.
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
          SECTION 11 — FAQ
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
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
          SECTION 12 — Final CTA
         ══════════════════════════════════════════════════════ */}
      <section className="bg-brand-700 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Need a Trusted Professional in Faisalabad?</h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">
            Tell us what you need and our team will help connect you with a suitable local professional.
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
    a: 'FSD Home Services is a local marketplace that connects homeowners and businesses across Faisalabad with manually verified workers for plumbing, electrical work, AC services, carpentry, painting, masonry, construction, renovation, CCTV, solar, welding, ceiling, waterproofing, cleaning and more.'
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
  },
  {
    q: 'How does the service request process work?',
    a: 'You submit a service request with your requirements, our admin team reviews it and assigns a suitable verified worker, and the worker contacts you directly to complete the service.'
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
