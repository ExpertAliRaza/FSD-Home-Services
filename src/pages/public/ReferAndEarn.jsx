import { Link } from 'react-router-dom';
import { Gift, Share2, Users, ArrowRight } from 'lucide-react';

export function ReferAndEarn() {
  return (
    <>
      <section className="bg-brand-900 px-5 py-16 text-center text-white md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Refer a Friend, <span className="text-brand-300">Earn Rs 200</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-brand-100 sm:text-xl">
            Share FSD Home Services with your friends and family. They get verified professionals, and you get rewarded!
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/request-service" className="rounded-full bg-white px-8 py-3.5 font-bold text-brand-900 transition-colors hover:bg-brand-50">
              Book a Service
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">How it Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl bg-white p-8 text-center shadow-soft">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Share2 size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">1. Share Your Number</h3>
              <p className="text-slate-600">
                Your mobile number is your referral code. Just tell your friends to enter it when they book their first service.
              </p>
            </div>
            <div className="relative rounded-2xl bg-white p-8 text-center shadow-soft">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Users size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">2. They Get Served</h3>
              <p className="text-slate-600">
                Your friend books any home service on our platform. Our verified worker completes the job.
              </p>
            </div>
            <div className="relative rounded-2xl bg-white p-8 text-center shadow-soft">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Gift size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">3. You Get Rs 200</h3>
              <p className="text-slate-600">
                Once their service is marked as completed, you earn Rs 200 as a reward from FSD Home Services!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-50 px-5 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-3xl font-bold text-brand-900">Start Earning Today</h2>
          <p className="mb-8 text-lg text-slate-700">
            There's no limit to how many friends you can refer. The more you share, the more you earn.
          </p>
          <div className="inline-flex items-center gap-3 rounded-xl border border-brand-200 bg-white p-6 shadow-sm">
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Your Referral Code</p>
              <p className="text-2xl font-bold text-slate-900">Your Mobile Number</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
