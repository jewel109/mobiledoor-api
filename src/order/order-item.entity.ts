import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../product/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, product => product.orderItems)
  product: Product;
}