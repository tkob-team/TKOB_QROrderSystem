import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionLimitsGuard, CheckLimit } from '@/modules/subscription/guards/subscription-limits.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  InviteStaffDto,
  InviteStaffResponseDto,
  AcceptInviteDto,
  AcceptInviteResponseDto,
  ListStaffResponseDto,
  ListInvitationsResponseDto,
  UpdateStaffRoleDto,
  StaffMemberDto,
  RemoveStaffResponseDto,
  ResendInviteResponseDto,
  VerifyInviteTokenDto,
  VerifyInviteTokenResponseDto,
} from './dto/staff.dto';
import { SkipTransform } from '@/common/interceptors/transform.interceptor';

interface JwtUser {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

@ApiTags('Staff Management')
@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ==================== PROTECTED ENDPOINTS (Require Auth) ====================

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard, SubscriptionLimitsGuard)
  @Roles(UserRole.OWNER)
  @CheckLimit('inviteStaff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a new staff member' })
  @ApiResponse({ status: 201, type: InviteStaffResponseDto })
  @ApiResponse({ status: 403, description: 'Subscription limit exceeded' })
  @ApiResponse({ status: 409, description: 'User already exists or invitation pending' })
  async inviteStaff(
    @CurrentUser() user: JwtUser,
    @Body() dto: InviteStaffDto,
  ): Promise<InviteStaffResponseDto> {
    return this.staffService.inviteStaff(user.tenantId, user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all staff members' })
  @ApiResponse({ status: 200, type: ListStaffResponseDto })
  async listStaff(@CurrentUser() user: JwtUser): Promise<ListStaffResponseDto> {
    return this.staffService.listStaff(user.tenantId);
  }

  @Get('invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending invitations' })
  @ApiResponse({ status: 200, type: ListInvitationsResponseDto })
  async listPendingInvitations(
    @CurrentUser() user: JwtUser,
  ): Promise<ListInvitationsResponseDto> {
    return this.staffService.listPendingInvitations(user.tenantId);
  }

  @Patch(':staffId/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff member role' })
  @ApiParam({ name: 'staffId', description: 'Staff member ID' })
  @ApiResponse({ status: 200, type: StaffMemberDto })
  async updateStaffRole(
    @CurrentUser() user: JwtUser,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffRoleDto,
  ): Promise<StaffMemberDto> {
    return this.staffService.updateStaffRole(
      user.tenantId,
      staffId,
      dto.role,
      user.userId,
    );
  }

  @Delete(':staffId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove staff member' })
  @ApiParam({ name: 'staffId', description: 'Staff member ID' })
  @ApiResponse({ status: 200, type: RemoveStaffResponseDto })
  async removeStaff(
    @CurrentUser() user: JwtUser,
    @Param('staffId') staffId: string,
  ): Promise<RemoveStaffResponseDto> {
    return this.staffService.removeStaff(user.tenantId, staffId, user.userId);
  }

  @Delete('invitations/:invitationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipTransform()
  @ApiOperation({ summary: 'Cancel pending invitation' })
  @ApiParam({ name: 'invitationId', description: 'Invitation ID' })
  @ApiResponse({ status: 204, description: 'Invitation cancelled' })
  async cancelInvitation(
    @CurrentUser() user: JwtUser,
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    await this.staffService.cancelInvitation(user.tenantId, invitationId);
  }

  @Post('invitations/:invitationId/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend invitation email' })
  @ApiParam({ name: 'invitationId', description: 'Invitation ID' })
  @ApiResponse({ status: 200, type: ResendInviteResponseDto })
  async resendInvitation(
    @CurrentUser() user: JwtUser,
    @Param('invitationId') invitationId: string,
  ): Promise<ResendInviteResponseDto> {
    return this.staffService.resendInvitation(user.tenantId, invitationId);
  }

  // ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

  @Get('verify-invite')
  @ApiOperation({ summary: 'Verify invitation token validity' })
  @ApiResponse({ status: 200, type: VerifyInviteTokenResponseDto })
  async verifyInviteToken(
    @Query('token') token: string,
  ): Promise<VerifyInviteTokenResponseDto> {
    return this.staffService.verifyInviteToken(token);
  }

  @Post('accept-invite')
  @ApiOperation({ summary: 'Accept invitation and create account' })
  @ApiResponse({ status: 201, type: AcceptInviteResponseDto })
  @ApiResponse({ status: 400, description: 'Invitation expired or already used' })
  async acceptInvitation(
    @Body() dto: AcceptInviteDto,
  ): Promise<AcceptInviteResponseDto> {
    return this.staffService.acceptInvitation(dto);
  }
}
