# MobileDoor API Specifications

## 🏗️ Architecture Overview

**MobileDoor API** is a comprehensive e-commerce backend built with **NestJS** following the auth-template architecture patterns. This API provides complete functionality for mobile phone and accessories e-commerce platform.

### **Technology Stack**
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM ORM
- **Authentication**: JWT with bcrypt (12 salt rounds)
- **Validation**: class-validator & class-transformer
- **Security**: Helmet, CORS, Guards, Interceptors
- **Testing**: Jest with supertest

## 📁 Project Structure

```
src/
├── auth/                    # Authentication Module
│   ├── auth.controller.ts   # Auth endpoints
│   ├── auth.service.ts      # Auth business logic
│   ├── auth.module.ts       # Module configuration
│   ├── auth.guard.ts        # JWT authentication guard
│   ├── roles.guard.ts       # Role-based access guard
│   ├── roles.decorator.ts   # Roles decorator
│   ├── jwt.strategy.ts      # JWT passport strategy
│   └── dto/                 # Data transfer objects
│       ├── register.dto.ts  # Registration validation
│       └── login.dto.ts     # Login validation
├── user/                    # User Module
│   ├── user.controller.ts   # User endpoints
│   ├── user.service.ts      # User business logic
│   ├── user.module.ts       # Module configuration
│   └── user.entity.ts       # User database model
├── product/                 # Product Module
│   ├── product.controller.ts # Product endpoints
│   ├── product.service.ts    # Product business logic
│   ├── product.module.ts     # Module configuration
│   ├── product.entity.ts     # Product database model
│   └── dto/                  # Data transfer objects
│       ├── create-product.dto.ts
│       ├── update-product.dto.ts
│       └── product-query.dto.ts
├── cart/                    # Cart Module ✅ Complete
│   ├── cart.controller.ts   # Cart endpoints
│   ├── cart.service.ts      # Cart business logic
│   ├── cart.module.ts       # Module configuration
│   ├── cart.entity.ts       # Cart database model
│   ├── cart-item.entity.ts  # CartItem database model
│   └── dto/                 # Data transfer objects
│       ├── add-to-cart.dto.ts
│       └── update-cart-item.dto.ts
├── order/                   # Order Module (Pending)
├── app.module.ts            # Root module configuration
├── main.ts                  # Application entry point
├── success.interceptor.ts   # Global success response interceptor
└── error.interceptor.ts     # Global error handling filter
```

## 🔐 Authentication System

### **JWT Authentication Flow**
1. User registers/logs in with email and password
2. Server validates credentials
3. JWT token issued with 7-day expiration
4. Token sent in Authorization header: `Bearer <token>`
5. Protected routes validate token via JwtAuthGuard

### **Role-Based Access Control**
- **USER**: Can browse products, manage cart, place orders
- **ADMIN**: Full access to all resources including user management

## 📊 Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Products Table**
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  specs JSONB,
  image_url VARCHAR(500),
  stock INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Carts Table**
```sql
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  total DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Cart Items Table**
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  UNIQUE(cart_id, product_id)
);
```

### **Orders Table**
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  shipping_address JSONB,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Order Items Table**
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL
);
```

## 🚀 API Endpoints

### **Authentication Endpoints**

#### POST /auth/register
**Description**: Register a new user account
**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Operation successful"
}
```

#### POST /auth/login
**Description**: Authenticate user and return JWT token
**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Login successful",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Operation successful"
}
```

#### GET /auth/me
**Description**: Get current authenticated user profile
**Authentication**: JWT required

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    }
  },
  "message": "Operation successful"
}
```

#### POST /auth/logout
**Description**: Logout user (client-side token removal)
**Authentication**: JWT required

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Logout successful"
  },
  "message": "Operation successful"
}
```

### **Product Endpoints**

#### GET /products
**Description**: Get all products with pagination and filtering
**Authentication**: None required

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `brand` (string): Filter by brand
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter by stock availability
- `search` (string): Search in name and description
- `sortBy` (string): Sort field (name, price, createdAt, brand)
- `sortOrder` (string): Sort order (asc, desc)

**Example**: `GET /products?page=1&limit=10&brand=Apple&minPrice=500&maxPrice=1500`

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "brand": "Apple",
        "price": 999.99,
        "description": "Latest iPhone with advanced features",
        "specs": {
          "screen": "6.1-inch",
          "processor": "A17 Pro",
          "ram": "8GB",
          "storage": "256GB",
          "camera": "48MP",
          "battery": "3274mAh"
        },
        "imageUrl": "https://example.com/iphone15.jpg",
        "stock": 50,
        "inStock": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 48,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Operation successful"
}
```

