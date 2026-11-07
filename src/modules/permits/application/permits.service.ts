import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { ControlNumberStatus } from '../../../common/enums';
import { findOwned, paginate } from '../../../common/pagination';
import { Departure } from '../../dispatch/infrastructure/dispatch.entities';
import { calculateParkFees } from '../domain/park-fees';
import {
  ControlNumber,
  ParkFeeLine,
  ParkPermit,
} from '../infrastructure/permit.entities';
import type {
  CreatePermitDto,
  ParkFeePreviewDto,
  UpdatePermitDto,
} from '../api/permit.dto';

@Injectable()
export class PermitsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ParkPermit)
    private readonly permits: Repository<ParkPermit>,
    @InjectRepository(ParkFeeLine)
    private readonly lines: Repository<ParkFeeLine>,
    @InjectRepository(ControlNumber)
    private readonly controls: Repository<ControlNumber>,
    @InjectRepository(Departure)
    private readonly departures: Repository<Departure>,
  ) {}

  preview(dto: ParkFeePreviewDto) {
    return calculateParkFees(dto);
  }

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.permits, organizationId, page, limit);
  }

  async get(organizationId: string, id: string) {
    const permit = await findOwned(this.permits, organizationId, id, 'Permit');
    const lines = await this.lines.find({
      where: { organizationId, permitId: id },
    });
    const controlNumbers = await this.controls.find({
      where: { organizationId, permitId: id },
    });
    return { ...permit, lines, controlNumbers };
  }

  async create(user: AuthUser, dto: CreatePermitDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    const fees = calculateParkFees(dto);
    return this.dataSource.transaction(async (manager) => {
      const permit = await manager.save(
        manager.create(ParkPermit, {
          organizationId: user.organizationId,
          departureId: dto.departureId,
          parkName: dto.parkName,
          currency: dto.currency,
          totalMinor: fees.totalMinor,
        }),
      );
      const rows = [
        {
          description: 'Visitor nights',
          quantity: dto.visitors * dto.nights,
          unitAmountMinor: dto.feePerVisitorNightMinor,
        },
        {
          description: 'Vehicles',
          quantity: dto.vehicles,
          unitAmountMinor: dto.feePerVehicleMinor,
        },
        {
          description: 'VAT',
          quantity: 1,
          unitAmountMinor: fees.vatMinor,
        },
      ].filter((row) => row.quantity > 0 && row.unitAmountMinor > 0);
      await manager.save(
        rows.map((row) =>
          manager.create(ParkFeeLine, {
            organizationId: user.organizationId,
            permitId: permit.id,
            currency: dto.currency,
            ...row,
          }),
        ),
      );
      if (dto.controlNumber) {
        await manager.save(
          manager.create(ControlNumber, {
            organizationId: user.organizationId,
            permitId: permit.id,
            number: dto.controlNumber,
            status: ControlNumberStatus.Pending,
            amountMinor: fees.totalMinor,
          }),
        );
      }
      return permit;
    });
  }

  async update(user: AuthUser, id: string, dto: UpdatePermitDto) {
    const permit = await findOwned(
      this.permits,
      user.organizationId,
      id,
      'Permit',
    );
    if (dto.status) {
      permit.status = dto.status;
      await this.permits.save(permit);
    }
    if (dto.controlNumber) {
      await this.controls.save(
        this.controls.create({
          organizationId: user.organizationId,
          permitId: permit.id,
          number: dto.controlNumber,
          status: dto.controlStatus ?? ControlNumberStatus.Pending,
          amountMinor: permit.totalMinor,
        }),
      );
    }
    return this.get(user.organizationId, id);
  }
}
