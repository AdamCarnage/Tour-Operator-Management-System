import { describe, expect, it } from '@jest/globals';
import { parseEnv } from './env.schema';

describe('parseEnv', () => {
  it('fills local defaults', () => {
    const env = parseEnv({});
    expect(env.PORT).toBe(3000);
    expect(env.DB_SYNCHRONIZE).toBe(true);
    expect(env.NODE_ENV).toBe('development');
  });

  it('rejects development secrets in production', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'production',
        DB_SYNCHRONIZE: 'false',
      }),
    ).toThrow(/development secrets/);
  });
});
