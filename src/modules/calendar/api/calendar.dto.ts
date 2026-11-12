import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CalendarItemKind } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';

export class CalendarQueryDto extends PageQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsEnum(CalendarItemKind)
  kind?: CalendarItemKind;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;
}

export class CreateCalendarItemDto {
  @IsEnum(CalendarItemKind)
  kind: CalendarItemKind;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
  startsAt: string;

  @IsISO8601()
  endsAt: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsUUID()
  departureId?: string;
}

export class UpdateCalendarItemDto {
  @IsOptional()
  @IsEnum(CalendarItemKind)
  kind?: CalendarItemKind;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsUUID()
  assignedToUserId?: string | null;

  @IsOptional()
  @IsUUID()
  bookingId?: string | null;

  @IsOptional()
  @IsUUID()
  departureId?: string | null;
}
