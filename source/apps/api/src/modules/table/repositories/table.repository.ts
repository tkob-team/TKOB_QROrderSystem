import { Injectable } from '@nestjs/common';
import { Table, Prisma, TableStatus } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { BaseRepository } from '@database/repositories/base.repository';

@Injectable()
export class TableRepository extends BaseRepository<Table, Prisma.TableDelegate> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.table);
  }

  /**
   * Find all tables by tenantId with optional filters
   * Returns filtered tables along with metadata (totalAll, totalFiltered)
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
  ): Promise<{ tables: Table[]; totalAll: number; totalFiltered: number }> {
    // Base query for this tenant (no filters)
    const baseWhere: Prisma.TableWhereInput = {
      tenantId,
      ...(options?.activeOnly !== undefined && { active: options.activeOnly }),
    };

    // Filtered query (with status/location filters)
    const filteredWhere: Prisma.TableWhereInput = {
      ...baseWhere,
      ...(options?.status && { status: options.status }),
      // Case-insensitive location filter (also include NULL for 'indoor' since that's the default)
      ...(options?.location && { 
        OR: [
          { location: { equals: options.location, mode: 'insensitive' } },
          ...(options.location.toLowerCase() === 'indoor' ? [{ location: null }] : []),
        ]
      }),
    };

    const orderBy: Prisma.TableOrderByWithRelationInput = options?.sortBy
      ? { [options.sortBy]: options.sortOrder || 'asc' }
      : { displayOrder: 'asc' };

    // Execute queries in parallel for efficiency
    const [tables, totalAll, totalFiltered] = await Promise.all([
      this.findAll({ where: filteredWhere, orderBy }),
      (this.delegate as any).count({ where: baseWhere }),
      (this.delegate as any).count({ where: filteredWhere }),
    ]);

    return { tables, totalAll, totalFiltered };
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
