import { Link, useParams } from 'react-router-dom';
import { RequestForm } from '../../components/forms/RequestForm';
import { PageHeader } from '../../components/layout/PageHeader';
import { areas, services } from '../../data/catalog';
import {
  acAdvantages,
  acFaqs,
  acPricing,
  acServices,
  carpenterAdvantages,
  carpenterFaqs,
  carpenterPricing,
  carpenterServices,
  cctvAdvantages,
  cctvFaqs,
  cctvPricing,
  cctvServices,
  electricianAdvantages,
  electricianFaqs,
  electricianPricing,
  electricianServices,
  laborAdvantages,
  laborFaqs,
  laborPricing,
  laborServices,
  masonAdvantages,
  masonFaqs,
  masonPricing,
  masonServices,
  painterAdvantages,
  painterFaqs,
  painterPricing,
  painterServices,
  plumbingServices,
  plumberAdvantages,
  pricingItems,
  solarAdvantages,
  solarFaqs,
  solarPricing,
  solarServices,
  trustStats,
  serviceFaqs,
  relatedServices,
  relatedServicesAc,
  relatedServicesCarpenter,
  relatedServicesCctv,
  relatedServicesElectrician,
  relatedServicesLabor,
  relatedServicesMason,
  relatedServicesPainter,
  relatedServicesSolar
} from '../../data/serviceContent';
import {
  AdvantagesSection,
  CoverageAreas,
  FaqSection,
  FinalCta,
  HowItWorks,
  PricingSection,
  RelatedServices,
  ServiceCards,
  TrustBar,
  TrustSection
} from '../../components/sections/ServiceSections';
import { NotFound } from './NotFound';

const serviceSteps = [
  { step: 1, title: 'Request Service', description: 'Submit a request describing the work you need done.' },
  { step: 2, title: 'Admin Reviews Request', description: 'Our team reviews your request and selects a suitable verified worker.' },
  { step: 3, title: 'Verified Worker Assigned', description: 'A verified worker is assigned based on your location and requirements.' },
  { step: 4, title: 'Worker Visits Your Location', description: 'The assigned worker contacts you and visits to complete the work.' }
];

const trustBarItems = [
  { icon: 'ShieldCheck', title: 'Verified Workers' },
  { icon: 'UserCheck', title: 'Admin Approved' },
  { icon: 'Zap', title: 'Fast Response' },
  { icon: 'MapPin', title: 'Local Faisalabad Coverage' }
];

const serviceMap = services;

