import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../product/product.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: Repository<Cart>;
  let cartItemRepository: Repository<CartItem>;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepository = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should throw NotFoundException when product does not exist', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addToCart(1, { productId: 1, quantity: 1 })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const mockProduct = { id: 1, inStock: false, stock: 0 };
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as any);

      await expect(
        service.addToCart(1, { productId: 1, quantity: 1 })
      ).rejects.toThrow(BadRequestException);
    });
  });
});