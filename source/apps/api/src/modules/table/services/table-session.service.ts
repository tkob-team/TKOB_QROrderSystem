import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TableSession, TableStatus } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { TableSessionRepository } from '../repositories/table-session.repository';
import { TableRepository } from '../repositories/table.repository';
import { QrService } from './qr.service';

export interface SessionData {
  sessionId: string;
  tableId: string;
  tenantId: string;
  tableNumber: string;
  restaurantName: string;
  scannedAt: Date;
}

export interface ScanQrResult {
  sessionId: string;
  tableId: string;
  tenantId: string;
  tableNumber: string;
  redirectUrl: string;
}

@Injectable()
export class TableSessionService {
  private readonly logger = new Logger(TableSessionService.name);

  constructor(
    private readonly sessionRepo: TableSessionRepository,
    private readonly tableRepo: TableRepository,
    private readonly qrService: QrService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Scan QR Code → Create Session
   * Flow: Customer scans QR → Validate token → Check table availability → Create session
   */
  async scanQr(qrToken: string): Promise<ScanQrResult> {
    // 1. Validate QR token
    const validation = await this.qrService.validateToken(qrToken);
    const { tableId, tenantId } = validation;

    // 2. Get table info
    const table = await this.tableRepo.findById(tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // 3. Check table availability
    const existingSession = await this.sessionRepo.findActiveByTableId(tableId);

    if (existingSession) {
      // Table already has active session
      // Option A: Reject (strict mode)
      // throw new ConflictException('This table is currently in use by another customer');

      // Option B: Allow multiple customers (flexible mode) - RECOMMENDED
      // Return existing session
      this.logger.log(
        `Table ${table.tableNumber} already has active session, reusing existing session`,
      );
      return {
        sessionId: existingSession.id,
        tableId: table.id,
        tenantId: table.tenantId,
        tableNumber: table.tableNumber,
        redirectUrl: '/api/v1/menu',
      };
    }

    // 4. Create new session
    const session = await this.sessionRepo.createSession({
      tableId,
      tenantId,
    });

    // 5. Update table status to OCCUPIED
    await this.tableRepo.update(tableId, {
      status: TableStatus.OCCUPIED,
      currentSessionId: session.id,
    });

    this.logger.log(`Session created: ${session.id} for table ${table.tableNumber} (${tableId})`);

    return {
      sessionId: session.id,
      tableId: table.id,
      tenantId: table.tenantId,
      tableNumber: table.tableNumber,
      redirectUrl: '/api/v1/menu',
    };
  }

  /**
   * Validate session from cookie
   * Used by SessionGuard to authenticate customer requests
   */
  async validateSession(sessionId: string): Promise<SessionData> {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (!session.active) {
      throw new UnauthorizedException('Session has been cleared by staff');
    }

    // Get table info with tenant
    const table = await this.tableRepo.findById(session.tableId);
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Get tenant info for restaurant name
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { name: true },
    });

    return {
      sessionId: session.id,
      tableId: session.tableId,
      tenantId: session.tenantId,
      tableNumber: table.tableNumber,
      restaurantName: tenant?.name || 'Restaurant',
      scannedAt: session.scannedAt,
    };
  }

  /**
   * Clear table (called by staff)
   * Marks session as inactive and frees the table
   */
  async clearTable(tableId: string, staffId: string): Promise<void> {
    // 1. Find active session
    const session = await this.sessionRepo.findActiveByTableId(tableId);

    if (!session) {
      throw new NotFoundException('No active session for this table');
    }

    // 2. Clear session
    await this.sessionRepo.clearSession(session.id, staffId);

    // 3. Update table status to AVAILABLE
    await this.tableRepo.update(tableId, {
      status: TableStatus.AVAILABLE,
      currentSessionId: null,
    });

    this.logger.log(
      `Table ${tableId} cleared by staff ${staffId}, session ${session.id} deactivated`,
    );
  }

  /**
   * Check if table is available (no active session)
   */
  async isTableAvailable(tableId: string): Promise<boolean> {
    const activeSession = await this.sessionRepo.findActiveByTableId(tableId);
    return !activeSession;
  }

  /**
   * Get active sessions for tenant (for staff monitoring)
   */
  async getActiveSessions(tenantId: string): Promise<TableSession[]> {
    return this.sessionRepo.findActiveSessions(tenantId);
  }

  /**
   * Get session info by ID (for debugging/admin)
   */
  async getSessionInfo(sessionId: string): Promise<SessionData> {
    return this.validateSession(sessionId);
  }
}
