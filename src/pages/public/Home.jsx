import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Lock,
  MapPin,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Wrench
} from 'lucide-react';
import { areas } from '../../data/catalog';
import { useCatalog } from '../../contexts/CatalogContext';
import { WHATSAPP_URL } from '../../components/support/WhatsAppButton';
import { GoogleReviewsSection } from '../../components/sections/GoogleReviewsSection';

const POPULAR_AREAS_COUNT = 22;
const DEFAULT_AREAS_COVERED = areas.length;

export function Home() {
  const { services } = useCatalog();

  return (
    <>
      {/* ── Hero Section — UNCHANGED ── */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-12">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">Faisalabad verified home services</p>
            <h1 className="text-4xl font-bold tracking-normal text-slate-950 md:text-5xl lg:text-6xl">Hire Verified Plumbers, Electricians & Local Workers in Faisalabad.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">Skip the hassle of searching random phone numbers. Request admin-approved plumbers, electricians, AC technicians, carpenters, painters, masons and laborers across Faisalabad.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/request-service" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-600">
                Request a Worker <ArrowRight size={18} />
              </Link>
              <Link to="/become-a-worker" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 hover:border-brand-500 hover:text-brand-700">
                Become a Worker <ArrowRight size={18} />
              </Link>
            </div>
            <Link to="/workers" className="mt-4 inline-block text-sm font-bold text-brand-700 hover:underline">
              View Approved Workers
            </Link>
          </div>
          <div className="relative">
            <img
              src="/images/home-services-hero.jpg"
              alt="Plumber, electrician, and AC technician working in a Faisalabad home"
              className="aspect-[6/5] w-full rounded-lg object-cover shadow-soft"
            />
            <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
              <p className="text-sm font-bold text-slate-950">Verified local professionals</p>
              <p className="mt-0.5 text-xs text-slate-600">Every request is coordinated by our admin team.</p>
            </div>
          </div>
        </div>
        {/* ── Trust Features — UNCHANGED ── */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <Trust icon={<ShieldCheck />} title="Verified Workers" text="Every profile is reviewed before approval." />
            <Trust icon={<Lock />} title="Trusted Requests" text="No random listings or unverified workers." />
            <Trust icon={<MapPin />} title="Local Coverage" text="Serving major areas across Faisalabad." />
            <Trust icon={<UserCheck />} title="Fast Assignment" text="Get connected with the right worker quickly." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          Trust Stats Strip — compact proof bar
         ══════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200 bg-white" aria-label="FSD Home Services statistics">
        <div className="mx-auto max-w-7xl px-4 py-7 lg:py-9">
          <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x lg:divide-slate-200">
            <StatItem icon={<UserCheck size={20} />} value="32+" label="Verified Workers" />
            <StatItem icon={<BadgeCheck size={20} />} value="54" label="Completed Jobs" />
            <StatItem icon={<ClipboardList size={20} />} value="74+" label="Service Requests" />
            <StatItem
              icon={<Star size={20} className="fill-current" />}
              value={
                <span className="inline-flex items-baseline gap-1.5">
                  4.8
                  <Star aria-hidden="true" className="h-[0.85em] w-[0.85em] fill-current text-brand-500" />
                </span>
              }
              label="Google Rating"
            />
          </div>
        </div>
      </section>

      {/* ── Popular Services — UNCHANGED ── */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Popular Services</h2>
            <p className="mt-1 text-slate-600">Choose a service and submit a free request.</p>
          </div>
          <Link to="/services" className="text-sm font-bold text-brand-700">All services</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link key={service.slug} to={`/services/${service.slug}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-brand-500 hover:shadow-soft">
              <img src={service.image} alt={`${service.name} service`} className="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
              <div className="p-4">
                <h3 className="font-bold text-slate-950">{service.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <GoogleReviewsSection />

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Why Homeowners Choose FSD Home Services
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why choose us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Homeowners Choose FSD Home Services</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Finding a reliable worker shouldn't be stressful. We help homeowners across Faisalabad connect with verified local professionals through a simple, trusted process.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ChooseCard
              icon={<Search size={22} />}
              title="Verified Professionals"
              description="Every worker is manually reviewed before joining the platform to help maintain service quality."
            />
            <ChooseCard
              icon={<ClipboardList size={22} />}
              title="No Random Listings"
              description="We don't publish random phone numbers. Customer requests are reviewed before a suitable worker is assigned."
            />
            <ChooseCard
              icon={<MapPin size={22} />}
              title="Local Faisalabad Coverage"
              description="From central Faisalabad to surrounding residential areas, we help connect customers with verified local workers."
            />
            <ChooseCard
              icon={<PhoneCall size={22} />}
              title="Quick Response"
              description="Our admin team reviews every request and connects customers with the right professional as quickly as possible."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — How It Works
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Process</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How It Works</h2>
          <p className="mt-3 text-slate-600">Getting help is simple.</p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ClipboardList size={22} />,
                title: 'Submit Your Request',
                description: "Choose the service you need and tell us about the problem you're facing."
              },
              {
                icon: <Search size={22} />,
                title: 'Admin Reviews',
                description: 'Our team reviews your request and selects a suitable verified professional for the job.'
              },
              {
                icon: <PhoneCall size={22} />,
                title: 'Worker Contacts You',
                description: 'The assigned professional contacts you directly, understands the issue and discusses the required work with you.'
              },
              {
                icon: <CircleDollarSign size={22} />,
                title: 'Agree on the Price',
                description: 'After understanding the issue, the professional explains the required work and gives you the expected price before starting.',
                trustLine: 'No surprise pricing.',
                emphasized: true
              },
              {
                icon: <Wrench size={22} />,
                title: 'Get the Problem Fixed',
                description: 'Once you agree on the work and price, the professional completes the service and fixes the issue.'
              },
              {
                icon: <CreditCard size={22} />,
                title: 'Pay After Completion',
                description: "You pay after the service has been completed and you're satisfied with the work.",
                trustLine: 'Your service comes first.',
                emphasized: true
              }
            ].map((step, index) => (
              <HowItWorksCard
                key={step.title}
                step={index + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
                trustLine={step.trustLine}
                emphasized={Boolean(step.emphasized)}
                hasConnector={(index + 1) % 3 !== 0}
                hasVerticalConnector={index < 5}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — Coverage Areas (improved)
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <img
              src="/images/locations/faisalabad-clock-tower.jpg"
              alt="Faisalabad Clock Tower and surrounding city market"
              className="aspect-video w-full rounded-lg object-cover shadow-soft"
              loading="lazy"
            />
            <div>
              <p className="text-sm font-bold text-brand-700">Local Faisalabad coverage</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Services across the city</h2>
              <p className="mt-3 text-slate-600">From central Faisalabad near Ghanta Ghar to major residential neighborhoods, every request is reviewed for local availability.</p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                  <MapPin size={14} />
                  {areas.length}+ Areas Covered
                </span>
              </div>
              <CoverageAreas />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — About Preview
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold text-brand-700">About us</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">About FSD Home Services</h2>
              <p className="mt-4 text-slate-600">
                FSD Home Services helps homeowners connect with verified local professionals across Faisalabad. Every worker goes through a manual approval process before being listed on the platform.
              </p>
              <p className="mt-3 text-slate-600">
                Our goal is to make it easier to find trusted plumbers, electricians, AC technicians, carpenters, painters, masons, CCTV technicians, solar technicians and other skilled workers from one reliable local platform.
              </p>
              <div className="mt-6">
                <Link to="/about" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 hover:border-brand-500 hover:text-brand-700">
                  Learn More About Us <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 lg:p-8">
              <h3 className="font-bold text-slate-950">Why homeowners trust us</h3>
              <ul className="mt-5 grid gap-3">
                {[
                  'Verified Workers',
                  'Manual Approval',
                  'Local Platform',
                  'Trusted Local Network'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="shrink-0 text-brand-700" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — Homepage FAQ
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
          SECTION 6 — Final CTA
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

/* ── Existing Trust card (UNCHANGED) ── */
function Trust({ icon, title, text }) {
  return (
    <div className="flex min-h-28 gap-3 bg-white p-4">
      <div className="shrink-0 text-brand-700">{icon}</div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}

/* ── Trust Stat — polished strip item ── */
function StatItem({ icon, value, label }) {
  return (
    <div className="group flex flex-col items-center justify-center px-4 py-1 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors duration-200 group-hover:bg-brand-100">
        {icon}
      </div>
      <div className="text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">{value}</div>
      <p className="mt-1.5 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

/* ── Why Choose card — polished ── */
function ChooseCard({ icon, title, description }) {
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

/* ── How It Works step card with connector ── */
function HowItWorksCard({
  step,
  icon,
  title,
  description,
  hasConnector,
  hasVerticalConnector,
  trustLine,
  emphasized
}) {
  const emphasisClasses = emphasized
    ? 'rounded-xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5'
    : '';

  return (
    <div className={`h-full ${emphasisClasses}`}>
      <div className="relative flex items-start gap-4 lg:block lg:text-center">
        {/* Mobile / tablet: vertical rail connecting the numbered indicators */}
        {hasVerticalConnector && (
          <div
            aria-hidden="true"
            className="absolute left-[27px] top-3 -bottom-6 w-px bg-slate-200 lg:hidden"
          />
        )}
        {/* Desktop: horizontal connector between steps in a row */}
        {hasConnector && (
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-11 hidden h-px w-[calc(100%-3rem)] bg-slate-200 lg:block"
          />
        )}
        <div className="relative z-10 flex shrink-0 flex-col items-center lg:mx-auto lg:block">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 lg:mx-auto">
            {icon}
          </div>
          <div className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white lg:mt-4 lg:mx-auto">
            {step}
          </div>
        </div>
        <div className="min-w-0 pb-1 text-left lg:py-0 lg:mx-auto lg:text-center">
          <h3 className="font-bold text-slate-950 lg:mt-4">{title}</h3>
          <p className="mt-2 leading-relaxed text-slate-600">{description}</p>
          {trustLine && (
            <p className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
              <CheckCircle2 size={15} aria-hidden="true" className="shrink-0" />
              {trustLine}
            </p>
          )}
        </div>
      </div>
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

/* ── FAQ Accordion — polished ── */
const faqs = [
  {
    q: 'Do I need to create an account?',
    a: 'No. Customers can submit a service request without creating an account.'
  },
  {
    q: 'Are workers verified?',
    a: 'Yes. Every worker is manually reviewed before approval before becoming available on the platform.'
  },
  {
    q: 'Which areas do you cover?',
    a: 'We provide services across major residential and commercial areas throughout Faisalabad.'
  },
  {
    q: 'Which services are available?',
    a: 'Plumbing, electrical work, AC services, carpentry, painting, masonry, labor, CCTV installation, solar technician services and more.'
  },
  {
    q: 'How quickly will someone contact me?',
    a: 'Our admin team reviews requests during working hours and connects customers with a suitable verified worker as quickly as possible.'
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