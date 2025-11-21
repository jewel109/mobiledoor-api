import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentStatus } from './order.entity';
import { UserRole } from '../user/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(req.user.id, createOrderDto);

    return {
      success: true,
      data: {
        success: true,
        message: 'Order created successfully',
        order,
      },
      message: 'Order created successfully',
    };
  }

  @Get()
  async getUserOrders(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const { orders, pagination } = await this.orderService.getUserOrders(
      req.user.id,
      pageNum,
      limitNum,
    );

    return {
      success: true,
      data: {
        success: true,
        data: {
          orders,
          pagination,
        },
      },
      message: 'Orders retrieved successfully',
    };
  }

  @Get(':id')
  async getOrderById(@Request() req, @Param('id') orderId: string) {
    const order = await this.orderService.getOrderById(req.user.id, parseInt(orderId, 10));

    return {
      success: true,
      data: {
        success: true,
        data: { order },
      },
      message: 'Order retrieved successfully',
    };
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const { orders, pagination } = await this.orderService.getAllOrders(pageNum, limitNum);

    return {
      success: true,
      data: {
        success: true,
        data: {
          orders,
          pagination,
        },
      },
      message: 'All orders retrieved successfully',
    };
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(
      null, // Admin action, no userId restriction
      parseInt(orderId, 10),
      updateOrderStatusDto,
    );

    return {
      success: true,
      data: {
        success: true,
        data: { order },
      },
      message: 'Order status updated successfully',
    };
  }

  @Put(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') orderId: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    const order = await this.orderService.updatePaymentStatus(
      parseInt(orderId, 10),
      paymentStatus,
    );

    return {
      success: true,
      data: {
        success: true,
        data: { order },
      },
      message: 'Payment status updated successfully',
    };
  }

  @Put(':id/cancel')
  async cancelOrder(@Request() req, @Param('id') orderId: string) {
    const order = await this.orderService.cancelOrder(req.user.id, parseInt(orderId, 10));

    return {
      success: true,
      data: {
        success: true,
        data: { order },
      },
      message: 'Order cancelled successfully',
    };
  }

  @Get('stats/my')
  async getUserOrderStats(@Request() req) {
    const stats = await this.orderService.getOrderStats(req.user.id);

    return {
      success: true,
      data: {
        success: true,
        data: { stats },
      },
      message: 'User order statistics retrieved successfully',
    };
  }

  @Get('stats/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllOrderStats() {
    const stats = await this.orderService.getOrderStats();

    return {
      success: true,
      data: {
        success: true,
        data: { stats },
      },
      message: 'All order statistics retrieved successfully',
    };
  }
}