import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Download, FileText } from 'lucide-react';
import { hasRealCnic } from '../../lib/validation';

const siteUrl = 'https://fsd-home-services.vercel.app';
const supportNumber = '03099018308';
const brandGreen = '#047857';
const ink = '#102a43';
const logoPath = '/branding/FSD Home Services logo.png';

export function VerificationCardPanel({ worker }) {
  const [status, setStatus] = useState('');
  const details = useMemo(() => getVerificationDetails(worker), [worker]);
  const verified = isWorkerIdentityVerified(worker);

  const download = async (type) => {
    setStatus('');
    try {
      const canvas = await renderVerificationCard(details);
      if (type === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [720, 456] });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 720, 456);
        pdf.save(`${details.workerId}-verification-card.pdf`);
        setStatus('PDF downloaded.');
        return;
      }

      const link = document.createElement('a');
      link.download = `${details.workerId}-verification-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStatus('PNG downloaded.');
    } catch {
      setStatus('Could not generate the verification card. Please try again.');
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-slate-950">
            <BadgeCheck size={19} className="text-brand-700" aria-hidden="true" />
            Verification Card
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Download a clean worker verification card for customers. The QR code opens your public worker listing.
          </p>
        </div>
        {verified && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => download('png')} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-600">
              <Download size={17} aria-hidden="true" />
              Download PNG
            </button>
            <button type="button" onClick={() => download('pdf')} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50">
              <FileText size={17} aria-hidden="true" />
              Download PDF
            </button>
          </div>
        )}
      </div>

      {verified ? (
        <div className="mt-5 max-w-3xl overflow-hidden rounded-lg border border-brand-100 bg-slate-50 p-3">
          <VerificationCardPreview details={details} />
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Verification card will be available after a real CNIC is added and reviewed.
        </p>
      )}
      {status && <p className="mt-3 text-sm font-semibold text-slate-600">{status}</p>}
    </section>
  );
}

export function PublicVerificationBadge({ worker, className = '' }) {
  if (!isWorkerIdentityVerified(worker)) return null;
  const details = getVerificationDetails(worker);

  return (
    <span className={`inline-flex min-h-8 items-center gap-1 rounded-full bg-brand-50 px-3 text-xs font-bold text-brand-800 ${className}`}>
      <BadgeCheck size={15} aria-hidden="true" />
      Verified Professional
      <span className="text-brand-700">| {details.workerId}</span>
    </span>
  );
}

export function isWorkerIdentityVerified(worker = {}) {
  if (typeof worker.identity_verified === 'boolean') return worker.identity_verified;
  return hasRealCnic(worker.cnic_number, worker.phone);
}

export function getVerificationDetails(worker = {}) {
  const serviceName = worker.service_name || worker.service_categories?.name || worker.service_category_id || 'Home Services';
  const primaryArea = worker.area_name || worker.areas_covered?.[0] || 'Faisalabad';
  const verifiedDate = worker.verified_at || worker.approved_at || worker.created_at || new Date().toISOString();
  const workerId = formatWorkerId(worker.id);
  const publicUrl = worker.id
    ? `${siteUrl}/workers/${encodeURIComponent(worker.id)}`
    : `${siteUrl}/workers#worker-${workerId}`;
  const photoUrl = worker.profile_photo_signed_url || worker.profile_photo_url || '';

  return {
    name: worker.display_name || 'Verified Worker',
    initials: initials(worker.display_name),
    serviceName,
    cityArea: `${primaryArea}, Faisalabad`,
    workerId,
    verifiedDate: formatDate(verifiedDate),
    publicUrl,
    photoUrl
  };
}

