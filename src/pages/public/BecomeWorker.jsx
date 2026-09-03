import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  HardDrive,
  Lock,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  UserCheck,
  Wrench,
  Zap
} from 'lucide-react';
import { WorkerSignupForm } from '../../components/forms/WorkerSignupForm';
import { PageHeader } from '../../components/layout/PageHeader';
import { WhatsAppButton, WHATSAPP_URL } from '../../components/support/WhatsAppButton';
import { useCatalog } from '../../contexts/CatalogContext';

const whoCanApplyIcons = {
  Plumber: Wrench,
  Electrician: Zap,
  'AC Technician': HardDrive,
  Carpenter: Wrench,
  Painter: ShieldCheck,
  Mason: HardDrive,
  Laborer: ClipboardList,
  'CCTV Technician': Search,
  'Solar Technician': ShieldCheck
};

const whoCanApplyDesc = {
  Plumber: 'Handle leak repairs, pipe installation, drainage systems, bathroom fittings and water supply work.',
  Electrician: 'Perform wiring, switch and socket repair, fan and light installation, DB work and electrical fault repair.',
  'AC Technician': 'Install, service and repair split AC, window AC and inverter AC units including gas refilling and deep cleaning.',
  Carpenter: 'Handle furniture repair, door installation, cabinet assembly, kitchen woodwork and custom wood furniture.',
  Painter: 'Provide interior and exterior painting, wall touch-ups, texture paint, wood polish and surface preparation.',
  Mason: 'Perform brick wall construction, plastering, concrete repair, floor leveling and general renovation work.',
  Laborer: 'Assist with house shifting, loading and unloading, construction site help, cleaning and general daily labor.',
  'CCTV Technician': 'Install and repair CCTV cameras, set up DVR/NVR systems, configure remote viewing and troubleshoot security systems.',
  'Solar Technician': 'Install solar panels, inverters and batteries, perform system repair, cleaning, maintenance and full inspections.'
};

const benefitsItems = [
  { icon: 'ShieldCheck', title: 'Verified Badge', desc: 'Approved workers receive a public verification badge.' },
  { icon: 'UserCheck', title: 'Professional Profile', desc: 'Build a complete profile showcasing your skills and areas.' },
  { icon: 'MapPin', title: 'Local Customer Leads', desc: 'Receive genuine requests from customers near your areas.' },
  { icon: 'ClipboardList', title: 'Fair Assignment Process', desc: 'Our admin team assigns requests based on your location and expertise.' },
  { icon: 'CheckCircle2', title: 'Free Registration', desc: 'Registration is completely free with no hidden charges.' },
  { icon: 'Zap', title: 'Long-Term Growth', desc: 'Build your reputation and grow your customer base over time.' },
  { icon: 'MessageCircle', title: 'Customer Reviews', desc: 'Earn reviews from customers and strengthen your profile.' },
  { icon: 'Lock', title: 'Trusted Platform', desc: 'Your private information stays protected and is never publicly shared.' }
];

const documentsList = [
  'Full Name',
  'Active Mobile Number',
  'CNIC (Optional but Recommended)',
  'Service Category',
  'Areas You Cover',
  'Profile Photo',
  'CNIC Images (Recommended)',
  'Professional Work Information'
];

const faqItems = [
  {
    q: 'How long does verification take?',
    a: 'Verification typically takes a few business days. Our admin team reviews each application manually to ensure accuracy and legitimacy before approving.'
  },
  {
    q: 'Is registration free?',
    a: 'Yes. Registration is completely free. There are no charges to submit your application, create a profile or receive customer requests.'
  },
  {
    q: 'Can I apply for more than one service?',
    a: 'Yes. You can select multiple service categories when submitting your application if you are qualified in more than one trade.'
  },
  {
    q: 'Will my phone number be publicly visible?',
    a: 'No. Your phone number is never publicly displayed on the platform. Customers submit requests through the platform and our admin team connects them with suitable workers.'
  },
  {
    q: 'Can I edit my profile later?',
    a: 'Yes. Once approved, you can update your profile information, service areas and other details through your worker dashboard.'
  },
  {
    q: 'Do I need previous experience?',
    a: 'We recommend having relevant experience in your chosen service category. Our admin team reviews each application to assess suitability.'
  },
  {
    q: 'Which areas can I select?',
    a: 'You can select from over 130 residential and commercial areas across Faisalabad. Choose the areas where you are available to provide services.'
  },
  {
    q: 'How do I receive customer requests?',
    a: 'When a customer submits a request matching your service category and areas, our admin team reviews and assigns it to you. The customer\'s details are shared so you can contact them directly.'
  }
];

