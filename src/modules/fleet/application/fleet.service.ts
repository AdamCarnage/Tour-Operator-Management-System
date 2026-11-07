import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned, paginate } from '../../../common/pagination';
import { Vehicle } from '../../resources/infrastructure/resource.entities';
import { FuelLog, MaintenanceTask } from '../infrastructure/fleet.entities';
import type {
  CreateFuelLogDto,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from '../api/fleet.dto';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(MaintenanceTask)
    private readonly tasks: Repository<MaintenanceTask>,
    @InjectRepository(FuelLog) private readonly fuelLogs: Repository<FuelLog>,
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
  ) {}

  listTasks(organizationId: string, page?: number, limit?: number) {
    return paginate(this.tasks, organizationId, page, limit);
  }

  async createTask(user: AuthUser, dto: CreateMaintenanceDto) {
    await findOwned(
      this.vehicles,
      user.organizationId,
      dto.vehicleId,
      'Vehicle',
    );
    return this.tasks.save(
      this.tasks.create({
        organizationId: user.organizationId,
        vehicleId: dto.vehicleId,
        title: dto.title,
        dueOn: dto.dueOn,
        costMinor: dto.costMinor,
        currency: dto.currency,
      }),
    );
  }

  async updateTask(user: AuthUser, id: string, dto: UpdateMaintenanceDto) {
    const task = await findOwned(
      this.tasks,
      user.organizationId,
      id,
      'Maintenance task',
    );
    task.status = dto.status;
    return this.tasks.save(task);
  }

  listFuel(organizationId: string, page?: number, limit?: number) {
    return paginate(this.fuelLogs, organizationId, page, limit);
  }

  async createFuel(user: AuthUser, dto: CreateFuelLogDto) {
    await findOwned(
      this.vehicles,
      user.organizationId,
      dto.vehicleId,
      'Vehicle',
    );
    return this.fuelLogs.save(
      this.fuelLogs.create({
        organizationId: user.organizationId,
        vehicleId: dto.vehicleId,
        departureId: dto.departureId ?? null,
        liters: dto.liters.toFixed(2),
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        odometer: dto.odometer ?? null,
        filledOn: dto.filledOn,
      }),
    );
  }
}
