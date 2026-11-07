import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned, paginate } from '../../../common/pagination';
import { isValidRange } from '../../dispatch/domain/schedule-conflict';
import {
  Payable,
  Property,
  RoomType,
  SeasonalRate,
  Supplier,
  SupplierRequest,
} from '../infrastructure/supplier.entities';
import type {
  CreatePayableDto,
  CreatePropertyDto,
  CreateRateDto,
  CreateRoomTypeDto,
  CreateSupplierDto,
  CreateSupplierRequestDto,
  UpdatePayableDto,
  UpdateSupplierRequestDto,
} from '../api/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliers: Repository<Supplier>,
    @InjectRepository(Property)
    private readonly properties: Repository<Property>,
    @InjectRepository(RoomType)
    private readonly roomTypes: Repository<RoomType>,
    @InjectRepository(SeasonalRate)
    private readonly rates: Repository<SeasonalRate>,
    @InjectRepository(SupplierRequest)
    private readonly requests: Repository<SupplierRequest>,
    @InjectRepository(Payable) private readonly payables: Repository<Payable>,
  ) {}

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.suppliers, organizationId, page, limit);
  }

  get(organizationId: string, id: string) {
    return findOwned(this.suppliers, organizationId, id, 'Supplier');
  }

  create(user: AuthUser, dto: CreateSupplierDto) {
    return this.suppliers.save(
      this.suppliers.create({
        organizationId: user.organizationId,
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        country: dto.country ?? '',
        notes: dto.notes ?? '',
      }),
    );
  }

  async createProperty(
    user: AuthUser,
    supplierId: string,
    dto: CreatePropertyDto,
  ) {
    await this.get(user.organizationId, supplierId);
    return this.properties.save(
      this.properties.create({
        organizationId: user.organizationId,
        supplierId,
        name: dto.name,
        location: dto.location ?? '',
        kind: dto.kind ?? 'lodge',
      }),
    );
  }

  async createRoomType(
    user: AuthUser,
    propertyId: string,
    dto: CreateRoomTypeDto,
  ) {
    await findOwned(
      this.properties,
      user.organizationId,
      propertyId,
      'Property',
    );
    return this.roomTypes.save(
      this.roomTypes.create({
        organizationId: user.organizationId,
        propertyId,
        name: dto.name,
        capacity: dto.capacity,
      }),
    );
  }

  async createRate(user: AuthUser, supplierId: string, dto: CreateRateDto) {
    await this.get(user.organizationId, supplierId);
    if (!isValidRange(dto.startsOn, dto.endsOn)) {
      throw new BadRequestException(
        'The end date must be on or after the start date',
      );
    }
    if (dto.roomTypeId) {
      await findOwned(
        this.roomTypes,
        user.organizationId,
        dto.roomTypeId,
        'Room type',
      );
    }
    return this.rates.save(
      this.rates.create({
        organizationId: user.organizationId,
        supplierId,
        roomTypeId: dto.roomTypeId ?? null,
        seasonName: dto.seasonName,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        basis: dto.basis,
      }),
    );
  }

  listRates(organizationId: string, supplierId: string) {
    return this.rates.find({ where: { organizationId, supplierId } });
  }

  async createRequest(user: AuthUser, dto: CreateSupplierRequestDto) {
    await this.get(user.organizationId, dto.supplierId);
    return this.requests.save(
      this.requests.create({
        organizationId: user.organizationId,
        supplierId: dto.supplierId,
        bookingId: dto.bookingId,
        details: dto.details ?? '',
      }),
    );
  }

  async updateRequest(
    user: AuthUser,
    id: string,
    dto: UpdateSupplierRequestDto,
  ) {
    const request = await findOwned(
      this.requests,
      user.organizationId,
      id,
      'Supplier request',
    );
    request.status = dto.status;
    return this.requests.save(request);
  }

  listRequests(organizationId: string, page?: number, limit?: number) {
    return paginate(this.requests, organizationId, page, limit);
  }

  async createPayable(user: AuthUser, dto: CreatePayableDto) {
    await this.get(user.organizationId, dto.supplierId);
    return this.payables.save(
      this.payables.create({
        organizationId: user.organizationId,
        supplierId: dto.supplierId,
        bookingId: dto.bookingId ?? null,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        dueOn: dto.dueOn,
      }),
    );
  }

  async updatePayable(user: AuthUser, id: string, dto: UpdatePayableDto) {
    const payable = await findOwned(
      this.payables,
      user.organizationId,
      id,
      'Payable',
    );
    payable.status = dto.status;
    return this.payables.save(payable);
  }

  listPayables(organizationId: string, page?: number, limit?: number) {
    return paginate(this.payables, organizationId, page, limit);
  }
}
