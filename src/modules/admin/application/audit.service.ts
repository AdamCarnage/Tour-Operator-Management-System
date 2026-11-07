import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../../../common/pagination';
import { AuditLog } from '../infrastructure/admin.entities';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private readonly logs: Repository<AuditLog>,
  ) {}

  async record(
    organizationId: string,
    actorUserId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.logs.save(
      this.logs.create({
        organizationId,
        actorUserId,
        action,
        entityType,
        entityId,
        metadata,
      }),
    );
  }

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.logs, organizationId, page, limit);
  }
}
