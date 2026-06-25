import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { services } from '../../data/catalog';

const siteUrl = 'https://fsd-home-services.vercel.app';
const defaultDescription = 'Request verified plumbers, electricians, AC technicians, carpenters, painters, masons and laborers across Faisalabad.';

const pageMeta = {
  '/': ['FSD Home Services | Verified Workers in Faisalabad', defaultDescription],
  '/services': ['Home Services in Faisalabad | FSD Home Services', 'Browse verified home service categories available across Faisalabad.'],
  '/workers': ['Verified Workers in Faisalabad | FSD Home Services', 'Browse admin-approved local workers without exposing private phone numbers.'],
  '/become-a-worker': ['Become a Verified Worker | FSD Home Services', 'Apply to join FSD Home Services as a verified local worker in Faisalabad.'],
  '/request-service': ['Request a Worker in Faisalabad | FSD Home Services', 'Submit a free request for a verified local worker in Faisalabad.'],
  '/contact': ['Customer Care | FSD Home Services', 'Contact FSD Home Services customer support by WhatsApp or phone.'],
  '/privacy': ['Privacy Policy | FSD Home Services', 'How FSD Home Services collects, uses, stores and protects customer and worker information.'],
  '/terms': ['Terms of Service | FSD Home Services', 'Terms for customers and workers using the FSD Home Services marketplace.']
};

export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const service = pathname.startsWith('/services/')
      ? services.find((item) => `/services/${item.slug}` === pathname)
      : null;
    const [title, description] = service
      ? [
        `${service.name} in Faisalabad | FSD Home Services`,
        `${service.description} Request an admin-approved ${service.name.toLowerCase()} in Faisalabad.`
      ]
      : pageMeta[pathname] || ['Page Not Found | FSD Home Services', defaultDescription];
    const canonicalUrl = `${siteUrl}${pathname === '/' ? '' : pathname}`;
    const privateRoute = pathname === '/login'
      || pathname.startsWith('/admin')
      || pathname.startsWith('/review/')
      || pathname.startsWith('/worker');

    document.title = title;
    setMeta('description', description);
    setMeta('robots', privateRoute ? 'noindex, nofollow' : 'index, follow');
    setPropertyMeta('og:title', title);
    setPropertyMeta('og:description', description);
    setPropertyMeta('og:url', canonicalUrl);
    setPropertyMeta('og:type', 'website');
    setPropertyMeta('og:image', `${siteUrl}/images/home-services-hero.jpg`);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
}

function setMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setPropertyMeta(property, content) {
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}
