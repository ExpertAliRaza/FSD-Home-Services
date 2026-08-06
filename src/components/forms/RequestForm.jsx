import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ChevronDown } from 'lucide-react';
import { areas } from '../../data/catalog';
import { useCatalog } from '../../contexts/CatalogContext';
import { submitServiceRequest, verifyTurnstileToken } from '../../lib/api';
import { isValidPakistanPhone, validateImage } from '../../lib/validation';
import { Field, inputClass } from './Field';
import { TurnstileWidget } from './TurnstileWidget';

export function RequestForm({ preferredWorkerId, initialService }) {
  const { services } = useCatalog();

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
    area_id: '',
    service_category_id: validInitialService,
    problem_description: '',
    urgency: 'Normal',
    preferred_time: '',
    coupon_code: '',
    referral_code: ''
  });
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [customArea, setCustomArea] = useState('');

  const serviceOptions = useMemo(() => services.map((service) => service.name), []);

  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) return areas;
    const keyword = areaSearch.toLowerCase();
    return areas.filter((area) => area.toLowerCase().includes(keyword));
  }, [areaSearch]);

  const update = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({ ...current, [name]: files ? files[0] : value }));
  };

  const selectArea = (area) => {
    setSelectedArea(area);
    setForm((current) => ({ ...current, area_id: area }));
    setAreaOpen(false);
    setAreaSearch('');
    setCustomArea('');
  };

  const confirmCustomArea = () => {
    const trimmed = customArea.trim();
    if (!trimmed) return;
    selectArea(trimmed);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.area_id) {
      setError('Please select your area from the list.');
      return;
    }
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setAreaOpen(!areaOpen)}
              className={`${inputClass} flex items-center justify-between text-left ${!selectedArea ? 'text-slate-400' : ''}`}
            >
              <span className="truncate">{selectedArea || 'Search and select your area...'}</span>
              <ChevronDown size={16} className="shrink-0 text-slate-400" />
            </button>
            {areaOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="relative border-b border-slate-100 p-2">
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search areas..."
                    value={areaSearch}
                    onChange={(e) => setAreaSearch(e.target.value)}
                    autoFocus
                    className="min-h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto p-1">
                  {filteredAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => selectArea(area)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedArea === area
                          ? 'bg-brand-50 font-semibold text-brand-800'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                  {!filteredAreas.length && !customArea && (
                    <p className="px-3 py-4 text-center text-xs text-slate-500">No areas match your search.</p>
                  )}
                </div>
                <div className="flex gap-2 border-t border-slate-100 p-2">
                  <input
                    type="text"
                    placeholder="Other area..."
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), confirmCustomArea())}
                    className="min-h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500"
                  />
                  <button type="button" onClick={confirmCustomArea} disabled={!customArea.trim()} className="min-h-9 rounded-lg bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                    Add
                  </button>
                </div>
              </div>
            )}
            {/* Hidden input for form submission */}
            <input type="hidden" name="area_id" value={selectedArea} />
          </div>
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
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Coupon code (Optional)">
          <input className={inputClass} name="coupon_code" value={form.coupon_code} onChange={update} placeholder="Enter coupon if you have one" />
        </Field>
        <Field label="Referral code (Optional)">
          <input className={inputClass} name="referral_code" value={form.referral_code} onChange={update} placeholder="Enter friend's phone number" />
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
