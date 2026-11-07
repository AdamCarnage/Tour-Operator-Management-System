import { createHash, randomBytes } from 'crypto';

export function newSecret(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
