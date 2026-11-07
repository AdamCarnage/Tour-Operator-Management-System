import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { toUserResponse } from '../application/identity.mapper';
import { UsersService } from '../application/users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './identity.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Roles(RoleName.Owner)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser, @Query() query: UserQueryDto) {
    const page = await this.users.list(
      user.organizationId,
      query.page,
      query.limit,
    );
    return { ...page, data: page.data.map(toUserResponse) };
  }

  @Get(':id')
  async get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return toUserResponse(await this.users.get(user.organizationId, id));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return toUserResponse(await this.users.create(user, dto));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return toUserResponse(await this.users.update(user, id, dto));
  }
}

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.users.listRoles(user.organizationId);
  }
}

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organization')
export class OrganizationController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async current(@CurrentUser() user: AuthUser) {
    const organization = await this.users.getOrganization(user.organizationId);
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      createdAt: organization.createdAt,
    };
  }
}
