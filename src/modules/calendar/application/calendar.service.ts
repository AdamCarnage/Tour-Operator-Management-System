import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned, pageWindow } from '../../../common/pagination';
import { CalendarItem } from '../infrastructure/calendar.entities';
import type {
  CalendarQueryDto,
  CreateCalendarItemDto,
  UpdateCalendarItemDto,
} from '../api/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarItem)
    private readonly items: Repository<CalendarItem>,
  ) {}

  async list(organizationId: string, query: CalendarQueryDto) {
    const window = pageWindow(query.page, query.limit);
    const qb = this.items
      .createQueryBuilder('item')
      .where('item.organizationId = :organizationId', { organizationId });
    if (query.from) {
      qb.andWhere('item.endsAt >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('item.startsAt <= :to', { to: new Date(query.to) });
    }
    if (query.kind) {
      qb.andWhere('item.kind = :kind', { kind: query.kind });
    }
    if (query.assignedToUserId) {
      qb.andWhere('item.assignedToUserId = :assignedToUserId', {
        assignedToUserId: query.assignedToUserId,
      });
    }
    const [data, total] = await qb
      .orderBy('item.startsAt', 'ASC')
      .skip(window.skip)
      .take(window.limit)
      .getManyAndCount();
    return {
      data,
      meta: { page: window.page, limit: window.limit, total },
    };
  }

  get(organizationId: string, id: string) {
    return findOwned(this.items, organizationId, id, 'Calendar item');
  }

  create(user: AuthUser, dto: CreateCalendarItemDto) {
    this.assertRange(dto.startsAt, dto.endsAt);
    return this.items.save(
      this.items.create({
        organizationId: user.organizationId,
        kind: dto.kind,
        title: dto.title,
        description: dto.description ?? '',
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        allDay: dto.allDay ?? false,
        category: dto.category ?? 'general',
        color: dto.color ?? '#ef4444',
        location: dto.location ?? '',
        createdByUserId: user.userId,
        assignedToUserId: dto.assignedToUserId ?? null,
        bookingId: dto.bookingId ?? null,
        departureId: dto.departureId ?? null,
      }),
    );
  }

  async update(user: AuthUser, id: string, dto: UpdateCalendarItemDto) {
    const item = await findOwned(
      this.items,
      user.organizationId,
      id,
      'Calendar item',
    );
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : item.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : item.endsAt;
    this.assertRange(startsAt.toISOString(), endsAt.toISOString());
    if (dto.kind !== undefined) item.kind = dto.kind;
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.description !== undefined) item.description = dto.description;
    item.startsAt = startsAt;
    item.endsAt = endsAt;
    if (dto.allDay !== undefined) item.allDay = dto.allDay;
    if (dto.category !== undefined) item.category = dto.category;
    if (dto.color !== undefined) item.color = dto.color;
    if (dto.location !== undefined) item.location = dto.location;
    if (dto.assignedToUserId !== undefined) {
      item.assignedToUserId = dto.assignedToUserId;
    }
    if (dto.bookingId !== undefined) item.bookingId = dto.bookingId;
    if (dto.departureId !== undefined) item.departureId = dto.departureId;
    return this.items.save(item);
  }

  async remove(user: AuthUser, id: string) {
    const item = await findOwned(
      this.items,
      user.organizationId,
      id,
      'Calendar item',
    );
    await this.items.remove(item);
    return { ok: true };
  }

  private assertRange(startsAt: string, endsAt: string) {
    if (new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
      throw new BadRequestException('endsAt must be on or after startsAt');
    }
  }
}
