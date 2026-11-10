import { describe, expect, it } from '@jest/globals';
import { parseEnv } from './env.schema';

describe('parseEnv', () => {
  it('fills local defaults', () => {
    const env = parseEnv({});
    expect(env.PORT).toBe(3000);
    expect(env.DB_SYNCHRONIZE).toBe(true);
    expect(env.DB_NAME).toBe('Toms');
    expect(env.DB_PORT).toBe(5432);
    expect(env.DATABASE_URL).toBeUndefined();
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
