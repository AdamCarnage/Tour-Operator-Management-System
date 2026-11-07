import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { isDatabaseConflict } from '../../../common/errors';
import { findOwned, paginate } from '../../../common/pagination';
import { Departure } from '../../dispatch/infrastructure/dispatch.entities';
import {
  FieldCheckIn,
  FieldExpense,
  FieldInspection,
} from '../infrastructure/field.entities';
import type {
  CreateCheckInDto,
  CreateFieldExpenseDto,
  CreateFieldInspectionDto,
} from '../api/field.dto';

@Injectable()
export class FieldService {
  constructor(
    @InjectRepository(FieldCheckIn)
    private readonly checkIns: Repository<FieldCheckIn>,
    @InjectRepository(FieldExpense)
    private readonly expenses: Repository<FieldExpense>,
    @InjectRepository(FieldInspection)
    private readonly inspections: Repository<FieldInspection>,
    @InjectRepository(Departure)
    private readonly departures: Repository<Departure>,
  ) {}

  listCheckIns(organizationId: string, page?: number, limit?: number) {
    return paginate(this.checkIns, organizationId, page, limit);
  }

  async checkIn(user: AuthUser, dto: CreateCheckInDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    const existing = await this.checkIns.findOne({
      where: {
        organizationId: user.organizationId,
        idempotencyKey: dto.idempotencyKey,
      },
    });
    if (existing) {
      return existing;
    }
    try {
      return await this.checkIns.save(
        this.checkIns.create({
          organizationId: user.organizationId,
          departureId: dto.departureId,
          travelerId: dto.travelerId,
          checkedInAt: new Date(),
          idempotencyKey: dto.idempotencyKey,
        }),
      );
    } catch (error) {
      if (isDatabaseConflict(error)) {
        const again = await this.checkIns.findOne({
          where: {
            organizationId: user.organizationId,
            idempotencyKey: dto.idempotencyKey,
          },
        });
        if (again) {
          return again;
        }
        throw new ConflictException('Check-in was already recorded');
      }
      throw error;
    }
  }

  async addExpense(user: AuthUser, dto: CreateFieldExpenseDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    const existing = await this.expenses.findOne({
      where: {
        organizationId: user.organizationId,
        idempotencyKey: dto.idempotencyKey,
      },
    });
    if (existing) {
      return existing;
    }
    return this.expenses.save(
      this.expenses.create({
        organizationId: user.organizationId,
        departureId: dto.departureId,
        staffId: dto.staffId ?? null,
        category: dto.category,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        note: dto.note ?? '',
        idempotencyKey: dto.idempotencyKey,
      }),
    );
  }

  listExpenses(organizationId: string, page?: number, limit?: number) {
    return paginate(this.expenses, organizationId, page, limit);
  }

  async addInspection(user: AuthUser, dto: CreateFieldInspectionDto) {
    const existing = await this.inspections.findOne({
      where: {
        organizationId: user.organizationId,
        idempotencyKey: dto.idempotencyKey,
      },
    });
    if (existing) {
      return existing;
    }
    return this.inspections.save(
      this.inspections.create({
        organizationId: user.organizationId,
        vehicleId: dto.vehicleId,
        departureId: dto.departureId ?? null,
        result: dto.result,
        notes: dto.notes ?? '',
        idempotencyKey: dto.idempotencyKey,
      }),
    );
  }

  listInspections(organizationId: string, page?: number, limit?: number) {
    return paginate(this.inspections, organizationId, page, limit);
  }
}
