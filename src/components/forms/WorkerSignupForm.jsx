import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { areas } from '../../data/catalog';
import { useCatalog } from '../../contexts/CatalogContext';
import { signUpWorker, verifyTurnstileToken } from '../../lib/api';
import { isValidCnic, isValidPakistanPhone, validateImage } from '../../lib/validation';
import { Field, inputClass } from './Field';
import { TurnstileWidget } from './TurnstileWidget';

export function WorkerSignupForm() {
  const { services } = useCatalog();

  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [customArea, setCustomArea] = useState('');

  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) return areas;
    const keyword = areaSearch.toLowerCase();
    return areas.filter((area) => area.toLowerCase().includes(keyword));
  }, [areaSearch]);

  const isAllOver = selectedAreas.includes('All Over Faisalabad');

  const toggleArea = (area) => {
    if (isAllOver) return;
    if (area === 'All Over Faisalabad') {
      setSelectedAreas(['All Over Faisalabad']);
      return;
    }
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const addCustomArea = () => {
    const trimmed = customArea.trim();
    if (!trimmed || selectedAreas.includes(trimmed)) return;
    setSelectedAreas((prev) => [...prev, trimmed]);
    setCustomArea('');
  };

  const removeArea = (area) => {
    setSelectedAreas((prev) => prev.filter((a) => a !== area));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const payload = Object.fromEntries(data.entries());
    payload.cnic_front = data.get('cnic_front');
    payload.cnic_back = data.get('cnic_back');
    payload.profile_photo = data.get('profile_photo');

    // If "All Over Faisalabad" is selected, expand to all valid areas from the catalog
    if (selectedAreas.includes('All Over Faisalabad')) {
      payload.areas_covered = areas;
    } else {
      payload.areas_covered = selectedAreas;
    }

    if (!isValidPakistanPhone(payload.phone)) {
      setError('Enter a valid Pakistani mobile number, for example 03001234567.');
      return;
    }
    if (payload.cnic_number && !isValidCnic(payload.cnic_number)) {
      setError('Enter a valid 13-digit CNIC, for example 33100-1234567-1.');
      return;
    }
    if (!payload.areas_covered.length) {
      setError('Select at least one area you cover.');
      return;
    }
    const fileErrors = [
      validateImage(payload.profile_photo, 'Profile photo'),
      validateImage(payload.cnic_front, 'CNIC front image'),
      validateImage(payload.cnic_back, 'CNIC back image')
    ].filter(Boolean);
    if (fileErrors.length) {
      setError(fileErrors[0]);
      return;
    }
    if (!turnstileToken) {
      setError('Complete the human verification first.');
      return;
    }

    setStatus('loading');
    try {
      const verificationId = await verifyTurnstileToken(turnstileToken, 'worker_signup');
      await signUpWorker(payload, verificationId);
      navigate('/worker', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not submit worker profile.');
      setStatus('idle');
      setTurnstileResetKey((value) => value + 1);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name"><input className={inputClass} name="full_name" minLength="2" maxLength="100" autoComplete="name" required /></Field>
        <Field label="Phone number"><input className={inputClass} name="phone" inputMode="tel" autoComplete="tel" placeholder="03001234567" required /></Field>
        <Field label="Password (optional)"><input className={inputClass} name="password" type="password" minLength="8" autoComplete="new-password" /></Field>
        <Field label="Email (optional)"><input className={inputClass} name="email" type="email" autoComplete="email" /></Field>
        <Field label="CNIC number (optional)"><input className={inputClass} name="cnic_number" inputMode="numeric" placeholder="33100-1234567-1" /></Field>
        <Field label="Service">
          <select className={inputClass} name="service_category_id" required>{services.map((service) => <option key={service.name} value={service.name}>{service.name}</option>)}</select>
        </Field>
        <div className="md:col-span-2">
          <div className="grid gap-1.5 text-sm font-semibold text-slate-700">
            <span>Areas covered</span>
            <div className="space-y-3 font-normal">
            {selectedAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedAreas.map((area) => (
                  <span key={area} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                    {area}
                    <button type="button" onClick={() => removeArea(area)} className="hover:text-brand-600" aria-label={`Remove ${area}`}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search areas..."
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                className="min-h-9 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
              <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-800 hover:bg-brand-50">
                <input
                  type="checkbox"
                  checked={isAllOver}
                  onChange={() => toggleArea('All Over Faisalabad')}
                  disabled={selectedAreas.length > 0 && !isAllOver}
                  className="rounded border-slate-300"
                />
                All Over Faisalabad
              </label>
              {filteredAreas.map((area) => (
                <label key={area} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                  isAllOver ? 'text-slate-400' : 'text-slate-700 hover:bg-brand-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area)}
                    onChange={() => toggleArea(area)}
                    disabled={isAllOver}
                    className="rounded border-slate-300"
                  />
                  {area}
                </label>
              ))}
              {!filteredAreas.length && !isAllOver && (
                <p className="px-2 py-3 text-center text-xs text-slate-500">No areas match your search.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Other area..."
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomArea())}
                className="min-h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500"
              />
              <button type="button" onClick={addCustomArea} disabled={!customArea.trim()} className="min-h-9 rounded-lg bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                Add
              </button>
            </div>
          </div>
        </div>
        </div>
        <Field label="Experience years (optional)">
          <div className="relative w-full">
            <input className={`${inputClass} pr-14`} name="experience_years" type="number" min="0" max="80" placeholder="0" />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">years</span>
          </div>
        </Field>
        <Field label="Profile photo (optional)"><input className={inputClass} name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp" /></Field>
        <Field label="CNIC front image (optional)"><input className={inputClass} name="cnic_front" type="file" accept="image/jpeg,image/png,image/webp" /></Field>
        <Field label="CNIC back image (optional)"><input className={inputClass} name="cnic_back" type="file" accept="image/jpeg,image/png,image/webp" /></Field>
      </div>
      <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileResetKey} />
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" className="mt-1" required />
        <span>
          I agree to the <Link to="/terms" className="font-semibold text-brand-700 hover:underline">Terms of Service</Link> and consent to CNIC and uploaded-image processing described in the <Link to="/privacy" className="font-semibold text-brand-700 hover:underline">Privacy Policy</Link>.
        </span>
      </label>
      {error && <p role="alert" aria-live="polite" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <button className="focus-ring rounded-lg bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : 'Submit for Admin Approval'}
      </button>
    </form>
  );
}