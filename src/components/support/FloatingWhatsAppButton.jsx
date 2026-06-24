import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_REQUEST_URL } from './WhatsAppButton';

export function FloatingWhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname === '/login') return null;

  return (
    <a
      href={WHATSAPP_REQUEST_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with FSD Home Services on WhatsApp"
      className="focus-ring fixed bottom-4 right-4 z-30 inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-[#128C4A] px-3 text-sm font-bold text-white shadow-lg hover:bg-[#0f7a40] sm:bottom-6 sm:right-6 sm:rounded-lg sm:px-4"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
