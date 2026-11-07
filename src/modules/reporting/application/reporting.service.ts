import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../bookings/infrastructure/booking.entities';
import { Lead } from '../../crm/infrastructure/crm.entities';
import {
  Assignment,
  Departure,
} from '../../dispatch/infrastructure/dispatch.entities';
import { Quote } from '../../quotes/infrastructure/quote.entities';
import {
  StaffMember,
  Vehicle,
} from '../../resources/infrastructure/resource.entities';
import { Payable } from '../../suppliers/infrastructure/supplier.entities';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(Quote) private readonly quotes: Repository<Quote>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(Departure)
    private readonly departures: Repository<Departure>,
    @InjectRepository(Assignment)
    private readonly assignments: Repository<Assignment>,
    @InjectRepository(StaffMember)
    private readonly staff: Repository<StaffMember>,
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(Payable) private readonly payables: Repository<Payable>,
  ) {}

  async funnel(organizationId: string) {
    const [leadsByStatus, quotesByStatus, bookingsByStatus] = await Promise.all(
      [
        this.countBy(this.leads, 'lead', organizationId),
        this.countBy(this.quotes, 'quote', organizationId),
        this.countBy(this.bookings, 'booking', organizationId),
      ],
    );
    return { leadsByStatus, quotesByStatus, bookingsByStatus };
  }

  async margins(organizationId: string) {
    const rows: unknown = await this.departures
      .createQueryBuilder('departure')
      .innerJoin(Booking, 'booking', 'booking.id = departure.bookingId')
      .select('departure.id', 'departureId')
      .addSelect('departure.code', 'code')
      .addSelect('booking.currency', 'currency')
      .addSelect('booking.totalCostMinor', 'totalCostMinor')
      .addSelect('booking.totalSellMinor', 'totalSellMinor')
      .where('departure.organizationId = :organizationId', { organizationId })
      .getRawMany();
    return this.asRows<{
      departureId: string;
      code: string;
      currency: string;
      totalCostMinor: string;
      totalSellMinor: string;
    }>(rows).map((row) => {
      const totalCostMinor = Number(row.totalCostMinor);
      const totalSellMinor = Number(row.totalSellMinor);
      return {
        departureId: row.departureId,
        code: row.code,
        currency: row.currency,
        totalCostMinor,
        totalSellMinor,
        marginMinor: totalSellMinor - totalCostMinor,
      };
    });
  }

  async utilization(organizationId: string) {
    const activeStaff = await this.staff.count({
      where: { organizationId, active: true },
    });
    const activeVehicles = await this.vehicles.count({
      where: { organizationId, active: true },
    });
    const staffRows: unknown = await this.assignments
      .createQueryBuilder('assignment')
      .select('COUNT(DISTINCT assignment.staffId)', 'count')
      .where('assignment.organizationId = :organizationId', {
        organizationId,
      })
      .andWhere('assignment.staffId IS NOT NULL')
      .getRawOne();
    const vehicleRows: unknown = await this.assignments
      .createQueryBuilder('assignment')
      .select('COUNT(DISTINCT assignment.vehicleId)', 'count')
      .where('assignment.organizationId = :organizationId', {
        organizationId,
      })
      .andWhere('assignment.vehicleId IS NOT NULL')
      .getRawOne();
    return {
      staff: { active: activeStaff, assigned: this.countOf(staffRows) },
      vehicles: { active: activeVehicles, assigned: this.countOf(vehicleRows) },
    };
  }

  async supplierSpend(organizationId: string) {
    const rows: unknown = await this.payables
      .createQueryBuilder('payable')
      .select('payable.currency', 'currency')
      .addSelect('payable.status', 'status')
      .addSelect('SUM(payable.amountMinor)', 'totalMinor')
      .where('payable.organizationId = :organizationId', { organizationId })
      .groupBy('payable.currency')
      .addGroupBy('payable.status')
      .getRawMany();
    return this.asRows<{
      currency: string;
      status: string;
      totalMinor: string;
    }>(rows).map((row) => ({
      currency: row.currency,
      status: row.status,
      totalMinor: Number(row.totalMinor),
    }));
  }

  private async countBy<T extends { organizationId: string; status: string }>(
    repo: Repository<T>,
    alias: string,
    organizationId: string,
  ) {
    const rows: unknown = await repo
      .createQueryBuilder(alias)
      .select(`${alias}.status`, 'status')
      .addSelect('COUNT(*)', 'count')
      .where(`${alias}.organizationId = :organizationId`, { organizationId })
      .groupBy(`${alias}.status`)
      .getRawMany();
    return this.asRows<{ status: string; count: string }>(rows).map((row) => ({
      status: row.status,
      count: Number(row.count),
    }));
  }

  private countOf(row: unknown): number {
    if (typeof row === 'object' && row && 'count' in row) {
      const count = (row as { count?: unknown }).count;
      return typeof count === 'string' || typeof count === 'number'
        ? Number(count)
        : 0;
    }
    return 0;
  }

  private asRows<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }
}