export function ServiceDetail() {
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug);
  if (!service) return <NotFound />;

  const isPlumber = service.slug === 'plumber-faisalabad';
  const isElectrician = service.slug === 'electrician-faisalabad';
  const isCctv = service.slug === 'cctv-technician-faisalabad';
  const isSolar = service.slug === 'solar-technician-faisalabad';
  const isAc = service.slug === 'ac-repair-faisalabad';
  const isCarpenter = service.slug === 'carpenter-faisalabad';
  const isPainter = service.slug === 'painter-faisalabad';
  const isMason = service.slug === 'mason-faisalabad';
  const isLabor = service.slug === 'labor-faisalabad';
  const hasPremiumLayout = isPlumber || isElectrician || isCctv || isSolar || isAc || isCarpenter || isPainter || isMason || isLabor;

  if (!hasPremiumLayout) {
    return (
      <>
        <PageHeader eyebrow={service.keywords} title={`${service.name} in Faisalabad`}>
          {service.description} Submit a free request and our team will assign a verified worker shortly.
        </PageHeader>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[.85fr_1.15fr]">
          <div className="grid content-start gap-5">
            <img
              src={service.image}
              alt={`${service.name} providing home service in Faisalabad`}
              className="aspect-[3/2] w-full rounded-lg object-cover shadow-soft"
            />
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-bold">Local coverage</h2>
              <p className="mt-2 text-slate-600">Available in Faisalabad areas including:</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {areas.map((area) => <span key={area} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{area}</span>)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-bold">FAQ</h2>
              <Faq q={`Do you show ${service.name.toLowerCase()} phone numbers publicly?`} a="No. Phone numbers are kept private and requests go through the platform/admin." />
              <Faq q="Is customer signup required?" a="No. Customers can submit a service request without creating an account." />
              <Faq q="How are workers selected?" a="Admin reviews the request and manually assigns an approved worker." />
            </div>
            <Link to="/workers" className="rounded-lg bg-blue-600 px-5 py-3 text-center font-bold text-white hover:bg-blue-500">View Approved Workers</Link>
          </div>
          <div>
            <h2 className="mb-3 text-2xl font-bold">Request {service.name}</h2>
            <RequestForm initialService={service.name} />
          </div>
        </section>
      </>
    );
  }

  const content = isPlumber
    ? {
        serviceName: 'Plumber',
        services: plumbingServices,
        advantages: plumberAdvantages,
        pricing: pricingItems,
        faqs: serviceFaqs,
        related: relatedServices,
        serviceIntro: 'Our verified plumbers handle a wide range of residential plumbing jobs across Faisalabad. Whether it is a small leak or a full bathroom installation, we can help.',
        requestTitle: 'Request a Plumber in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local plumber.'
      }
    : isElectrician
    ? {
        serviceName: 'Electrician',
        services: electricianServices,
        advantages: electricianAdvantages,
        pricing: electricianPricing,
        faqs: electricianFaqs,
        related: relatedServicesElectrician,
        serviceIntro: 'Our verified electricians handle a wide range of residential electrical jobs across Faisalabad. Whether it is a wiring issue or a new fan installation, we can help.',
        requestTitle: 'Request an Electrician in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local electrician.'
      }
    : isCctv
    ? {
        serviceName: 'CCTV Technician',
        services: cctvServices,
        advantages: cctvAdvantages,
        pricing: cctvPricing,
        faqs: cctvFaqs,
        related: relatedServicesCctv,
        serviceIntro: 'Our verified CCTV technicians handle a wide range of security camera and surveillance system services across Faisalabad. Whether you need a new installation or an existing system repaired, we can help.',
        requestTitle: 'Request a CCTV Technician in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local CCTV technician for installation, repair or maintenance.'
      }
    : isSolar
    ? {
        serviceName: 'Solar Technician',
        services: solarServices,
        advantages: solarAdvantages,
        pricing: solarPricing,
        faqs: solarFaqs,
        related: relatedServicesSolar,
        serviceIntro: 'Our verified solar technicians handle a wide range of solar energy services across Faisalabad. Whether you need a new solar panel installation or an existing system repaired and maintained, we can help.',
        requestTitle: 'Request a Solar Technician in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local solar technician for installation, repair, maintenance or inspection.'
      }
    : isAc
    ? {
        serviceName: 'AC Technician',
        services: acServices,
        advantages: acAdvantages,
        pricing: acPricing,
        faqs: acFaqs,
        related: relatedServicesAc,
        serviceIntro: 'Our verified AC technicians handle a wide range of air conditioning services across Faisalabad. Whether you need a new installation, repair, gas refilling or routine maintenance, we can help.',
        requestTitle: 'Request an AC Technician in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local AC technician for installation, repair, gas refilling, maintenance or inspection.'
      }
    : isCarpenter
    ? {
        serviceName: 'Carpenter',
        services: carpenterServices,
        advantages: carpenterAdvantages,
        pricing: carpenterPricing,
        faqs: carpenterFaqs,
        related: relatedServicesCarpenter,
        serviceIntro: 'Our verified carpenters handle a wide range of woodwork and furniture services across Faisalabad. Whether you need furniture repair, door installation or custom woodwork, we can help.',
        requestTitle: 'Request a Carpenter in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local carpenter for furniture repair, door installation, cabinets, custom woodwork and more.'
      }
    : isPainter
    ? {
        serviceName: 'Painter',
        services: painterServices,
        advantages: painterAdvantages,
        pricing: painterPricing,
        faqs: painterFaqs,
        related: relatedServicesPainter,
        serviceIntro: 'Our verified painters handle a wide range of painting and finishing services across Faisalabad. Whether you need interior painting, exterior painting or wall touch-ups, we can help.',
        requestTitle: 'Request a Painter in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local painter for interior painting, exterior painting, wall touch-ups, wood polishing and more.'
      }
    : isMason
    ? {
        serviceName: 'Mason',
        services: masonServices,
        advantages: masonAdvantages,
        pricing: masonPricing,
        faqs: masonFaqs,
        related: relatedServicesMason,
        serviceIntro: 'Our verified masons handle a wide range of construction and repair services across Faisalabad. Whether you need brick wall construction, plastering or concrete repair, we can help.',
        requestTitle: 'Request a Mason in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with a verified local mason for brick work, plastering, concrete repair, boundary walls and renovation services.'
      }
    : {
        serviceName: 'Labor',
        services: laborServices,
        advantages: laborAdvantages,
        pricing: laborPricing,
        faqs: laborFaqs,
        related: relatedServicesLabor,
        serviceIntro: 'Our verified laborers handle a wide range of manual work and assistance services across Faisalabad. Whether you need house shifting help, loading support or general labor, we can help.',
        requestTitle: 'Request Labor in Faisalabad',
        requestDesc: 'Fill in the form below and our admin team will connect you with trusted local laborers for house shifting, loading, unloading, construction support, cleaning and general helper services.'
      };

  return (
    <>
      {/* Hero */}
      <PageHeader eyebrow={service.keywords} title={`${service.name} in Faisalabad`}>
        {service.description} Submit a free request and our team will assign a verified worker shortly.
      </PageHeader>

      {/* Section 1: Trust Bar */}
      <TrustBar items={trustBarItems} />

      {/* Section 2: Request Form — placed early for quick conversions */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-bold text-brand-700">Get started</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">{content.requestTitle}</h2>
            <p className="mt-3 text-slate-600">{content.requestDesc}</p>
            <div className="mt-8">
              <RequestForm initialService={service.name} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: What Our {service}s Can Help With */}
      <ServiceCards
        title={`What Our ${content.serviceName}s Can Help With`}
        intro={content.serviceIntro}
        items={content.services}
      />

      {/* Section 4: Why Choose FSD Home Services */}
      <AdvantagesSection
        title="Why Choose FSD Home Services"
        items={content.advantages}
      />

      {/* Section 5: How It Works */}
      <HowItWorks steps={serviceSteps} />

      {/* Section 6: Coverage Areas */}
      <CoverageAreas serviceName={content.serviceName} />

      {/* Section 7: Estimated Pricing */}
      <PricingSection items={content.pricing} serviceName={content.serviceName} />

      {/* Section 8: Why Homeowners Trust Our Platform */}
      <TrustSection items={trustStats} />

      {/* Section 9: FAQ */}
      <FaqSection items={content.faqs} />

      {/* Section 10: Related Services */}
      <RelatedServices items={content.related} serviceMap={serviceMap} />

      {/* Section 11: Final CTA */}
      <FinalCta serviceName={content.serviceName} />
    </>
  );
}

function Faq({ q, a }) {
  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <h3 className="font-bold">{q}</h3>
      <p className="mt-1 text-sm text-slate-600">{a}</p>
    </div>
  );
}