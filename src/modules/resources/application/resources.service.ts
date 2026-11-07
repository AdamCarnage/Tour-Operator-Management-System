import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned, paginate } from '../../../common/pagination';
import { isValidRange } from '../../dispatch/domain/schedule-conflict';
import {
  Certification,
  GearItem,
  StaffAvailability,
  StaffMember,
  Vehicle,
} from '../infrastructure/resource.entities';
import type {
  CreateAvailabilityDto,
  CreateCertificationDto,
  CreateGearDto,
  CreateStaffDto,
  CreateVehicleDto,
  UpdateActiveDto,
} from '../api/resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(StaffMember)
    private readonly staff: Repository<StaffMember>,
    @InjectRepository(Certification)
    private readonly certifications: Repository<Certification>,
    @InjectRepository(StaffAvailability)
    private readonly availability: Repository<StaffAvailability>,
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(GearItem) private readonly gear: Repository<GearItem>,
  ) {}

  listStaff(organizationId: string, page?: number, limit?: number) {
    return paginate(this.staff, organizationId, page, limit);
  }

  getStaff(organizationId: string, id: string) {
    return findOwned(this.staff, organizationId, id, 'Staff member');
  }

  createStaff(user: AuthUser, dto: CreateStaffDto) {
    return this.staff.save(
      this.staff.create({
        organizationId: user.organizationId,
        userId: dto.userId ?? null,
        kind: dto.kind,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone ?? null,
        languages: dto.languages ?? [],
        active: true,
      }),
    );
  }

  async updateStaff(user: AuthUser, id: string, dto: UpdateActiveDto) {
    const member = await this.getStaff(user.organizationId, id);
    member.active = dto.active;
    return this.staff.save(member);
  }

  async addCertification(
    user: AuthUser,
    staffId: string,
    dto: CreateCertificationDto,
  ) {
    await this.getStaff(user.organizationId, staffId);
    return this.certifications.save(
      this.certifications.create({
        organizationId: user.organizationId,
        staffId,
        name: dto.name,
        issuedOn: dto.issuedOn ?? null,
        expiresOn: dto.expiresOn ?? null,
      }),
    );
  }

  listCertifications(organizationId: string, staffId: string) {
    return this.certifications.find({ where: { organizationId, staffId } });
  }

  expiringCertifications(organizationId: string, withinDays = 30) {
    const until = new Date();
    until.setUTCDate(until.getUTCDate() + withinDays);
    const untilDate = until.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return this.certifications.find({
      where: {
        organizationId,
        expiresOn: Between(today, untilDate),
      },
    });
  }

  async addAvailability(
    user: AuthUser,
    staffId: string,
    dto: CreateAvailabilityDto,
  ) {
    await this.getStaff(user.organizationId, staffId);
    if (!isValidRange(dto.startsOn, dto.endsOn)) {
      throw new BadRequestException(
        'The end date must be on or after the start date',
      );
    }
    return this.availability.save(
      this.availability.create({
        organizationId: user.organizationId,
        staffId,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn,
        status: dto.status,
      }),
    );
  }

  listVehicles(organizationId: string, page?: number, limit?: number) {
    return paginate(this.vehicles, organizationId, page, limit);
  }

  createVehicle(user: AuthUser, dto: CreateVehicleDto) {
    return this.vehicles.save(
      this.vehicles.create({
        organizationId: user.organizationId,
        ...dto,
        active: true,
      }),
    );
  }

  async updateVehicle(user: AuthUser, id: string, dto: UpdateActiveDto) {
    const vehicle = await findOwned(
      this.vehicles,
      user.organizationId,
      id,
      'Vehicle',
    );
    vehicle.active = dto.active;
    return this.vehicles.save(vehicle);
  }

  listGear(organizationId: string, page?: number, limit?: number) {
    return paginate(this.gear, organizationId, page, limit);
  }

  createGear(user: AuthUser, dto: CreateGearDto) {
    return this.gear.save(
      this.gear.create({
        organizationId: user.organizationId,
        name: dto.name,
        quantity: dto.quantity,
        notes: dto.notes ?? '',
      }),
    );
  }
}
