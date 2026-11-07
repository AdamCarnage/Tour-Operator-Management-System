import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ControlNumberStatus, PermitStatus } from '../../../common/enums';
import { IsCurrencyCode } from '../../../common/validators';

export class ParkFeePreviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  visitors: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  nights: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  vehicles: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  feePerVisitorNightMinor: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  feePerVehicleMinor: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  vatBps: number;
}

export class CreatePermitDto extends ParkFeePreviewDto {
  @IsUUID()
  departureId: string;

  @IsString()
  @MaxLength(160)
  parkName: string;

  @IsCurrencyCode()
  currency: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  controlNumber?: string;
}

export class UpdatePermitDto {
  @IsOptional()
  @IsEnum(PermitStatus)
  status?: PermitStatus;

  @IsOptional()
  @IsString()
  controlNumber?: string;

  @IsOptional()
  @IsEnum(ControlNumberStatus)
  controlStatus?: ControlNumberStatus;
}
