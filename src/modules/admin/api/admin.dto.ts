import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBase64,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PageQueryDto } from '../../../common/page-query.dto';

export class CreateWebhookDto {
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  url: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  events: string[];

  @IsString()
  @MaxLength(200)
  secret: string;
}

export class AuditQueryDto extends PageQueryDto {}

export class UploadDocumentDto {
  @IsString()
  @MaxLength(80)
  ownerType: string;

  @IsUUID()
  ownerId: string;

  @IsString()
  @MaxLength(255)
  filename: string;

  @IsString()
  @MaxLength(120)
  contentType: string;

  @IsBase64()
  contentBase64: string;
}

export class DocumentQueryDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