export function formatWorkerId(id) {
  const clean = String(id || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  if (!clean) return 'FSD-0001';
  return `FSD-${clean.slice(0, 4).padStart(4, '0')}`;
}

function VerificationCardPreview({ details }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(details.publicUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 180,
        color: { dark: '#102a43', light: '#ffffff' }
      }))
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [details.publicUrl]);

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-brand-200 bg-white shadow-sm">
      <div className="rounded-t-lg bg-brand-700 p-4 text-white sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/branding/FSD Home Services logo.png"
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg bg-white object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black sm:text-base">FSD Home Services</p>
              <p className="text-[11px] font-semibold text-brand-50">fsd-home-services.vercel.app</p>
            </div>
          </div>
          <div className="rounded-lg bg-white/15 px-3 py-2 text-right text-[11px] font-bold">
            {details.workerId}
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[8.5rem_1fr_auto] sm:items-end sm:p-5">
        <div className="h-32 w-32 overflow-hidden rounded-lg border border-brand-100 bg-brand-50">
          {details.photoUrl ? (
            <img src={details.photoUrl} alt={details.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-black text-brand-700">
              {details.initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[11px] font-black uppercase text-brand-800">Verified Professional</p>
          <h4 className="mt-3 break-words text-2xl font-black leading-tight text-slate-950">{details.name}</h4>
          <p className="mt-2 text-sm font-bold text-slate-700">{details.serviceName}</p>
          <p className="mt-1 text-sm text-slate-600">{details.cityArea}</p>
          <p className="mt-4 text-xs font-semibold text-slate-500">Member since / verified: {details.verifiedDate}</p>
          <p className="mt-1 text-xs text-slate-500">Support: {supportNumber}</p>
        </div>
        <div className="grid w-28 justify-items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR code linking to public worker profile" className="h-24 w-24" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center text-center text-[10px] font-bold text-slate-400">QR Code</div>
          )}
          <span className="text-center text-[10px] font-bold text-slate-500">Scan to verify</span>
        </div>
      </div>
    </div>
  );
}

async function renderVerificationCard(details) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');
  const logo = await loadImage(logoPath);
  const photo = await loadImage(details.photoUrl);
  const QRCode = await import('qrcode');
  const qrDataUrl = await QRCode.toDataURL(details.publicUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 260,
    color: { dark: '#102a43', light: '#ffffff' }
  });
  const qr = await loadImage(qrDataUrl);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  roundRect(ctx, 40, 40, 1120, 680, 28, '#ffffff', '#cbd5e1');
  roundRect(ctx, 40, 40, 1120, 160, 28, brandGreen, brandGreen);

  if (logo) {
    ctx.drawImage(logo, 82, 72, 86, 86);
    drawText(ctx, 'FSD Home Services', 190, 108, 34, '#ffffff', '800');
  } else {
    drawText(ctx, 'FSD Home Services', 82, 118, 38, '#ffffff', '900');
  }
  drawWorkerPhoto(ctx, photo, details.initials, 84, 246, 178);
  drawText(ctx, 'Verified Professional', 300, 264, 38, brandGreen, '900');
  drawText(ctx, details.name, 300, 342, 52, ink, '900');
  drawText(ctx, details.serviceName, 304, 402, 28, '#334155', '800');
  drawText(ctx, details.cityArea, 304, 450, 25, '#475569', '700');

  drawLabelValue(ctx, 'Worker ID', details.workerId, 88, 528);
  drawLabelValue(ctx, 'Member since / verified', details.verifiedDate, 88, 608);

  roundRect(ctx, 820, 262, 260, 260, 18, '#ffffff', '#cbd5e1');
  ctx.drawImage(qr, 840, 282, 220, 220);
  drawText(ctx, 'Scan to verify profile', 835, 560, 22, ink, '800');
  drawText(ctx, siteUrl.replace('https://', ''), 790, 640, 22, brandGreen, '800');
  drawText(ctx, `Support: ${supportNumber}`, 830, 678, 20, '#475569', '700');

  return canvas;
}

function drawLabelValue(ctx, label, value, x, y) {
  drawText(ctx, label.toUpperCase(), x, y, 18, '#64748b', '800');
  drawText(ctx, value, x, y + 38, 30, ink, '900');
}

function drawText(ctx, text, x, y, size, color, weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillText(String(text), x, y);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function loadImage(src) {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawWorkerPhoto(ctx, photo, fallbackText, x, y, size) {
  roundRect(ctx, x, y, size, size, 22, '#ecfdf5', '#bbf7d0');

  if (photo) {
    ctx.save();
    roundedClip(ctx, x, y, size, size, 22);
    ctx.drawImage(photo, x, y, size, size);
    ctx.restore();
    return;
  }

  drawText(ctx, fallbackText, x + 44, y + 106, 48, brandGreen, '900');
}

function roundedClip(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();
}

function initials(name) {
  return String(name || 'FS')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'FS';
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}
