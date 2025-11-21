import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

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
}