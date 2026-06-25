import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { areas, services } from '../../data/catalog';
import { submitServiceRequest, verifyTurnstileToken } from '../../lib/api';
import { isValidPakistanPhone, validateImage } from '../../lib/validation';
import { Field, inputClass } from './Field';
import { TurnstileWidget } from './TurnstileWidget';

export function RequestForm({ preferredWorkerId, initialService }) {
  const validInitialService = services.some((service) => service.name === initialService)
    ? initialService
    : services[0].name;
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    area_id: areas[0],
    service_category_id: validInitialService,
    problem_description: '',
    urgency: 'Normal',
    preferred_time: ''
  });

  const serviceOptions = useMemo(() => services.map((service) => service.name), []);

  const update = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({ ...current, [name]: files ? files[0] : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!isValidPakistanPhone(form.customer_phone)) {
      setError('Enter a valid Pakistani mobile number, for example 03001234567.');
      return;
    }
    if (form.problem_description.trim().length < 10) {
      setError('Please describe the problem in at least 10 characters.');
      return;
    }
    const photoError = validateImage(form.problem_photo, 'Problem photo');
    if (photoError) {
      setError(photoError);
      return;
    }
    if (!turnstileToken) {
      setError('Complete the human verification first.');
      return;
    }
    setStatus('loading');
    try {
      const verificationId = await verifyTurnstileToken(turnstileToken, 'service_request');
      await submitServiceRequest({ ...form, preferred_worker_id: preferredWorkerId }, verificationId);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Could not submit request.');
      setStatus('idle');
      setTurnstileResetKey((value) => value + 1);
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-brand-100 bg-brand-50 p-6 text-brand-900">
        <h2 className="text-2xl font-bold">Request received</h2>
        <p className="mt-2 text-lg">Your request has been received. Our team will assign a verified worker shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Customer name">
          <input className={inputClass} name="customer_name" value={form.customer_name} onChange={update} minLength="2" maxLength="100" autoComplete="name" required />
        </Field>
        <Field label="Customer phone">
          <input className={inputClass} name="customer_phone" value={form.customer_phone} onChange={update} inputMode="tel" autoComplete="tel" placeholder="03001234567" required />
        </Field>
        <Field label="Area">
          <select className={inputClass} name="area_id" value={form.area_id} onChange={update}>
            {areas.map((area) => <option key={area}>{area}</option>)}
          </select>
        </Field>
        <Field label="Service category">
          <select className={inputClass} name="service_category_id" value={form.service_category_id} onChange={update}>
            {serviceOptions.map((service) => <option key={service}>{service}</option>)}
          </select>
        </Field>
        <Field label="Urgency">
          <select className={inputClass} name="urgency" value={form.urgency} onChange={update}>
            <option>Normal</option>
            <option>Today</option>
            <option>Emergency</option>
          </select>
        </Field>
        <Field label="Preferred time">
          <input className={inputClass} name="preferred_time" value={form.preferred_time} onChange={update} placeholder="Morning, evening, or exact time" />
        </Field>
      </div>
      <Field label="Problem description">
        <textarea className={inputClass} name="problem_description" value={form.problem_description} onChange={update} rows="4" minLength="10" maxLength="2000" required />
      </Field>
      <Field label="Optional problem photo">
        <input className={inputClass} name="problem_photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={update} />
      </Field>
      <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileResetKey} />
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" className="mt-1" required />
        <span>
          I agree to the <Link to="/terms" className="font-semibold text-brand-700 hover:underline">Terms of Service</Link> and acknowledge the <Link to="/privacy" className="font-semibold text-brand-700 hover:underline">Privacy Policy</Link>.
        </span>
      </label>
      {error && <p role="alert" aria-live="polite" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <button className="focus-ring rounded-lg bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : 'Submit Service Request'}
      </button>
    </form>
  );
}
