# API ENDPOINTS - Updated with Registration

## All 26 API Endpoints (Added Banners)

### 1. AUTH ENDPOINTS (2)

#### 1.1 Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}

Response (201):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "message": "Registration successful"
}

Error (400):
- Missing required fields
- Password must be at least 6 characters

Error (409):
- Email already registered

Error (500):
- Registration failed
```

#### 1.2 Login User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}

Error (400):
- Missing fields

Error (401):
- Invalid credentials

Error (500):
- Login failed
```

---

### 2. CATEGORY ENDPOINTS (5)

#### 2.1 Get All Categories
```
GET /api/categories

Response (200):
[
  {
    "id": "cat-uuid-1",
    "name": "Organic Fruits",
    "slug": "organic-fruits"
  },
  {
    "id": "cat-uuid-2",
    "name": "Tropical Fruits",
    "slug": "tropical-fruits"
  }
]
```

#### 2.2 Create Category
```
POST /api/categories
Content-Type: application/json

Request Body:
{
  "name": "Organic Fruits",
  "slug": "organic-fruits"
}

Response (201):
{
  "id": "cat-uuid",
  "name": "Organic Fruits",
  "slug": "organic-fruits"
}
```

#### 2.3 Get Single Category
```
GET /api/categories/{categoryId}

Response (200):
{
  "id": "cat-uuid",
  "name": "Organic Fruits",
  "slug": "organic-fruits",
  "products": []
}
```

#### 2.4 Update Category
```
PUT /api/categories/{categoryId}
Content-Type: application/json

Request Body:
{
  "name": "Fresh Organic Fruits",
  "slug": "fresh-organic-fruits"
}

Response (200):
{
  "id": "cat-uuid",
  "name": "Fresh Organic Fruits",
  "slug": "fresh-organic-fruits"
}
```

#### 2.5 Delete Category
```
DELETE /api/categories/{categoryId}

Response (204): No Content
```

---

### 3. PRODUCT ENDPOINTS (5)

#### 3.1 Get All Products
```
GET /api/products

Response (200):
[
  {
    "id": "prod-uuid-1",
    "name": "Banana",
    "price": 0.99,
    "image": "https://...",
    "stock": 150,
    "category": { "id": "cat-uuid", "name": "Fruits" }
  }
]
```

#### 3.2 Create Product
```
POST /api/products
Content-Type: application/json

Request Body:
{
  "name": "Banana",
  "slug": "banana",
  "description": "Yellow ripe bananas",
  "price": 0.99,
  "image": "https://example.com/banana.jpg",
  "stock": 150,
  "categoryId": "cat-uuid"
}

Response (201):
{
  "id": "prod-uuid",
  "name": "Banana",
  "slug": "banana",
  "description": "Yellow ripe bananas",
  "price": 0.99,
  "image": "https://example.com/banana.jpg",
  "stock": 150,
  "categoryId": "cat-uuid"
}
```

#### 3.3 Get Single Product
```
GET /api/products/{productId}

Response (200):
{
  "id": "prod-uuid",
  "name": "Banana",
  "slug": "banana",
  "description": "Yellow ripe bananas",
  "price": 0.99,
  "image": "https://example.com/banana.jpg",
  "stock": 150,
  "category": { "id": "cat-uuid", "name": "Fruits" }
}
```

#### 3.4 Update Product
```
PUT /api/products/{productId}
Content-Type: application/json

Request Body:
{
  "name": "Premium Banana",
  "price": 1.49,
  "stock": 120
}

Response (200):
{
  "id": "prod-uuid",
  "name": "Premium Banana",
  "price": 1.49,
  "stock": 120
}
```

#### 3.5 Delete Product
```
DELETE /api/products/{productId}

Response (204): No Content
```

---

### 4. CART ENDPOINTS (4)

#### 4.1 Get Cart Items
```
GET /api/cart
Headers:
- x-user-id: {userId}

Response (200):
[
  {
    "id": "cart-uuid",
    "userId": "user-uuid",
    "productId": "prod-uuid",
    "quantity": 3,
    "product": {
      "id": "prod-uuid",
      "name": "Banana",
      "price": 0.99
    }
  }
]
```

#### 4.2 Add to Cart
```
POST /api/cart
Content-Type: application/json

Request Body:
{
  "userId": "user-uuid",
  "productId": "prod-uuid",
  "quantity": 3
}

Response (201):
{
  "id": "cart-uuid",
  "userId": "user-uuid",
  "productId": "prod-uuid",
  "quantity": 3
}
```

#### 4.3 Update Cart Item
```
PUT /api/cart/{cartItemId}
Content-Type: application/json

Request Body:
{
  "quantity": 5
}

Response (200):
{
  "id": "cart-uuid",
  "quantity": 5
}
```

