import { Phone } from 'lucide-react';
import {
  SUPPORT_NAME,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  WhatsAppButton
} from './WhatsAppButton';

export function SupportContactCard({ className = '', compact = false }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <p className="text-sm font-bold text-brand-700">Customer Support</p>
      <h2 className={`${compact ? 'text-lg' : 'text-2xl'} mt-1 font-bold text-slate-950`}>{SUPPORT_NAME}</h2>
      <p className="mt-2 text-slate-600">Need help choosing a worker? Contact us directly.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <WhatsAppButton prefilled className="w-full">WhatsApp: {SUPPORT_PHONE_DISPLAY}</WhatsAppButton>
        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-bold text-slate-900 hover:bg-slate-50"
        >
          <Phone size={19} aria-hidden="true" />
          Call: {SUPPORT_PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
