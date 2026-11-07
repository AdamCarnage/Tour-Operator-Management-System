import { decryptField, encryptField, maskSecret } from './field-encryption';

describe('field encryption', () => {
  const key = Buffer.from('0123456789abcdef0123456789abcdef');

  it('round-trips passport numbers', () => {
    const encrypted = encryptField(key, 'AB1234567');
    expect(encrypted).not.toContain('AB1234567');
    expect(decryptField(key, encrypted)).toBe('AB1234567');
  });

  it('masks all but the last three characters', () => {
    expect(maskSecret('AB1234567')).toBe('***567');
  });
});
