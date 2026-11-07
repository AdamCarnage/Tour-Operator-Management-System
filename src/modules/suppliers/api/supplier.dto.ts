import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CostBasis,
  PayableStatus,
  SupplierRequestStatus,
} from '../../../common/enums';
import { IsCurrencyCode, IsIsoDate } from '../../../common/validators';

export class CreateSupplierDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePropertyDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  kind?: string;
}

export class CreateRoomTypeDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;
}

export class CreateRateDto {
  @IsOptional()
  @IsUUID()
  roomTypeId?: string;

  @IsString()
  @MaxLength(80)
  seasonName: string;

  @IsIsoDate()
  startsOn: string;

  @IsIsoDate()
  endsOn: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMinor: number;

  @IsCurrencyCode()
  currency: string;

  @IsEnum(CostBasis)
  basis: CostBasis;
}

export class CreateSupplierRequestDto {
  @IsUUID()
  supplierId: string;

  @IsUUID()
  bookingId: string;

  @IsOptional()
  @IsString()
  details?: string;
}

export class UpdateSupplierRequestDto {
  @IsEnum(SupplierRequestStatus)
  status: SupplierRequestStatus;
}

export class CreatePayableDto {
  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMinor: number;

  @IsCurrencyCode()
  currency: string;

  @IsIsoDate()
  dueOn: string;
}

export class UpdatePayableDto {
  @IsEnum(PayableStatus)
  status: PayableStatus;
}
