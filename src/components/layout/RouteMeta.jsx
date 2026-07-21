import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { areas, services } from '../../data/catalog';

const siteUrl = 'https://fsd-home-services.vercel.app';
const businessId = `${siteUrl}/#business`;
const defaultDescription = 'Request verified plumbers, electricians, AC technicians, carpenters, painters, masons and laborers across Faisalabad.';

const pageMeta = {
  '/': ['FSD Home Services | Verified Workers in Faisalabad', defaultDescription],
  '/services': ['Home Services in Faisalabad | FSD Home Services', 'Browse verified home service categories available across Faisalabad.'],
  '/workers': ['Verified Workers in Faisalabad | FSD Home Services', 'Browse admin-approved local workers without exposing private phone numbers.'],
  '/become-a-worker': ['Become a Verified Worker | FSD Home Services', 'Apply to join FSD Home Services as a verified local worker in Faisalabad.'],
  '/request-service': ['Request a Worker in Faisalabad | FSD Home Services', 'Submit a free request for a verified local worker in Faisalabad.'],
  '/contact': ['Customer Care | FSD Home Services', 'Contact FSD Home Services customer support by WhatsApp or phone.'],
  '/privacy': ['Privacy Policy | FSD Home Services', 'How FSD Home Services collects, uses, stores and protects customer and worker information.'],
  '/terms': ['Terms of Service | FSD Home Services', 'Terms for customers and workers using the FSD Home Services marketplace.'],
  '/commission-policy': ['Commission Policy | FSD Home Services', 'How FSD Home Services calculates and collects worker platform commission.'],
  '/worker-verification-policy': ['Worker Verification Policy | FSD Home Services', 'How FSD Home Services reviews worker applications and verification status.']
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
      || pathname === '/worker'
      || pathname.startsWith('/worker/');

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

    setRouteStructuredData({
      canonicalUrl,
      description,
      pathname,
      privateRoute,
      service,
      title
    });
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

function setRouteStructuredData({ canonicalUrl, description, pathname, privateRoute, service, title }) {
  let element = document.querySelector('script[data-route-structured-data="true"]');

  if (privateRoute) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.routeStructuredData = 'true';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(buildRouteStructuredData({
    canonicalUrl,
    description,
    pathname,
    service,
    title
  }));
}

function buildRouteStructuredData({ canonicalUrl, description, pathname, service, title }) {
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': businessId },
      inLanguage: 'en-PK'
    }
  ];

  if (service) {
    graph.push({
      '@type': 'Service',
      '@id': `${canonicalUrl}#service`,
      name: `${service.name} in Faisalabad`,
      serviceType: service.name,
      description: service.description,
      url: canonicalUrl,
      image: `${siteUrl}${service.image}`,
      provider: { '@id': businessId },
      areaServed: areaServedStructuredData(),
      keywords: service.keywords,
      termsOfService: `${siteUrl}/terms`
    });
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Services', `${siteUrl}/services`],
      [`${service.name} in Faisalabad`, canonicalUrl]
    ]));
  } else if (pathname === '/services') {
    graph.push({
      '@type': 'ItemList',
      '@id': `${canonicalUrl}#service-list`,
      name: 'Home services in Faisalabad',
      itemListElement: services.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${item.name} in Faisalabad`,
        url: `${siteUrl}/services/${item.slug}`
      }))
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

function areaServedStructuredData() {
  return [
    { '@type': 'City', name: 'Faisalabad' },
    ...areas.map((area) => ({ '@type': 'Place', name: area }))
  ];
}

function buildBreadcrumbStructuredData(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item
    }))
  };
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
