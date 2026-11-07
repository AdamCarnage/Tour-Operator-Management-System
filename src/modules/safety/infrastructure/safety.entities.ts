import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { IncidentSeverity, IncidentStatus } from '../../../common/enums';

export type ChecklistItem = {
  label: string;
  done: boolean;
};

@Entity({ name: 'safety_checklists' })
export class SafetyChecklist extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Column({ type: 'jsonb' })
  items: ChecklistItem[];

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  completedBy: string | null;
}

@Entity({ name: 'health_logs' })
export class HealthLog extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Column({ type: 'uuid', nullable: true })
  staffId: string | null;

  @Column({ type: 'uuid', nullable: true })
  travelerId: string | null;

  @Column({ type: 'timestamptz' })
  recordedAt: Date;

  @Column({ type: 'int', nullable: true })
  spo2: number | null;

  @Column({ type: 'text', default: '' })
  symptoms: string;

  @Column({ type: 'text', default: '' })
  notes: string;
}

@Entity({ name: 'incidents' })
export class Incident extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Column({ type: 'varchar', length: 32 })
  severity: IncidentSeverity;

  @Column({ type: 'varchar', length: 32, default: IncidentStatus.Open })
  status: IncidentStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamptz' })
  reportedAt: Date;
}

@Entity({ name: 'load_records' })
export class LoadRecord extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Index()
  @Column({ type: 'uuid' })
  staffId: string;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  weightKg: string;

  @Column({ type: 'date' })
  recordedOn: string;
}

@Entity({ name: 'location_pings' })
export class LocationPing extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Column({ type: 'uuid', nullable: true })
  staffId: string | null;

  @Column({ type: 'numeric', precision: 9, scale: 6 })
  latitude: string;

  @Column({ type: 'numeric', precision: 9, scale: 6 })
  longitude: string;

  @Column({ type: 'timestamptz' })
  recordedAt: Date;
}
