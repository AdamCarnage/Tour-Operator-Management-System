import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { parseEnv } from './config/env.schema';
import { JwtAuthGuard, RolesGuard } from './common/guards';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './platform/health.module';
import { SecurityModule } from './platform/security.module';
import { AdminModule } from './modules/admin/admin.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CrmModule } from './modules/crm/crm.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { EarningsModule } from './modules/earnings/earnings.module';
import { EmailModule } from './modules/email/email.module';
import { FieldModule } from './modules/field/field.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { IdentityModule } from './modules/identity/identity.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { PermitsModule } from './modules/permits/permits.module';
import { PortalModule } from './modules/portal/portal.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { SafetyModule } from './modules/safety/safety.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => parseEnv(config),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        redact: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.refreshToken',
          'req.body.passportNumber',
        ],
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    SecurityModule,
    HealthModule,
    IdentityModule,
    AdminModule.register(),
    CatalogModule,
    CrmModule,
    SuppliersModule,
    QuotesModule,
    BookingsModule,
    ResourcesModule,
    DispatchModule,
    PermitsModule,
    FieldModule,
    SafetyModule,
    FleetModule,
    PortalModule,
    ReportingModule,
    MessagingModule,
    EmailModule,
    CalendarModule,
    EarningsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
