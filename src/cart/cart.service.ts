import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../product/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, total: 0 });
      cart = await this.cartRepository.save(cart);

      // Reload with relations
      cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items', 'items.product'],
      });
    }

    return cart;
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    // Validate product exists and has sufficient stock
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.inStock || product.stock < quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    // Get or create user's cart
    const cart = await this.findOrCreateCart(userId);

    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
      relations: ['product'],
    });

    if (cartItem) {
      // Update existing cart item
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > 5) {
        throw new ConflictException('Maximum 5 items per product allowed');
      }

      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock available');
      }

      cartItem.quantity = newQuantity;
      cartItem.price = product.price; // Update to current price
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
        product,
      });
    }

    await this.cartItemRepository.save(cartItem);

    // Recalculate cart total
    await this.recalculateCartTotal(cart.id);

    // Return updated cart with items
    return this.findOrCreateCart(userId);
  }

  async updateCartItem(userId: number, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const { quantity } = updateCartItemDto;

    // Get cart and verify ownership
    const cart = await this.findOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);

    // Recalculate cart total
    await this.recalculateCartTotal(cart.id);

    return this.findOrCreateCart(userId);
  }

  async removeFromCart(userId: number, itemId: string): Promise<Cart> {
    // Get cart and verify ownership
    const cart = await this.findOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    // Recalculate cart total
    await this.recalculateCartTotal(cart.id);

    return this.findOrCreateCart(userId);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.findOrCreateCart(userId);

    await this.cartItemRepository.delete({ cartId: cart.id });

    cart.total = 0;
    await this.cartRepository.save(cart);
  }

  async getCart(userId: number): Promise<Cart> {
    return this.findOrCreateCart(userId);
  }

  private async recalculateCartTotal(cartId: number): Promise<void> {
    const cartItems = await this.cartItemRepository.find({
      where: { cartId },
      relations: ['product'],
    });

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await this.cartRepository.update(cartId, { total });
  }

  async validateCartForOrder(userId: number): Promise<{ valid: boolean; message?: string; cart?: Cart }> {
    const cart = await this.findOrCreateCart(userId);

    if (!cart.items || cart.items.length === 0) {
      return { valid: false, message: 'Cart is empty' };
    }

    // Check if all items are still in stock
    for (const item of cart.items) {
      if (!item.product.inStock || item.product.stock < item.quantity) {
        return {
          valid: false,
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Required: ${item.quantity}`
        };
      }
    }

    return { valid: true, cart };
  }
}