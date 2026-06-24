import { PageHeader } from '../../components/layout/PageHeader';
import { SupportContactCard } from '../../components/support/SupportContactCard';

export function Contact() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Customer Care">
        For service requests, worker onboarding, complaints, and admin support in Faisalabad.
      </PageHeader>
      <section className="mx-auto max-w-3xl px-4 py-8">
        <SupportContactCard />
        <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-5 text-brand-950">
          <p className="font-semibold">
            For urgent plumbing, electrical, AC repair or labor requests in Faisalabad, contact us directly on WhatsApp.
          </p>
          <p className="mt-2 text-sm">
            Worker and customer phone numbers remain private. Only the FSD Home Services support number is published.
          </p>
        </div>
      </section>
    </>
  );
}
