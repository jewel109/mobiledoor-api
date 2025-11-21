import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { OrderItem } from '../order/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  specs: {
    screen: string;
    processor: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
  };

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'in_stock', default: true })
  inStock: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
}