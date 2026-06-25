import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidCnic,
  isValidPakistanPhone,
  normalizeCnic,
  normalizePhone,
  safeFileName,
  validateImage,
  workerAuthEmail
} from '../src/lib/validation.js';

test('normalizes and validates Pakistani mobile numbers', () => {
  assert.equal(normalizePhone('+92 300 1234567'), '03001234567');
  assert.equal(isValidPakistanPhone('0300-1234567'), true);
  assert.equal(isValidPakistanPhone('0411234567'), false);
});

test('creates a private worker Auth email from a Pakistani phone number', () => {
  assert.equal(workerAuthEmail('0300 1234567'), 'w923001234567@auth.fsdhomeservices.pk');
});

test('normalizes and validates CNIC values', () => {
  assert.equal(normalizeCnic('3310012345671'), '33100-1234567-1');
  assert.equal(isValidCnic('33100-1234567-1'), true);
  assert.equal(isValidCnic('33100-123'), false);
});

test('rejects unsupported or oversized uploads', () => {
  assert.match(validateImage({ name: 'proof.gif', type: 'image/gif', size: 100 }, 'Proof'), /JPG/);
  assert.match(validateImage({ name: 'proof.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 }, 'Proof'), /5 MB/);
  assert.equal(validateImage({ name: 'proof.webp', type: 'image/webp', size: 100 }, 'Proof'), '');
});

test('sanitizes storage object names', () => {
  assert.equal(safeFileName('My CNIC (Front).JPG'), 'my-cnic-front-.jpg');
});
