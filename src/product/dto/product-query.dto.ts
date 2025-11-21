import { IsOptional, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by brand', example: 'Apple' })
  brand?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ description: 'Minimum price', example: 100 })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ description: 'Maximum price', example: 2000 })
  maxPrice?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter by stock availability', example: true })
  inStock?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search in name and description', example: 'iPhone' })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Sort by field', example: 'name' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Sort order', example: 'desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}