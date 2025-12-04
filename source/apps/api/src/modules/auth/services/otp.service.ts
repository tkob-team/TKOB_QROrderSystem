import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../../config/env.validation';

/**
 * OTP (One-Time Password) Service
 * Responsibilities:
 * - Generate numeric OTP codes
 * - Validate OTP format
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  /**
   * Generate a numeric OTP code
   * @returns OTP string (e.g., "123456")
   */
  generate(): string {
    let length = this.config.get('OTP_LENGTH', { infer: true });

    if (typeof length !== 'number' || !Number.isInteger(length) || length <= 0) {
      length = 6; // fallback mặc định
    }

    // Generate random number with exact length
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();

    this.logger.debug(`OTP generated with length: ${length}`);
    return otp;
  }

  /**
   * Validate OTP format (6 digits)
   * @param otp - OTP to validate
   * @returns true if valid format
   */
  validateFormat(otp: string): boolean {
    const length = this.config.get('OTP_LENGTH', { infer: true });
    const regex = new RegExp(`^\\d{${length}}$`);
    return regex.test(otp);
  }

  /**
   * Get OTP expiry time in seconds
   */
  getExpirySeconds(): number {
    const expiry = this.config.get('OTP_EXPIRY_SECONDS', { infer: true });
    if (typeof expiry !== 'number' || !Number.isInteger(expiry) || expiry <= 0) {
      return 300; // fallback mặc định
    }
    return expiry;
  }
}
