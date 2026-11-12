import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ConversationChannel } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';

export class ConversationQueryDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(ConversationChannel)
  channel?: ConversationChannel;
}

export class CreateParticipantDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalParticipantKey?: string;

  @IsString()
  @MaxLength(160)
  displayName: string;
}

export class CreateConversationDto {
  @IsEnum(ConversationChannel)
  channel: ConversationChannel;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalThreadId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  externalPlatform?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParticipantDto)
  participants: CreateParticipantDto[];
}

export class MessageAttachmentDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contentType?: string;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  body: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments?: MessageAttachmentDto[];
}

export class IngestExternalMessageDto {
  @IsString()
  @MaxLength(160)
  externalThreadId: string;

  @IsString()
  @MaxLength(80)
  externalPlatform: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MaxLength(160)
  senderKey: string;

  @IsString()
  @MaxLength(160)
  senderDisplayName: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments?: MessageAttachmentDto[];
}
