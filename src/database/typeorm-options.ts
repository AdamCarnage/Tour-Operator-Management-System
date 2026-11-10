import type { DataSourceOptions } from 'typeorm';
import type { AppEnv } from '../config/env.schema';

export function postgresConnection(
  env: Pick<
    AppEnv,
    | 'DATABASE_URL'
    | 'DB_HOST'
    | 'DB_PORT'
    | 'DB_USER'
    | 'DB_PASS'
    | 'DB_NAME'
    | 'DB_LOGGING'
  >,
): DataSourceOptions {
  return {
    type: 'postgres',
    ...(env.DATABASE_URL
      ? { url: env.DATABASE_URL }
      : {
          host: env.DB_HOST,
          port: env.DB_PORT,
          username: env.DB_USER,
          password: env.DB_PASS,
          database: env.DB_NAME,
        }),
    logging: env.DB_LOGGING,
    uuidExtension: 'pgcrypto',
  };
}