const LucideIcon = ({ name, size }) => {
  const icons = { ArrowRight, CheckCircle2, ChevronDown, ClipboardList, Clock, HardDrive, Lock, MapPin, MessageCircle, Search, ShieldCheck, UserCheck, Wrench, Zap };
  const Icon = icons[name] || ShieldCheck;
  return <Icon size={size || 20} />;
};

export function BecomeWorker() {
  const { services } = useCatalog();

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      {/* ── Hero ── */}
      <PageHeader eyebrow="Worker verification" title="Become an approved FSD Home Services worker">
        Join Faisalabad&apos;s growing network of verified plumbers, electricians, AC technicians, painters, carpenters, masons, CCTV technicians, solar technicians and skilled workers. Submit your profile once, get verified by our admin team and receive genuine customer requests from your service areas.
      </PageHeader>

      {/* ── WhatsApp Banner + Registration Form ── */}
      <section className="mx-auto max-w-4xl px-4 pb-8">
        <div className="mb-5 flex flex-col gap-4 rounded-lg border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-brand-950">Not sure how to create your worker profile? WhatsApp us and our team will guide you through the registration process.</p>
          <WhatsAppButton prefilled className="shrink-0">Chat on WhatsApp</WhatsAppButton>
        </div>
        <WorkerSignupForm />
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Why Join FSD Home Services
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Why join us</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Why Join FSD Home Services?</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Grow your work with a trusted local platform that connects verified workers with genuine customers across Faisalabad.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <UserCheck size={22} />, title: 'Verified Customer Requests', desc: 'Receive real customer requests instead of searching for work every day.' },
              { icon: <ShieldCheck size={22} />, title: 'Admin Support', desc: 'Our team reviews requests and connects the right worker with the right customer.' },
              { icon: <CheckCircle2 size={22} />, title: 'No Fake Profiles', desc: 'Only approved workers appear publicly on our platform.' },
              { icon: <MapPin size={22} />, title: 'Expand Your Local Reach', desc: 'Get discovered by homeowners across Faisalabad and nearby areas.' },
              { icon: <MessageCircle size={22} />, title: 'Build Your Reputation', desc: 'Earn customer reviews and strengthen your professional profile over time.' },
              { icon: <Clock size={22} />, title: 'Flexible Work', desc: 'Accept jobs that match your skills, availability and preferred service areas.' }
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
          SECTION 3 — Who Can Apply
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Who can apply</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Who Can Apply?</h2>
          <p className="mt-3 text-slate-600">We welcome skilled professionals across multiple home service categories.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = whoCanApplyIcons[service.name] || ShieldCheck;
              return (
                <div key={service.slug} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:shadow-soft">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">{service.name === 'Laborer' ? 'Laborers' : service.name + 's'}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{whoCanApplyDesc[service.name]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — How Worker Verification Works
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Verification</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Simple Verification Process</h2>
          <div className="mx-auto mt-10 grid max-w-2xl gap-0">
            {[
              { step: 1, title: 'Submit Your Profile', desc: 'Fill in your personal details, service category and areas you cover.' },
              { step: 2, title: 'Admin Verification', desc: 'Our team reviews your information and verifies your profile.' },
              { step: 3, title: 'Approval', desc: 'Approved workers become visible on the platform.' },
              { step: 4, title: 'Receive Customer Requests', desc: 'Start receiving genuine service requests from customers in your selected areas.' }
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
          SECTION 5 — Benefits of Joining
         ══════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm font-bold text-brand-700">Benefits</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">Benefits of Becoming a Verified Worker</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefitsItems.map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 text-center transition hover:border-brand-200 hover:shadow-soft">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <LucideIcon name={item.icon} size={22} />
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — Required Documents
         ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-bold text-brand-700">Requirements</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">What You&apos;ll Need</h2>
            <ul className="mt-8 grid gap-3">
              {documentsList.map((doc) => (
                <li key={doc} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-4">
                  <CheckCircle2 size={20} className="shrink-0 text-brand-700" />
                  <span className="text-slate-700">{doc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-slate-500">
              Providing complete and accurate information helps speed up the verification process.
            </p>
          </div>
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
          <h2 className="text-2xl font-bold text-white lg:text-3xl">Ready to Start Getting More Local Work?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Join hundreds of skilled professionals building their reputation with FSD Home Services. Complete your registration today and let our admin team connect you with genuine customers looking for trusted workers across Faisalabad.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/become-a-worker"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-brand-700 shadow-sm hover:bg-brand-50"
            >
              Register as a Worker <ArrowRight size={18} />
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