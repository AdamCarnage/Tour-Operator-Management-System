import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { findOwned } from '../../../common/pagination';
import {
  Booking,
  Payment,
} from '../../bookings/infrastructure/booking.entities';
import {
  hashSecret,
  newSecret,
} from '../../identity/infrastructure/token.hasher';
import {
  Quote,
  QuoteLine,
  QuoteVersion,
} from '../../quotes/infrastructure/quote.entities';
import { ClientFeedback, PortalToken } from '../infrastructure/portal.entities';
import type {
  CreateFeedbackDto,
  CreatePortalTokenDto,
} from '../api/portal.dto';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(PortalToken)
    private readonly tokens: Repository<PortalToken>,
    @InjectRepository(ClientFeedback)
    private readonly feedback: Repository<ClientFeedback>,
    @InjectRepository(Quote) private readonly quotes: Repository<Quote>,
    @InjectRepository(QuoteVersion)
    private readonly versions: Repository<QuoteVersion>,
    @InjectRepository(QuoteLine) private readonly lines: Repository<QuoteLine>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
  ) {}

  async createToken(user: AuthUser, dto: CreatePortalTokenDto) {
    if (!dto.quoteId && !dto.bookingId) {
      throw new BadRequestException('Provide a quote or a booking');
    }
    if (dto.quoteId) {
      await findOwned(this.quotes, user.organizationId, dto.quoteId, 'Quote');
    }
    if (dto.bookingId) {
      await findOwned(
        this.bookings,
        user.organizationId,
        dto.bookingId,
        'Booking',
      );
    }
    const token = newSecret();
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await this.tokens.save(
      this.tokens.create({
        organizationId: user.organizationId,
        tokenHash: hashSecret(token),
        quoteId: dto.quoteId ?? null,
        bookingId: dto.bookingId ?? null,
        expiresAt,
      }),
    );
    return { token, expiresAt };
  }

  async summary(rawToken: string) {
    const access = await this.requireToken(rawToken);
    const quote = access.quoteId
      ? await this.quotes.findOne({
          where: { id: access.quoteId, organizationId: access.organizationId },
        })
      : null;
    const booking = access.bookingId
      ? await this.bookings.findOne({
          where: {
            id: access.bookingId,
            organizationId: access.organizationId,
          },
        })
      : null;
    const version = quote
      ? await this.versions.findOne({
          where: { organizationId: access.organizationId, quoteId: quote.id },
          order: { versionNumber: 'DESC' },
        })
      : null;
    const lines = version
      ? await this.lines.find({
          where: {
            organizationId: access.organizationId,
            versionId: version.id,
          },
        })
      : [];
    const payments = booking
      ? await this.payments.find({
          where: {
            organizationId: access.organizationId,
            bookingId: booking.id,
          },
        })
      : [];
    return {
      quote: quote && {
        id: quote.id,
        title: quote.title,
        status: quote.status,
        currency: quote.currency,
        totalSellMinor: version?.totalSellMinor ?? 0,
        lines: lines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unitSellMinor: line.unitSellMinor,
        })),
      },
      booking: booking && {
        id: booking.id,
        status: booking.status,
        currency: booking.currency,
        startDate: booking.startDate,
        endDate: booking.endDate,
        depositDueMinor: booking.depositDueMinor,
        balanceDueMinor: booking.balanceDueMinor,
        payments: payments.map((payment) => ({
          amountMinor: payment.amountMinor,
          currency: payment.currency,
          status: payment.status,
          paidAt: payment.paidAt,
        })),
      },
    };
  }

  async addFeedback(rawToken: string, dto: CreateFeedbackDto) {
    const access = await this.requireToken(rawToken);
    if (!access.bookingId) {
      throw new BadRequestException('This link is not attached to a booking');
    }
    return this.feedback.save(
      this.feedback.create({
        organizationId: access.organizationId,
        bookingId: access.bookingId,
        rating: dto.rating,
        comment: dto.comment ?? '',
      }),
    );
  }

  private async requireToken(rawToken: string) {
    const access = await this.tokens.findOne({
      where: { tokenHash: hashSecret(rawToken) },
    });
    if (!access) {
      throw new NotFoundException('Portal link not found');
    }
    if (access.expiresAt.getTime() < Date.now()) {
      throw new GoneException('Portal link has expired');
    }
    return access;
  }
}
