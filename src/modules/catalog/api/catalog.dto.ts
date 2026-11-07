import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CostBasis, ProductKind } from '../../../common/enums';
import { IsCurrencyCode } from '../../../common/validators';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name: string;

  @IsEnum(ProductKind)
  kind: ProductKind;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateTemplateDto {
  @IsString()
  @MaxLength(160)
  name: string;
}

export class CreateDayDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dayNumber: number;

  @IsString()
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;
}

export class CreateServiceLineDto {
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsString()
  @MaxLength(160)
  description: string;

  @IsString()
  @MaxLength(80)
  category: string;

  @IsEnum(CostBasis)
  basis: CostBasis;

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

  @IsCurrencyCode()
  currency: string;
}
