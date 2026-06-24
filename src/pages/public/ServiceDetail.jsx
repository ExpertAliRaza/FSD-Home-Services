import { Link, useParams } from 'react-router-dom';
import { RequestForm } from '../../components/forms/RequestForm';
import { PageHeader } from '../../components/layout/PageHeader';
import { areas, services } from '../../data/catalog';

export function ServiceDetail() {
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug) || services[0];

  document.title = `${service.name} in Faisalabad | FSD Home Services`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${service.description} Request a verified ${service.name.toLowerCase()} in Faisalabad. Phone numbers are kept private.`);

  return (
    <>
      <PageHeader eyebrow={service.keywords} title={`${service.name} in Faisalabad`}>
        {service.description} Submit a free request and our team will assign a verified worker shortly.
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[.85fr_1.15fr]">
        <div className="grid content-start gap-5">
          <img
            src={service.image}
            alt={`${service.name} providing home service in Faisalabad`}
            className="aspect-[3/2] w-full rounded-lg object-cover shadow-soft"
          />
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold">Local coverage</h2>
            <p className="mt-2 text-slate-600">Available in Faisalabad areas including:</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {areas.map((area) => <span key={area} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{area}</span>)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold">FAQ</h2>
            <Faq q={`Do you show ${service.name.toLowerCase()} phone numbers publicly?`} a="No. Phone numbers are kept private and requests go through the platform/admin." />
            <Faq q="Is customer signup required?" a="No. Customers can submit a service request without creating an account." />
            <Faq q="How are workers selected?" a="Admin reviews the request and manually assigns an approved worker." />
          </div>
          <Link to="/workers" className="rounded-lg bg-blue-600 px-5 py-3 text-center font-bold text-white hover:bg-blue-500">View Approved Workers</Link>
        </div>
        <div>
          <h2 className="mb-3 text-2xl font-bold">Request {service.name}</h2>
          <RequestForm initialService={service.name} />
        </div>
      </section>
    </>
  );
}

function Faq({ q, a }) {
  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <h3 className="font-bold">{q}</h3>
      <p className="mt-1 text-sm text-slate-600">{a}</p>
    </div>
  );
}
