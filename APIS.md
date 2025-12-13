# 📡 Fruitify Admin API Documentation

Base URL: `http://localhost:3000/api`

## 🔐 Authentication

### Login
- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "admin@fruitify.com",
    "password": "yourpassword"
  }
  ```
- **Response**: Sets `httpOnly` cookie `token` and returns user data.
- **Note**: Triggers Admin flag for specific emails.

### Register
- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **Body**: `name`, `email`, `password`

### Logout
- **Endpoint**: `/auth/logout`
- **Method**: `POST`
- **Description**: Clears the session cookie.

### Get Current User (Me)
- **Endpoint**: `/auth/me`
- **Method**: `GET`
- **Description**: Verifies session cookie and returns user details.

---

## 📊 Admin Dashboard

### Dashboard Stats
- **Endpoint**: `/admin`
- **Method**: `GET`
- **Description**: Returns counts for Users, Products, Categories, and Orders.
- **Access**: Admin only (Middleware protected).

---

## 👥 User Management

### List Users
- **Endpoint**: `/admin/users`
- **Method**: `GET`

### Get User Details
- **Endpoint**: `/admin/users/[id]`
- **Method**: `GET`

### Delete User
- **Endpoint**: `/admin/users/[id]`
- **Method**: `DELETE`

---

## 📦 Product Management

### List Products
- **Endpoint**: `/admin/products`
- **Method**: `GET`

### Create Product
- **Endpoint**: `/admin/products`
- **Method**: `POST`
- **Body**: `name`, `price`, `description`, `stock`, `categoryId`

### Get/Update/Delete Product
- **Endpoint**: `/admin/products/[id]`
- **Method**: `GET` | `PUT` | `DELETE`

---

## 🏷️ Category Management

### List Categories
- **Endpoint**: `/admin/categories`
- **Method**: `GET`

### Create Category
- **Endpoint**: `/admin/categories`
- **Method**: `POST`

### Get/Update/Delete Category
- **Endpoint**: `/admin/categories/[id]`
- **Method**: `GET` | `PUT` | `DELETE`

---

## 🛒 Order Management

### List Orders
- **Endpoint**: `/admin/orders`
- **Method**: `GET`

### Update Order Status
- **Endpoint**: `/admin/orders` (Likely intended for `[id]`, verify implementation)
- **Method**: `PUT` (Check specific implementation)

---

## 🛡️ Response Format
All API responses follow this structure:
```json
// Success
{
  "success": true, // Optional
  "data": { ... }  // Or direct array/object
}

// Error
{
  "error": "Error message description"
}
```
