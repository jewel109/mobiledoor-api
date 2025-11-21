import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.dataSource.transaction(async manager => {
      // Get user's cart
      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty. Cannot create order.');
      }

      // Validate stock and calculate total
      let totalAmount = 0;
      for (const cartItem of cart.items) {
        const product = await manager.findOne(Product, {
          where: { id: cartItem.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${cartItem.productId} not found`);
        }

        if (!product.inStock || product.stock < cartItem.quantity) {
          throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
        }

        // Calculate item total
        const itemTotal = product.price * cartItem.quantity;
        totalAmount += itemTotal;

        // Update product stock
        product.stock -= cartItem.quantity;
        if (product.stock === 0) {
          product.inStock = false;
        }
        await manager.save(product);
      }

      // Create order
      const order = manager.create(Order, {
        totalAmount,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress,
        notes: createOrderDto.notes,
      });

      const savedOrder = await manager.save(order);

      // Create order items
      for (const cartItem of cart.items) {
        const orderItem = manager.create(OrderItem, {
          order: savedOrder,
          product: cartItem.product,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
        await manager.save(orderItem);
      }

      // Clear the cart
      await manager.delete(CartItem, { cart: { id: cart.id } });

      // Update cart total
      cart.total = 0;
      await manager.save(cart);

      return savedOrder;
    });
  }

  async getUserOrders(userId: number, page: number = 1, limit: number = 10): Promise<{ orders: Order[]; pagination: any }> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    return { orders, pagination };
  }

  async getOrderById(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user owns the order or is admin
    if (order.user.id !== userId) {
      throw new ForbiddenException('Access to this order is forbidden');
    }

    return order;
  }

  async getAllOrders(page: number = 1, limit: number = 10): Promise<{ orders: Order[]; pagination: any }> {
    const [orders, total] = await this.orderRepository.findAndCount({
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    return { orders, pagination };
  }

  async updateOrderStatus(
    userId: number,
    orderId: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only admins can update order status
    // This will be enforced by RolesGuard at controller level

    order.status = updateOrderStatusDto.status;
    order.notes = updateOrderStatusDto.notes || order.notes;

    return await this.orderRepository.save(order);
  }

  async updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = paymentStatus;

    if (paymentStatus === PaymentStatus.COMPLETED && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CONFIRMED;
    } else if (paymentStatus === PaymentStatus.FAILED) {
      order.status = OrderStatus.CANCELLED;
    }

    return await this.orderRepository.save(order);
  }

  async cancelOrder(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user owns the order
    if (order.user.id !== userId) {
      throw new ForbiddenException('Access to this order is forbidden');
    }

    // Check if order can be cancelled
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    // Restore stock for all products in the order
    for (const orderItem of order.items) {
      const product = await this.productRepository.findOne({
        where: { id: orderItem.product.id },
      });

      if (product) {
        product.stock += orderItem.quantity;
        if (product.stock > 0) {
          product.inStock = true;
        }
        await this.productRepository.save(product);
      }
    }

    order.status = OrderStatus.CANCELLED;
    order.paymentStatus = PaymentStatus.REFUNDED;

    return await this.orderRepository.save(order);
  }

  async getOrderStats(userId?: number): Promise<any> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (userId) {
      queryBuilder.where('order.user.id = :userId', { userId });
    }

    const totalOrders = await queryBuilder.getCount();
    const totalRevenue = await queryBuilder
      .select('SUM(order.totalAmount)', 'total')
      .getRawOne();

    const ordersByStatus = await queryBuilder
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    return {
      totalOrders,
      totalRevenue: totalRevenue?.total || '0',
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }
}