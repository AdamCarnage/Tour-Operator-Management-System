import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsCurrencyCode, IsIsoDate } from '../../../common/validators';

export class CreateQuoteDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsString()
  @MaxLength(160)
  title: string;

  @IsCurrencyCode()
  currency: string;
}

export class CreateQuoteFromTemplateDto {
  @IsUUID()
  templateId: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  leadId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  paxCount: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  vehicleCount: number;

  @IsOptional()
  @IsCurrencyCode()
  currency?: string;

  @IsOptional()
  @IsString()
  fxRate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;
}

export class CreateQuoteLineDto {
  @IsString()
  @MaxLength(160)
  description: string;

  @IsString()
  @MaxLength(80)
  category: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitCostMinor: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitSellMinor: number;
}

export class AcceptQuoteDto {
  @IsUUID()
  versionId: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  depositPercent: number;

  @IsIsoDate()
  startDate: string;

  @IsIsoDate()
  endDate: string;
}
