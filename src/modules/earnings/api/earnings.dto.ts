import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { BookingSource, PaymentMethod } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';

export class EarningsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsEnum(BookingSource)
  source?: BookingSource;
}
