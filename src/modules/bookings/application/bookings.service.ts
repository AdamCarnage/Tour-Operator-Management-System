import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { InvoiceStatus, PaymentStatus, RoleName } from '../../../common/enums';
import { maskSecret } from '../../../common/field-encryption';
import { findOwned, paginate } from '../../../common/pagination';
import { AuditService } from '../../admin/application/audit.service';
import { WebhooksService } from '../../admin/application/admin.services';
import { FieldEncryptionService } from '../../../platform/field-encryption.service';
import { assertBookingTransition } from '../domain/booking-transition';
import {
  Booking,
  Invoice,
  Payment,
  Traveler,
} from '../infrastructure/booking.entities';
import type {
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateTravelerDto,
  UpdateBookingDto,
} from '../api/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly encryption: FieldEncryptionService,
    private readonly audit: AuditService,
    private readonly webhooks: WebhooksService,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(Traveler)
    private readonly travelers: Repository<Traveler>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
  ) {}

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.bookings, organizationId, page, limit);
  }

  async get(organizationId: string, id: string) {
    const booking = await findOwned(
      this.bookings,
      organizationId,
      id,
      'Booking',
    );
    const travelers = await this.travelers.find({
      where: { organizationId, bookingId: id },
    });
    const payments = await this.payments.find({
      where: { organizationId, bookingId: id },
      order: { createdAt: 'DESC' },
    });
    const invoices = await this.invoices.find({
      where: { organizationId, bookingId: id },
    });
    return {
      ...booking,
      travelers: travelers.map((traveler) => this.toTraveler(traveler, false)),
      payments,
      invoices,
    };
  }

  async updateStatus(user: AuthUser, id: string, dto: UpdateBookingDto) {
    const booking = await findOwned(
      this.bookings,
      user.organizationId,
      id,
      'Booking',
    );
    assertBookingTransition(booking.status, dto.status);
    booking.status = dto.status;
    return this.bookings.save(booking);
  }

  async addTraveler(user: AuthUser, bookingId: string, dto: CreateTravelerDto) {
    await findOwned(this.bookings, user.organizationId, bookingId, 'Booking');
    const traveler = await this.travelers.save(
      this.travelers.create({
        organizationId: user.organizationId,
        bookingId,
        fullName: dto.fullName,
        nationality: dto.nationality,
        dateOfBirth: dto.dateOfBirth ?? null,
        gender: dto.gender ?? null,
        passportNumberEncrypted: this.encryption.encrypt(dto.passportNumber),
        passportExpiry: dto.passportExpiry ?? null,
      }),
    );
    return this.toTraveler(traveler, false);
  }

  async getTraveler(
    user: AuthUser,
    bookingId: string,
    travelerId: string,
    reveal: boolean,
  ) {
    await findOwned(this.bookings, user.organizationId, bookingId, 'Booking');
    const traveler = await this.travelers.findOne({
      where: {
        id: travelerId,
        bookingId,
        organizationId: user.organizationId,
      },
    });
    if (!traveler) {
      throw new NotFoundException('Traveler not found');
    }
    if (reveal) {
      this.assertCanReadPassport(user);
      await this.audit.record(
        user.organizationId,
        user.userId,
        'traveler.passport.read',
        'traveler',
        traveler.id,
        { bookingId },
      );
    }
    return this.toTraveler(traveler, reveal);
  }

  async addPayment(user: AuthUser, bookingId: string, dto: CreatePaymentDto) {
    const booking = await findOwned(
      this.bookings,
      user.organizationId,
      bookingId,
      'Booking',
    );
    if (dto.currency !== booking.currency) {
      throw new BadRequestException('Payment currency must match the booking');
    }
    const status = dto.status ?? PaymentStatus.Received;
    if (status === PaymentStatus.Received) {
      const outstanding = booking.depositDueMinor + booking.balanceDueMinor;
      if (dto.amountMinor > outstanding) {
        throw new BadRequestException(
          'Payment exceeds the outstanding balance',
        );
      }
      let remaining = dto.amountMinor;
      const depositPaid = Math.min(booking.depositDueMinor, remaining);
      booking.depositDueMinor -= depositPaid;
      remaining -= depositPaid;
      booking.balanceDueMinor = Math.max(
        0,
        booking.balanceDueMinor - remaining,
      );
      await this.bookings.save(booking);
    }
    const payment = await this.payments.save(
      this.payments.create({
        organizationId: user.organizationId,
        bookingId,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        method: dto.method,
        status,
        reference: dto.reference ?? '',
        paidAt: status === PaymentStatus.Received ? new Date() : null,
      }),
    );
    await this.webhooks.publish(user.organizationId, 'payment.recorded', {
      bookingId,
      paymentId: payment.id,
      amountMinor: payment.amountMinor,
      currency: payment.currency,
    });
    return payment;
  }

  async addInvoice(user: AuthUser, bookingId: string, dto: CreateInvoiceDto) {
    const booking = await findOwned(
      this.bookings,
      user.organizationId,
      bookingId,
      'Booking',
    );
    const count = await this.invoices.count({
      where: { organizationId: user.organizationId },
    });
    const year = new Date().getFullYear();
    return this.invoices.save(
      this.invoices.create({
        organizationId: user.organizationId,
        bookingId: booking.id,
        number: `INV-${year}-${String(count + 1).padStart(4, '0')}`,
        amountMinor: dto.amountMinor,
        currency: dto.currency,
        status: dto.status ?? InvoiceStatus.Issued,
        issuedOn: dto.issuedOn,
        dueOn: dto.dueOn,
      }),
    );
  }

  private toTraveler(traveler: Traveler, reveal: boolean) {
    const passport = this.encryption.decrypt(traveler.passportNumberEncrypted);
    return {
      id: traveler.id,
      organizationId: traveler.organizationId,
      bookingId: traveler.bookingId,
      fullName: traveler.fullName,
      nationality: traveler.nationality,
      dateOfBirth: traveler.dateOfBirth,
      gender: traveler.gender,
      passportExpiry: traveler.passportExpiry,
      passportNumber: reveal ? passport : maskSecret(passport),
      createdAt: traveler.createdAt,
      updatedAt: traveler.updatedAt,
    };
  }

  private assertCanReadPassport(user: AuthUser) {
    const allowed =
      user.role === RoleName.Owner ||
      user.role === RoleName.Admin ||
      user.role === RoleName.Operations;
    if (!allowed) {
      throw new ForbiddenException('You cannot read passport numbers');
    }
  }
}
