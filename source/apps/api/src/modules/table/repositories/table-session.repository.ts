import { Injectable } from '@nestjs/common';
import { TableSession, Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { BaseRepository } from '@database/repositories/base.repository';

@Injectable()
export class TableSessionRepository extends BaseRepository<
  TableSession,
  Prisma.TableSessionDelegate
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.tableSession);
  }

  /**
   * Create new session for table
   */
  async createSession(data: { tableId: string; tenantId: string }): Promise<TableSession> {
    return this.create({
      tableId: data.tableId,
      tenantId: data.tenantId,
      active: true,
    });
  }

  /**
   * Find active session by table ID
   */
  async findActiveByTableId(tableId: string): Promise<TableSession | null> {
    return this.findOne({
      tableId,
      active: true,
    });
  }

  /**
   * Find session by ID
   */
  async findSessionById(sessionId: string): Promise<TableSession | null> {
    return this.findById(sessionId);
  }

  /**
   * Clear session (mark as inactive)
   * Called by staff when table is freed
   */
  async clearSession(sessionId: string, staffId: string): Promise<TableSession> {
    return this.update(sessionId, {
      active: false,
      clearedAt: new Date(),
      clearedBy: staffId,
    });
  }

  /**
   * Get all active sessions for tenant (for monitoring)
   */
  async findActiveSessions(tenantId: string): Promise<TableSession[]> {
    return this.findAll({
      where: {
        tenantId,
        active: true,
      },
      orderBy: {
        scannedAt: 'desc',
      },
    });
  }

  /**
   * Count active sessions for table (should be 0 or 1)
   */
  async countActiveSessions(tableId: string): Promise<number> {
    return this.prisma.tableSession.count({
      where: {
        tableId,
        active: true,
      },
    });
  }

  /**
   * Get session history for table (for analytics)
   */
  async getTableSessionHistory(tableId: string, limit: number = 10): Promise<TableSession[]> {
    return this.prisma.tableSession.findMany({
      where: {
        tableId,
      },
      orderBy: {
        scannedAt: 'desc',
      },
      take: limit,
    });
  }
}
