import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Public, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { PortalService } from '../application/portal.service';
import { CreateFeedbackDto, CreatePortalTokenDto } from './portal.dto';

@ApiTags('Portal')
@Controller('portal')
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @ApiBearerAuth()
  @Roles(RoleName.Sales)
  @Post('tokens')
  createToken(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePortalTokenDto,
  ) {
    return this.portal.createToken(user, dto);
  }

  @Public()
  @Get(':token')
  summary(@Param('token') token: string) {
    return this.portal.summary(token);
  }

  @Public()
  @Post(':token/feedback')
  feedback(@Param('token') token: string, @Body() dto: CreateFeedbackDto) {
    return this.portal.addFeedback(token, dto);
  }
}
