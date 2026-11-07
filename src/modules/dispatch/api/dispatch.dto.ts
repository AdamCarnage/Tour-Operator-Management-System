import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AssignmentRole, DepartureStatus } from '../../../common/enums';
import { IsIsoDate } from '../../../common/validators';

export class CreateDepartureDto {
  @IsUUID()
  bookingId: string;

  @IsIsoDate()
  startsOn: string;

  @IsIsoDate()
  endsOn: string;
}

export class UpdateDepartureDto {
  @IsEnum(DepartureStatus)
  status: DepartureStatus;
}

export class CreateAssignmentDto {
  @IsEnum(AssignmentRole)
  role: AssignmentRole;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsIsoDate()
  startsOn: string;

  @IsIsoDate()
  endsOn: string;
}

export class AssignmentIdDto {
  @Type(() => String)
  @IsUUID()
  id: string;
}
