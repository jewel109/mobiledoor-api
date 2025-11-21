import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      inStock: createProductDto.stock > 0,
    });

    return this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 10,
      brand,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Brand filter
    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    // Price range filter
    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Stock filter
    if (inStock !== undefined) {
      queryBuilder.andWhere('product.inStock = :inStock', { inStock });
    }

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const validSortFields = ['name', 'price', 'createdAt', 'brand'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`product.${sortField}`, orderDirection);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.productRepository.update(id, updateProductDto);
    const product = await this.findOne(id);

    // Update inStock status based on stock quantity
    if (updateProductDto.stock !== undefined) {
      product.inStock = updateProductDto.stock > 0;
      await this.productRepository.save(product);
    }

    return product;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock -= quantity;
    product.inStock = product.stock > 0;
    return this.productRepository.save(product);
  }

  async checkStock(id: number, quantity: number): Promise<boolean> {
    const product = await this.findOne(id);
    return product.stock >= quantity;
  }
}