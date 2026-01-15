import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
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
  UseGuards,
} from '@nestjs/common';
import { SessionGuard } from '@/modules/table/guards/session.guard';
import { Public } from '@/common/decorators/public.decorator';
import { Session } from '@/common/decorators/session.decorator';
import { AddToCartDto, CartResponseDto, UpdateCartItemDto } from '../dtos/cart.dto';
import { SessionData } from '@/modules/table/services/table-session.service';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(SessionGuard)
@Public()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Create
  @Post('items')
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, type: CartResponseDto })
  async addToCart(
    @Session() session: SessionData,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(session.sessionId, session.tenantId, session.tableId, dto);
  }

  // Read
  @Get()
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Get cart for current session' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async getCart(@Session() session: SessionData): Promise<CartResponseDto> {
    return this.cartService.getCartByTable(session.tenantId, session.tableId, session.sessionId);
  }

  // Update
  @Patch('items/:itemId')
  @ApiCookieAuth('table_session_id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async updateCartItem(
    @Session() session: SessionData,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cartId = await this.cartService.getOrCreateCart(
      session.tenantId,
      session.tableId,
      session.sessionId,
    );
    return this.cartService.updateCartItem(cartId, itemId, dto);
  }

  // Delete
  @Delete('items/:itemId')
  @ApiCookieAuth('table_session_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  async removeCartItem(
    @Session() session: SessionData,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    const cartId = await this.cartService.getOrCreateCart(
      session.tenantId,
      session.tableId,
      session.sessionId,
    );
    return await this.cartService.removeCartItem(cartId, itemId);
  }

  @Delete()
  @ApiCookieAuth('table_session_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 204 })
  async clearCart(@Session() session: SessionData): Promise<void> {
    const cartId = await this.cartService.getOrCreateCart(
      session.tenantId,
      session.tableId,
      session.sessionId,
    );
    await this.cartService.clearCart(cartId);
  }
}
