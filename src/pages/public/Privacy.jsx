import { BulletList, ContactBlock, DefinitionList, Paragraphs, PolicyPage, PolicySection } from '../../components/legal/PolicyPage';

export function Privacy() {
  return (
    <PolicyPage title="Privacy Policy" intro="How FSD Home Services handles customer, worker and support information. Last updated: July 2026.">
      <PolicySection title="Introduction">
        <Paragraphs items={[
          'FSD Home Services ("we", "our", "us") respects your privacy and is committed to protecting the personal information you share with us.',
          'This Privacy Policy explains what information we collect, how we use it, when we share it, how we protect it, and the choices available to you when using FSD Home Services.',
          'By accessing or using the Platform, you agree to this Privacy Policy.'
        ]} />
      </PolicySection>
      <PolicySection title="1. About FSD Home Services">
        <Paragraphs items={[
          'FSD Home Services is a technology marketplace that connects customers with independent local service workers such as plumbers, electricians, carpenters, painters, AC technicians, masons, and other home service professionals.',
          'We do not directly provide these physical services. Our role is to facilitate connections between customers and workers.'
        ]} />
      </PolicySection>
      <PolicySection title="2. Information We Collect">
        <p>Depending on how you use the Platform, we may collect the following information.</p>
        <DefinitionList groups={[
          {
            title: 'Customer Information',
            items: ['Name', 'Phone number', 'Service request details', 'Service location or area', 'Preferred appointment information', 'Messages submitted through the Platform']
          },
          {
            title: 'Worker Information',
            items: ['Full name', 'Phone number', 'Profile photograph', 'CNIC or other identity information', 'Work photographs', 'Experience details', 'Services offered', 'Service areas', 'Pricing information', 'Availability', 'Verification documents']
          },
          {
            title: 'Technical Information',
            items: ['Browser type', 'Device type', 'Operating system', 'IP address', 'Pages visited', 'Referring website', 'Date and time of access', 'Basic diagnostic information', 'Cookies and similar technologies']
          }
        ]} />
        <p>This information helps us improve the Platform and maintain security.</p>
      </PolicySection>
      <PolicySection title="3. Why We Collect Information">
        <p>We collect information to:</p>
        <BulletList items={['create worker profiles', 'process customer service requests', 'connect customers with suitable workers', 'verify worker identities', 'prevent fraud and misuse', 'improve Platform functionality', 'respond to customer support requests', 'investigate complaints', 'maintain Platform security', 'comply with applicable legal obligations']} />
        <p>We only collect information that is reasonably necessary for operating the Platform.</p>
      </PolicySection>
      <PolicySection title="4. How We Use Your Information">
        <p>Your information may be used to:</p>
        <BulletList items={['display approved worker profiles', 'contact you regarding service requests', 'verify submitted information', 'approve or reject worker applications', 'manage commissions', 'improve user experience', 'monitor Platform performance', 'prevent abuse', 'investigate suspicious activity', 'respond to legal requests where required by law']} />
      </PolicySection>
      <PolicySection title="5. Information Visible to Other Users">
        <p>To help customers choose suitable workers, approved worker profiles may display information such as:</p>
        <BulletList items={['first name or full name', 'profile photograph', 'profession', 'experience', 'service areas', 'ratings (when available)', 'phone number or approved contact method']} />
        <p>Verification documents such as CNIC images are <strong className="text-slate-950">never displayed publicly</strong>.</p>
      </PolicySection>
      <PolicySection title="6. Identity Verification">
        <Paragraphs items={[
          'Workers may be asked to provide identity documents such as CNIC for verification purposes.',
          'These documents are used only for identity verification, fraud prevention, and Platform administration.',
          'Identity documents are not publicly visible and are accessible only to authorized administrators where required for Platform operations.'
        ]} />
      </PolicySection>
      <PolicySection title="7. Customer Service Requests">
        <Paragraphs items={['When a customer submits a request, we may share the necessary information with a suitable worker so the requested service can be arranged.', 'Only information reasonably required to perform the requested service will be shared.']} />
      </PolicySection>
      <PolicySection title="8. Communications">
        <p>We may contact users regarding:</p>
        <BulletList items={['account approval', 'service requests', 'customer support', 'commission reminders', 'important Platform updates', 'security notices', 'policy changes']} />
        <p>These communications may be made by phone, WhatsApp, email, or other available communication methods.</p>
      </PolicySection>
      <PolicySection title="9. Cookies">
        <p>The Platform may use cookies and similar technologies to:</p>
        <BulletList items={['keep the website functioning correctly', 'improve performance', 'remember user preferences', 'understand website usage', 'improve security']} />
        <p>Users may disable cookies through their browser settings, although some features may not function correctly.</p>
      </PolicySection>
      <PolicySection title="10. Analytics">
        <Paragraphs items={['We may use analytics tools to better understand how visitors use the Platform.', 'Analytics information is used in aggregate form to improve performance and user experience.', 'Where possible, this information is anonymized.']} />
      </PolicySection>
      <PolicySection title="11. Data Security">
        <p>We implement reasonable administrative, technical, and organizational measures to protect personal information against:</p>
        <BulletList items={['unauthorized access', 'accidental loss', 'misuse', 'disclosure', 'alteration', 'destruction']} />
        <Paragraphs items={['However, no website or internet transmission can be guaranteed to be completely secure.', 'Users provide information at their own risk.']} />
      </PolicySection>
      <PolicySection title="12. Information Sharing">
        <p>We do not sell your personal information.</p>
        <p>We may share information only when reasonably necessary, including:</p>
        <BulletList items={['between customers and workers to facilitate requested services', 'with trusted technology providers who help operate the Platform', 'where required by law', 'to investigate fraud or illegal activity', 'to protect our legal rights', 'to respond to valid legal requests']} />
      </PolicySection>
      <PolicySection title="13. Third-Party Services">
        <Paragraphs items={['The Platform may rely on third-party services for hosting, databases, analytics, communications, or security.', 'These providers process information only to the extent necessary to deliver their services.', 'Their handling of information is governed by their own privacy policies.']} />
      </PolicySection>
      <PolicySection title="14. Data Retention">
        <p>We retain personal information only for as long as reasonably necessary to:</p>
        <BulletList items={['operate the Platform', 'comply with legal obligations', 'resolve disputes', 'enforce our Terms of Service', 'prevent fraud']} />
        <p>Verification records may be retained for a reasonable period even after an account is removed where legally permitted.</p>
      </PolicySection>
      <PolicySection title="15. Your Rights">
        <p>Subject to applicable law, users may request to:</p>
        <BulletList items={['access their personal information', 'update inaccurate information', 'correct profile details', 'remove certain information', 'close their account', 'request deletion of personal data where legally permitted']} />
        <p>Some information may need to be retained to comply with legal or operational obligations.</p>
      </PolicySection>
      <PolicySection title="16. Children's Privacy">
        <Paragraphs items={['FSD Home Services is intended only for users who are at least 18 years old.', 'We do not knowingly collect personal information from children.', 'If we become aware that such information has been submitted, we may remove it.']} />
      </PolicySection>
      <PolicySection title="17. International Transfers">
        <Paragraphs items={['The technologies used to operate the Platform may store or process information on servers located in different countries.', 'By using the Platform, users acknowledge that their information may be processed outside Pakistan while appropriate safeguards are maintained where reasonably possible.']} />
      </PolicySection>
      <PolicySection title="18. Platform Security">
        <p>Users must keep their own devices and communication channels secure.</p>
        <p>FSD Home Services is not responsible for losses resulting from:</p>
        <BulletList items={['compromised phones', 'stolen devices', 'shared passwords', 'unauthorized access to user-controlled accounts']} />
      </PolicySection>
      <PolicySection title="19. Changes to this Privacy Policy">
        <Paragraphs items={['We may update this Privacy Policy from time to time.', 'Updated versions become effective immediately upon publication on the Platform.', 'Continued use of the Platform after updates constitutes acceptance of the revised Privacy Policy.']} />
      </PolicySection>
      <PolicySection title="20. Contact">
        <ContactBlock subject="this Privacy Policy or your personal information" />
      </PolicySection>
    </PolicyPage>
  );
}
