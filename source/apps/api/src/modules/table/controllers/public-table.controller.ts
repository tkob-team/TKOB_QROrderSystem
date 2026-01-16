import { Controller, Get, Param, Res, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiCookieAuth } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { Session } from '@common/decorators/session.decorator';
import { TableSessionService } from '../services/table-session.service';
import { MenuItemsService } from '@modules/menu/services/menu-item.service';
import { SessionGuard } from '../guards/session.guard';
import { SkipTransform } from '@common/interceptors/transform.interceptor';

@ApiTags('Tables - Public')
@Controller()
export class PublicTableController {
  constructor(
    private readonly sessionService: TableSessionService,
    private readonly menuService: MenuItemsService,
  ) {}

  /**
   * Scan QR Code Endpoint
   * URL format: /t/{qrToken}
   * Flow: Validate QR → Create Session → Set Cookie → Redirect to /menu
   */
  @Get('t/:qrToken')
  @Public()
  @SkipTransform()
  @ApiOperation({
    summary: 'Scan QR code (Haidilao style)',
    description: 'Customer scans QR code, creates session, sets cookie, and redirects to menu',
  })
  @ApiParam({ name: 'qrToken', description: 'QR token from scanned code' })
  @ApiResponse({ status: 302, description: 'Redirect to /menu with session cookie' })
  @ApiResponse({ status: 400, description: 'Invalid QR token' })
  @ApiResponse({ status: 409, description: 'Table is already in use' })
  async scanQr(@Param('qrToken') qrToken: string, @Res() response: any) {
    if (!qrToken) {
      throw new BadRequestException('QR token is required');
    }

    // 1. Scan QR → Create session
    const result = await this.sessionService.scanQr(qrToken);

    const isDevelopment = process.env.NODE_ENV !== 'production';

    // 2. Set HttpOnly cookie (secure, JS cannot access)
    response.cookie('table_session_id', result.sessionId, {
      httpOnly: true,
      secure: !isDevelopment, // false trong dev
      sameSite: isDevelopment ? 'lax' : 'none', // 'lax' cho dev
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: isDevelopment ? 'localhost' : undefined, // ✅ Thêm domain
    });

    // 3. Redirect to frontend  (clean URL, no token visible)
    const frontendUrl = process.env.CUSTOMER_APP_URL || 'http://localhost:3001';
    return response.redirect(302, `${frontendUrl}`);
  }

  /**
   * Get current session info (table number, etc.)
   */
  @Get('session')
  @Public()
  @UseGuards(SessionGuard)
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Get current session information',
    description: 'Returns table info for current session',
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Session invalid or expired' })
  async getSessionInfo(@Session() session: any) {
    return this.sessionService.getSessionInfo(session.sessionId);
  }

  /**
   * Get Menu Endpoint (Session-based)
   * Customer accesses menu via session cookie (no QR token in URL)
   */
  @Get('menu')
  @Public()
  @UseGuards(SessionGuard) // Validate session cookie
  @ApiCookieAuth('table_session_id')
  @ApiOperation({
    summary: 'Get menu for current session',
    description: 'Returns menu based on session cookie (no QR token needed)',
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Session invalid or expired' })
  async getMenu(@Session() session: any) {
    // Get published menu for the tenant from session
    return this.menuService.getPublicMenu(session.tenantId);
  }
}
