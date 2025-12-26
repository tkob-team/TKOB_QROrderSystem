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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TenantOwnershipGuard } from 'src/modules/tenant/guards/tenant-ownership.guard';
import { MenuItemsService } from '../services/menu-item.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/interfaces/auth.interface';
import {
  CreateMenuItemDto,
  MenuItemFiltersDto,
  PublishMenuItemDto,
  ToggleAvailabilityDto,
  UpdateMenuItemDto,
} from '../dto/menu-item.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { MenuItemResponseDto } from '../dto/menu-response.dto';

@ApiTags('Menu - Items')
@Controller('menu/item')
@UseGuards(JwtAuthGuard, RolesGuard, TenantOwnershipGuard)
@ApiBearerAuth()
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  // CRUD
  // CREATE
  @Post()
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create new menu item' })
  @ApiResponse({ status: 201, type: MenuItemResponseDto })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(user.tenantId, dto);
  }

  // READ:
  @Get()
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Get menu items with filters' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: MenuItemFiltersDto) {
    return this.menuItemsService.findFiltered(user.tenantId, query);
  }

  // READ: findById(id)
  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  async findOne(@Param('id') id: string) {
    return this.menuItemsService.findById(id);
  }

  // UPDATE:
  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update menu item' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuItemsService.update(id, dto);
  }

  // DELETE:
  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (archive) menu item' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string) {
    await this.menuItemsService.delete(id);
  }

  // PUBLISH
  @Post(':id/publish')
  @Roles(UserRole.OWNER, UserRole.STAFF)
  @ApiOperation({ summary: 'Publish/Unpublish menu item' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  async togglePublish(@Param('id') id: string, @Body() dto: PublishMenuItemDto) {
    if (dto.publish) {
      return this.menuItemsService.publish(id);
    } else {
      return this.menuItemsService.unpublish(id);
    }
  }

  @Patch(':id/availability')
  @Roles(UserRole.OWNER, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Toggle item availability' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  async toggleAvailability(@Param('id') id: string, @Body() dto: ToggleAvailabilityDto) {
    return this.menuItemsService.toggleAvailability(id, dto.available);
  }
}
