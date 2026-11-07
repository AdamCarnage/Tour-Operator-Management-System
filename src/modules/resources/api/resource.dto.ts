import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { AvailabilityStatus, StaffKind } from '../../../common/enums';
import { IsIsoDate } from '../../../common/validators';

export class CreateStaffDto {
  @IsEnum(StaffKind)
  kind: StaffKind;

  @IsString()
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MaxLength(80)
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class CreateCertificationDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsIsoDate()
  issuedOn?: string;

  @IsOptional()
  @IsIsoDate()
  expiresOn?: string;
}

export class CreateAvailabilityDto {
  @IsIsoDate()
  startsOn: string;

  @IsIsoDate()
  endsOn: string;

  @IsEnum(AvailabilityStatus)
  status: AvailabilityStatus;
}

export class CreateVehicleDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsString()
  @MaxLength(32)
  plate: string;

  @IsString()
  @MaxLength(80)
  kind: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats: number;
}

export class CreateGearDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ExpiringQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  withinDays?: number;
}

export class UpdateActiveDto {
  @IsBoolean()
  active: boolean;
}