#### 4.4 Remove from Cart
```
DELETE /api/cart/{cartItemId}

Response (204): No Content
```

---

### 5. WATCHLIST ENDPOINTS (3)

#### 5.1 Get Watchlist
```
GET /api/watchlist
Headers:
- x-user-id: {userId}

Response (200):
[
  {
    "id": "watchlist-uuid",
    "userId": "user-uuid",
    "productId": "prod-uuid",
    "product": {
      "id": "prod-uuid",
      "name": "Banana",
      "price": 0.99
    }
  }
]
```

#### 5.2 Add to Watchlist
```
POST /api/watchlist
Content-Type: application/json

Request Body:
{
  "userId": "user-uuid",
  "productId": "prod-uuid"
}

Response (201):
{
  "id": "watchlist-uuid",
  "userId": "user-uuid",
  "productId": "prod-uuid"
}
```

#### 5.3 Remove from Watchlist
```
DELETE /api/watchlist/{watchlistId}

Response (204): No Content
```

---

### 6. PROFILE ENDPOINTS (2)

#### 6.1 Get User Profile
```
GET /api/profile
Headers:
- x-user-id: {userId}

Response (200):
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### 6.2 Update User Profile
```
PUT /api/profile
Headers:
- x-user-id: {userId}
Content-Type: application/json

Request Body:
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

Response (200):
{
  "id": "user-uuid",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "role": "USER"
}
```

---

### 7. BANNER ENDPOINTS (5)

#### 7.1 Get All Banners
```
GET /api/admin/banners

Response (200):
[
  {
    "id": "banner-uuid",
    "title": "Summer Sale",
    "image": "https://example.com/banner.jpg",
    "link": "/products/sale",
    "position": 0,
    "isActive": true,
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-08-31T23:59:59.999Z"
  }
]
```

#### 7.2 Create Banner
```
POST /api/admin/banners
Content-Type: application/json

Request Body:
{
  "title": "Summer Sale",
  "image": "https://example.com/banner.jpg",
  "link": "/products/sale",
  "position": 0,
  "isActive": true,
  "startDate": "2023-06-01",
  "endDate": "2023-08-31"
}

Response (201):
{
  "id": "banner-uuid",
  "title": "Summer Sale",
  "image": "https://example.com/banner.jpg",
  "link": "/products/sale",
  "position": 0,
  "isActive": true,
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-08-31T00:00:00.000Z",
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### 7.3 Get Single Banner
```
GET /api/admin/banners/{id}

Response (200):
{
  "id": "banner-uuid",
  "title": "Summer Sale",
  "image": "https://example.com/banner.jpg",
  "link": "/products/sale",
  "position": 0,
  "isActive": true,
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-08-31T00:00:00.000Z"
}
```

#### 7.4 Update Banner
```
PUT /api/admin/banners/{id}
Content-Type: application/json

Request Body:
{
  "title": "Winter Sale",
  "isActive": false
}

Response (200):
{
  "id": "banner-uuid",
  "title": "Winter Sale",
  "image": "https://example.com/banner.jpg",
  "link": "/products/sale",
  "position": 0,
  "isActive": false,
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-08-31T00:00:00.000Z"
}
```

#### 7.5 Delete Banner
```
DELETE /api/admin/banners/{id}

Response (200):
{
  "message": "Banner deleted successfully"
}
```

---

## Pages Created

### Authentication Pages
- `/login` - Login page (POST to /api/auth/login)
- `/register` - Registration page (POST to /api/auth/register)

### Admin Pages
- `/admin` - Admin dashboard with stats and management links
- `/admin/users` - User management (link available)
- `/admin/products` - Product management (link available)
- `/admin/categories` - Category management (link available)
- `/admin/orders` - Order management (link available)

---

## Testing Flow

1. **Register New User**
   - POST `/api/auth/register`
   - Save token and userId

2. **Login**
   - POST `/api/auth/login`
   - Verify token matches

3. **Category Operations**
   - GET all categories
   - Create new category
   - Get single category
   - Update category
   - Delete category

4. **Product Operations**
   - GET all products
   - Create new product
   - Get single product
   - Update product
   - Delete product

5. **Cart Operations**
   - GET user cart
   - Add product to cart
   - Update cart quantity
   - Remove from cart

6. **Watchlist Operations**
   - GET user watchlist
   - Add product to watchlist
   - Remove from watchlist

7. **Profile Operations**
   - GET user profile
   - Update profile

8. **Banner Operations**
   - GET all banners
   - Create new banner
   - Get single banner
   - Update banner
   - Delete banner

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Email already registered |
| 500 | Server Error - Internal error |

---

## Total Endpoints: 26
- Auth: 2
- Categories: 5
- Products: 5
- Cart: 4
- Watchlist: 3
- Profile: 2
- Banners: 5
