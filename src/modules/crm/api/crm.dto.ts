import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { LeadStatus } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  kind?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLeadDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

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
  source?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}

export class LeadQueryDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}

export class CreateCommunicationDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  @MaxLength(32)
  channel: string;

  @IsString()
  @MaxLength(16)
  direction: string;

  @IsString()
  body: string;
}
