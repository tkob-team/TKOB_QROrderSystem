import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ModifierGroupService } from '../services/modifier-group.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from 'src/modules/tenant/guards/tenant-ownership.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateModifierGroupDto, UpdateModifierGroupDto } from '../dto/modifier.dto';
import type { AuthenticatedUser } from 'src/common/interfaces/auth.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ModifierType, UserRole } from '@prisma/client';
import { ModifierGroupResponseDto } from '../dto/menu-response.dto';

@ApiTags('Menu - Modifiers')
@Controller('menu/modifiers')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class ModifierGroupController {
  constructor(private readonly modifierService: ModifierGroupService) {}

  // CREATE
  @Post()
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create new modifier group' })
  @ApiResponse({ status: 201, type: ModifierGroupResponseDto })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateModifierGroupDto) {
    return this.modifierService.create(user.tenantId, dto);
  }

  // READ
  // findAll
  @Get()
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Get all modifier groups' })
  @ApiResponse({ status: 200, type: [ModifierGroupResponseDto] })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ModifierType,
    description: 'Filter by modifier type',
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('activeOnly') activeOnly?: boolean,
    @Query('type') type?: ModifierType,
  ) {
    return this.modifierService.findAll(user.tenantId, activeOnly, type);
  }

  // findById
  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Get modifier group by ID' })
  @ApiResponse({ status: 200, type: ModifierGroupResponseDto })
  async findOne(@Param('id') id: string) {
    return this.modifierService.findById(id);
  }

  // UPDATE
  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update modifier group' })
  @ApiResponse({ status: 200, type: ModifierGroupResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateModifierGroupDto) {
    return this.modifierService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Archive modifier group',
    description: 'Soft delete: Sets active = false after checking dependencies',
  })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string) {
    await this.modifierService.delete(id);
  }
}
