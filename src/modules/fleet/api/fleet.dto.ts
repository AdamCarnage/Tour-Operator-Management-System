import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { MaintenanceStatus } from '../../../common/enums';
import { IsCurrencyCode, IsIsoDate } from '../../../common/validators';

export class CreateMaintenanceDto {
  @IsUUID()
  vehicleId: string;

  @IsString()
  @MaxLength(160)
  title: string;

  @IsIsoDate()
  dueOn: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  costMinor: number;

  @IsCurrencyCode()
  currency: string;
}

export class UpdateMaintenanceDto {
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;
}

export class CreateFuelLogDto {
  @IsUUID()
  vehicleId: string;

  @IsOptional()
  @IsUUID()
  departureId?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  liters: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMinor: number;

  @IsCurrencyCode()
  currency: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  odometer?: number;

  @IsIsoDate()
  filledOn: string;
}
