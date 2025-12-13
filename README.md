# FruitsWeb E-commerce Platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation
```bash
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

Visit `http://localhost:3000`

## 📋 API Endpoints

### Categories
- `GET /api/categories` - List all
- `POST /api/categories` - Create
- `GET /api/categories/[id]` - Get one
- `PUT /api/categories/[id]` - Update
- `DELETE /api/categories/[id]` - Delete

### Products
- `GET /api/products` - List all
- `POST /api/products` - Create
- `GET /api/products/[id]` - Get one
- `PUT /api/products/[id]` - Update
- `DELETE /api/products/[id]` - Delete

### Cart
- `GET /api/cart` - Get cart (requires x-user-id header)
- `POST /api/cart` - Add item
- `PUT /api/cart/[id]` - Update item
- `DELETE /api/cart/[id]` - Remove item

### Watchlist
- `GET /api/watchlist` - Get watchlist (requires x-user-id header)
- `POST /api/watchlist` - Add item
- `DELETE /api/watchlist/[id]` - Remove item

### Profile
- `GET /api/profile` - Get profile (requires x-user-id header)
- `PUT /api/profile` - Update profile (requires x-user-id header)

### Auth
- `POST /api/auth/login` - Login with email/password

## 🗄️ Database Models

- **User** - Users with roles (ADMIN, USER)
- **Category** - Product categories
- **Product** - Products with pricing
- **Cart** - Shopping cart items
- **Watchlist** - Saved items
- **Order** - Order history
- **OrderItem** - Items in orders

## 📦 Tech Stack

- Next.js 14
- Prisma ORM
- PostgreSQL
- TypeScript
- Tailwind CSS
- JWT Authentication
