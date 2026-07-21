import { BulletList, ContactBlock, Paragraphs, PolicyPage, PolicySection } from '../../components/legal/PolicyPage';

export function CommissionPolicy() {
  return (
    <PolicyPage title="Commission Policy" intro="How platform commissions are calculated and collected for workers. Last updated: July 2026.">
      <PolicySection title="Introduction">
        <Paragraphs items={[
          'This Commission Policy explains how platform commissions are calculated and collected for workers using FSD Home Services.',
          'By registering as a worker or accepting customer leads through the Platform, you agree to this Commission Policy.'
        ]} />
      </PolicySection>
      <PolicySection title="1. Purpose">
        <p>FSD Home Services invests time and resources into:</p>
        <BulletList items={['marketing services', 'attracting customers', 'maintaining the website', 'verifying workers', 'handling customer support', 'managing service requests', 'improving the Platform']} />
        <p>The platform commission helps cover these operational costs.</p>
      </PolicySection>
      <PolicySection title="2. Commission Rate">
        <p>Workers agree to pay <strong className="text-slate-950">10% of the final agreed job value</strong> for every successfully completed job received through FSD Home Services.</p>
        <div className="overflow-x-auto">
          <table className="min-w-72 border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-950">
                <th className="py-2 pr-8 font-bold">Job Value</th>
                <th className="py-2 font-bold">Commission</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['PKR 2,000', 'PKR 200'],
                ['PKR 5,000', 'PKR 500'],
                ['PKR 10,000', 'PKR 1,000'],
                ['PKR 20,000', 'PKR 2,000']
              ].map(([jobValue, commission]) => (
                <tr key={jobValue} className="border-b border-slate-100">
                  <td className="py-2 pr-8">{jobValue}</td>
                  <td className="py-2">{commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>The commission is calculated using the final amount agreed between the customer and the worker.</p>
      </PolicySection>
      <PolicySection title="3. When Commission Becomes Payable">
        <p>Commission becomes due immediately after the job has been successfully completed.</p>
        <p>This applies regardless of how the customer pays, including:</p>
        <BulletList items={['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Any other payment method']} />
      </PolicySection>
      <PolicySection title="4. Jobs Covered">
        <p>Commission applies to every job that:</p>
        <BulletList items={['originated through FSD Home Services', 'was assigned through the Platform', 'resulted from a customer lead provided by the Platform']} />
      </PolicySection>
      <PolicySection title="5. Future Work">
        <p>If a customer first discovered a worker through FSD Home Services, any additional work directly related to the original lead may also be subject to the Platform commission, unless otherwise agreed in writing by FSD Home Services.</p>
      </PolicySection>
      <PolicySection title="6. Attempting to Avoid Commission">
        <p>Workers must not intentionally avoid paying commission by:</p>
        <BulletList items={['asking customers to contact them outside the Platform before accepting the lead', 'hiding the final job value', 'reporting false prices', 'claiming a completed job was cancelled', 'creating duplicate worker accounts', "using another person's account"]} />
        <p>Any attempt to avoid commission may result in:</p>
        <BulletList items={['warning', 'temporary suspension', 'permanent account removal', 'refusal of future customer leads']} />
      </PolicySection>
      <PolicySection title="7. Manual Collection">
        <Paragraphs items={['FSD Home Services currently collects commission manually.', 'Workers agree to cooperate honestly during commission collection.', 'Future payment methods may include online payments, wallets, bank transfers, or automated billing.']} />
      </PolicySection>
      <PolicySection title="8. Late or Unpaid Commission">
        <p>If commission remains unpaid, FSD Home Services may:</p>
        <BulletList items={['temporarily hide the worker profile', 'pause new customer leads', 'suspend the worker account', 'permanently remove the account', 'refuse future registration']} />
        <p>Repeated non-payment may result in permanent removal from the Platform.</p>
      </PolicySection>
      <PolicySection title="9. Commission Changes">
        <Paragraphs items={['FSD Home Services may change commission rates in the future.', 'Workers will be notified before new rates apply.', 'Changes will never apply retroactively to completed jobs.']} />
      </PolicySection>
      <PolicySection title="10. Disputes">
        <Paragraphs items={['If a worker believes a commission was calculated incorrectly, they should contact FSD Home Services as soon as possible.', 'The Platform may request supporting information before making a final decision.']} />
      </PolicySection>
      <PolicySection title="11. Contact">
        <ContactBlock subject="commission-related questions" />
      </PolicySection>
    </PolicyPage>
  );
}
