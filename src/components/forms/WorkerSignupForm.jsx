import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { areas, services } from '../../data/catalog';
import { signUpWorker, verifyTurnstileToken } from '../../lib/api';
import { isValidCnic, isValidPakistanPhone, validateImage } from '../../lib/validation';
import { Field, inputClass } from './Field';
import { TurnstileWidget } from './TurnstileWidget';

export function WorkerSignupForm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const payload = Object.fromEntries(data.entries());
    payload.areas_covered = data.getAll('areas_covered');
    payload.cnic_front = data.get('cnic_front');
    payload.cnic_back = data.get('cnic_back');
    payload.profile_photo = data.get('profile_photo');
    payload.work_photos = data.getAll('work_photos').filter((file) => file?.name);

    if (!isValidPakistanPhone(payload.phone)) {
      setError('Enter a valid Pakistani mobile number, for example 03001234567.');
      return;
    }
    if (!isValidCnic(payload.cnic_number)) {
      setError('Enter a valid 13-digit CNIC, for example 33100-1234567-1.');
      return;
    }
    if (!payload.areas_covered.length) {
      setError('Select at least one area you cover.');
      return;
    }
    if (!payload.work_photos.length) {
      setError('Upload at least one work photo.');
      return;
    }
    const fileErrors = [
      validateImage(payload.profile_photo, 'Profile photo', true),
      validateImage(payload.cnic_front, 'CNIC front image', true),
      validateImage(payload.cnic_back, 'CNIC back image', true),
      ...payload.work_photos.map((file, index) => validateImage(file, `Work photo ${index + 1}`, true))
    ].filter(Boolean);
    if (fileErrors.length) {
      setError(fileErrors[0]);
      return;
    }
    if (payload.work_photos.length > 6) {
      setError('Upload no more than 6 work photos.');
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
        <Field label="Password"><input className={inputClass} name="password" type="password" minLength="8" autoComplete="new-password" required /></Field>
        <Field label="Email (optional)"><input className={inputClass} name="email" type="email" autoComplete="email" /></Field>
        <Field label="CNIC number"><input className={inputClass} name="cnic_number" inputMode="numeric" placeholder="33100-1234567-1" required /></Field>
        <Field label="Service category">
          <select className={inputClass} name="service_category_id">{services.map((service) => <option key={service.name}>{service.name}</option>)}</select>
        </Field>
        <Field label="Experience years"><input className={inputClass} name="experience_years" type="number" min="0" max="80" required /></Field>
        <Field label="Expected visit charges"><input className={inputClass} name="expected_visit_charges" type="number" min="0" max="100000" required /></Field>
        <Field label="Availability"><input className={inputClass} name="availability" placeholder="Daily 10am to 8pm" required /></Field>
        <Field label="Profile photo"><input className={inputClass} name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp" required /></Field>
        <Field label="CNIC front image"><input className={inputClass} name="cnic_front" type="file" accept="image/jpeg,image/png,image/webp" required /></Field>
        <Field label="CNIC back image"><input className={inputClass} name="cnic_back" type="file" accept="image/jpeg,image/png,image/webp" required /></Field>
      </div>
      <Field label="Areas covered">
        <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 md:grid-cols-3">
          {areas.map((area) => (
            <label key={area} className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="areas_covered" value={area} /> {area}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Work photos">
        <input className={inputClass} name="work_photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required />
      </Field>
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
