import { IsOptional, IsUUID } from 'class-validator';
import { IsIsoDate } from '../../../common/validators';

export class AdventurerDashboardQueryDto {
  @IsUUID()
  customerId: string;
}

export class OperatorDashboardQueryDto {
  /** Optional ISO date (YYYY-MM-DD). Defaults to today (UTC). */
  @IsOptional()
  @IsIsoDate()
  asOf?: string;
}
