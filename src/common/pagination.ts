import { NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

export type Page<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export function pageWindow(page?: number, limit?: number) {
  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.min(100, Math.max(1, limit ?? 20));
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export async function paginate<T extends ObjectLiteral>(
  repo: Repository<T>,
  organizationId: string,
  page?: number,
  limit?: number,
  extra: FindOptionsWhere<T> = {},
): Promise<Page<T>> {
  const window = pageWindow(page, limit);
  const [data, total] = await repo.findAndCount({
    where: { ...extra, organizationId } as FindOptionsWhere<T>,
    order: { createdAt: 'DESC' } as never,
    skip: window.skip,
    take: window.limit,
  });
  return {
    data,
    meta: { page: window.page, limit: window.limit, total },
  };
}

export async function findOwned<T extends ObjectLiteral>(
  repo: Repository<T>,
  organizationId: string,
  id: string,
  label: string,
): Promise<T> {
  const row = await repo.findOne({
    where: { id, organizationId } as unknown as FindOptionsWhere<T>,
  });
  if (!row) {
    throw new NotFoundException(`${label} not found`);
  }
  return row;
}
