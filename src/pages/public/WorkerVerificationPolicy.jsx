import { BulletList, ContactBlock, Paragraphs, PolicyPage, PolicySection } from '../../components/legal/PolicyPage';

export function WorkerVerificationPolicy() {
  return (
    <PolicyPage title="Worker Verification Policy" intro="How worker applications are reviewed and what verification means. Last updated: July 2026.">
      <PolicySection title="Introduction">
        <Paragraphs items={[
          "This Worker Verification Policy explains how FSD Home Services reviews worker applications and what the Platform's verification status means.",
          'Verification helps improve trust between customers and workers but does not guarantee future performance.'
        ]} />
      </PolicySection>
      <PolicySection title="1. Purpose">
        <p>The purpose of verification is to:</p>
        <BulletList items={['reduce fake registrations', 'improve customer confidence', 'maintain Platform quality', 'verify submitted identity information', 'review worker profiles before they become publicly visible']} />
        <p>Verification is an internal approval process only.</p>
      </PolicySection>
      <PolicySection title="2. Required Information">
        <p>Applicants may be asked to provide:</p>
        <BulletList items={['Full name', 'Phone number', 'Profile photograph', 'CNIC or other identification', 'Services offered', 'Experience details', 'Service areas', 'Work photographs', 'Pricing information', 'Any additional information reasonably required by the Platform']} />
        <p>Providing false information may result in rejection or permanent removal.</p>
      </PolicySection>
      <PolicySection title="3. Review Process">
        <p>Every application is manually reviewed.</p>
        <p>During review we may:</p>
        <BulletList items={['verify submitted information', 'request additional documents', 'request clearer photographs', 'request profile updates', 'reject incomplete applications', 'reject misleading applications']} />
        <Paragraphs items={['Approval times may vary depending on workload.', 'Submitting an application does not guarantee approval.']} />
      </PolicySection>
      <PolicySection title="4. Verification Does Not Mean">
        <p>Verification does not mean that FSD Home Services guarantees:</p>
        <BulletList items={['workmanship', 'professionalism', 'future behavior', 'honesty', 'punctuality', 'licensing', 'insurance', 'experience level', 'customer satisfaction']} />
        <p>Customers should always make their own decisions before hiring a worker.</p>
      </PolicySection>
      <PolicySection title="5. Grounds for Rejection">
        <p>Applications may be rejected for reasons including:</p>
        <BulletList items={['incomplete information', 'fake identity', 'false experience claims', 'poor quality photographs', 'duplicate accounts', 'abusive behaviour', 'misleading information', 'suspicious activity', 'inability to verify submitted information']} />
        <p>FSD Home Services is not required to publicly explain every rejection decision.</p>
      </PolicySection>
      <PolicySection title="6. Ongoing Verification">
        <Paragraphs items={['Approval is not permanent.', 'Workers may be reviewed again at any time.', 'The Platform may request updated:']} />
        <BulletList items={['profile photographs', 'work photographs', 'identity information', 'experience details']} />
        <p>Failure to cooperate may result in profile suspension.</p>
      </PolicySection>
      <PolicySection title="7. Profile Suspension">
        <p>A verified profile may be suspended if the worker:</p>
        <BulletList items={['repeatedly receives serious complaints', 'submits false information', 'refuses to pay Platform commission', 'abuses customers', 'violates the Terms of Service', 'commits fraud', 'engages in illegal activity', 'damages the reputation of the Platform']} />
        <p>Suspended profiles may become temporarily or permanently unavailable.</p>
      </PolicySection>
      <PolicySection title="8. Customer Complaints">
        <p>Customer complaints may be considered during future reviews.</p>
        <p>Multiple serious complaints may affect:</p>
        <BulletList items={['profile visibility', 'verification status', 'future customer leads', 'continued Platform access']} />
      </PolicySection>
      <PolicySection title="9. Re-Application">
        <Paragraphs items={['Rejected or suspended workers may be allowed to submit a new application after correcting the issues identified by the Platform.', 'Approval of future applications is entirely at the discretion of FSD Home Services.']} />
      </PolicySection>
      <PolicySection title="10. Platform Rights">
        <p>FSD Home Services reserves the right to:</p>
        <BulletList items={['approve or reject any application', 'request additional verification', 'suspend profiles', 'permanently remove profiles', 'modify verification requirements at any time']} />
        <p>These decisions are made to protect the Platform, workers, and customers.</p>
      </PolicySection>
      <PolicySection title="11. Contact">
        <ContactBlock subject="worker verification" />
      </PolicySection>
    </PolicyPage>
  );
}
