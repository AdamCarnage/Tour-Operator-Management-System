import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  AssignmentRole,
  BookingStatus,
  DepartureStatus,
  PaymentStatus,
  QuoteStatus,
} from '../../../common/enums';
import {
  Booking,
  Payment,
} from '../../bookings/infrastructure/booking.entities';
import { Product } from '../../catalog/infrastructure/catalog.entities';
import { Customer, Lead } from '../../crm/infrastructure/crm.entities';
import {
  Assignment,
  Departure,
} from '../../dispatch/infrastructure/dispatch.entities';
import {
  Organization,
  User,
} from '../../identity/infrastructure/identity.entities';
import { Quote } from '../../quotes/infrastructure/quote.entities';
import {
  StaffMember,
  Vehicle,
} from '../../resources/infrastructure/resource.entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Quote) private readonly quotes: Repository<Quote>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Departure)
    private readonly departures: Repository<Departure>,
    @InjectRepository(Assignment)
    private readonly assignments: Repository<Assignment>,
    @InjectRepository(StaffMember)
    private readonly staff: Repository<StaffMember>,
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async operator(organizationId: string, asOf?: string) {
    const today = asOf ? new Date(`${asOf}T00:00:00.000Z`) : new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const weekStart = this.addDays(todayIso, -today.getUTCDay());
    const weekEnd = this.addDays(weekStart, 6);
    const monthStart = `${todayIso.slice(0, 7)}-01`;
    const monthEnd = this.monthEnd(todayIso);

    const [
      activeTours,
      draftQuotes,
      weekDepartures,
      collected,
      onTrail,
      deskRevenue,
      bookingMix,
      upcomingBookings,
    ] = await Promise.all([
      this.bookings.count({
        where: {
          organizationId,
          status: In([
            BookingStatus.Confirmed,
            BookingStatus.InProgress,
            BookingStatus.Pending,
          ]),
        },
      }),
      this.quotes.count({
        where: { organizationId, status: QuoteStatus.Draft },
      }),
      this.departures.find({
        where: {
          organizationId,
          startsOn: Between(weekStart, weekEnd),
        },
        order: { startsOn: 'ASC' },
        take: 20,
      }),
      this.collectedBetween(organizationId, monthStart, monthEnd),
      this.departures.find({
        where: {
          organizationId,
          startsOn: LessThanOrEqual(todayIso),
          endsOn: MoreThanOrEqual(todayIso),
          status: In([DepartureStatus.Dispatched, DepartureStatus.InField]),
        },
        take: 5,
        order: { startsOn: 'ASC' },
      }),
      this.monthlyRevenue(organizationId, 6),
      this.bookingMix(organizationId),
      this.bookings.find({
        where: {
          organizationId,
          status: In([
            BookingStatus.Pending,
            BookingStatus.Confirmed,
            BookingStatus.InProgress,
          ]),
        },
        order: { startDate: 'ASC' },
        take: 10,
      }),
    ]);

    const seatsThisWeek = weekDepartures.length;
    const onTrailLead = onTrail[0]
      ? await this.leadGuideForDeparture(organizationId, onTrail[0].id)
      : null;

    const customerIds = [
      ...new Set(upcomingBookings.map((booking) => booking.customerId)),
    ];
    const customers =
      customerIds.length > 0
        ? await this.customers.find({
            where: { organizationId, id: In(customerIds) },
          })
        : [];
    const customerById = new Map(customers.map((row) => [row.id, row.name]));

    return {
      greetingDate: todayIso,
      week: { start: weekStart, end: weekEnd },
      kpis: {
        activeTours,
        draftQuotes,
        seatsThisWeek,
        departuresThisWeek: weekDepartures.length,
        collectedThisMonth: collected,
        onTrailToday: {
          count: onTrail.length,
          highlight: onTrail[0]
            ? {
                departureId: onTrail[0].id,
                code: onTrail[0].code,
                guideName: onTrailLead,
              }
            : null,
        },
      },
      deskRevenue,
      bookingMix,
      thisWeek: weekDepartures.map((departure) => ({
        id: departure.id,
        code: departure.code,
        startsOn: departure.startsOn,
        endsOn: departure.endsOn,
        status: departure.status,
        bookingId: departure.bookingId,
      })),
      upcomingBookings: upcomingBookings.map((booking) => ({
        id: booking.id,
        customerId: booking.customerId,
        customerName: customerById.get(booking.customerId) ?? null,
        startDate: booking.startDate,
        endDate: booking.endDate,
        currency: booking.currency,
        totalSellMinor: booking.totalSellMinor,
        status: booking.status,
        source: booking.source,
        recordedByUserId: booking.recordedByUserId,
      })),
    };
  }

  async adventurer(organizationId: string, customerId: string) {
    const customer = await this.customers.findOne({
      where: { id: customerId, organizationId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const bookings = await this.bookings.find({
      where: { organizationId, customerId },
      order: { startDate: 'ASC' },
    });
    const upcoming = bookings.filter(
      (booking) =>
        booking.status !== BookingStatus.Cancelled &&
        booking.status !== BookingStatus.Completed &&
        booking.startDate >= new Date().toISOString().slice(0, 10),
    );
    const completed = bookings.filter(
      (booking) => booking.status === BookingStatus.Completed,
    );
    const next = upcoming[0] ?? null;
    const bookingIds = bookings.map((booking) => booking.id);
    const payments =
      bookingIds.length > 0
        ? await this.payments.find({
            where: {
              organizationId,
              bookingId: In(bookingIds),
              status: PaymentStatus.Received,
            },
            order: { paidAt: 'ASC' },
          })
        : [];

    const committed = bookings
      .filter((booking) => booking.status !== BookingStatus.Cancelled)
      .reduce(
        (acc, booking) => {
          acc[booking.currency] =
            (acc[booking.currency] ?? 0) + booking.totalSellMinor;
          return acc;
        },
        {} as Record<string, number>,
      );

    const spendByMonth = this.groupPaymentsByMonth(payments);
    const openProducts = await this.products.find({
      where: { organizationId, active: true },
      take: 6,
      order: { createdAt: 'DESC' },
    });

    let nextGuideName: string | null = null;
    if (next) {
      const departure = await this.departures.findOne({
        where: { organizationId, bookingId: next.id },
        order: { startsOn: 'ASC' },
      });
      if (departure) {
        nextGuideName = await this.leadGuideForDeparture(
          organizationId,
          departure.id,
        );
      }
    }

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      nextDeparture: next
        ? {
            bookingId: next.id,
            startDate: next.startDate,
            endDate: next.endDate,
            currency: next.currency,
            totalSellMinor: next.totalSellMinor,
            status: next.status,
            guideName: nextGuideName,
          }
        : null,
      kpis: {
        upcomingTrips: upcoming.length,
        completedTrails: completed.length,
        committedSpend: Object.entries(committed).map(
          ([currency, totalMinor]) => ({
            currency,
            totalMinor,
          }),
        ),
      },
      spendByMonth,
      upcomingBookings: upcoming.slice(0, 10).map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        currency: booking.currency,
        totalSellMinor: booking.totalSellMinor,
        status: booking.status,
      })),
      openTrails: openProducts.map((product) => ({
        id: product.id,
        name: product.name,
        kind: product.kind,
        durationDays: product.durationDays,
      })),
    };
  }

  async platform() {
    const [organizations, users, leads, quotes, bookings, staff, vehicles] =
      await Promise.all([
        this.organizations.count(),
        this.users.count(),
        this.leads.count(),
        this.quotes.count(),
        this.bookings.count(),
        this.staff.count({ where: { active: true } }),
        this.vehicles.count({ where: { active: true } }),
      ]);

    const [leadsByStatus, quotesByStatus, bookingsByStatus] = await Promise.all(
      [
        this.countByStatus(this.leads, 'lead'),
        this.countByStatus(this.quotes, 'quote'),
        this.countByStatus(this.bookings, 'booking'),
      ],
    );

    const assignedStaff = await this.assignments
      .createQueryBuilder('assignment')
      .select('COUNT(DISTINCT assignment.staffId)', 'count')
      .where('assignment.staffId IS NOT NULL')
      .getRawOne();
    const assignedVehicles = await this.assignments
      .createQueryBuilder('assignment')
      .select('COUNT(DISTINCT assignment.vehicleId)', 'count')
      .where('assignment.vehicleId IS NOT NULL')
      .getRawOne();

    return {
      totals: {
        organizations,
        users,
        leads,
        quotes,
        bookings,
      },
      funnel: {
        leads: { total: leads, byStatus: leadsByStatus },
        quotes: { total: quotes, byStatus: quotesByStatus },
        bookings: { total: bookings, byStatus: bookingsByStatus },
      },
      utilization: {
        staff: {
          active: staff,
          assigned: this.countOf(assignedStaff),
        },
        vehicles: {
          active: vehicles,
          assigned: this.countOf(assignedVehicles),
        },
      },
    };
  }

  private async collectedBetween(
    organizationId: string,
    fromDate: string,
    toDate: string,
  ) {
    const rows: unknown = await this.payments
      .createQueryBuilder('payment')
      .select('payment.currency', 'currency')
      .addSelect('SUM(payment.amountMinor)', 'totalMinor')
      .where('payment.organizationId = :organizationId', { organizationId })
      .andWhere('payment.status = :status', { status: PaymentStatus.Received })
      .andWhere('payment.paidAt >= :from', {
        from: new Date(`${fromDate}T00:00:00.000Z`),
      })
      .andWhere('payment.paidAt <= :to', {
        to: new Date(`${toDate}T23:59:59.999Z`),
      })
      .groupBy('payment.currency')
      .getRawMany();
    return this.asRows<{ currency: string; totalMinor: string }>(rows).map(
      (row) => ({
        currency: row.currency,
        totalMinor: Number(row.totalMinor),
      }),
    );
  }

  private async monthlyRevenue(organizationId: string, months: number) {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1),
    );
    const rows: unknown = await this.payments
      .createQueryBuilder('payment')
      .select(`to_char(payment.paidAt, 'YYYY-MM')`, 'month')
      .addSelect('payment.currency', 'currency')
      .addSelect('SUM(payment.amountMinor)', 'totalMinor')
      .where('payment.organizationId = :organizationId', { organizationId })
      .andWhere('payment.status = :status', { status: PaymentStatus.Received })
      .andWhere('payment.paidAt >= :start', { start })
      .groupBy(`to_char(payment.paidAt, 'YYYY-MM')`)
      .addGroupBy('payment.currency')
      .orderBy('month', 'ASC')
      .getRawMany();
    return this.asRows<{
      month: string;
      currency: string;
      totalMinor: string;
    }>(rows).map((row) => ({
      month: row.month,
      currency: row.currency,
      totalMinor: Number(row.totalMinor),
    }));
  }

  private async bookingMix(organizationId: string) {
    const rows: unknown = await this.bookings
      .createQueryBuilder('booking')
      .leftJoin(Quote, 'quote', 'quote.id = booking.quoteId')
      .leftJoin(Product, 'product', 'product.id = quote.productId')
      .select(`COALESCE(product.kind, 'unknown')`, 'kind')
      .addSelect('COUNT(*)', 'count')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('booking.status != :cancelled', {
        cancelled: BookingStatus.Cancelled,
      })
      .groupBy(`COALESCE(product.kind, 'unknown')`)
      .getRawMany();
    const mapped = this.asRows<{ kind: string; count: string }>(rows).map(
      (row) => ({
        kind: row.kind,
        count: Number(row.count),
      }),
    );
    const total = mapped.reduce((sum, row) => sum + row.count, 0);
    return {
      total,
      items: mapped.map((row) => ({
        ...row,
        percent: total === 0 ? 0 : Math.round((row.count / total) * 100),
      })),
    };
  }

  private async leadGuideForDeparture(
    organizationId: string,
    departureId: string,
  ) {
    const assignment = await this.assignments.findOne({
      where: {
        organizationId,
        departureId,
        role: AssignmentRole.Guide,
      },
    });
    if (!assignment?.staffId) {
      return null;
    }
    const guide = await this.staff.findOne({
      where: { id: assignment.staffId, organizationId },
    });
    return guide
      ? `${guide.firstName} ${guide.lastName}`.trim()
      : null;
  }

  private groupPaymentsByMonth(payments: Payment[]) {
    const map = new Map<string, Record<string, number>>();
    for (const payment of payments) {
      if (!payment.paidAt) continue;
      const month = payment.paidAt.toISOString().slice(0, 7);
      const bucket = map.get(month) ?? {};
      bucket[payment.currency] =
        (bucket[payment.currency] ?? 0) + payment.amountMinor;
      map.set(month, bucket);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, byCurrency]) => ({
        month,
        amounts: Object.entries(byCurrency).map(([currency, totalMinor]) => ({
          currency,
          totalMinor,
        })),
      }));
  }

  private async countByStatus<
    T extends { status: string },
  >(repo: Repository<T>, alias: string) {
    const rows: unknown = await repo
      .createQueryBuilder(alias)
      .select(`${alias}.status`, 'status')
      .addSelect('COUNT(*)', 'count')
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

  private addDays(isoDate: string, days: number) {
    const date = new Date(`${isoDate}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private monthEnd(isoDate: string) {
    const date = new Date(`${isoDate.slice(0, 7)}-01T00:00:00.000Z`);
    date.setUTCMonth(date.getUTCMonth() + 1);
    date.setUTCDate(0);
    return date.toISOString().slice(0, 10);
  }

  private asRows<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }
}
