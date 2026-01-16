import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  InviteStaffDto,
  InviteStaffResponseDto,
  AcceptInviteDto,
  AcceptInviteResponseDto,
  ListStaffResponseDto,
  ListInvitationsResponseDto,
  StaffMemberDto,
  PendingInvitationDto,
  VerifyInviteTokenResponseDto,
  RemoveStaffResponseDto,
  ResendInviteResponseDto,
} from './dto/staff.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);
  private readonly INVITE_EXPIRY_DAYS = 7;
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send staff invitation email
   */
  async inviteStaff(
    tenantId: string,
    invitedBy: string,
    dto: InviteStaffDto,
  ): Promise<InviteStaffResponseDto> {
    const { email, role } = dto;

    // Check if user already exists in this tenant
    const existingUser = await this.prisma.user.findFirst({
      where: { email, tenantId },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in your restaurant');
    }

    // Check for pending invitation
    const existingInvite = await this.prisma.staffInvitation.findFirst({
      where: {
        tenantId,
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new ConflictException('An active invitation already exists for this email');
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.INVITE_EXPIRY_DAYS);

    // Create invitation record
    const invitation = await this.prisma.staffInvitation.create({
      data: {
        tenantId,
        email,
        role: role as UserRole,
        token,
        expiresAt,
        invitedBy,
      },
      include: {
        tenant: { select: { name: true } },
      },
    });

    // Send invitation email
    await this.sendInvitationEmail(email, token, invitation.tenant.name, role);

    this.logger.log(`Staff invitation sent to ${email} for tenant ${tenantId}`);

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      message: `Invitation sent to ${email}. They have ${this.INVITE_EXPIRY_DAYS} days to accept.`,
    };
  }

  /**
   * Verify invitation token (used before showing accept form)
   */
  async verifyInviteToken(token: string): Promise<VerifyInviteTokenResponseDto> {
    const invitation = await this.prisma.staffInvitation.findUnique({
      where: { token },
      include: { tenant: { select: { name: true } } },
    });

    if (!invitation) {
      return { valid: false };
    }

    if (invitation.usedAt) {
      return { valid: false };
    }

    if (invitation.expiresAt < new Date()) {
      return { valid: false };
    }

    return {
      valid: true,
      email: invitation.email,
      role: invitation.role,
      tenantName: invitation.tenant.name,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Accept invitation and create user account
   */
  async acceptInvitation(dto: AcceptInviteDto): Promise<AcceptInviteResponseDto> {
    const { token, fullName, password } = dto;

    // Find and validate invitation
    const invitation = await this.prisma.staffInvitation.findUnique({
      where: { token },
      include: { tenant: { select: { name: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.usedAt) {
      throw new BadRequestException('This invitation has already been used');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('This invitation has expired');
    }

    // Check if email is already registered globally
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // Create user and mark invitation as used in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: invitation.email,
          fullName,
          passwordHash,
          role: invitation.role,
          status: UserStatus.ACTIVE,
          tenantId: invitation.tenantId,
        },
      });

      // Mark invitation as used
      await tx.staffInvitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return newUser;
    });

    this.logger.log(`Staff ${user.email} accepted invitation for tenant ${invitation.tenantId}`);

    return {
      message: 'Account created successfully. You can now log in.',
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
  }

  /**
   * List all staff members for a tenant
   */
  async listStaff(tenantId: string): Promise<ListStaffResponseDto> {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' }, // OWNER first
        { createdAt: 'desc' },
      ],
    });

    const staff: StaffMemberDto[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }));

    return {
      staff,
      total: staff.length,
    };
  }

  /**
   * List pending invitations
   */
  async listPendingInvitations(tenantId: string): Promise<ListInvitationsResponseDto> {
    const invitations = await this.prisma.staffInvitation.findMany({
      where: {
        tenantId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pending: PendingInvitationDto[] = invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
    }));

    return {
      invitations: pending,
      total: pending.length,
    };
  }

  /**
   * Update staff member role
   */
  async updateStaffRole(
    tenantId: string,
    staffId: string,
    newRole: 'STAFF' | 'KITCHEN',
    requesterId: string,
  ): Promise<StaffMemberDto> {
    // Get staff member
    const staff = await this.prisma.user.findFirst({
      where: { id: staffId, tenantId },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Cannot change owner's role
    if (staff.role === UserRole.OWNER) {
      throw new ForbiddenException('Cannot change owner role');
    }

    // Cannot change your own role
    if (staff.id === requesterId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    // Update role
    const updated = await this.prisma.user.update({
      where: { id: staffId },
      data: { role: newRole as UserRole },
    });

    this.logger.log(`Staff ${staffId} role changed to ${newRole} in tenant ${tenantId}`);

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Remove staff member
   */
  async removeStaff(
    tenantId: string,
    staffId: string,
    requesterId: string,
  ): Promise<RemoveStaffResponseDto> {
    // Get staff member
    const staff = await this.prisma.user.findFirst({
      where: { id: staffId, tenantId },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Cannot remove owner
    if (staff.role === UserRole.OWNER) {
      throw new ForbiddenException('Cannot remove the owner');
    }

    // Cannot remove yourself
    if (staff.id === requesterId) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    // Delete user and their sessions
    await this.prisma.$transaction([
      this.prisma.userSession.deleteMany({ where: { userId: staffId } }),
      this.prisma.user.delete({ where: { id: staffId } }),
    ]);

    this.logger.log(`Staff ${staffId} removed from tenant ${tenantId}`);

    return {
      message: 'Staff member removed successfully',
      removedUserId: staffId,
    };
  }

  /**
   * Cancel/revoke pending invitation
   */
  async cancelInvitation(tenantId: string, invitationId: string): Promise<void> {
    const invitation = await this.prisma.staffInvitation.findFirst({
      where: {
        id: invitationId,
        tenantId,
        usedAt: null,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already used');
    }

    await this.prisma.staffInvitation.delete({ where: { id: invitationId } });

    this.logger.log(`Invitation ${invitationId} cancelled for tenant ${tenantId}`);
  }

  /**
   * Resend invitation email
   */
  async resendInvitation(tenantId: string, invitationId: string): Promise<ResendInviteResponseDto> {
    const invitation = await this.prisma.staffInvitation.findFirst({
      where: {
        id: invitationId,
        tenantId,
        usedAt: null,
      },
      include: { tenant: { select: { name: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already used');
    }

    // Extend expiry
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + this.INVITE_EXPIRY_DAYS);

    // Update expiry date
    await this.prisma.staffInvitation.update({
      where: { id: invitationId },
      data: { expiresAt: newExpiresAt },
    });

    // Resend email
    await this.sendInvitationEmail(
      invitation.email,
      invitation.token,
      invitation.tenant.name,
      invitation.role,
    );

    this.logger.log(`Invitation resent to ${invitation.email}`);

    return {
      message: `Invitation resent to ${invitation.email}`,
      expiresAt: newExpiresAt,
    };
  }

  /**
   * Send invitation email
   */
  private async sendInvitationEmail(
    email: string,
    token: string,
    tenantName: string,
    role: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get('TENANT_APP_URL', 'http://localhost:3002');
    const inviteLink = `${frontendUrl}/auth/accept-invite?token=${token}`;

    // Use email service to send
    const html = this.getInvitationTemplate(tenantName, role, inviteLink);

    // Log the invite link for debugging
    this.logger.log(`📧 Staff Invitation Link for ${email}: ${inviteLink}`);

    // Send actual email via EmailService
    try {
      await this.emailService.sendGenericEmail(
        email,
        `You're invited to join ${tenantName} as ${role}`,
        html,
      );
      this.logger.log(`✅ Staff invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send staff invitation email to ${email}:`, error);
      throw new Error('Failed to send invitation email');
    }
  }

  /**
   * Staff Invitation Email Template
   */
  private getInvitationTemplate(tenantName: string, role: string, inviteLink: string): string {
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
            .role-badge {
              display: inline-block;
              background: #DBEAFE;
              color: #1E40AF;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
            }
            .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ You're Invited!</h1>
            </div>
            <div class="content">
              <h2 style="color: #111827; margin-top: 0;">Join ${tenantName}</h2>
              <p>You've been invited to join <strong>${tenantName}</strong> as a team member.</p>
              
              <p>Your role: <span class="role-badge">${role}</span></p>
              
              <div style="text-align: center;">
                <a href="${inviteLink}" class="btn">Accept Invitation</a>
              </div>
              
              <p style="font-size: 13px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #10B981;">${inviteLink}</a>
              </p>
              
              <p><strong>⏰ This invitation will expire in 7 days.</strong></p>
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
