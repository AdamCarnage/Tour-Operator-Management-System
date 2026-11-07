import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { InspectionResult } from '../../../common/enums';
import { IsCurrencyCode } from '../../../common/validators';

export class CreateCheckInDto {
  @IsUUID()
  departureId: string;

  @IsUUID()
  travelerId: string;

  @IsString()
  @MaxLength(80)
  idempotencyKey: string;
}

export class CreateFieldExpenseDto {
  @IsUUID()
  departureId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsString()
  @MaxLength(80)
  category: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMinor: number;

  @IsCurrencyCode()
  currency: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  @MaxLength(80)
  idempotencyKey: string;
}

export class CreateFieldInspectionDto {
  @IsUUID()
  vehicleId: string;

  @IsOptional()
  @IsUUID()
  departureId?: string;

  @IsEnum(InspectionResult)
  result: InspectionResult;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @MaxLength(80)
  idempotencyKey: string;
}
