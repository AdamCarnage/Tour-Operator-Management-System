import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { BookingStatus, LeadStatus, QuoteStatus } from '../../../common/enums';
import { findOwned, paginate } from '../../../common/pagination';
import { AuditService } from '../../admin/application/audit.service';
import { WebhooksService } from '../../admin/application/admin.services';
import { Booking } from '../../bookings/infrastructure/booking.entities';
import {
  ItineraryDay,
  ItineraryTemplate,
  ServiceLine,
} from '../../catalog/infrastructure/catalog.entities';
import { Customer, Lead } from '../../crm/infrastructure/crm.entities';
import { isValidRange } from '../../dispatch/domain/schedule-conflict';
import { expandServiceLines, summarizeMoney } from '../domain/quote-costing';
import {
  Quote,
  QuoteLine,
  QuoteVersion,
} from '../infrastructure/quote.entities';
import type {
  AcceptQuoteDto,
  CreateQuoteDto,
  CreateQuoteFromTemplateDto,
  CreateQuoteLineDto,
} from '../api/quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audit: AuditService,
    private readonly webhooks: WebhooksService,
    @InjectRepository(Quote) private readonly quotes: Repository<Quote>,
    @InjectRepository(QuoteVersion)
    private readonly versions: Repository<QuoteVersion>,
    @InjectRepository(QuoteLine) private readonly lines: Repository<QuoteLine>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(ItineraryTemplate)
    private readonly templates: Repository<ItineraryTemplate>,
    @InjectRepository(ItineraryDay)
    private readonly days: Repository<ItineraryDay>,
    @InjectRepository(ServiceLine)
    private readonly serviceLines: Repository<ServiceLine>,
  ) {}

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.quotes, organizationId, page, limit);
  }

  async get(organizationId: string, id: string) {
    const quote = await findOwned(this.quotes, organizationId, id, 'Quote');
    const versions = await this.versions.find({
      where: { organizationId, quoteId: id },
      order: { versionNumber: 'ASC' },
    });
    const versionIds = versions.map((version) => version.id);
    const lines = versionIds.length
      ? await this.lines
          .createQueryBuilder('line')
          .where('line.organizationId = :organizationId', { organizationId })
          .andWhere('line.versionId IN (:...versionIds)', { versionIds })
          .getMany()
      : [];
    return {
      ...quote,
      versions: versions.map((version) => ({
        ...version,
        lines: lines.filter((line) => line.versionId === version.id),
      })),
    };
  }

  async create(user: AuthUser, dto: CreateQuoteDto) {
    await findOwned(
      this.customers,
      user.organizationId,
      dto.customerId,
      'Customer',
    );
    if (dto.leadId) {
      await findOwned(this.leads, user.organizationId, dto.leadId, 'Lead');
    }
    return this.dataSource.transaction(async (manager) => {
      const quote = await manager.save(
        manager.create(Quote, {
          organizationId: user.organizationId,
          customerId: dto.customerId,
          leadId: dto.leadId ?? null,
          productId: dto.productId ?? null,
          templateId: null,
          status: QuoteStatus.Draft,
          currency: dto.currency,
          title: dto.title,
        }),
      );
      await manager.save(
        manager.create(QuoteVersion, {
          organizationId: user.organizationId,
          quoteId: quote.id,
          versionNumber: 1,
          paxCount: 1,
          vehicleCount: 0,
          fxRate: '1.00000000',
          totalCostMinor: 0,
          totalSellMinor: 0,
          marginMinor: 0,
          notes: '',
        }),
      );
      return quote;
    });
  }

  async createFromTemplate(user: AuthUser, dto: CreateQuoteFromTemplateDto) {
    const template = await findOwned(
      this.templates,
      user.organizationId,
      dto.templateId,
      'Template',
    );
    await findOwned(
      this.customers,
      user.organizationId,
      dto.customerId,
      'Customer',
    );
    const days = await this.days.find({
      where: { organizationId: user.organizationId, templateId: template.id },
    });
    const dayIds = days.map((day) => day.id);
    const source = dayIds.length
      ? await this.serviceLines
          .createQueryBuilder('line')
          .where('line.organizationId = :organizationId', {
            organizationId: user.organizationId,
          })
          .andWhere('line.dayId IN (:...dayIds)', { dayIds })
          .getMany()
      : [];
    const currencies = new Set(source.map((line) => line.currency));
    if (currencies.size > 1) {
      throw new BadRequestException('Template lines must share one currency');
    }
    const currency = source[0]?.currency ?? dto.currency;
    if (!currency) {
      throw new BadRequestException(
        'A currency is required when the template has no lines',
      );
    }
    if (dto.currency && dto.currency !== currency) {
      throw new BadRequestException(
        'Currency does not match the template lines',
      );
    }
    const expanded = expandServiceLines(source, dto.paxCount, dto.vehicleCount);
    const summary = summarizeMoney(expanded);
    return this.dataSource.transaction(async (manager) => {
      const quote = await manager.save(
        manager.create(Quote, {
          organizationId: user.organizationId,
          customerId: dto.customerId,
          leadId: dto.leadId ?? null,
          productId: template.productId,
          templateId: template.id,
          status: QuoteStatus.Draft,
          currency,
          title: dto.title ?? template.name,
        }),
      );
      const version = await manager.save(
        manager.create(QuoteVersion, {
          organizationId: user.organizationId,
          quoteId: quote.id,
          versionNumber: 1,
          paxCount: dto.paxCount,
          vehicleCount: dto.vehicleCount,
          fxRate: dto.fxRate ?? '1.00000000',
          ...summary,
          notes: '',
        }),
      );
      if (expanded.length) {
        await manager.save(
          expanded.map((line) =>
            manager.create(QuoteLine, {
              organizationId: user.organizationId,
              versionId: version.id,
              description: line.description,
              category: line.category,
              quantity: line.quantity,
              unitCostMinor: line.unitCostMinor,
              unitSellMinor: line.unitSellMinor,
              currency: line.currency,
            }),
          ),
        );
      }
      return quote;
    });
  }

  async addLine(
    user: AuthUser,
    quoteId: string,
    versionId: string,
    dto: CreateQuoteLineDto,
  ) {
    const quote = await findOwned(
      this.quotes,
      user.organizationId,
      quoteId,
      'Quote',
    );
    if (quote.status !== QuoteStatus.Draft) {
      throw new BadRequestException('Lines can only be added to a draft quote');
    }
    const version = await this.ownedVersion(
      user.organizationId,
      quoteId,
      versionId,
    );
    await this.lines.save(
      this.lines.create({
        organizationId: user.organizationId,
        versionId: version.id,
        description: dto.description,
        category: dto.category,
        quantity: dto.quantity,
        unitCostMinor: dto.unitCostMinor,
        unitSellMinor: dto.unitSellMinor,
        currency: quote.currency,
      }),
    );
    await this.recalculate(version.id);
    return this.get(user.organizationId, quoteId);
  }

  async send(user: AuthUser, quoteId: string) {
    const quote = await findOwned(
      this.quotes,
      user.organizationId,
      quoteId,
      'Quote',
    );
    if (quote.status !== QuoteStatus.Draft) {
      throw new BadRequestException('Only a draft quote can be sent');
    }
    const versions = await this.versions.find({
      where: { organizationId: user.organizationId, quoteId },
    });
    const latest = versions.sort(
      (a, b) => b.versionNumber - a.versionNumber,
    )[0];
    if (!latest) {
      throw new BadRequestException('Quote has no version');
    }
    const lineCount = await this.lines.count({
      where: { organizationId: user.organizationId, versionId: latest.id },
    });
    if (lineCount === 0) {
      throw new BadRequestException('Add at least one line before sending');
    }
    quote.status = QuoteStatus.Sent;
    return this.quotes.save(quote);
  }

  async accept(user: AuthUser, quoteId: string, dto: AcceptQuoteDto) {
    if (!isValidRange(dto.startDate, dto.endDate)) {
      throw new BadRequestException(
        'The end date must be on or after the start date',
      );
    }
    const result = await this.dataSource.transaction(async (manager) => {
      const quote = await manager.findOne(Quote, {
        where: { id: quoteId, organizationId: user.organizationId },
      });
      if (!quote) {
        throw new NotFoundException('Quote not found');
      }
      if (
        quote.status !== QuoteStatus.Draft &&
        quote.status !== QuoteStatus.Sent
      ) {
        throw new BadRequestException('This quote can no longer be accepted');
      }
      const version = await manager.findOne(QuoteVersion, {
        where: {
          id: dto.versionId,
          quoteId: quote.id,
          organizationId: user.organizationId,
        },
      });
      if (!version) {
        throw new NotFoundException('Quote version not found');
      }
      const depositDueMinor = Math.round(
        (version.totalSellMinor * dto.depositPercent) / 100,
      );
      quote.status = QuoteStatus.Accepted;
      await manager.save(quote);
      const booking = await manager.save(
        manager.create(Booking, {
          organizationId: user.organizationId,
          quoteId: quote.id,
          customerId: quote.customerId,
          status: BookingStatus.Pending,
          currency: quote.currency,
          fxRate: version.fxRate,
          totalCostMinor: version.totalCostMinor,
          totalSellMinor: version.totalSellMinor,
          depositDueMinor,
          balanceDueMinor: version.totalSellMinor - depositDueMinor,
          startDate: dto.startDate,
          endDate: dto.endDate,
        }),
      );
      if (quote.leadId) {
        await manager.update(
          Lead,
          { id: quote.leadId, organizationId: user.organizationId },
          { status: LeadStatus.Won },
        );
      }
      return { quote, booking };
    });
    await this.audit.record(
      user.organizationId,
      user.userId,
      'quote.accepted',
      'quote',
      result.quote.id,
      { bookingId: result.booking.id },
    );
    await this.webhooks.publish(user.organizationId, 'quote.accepted', {
      quoteId: result.quote.id,
      bookingId: result.booking.id,
    });
    return result;
  }

  private async ownedVersion(
    organizationId: string,
    quoteId: string,
    versionId: string,
  ) {
    const version = await this.versions.findOne({
      where: { id: versionId, organizationId, quoteId },
    });
    if (!version) {
      throw new NotFoundException('Quote version not found');
    }
    return version;
  }

  private async recalculate(versionId: string) {
    const version = await this.versions.findOneByOrFail({ id: versionId });
    const lines = await this.lines.find({ where: { versionId } });
    const summary = summarizeMoney(
      lines.map((line) => ({
        costMinor: line.quantity * line.unitCostMinor,
        sellMinor: line.quantity * line.unitSellMinor,
      })),
    );
    Object.assign(version, summary);
    await this.versions.save(version);
  }
}
