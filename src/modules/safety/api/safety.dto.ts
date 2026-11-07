import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IncidentSeverity, IncidentStatus } from '../../../common/enums';
import { IsIsoDate } from '../../../common/validators';

export class ChecklistItemDto {
  @IsString()
  label: string;

  @IsBoolean()
  done: boolean;
}

export class CreateChecklistDto {
  @IsUUID()
  departureId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[];
}

export class CreateHealthLogDto {
  @IsUUID()
  departureId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsOptional()
  @IsUUID()
  travelerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  spo2?: number;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateIncidentDto {
  @IsUUID()
  departureId: string;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsString()
  description: string;
}

export class UpdateIncidentDto {
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}

export class CreateLoadDto {
  @IsUUID()
  departureId: string;

  @IsUUID()
  staffId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg: number;

  @IsIsoDate()
  recordedOn: string;
}

export class CreateLocationDto {
  @IsUUID()
  departureId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
