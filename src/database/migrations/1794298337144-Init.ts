import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1794298337144 implements MigrationInterface {
    name = 'Init1794298337144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assignments" DROP CONSTRAINT "assignments_staff_no_overlap"`);
        await queryRunner.query(`ALTER TABLE "assignments" DROP CONSTRAINT "assignments_vehicle_no_overlap"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "webhook_endpoints" ALTER COLUMN "events" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "payload" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "permissions" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "staff_members" ALTER COLUMN "languages" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "staff_members" ALTER COLUMN "languages" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "permissions" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "payload" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "webhook_endpoints" ALTER COLUMN "events" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "assignments" ADD CONSTRAINT "assignments_vehicle_no_overlap" EXCLUDE USING gist ("vehicleId" WITH =, daterange("startsOn", "endsOn", '[]'::text) WITH &&) WHERE (("vehicleId" IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "assignments" ADD CONSTRAINT "assignments_staff_no_overlap" EXCLUDE USING gist ("staffId" WITH =, daterange("startsOn", "endsOn", '[]'::text) WITH &&) WHERE (("staffId" IS NOT NULL))`);
    }

}
