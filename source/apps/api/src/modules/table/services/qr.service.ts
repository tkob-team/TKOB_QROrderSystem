import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env.validation';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

export interface QrTokenPayload {
  tableId: string;
  tenantId: string;
  timestamp: number;
}

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);
  private readonly secret: string;
  private readonly customerAppUrl: string;
  private readonly maxAgeInDays: number;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    // Load config với fallback values
    this.secret = this.config.get('JWT_SECRET', { infer: true }) || 'fallback-secret-key-change-in-production';
    this.customerAppUrl = this.config.get('CUSTOMER_APP_URL', { infer: true }) || 'http://localhost:3001';
    this.maxAgeInDays = 365; // QR codes valid for 1 year by default
  }

  /**
   * Generate QR token with HMAC signature
   * Returns both plain token and hash for storage
   */
  generateToken(tableId: string, tenantId: string): { token: string; tokenHash: string } {
    const payload: QrTokenPayload = {
      tableId,
      tenantId,
      timestamp: Date.now(),
    };

    // Encode payload as base64url
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

    // Create HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payloadBase64)
      .digest('base64url');

    // Token format: payload.signature
    const token = `${payloadBase64}.${signature}`;

    // Hash for storage (SHA256)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    this.logger.log(`QR token generated for table ${tableId}`);

    return { token, tokenHash };
  }

  /**
   * Validate QR token
   * Throws exception if invalid
   * Returns decoded payload if valid
   */
  validateToken(token: string): QrTokenPayload {
    try {
      // Split token into payload and signature
      const parts = token.split('.');
      if (parts.length !== 2) {
        throw new BadRequestException('Invalid QR token format');
      }

      const [payloadBase64, signature] = parts;

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(payloadBase64)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new UnauthorizedException('Invalid QR signature');
      }

      // Decode payload
      const payloadString = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
      const payload: QrTokenPayload = JSON.parse(payloadString);

      // Check expiration (optional)
      const ageInDays = (Date.now() - payload.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays > this.maxAgeInDays) {
        throw new UnauthorizedException('QR code has expired. Please ask staff for assistance.');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('QR validation error:', error);
      throw new BadRequestException('Invalid QR token');
    }
  }

  /**
   * Build full QR URL for customer app
   */
  buildQrUrl(token: string): string {
    return `${this.customerAppUrl}/menu?token=${token}`;
  }

  /**
   * Generate QR code image (PNG)
   */
  async generateQrCodeImage(token: string, format: 'png' | 'svg' = 'png'): Promise<Buffer | string> {
    const qrUrl = this.buildQrUrl(token);

    if (format === 'svg') {
      return QRCode.toString(qrUrl, {
        type: 'svg',
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
      });
    }

    // PNG as buffer
    return QRCode.toBuffer(qrUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
      type: 'png',
    });
  }

  /**
   * Generate data URL for QR (for embedding in HTML/PDF)
   */
  async generateQrDataUrl(token: string): Promise<string> {
    const qrUrl = this.buildQrUrl(token);
    return QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
  }
}
