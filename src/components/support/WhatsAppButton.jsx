import { MessageCircle } from 'lucide-react';

export const SUPPORT_NAME = 'Ali Raza';
export const SUPPORT_PHONE_DISPLAY = '03099018308';
export const SUPPORT_PHONE_TEL = '+923099018308';
export const WHATSAPP_URL = 'https://wa.me/923099018308';
export const WHATSAPP_REQUEST_URL = `${WHATSAPP_URL}?text=Hi%20FSD%20Home%20Services%2C%20I%20need%20a%20verified%20worker%20in%20Faisalabad.`;

export function WhatsAppButton({
  children = 'WhatsApp Us',
  className = '',
  compact = false,
  prefilled = false
}) {
  return (
    <a
      href={prefilled ? WHATSAPP_REQUEST_URL : WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#128C4A] px-4 py-2.5 font-bold text-white hover:bg-[#0f7a40] ${compact ? 'text-sm' : ''} ${className}`}
    >
      <MessageCircle size={19} aria-hidden="true" />
      {children}
    </a>
  );
}
