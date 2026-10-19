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
import { StatsBar } from '../../components/sections/StatsBar';

const POPULAR_AREAS_COUNT = 22;

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
            <p className="mt-5 max-w-2xl text-lg text-slate-600">No more searching random phone numbers. Our team connects you with verified professionals for plumbing, electrical, AC, carpentry, painting, masonry, labor, and more across Faisalabad — based on your service needs and location.</p>
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
              <p className="mt-0.5 text-xs text-slate-600">Every request is coordinated by our service team.</p>
            </div>
          </div>
        </div>
        {/* ── Trust Features — UNCHANGED ── */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <Trust icon={<ShieldCheck />} title="Verified Professionals" text="Professionals are verified through work review, ID check, and an initial test job before earning Verified Professional status." />
            <Trust icon={<Lock />} title="No Random Professionals" text="We don't simply list anyone who signs up. Our team verifies professionals before connecting them with customers." />
            <Trust icon={<MapPin />} title="Local Coverage" text="Serving major areas across Faisalabad." />
            <Trust icon={<UserCheck />} title="Fast Assignment" text="Get connected with the right professional quickly." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          Trust Stats Strip — compact proof bar
         ══════════════════════════════════════════════════════ */}
      <StatsBar />

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
            Finding a reliable worker shouldn&apos;t be stressful. We help homeowners across Faisalabad connect with verified local professionals through a simple, trusted process.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ChooseCard
              icon={<Search size={22} />}
              title="Verified Professionals"
              description="We review previous work, verify government-issued ID, and evaluate new professionals through an initial test job before they earn Verified Professional status."
            />
            <ChooseCard
              icon={<ClipboardList size={22} />}
              title="No Random Professionals"
              description="We don't simply list anyone who signs up. Our team verifies professionals before connecting them with customers."
            />
            <ChooseCard
              icon={<MapPin size={22} />}
              title="Local Faisalabad Coverage"
              description="From central Faisalabad to surrounding residential areas, we help connect customers with verified local workers."
            />
            <ChooseCard
              icon={<PhoneCall size={22} />}
              title="Quick Response"
              description="Our team reviews every request and connects customers with the right professional as quickly as possible."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 1.5 — How We Verify Our Professionals
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-brand-700">Our verification process</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How We Verify Our Professionals</h2>
            <p className="mt-3 text-slate-600">
              Your home deserves more than a random phone number. That&apos;s why professionals go through our verification process before receiving Verified Professional status.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <ClipboardList size={24} />,
                step: 'Step 1',
                title: 'Previous Work Review',
                description: 'We review photos and videos of previous work to understand their experience, workmanship, and the type of services they have handled.'
              },
              {
                icon: <ShieldCheck size={24} />,
                step: 'Step 2',
                title: 'Identity Verification',
                description: 'We collect and verify a valid government-issued ID to confirm the professional\'s identity.'
              },
              {
                icon: <CheckCircle2 size={24} />,
                step: 'Step 3',
                title: 'Initial Test Job',
                description: 'New professionals complete an initial job through FSD Home Services so our team can evaluate their work quality, professionalism, and service.'
              },
              {
                icon: <BadgeCheck size={24} />,
                step: 'Step 4',
                title: 'Verified Professional',
                description: 'Professionals who meet our standards receive our Verified Professional status and become eligible for customer requests through FSD Home Services.'
              }
            ].map((item, index) => (
              <div key={item.title} className="relative rounded-lg border border-slate-200 bg-white p-6 text-center">
                {index < 3 && (
                  <div className="absolute left-1/2 top-12 hidden h-px w-[calc(100%-2rem)] bg-slate-200 lg:block" />
                )}
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  {item.icon}
                </div>
                <div className="mx-auto mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-brand-700">{item.step}</p>
                <h3 className="mt-1 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
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
                title: 'Our Team Reviews',
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
                FSD Home Services helps homeowners connect with verified local professionals across Faisalabad. Every professional goes through our verification process — including previous work review, government-issued ID verification, and an initial test job — before earning Verified Professional status.
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
                  'Verified Professionals',
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
          SECTION 4.5 — 7-Day Service Warranty
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl rounded-lg border border-brand-100 bg-brand-50 p-6 text-center sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <BadgeCheck size={24} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-950">7-Day Service Warranty</h3>
            <p className="mt-3 text-slate-600">
              If the same issue with the completed work occurs within <span className="font-semibold">7 days</span>, let us know. We&apos;ll arrange to have it fixed <span className="font-semibold">free of additional service charges</span>.
            </p>
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
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Need a Verified Professional in Faisalabad?</h2>
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
    a: 'We review their previous work, verify their government-issued ID, and evaluate them through an initial test job. Professionals who meet our standards receive our Verified Professional status.'
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
    q: 'What happens after I submit a service request?',
    a: 'Once you submit your request, our team assigns a suitable Verified Professional based on your service needs and location. Your assigned professional will call you within 5–10 minutes to confirm details, and will aim to arrive within 30 minutes after confirmation.'
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