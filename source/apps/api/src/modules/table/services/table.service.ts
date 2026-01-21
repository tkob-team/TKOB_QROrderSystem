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
import { PdfService } from './pdf.service';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { RegenerateQrResponseDto, BulkRegenerateQrResponseDto } from '../dto/table-response.dto';
import archiver from 'archiver';

@Injectable()
export class TableService {
  private readonly logger = new Logger(TableService.name);

  constructor(
    private readonly repo: TableRepository,
    private readonly qrService: QrService,
    private readonly pdfService: PdfService,
  ) {}

  /**
   * Create table with auto QR generation
   */
  async create(tenantId: string, dto: CreateTableDto): Promise<Table> {
    try {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Creating table: ${dto.tableNumber} for tenant: ${tenantId}`);
      }

      // Create table first (without QR)
      const table = await this.repo.create({
        tenantId,
        tableNumber: dto.tableNumber,
        capacity: dto.capacity,
        location: dto.location?.toLowerCase() || null, // Normalize location to lowercase
        description: dto.description || null,
        displayOrder: dto.displayOrder ?? 0,
        status: TableStatus.AVAILABLE,
        active: true,
      });

      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Table created with ID: ${table.id}`);
      }

      // Generate QR with actual tableId
      const { token, tokenHash } = this.qrService.generateToken(table.id, tenantId);

      // Update table with QR token
      const updatedTable = await this.repo.updateQrToken(table.id, token, tokenHash);

      this.logger.log(`Table created: ${dto.tableNumber} (ID: ${table.id})`);
      return updatedTable;
    } catch (error) {
      this.logger.error(`Failed to create table: ${error.message}`, error.stack);

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
   * Returns filtered tables with metadata
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
  ): Promise<{ tables: Table[]; meta: { totalAll: number; totalFiltered: number } }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[findAll] Query tables for tenantId: ${tenantId}, filters:`, filters);
    }
    const { tables, totalAll, totalFiltered } = await this.repo.findByTenantId(tenantId, filters);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[findAll] Found ${tables.length} tables (totalFiltered: ${totalFiltered}, totalAll: ${totalAll})`);
    }
    return {
      tables,
      meta: { totalAll, totalFiltered },
    };
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
      // Normalize location to lowercase if provided
      const updateData = {
        ...dto,
        ...(dto.location && { location: dto.location.toLowerCase() }),
      };
      return await this.repo.update(tableId, updateData);
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
   * Get QR code as PDF
   */
  async getQrCodePdf(tableId: string, tenantId: string): Promise<Buffer> {
    const table = await this.findById(tableId);

    // Verify belongs to tenant
    if (table.tenantId !== tenantId) {
      throw new ForbiddenException('Table does not belong to your restaurant');
    }

    if (!table.qrToken) {
      throw new BadRequestException('Table does not have a QR code yet');
    }

    // Generate QR code as data URL
    const qrCodeImage = await this.qrService.generateQrCodeImage(table.qrToken, 'png');
    const qrDataUrl = `data:image/png;base64,${(qrCodeImage as Buffer).toString('base64')}`;

    return this.pdfService.generateSingleQrPdf({
      tableNumber: table.tableNumber,
      qrCodeDataUrl: qrDataUrl,
      location: table.location ?? undefined,
      instructions: 'Scan to view menu and place order',
    });
  }

  /**
   * Get all QR codes as ZIP file
   */
  async getAllQrCodesZip(tenantId: string): Promise<Buffer> {
    const { tables } = await this.repo.findByTenantId(tenantId, { activeOnly: true });

    if (tables.length === 0) {
      throw new BadRequestException('No active tables found');
    }

    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      // Add each table's QR code as PNG
      const promises = tables.map(async (table) => {
        if (!table.qrToken) return;

        const qrImage = await this.qrService.generateQrCodeImage(table.qrToken, 'png');
        archive.append(qrImage as Buffer, { name: `table-${table.tableNumber}.png` });
      });

      Promise.all(promises)
        .then(() => {
          archive.finalize();
        })
        .catch(reject);
    });
  }

  /**
   * Get all QR codes as multi-page PDF
   */
  async getAllQrCodesPdf(tenantId: string): Promise<Buffer> {
    const { tables } = await this.repo.findByTenantId(tenantId, { activeOnly: true });

    if (tables.length === 0) {
      throw new BadRequestException('No active tables found');
    }

    // Generate QR data URLs for all tables
    const tableOptions = await Promise.all(
      tables
        .filter((t) => t.qrToken)
        .map(async (table) => {
          const qrCodeImage = await this.qrService.generateQrCodeImage(table.qrToken!, 'png');
          const qrDataUrl = `data:image/png;base64,${(qrCodeImage as Buffer).toString('base64')}`;

          return {
            tableNumber: table.tableNumber,
            qrCodeDataUrl: qrDataUrl,
            location: table.location ?? undefined,
          };
        }),
    );

    return this.pdfService.generateMultiPageQrPdf(tableOptions);
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

  /**
   * Bulk regenerate QR codes for all active tables
   * Also resets all table statuses to AVAILABLE and clears sessions
   */
  async bulkRegenerateAllQr(tenantId: string): Promise<BulkRegenerateQrResponseDto> {
    // Get all active tables
    const { tables } = await this.repo.findByTenantId(tenantId, { activeOnly: true });

    if (tables.length === 0) {
      throw new BadRequestException('No active tables found');
    }

    const affectedTables: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Regenerate QR for each table and reset status
    for (const table of tables) {
      try {
        // Invalidate old QR (mark as invalidated)
        if (table.qrToken) {
          await this.repo.invalidateQrToken(table.id);
        }

        // Generate new QR token
        const { token, tokenHash } = this.qrService.generateToken(table.id, tenantId);

        // Update table with new token and reset to AVAILABLE status
        await this.repo.updateQrToken(table.id, token, tokenHash);
        
        // Reset table status to AVAILABLE and clear session
        await this.repo.update(table.id, {
          status: TableStatus.AVAILABLE,
          currentSessionId: null,
        });

        affectedTables.push(table.tableNumber);
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to regenerate QR for table ${table.tableNumber}:`, error);
        failureCount++;
      }
    }

    this.logger.log(
      `Bulk QR regeneration completed: ${successCount} success, ${failureCount} failed`,
    );

    return {
      totalProcessed: tables.length,
      successCount,
      failureCount,
      affectedTables,
      regeneratedAt: new Date(),
    };
  }
}
