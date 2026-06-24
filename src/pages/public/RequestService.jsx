import { useSearchParams } from 'react-router-dom';
import { RequestForm } from '../../components/forms/RequestForm';
import { PageHeader } from '../../components/layout/PageHeader';
import { WhatsAppButton } from '../../components/support/WhatsAppButton';

export function RequestService() {
  const [params] = useSearchParams();
  return (
    <>
      <PageHeader eyebrow="Free customer request" title="Request a verified worker">
        Tell us your service, area, urgency, and preferred time. Signup is optional and phone numbers remain private.
      </PageHeader>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-5 flex flex-col gap-4 rounded-lg border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-brand-950">Not sure which worker you need? WhatsApp us and our team will guide you.</p>
          <WhatsAppButton prefilled className="shrink-0">Ask on WhatsApp</WhatsAppButton>
        </div>
        <RequestForm preferredWorkerId={params.get('worker')} initialService={params.get('service')} />
      </section>
    </>
  );
}
