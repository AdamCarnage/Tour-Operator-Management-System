import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { EmailCategory, EmailFolder } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';

export class EmailQueryDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(EmailFolder)
  folder?: EmailFolder;

  @IsOptional()
  @IsEnum(EmailCategory)
  category?: EmailCategory;

  @IsOptional()
  @IsUUID()
  mailboxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}

export class CreateMailboxDto {
  @IsString()
  @MaxLength(320)
  address: string;

  @IsString()
  @MaxLength(40)
  provider: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}

export class IngestEmailDto {
  @IsOptional()
  @IsUUID()
  mailboxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  mailboxAddress?: string;

  @IsString()
  @MaxLength(40)
  provider: string;

  @IsString()
  @MaxLength(320)
  fromAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  fromName?: string;

  @IsArray()
  @IsString({ each: true })
  toAddresses: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ccAddresses?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subject?: string;

  @IsOptional()
  @IsString()
  bodyText?: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  externalMessageId?: string;

  @IsOptional()
  @IsEnum(EmailFolder)
  folder?: EmailFolder;

  @IsOptional()
  @IsEnum(EmailCategory)
  category?: EmailCategory;

  @IsOptional()
  @Type(() => Date)
  receivedAt?: Date;
}

export class UpdateEmailDto {
  @IsOptional()
  @IsEnum(EmailFolder)
  folder?: EmailFolder;

  @IsOptional()
  @IsEnum(EmailCategory)
  category?: EmailCategory;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;
}
