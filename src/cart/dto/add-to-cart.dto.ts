import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5) // Business rule: Max 5 items per product
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  quantity: number;
}