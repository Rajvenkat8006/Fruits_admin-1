# FruitsWeb API - Postman Testing Guide

## Base URL
```
http://localhost:3000
```

## Authentication Headers
For protected endpoints, include:
```
x-user-id: <user-id-from-login>
Authorization: Bearer <jwt-token-from-login>
```

---

## 1. AUTH ENDPOINTS

### 1.1 Login User
**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

---

## 2. CATEGORIES ENDPOINTS

### 2.1 Get All Categories
**GET** `/api/categories`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Fruits",
    "slug": "fruits",
    "createdAt": "2025-12-11T12:00:00Z",
    "updatedAt": "2025-12-11T12:00:00Z",
    "products": []
  }
]
```

### 2.2 Create Category
**POST** `/api/categories`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Organic Fruits",
  "slug": "organic-fruits"
}
```

**Expected Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Organic Fruits",
  "slug": "organic-fruits",
  "createdAt": "2025-12-11T12:05:00Z",
  "updatedAt": "2025-12-11T12:05:00Z"
}
```

### 2.3 Get Single Category
**GET** `/api/categories/507f1f77bcf86cd799439011`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Fruits",
  "slug": "fruits",
  "createdAt": "2025-12-11T12:00:00Z",
  "updatedAt": "2025-12-11T12:00:00Z",
  "products": []
}
```

### 2.4 Update Category
**PUT** `/api/categories/507f1f77bcf86cd799439011`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Fresh Fruits",
  "slug": "fresh-fruits"
}
```

**Expected Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Fresh Fruits",
  "slug": "fresh-fruits",
  "createdAt": "2025-12-11T12:00:00Z",
  "updatedAt": "2025-12-11T12:10:00Z"
}
```

### 2.5 Delete Category
**DELETE** `/api/categories/507f1f77bcf86cd799439011`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true
}
```

---

## 3. PRODUCTS ENDPOINTS

### 3.1 Get All Products
**GET** `/api/products`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "Apple",
    "slug": "apple",
    "description": "Fresh red apples",
    "price": 1.99,
    "image": "https://example.com/apple.jpg",
    "stock": 100,
    "featured": true,
    "categoryId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-12-11T12:00:00Z",
    "updatedAt": "2025-12-11T12:00:00Z"
  }
]
```

### 3.2 Create Product
**POST** `/api/products`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Banana",
  "slug": "banana",
  "description": "Yellow ripe bananas",
  "price": 0.99,
  "image": "https://example.com/banana.jpg",
  "stock": 150,
  "categoryId": "507f1f77bcf86cd799439011"
}
```

**Expected Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "name": "Banana",
  "slug": "banana",
  "description": "Yellow ripe bananas",
  "price": 0.99,
  "image": "https://example.com/banana.jpg",
  "stock": 150,
  "featured": false,
  "categoryId": "507f1f77bcf86cd799439011",
  "createdAt": "2025-12-11T12:05:00Z",
  "updatedAt": "2025-12-11T12:05:00Z"
}
```

### 3.3 Get Single Product
**GET** `/api/products/507f1f77bcf86cd799439013`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Apple",
  "slug": "apple",
  "description": "Fresh red apples",
  "price": 1.99,
  "image": "https://example.com/apple.jpg",
  "stock": 100,
  "featured": true,
  "categoryId": "507f1f77bcf86cd799439011",
  "createdAt": "2025-12-11T12:00:00Z",
  "updatedAt": "2025-12-11T12:00:00Z"
}
```

### 3.4 Update Product
**PUT** `/api/products/507f1f77bcf86cd799439013`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Red Apples",
  "price": 2.49,
  "stock": 80
}
```

**Expected Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Red Apples",
  "slug": "apple",
  "description": "Fresh red apples",
  "price": 2.49,
  "image": "https://example.com/apple.jpg",
  "stock": 80,
  "featured": true,
  "categoryId": "507f1f77bcf86cd799439011",
  "createdAt": "2025-12-11T12:00:00Z",
  "updatedAt": "2025-12-11T12:15:00Z"
}
```

### 3.5 Delete Product
**DELETE** `/api/products/507f1f77bcf86cd799439013`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true
}
```

---

## 4. CART ENDPOINTS

### 4.1 Get Cart Items
**GET** `/api/cart`

**Headers:**
```
Content-Type: application/json
x-user-id: 507f1f77bcf86cd799439015
```

