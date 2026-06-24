import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { services } from '../../data/catalog';

export function Services() {
  return (
    <>
      <PageHeader eyebrow="Services" title="Verified home services across Faisalabad">
        Select a category, choose your area, and our admin team will assign an approved worker.
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link key={service.slug} to={`/services/${service.slug}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:border-brand-500 hover:shadow-soft">
            <img src={service.image} alt={`${service.name} working in a Faisalabad home`} className="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
            <div className="p-5">
              <h2 className="text-xl font-bold text-slate-950">{service.name} Faisalabad</h2>
              <p className="mt-2 text-slate-600">{service.description}</p>
              <p className="mt-4 text-sm font-bold text-brand-700">Request {service.name}</p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
