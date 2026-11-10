import { z } from 'zod';

const DEV_ENCRYPTION_KEY = 'MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=';

function emptyToUndefined(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return value;
}

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.preprocess(
    (value) => (value === undefined || value === '' ? 3000 : value),
    z.coerce.number().int().positive(),
  ),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.preprocess(
    (value) => (value === undefined || value === '' ? 5432 : value),
    z.coerce.number().int().positive(),
  ),
  DB_NAME: z.string().min(1).default('Toms'),
  DB_USER: z.string().min(1).default('postgres'),
  DB_PASS: z.string().default('postgres'),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  DB_SYNCHRONIZE: z.preprocess(
    (value) => (value === undefined || value === '' ? 'true' : value),
    z.enum(['true', 'false']).transform((value) => value === 'true'),
  ),
  DB_LOGGING: z.preprocess(
    (value) => (value === undefined || value === '' ? 'false' : value),
    z.enum(['true', 'false']).transform((value) => value === 'true'),
  ),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change'),
  JWT_ACCESS_TTL: z.string().min(2).default('15m'),
  JWT_REFRESH_TTL: z.string().min(2).default('7d'),
  DATA_ENCRYPTION_KEY: z.string().min(1).default(DEV_ENCRYPTION_KEY),
  REDIS_URL: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  S3_ENDPOINT: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_BUCKET: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  S3_ACCESS_KEY_ID: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  S3_SECRET_ACCESS_KEY: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
});

export type AppEnv = z.infer<typeof envSchema>;

const WEAK_SECRETS = new Set([
  'dev-access-secret-change',
  'dev-refresh-secret-change',
  'change-me-access-secret',
  'change-me-refresh-secret',
]);

export function parseEnv(config: Record<string, unknown>): AppEnv {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }
  const env = parsed.data;
  const key = Buffer.from(env.DATA_ENCRYPTION_KEY, 'base64');
  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes encoded as base64');
  }
  if (env.NODE_ENV === 'production') {
    if (
      WEAK_SECRETS.has(env.JWT_ACCESS_SECRET) ||
      WEAK_SECRETS.has(env.JWT_REFRESH_SECRET) ||
      env.DATA_ENCRYPTION_KEY === DEV_ENCRYPTION_KEY
    ) {
      throw new Error(
        'Refusing to start in production with development secrets',
      );
    }
    if (env.DB_SYNCHRONIZE) {
      throw new Error('DB_SYNCHRONIZE must be false in production');
    }
  }
  return env;
}
