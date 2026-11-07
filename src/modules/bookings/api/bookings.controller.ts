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
import { BookingsService } from '../application/bookings.service';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateTravelerDto,
  RevealQueryDto,
  UpdateBookingDto,
} from './booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations, RoleName.Accountant)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.bookings.list(user.organizationId, query.page, query.limit);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookings.get(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(RoleName.Sales, RoleName.Operations)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookings.updateStatus(user, id, dto);
  }

  @Post(':id/travelers')
  @Roles(RoleName.Sales, RoleName.Operations)
  addTraveler(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTravelerDto,
  ) {
    return this.bookings.addTraveler(user, id, dto);
  }

  @Get(':id/travelers/:travelerId')
  getTraveler(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('travelerId', ParseUUIDPipe) travelerId: string,
    @Query() query: RevealQueryDto,
  ) {
    return this.bookings.getTraveler(
      user,
      id,
      travelerId,
      query.reveal === true,
    );
  }

  @Post(':id/payments')
  @Roles(RoleName.Sales, RoleName.Accountant)
  addPayment(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.bookings.addPayment(user, id, dto);
  }

  @Post(':id/invoices')
  @Roles(RoleName.Accountant, RoleName.Sales)
  addInvoice(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.bookings.addInvoice(user, id, dto);
  }
}
