import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  BookingStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../common/enums';
import { IsCurrencyCode, IsIsoDate } from '../../../common/validators';

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

export class CreateTravelerDto {
  @IsString()
  @MaxLength(160)
  fullName: string;

  @IsString()
  @MaxLength(80)
  nationality: string;

  @IsOptional()
  @IsIsoDate()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  gender?: string;

  @IsString()
  @MaxLength(40)
  passportNumber: string;

  @IsOptional()
  @IsIsoDate()
  passportExpiry?: string;
}

export class CreatePaymentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountMinor: number;

  @IsCurrencyCode()
  currency: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;
}

export class CreateInvoiceDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMinor: number;

  @IsCurrencyCode()
  currency: string;

  @IsIsoDate()
  issuedOn: string;

  @IsIsoDate()
  dueOn: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}

export class RevealQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  reveal?: boolean;
}
