import { PageHeader } from '../../components/layout/PageHeader';

export function Terms() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service">
        Rules for customers and workers using FSD Home Services.
      </PageHeader>
      <section className="mx-auto grid max-w-4xl gap-5 px-4 py-8">
        <Term title="Marketplace role">
          FSD Home Services coordinates requests between customers and independently operating workers. The platform does not guarantee a specific price, result, availability or completion time.
        </Term>
        <Term title="Customer responsibilities">
          Customers must provide accurate request and contact information, describe hazards or access issues, agree job scope and price before work begins, and avoid unlawful or unsafe requests.
        </Term>
        <Term title="Worker responsibilities">
          Workers must submit accurate identity and experience information, keep profile details current, perform work lawfully and safely, communicate honestly, respect customer property and pay the applicable 10% platform commission on completed jobs.
        </Term>
        <Term title="Verification">
          Approval indicates that submitted information was reviewed; it is not a guarantee of workmanship. FSD Home Services may request changes, reject, suspend or remove a worker profile.
        </Term>
        <Term title="Pricing and commission">
          Customers and workers agree the actual job value directly. After completion, the platform records a 10% worker commission. Collection remains manual and no online payment service is currently provided.
        </Term>
        <Term title="Complaints and conduct">
          Complaints may be reviewed by the platform, but users remain responsible for resolving job scope, payment and workmanship disputes. Abuse, fraud, harassment or misuse may result in suspension.
        </Term>
        <Term title="Uploaded content and privacy">
          Users must have the right to upload submitted images and information. Personal information is handled according to the Privacy Policy and must not be used for spam or unauthorized disclosure.
        </Term>
        <Term title="Limitation">
          To the extent permitted by law, FSD Home Services is not responsible for indirect losses, worker conduct, customer conduct or agreements made outside the platform’s documented workflow.
        </Term>
      </section>
    </>
  );
}

function Term({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{children}</p>
    </div>
  );
}
