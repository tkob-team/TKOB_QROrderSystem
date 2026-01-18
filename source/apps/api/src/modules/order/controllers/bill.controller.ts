import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { BillService } from '../services/bill.service';
import { BillResponseDto } from '../dtos/bill.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from 'src/modules/tenant/guards/tenant-ownership.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole, PaymentStatus } from '@prisma/client';
import type { AuthenticatedUser } from 'src/common/interfaces/auth.interface';

@ApiTags('Bills')
@Controller('admin/bills')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all bills with filters',
    description: 'Retrieve all bills for the tenant with optional filters',
  })
  @ApiResponse({ status: 200, type: [BillResponseDto] })
  @ApiQuery({ name: 'tableId', required: false, type: String })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getBills(
    @CurrentUser() user: AuthenticatedUser,
    @Query('tableId') tableId?: string,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<BillResponseDto[]> {
    const filters: any = {};
    if (tableId) filters.tableId = tableId;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.billService.getBills(user.tenantId, filters);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get bill by ID',
    description: 'Retrieve detailed bill information with all orders',
  })
  @ApiResponse({ status: 200, type: BillResponseDto })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async getBillById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') billId: string,
  ): Promise<BillResponseDto> {
    return this.billService.getBillById(billId);
  }
}
