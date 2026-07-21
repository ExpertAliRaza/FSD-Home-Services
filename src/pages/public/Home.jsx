import { Link } from 'react-router-dom';
import { ArrowRight, Lock, MapPin, ShieldCheck, UserCheck } from 'lucide-react';
import { areas, services } from '../../data/catalog';

export function Home() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-12">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">Faisalabad verified home services</p>
            <h1 className="text-4xl font-bold tracking-normal text-slate-950 md:text-5xl lg:text-6xl">Hire Verified Plumbers, Electricians & Local Workers in Faisalabad.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">Skip the hassle of searching random phone numbers. Request admin-approved plumbers, electricians, AC technicians, carpenters, painters, masons and laborers across Faisalabad.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/request-service" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-600">
                Request a Worker <ArrowRight size={18} />
              </Link>
              <Link to="/become-a-worker" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 hover:border-brand-500 hover:text-brand-700">
                Become a Worker <ArrowRight size={18} />
              </Link>
            </div>
            <Link to="/workers" className="mt-4 inline-block text-sm font-bold text-brand-700 hover:underline">
              View Approved Workers
            </Link>
          </div>
          <div className="relative">
            <img
              src="/images/home-services-hero.jpg"
              alt="Plumber, electrician, and AC technician working in a Faisalabad home"
              className="aspect-[6/5] w-full rounded-lg object-cover shadow-soft"
            />
            <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
              <p className="text-sm font-bold text-slate-950">Verified local professionals</p>
              <p className="mt-0.5 text-xs text-slate-600">Every request is coordinated by our admin team.</p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <Trust icon={<ShieldCheck />} title="Verified Workers" text="Every profile is reviewed before approval." />
            <Trust icon={<Lock />} title="Trusted Requests" text="No random listings or unverified workers." />
            <Trust icon={<MapPin />} title="Local Coverage" text="Serving major areas across Faisalabad." />
            <Trust icon={<UserCheck />} title="Fast Assignment" text="Get connected with the right worker quickly." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Popular Services</h2>
            <p className="mt-1 text-slate-600">Choose a service and submit a free request.</p>
          </div>
          <Link to="/services" className="text-sm font-bold text-brand-700">All services</Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link key={service.slug} to={`/services/${service.slug}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-brand-500 hover:shadow-soft">
              <img src={service.image} alt={`${service.name} service`} className="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy" />
              <div className="p-4">
                <h3 className="font-bold text-slate-950">{service.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <img
            src="/images/locations/faisalabad-clock-tower.jpg"
            alt="Faisalabad Clock Tower and surrounding city market"
            className="aspect-video w-full rounded-lg object-cover shadow-soft"
            loading="lazy"
          />
          <div>
            <p className="text-sm font-bold text-brand-700">Local Faisalabad coverage</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Services across the city</h2>
            <p className="mt-2 text-slate-600">From central Faisalabad near Ghanta Ghar to major residential neighborhoods, every request is reviewed for local availability.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {areas.map((area) => <span key={area} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">{area}</span>)}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Trust({ icon, title, text }) {
  return (
    <div className="flex min-h-28 gap-3 bg-white p-4">
      <div className="shrink-0 text-brand-700">{icon}</div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
