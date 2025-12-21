import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { EnvConfig } from '../../config/env.validation';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    // Initialize SendGrid with API key
    const apiKey = this.configService.get('SENDGRID_API_KEY', { infer: true });
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid initialized successfully');
    } else {
      this.logger.warn('SENDGRID_API_KEY not found - email service will not work');
    }
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    const from = this.configService.get('EMAIL_FROM', { infer: true });
    
    try {
      await sgMail.send({
        from,
        to: email,
        subject: 'Your OTP Code - QR Ordering Platform',
        html: this.getOTPTemplate(otp),
      });
      
      this.logger.log(`OTP sent successfully to ${email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : JSON.stringify(error);
      
      this.logger.error(
        `Failed to send OTP to ${email}. Error: ${errorMessage}`,
        errorStack,
      );
      
      throw new Error(`Failed to send OTP email: ${errorMessage}`);
    }
  }

  private getOTPTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .otp-code { 
              font-size: 32px; 
              font-weight: bold; 
              color: #4F46E5; 
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer { text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>QR Ordering Platform</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email</h2>
              <p>Thank you for registering! Please use the following OTP code to complete your registration:</p>
              <div class="otp-code">${otp}</div>
              <p><strong>This code will expire in 5 minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 TKOB QR Ordering. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}