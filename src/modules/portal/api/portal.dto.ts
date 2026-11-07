import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePortalTokenDto {
  @IsOptional()
  @IsUUID()
  quoteId?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;
}

export class CreateFeedbackDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
