import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned, paginate } from '../../../common/pagination';
import { Departure } from '../../dispatch/infrastructure/dispatch.entities';
import { loadWithinLimit, MAX_PORTER_LOAD_KG } from '../domain/load-limit';
import {
  HealthLog,
  Incident,
  LoadRecord,
  LocationPing,
  SafetyChecklist,
} from '../infrastructure/safety.entities';
import type {
  CreateChecklistDto,
  CreateHealthLogDto,
  CreateIncidentDto,
  CreateLoadDto,
  CreateLocationDto,
  UpdateIncidentDto,
} from '../api/safety.dto';

@Injectable()
export class SafetyService {
  constructor(
    @InjectRepository(SafetyChecklist)
    private readonly checklists: Repository<SafetyChecklist>,
    @InjectRepository(HealthLog)
    private readonly healthLogs: Repository<HealthLog>,
    @InjectRepository(Incident)
    private readonly incidents: Repository<Incident>,
    @InjectRepository(LoadRecord)
    private readonly loads: Repository<LoadRecord>,
    @InjectRepository(LocationPing)
    private readonly locations: Repository<LocationPing>,
    @InjectRepository(Departure)
    private readonly departures: Repository<Departure>,
  ) {}

  async createChecklist(user: AuthUser, dto: CreateChecklistDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    const complete =
      dto.items.length > 0 && dto.items.every((item) => item.done);
    return this.checklists.save(
      this.checklists.create({
        organizationId: user.organizationId,
        departureId: dto.departureId,
        items: dto.items,
        completedAt: complete ? new Date() : null,
        completedBy: complete ? user.userId : null,
      }),
    );
  }

  listChecklists(organizationId: string, page?: number, limit?: number) {
    return paginate(this.checklists, organizationId, page, limit);
  }

  async createHealthLog(user: AuthUser, dto: CreateHealthLogDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    return this.healthLogs.save(
      this.healthLogs.create({
        organizationId: user.organizationId,
        departureId: dto.departureId,
        staffId: dto.staffId ?? null,
        travelerId: dto.travelerId ?? null,
        recordedAt: new Date(),
        spo2: dto.spo2 ?? null,
        symptoms: dto.symptoms ?? '',
        notes: dto.notes ?? '',
      }),
    );
  }

  listHealthLogs(organizationId: string, page?: number, limit?: number) {
    return paginate(this.healthLogs, organizationId, page, limit);
  }

  async createIncident(user: AuthUser, dto: CreateIncidentDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    return this.incidents.save(
      this.incidents.create({
        organizationId: user.organizationId,
        departureId: dto.departureId,
        severity: dto.severity,
        description: dto.description,
        reportedAt: new Date(),
      }),
    );
  }

  async updateIncident(user: AuthUser, id: string, dto: UpdateIncidentDto) {
    const incident = await findOwned(
      this.incidents,
      user.organizationId,
      id,
      'Incident',
    );
    incident.status = dto.status;
    return this.incidents.save(incident);
  }

  listIncidents(organizationId: string, page?: number, limit?: number) {
    return paginate(this.incidents, organizationId, page, limit);
  }

  async createLoad(user: AuthUser, dto: CreateLoadDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    if (!loadWithinLimit(dto.weightKg)) {
      throw new BadRequestException(
        `Porter load must be between 0 and ${MAX_PORTER_LOAD_KG} kg`,
      );
    }
    return this.loads.save(
      this.loads.create({
        organizationId: user.organizationId,
        departureId: dto.departureId,
        staffId: dto.staffId,
        weightKg: dto.weightKg.toFixed(2),
        recordedOn: dto.recordedOn,
      }),
    );
  }

  listLoads(organizationId: string, page?: number, limit?: number) {
    return paginate(this.loads, organizationId, page, limit);
  }

  async createLocation(user: AuthUser, dto: CreateLocationDto) {
    await findOwned(
      this.departures,
      user.organizationId,
      dto.departureId,
      'Departure',
    );
    return this.locations.save(
      this.locations.create({
        organizationId: user.organizationId,
        departureId: dto.departureId,
        staffId: dto.staffId ?? null,
        latitude: dto.latitude.toFixed(6),
        longitude: dto.longitude.toFixed(6),
        recordedAt: new Date(),
      }),
    );
  }

  listLocations(organizationId: string, departureId: string) {
    return this.locations.find({
      where: { organizationId, departureId },
      order: { recordedAt: 'DESC' },
      take: 100,
    });
  }
}
