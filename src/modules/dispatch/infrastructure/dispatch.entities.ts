import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { AssignmentRole, DepartureStatus } from '../../../common/enums';

@Entity({ name: 'departures' })
export class Departure extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  bookingId: string;

  @Index()
  @Column({ type: 'varchar', length: 40 })
  code: string;

  @Column({ type: 'date' })
  startsOn: string;

  @Column({ type: 'date' })
  endsOn: string;

  @Column({ type: 'varchar', length: 32, default: DepartureStatus.Planned })
  status: DepartureStatus;
}

@Entity({ name: 'assignments' })
export class Assignment extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  staffId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  vehicleId: string | null;

  @Column({ type: 'varchar', length: 32 })
  role: AssignmentRole;

  @Column({ type: 'date' })
  startsOn: string;

  @Column({ type: 'date' })
  endsOn: string;
}

@Entity({ name: 'manifests' })
export class Manifest extends TenantEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  departureId: string;

  @Column({ type: 'timestamptz' })
  generatedAt: Date;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;
}
