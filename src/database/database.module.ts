import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppEnv } from '../config/env.schema';
import { SchemaConstraintsService } from './schema-constraints.service';
import { postgresConnection } from './typeorm-options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => {
        return {
          ...postgresConnection({
            DATABASE_URL: config.get('DATABASE_URL', { infer: true }),
            DB_HOST: config.get('DB_HOST', { infer: true }),
            DB_PORT: config.get('DB_PORT', { infer: true }),
            DB_USER: config.get('DB_USER', { infer: true }),
            DB_PASS: config.get('DB_PASS', { infer: true }),
            DB_NAME: config.get('DB_NAME', { infer: true }),
            DB_LOGGING: config.get('DB_LOGGING', { infer: true }),
          }),
          autoLoadEntities: true,
          migrations: ['dist/database/migrations/*.js'],
          synchronize: config.get('DB_SYNCHRONIZE', { infer: true }),
        };
      },
    }),
  ],
  providers: [SchemaConstraintsService],
})
export class DatabaseModule {}
