import { IsString, IsNumber, IsOptional, IsObject, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(100)
  brand: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  specs?: {
    screen: string;
    processor: string;
    ram: string;
    storage: string;
    camera: string;
    battery: string;
  };

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  stock: number;
}