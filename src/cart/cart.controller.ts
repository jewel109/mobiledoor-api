import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: { user: { id: number } }) {
    const cart = await this.cartService.getCart(req.user.id);
    return {
      id: cart.id,
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          inStock: item.product.inStock,
          stock: item.product.stock,
        },
        subtotal: item.price * item.quantity,
      })),
      total: cart.total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  @Post('items')
  async addToCart(
    @Request() req: { user: { id: number } },
    @Body() addToCartDto: AddToCartDto,
  ) {
    const cart = await this.cartService.addToCart(req.user.id, addToCartDto);

    return {
      message: 'Item added to cart successfully',
      cart: {
        id: cart.id,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            inStock: item.product.inStock,
            stock: item.product.stock,
          },
          subtotal: item.price * item.quantity,
        })),
        total: cart.total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        updatedAt: cart.updatedAt,
      },
    };
  }

  @Put('items/:itemId')
  async updateCartItem(
    @Request() req: { user: { id: number } },
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateCartItem(req.user.id, itemId, updateCartItemDto);

    return {
      message: 'Cart item updated successfully',
      cart: {
        id: cart.id,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            inStock: item.product.inStock,
            stock: item.product.stock,
          },
          subtotal: item.price * item.quantity,
        })),
        total: cart.total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        updatedAt: cart.updatedAt,
      },
    };
  }

  @Delete('items/:itemId')
  async removeFromCart(
    @Request() req: { user: { id: number } },
    @Param('itemId') itemId: string,
  ) {
    const cart = await this.cartService.removeFromCart(req.user.id, itemId);

    return {
      message: 'Item removed from cart successfully',
      cart: {
        id: cart.id,
        items: cart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            inStock: item.product.inStock,
            stock: item.product.stock,
          },
          subtotal: item.price * item.quantity,
        })),
        total: cart.total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        updatedAt: cart.updatedAt,
      },
    };
  }

  @Delete()
  async clearCart(@Request() req: { user: { id: number } }) {
    await this.cartService.clearCart(req.user.id);

    return {
      message: 'Cart cleared successfully',
    };
  }

  @Get('validate')
  async validateCart(@Request() req: { user: { id: number } }) {
    const validation = await this.cartService.validateCartForOrder(req.user.id);
    return validation;
  }
}