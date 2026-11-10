import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { parseEnv } from '../config/env.schema';
import { postgresConnection } from './typeorm-options';

loadEnv();

const env = parseEnv(process.env);

export const AppDataSource = new DataSource({
  ...postgresConnection(env),
  entities: ['src/**/*.entities.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