#### GET /products/:id
**Description**: Get single product details
**Authentication**: None required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "price": 999.99,
    "description": "Latest iPhone with advanced features",
    "specs": {
      "screen": "6.1-inch",
      "processor": "A17 Pro",
      "ram": "8GB",
      "storage": "256GB",
      "camera": "48MP",
      "battery": "3274mAh"
    },
    "imageUrl": "https://example.com/iphone15.jpg",
    "stock": 50,
    "inStock": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Operation successful"
}
```

#### POST /products
**Description**: Create new product
**Authentication**: Admin required

**Request Body**:
```json
{
  "name": "Samsung Galaxy S24",
  "brand": "Samsung",
  "price": 899.99,
  "description": "Latest Samsung flagship",
  "specs": {
    "screen": "6.2-inch",
    "processor": "Snapdragon 8 Gen 3",
    "ram": "12GB",
    "storage": "256GB",
    "camera": "50MP",
    "battery": "4000mAh"
  },
  "imageUrl": "https://example.com/galaxys24.jpg",
  "stock": 30
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Samsung Galaxy S24",
    "brand": "Samsung",
    "price": 899.99,
    "inStock": true,
    "createdAt": "2024-01-16T14:20:00Z"
  },
  "message": "Operation successful"
}
```

#### PATCH /products/:id
**Description**: Update existing product
**Authentication**: Admin required

**Request Body**:
```json
{
  "price": 849.99,
  "stock": 25,
  "inStock": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Samsung Galaxy S24",
    "brand": "Samsung",
    "price": 849.99,
    "stock": 25,
    "inStock": true,
    "updatedAt": "2024-01-16T15:30:00Z"
  },
  "message": "Operation successful"
}
```

#### DELETE /products/:id
**Description**: Delete product
**Authentication**: Admin required

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Operation successful"
}
```

### **User Endpoints**

#### GET /users/profile
**Description**: Get user profile
**Authentication**: JWT required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-01-10T08:00:00Z"
  },
  "message": "Operation successful"
}
```

### **Cart Endpoints**

#### GET /cart
**Description**: Get user's shopping cart with items
**Authentication**: JWT required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": "1",
        "productId": 1,
        "quantity": 2,
        "price": 999.99,
        "product": {
          "id": 1,
          "name": "iPhone 15 Pro",
          "brand": "Apple",
          "price": 999.99,
          "imageUrl": "https://example.com/iphone15.jpg",
          "inStock": true,
          "stock": 50
        },
        "subtotal": 1999.98
      }
    ],
    "total": 1999.98,
    "itemCount": 2,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  "message": "Operation successful"
}
```

#### POST /cart/items
**Description**: Add item to shopping cart
**Authentication**: JWT required

**Request Body**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Item added to cart successfully",
    "cart": {
      "id": 1,
      "items": [
        {
          "id": "1",
          "productId": 1,
          "quantity": 2,
          "price": 999.99,
          "product": {
            "id": 1,
            "name": "iPhone 15 Pro",
            "brand": "Apple",
            "price": 999.99,
            "imageUrl": "https://example.com/iphone15.jpg",
            "inStock": true,
            "stock": 50
          },
          "subtotal": 1999.98
        }
      ],
      "total": 1999.98,
      "itemCount": 2,
      "updatedAt": "2024-01-15T11:30:00Z"
    }
  },
  "message": "Operation successful"
}
```

#### PUT /cart/items/:itemId
**Description**: Update cart item quantity
**Authentication**: JWT required

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Cart item updated successfully",
    "cart": {
      "id": 1,
      "items": [
        {
          "id": "1",
          "productId": 1,
          "quantity": 3,
          "price": 999.99,
          "product": {
            "id": 1,
            "name": "iPhone 15 Pro",
            "brand": "Apple",
            "price": 999.99,
            "imageUrl": "https://example.com/iphone15.jpg",
            "inStock": true,
            "stock": 50
          },
          "subtotal": 2999.97
        }
      ],
      "total": 2999.97,
      "itemCount": 3,
      "updatedAt": "2024-01-15T12:00:00Z"
    }
  },
  "message": "Operation successful"
}
```

