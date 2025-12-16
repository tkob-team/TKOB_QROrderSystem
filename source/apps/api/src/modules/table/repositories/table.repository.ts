import { Injectable } from '@nestjs/common';
import { Table, Prisma, TableStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';

@Injectable()
export class TableRepository extends BaseRepository<Table, Prisma.TableDelegate> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.table);
  }

  /**
   * Find all tables by tenantId with optional filters
   */
  async findByTenantId(
    tenantId: string,
    options?: {
      activeOnly?: boolean;
      status?: TableStatus;
      location?: string;
      sortBy?: 'tableNumber' | 'capacity' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<Table[]> {
    const where: Prisma.TableWhereInput = {
      tenantId,
      ...(options?.activeOnly !== undefined && { active: options.activeOnly }),
      ...(options?.status && { status: options.status }),
      ...(options?.location && { location: options.location }),
    };

    const orderBy: Prisma.TableOrderByWithRelationInput = options?.sortBy
      ? { [options.sortBy]: options.sortOrder || 'asc' }
      : { displayOrder: 'asc' };

    return this.findAll({ where, orderBy });
  }

  /**
   * Find table by QR token (for customer QR scan validation)
   */
  async findByQrToken(qrToken: string): Promise<Table | null> {
    return this.findOne(
      { qrToken },
      { tenant: true }, // Include tenant info for validation
    );
  }

  /**
   * Update QR token (for regeneration)
   */
  async updateQrToken(
    tableId: string,
    qrToken: string,
    qrTokenHash: string,
  ): Promise<Table> {
    return (this.delegate as any).update({
      where: { id: tableId },
      data: {
        qrToken,
        qrTokenHash,
        qrTokenCreatedAt: new Date(),
        qrInvalidatedAt: null, // Reset invalidation when regenerating
      },
    });
  }

  /**
   * Invalidate QR token (mark as invalid without deleting)
   */
  async invalidateQrToken(tableId: string): Promise<Table> {
    return (this.delegate as any).update({
      where: { id: tableId },
      data: {
        qrInvalidatedAt: new Date(),
      },
    });
  }

  /**
   * Check if table has active orders
   * TODO: Implement when Order model exists (Epic 4)
   */
  async hasActiveOrders(tableId: string): Promise<boolean> {
    // Placeholder for future Order integration
    // const count = await this.prisma.order.count({
    //   where: {
    //     tableId,
    //     status: { in: ['PENDING', 'PREPARING', 'READY'] },
    //   },
    // });
    // return count > 0;

    return false; // For now, always allow deletion
  }

  /**
   * Bulk update table status
   */
  async bulkUpdateStatus(tableIds: string[], status: TableStatus): Promise<number> {
    const result = await (this.delegate as any).updateMany({
      where: { id: { in: tableIds } },
      data: { status },
    });
    return result.count;
  }

  /**
   * Get distinct locations for a tenant (for filter options)
   */
  async getDistinctLocations(tenantId: string): Promise<string[]> {
    const result = await this.prisma.table.findMany({
      where: { tenantId, location: { not: null } },
      select: { location: true },
      distinct: ['location'],
    });
    return result.map((r) => r.location).filter(Boolean) as string[];
  }
}
