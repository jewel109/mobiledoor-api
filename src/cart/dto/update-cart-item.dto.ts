import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5) // Business rule: Max 5 items per product
  quantity: number;
}