import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { FloatingWhatsAppButton } from '../support/FloatingWhatsAppButton';
import {
  SUPPORT_NAME,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  WHATSAPP_URL,
  WhatsAppButton
} from '../support/WhatsAppButton';
import { RouteMeta } from './RouteMeta';

const navItems = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/workers', 'Workers'],
  ['/become-a-worker', 'Become a Worker'],
  ['/request-service', 'Request Service'],
  ['/contact', 'Contact']
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const workerDashboard = pathname === '/worker' || pathname.startsWith('/worker/');

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <RouteMeta />
      {!workerDashboard && <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="focus-ring shrink-0 rounded-lg" aria-label="FSD Home Services home">
            <img
              src="/branding/fsd-home-services-logo.png"
              alt="FSD Home Services"
              className="h-11 w-auto max-w-[190px] object-contain sm:h-12 sm:max-w-[220px]"
            />
          </Link>
          <button
            className="focus-ring rounded-lg border border-slate-200 p-2 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <Menu size={22} />
          </button>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <WhatsAppButton compact className="ml-1">WhatsApp Us</WhatsAppButton>
          </nav>
        </div>
        {open && (
          <nav className="grid gap-1 border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            {navItems.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {label}
              </NavLink>
            ))}
            <WhatsAppButton className="mt-2 w-full">WhatsApp Us</WhatsAppButton>
          </nav>
        )}
      </header>}
      <main>
        <Outlet />
      </main>
      {!workerDashboard && <FloatingWhatsAppButton />}
      {!workerDashboard && <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/branding/fsd-home-services-logo.png"
              alt="FSD Home Services"
              className="h-14 w-auto max-w-full object-contain"
              loading="lazy"
            />
            <p className="mt-2">Verified local service leads for Faisalabad. Phone numbers stay private.</p>
          </div>
          <div>Serving People Colony, Madina Town, D Ground, Samanabad, Gulberg, Canal Road, and more.</div>
          <div>Customers request free. Workers pay a 10% platform commission on completed jobs.</div>
          <div>
            <strong className="text-slate-950">Customer Support</strong>
            <p className="mt-2 font-semibold text-slate-800">{SUPPORT_NAME}</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-[#128C4A] hover:underline">
              WhatsApp: {SUPPORT_PHONE_DISPLAY}
            </a>
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="mt-1 block font-semibold text-brand-700 hover:underline">
              Call: {SUPPORT_PHONE_DISPLAY}
            </a>
            <p className="mt-2">Need help choosing a worker? Contact us directly.</p>
            <div className="mt-3 flex gap-3">
              <Link to="/privacy" className="font-semibold text-brand-700 hover:underline">Privacy</Link>
              <Link to="/terms" className="font-semibold text-brand-700 hover:underline">Terms</Link>
            </div>
          </div>
        </div>
      </footer>}
    </div>
  );
}
