import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ORGANIZATION_ROLE_NAMES, RoleName } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  organizationName!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MaxLength(80)
  lastName!: string;

  @IsIn(ORGANIZATION_ROLE_NAMES)
  role!: RoleName;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsIn(ORGANIZATION_ROLE_NAMES)
  role?: RoleName;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;
}

export class UserQueryDto extends PageQueryDto {}
