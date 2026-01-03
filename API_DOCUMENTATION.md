# API Documentation

This document outlines the available API endpoints for the application, including request methods, parameters, and response structures.

## 🔐 Authentication (`/api/auth/*`)

### Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token...",
    "user": { "id": "...", "email": "...", "name": "..." },
    "message": "Login successful"
  }
  ```

### Register
- **Endpoint**: `POST /api/auth/register`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**: Authenticated user object.

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Logs out the user by clearing the HTTP-only cookie.

### Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Description**: Checks session validity. Returns payload if valid.

---

## 👤 User Routes

### Profile (`/api/profile`)
- **GET**: Fetch current user profile.
- **PUT**: Update profile.
  ```json
  { "name": "New Name", "email": "new@email.com" }
  ```

### Cart (`/api/cart`)
- **GET**: Fetch cart items (includes product details).
- **POST**: Add/Update item in cart.
  ```json
  { "productId": "...", "quantity": 1 }
  ```

### Watchlist (`/api/watchlist`)
- **GET**: Fetch watchlist items (includes product details).
- **POST**: Add item to watchlist.
  ```json
  { "productId": "..." }
  ```

### Orders (`/api/orders`)
- **GET All**: Fetch all orders for the logged-in user.
- **GET One**: `GET /api/orders/[id]`
  - Returns order details including items and product info.
  - *Note*: Currently strictly checks `userId`.
- **POST (Place Order)**:
  - **Body**:
    ```json
    {
      "couponCode": "OPTIONAL_CODE",
      "shippingAddress": {
        "name": "...", "street": "...", "city": "...", "zip": "...", "country": "...", "phone": "..."
      },
      "paymentMethod": "CARD"
    }
    ```
  - **Logic**: Validates stock, applies coupon, decrements stock, creates order.

### Reviews (`/api/reviews`)
- **POST**: Create a review.
  ```json
  { "productId": "...", "rating": 5, "comment": "..." }
  ```
- **GET**: Fetch reviews (usually filtered by product via query params if implemented, or fetches all).

### Review Likes (`/api/reviews/[id]/like`)
- **POST**: Like a review.
- **DELETE**: Unlike a review.

### Coupons (`/api/coupons`)
- **POST /verify**: Check if a coupon is valid.
  ```json
  { "code": "SUMMER", "cartTotal": 100 }
  ```

---

## 🛡️ Admin Routes (`/api/admin/*`)

> **Requirement**: Admin privileges (verified via Token/middleware).

### Dashboard
- **GET /api/admin**: Returns statistics (totalUsers, totalOrders, totalProducts, totalCategories).

### Banners (`/api/admin/banners`)
- **GET**: List all banners.
- **POST**: Create a banner.
  ```json
  {
    "title": "Promo",
    "image": "url",
    "link": "/products/1",
    "position": 0,
    "isActive": true,
    "startDate": "2024-01-01",
    "endDate": "2024-02-01"
  }
  ```

### Products (`/api/admin/products`)
- **GET**: List all products.
- **POST**: Create product.
  ```json
  { "name": "...", "price": 10, "stock": 100, "categoryId": "...", "image": "...", "description": "..." }
  ```
- **PATCH / [id]**: Update product.
- **DELETE / [id]**: Delete product.

### Users (`/api/admin/users`)
- **GET**: List all users.

### Orders (`/api/admin/orders`)
- **GET**: List all orders (includes User, Items, Payment, Shipping, Coupon details).
- **PATCH**: Update order status.
  ```json
  { "id": "orderId", "status": "DELIVERED" }
  ```

### Categories (`/api/admin/categories`)
- **GET**: List categories.
- **POST**: Create category.

### Coupons (`/api/admin/coupons`)
- **GET**: List coupons.
- **POST**: Create coupon.