**Expected Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439016",
    "userId": "507f1f77bcf86cd799439015",
    "productId": "507f1f77bcf86cd799439013",
    "quantity": 2,
    "addedAt": "2025-12-11T12:00:00Z",
    "product": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Apple",
      "price": 1.99,
      "image": "https://example.com/apple.jpg"
    }
  }
]
```

### 4.2 Add to Cart
**POST** `/api/cart`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "userId": "507f1f77bcf86cd799439015",
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 3
}
```

**Expected Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439016",
  "userId": "507f1f77bcf86cd799439015",
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 3,
  "addedAt": "2025-12-11T12:20:00Z",
  "product": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Apple",
    "price": 1.99
  }
}
```

### 4.3 Update Cart Item
**PUT** `/api/cart/507f1f77bcf86cd799439016`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "quantity": 5
}
```

**Expected Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439016",
  "userId": "507f1f77bcf86cd799439015",
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 5,
  "addedAt": "2025-12-11T12:20:00Z",
  "product": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Apple",
    "price": 1.99
  }
}
```

### 4.4 Remove from Cart
**DELETE** `/api/cart/507f1f77bcf86cd799439016`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true
}
```

---

## 5. WATCHLIST ENDPOINTS

### 5.1 Get Watchlist
**GET** `/api/watchlist`

**Headers:**
```
Content-Type: application/json
x-user-id: 507f1f77bcf86cd799439015
```

**Expected Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439017",
    "userId": "507f1f77bcf86cd799439015",
    "productId": "507f1f77bcf86cd799439014",
    "addedAt": "2025-12-11T12:00:00Z",
    "product": {
      "id": "507f1f77bcf86cd799439014",
      "name": "Banana",
      "price": 0.99,
      "image": "https://example.com/banana.jpg"
    }
  }
]
```

### 5.2 Add to Watchlist
**POST** `/api/watchlist`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "userId": "507f1f77bcf86cd799439015",
  "productId": "507f1f77bcf86cd799439014"
}
```

**Expected Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439017",
  "userId": "507f1f77bcf86cd799439015",
  "productId": "507f1f77bcf86cd799439014",
  "addedAt": "2025-12-11T12:25:00Z",
  "product": {
    "id": "507f1f77bcf86cd799439014",
    "name": "Banana",
    "price": 0.99
  }
}
```

### 5.3 Remove from Watchlist
**DELETE** `/api/watchlist/507f1f77bcf86cd799439017`

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true
}
```

---

## 6. PROFILE ENDPOINTS

### 6.1 Get User Profile
**GET** `/api/profile`

**Headers:**
```
Content-Type: application/json
x-user-id: 507f1f77bcf86cd799439015
```

**Expected Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2025-12-11T12:00:00Z"
}
```

### 6.2 Update User Profile
**PUT** `/api/profile`

**Headers:**
```
Content-Type: application/json
x-user-id: 507f1f77bcf86cd799439015
```

**Body (JSON):**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Expected Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "USER"
}
```

---

## Testing Flow (Recommended Order)

1. **Login** - Get user ID and token
2. **Create Category** - Get category ID
3. **Create Products** - Add products to the category
4. **Get All Products** - Verify products exist
5. **Add to Cart** - Use user ID from login
6. **Get Cart** - Verify items in cart
7. **Add to Watchlist** - Add products to watchlist
8. **Get Profile** - View user information
9. **Update Profile** - Update user details
10. **Update Cart Item** - Change quantity
11. **Delete Cart Item** - Remove from cart
12. **Delete Watchlist Item** - Remove from watchlist
13. **Update Product** - Modify product details
14. **Delete Product** - Remove product
15. **Delete Category** - Remove category

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

---

## Important Notes

1. **User ID**: Save the `id` from login response
2. **JWT Token**: Use the `token` from login response in Authorization header
3. **ObjectIds**: All IDs are MongoDB ObjectIds (24 character hex strings)
4. **Prices**: Use Float values (e.g., 1.99, 2.50)
5. **Stock**: Use integers (e.g., 100, 150)
6. **Headers**: Always include `Content-Type: application/json`
7. **Protected Routes**: Cart, Watchlist, Profile require `x-user-id` header

---

## Environment Variables for Testing
```
BASE_URL=http://localhost:3000
USER_ID=<from-login-response>
AUTH_TOKEN=<from-login-response>
CATEGORY_ID=<from-create-category>
PRODUCT_ID=<from-create-product>
CART_ITEM_ID=<from-add-to-cart>
WATCHLIST_ITEM_ID=<from-add-to-watchlist>
```
