import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { EnvConfig } from '../../config/env.validation';

type EmailProvider = 'smtp' | 'sendgrid';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: EmailProvider;
  private smtpTransporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    this.provider = this.configService.get('EMAIL_PROVIDER', { infer: true });
  }

  async onModuleInit() {
    if (this.provider === 'sendgrid') {
      this.initSendGrid();
    } else {
      this.initSmtp();
    }
  }

  /**
   * Initialize SendGrid
   */
  private initSendGrid(): void {
    const apiKey = this.configService.get('SENDGRID_API_KEY', { infer: true });

    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is required when EMAIL_PROVIDER=sendgrid');
    }

    sgMail.setApiKey(apiKey);
    this.logger.log('✅ SendGrid email service initialized');
  }

  /**
   * Initialize SMTP (Gmail, etc.)
   */
  private initSmtp(): void {
    const host = this.configService.get('EMAIL_HOST', { infer: true });
    const port = this.configService.get('EMAIL_PORT', { infer: true });
    const secure = this.configService.get('EMAIL_SECURE', { infer: true });
    const user = this.configService.get('EMAIL_USER', { infer: true });
    const pass = this.configService.get('EMAIL_PASSWORD', { infer: true });

    this.smtpTransporter = createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      // Connection pooling for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 10,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });

    // Verify connection
    this.smtpTransporter.verify((error) => {
      if (error) {
        this.logger.error('❌ SMTP verification failed', error.stack);
      } else {
        this.logger.log('✅ SMTP email service initialized');
      }
    });
  }

  /**
   * Send OTP email
   */
  async sendOTP(email: string, otp: string): Promise<void> {
    const from = this.configService.get('EMAIL_FROM', { infer: true });
    const subject = 'Your OTP Code - QR Ordering Platform';
    const html = this.getOTPTemplate(otp);

    try {
      if (this.provider === 'sendgrid') {
        await this.sendViaSendGrid({ to: email, from, subject, html });
      } else {
        await this.sendViaSmtp({ to: email, from, subject, html });
      }

      this.logger.log(`✅ OTP sent to ${email} via ${this.provider}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send OTP to ${email}: ${errorMessage}`);
      throw new Error(`Failed to send OTP email: ${errorMessage}`);
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(params: {
    to: string;
    from: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const { to, from, subject, html } = params;

    const msg = {
      to,
      from,
      subject,
      html,
    };

    const [response] = await sgMail.send(msg);

    if (response.statusCode >= 400) {
      throw new Error(`SendGrid error: ${response.statusCode}`);
    }
  }

  /**
   * Send email via SMTP
   */
  private async sendViaSmtp(params: {
    to: string;
    from: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter not initialized');
    }

    await this.smtpTransporter.sendMail(params);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    const from = this.configService.get('EMAIL_FROM', { infer: true });
    const subject = 'Reset Your Password - QR Ordering Platform';
    const html = this.getPasswordResetTemplate(resetLink);

    try {
      if (this.provider === 'sendgrid') {
        await this.sendViaSendGrid({ to: email, from, subject, html });
      } else {
        await this.sendViaSmtp({ to: email, from, subject, html });
      }

      this.logger.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send password reset to ${email}: ${errorMessage}`);
      throw new Error(`Failed to send password reset email: ${errorMessage}`);
    }
  }

  /**
   * OTP Email Template
   */
  private getOTPTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-code { 
              font-size: 36px; 
              font-weight: bold; 
              color: #10B981; 
              letter-spacing: 8px;
              text-align: center;
              padding: 25px;
              background: white;
              border-radius: 8px;
              margin: 25px 0;
              border: 2px dashed #10B981;
            }
            .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 20px; }
            .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 12px; border-radius: 6px; margin-top: 20px; }
            .warning p { margin: 0; color: #92400E; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ QR Ordering Platform</h1>
            </div>
            <div class="content">
              <h2 style="color: #111827; margin-top: 0;">Verify Your Email</h2>
              <p>Thank you for registering! Please use the following OTP code to complete your registration:</p>
              <div class="otp-code">${otp}</div>
              <p><strong>⏰ This code will expire in 5 minutes.</strong></p>
              
              <div class="warning">
                <p>🔒 If you didn't request this code, please ignore this email. Someone may have entered your email by mistake.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 TKOB QR Ordering. All rights reserved.</p>
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Password Reset Email Template
   */
  private getPasswordResetTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .btn { 
              display: inline-block;
              background: #10B981; 
              color: white !important; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ QR Ordering Platform</h1>
            </div>
            <div class="content">
              <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="btn">Reset Password</a>
              </div>
              
              <p style="font-size: 13px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #10B981;">${resetLink}</a>
              </p>
              
              <p><strong>⏰ This link will expire in 1 hour.</strong></p>
              <p style="font-size: 13px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
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
