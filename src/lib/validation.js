export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function normalizePhone(value) {
  const compact = value.replace(/[\s()-]/g, '');
  return compact.startsWith('+92') ? `0${compact.slice(3)}` : compact;
}

export function workerAuthEmail(phone) {
  const normalized = normalizePhone(phone);
  return `w92${normalized.slice(1)}@auth.fsdhomeservices.pk`;
}

export function isValidPakistanPhone(value) {
  return /^03\d{9}$/.test(normalizePhone(value));
}

export function normalizeCnic(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 13) return value.trim();
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function isValidCnic(value) {
  return /^\d{5}-\d{7}-\d$/.test(normalizeCnic(value));
}

export function validateImage(file, label, required = false) {
  if (!file?.name) {
    return required ? `${label} is required.` : '';
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${label} must be a JPG, PNG, or WebP image.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${label} must be 5 MB or smaller.`;
  }
  return '';
}

export function safeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-');
}
