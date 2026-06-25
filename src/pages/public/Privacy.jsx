import { PageHeader } from '../../components/layout/PageHeader';

export function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy">
        How FSD Home Services handles customer, worker and support information.
      </PageHeader>
      <LegalContent>
        <Section title="Information we collect">
          Customers provide their name, phone number, area, service request details, preferred time and optional problem images. Workers provide account details, phone number, CNIC number and images, profile photo, service experience, covered areas, availability, visit charges and work images.
        </Section>
        <Section title="How information is used">
          Information is used to review service requests, verify workers, coordinate assignments, provide support, investigate complaints, record commissions and protect the platform from misuse.
        </Section>
        <Section title="Private contact information">
          Customer and worker phone numbers are not published in the public directory. Contact details are available only to authorized platform administrators and, where operationally required, the assigned parties.
        </Section>
        <Section title="CNIC and uploaded images">
          CNIC details and verification images are stored in restricted systems for identity review, fraud prevention and worker verification. Work, profile and problem images are used only for marketplace and service operations.
        </Section>
        <Section title="Data retention">
          Request, assignment, complaint and commission records may be retained for operational, dispute and legal purposes. Rejected or inactive worker verification data will be reviewed periodically and deleted when it is no longer reasonably required.
        </Section>
        <Section title="User choices and contact">
          Users may request correction or deletion of eligible information by contacting Customer Support. Some records may be retained where required for fraud prevention, disputes or legal obligations.
        </Section>
        <Section title="Security">
          FSD Home Services uses access controls, private storage and database security policies. No online system is risk-free, and users should avoid submitting unnecessary sensitive information.
        </Section>
      </LegalContent>
    </>
  );
}

function LegalContent({ children }) {
  return <section className="mx-auto grid max-w-4xl gap-5 px-4 py-8">{children}</section>;
}

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{children}</p>
    </div>
  );
}
