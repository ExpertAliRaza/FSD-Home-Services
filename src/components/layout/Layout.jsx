import { Link, NavLink, Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import {
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  MessageCircle,
  Phone
} from 'lucide-react';
import { useState } from 'react';
import { useCatalog } from '../../contexts/CatalogContext';
import { FloatingWhatsAppButton } from '../support/FloatingWhatsAppButton';
import {
  SUPPORT_NAME,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  WHATSAPP_URL,
  WhatsAppButton
} from '../support/WhatsAppButton';
import { InstallAppButton, PwaInstallProvider } from '../pwa/PwaInstall';
import { RouteMeta } from './RouteMeta';

const navItems = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/about', 'About Us'],
  ['/workers', 'Workers'],
  ['/become-a-worker', 'Become a Worker'],
  ['/request-service', 'Request Service'],
  ['/contact', 'Contact']
];

const trustItems = ['Verified Workers', 'Manual Approval', 'Local Support'];

const socialLinks = [
  ['Facebook', 'https://www.facebook.com/FSD.Home.Services/', Facebook],
  ['Instagram', 'https://www.instagram.com/fsd_home_services/', Instagram],
  ['LinkedIn', 'https://www.linkedin.com/company/134874243', Linkedin],
  ['TikTok', 'https://www.tiktok.com/@fsdhomeservices', TikTokIcon]
];

function TikTokIcon({ size = 18, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function Layout() {
  const { services } = useCatalog();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const workerDashboard = pathname === '/worker'
    || (pathname.startsWith('/worker/') && pathname !== '/worker/login');

  return (
    <PwaInstallProvider>
      <div className="min-h-screen bg-slate-50 text-ink">
        <ScrollRestoration />
        <RouteMeta />
        {!workerDashboard && <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link to="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-lg" aria-label="FSD Home Services home">
              <img
                src="/branding/FSD Home Services logo.png"
                alt="FSD Home Services"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <span className="hidden font-bold text-brand-700 sm:inline">FSD Home Services</span>
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <InstallAppButton compact className="min-h-10" />
              <a
                href="tel:03099018308"
                aria-label="Call FSD Home Services at 0309 9018308"
                className="focus-ring inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 text-sm font-semibold text-slate-700"
              >
                <Phone size={16} className="shrink-0 text-brand-700" aria-hidden="true" />
                <span>0309 9018308</span>
              </a>
              <button
                className="focus-ring rounded-lg border border-slate-200 p-2"
                onClick={() => setOpen((value) => !value)}
                aria-label="Toggle navigation"
              >
                <Menu size={22} />
              </button>
            </div>
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
        {!workerDashboard && <SiteFooter services={services} />}
      </div>
    </PwaInstallProvider>
  );
}

function SiteFooter({ services }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.55fr_repeat(4,minmax(0,1fr))] xl:py-14">
        <section className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="focus-ring inline-flex items-center gap-3 rounded-lg" aria-label="FSD Home Services home">
            <img
              src="/branding/FSD Home Services logo.png"
              alt=""
              className="h-16 w-16 rounded-lg object-cover"
              loading="lazy"
            />
            <span className="text-xl font-bold text-white">FSD Home Services</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Connecting homeowners with verified plumbers, electricians, AC technicians, carpenters, painters, masons and other trusted local workers across Faisalabad.
          </p>
          <ul className="mt-5 grid gap-2 text-sm font-semibold text-slate-200">
            {trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-brand-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <FooterLinks title="Quick Links">
          {navItems.map(([to, label]) => (
            <li key={to}><FooterLink to={to}>{label}</FooterLink></li>
          ))}
        </FooterLinks>

        <FooterLinks title="Popular Services">
          {services.map((service) => (
            <li key={service.slug}>
              <FooterLink to={`/services/${service.slug}`}>
                {service.name === 'Laborer' ? 'Labor' : service.name}
              </FooterLink>
            </li>
          ))}
        </FooterLinks>

        <section className="border-t border-slate-800 pt-7 sm:border-t-0 sm:pt-0">
          <FooterHeading>Need Help?</FooterHeading>
          <p className="mt-4 font-bold text-white">{SUPPORT_NAME}</p>
          <a href={`tel:${SUPPORT_PHONE_TEL}`} className="mt-3 flex min-h-11 items-center gap-2 font-semibold text-slate-200 hover:text-white">
            <Phone size={18} className="text-brand-500" aria-hidden="true" />
            {SUPPORT_PHONE_DISPLAY}
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 font-semibold text-slate-200 hover:text-white">
            <MessageCircle size={18} className="text-brand-500" aria-hidden="true" />
            WhatsApp Support
          </a>
          <WhatsAppButton prefilled className="mt-3 w-full sm:w-auto">Chat on WhatsApp</WhatsAppButton>
          <InstallAppButton className="mt-3 w-full sm:w-auto" showIosNote variant="dark" />
          <p className="mt-3 text-xs leading-5 text-slate-400">We usually respond within a few minutes during working hours.</p>
        </section>

        <section className="text-center sm:text-left">
          <FooterHeading>Follow Us</FooterHeading>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start xl:grid">
            {socialLinks.map(([label, href, Icon]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 px-3 text-sm font-semibold text-slate-200 hover:border-brand-500 hover:bg-slate-900 hover:text-white"
                aria-label={`${label} (opens in a new tab)`}
              >
                <Icon size={18} className="text-brand-500" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-center text-sm text-slate-400 sm:flex-row sm:text-left">
          <p>© 2026 FSD Home Services</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end" aria-label="Legal">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/commission-policy" className="hover:text-white">Commission Policy</Link>
            <Link to="/worker-verification-policy" className="hover:text-white">Worker Verification Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }) {
  return <h2 className="text-sm font-bold uppercase text-white">{children}</h2>;
}

function FooterLinks({ title, children }) {
  return (
    <section>
      <FooterHeading>{title}</FooterHeading>
      <ul className="mt-4 grid gap-1 text-sm">{children}</ul>
    </section>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex min-h-9 items-center text-slate-400 hover:text-white">
      {children}
    </Link>
  );
}
