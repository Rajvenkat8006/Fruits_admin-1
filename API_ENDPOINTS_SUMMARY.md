# FruitsWeb API Testing - Quick Reference

## 20 Complete API Endpoints to Test

### Group 1: Authentication (1 endpoint)
| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/api/auth/login` | Login & get JWT token + user ID |

### Group 2: Categories (5 endpoints)
| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 2 | GET | `/api/categories` | List all categories |
| 3 | POST | `/api/categories` | Create new category |
| 4 | GET | `/api/categories/[id]` | Get single category |
| 5 | PUT | `/api/categories/[id]` | Update category |
| 6 | DELETE | `/api/categories/[id]` | Delete category |

### Group 3: Products (5 endpoints)
| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 7 | GET | `/api/products` | List all products |
| 8 | POST | `/api/products` | Create new product |
| 9 | GET | `/api/products/[id]` | Get single product |
| 10 | PUT | `/api/products/[id]` | Update product |
| 11 | DELETE | `/api/products/[id]` | Delete product |

### Group 4: Shopping Cart (4 endpoints)
| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 12 | GET | `/api/cart` | Get user's cart items |
| 13 | POST | `/api/cart` | Add item to cart |
| 14 | PUT | `/api/cart/[id]` | Update cart item quantity |
| 15 | DELETE | `/api/cart/[id]` | Remove item from cart |

### Group 5: Watchlist (3 endpoints)
| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 16 | GET | `/api/watchlist` | Get user's watchlist |
| 17 | POST | `/api/watchlist` | Add item to watchlist |
| 18 | DELETE | `/api/watchlist/[id]` | Remove from watchlist |

### Group 6: User Profile (2 endpoints)
| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 19 | GET | `/api/profile` | Get user profile |
| 20 | PUT | `/api/profile` | Update user profile |

---

## Step-by-Step Testing Guide

### Phase 1: Setup & Authentication
```
1. Start server: npm run dev
2. POST /api/auth/login
   - Test with valid credentials
   - Save USER_ID from response
   - Save token for future requests
```

### Phase 2: Category Management
```
3. POST /api/categories - Create test category
   - Save CATEGORY_ID from response
4. GET /api/categories - List all
5. GET /api/categories/[id] - Get single
6. PUT /api/categories/[id] - Update name
7. DELETE /api/categories/[id] - Remove
```

### Phase 3: Product Management
```
8. POST /api/products - Create with CATEGORY_ID
   - Save PRODUCT_ID from response
9. GET /api/products - List all
10. GET /api/products/[id] - Get single
11. PUT /api/products/[id] - Update price
12. DELETE /api/products/[id] - Remove
```

### Phase 4: Shopping Experience
```
13. POST /api/cart - Add PRODUCT_ID with USER_ID
    - Save CART_ITEM_ID
14. GET /api/cart - View cart (with x-user-id header)
15. PUT /api/cart/[id] - Change quantity
16. DELETE /api/cart/[id] - Remove item
```

### Phase 5: Wishlist Features
```
17. POST /api/watchlist - Add PRODUCT_ID with USER_ID
    - Save WATCHLIST_ITEM_ID
18. GET /api/watchlist - View watchlist (with x-user-id header)
19. DELETE /api/watchlist/[id] - Remove item
```

### Phase 6: Account Management
```
20. GET /api/profile - View account (with x-user-id header)
21. PUT /api/profile - Update name/email (with x-user-id header)
```

---

## Required Headers by Endpoint

### No Special Headers
- POST `/api/auth/login`
- GET `/api/categories`
- POST `/api/categories`
- GET `/api/categories/[id]`
- PUT `/api/categories/[id]`
- DELETE `/api/categories/[id]`
- GET `/api/products`
- POST `/api/products`
- GET `/api/products/[id]`
- PUT `/api/products/[id]`
- DELETE `/api/products/[id]`

### Requires `x-user-id` Header
- GET `/api/cart`
- GET `/api/watchlist`
- GET `/api/profile`
- PUT `/api/profile`

### Standard Body Endpoints
- POST `/api/cart` - { userId, productId, quantity }
- POST `/api/watchlist` - { userId, productId }
- PUT `/api/cart/[id]` - { quantity }
- PUT `/api/profile` - { name, email }

---

## Expected Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (missing fields) |
| 401 | Unauthorized (invalid credentials) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Server Error |

---

## Important MongoDB ObjectIds

All IDs in responses are MongoDB ObjectIds:
- Format: 24-character hexadecimal strings
- Example: `507f1f77bcf86cd799439011`

---

## Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import"
3. Upload `FruitsWeb_API_Collection.postman_collection.json`
4. Set variables in Postman environment:
   - BASE_URL: http://localhost:3000
   - USER_ID: (from login response)
   - CATEGORY_ID: (from create category)
   - PRODUCT_ID: (from create product)
   - CART_ITEM_ID: (from add to cart)
   - WATCHLIST_ITEM_ID: (from add to watchlist)

### Run Collection
1. Right-click collection
2. Select "Run collection"
3. Set delay between requests: 100ms
4. Click "Run FruitsWeb API"

---

## Common Test Data

### Login Credentials
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Category Data
```json
{
  "name": "Organic Fruits",
  "slug": "organic-fruits"
}
```

### Product Data
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

### Cart Data
```json
{
  "userId": "507f1f77bcf86cd799439015",
  "productId": "507f1f77bcf86cd799439013",
  "quantity": 3
}
```

### Watchlist Data
```json
{
  "userId": "507f1f77bcf86cd799439015",
  "productId": "507f1f77bcf86cd799439013"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 Not Found | Verify endpoint URL and ID |
| Missing headers | Add required x-user-id header |
| Invalid JSON | Check request body format |
| 500 Error | Check server logs, verify database connection |
| Token expired | Login again to get new token |

---

## All Endpoints Summary

**Total Endpoints: 20**
- Authentication: 1
- Categories: 5
- Products: 5
- Cart: 4
- Watchlist: 3
- Profile: 2

**Total Collections in Postman: 6 main groups**

All endpoints are ready to test! 🚀
