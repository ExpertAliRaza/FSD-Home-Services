import { BulletList, ContactBlock, Paragraphs, PolicyPage, PolicySection } from '../../components/legal/PolicyPage';

export function Terms() {
  return (
    <PolicyPage title="Terms of Service" intro="Rules for customers and workers using FSD Home Services. Last updated: July 2026.">
      <PolicySection title="Welcome">
        <Paragraphs items={[
          'Welcome to FSD Home Services.',
          'These Terms of Service ("Terms") govern your access to and use of the FSD Home Services website, platform, and related services ("Platform"). By accessing or using the Platform, you agree to be bound by these Terms.',
          'If you do not agree with these Terms, you should not use the Platform.'
        ]} />
      </PolicySection>
      <PolicySection title="1. About FSD Home Services">
        <Paragraphs items={[
          'FSD Home Services is a local services marketplace operating in Faisalabad, Pakistan.',
          'The Platform connects customers with independently operating workers such as plumbers, electricians, carpenters, AC technicians, painters, masons, and other service providers.',
          'FSD Home Services is a technology platform only.',
          'The Platform does not itself provide plumbing, electrical, construction, repair, maintenance, installation, or any other physical services.'
        ]} />
      </PolicySection>
      <PolicySection title="2. Marketplace Relationship">
        <p>FSD Home Services acts solely as an intermediary that introduces customers and independent workers.</p>
        <p>The Platform:</p>
        <BulletList items={[
          'does not employ workers',
          'does not supervise or control how work is performed',
          'does not guarantee the quality of services',
          'does not become a party to agreements between customers and workers'
        ]} />
        <p>Any agreement regarding work, pricing, scheduling, materials, or payment is entered directly between the customer and the worker.</p>
      </PolicySection>
      <PolicySection title="3. Independent Contractors">
        <Paragraphs items={[
          'Every worker using the Platform operates as an independent contractor.',
          'Nothing within these Terms creates an employment relationship, partnership, agency, franchise, or joint venture between FSD Home Services and any worker.',
          'Workers remain solely responsible for:'
        ]} />
        <BulletList items={['their work', 'taxes', 'licenses', 'insurance', 'legal compliance', 'tools and equipment', 'transportation', 'safety practices']} />
      </PolicySection>
      <PolicySection title="4. Eligibility">
        <p>Users must:</p>
        <BulletList items={['be at least 18 years old', 'provide accurate information', 'use the Platform only for lawful purposes']} />
        <p>FSD Home Services may refuse service to anyone at its sole discretion.</p>
      </PolicySection>
      <PolicySection title="5. Customer Responsibilities">
        <p>Customers agree to:</p>
        <BulletList items={[
          'provide accurate contact details',
          'provide an accurate service description',
          'disclose hazards before work begins',
          'disclose access restrictions',
          'agree pricing directly with the worker',
          'inspect completed work before making payment',
          'treat workers respectfully',
          'avoid abusive or illegal requests'
        ]} />
        <p>Customers remain responsible for verifying whether the selected worker meets their own expectations.</p>
      </PolicySection>
      <PolicySection title="6. Worker Responsibilities">
        <p>Workers agree to:</p>
        <BulletList items={[
          'submit truthful identity information',
          'submit accurate experience details',
          'maintain updated profile information',
          'perform work safely and professionally',
          'comply with applicable laws',
          'communicate honestly',
          'arrive within agreed time where reasonably possible',
          'respect customer property',
          'avoid misleading claims',
          'complete accepted work responsibly'
        ]} />
        <p>Workers must not submit fake documents, stolen photographs, false experience, or impersonate another individual.</p>
      </PolicySection>
      <PolicySection title="7. Verification">
        <p>Worker approval means only that submitted information has been reviewed according to the Platform&apos;s internal process.</p>
        <p>Verification does not guarantee:</p>
        <BulletList items={['skill level', 'experience', 'workmanship', 'licensing', 'honesty', 'future performance', 'reliability']} />
        <p>Customers remain responsible for making their own hiring decisions.</p>
      </PolicySection>
      <PolicySection title="8. Pricing">
        <Paragraphs items={[
          'FSD Home Services does not determine service prices.',
          'Customers and workers negotiate and agree pricing directly.',
          'The Platform is not responsible for:'
        ]} />
        <BulletList items={['pricing disagreements', 'overcharging', 'undercharging', 'discounts', 'refunds']} />
      </PolicySection>
      <PolicySection title="9. Platform Commission">
        <p>Workers agree to pay FSD Home Services a platform commission equal to <strong className="text-slate-950">10% of the final agreed job value</strong> for every successfully completed job received through the Platform.</p>
        <p>The commission becomes payable immediately after job completion regardless of whether payment was made by:</p>
        <BulletList items={['cash', 'bank transfer', 'EasyPaisa', 'JazzCash', 'any other payment method']} />
        <p>Failure to pay platform commission may result in account suspension or permanent removal.</p>
      </PolicySection>
      <PolicySection title="10. Payments">
        <Paragraphs items={['FSD Home Services does not currently process online payments.', 'Payments are made directly between customers and workers.', 'The Platform is not responsible for:']} />
        <BulletList items={['unpaid invoices', 'delayed payments', 'payment disputes', 'counterfeit currency', 'failed bank transfers', 'refund requests']} />
      </PolicySection>
      <PolicySection title="11. Cancellations">
        <Paragraphs items={['Customers and workers may cancel jobs before work begins.', 'Repeated cancellations, abuse, fake bookings, or misuse of the Platform may result in account suspension.']} />
      </PolicySection>
      <PolicySection title="12. Property Damage">
        <Paragraphs items={[
          'Workers are solely responsible for any damage they cause while performing services.',
          'Customers remain responsible for protecting valuable belongings before work begins.',
          'FSD Home Services accepts no responsibility for:'
        ]} />
        <BulletList items={['property damage', 'water damage', 'electrical damage', 'fire', 'broken fixtures', 'material loss', 'accidental damage']} />
      </PolicySection>
      <PolicySection title="13. Injuries and Safety">
        <Paragraphs items={['Customers must provide a reasonably safe working environment.', 'Workers must refuse unsafe work.', 'FSD Home Services is not responsible for:']} />
        <BulletList items={['workplace accidents', 'injuries', 'illness', 'death', 'unsafe premises', 'unsafe equipment', 'hazardous environments']} />
      </PolicySection>
      <PolicySection title="14. Theft, Fraud and Criminal Activity">
        <p>FSD Home Services does not tolerate fraud or illegal activity.</p>
        <p>Users must not:</p>
        <BulletList items={['submit fake identities', 'impersonate others', 'steal', 'scam', 'threaten', 'harass', 'extort', 'engage in illegal work']} />
        <Paragraphs items={['The Platform may immediately suspend or permanently remove accounts involved in suspected misconduct.', 'Where legally required, FSD Home Services may cooperate with law enforcement authorities.']} />
      </PolicySection>
      <PolicySection title="15. Prohibited Activities">
        <p>Users may not use the Platform to:</p>
        <BulletList items={['violate laws', 'promote illegal services', 'submit false information', 'upload copyrighted material without permission', 'send spam', 'abuse other users', 'manipulate reviews', 'interfere with Platform operations', 'distribute malware', 'attempt unauthorized access']} />
      </PolicySection>
      <PolicySection title="16. Worker Licensing">
        <Paragraphs items={['Certain services may legally require certifications or licenses.', 'Workers remain solely responsible for obtaining and maintaining all required licenses and permissions.', 'FSD Home Services does not guarantee that any worker holds licenses unless expressly stated.']} />
      </PolicySection>
      <PolicySection title="17. Taxes">
        <p>Workers are solely responsible for:</p>
        <BulletList items={['income tax', 'sales tax', 'business registrations', 'government reporting', 'regulatory compliance']} />
        <p>FSD Home Services does not provide tax advice.</p>
      </PolicySection>
      <PolicySection title="18. User Content">
        <Paragraphs items={['Users retain ownership of photographs and information they upload.', 'By uploading content, users grant FSD Home Services permission to store, display, and use such content for operating and promoting the Platform.', 'Users confirm that uploaded content does not violate any third-party rights.']} />
      </PolicySection>
      <PolicySection title="19. Privacy">
        <Paragraphs items={['Personal information is handled in accordance with the Privacy Policy.', 'Information such as names, phone numbers, profile photographs, work photographs, service areas, and identification documents may be collected to operate the Platform.']} />
      </PolicySection>
      <PolicySection title="20. Account Suspension">
        <p>FSD Home Services may suspend, restrict, or permanently remove any account without prior notice where it reasonably believes a user has:</p>
        <BulletList items={['violated these Terms', 'submitted false information', 'failed to pay commission', 'abused another user', 'engaged in fraud', "harmed the Platform's reputation", 'attempted to bypass Platform policies']} />
        <p>Platform decisions regarding account moderation are final.</p>
      </PolicySection>
      <PolicySection title="21. Off-Platform Deals">
        <Paragraphs items={['The Platform may introduce customers and workers who later communicate directly.', 'However, workers remain responsible for paying the applicable platform commission for jobs obtained through FSD Home Services.', 'Attempts to intentionally avoid platform commission may result in permanent account removal.']} />
      </PolicySection>
      <PolicySection title="22. Complaints">
        <Paragraphs items={['FSD Home Services may review complaints and request information from both parties.', 'However, the Platform is not obligated to resolve disputes.', 'Customers and workers remain responsible for resolving disagreements regarding:']} />
        <BulletList items={['pricing', 'workmanship', 'payment', 'scheduling', 'materials', 'warranties']} />
      </PolicySection>
      <PolicySection title="23. No Warranty">
        <Paragraphs items={['The Platform is provided on an "as is" and "as available" basis.', 'FSD Home Services makes no warranties regarding:']} />
        <BulletList items={['availability', 'uptime', 'worker availability', 'response times', 'workmanship', 'service quality', 'fitness for a particular purpose', 'uninterrupted access']} />
      </PolicySection>
      <PolicySection title="24. Limitation of Liability">
        <p>To the maximum extent permitted by applicable law, FSD Home Services, its owners, administrators, affiliates, employees, and representatives shall not be liable for any direct, indirect, incidental, special, consequential, exemplary, or punitive damages arising out of or relating to:</p>
        <BulletList items={['services performed by workers', 'customer conduct', 'worker conduct', 'property damage', 'personal injury', 'payment disputes', 'missed appointments', 'delays', 'business interruption', 'loss of income', 'loss of profits', 'data loss', 'fraud committed by users', 'agreements entered into between customers and workers']} />
        <p>Users acknowledge that all physical services are performed solely by independent workers and not by FSD Home Services.</p>
      </PolicySection>
      <PolicySection title="25. Indemnification">
        <p>Users agree to defend, indemnify, and hold harmless FSD Home Services, its owners, employees, affiliates, and representatives from any claims, damages, liabilities, losses, legal costs, or expenses arising from:</p>
        <BulletList items={['their use of the Platform', 'violation of these Terms', 'unlawful conduct', 'disputes with other users', 'services performed through the Platform']} />
      </PolicySection>
      <PolicySection title="26. Force Majeure">
        <p>FSD Home Services shall not be liable for delays or failures resulting from events beyond its reasonable control, including natural disasters, floods, earthquakes, government actions, internet outages, power failures, strikes, civil unrest, epidemics, or similar events.</p>
      </PolicySection>
      <PolicySection title="27. Changes to These Terms">
        <Paragraphs items={['FSD Home Services may update these Terms at any time.', 'Updated Terms become effective upon publication on the Platform.', 'Continued use of the Platform constitutes acceptance of the revised Terms.']} />
      </PolicySection>
      <PolicySection title="28. Governing Law">
        <Paragraphs items={['These Terms shall be governed by the laws of the Islamic Republic of Pakistan.', 'Any disputes relating to these Terms shall be subject to the competent courts of Faisalabad, Pakistan, unless otherwise required by applicable law.']} />
      </PolicySection>
      <PolicySection title="29. Contact">
        <ContactBlock subject="these Terms" />
      </PolicySection>
    </PolicyPage>
  );
}
