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
import { PageQueryDto } from '../../../common/page-query.dto';
import { PermitsService } from '../application/permits.service';
import {
  CreatePermitDto,
  ParkFeePreviewDto,
  UpdatePermitDto,
} from './permit.dto';

@ApiTags('Permits')
@ApiBearerAuth()
@Roles(RoleName.Operations)
@Controller('permits')
export class PermitsController {
  constructor(private readonly permits: PermitsService) {}

  @Post('preview')
  preview(@Body() dto: ParkFeePreviewDto) {
    return this.permits.preview(dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.permits.list(user.organizationId, query.page, query.limit);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePermitDto) {
    return this.permits.create(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.permits.get(user.organizationId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermitDto,
  ) {
    return this.permits.update(user, id, dto);
  }
}
