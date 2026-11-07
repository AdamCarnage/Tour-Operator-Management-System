import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { AssignmentRole, AvailabilityStatus } from '../../../common/enums';
import { isDatabaseConflict } from '../../../common/errors';
import { findOwned, paginate } from '../../../common/pagination';
import { Booking } from '../../bookings/infrastructure/booking.entities';
import { Traveler } from '../../bookings/infrastructure/booking.entities';
import {
  StaffAvailability,
  StaffMember,
  Vehicle,
} from '../../resources/infrastructure/resource.entities';
import { isValidRange, rangesOverlap } from '../domain/schedule-conflict';
import {
  Assignment,
  Departure,
  Manifest,
} from '../infrastructure/dispatch.entities';
import type {
  CreateAssignmentDto,
  CreateDepartureDto,
  UpdateDepartureDto,
} from '../api/dispatch.dto';
import { newSecret } from '../../identity/infrastructure/token.hasher';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Departure)
    private readonly departures: Repository<Departure>,
    @InjectRepository(Assignment)
    private readonly assignments: Repository<Assignment>,
    @InjectRepository(Manifest)
    private readonly manifests: Repository<Manifest>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(Traveler)
    private readonly travelers: Repository<Traveler>,
    @InjectRepository(StaffMember)
    private readonly staff: Repository<StaffMember>,
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(StaffAvailability)
    private readonly availability: Repository<StaffAvailability>,
  ) {}

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.departures, organizationId, page, limit);
  }

  async get(organizationId: string, id: string) {
    const departure = await findOwned(
      this.departures,
      organizationId,
      id,
      'Departure',
    );
    const assignments = await this.assignments.find({
      where: { organizationId, departureId: id },
    });
    const manifest = await this.manifests.findOne({
      where: { organizationId, departureId: id },
    });
    return { ...departure, assignments, manifest };
  }

  async create(user: AuthUser, dto: CreateDepartureDto) {
    if (!isValidRange(dto.startsOn, dto.endsOn)) {
      throw new BadRequestException(
        'The end date must be on or after the start date',
      );
    }
    await findOwned(
      this.bookings,
      user.organizationId,
      dto.bookingId,
      'Booking',
    );
    return this.departures.save(
      this.departures.create({
        organizationId: user.organizationId,
        bookingId: dto.bookingId,
        code: `DEP-${newSecret().slice(0, 8).toUpperCase()}`,
        startsOn: dto.startsOn,
        endsOn: dto.endsOn,
      }),
    );
  }

  async update(user: AuthUser, id: string, dto: UpdateDepartureDto) {
    const departure = await findOwned(
      this.departures,
      user.organizationId,
      id,
      'Departure',
    );
    departure.status = dto.status;
    return this.departures.save(departure);
  }

  async assign(user: AuthUser, departureId: string, dto: CreateAssignmentDto) {
    if (!isValidRange(dto.startsOn, dto.endsOn)) {
      throw new BadRequestException(
        'The end date must be on or after the start date',
      );
    }
    await findOwned(
      this.departures,
      user.organizationId,
      departureId,
      'Departure',
    );
    if (dto.role === AssignmentRole.Vehicle) {
      if (!dto.vehicleId) {
        throw new BadRequestException('A vehicle assignment needs a vehicle');
      }
      await findOwned(
        this.vehicles,
        user.organizationId,
        dto.vehicleId,
        'Vehicle',
      );
      await this.assertNoOverlap(
        'vehicle',
        dto.vehicleId,
        dto.startsOn,
        dto.endsOn,
        user.organizationId,
      );
    } else {
      if (!dto.staffId) {
        throw new BadRequestException('This assignment needs a staff member');
      }
      const member = await findOwned(
        this.staff,
        user.organizationId,
        dto.staffId,
        'Staff member',
      );
      if (!member.active) {
        throw new BadRequestException('Staff member is inactive');
      }
      await this.assertNotOnLeave(
        user.organizationId,
        dto.staffId,
        dto.startsOn,
        dto.endsOn,
      );
      await this.assertNoOverlap(
        'staff',
        dto.staffId,
        dto.startsOn,
        dto.endsOn,
        user.organizationId,
      );
    }
    try {
      return await this.assignments.save(
        this.assignments.create({
          organizationId: user.organizationId,
          departureId,
          staffId: dto.staffId ?? null,
          vehicleId: dto.vehicleId ?? null,
          role: dto.role,
          startsOn: dto.startsOn,
          endsOn: dto.endsOn,
        }),
      );
    } catch (error) {
      if (isDatabaseConflict(error)) {
        throw new ConflictException(
          'That resource is already assigned in the date range',
        );
      }
      throw error;
    }
  }

  async manifest(user: AuthUser, departureId: string) {
    const departure = await findOwned(
      this.departures,
      user.organizationId,
      departureId,
      'Departure',
    );
    const booking = await findOwned(
      this.bookings,
      user.organizationId,
      departure.bookingId,
      'Booking',
    );
    const travelers = await this.travelers.find({
      where: { organizationId: user.organizationId, bookingId: booking.id },
    });
    const assignments = await this.assignments.find({
      where: { organizationId: user.organizationId, departureId },
    });
    const payload = {
      generatedAt: new Date().toISOString(),
      departure: {
        id: departure.id,
        code: departure.code,
        startsOn: departure.startsOn,
        endsOn: departure.endsOn,
        status: departure.status,
      },
      booking: {
        id: booking.id,
        currency: booking.currency,
        status: booking.status,
      },
      travelers: travelers.map((traveler) => ({
        id: traveler.id,
        fullName: traveler.fullName,
        nationality: traveler.nationality,
      })),
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        role: assignment.role,
        staffId: assignment.staffId,
        vehicleId: assignment.vehicleId,
        startsOn: assignment.startsOn,
        endsOn: assignment.endsOn,
      })),
    };
    const existing = await this.manifests.findOne({
      where: { organizationId: user.organizationId, departureId },
    });
    if (existing) {
      existing.payload = payload;
      existing.generatedAt = new Date();
      return this.manifests.save(existing);
    }
    return this.manifests.save(
      this.manifests.create({
        organizationId: user.organizationId,
        departureId,
        generatedAt: new Date(),
        payload,
      }),
    );
  }

  private async assertNoOverlap(
    kind: 'staff' | 'vehicle',
    resourceId: string,
    startsOn: string,
    endsOn: string,
    organizationId: string,
  ) {
    const where =
      kind === 'staff'
        ? { organizationId, staffId: resourceId }
        : { organizationId, vehicleId: resourceId };
    const rows = await this.assignments.find({ where });
    const clash = rows.find((row) =>
      rangesOverlap(row.startsOn, row.endsOn, startsOn, endsOn),
    );
    if (clash) {
      throw new ConflictException(
        kind === 'staff'
          ? 'Staff member is already assigned in that date range'
          : 'Vehicle is already assigned in that date range',
      );
    }
  }

  private async assertNotOnLeave(
    organizationId: string,
    staffId: string,
    startsOn: string,
    endsOn: string,
  ) {
    const rows = await this.availability.find({
      where: { organizationId, staffId, status: AvailabilityStatus.Leave },
    });
    const clash = rows.find((row) =>
      rangesOverlap(row.startsOn, row.endsOn, startsOn, endsOn),
    );
    if (clash) {
      throw new ConflictException(
        'Staff member is on leave in that date range',
      );
    }
  }
}
