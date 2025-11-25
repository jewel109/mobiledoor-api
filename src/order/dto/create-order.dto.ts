import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Shipping address is required' })
  @MinLength(5, { message: 'Shipping address must be at least 5 characters long' })
  @MaxLength(500, { message: 'Shipping address must not exceed 500 characters' })
  shippingAddress: string;

  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'Billing address must be at least 5 characters long' })
  @MaxLength(500, { message: 'Billing address must not exceed 500 characters' })
  billingAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @IsString()
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}