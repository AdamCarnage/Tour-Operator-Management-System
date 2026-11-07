import { describe, expect, it } from '@jest/globals';
import { hashPassword, verifyPassword } from './password.hasher';

describe('password hasher', () => {
  it('stores an Argon2id hash that verifies the original password', async () => {
    const passwordHash = await hashPassword('correct horse battery');
    expect(passwordHash.startsWith('$argon2id$')).toBe(true);
    await expect(
      verifyPassword(passwordHash, 'correct horse battery'),
    ).resolves.toBe(true);
    await expect(verifyPassword(passwordHash, 'wrong password')).resolves.toBe(
      false,
    );
  });
});
