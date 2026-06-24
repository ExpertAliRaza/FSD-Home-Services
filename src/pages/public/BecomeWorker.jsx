import { WorkerSignupForm } from '../../components/forms/WorkerSignupForm';
import { PageHeader } from '../../components/layout/PageHeader';

export function BecomeWorker() {
  return (
    <>
      <PageHeader eyebrow="Worker verification" title="Become an approved FSD Home Services worker">
        Submit your profile, CNIC images, service category, areas, and work photos. Your card appears publicly only after admin approval.
      </PageHeader>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <WorkerSignupForm />
      </section>
    </>
  );
}
