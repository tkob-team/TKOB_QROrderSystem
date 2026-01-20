import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from 'src/modules/table/guards/session.guard';
import { MenuItemsService } from '../services/menu-item.service';
import { MenuItemResponseDto } from '../dto/menu-response.dto';
import { MenuItemFiltersDto } from '../dto/menu-item.dto';
import { CurrentSession } from '../../../common/decorators/current-session.decorator';
import { SessionData } from 'src/modules/table/services/table-session.service';

/**
 * Public menu item endpoints for customer app
 * Uses SessionGuard instead of JwtAuthGuard
 */
@ApiTags('Menu - Items (Public)')
@Controller('menu/item/public')
@UseGuards(SessionGuard)
export class MenuItemsPublicController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get published menu items for customer (with session)' })
  @ApiResponse({ status: 200, type: [MenuItemResponseDto] })
  async findAll(@CurrentSession() session: SessionData, @Query() query: MenuItemFiltersDto) {
    // For customer endpoints, force PUBLISHED status
    query.status = 'PUBLISHED';
    return this.menuItemsService.findFiltered(session.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item details for customer (with session)' })
  @ApiResponse({ status: 200, type: MenuItemResponseDto })
  async findOne(@CurrentSession() session: SessionData, @Param('id') id: string) {
    // Use session.tenantId to bypass JWT tenant context
    // This allows logged-in customers to view menu from the restaurant they're at
    return this.menuItemsService.findByIdForCustomer(id, session.tenantId);
  }
}
