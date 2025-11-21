import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../product/product.entity';

@Entity('cart_items')
@Unique(['cartId', 'productId'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'cart_id' })
  cartId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, product => product.cartItems)
  product: Product;
}