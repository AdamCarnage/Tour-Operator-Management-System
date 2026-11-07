import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppEnv } from '../config/env.schema';
import { SchemaConstraintsService } from './schema-constraints.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        type: 'postgres' as const,
        url: config.get('DATABASE_URL', { infer: true }),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNCHRONIZE', { infer: true }),
        logging: config.get('DB_LOGGING', { infer: true }),
        uuidExtension: 'pgcrypto' as const,
      }),
    }),
  ],
  providers: [SchemaConstraintsService],
})
export class DatabaseModule {}
