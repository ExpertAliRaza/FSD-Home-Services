import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { areas, services } from '../../data/catalog';
import { serviceReviews } from '../../data/serviceReviews';

const siteUrl = 'https://fsd-home-services.vercel.app';
const businessId = `${siteUrl}/#business`;
const defaultDescription = 'Request verified plumbers, electricians, AC technicians, carpenters, painters, masons and laborers across Faisalabad.';

const pageMeta = {
  '/': ['FSD Home Services | Verified Workers in Faisalabad', defaultDescription],
  '/services': ['Home Services in Faisalabad | FSD Home Services', 'Browse verified home service categories available across Faisalabad.'],
  '/workers': ['Verified Workers in Faisalabad | FSD Home Services', 'Browse admin-approved local workers without exposing private phone numbers.'],
  '/about': ['About FSD Home Services | Verified Local Workers in Faisalabad', 'Learn about FSD Home Services, our mission, worker verification process and how we help homeowners across Faisalabad connect with trusted local professionals.'],
  '/become-a-worker': ['Become a Verified Worker | FSD Home Services', 'Apply to join FSD Home Services as a verified local worker in Faisalabad.'],
  '/request-service': ['Request a Worker in Faisalabad | FSD Home Services', 'Submit a free request for a verified local worker in Faisalabad.'],
  '/contact': ['Customer Care | FSD Home Services', 'Contact FSD Home Services customer support by WhatsApp or phone.'],
  '/privacy': ['Privacy Policy | FSD Home Services', 'How FSD Home Services collects, uses, stores and protects customer and worker information.'],
  '/terms': ['Terms of Service | FSD Home Services', 'Terms for customers and workers using the FSD Home Services marketplace.'],
  '/commission-policy': ['Commission Policy | FSD Home Services', 'How FSD Home Services calculates and collects worker platform commission.'],
  '/worker-verification-policy': ['Worker Verification Policy | FSD Home Services', 'How FSD Home Services reviews worker applications and verification status.']
};

const organizationSchema = {
  '@type': 'Organization',
  '@id': businessId,
  name: 'FSD Home Services',
  url: siteUrl,
  logo: `${siteUrl}/branding/FSD Home Services logo.png`,
  description: 'Verified local service marketplace connecting homeowners with trusted plumbers, electricians, AC technicians, carpenters, painters, masons and other professionals across Faisalabad.',
  areaServed: {
    '@type': 'City',
    name: 'Faisalabad'
  },
  sameAs: [
    'https://www.facebook.com/FSD.Home.Services/',
    'https://www.instagram.com/fsd_home_services/',
    'https://www.linkedin.com/company/134874243',
    'https://www.tiktok/@fsdhomeservices'
  ]
};

const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  url: siteUrl,
  name: 'FSD Home Services',
  description: defaultDescription,
  publisher: { '@id': businessId },
  inLanguage: 'en-PK'
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
      title,
      services
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

function setRouteStructuredData({ canonicalUrl, description, pathname, privateRoute, service, title, services }) {
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
      title,
      services
    }));
}

function buildRouteStructuredData({ canonicalUrl, description, pathname, service, title, services }) {
  const graph = [
    organizationSchema,
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

  if (pathname === '/') {
    graph.push(websiteSchema);
  }

  if (service) {
    const serviceReviewData = serviceReviews[service.name];
    const reviews = serviceReviewData && serviceReviewData.length > 0
      ? serviceReviewData.slice(0, 8)
      : [];
    const aggregateRating = reviews.length
      ? {
          '@type': 'AggregateRating',
          ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1
        }
      : undefined;

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
      termsOfService: `${siteUrl}/terms`,
      ...(aggregateRating ? { aggregateRating } : {}),
      ...(reviews.length ? {
        review: reviews.map((review) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: review.name },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1
          },
          reviewBody: review.text
        }))
      } : {})
    });

    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Services', `${siteUrl}/services`],
      [`${service.name} in Faisalabad`, canonicalUrl]
    ]));
  } else if (pathname === '/services') {
    graph.push({
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': businessId },
      inLanguage: 'en-PK',
      mainEntity: {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#service-list`,
        name: 'Home services in Faisalabad',
        itemListElement: services.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: `${item.name} in Faisalabad`,
          url: `${siteUrl}/services/${item.slug}`
        }))
      }
    });
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Services', canonicalUrl]
    ]));
  } else if (pathname === '/about') {
    graph.push({
      '@type': 'AboutPage',
      '@id': `${canonicalUrl}#aboutpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': businessId },
      inLanguage: 'en-PK'
    });
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['About', canonicalUrl]
    ]));
  } else if (pathname === '/contact') {
    graph.push({
      '@type': 'ContactPage',
      '@id': `${canonicalUrl}#contactpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': businessId },
      inLanguage: 'en-PK'
    });
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Contact', canonicalUrl]
    ]));
  } else if (pathname === '/request-service') {
    graph.push({
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#requestpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': businessId },
      inLanguage: 'en-PK'
    });
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Request Service', canonicalUrl]
    ]));
  } else if (pathname === '/workers') {
    graph.push({
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#workerspage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': businessId },
      inLanguage: 'en-PK'
    });
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Workers', canonicalUrl]
    ]));
  } else if (pathname === '/become-a-worker') {
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Become a Worker', canonicalUrl]
    ]));
  } else if (pathname === '/privacy') {
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Privacy Policy', canonicalUrl]
    ]));
  } else if (pathname === '/terms') {
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Terms of Service', canonicalUrl]
    ]));
  } else if (pathname === '/commission-policy') {
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Commission Policy', canonicalUrl]
    ]));
  } else if (pathname === '/worker-verification-policy') {
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Worker Verification Policy', canonicalUrl]
    ]));
  } else if (pathname === '/refer-and-earn') {
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Refer and Earn', canonicalUrl]
    ]));
  } else if (pathname.startsWith('/workers/')) {
    graph.push({
      '@type': 'ProfilePage',
      '@id': `${canonicalUrl}#profilepage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': businessId },
      inLanguage: 'en-PK'
    });
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Workers', `${siteUrl}/workers`],
      ['Worker Profile', canonicalUrl]
    ]));
  } else if (pathname === '/review') {
    graph.push(buildBreadcrumbStructuredData([
      ['Home', siteUrl],
      ['Review', canonicalUrl]
    ]));
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
