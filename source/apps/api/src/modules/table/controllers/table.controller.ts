import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { TableService } from '../services/table.service';
import { TableSessionService } from '../services/table-session.service';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import {
  TableResponseDto,
  RegenerateQrResponseDto,
  BulkRegenerateQrResponseDto,
} from '../dto/table-response.dto';
import { TableListResponseDto } from '../dto/table-list-response.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from 'src/modules/tenant/guards/tenant-ownership.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole, TableStatus, Table } from '@prisma/client';
import type { AuthenticatedUser } from 'src/common/interfaces/auth.interface';

@ApiTags('Tables')
@Controller('admin/tables')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
export class TableController {
  constructor(
    private readonly service: TableService,
    private readonly sessionService: TableSessionService,
  ) {}

  // ==================== CRUD ====================

  @Post()
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new table with auto QR generation' })
  @ApiResponse({ status: 201, type: TableResponseDto })
  @ApiResponse({ status: 409, description: 'Table number already exists' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTableDto,
  ): Promise<TableResponseDto> {
    const table = await this.service.create(user.tenantId, dto);
    return this.transformToResponse(table);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tables with filters' })
  @ApiResponse({ status: 200, type: TableListResponseDto })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'status', required: false, enum: TableStatus })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['tableNumber', 'capacity', 'createdAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('activeOnly') activeOnly?: boolean,
    @Query('status') status?: TableStatus,
    @Query('location') location?: string,
    @Query('sortBy') sortBy?: 'tableNumber' | 'capacity' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<TableListResponseDto> {
    const { tables, meta } = await this.service.findAll(user.tenantId, {
      activeOnly,
      status,
      location,
      sortBy,
      sortOrder,
    });
    return {
      data: tables.map((t) => this.transformToResponse(t)),
      meta,
    };
  }

  @Get('locations')
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get distinct locations for filter dropdown' })
  @ApiResponse({ status: 200, type: [String] })
  async getLocations(@CurrentUser() user: AuthenticatedUser): Promise<string[]> {
    return this.service.getDistinctLocations(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiResponse({ status: 200, type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async findOne(@Param('id') id: string): Promise<TableResponseDto> {
    const table = await this.service.findById(id);
    return this.transformToResponse(table);
  }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update table' })
  @ApiResponse({ status: 200, type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 409, description: 'Table number already exists' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<TableResponseDto> {
    const table = await this.service.update(id, user.tenantId, dto);
    return this.transformToResponse(table);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update table status only' })
  @ApiResponse({ status: 200, type: TableResponseDto })
  @ApiBody({
    schema: {
      properties: {
        status: { enum: Object.values(TableStatus) },
      },
    },
  })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { status: TableStatus },
  ): Promise<TableResponseDto> {
    const table = await this.service.update(id, user.tenantId, { status: body.status });
    return this.transformToResponse(table);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete table (soft delete)' })
  @ApiResponse({ status: 204, description: 'Table deleted successfully' })
  @ApiResponse({ status: 409, description: 'Cannot delete table with active orders' })
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    await this.service.delete(id, user.tenantId);
  }

  // ==================== QR CODE ====================

  @Post(':id/qr/generate')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate QR code for table' })
  @ApiResponse({ status: 200, type: RegenerateQrResponseDto })
  async regenerateQr(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<RegenerateQrResponseDto> {
    return this.service.regenerateQr(id, user.tenantId);
  }

  @Post('qr/regenerate-all')
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bulk regenerate QR codes for all tables',
    description:
      'Regenerates QR codes for all active tables. Old QR codes will be invalidated. Requires OWNER role.',
  })
  @ApiResponse({ status: 200, type: BulkRegenerateQrResponseDto })
  @ApiResponse({ status: 400, description: 'No active tables found' })
  async bulkRegenerateAllQr(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BulkRegenerateQrResponseDto> {
    return this.service.bulkRegenerateAllQr(user.tenantId);
  }

  @Get(':id/qr/download')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download QR code (PNG/SVG/PDF)' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['png', 'svg', 'pdf'],
    description: 'Default: png',
  })
  @ApiResponse({ status: 200, description: 'QR code file' })
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async downloadQr(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('format') format: 'png' | 'svg' | 'pdf' = 'png',
    @Res() res: Response,
  ): Promise<void> {
    if (format === 'pdf') {
      const pdf = await this.service.getQrCodePdf(id, user.tenantId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="table-${id}-qr.pdf"`);
      res.send(pdf);
      return;
    }

    const image = await this.service.getQrCodeImage(id, user.tenantId, format);

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="table-${id}-qr.svg"`);
      res.send(image);
    } else {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="table-${id}-qr.png"`);
      res.send(image);
    }
  }

  @Get('qr/download-all')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download all QR codes (ZIP or multi-page PDF)' })
  @ApiQuery({ name: 'format', required: false, enum: ['zip', 'pdf'], description: 'Default: zip' })
  @ApiResponse({ status: 200, description: 'ZIP file or PDF with all QR codes' })
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async downloadAllQr(
    @CurrentUser() user: AuthenticatedUser,
    @Query('format') format: 'zip' | 'pdf' = 'zip',
    @Res() res: Response,
  ): Promise<void> {
    if (format === 'pdf') {
      const pdf = await this.service.getAllQrCodesPdf(user.tenantId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="all-tables-qr.pdf"`);
      res.send(pdf);
    } else {
      const zip = await this.service.getAllQrCodesZip(user.tenantId);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="all-tables-qr.zip"`);
      res.send(zip);
    }
  }

  // ==================== BULK OPERATIONS ====================

  @Patch('bulk/status')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update table status' })
  @ApiBody({
    schema: {
      properties: {
        tableIds: { type: 'array', items: { type: 'string' } },
        status: { enum: Object.values(TableStatus) },
      },
    },
  })
  @ApiResponse({ status: 200, schema: { properties: { updated: { type: 'number' } } } })
  async bulkUpdateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { tableIds: string[]; status: TableStatus },
  ): Promise<{ updated: number }> {
    return this.service.bulkUpdateStatus(user.tenantId, body.tableIds, body.status);
  }

  // ==================== SESSION MANAGEMENT (HAIDILAO STYLE) ====================

  @Post(':id/clear')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear table (Haidilao style)',
    description: 'Staff marks table as cleared. Deactivates active session and frees the table.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        message: { type: 'string', example: 'Table cleared successfully' },
        tableId: { type: 'string' },
        clearedAt: { type: 'string', format: 'date-time' },
        clearedBy: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No active session for this table' })
  async clearTable(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') tableId: string,
  ): Promise<{
    message: string;
    tableId: string;
    clearedAt: Date;
    clearedBy: string;
  }> {
    await this.sessionService.clearTable(tableId, user.userId);
    return {
      message: 'Table cleared successfully',
      tableId,
      clearedAt: new Date(),
      clearedBy: user.userId,
    };
  }

  @Get('sessions/active')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all active sessions (for monitoring)',
    description: 'Returns all tables currently in use with session info',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'array',
      items: {
        properties: {
          sessionId: { type: 'string' },
          tableId: { type: 'string' },
          tableNumber: { type: 'string' },
          scannedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getActiveSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.sessionService.getActiveSessions(user.tenantId);
  }

  // ==================== HELPER ====================

  private transformToResponse(table: Table): TableResponseDto {
    return {
      id: table.id,
      tenantId: table.tenantId,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location ?? undefined,
      description: table.description ?? undefined,
      status: table.status,
      active: table.active,
      displayOrder: table.displayOrder,
      qrCodeUrl: table.qrToken ? `/api/v1/admin/tables/${table.id}/qr/download` : undefined,
      qrToken: table.qrToken ?? undefined,
      qrGeneratedAt: table.qrTokenCreatedAt ?? undefined,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }
}
