import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bath,
  Battery,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Droplets,
  EyeOff,
  Fan,
  HardDrive,
  Lightbulb,
  Lock,
  MapPin,
  MessageCircle,
  Monitor,
  Search,
  ShieldCheck,
  Sun,
  ToggleLeft,
  TriangleAlert,
  Truck,
  UserCheck,
  UtensilsCrossed,
  Wifi,
  Wrench,
  Zap,
  Paintbrush
} from 'lucide-react';
import { areas } from '../../data/catalog';
import { WHATSAPP_URL } from '../support/WhatsAppButton';

const iconMap = {
  ShieldCheck, Search, Lock, UserCheck, MapPin, Zap,
  ClipboardList, MessageCircle, EyeOff,
  Droplets, Bath, UtensilsCrossed, TriangleAlert, HardDrive, Wrench, Clock,
  Battery, Fan, Lightbulb, Monitor, Paintbrush, Sun, ToggleLeft, Truck, Wifi
};

const POPULAR_AREAS_COUNT = 20;

/* ── Section 1: Trust Bar ── */
export function TrustBar({ items }) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={item.title} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-950">{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Section 2: What Our X Can Help With ── */
export function ServiceCards({ title, intro, items }) {
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-bold text-brand-700">Services</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">{title}</h2>
        {intro && <p className="mt-3 max-w-2xl text-slate-600">{intro}</p>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={item.title} className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-soft">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Section 3: Why Choose FSD Home Services ── */
export function AdvantagesSection({ title, items, eyebrow }) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-bold text-brand-700">{eyebrow || 'Why choose us'}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">{title}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={item.title} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-5">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Section 4: How It Works ── */
export function HowItWorks({ steps }) {
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-bold text-brand-700">Process</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">How It Works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-11 hidden h-px w-[calc(100%-3rem)] bg-slate-200 md:block" />
              )}
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Search size={22} />
              </div>
              <div className="mx-auto mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                {step.step}
              </div>
              <h3 className="mt-4 font-bold text-slate-950">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 5: Coverage Areas ── */
export function CoverageAreas({ serviceName }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? areas : areas.slice(0, POPULAR_AREAS_COUNT);

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-bold text-brand-700">Coverage</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">{serviceName} Services Across Faisalabad</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          We provide {serviceName.toLowerCase()} services across all major residential and commercial areas of Faisalabad.
        </p>
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <MapPin size={14} />
            {areas.length}+ Areas Covered
          </span>
        </div>
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
      </div>
    </section>
  );
}

/* ── Section 6: Pricing ── */
export function PricingSection({ items, serviceName }) {
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-bold text-brand-700">Pricing</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Estimated Pricing</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Below are estimated price ranges for common {serviceName.toLowerCase()} services. Final charges depend on the actual work after inspection.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-lg font-bold text-brand-700">{item.price}</p>
              <p className="mt-1 text-sm text-slate-500">{item.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Final charges depend on the actual work after inspection.
        </p>
      </div>
    </section>
  );
}

/* ── Section 7: Trust / Stats ── */
export function TrustSection({ items }) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-bold text-brand-700">Why trust us</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Homeowners Trust Our Platform</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Section 8: FAQ ── */
export function FaqSection({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-bold text-brand-700">FAQ</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {items.map((faq, index) => {
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
        </div>
      </div>
    </section>
  );
}

/* ── Section 9: Related Services ── */
export function RelatedServices({ items, serviceMap }) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-sm font-bold text-brand-700">Related services</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Related Services</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {items.map((name) => {
            const svc = serviceMap.find((s) => s.name === name);
            if (!svc) return null;
            return (
              <Link
                key={svc.slug}
                to={`/services/${svc.slug}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-brand-500 hover:shadow-soft"
              >
                <img
                  src={svc.image}
                  alt={`${svc.name} service`}
                  className="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="font-bold text-slate-950">{svc.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{svc.description}</p>
                </div>
              </Link>
            );
          })}
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
  );
}

/* ── Section 10: Final CTA ── */
export function FinalCta({ serviceName }) {
  return (
    <section className="bg-brand-700 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-2xl font-bold text-white lg:text-3xl">Need a Verified {serviceName} in Faisalabad?</h2>
        <p className="mx-auto mt-3 max-w-lg text-brand-100">
          Submit your request today and our admin team will connect you with a verified local {serviceName.toLowerCase()} based on your location and requirements.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/request-service"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-brand-700 shadow-sm hover:bg-brand-50"
          >
            Request {serviceName} <ArrowRight size={18} />
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
  );
}