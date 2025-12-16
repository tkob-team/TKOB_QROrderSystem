import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, Table, TableStatus } from '@prisma/client';
import { TableRepository } from '../repositories/table.repository';
import { QrService } from './qr.service';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { RegenerateQrResponseDto } from '../dto/table-response.dto';

@Injectable()
export class TableService {
  private readonly logger = new Logger(TableService.name);

  constructor(
    private readonly repo: TableRepository,
    private readonly qrService: QrService,
  ) {}

  /**
   * Create table with auto QR generation
   */
  async create(tenantId: string, dto: CreateTableDto): Promise<Table> {
    try {
      // Create table first (without QR)
      const table = await this.repo.create({
        tenantId,
        tableNumber: dto.tableNumber,
        capacity: dto.capacity,
        location: dto.location,
        description: dto.description,
        displayOrder: dto.displayOrder ?? 0,
        status: TableStatus.AVAILABLE,
        active: true,
      });

      // Generate QR with actual tableId
      const { token, tokenHash } = this.qrService.generateToken(table.id, tenantId);

      // Update table with QR token
      const updatedTable = await this.repo.updateQrToken(table.id, token, tokenHash);

      this.logger.log(`Table created: ${dto.tableNumber} (ID: ${table.id})`);
      return updatedTable;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `Table number "${dto.tableNumber}" already exists in your restaurant`,
        );
      }
      throw error;
    }
  }

  /**
   * Find all tables by tenant with filters
   */
  async findAll(
    tenantId: string,
    filters?: {
      activeOnly?: boolean;
      status?: TableStatus;
      location?: string;
      sortBy?: 'tableNumber' | 'capacity' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<Table[]> {
    return this.repo.findByTenantId(tenantId, filters);
  }

  /**
   * Find table by ID with validation
   */
  async findById(tableId: string): Promise<Table> {
    const table = await this.repo.findById(tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  /**
   * Update table
   */
  async update(tableId: string, tenantId: string, dto: UpdateTableDto): Promise<Table> {
    // Verify exists and belongs to tenant
    const existing = await this.findById(tableId);
    if (existing.tenantId !== tenantId) {
      throw new ForbiddenException('Table does not belong to your restaurant');
    }

    try {
      return await this.repo.update(tableId, dto);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Table number "${dto.tableNumber}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Delete table (soft delete by setting active = false)
   */
  async delete(tableId: string, tenantId: string): Promise<void> {
    // Verify exists and belongs to tenant
    const table = await this.findById(tableId);
    if (table.tenantId !== tenantId) {
      throw new ForbiddenException('Table does not belong to your restaurant');
    }

    // Check for active orders
    const hasOrders = await this.repo.hasActiveOrders(tableId);
    if (hasOrders) {
      throw new ConflictException(
        'Cannot delete table with active orders. Please complete or cancel orders first.',
      );
    }

    // Soft delete
    await this.repo.update(tableId, { active: false });
    this.logger.log(`Table soft-deleted: ${table.tableNumber} (ID: ${tableId})`);
  }

  /**
   * Regenerate QR code for table
   */
  async regenerateQr(tableId: string, tenantId: string): Promise<RegenerateQrResponseDto> {
    // Verify table exists and belongs to tenant
    const table = await this.findById(tableId);
    if (table.tenantId !== tenantId) {
      throw new ForbiddenException('Table does not belong to your restaurant');
    }

    // Invalidate old QR (mark as invalidated)
    if (table.qrToken) {
      await this.repo.invalidateQrToken(tableId);
    }

    // Generate new QR token
    const { token, tokenHash } = this.qrService.generateToken(tableId, tenantId);

    // Update table with new token
    await this.repo.updateQrToken(tableId, token, tokenHash);

    this.logger.log(`QR regenerated for table: ${table.tableNumber}`);

    return {
      tableId,
      qrToken: token,
      qrCodeUrl: `/api/v1/admin/tables/${tableId}/qr/download`,
      generatedAt: new Date(),
    };
  }

  /**
   * Get QR code image for download
   */
  async getQrCodeImage(
    tableId: string,
    tenantId: string,
    format: 'png' | 'svg' = 'png',
  ): Promise<Buffer | string> {
    const table = await this.findById(tableId);

    // Verify belongs to tenant
    if (table.tenantId !== tenantId) {
      throw new ForbiddenException('Table does not belong to your restaurant');
    }

    if (!table.qrToken) {
      throw new BadRequestException('Table does not have a QR code yet');
    }

    return this.qrService.generateQrCodeImage(table.qrToken, format);
  }

  /**
   * Bulk update table status
   */
  async bulkUpdateStatus(
    tenantId: string,
    tableIds: string[],
    status: TableStatus,
  ): Promise<{ updated: number }> {
    // Verify all tables belong to tenant
    const tables = await this.repo.findAll({
      where: {
        id: { in: tableIds },
        tenantId,
      },
    });

    if (tables.length !== tableIds.length) {
      throw new BadRequestException('Some tables not found or do not belong to your restaurant');
    }

    const updated = await this.repo.bulkUpdateStatus(tableIds, status);
    this.logger.log(`Bulk updated ${updated} tables to status: ${status}`);

    return { updated };
  }

  /**
   * Get distinct locations for filters
   */
  async getDistinctLocations(tenantId: string): Promise<string[]> {
    return this.repo.getDistinctLocations(tenantId);
  }
}
