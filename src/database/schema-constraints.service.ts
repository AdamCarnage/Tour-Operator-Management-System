import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SchemaConstraintsService implements OnModuleInit {
  private readonly logger = new Logger(SchemaConstraintsService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.tryQuery(
      'btree_gist',
      'CREATE EXTENSION IF NOT EXISTS btree_gist',
    );
    await this.ensureExclusion(
      'assignments_staff_no_overlap',
      `ALTER TABLE assignments
       ADD CONSTRAINT assignments_staff_no_overlap
       EXCLUDE USING gist (
         "staffId" WITH =,
         daterange("startsOn", "endsOn", '[]') WITH &&
       )
       WHERE ("staffId" IS NOT NULL)`,
    );
    await this.ensureExclusion(
      'assignments_vehicle_no_overlap',
      `ALTER TABLE assignments
       ADD CONSTRAINT assignments_vehicle_no_overlap
       EXCLUDE USING gist (
         "vehicleId" WITH =,
         daterange("startsOn", "endsOn", '[]') WITH &&
       )
       WHERE ("vehicleId" IS NOT NULL)`,
    );
  }

  private async ensureExclusion(name: string, sql: string): Promise<void> {
    try {
      const existing: unknown = await this.dataSource.query(
        'SELECT conname FROM pg_constraint WHERE conname = $1',
        [name],
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return;
      }
      await this.dataSource.query(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Skipped constraint ${name}: ${message}`);
    }
  }

  private async tryQuery(label: string, sql: string): Promise<void> {
    try {
      await this.dataSource.query(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Skipped ${label}: ${message}`);
    }
  }
}
