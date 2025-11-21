import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { OrderStatus } from '../order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Status must be one of: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: OrderStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;
}