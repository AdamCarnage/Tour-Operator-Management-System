import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { PaymentStatus } from '../../../common/enums';
import { pageWindow } from '../../../common/pagination';
import {
  Booking,
  Payment,
} from '../../bookings/infrastructure/booking.entities';
import { User } from '../../identity/infrastructure/identity.entities';
import type { EarningsQueryDto } from '../api/earnings.dto';

@Injectable()
export class EarningsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async summary(organizationId: string, query: EarningsQueryDto) {
    const [byMethod, bySource, totals] = await Promise.all([
      this.aggregateByMethod(organizationId, query),
      this.aggregateBySource(organizationId, query),
      this.totals(organizationId, query),
    ]);
    return { totals, byMethod, bySource };
  }

  async listPayments(organizationId: string, query: EarningsQueryDto) {
    const window = pageWindow(query.page, query.limit);
    const base = () => {
      const qb = this.payments
        .createQueryBuilder('payment')
        .innerJoin(Booking, 'booking', 'booking.id = payment.bookingId')
        .where('payment.organizationId = :organizationId', { organizationId })
        .andWhere('payment.status = :status', {
          status: PaymentStatus.Received,
        });
      this.applyRange(qb, 'payment', query);
      if (query.method) {
        qb.andWhere('payment.method = :method', { method: query.method });
      }
      if (query.source) {
        qb.andWhere('booking.source = :source', { source: query.source });
      }
      return qb;
    };

    const rows = await base()
      .select('payment.id', 'id')
      .addSelect('payment.bookingId', 'bookingId')
      .addSelect('payment.amountMinor', 'amountMinor')
      .addSelect('payment.currency', 'currency')
      .addSelect('payment.method', 'method')
      .addSelect('payment.reference', 'reference')
      .addSelect('payment.recordedByUserId', 'recordedByUserId')
      .addSelect('payment.paidAt', 'paidAt')
      .addSelect('payment.createdAt', 'createdAt')
      .addSelect('booking.source', 'bookingSource')
      .addSelect('booking.recordedByUserId', 'bookingRecordedByUserId')
      .orderBy('payment.paidAt', 'DESC', 'NULLS LAST')
      .addOrderBy('payment.createdAt', 'DESC')
      .offset(window.skip)
      .limit(window.limit)
      .getRawMany();
    const total = await base().getCount();

    const recorderIds = [
      ...new Set(
        rows
          .flatMap((row: Record<string, unknown>) => [
            row.recordedByUserId as string | null,
            row.bookingRecordedByUserId as string | null,
          ])
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const recorders =
      recorderIds.length > 0
        ? await this.users.find({ where: { id: In(recorderIds) } })
        : [];
    const byId = new Map(
      recorders.map((user) => [
        user.id,
        `${user.firstName} ${user.lastName}`.trim(),
      ]),
    );

    return {
      data: rows.map((row: Record<string, unknown>) => ({
        id: row.id,
        bookingId: row.bookingId,
        amountMinor: Number(row.amountMinor),
        currency: row.currency,
        method: row.method,
        reference: row.reference,
        paidAt: row.paidAt,
        createdAt: row.createdAt,
        recordedByUserId: row.recordedByUserId,
        recordedByName: row.recordedByUserId
          ? (byId.get(row.recordedByUserId as string) ?? null)
          : null,
        bookingSource: row.bookingSource,
        bookingRecordedByUserId: row.bookingRecordedByUserId,
        bookingRecordedByName: row.bookingRecordedByUserId
          ? (byId.get(row.bookingRecordedByUserId as string) ?? null)
          : null,
      })),
      meta: { page: window.page, limit: window.limit, total },
    };
  }

  private async totals(organizationId: string, query: EarningsQueryDto) {
    const qb = this.payments
      .createQueryBuilder('payment')
      .innerJoin(Booking, 'booking', 'booking.id = payment.bookingId')
      .select('payment.currency', 'currency')
      .addSelect('SUM(payment.amountMinor)', 'totalMinor')
      .addSelect('COUNT(*)', 'paymentCount')
      .where('payment.organizationId = :organizationId', { organizationId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.Received,
      });
    this.applyRange(qb, 'payment', query);
    if (query.method) {
      qb.andWhere('payment.method = :method', { method: query.method });
    }
    if (query.source) {
      qb.andWhere('booking.source = :source', { source: query.source });
    }
    const rows: unknown = await qb.groupBy('payment.currency').getRawMany();
    return this.asRows<{
      currency: string;
      totalMinor: string;
      paymentCount: string;
    }>(rows).map((row) => ({
      currency: row.currency,
      totalMinor: Number(row.totalMinor),
      paymentCount: Number(row.paymentCount),
    }));
  }

  private async aggregateByMethod(
    organizationId: string,
    query: EarningsQueryDto,
  ) {
    const qb = this.payments
      .createQueryBuilder('payment')
      .innerJoin(Booking, 'booking', 'booking.id = payment.bookingId')
      .select('payment.method', 'method')
      .addSelect('payment.currency', 'currency')
      .addSelect('SUM(payment.amountMinor)', 'totalMinor')
      .addSelect('COUNT(*)', 'paymentCount')
      .where('payment.organizationId = :organizationId', { organizationId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.Received,
      });
    this.applyRange(qb, 'payment', query);
    if (query.source) {
      qb.andWhere('booking.source = :source', { source: query.source });
    }
    const rows: unknown = await qb
      .groupBy('payment.method')
      .addGroupBy('payment.currency')
      .getRawMany();
    return this.asRows<{
      method: string;
      currency: string;
      totalMinor: string;
      paymentCount: string;
    }>(rows).map((row) => ({
      method: row.method,
      currency: row.currency,
      totalMinor: Number(row.totalMinor),
      paymentCount: Number(row.paymentCount),
    }));
  }

  private async aggregateBySource(
    organizationId: string,
    query: EarningsQueryDto,
  ) {
    const qb = this.payments
      .createQueryBuilder('payment')
      .innerJoin(Booking, 'booking', 'booking.id = payment.bookingId')
      .select('booking.source', 'source')
      .addSelect('payment.currency', 'currency')
      .addSelect('SUM(payment.amountMinor)', 'totalMinor')
      .addSelect('COUNT(*)', 'paymentCount')
      .where('payment.organizationId = :organizationId', { organizationId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.Received,
      });
    this.applyRange(qb, 'payment', query);
    if (query.method) {
      qb.andWhere('payment.method = :method', { method: query.method });
    }
    const rows: unknown = await qb
      .groupBy('booking.source')
      .addGroupBy('payment.currency')
      .getRawMany();
    return this.asRows<{
      source: string;
      currency: string;
      totalMinor: string;
      paymentCount: string;
    }>(rows).map((row) => ({
      source: row.source,
      currency: row.currency,
      totalMinor: Number(row.totalMinor),
      paymentCount: Number(row.paymentCount),
    }));
  }

  private applyRange(
    qb: SelectQueryBuilder<Payment>,
    alias: string,
    query: EarningsQueryDto,
  ) {
    if (query.from) {
      qb.andWhere(`${alias}.paidAt >= :from`, { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere(`${alias}.paidAt <= :to`, { to: new Date(query.to) });
    }
  }

  private asRows<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }
}
