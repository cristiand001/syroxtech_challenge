# Ecommerce Admin Panel — Backend

NestJS + Prisma + PostgreSQL backend for an Ecommerce Admin Panel.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit DATABASE_URL in .env

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Generate Prisma client
npx prisma generate

# 5. Start in dev mode
npm run start:dev
```

---

## Folder Structure

```
src/
├── main.ts                        # Bootstrap
├── app.module.ts                  # Root module
│
├── prisma/
│   ├── prisma.service.ts          # PrismaClient singleton
│   └── prisma.module.ts           # Global module
│
├── auth/
│   ├── dto/login.dto.ts
│   ├── guards/jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
│
├── categories/
│   ├── dto/create-category.dto.ts
│   ├── dto/update-category.dto.ts
│   ├── categories.service.ts
│   ├── categories.controller.ts
│   └── categories.module.ts
│
├── products/
│   ├── dto/create-product.dto.ts
│   ├── dto/update-product.dto.ts
│   ├── products.service.ts
│   ├── products.controller.ts
│   └── products.module.ts
│
└── sales/
    ├── dto/create-sale.dto.ts
    ├── sales.service.ts
    ├── sales.controller.ts
    └── sales.module.ts

prisma/
└── schema.prisma
```

---

## API Endpoints

### Auth
| Method | Endpoint       | Protected | Description        |
|--------|----------------|-----------|--------------------|
| POST   | /auth/login    | ❌        | Login, get JWT     |

**Login body:**
```json
{
  "email": "admin@test.com",
  "password": "1234"
}
```
**Response:**
```json
{ "access_token": "eyJhbG..." }
```

---

### Categories
All routes require `Authorization: Bearer <token>`

| Method | Endpoint           | Description           |
|--------|--------------------|-----------------------|
| POST   | /categories        | Create category       |
| GET    | /categories        | List all categories   |
| GET    | /categories/:id    | Get category by ID    |
| PUT    | /categories/:id    | Update category       |
| DELETE | /categories/:id    | Delete category       |

**Create body:**
```json
{ "name": "Electronics" }
```

---

### Products
All routes require `Authorization: Bearer <token>`

| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| POST   | /products       | Create product      |
| GET    | /products       | List all products   |
| GET    | /products/:id   | Get product by ID   |
| PUT    | /products/:id   | Update product      |
| DELETE | /products/:id   | Delete product      |

**Create body:**
```json
{
  "name": "Laptop Pro",
  "price": 1299.99,
  "categoryId": 1
}
```

---

### Sales
All routes require `Authorization: Bearer <token>`

| Method | Endpoint      | Description        |
|--------|---------------|--------------------|
| POST   | /sales        | Create a sale      |
| GET    | /sales        | List all sales     |
| GET    | /sales/:id    | Get sale by ID     |

**Create body:**
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```
> The `total` is **auto-calculated** from product prices × quantities.

---

## Notes

- JWT expires in **24 hours**
- All routes (except `/auth/login`) are protected with `JwtAuthGuard`
- Prisma transactions are used when creating sales to ensure data consistency
- `PrismaModule` is `@Global()`, so `PrismaService` is available in all modules without re-importing