#### DELETE /cart/items/:itemId
**Description**: Remove item from shopping cart
**Authentication**: JWT required

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Item removed from cart successfully",
    "cart": {
      "id": 1,
      "items": [],
      "total": 0,
      "itemCount": 0,
      "updatedAt": "2024-01-15T12:15:00Z"
    }
  },
  "message": "Operation successful"
}
```

#### DELETE /cart
**Description**: Clear entire shopping cart
**Authentication**: JWT required

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Cart cleared successfully"
  },
  "message": "Operation successful"
}
```

#### GET /cart/validate
**Description**: Validate cart for checkout (stock availability)
**Authentication**: JWT required

**Response**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "cart": {
      "id": 1,
      "items": [...],
      "total": 1999.98
    }
  },
  "message": "Operation successful"
}
```

**Validation Error Response**:
```json
{
  "success": true,
  "data": {
    "valid": false,
    "message": "Insufficient stock for iPhone 15 Pro. Available: 1, Required: 2"
  },
  "message": "Operation successful"
}
```

## 🔒 Security Features

### **Authentication & Authorization**
- JWT tokens with configurable expiration (default: 7 days)
- Role-based access control (USER, ADMIN)
- Protected routes with JwtAuthGuard
- Admin-only endpoints with RolesGuard

### **Input Validation**
- Request body validation using class-validator
- SQL injection prevention via TypeORM
- XSS protection with input sanitization
- File upload validation (when implemented)

### **Rate Limiting** (To be implemented)
- API rate limiting (100 requests/minute/user)
- Login attempt limiting (5 attempts/15 minutes)
- Payment request limiting

### **Error Handling**
- Global error filter with consistent response format
- Proper HTTP status codes
- Error logging for debugging
- User-friendly error messages

## 📡 Response Format

### **Success Response Format**
```json
{
  "success": true,
  "data": { /* actual response data */ },
  "message": "Operation successful"
}
```

### **Error Response Format**
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

## ⚙️ Environment Configuration

### **Required Environment Variables**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=mobiledoor

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🏃‍♂️ Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start:dev

# Build for production
pnpm run build

# Start production server
pnpm run start:prod

# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:cov

# Lint code
pnpm run lint

# Format code
pnpm run format
```

## 📋 Implementation Status

### ✅ **Completed Modules**
- [x] **Project Setup**: NestJS with TypeScript
- [x] **Database**: PostgreSQL with TypeORM
- [x] **Authentication**: JWT with bcrypt
- [x] **User Management**: Registration, login, profile
- [x] **Product Management**: CRUD operations with filtering
- [x] **Cart Management**: Add/update/remove cart items with stock validation
- [x] **Security**: Guards, interceptors, validation
- [x] **Error Handling**: Global error filter

### 🚧 **Pending Modules**
- [ ] **Order Processing**: Create and manage orders
- [ ] **Payment Integration**: Stripe payment processing
- [ ] **Admin Dashboard**: User management, analytics
- [ ] **File Upload**: Product image management
- [ ] **Rate Limiting**: API request throttling
- [ ] **Testing**: Unit and integration tests

### 🔮 **Future Enhancements**
- [ ] **Email Notifications**: Order confirmations
- [ ] **Inventory Management**: Stock alerts
- [ ] **Search Engine**: Advanced product search
- [ ] **Caching**: Redis for performance
- [ ] **Analytics**: Sales and user metrics
- [ ] **API Documentation**: Swagger/OpenAPI

## 🎯 Business Logic Rules

### **Cart Management**
- Maximum 5 items per product per user
- Stock validation before adding to cart
- Automatic cart recalculation on item changes
- Clear cart on successful order creation

### **Order Processing**
- Generate unique order ID (format: MD-YYYYMMDD-XXXXX)
- Calculate order total with 10% tax
- Free shipping on orders over $1000
- Order status workflow: pending → processing → shipped → delivered

### **Stock Management**
- Automatic stock deduction on order placement
- Product availability checking
- Admin notifications for low stock (<10 items)

### **User Roles & Permissions**
- **User**: Browse products, manage cart, place orders, view history
- **Admin**: Full access to products, orders, users, analytics

---

**Note**: This API is built following the patterns from the auth-template boilerplate, ensuring consistency, security, and scalability for the MobileDoor e-commerce platform.

**Next Steps**: Continue implementing Cart and Order modules following the same architecture patterns established in this specification.