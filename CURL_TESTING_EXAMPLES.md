# FruitsWeb API - cURL Testing Examples

All endpoints with complete curl commands for testing in terminal/command line.

## Setup Variables
```bash
BASE_URL="http://localhost:3000"
USER_ID="your-user-id-from-login"
AUTH_TOKEN="your-jwt-token-from-login"
CATEGORY_ID="category-id-from-create"
PRODUCT_ID="product-id-from-create"
CART_ITEM_ID="cart-item-id-from-add-to-cart"
WATCHLIST_ITEM_ID="watchlist-id-from-add-to-watchlist"
```

---

## 1. AUTHENTICATION

### Login User
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Save from response:**
- `id` → use as USER_ID
- `token` → use as AUTH_TOKEN

---

## 2. CATEGORIES (5 endpoints)

### 2.1 Get All Categories
```bash
curl -X GET "http://localhost:3000/api/categories" \
  -H "Content-Type: application/json"
```

### 2.2 Create Category
```bash
curl -X POST "http://localhost:3000/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Fruits",
    "slug": "organic-fruits"
  }'
```

**Save `id` from response as CATEGORY_ID**

### 2.3 Get Single Category
```bash
curl -X GET "http://localhost:3000/api/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json"
```

### 2.4 Update Category
```bash
curl -X PUT "http://localhost:3000/api/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Fruits",
    "slug": "fresh-fruits"
  }'
```

### 2.5 Delete Category
```bash
curl -X DELETE "http://localhost:3000/api/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json"
```

---

## 3. PRODUCTS (5 endpoints)

### 3.1 Get All Products
```bash
curl -X GET "http://localhost:3000/api/products" \
  -H "Content-Type: application/json"
```

### 3.2 Create Product
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Banana",
    "slug": "banana",
    "description": "Yellow ripe bananas",
    "price": 0.99,
    "image": "https://example.com/banana.jpg",
    "stock": 150,
    "categoryId": "'$CATEGORY_ID'"
  }'
```

**Save `id` from response as PRODUCT_ID**

### 3.3 Get Single Product
```bash
curl -X GET "http://localhost:3000/api/products/$PRODUCT_ID" \
  -H "Content-Type: application/json"
```

### 3.4 Update Product
```bash
curl -X PUT "http://localhost:3000/api/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Banana",
    "price": 1.49,
    "stock": 120
  }'
```

### 3.5 Delete Product
```bash
curl -X DELETE "http://localhost:3000/api/products/$PRODUCT_ID" \
  -H "Content-Type: application/json"
```

---

## 4. CART (4 endpoints)

### 4.1 Get Cart Items
```bash
curl -X GET "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID"
```

### 4.2 Add to Cart
```bash
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "productId": "'$PRODUCT_ID'",
    "quantity": 3
  }'
```

**Save `id` from response as CART_ITEM_ID**

### 4.3 Update Cart Item
```bash
curl -X PUT "http://localhost:3000/api/cart/$CART_ITEM_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

### 4.4 Remove from Cart
```bash
curl -X DELETE "http://localhost:3000/api/cart/$CART_ITEM_ID" \
  -H "Content-Type: application/json"
```

---

## 5. WATCHLIST (3 endpoints)

### 5.1 Get Watchlist
```bash
curl -X GET "http://localhost:3000/api/watchlist" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID"
```

### 5.2 Add to Watchlist
```bash
curl -X POST "http://localhost:3000/api/watchlist" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "productId": "'$PRODUCT_ID'"
  }'
```

**Save `id` from response as WATCHLIST_ITEM_ID**

### 5.3 Remove from Watchlist
```bash
curl -X DELETE "http://localhost:3000/api/watchlist/$WATCHLIST_ITEM_ID" \
  -H "Content-Type: application/json"
```

---

## 6. PROFILE (2 endpoints)

### 6.1 Get User Profile
```bash
curl -X GET "http://localhost:3000/api/profile" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID"
```

### 6.2 Update User Profile
```bash
curl -X PUT "http://localhost:3000/api/profile" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com"
  }'
```

---

## Complete Testing Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "========== AUTHENTICATION =========="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }')
echo "Login Response: $LOGIN_RESPONSE"

USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "USER_ID: $USER_ID"

echo -e "\n========== CATEGORIES =========="
echo "Creating category..."
CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Fruits",
    "slug": "organic-fruits"
  }')
echo "Category Response: $CATEGORY_RESPONSE"

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "CATEGORY_ID: $CATEGORY_ID"

echo -e "\n========== PRODUCTS =========="
echo "Creating product..."
PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Banana",
    "slug": "banana",
    "description": "Yellow ripe bananas",
    "price": 0.99,
    "image": "https://example.com/banana.jpg",
    "stock": 150,
    "categoryId": "'$CATEGORY_ID'"
  }')
echo "Product Response: $PRODUCT_RESPONSE"

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "PRODUCT_ID: $PRODUCT_ID"

echo -e "\n========== CART =========="
echo "Adding to cart..."
CART_RESPONSE=$(curl -s -X POST "$BASE_URL/api/cart" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "productId": "'$PRODUCT_ID'",
    "quantity": 3
  }')
echo "Cart Response: $CART_RESPONSE"

CART_ITEM_ID=$(echo $CART_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "CART_ITEM_ID: $CART_ITEM_ID"

echo -e "\n========== WATCHLIST =========="
echo "Adding to watchlist..."
WATCHLIST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/watchlist" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "productId": "'$PRODUCT_ID'"
  }')
echo "Watchlist Response: $WATCHLIST_RESPONSE"

echo -e "\n========== PROFILE =========="
echo "Getting profile..."
curl -s -X GET "$BASE_URL/api/profile" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" | jq '.'

echo -e "\n========== ALL TESTS COMPLETE =========="
```

Run the script:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Windows PowerShell Script

Save as `test-api.ps1`:

```powershell
$BASE_URL = "http://localhost:3000"

Write-Host "========== AUTHENTICATION ==========" -ForegroundColor Green
$loginResponse = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"user@example.com","password":"password123"}' | ConvertFrom-Json

$USER_ID = $loginResponse.user.id
Write-Host "USER_ID: $USER_ID"

Write-Host "`n========== CATEGORIES ==========" -ForegroundColor Green
$categoryResponse = Invoke-WebRequest -Uri "$BASE_URL/api/categories" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Organic Fruits","slug":"organic-fruits"}' | ConvertFrom-Json

$CATEGORY_ID = $categoryResponse.id
Write-Host "CATEGORY_ID: $CATEGORY_ID"

Write-Host "`n========== PRODUCTS ==========" -ForegroundColor Green
$productResponse = Invoke-WebRequest -Uri "$BASE_URL/api/products" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body "{`"name`":`"Banana`",`"slug`":`"banana`",`"description`":`"Yellow ripe bananas`",`"price`":0.99,`"image`":`"https://example.com/banana.jpg`",`"stock`":150,`"categoryId`":`"$CATEGORY_ID`"}" | ConvertFrom-Json

$PRODUCT_ID = $productResponse.id
Write-Host "PRODUCT_ID: $PRODUCT_ID"

Write-Host "`n========== CART ==========" -ForegroundColor Green
$cartResponse = Invoke-WebRequest -Uri "$BASE_URL/api/cart" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body "{`"userId`":`"$USER_ID`",`"productId`":`"$PRODUCT_ID`",`"quantity`":3}" | ConvertFrom-Json

$CART_ITEM_ID = $cartResponse.id
Write-Host "CART_ITEM_ID: $CART_ITEM_ID"

Write-Host "`n========== WATCHLIST ==========" -ForegroundColor Green
$watchlistResponse = Invoke-WebRequest -Uri "$BASE_URL/api/watchlist" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body "{`"userId`":`"$USER_ID`",`"productId`":`"$PRODUCT_ID`"}" | ConvertFrom-Json

Write-Host "Watchlist Item Created"

Write-Host "`n========== PROFILE ==========" -ForegroundColor Green
$profileResponse = Invoke-WebRequest -Uri "$BASE_URL/api/profile" `
  -Method GET `
  -Headers @{"Content-Type"="application/json"; "x-user-id"="$USER_ID"} | ConvertFrom-Json

Write-Host "Profile: $($profileResponse | ConvertTo-Json)"

Write-Host "`n========== ALL TESTS COMPLETE ==========" -ForegroundColor Green
```

Run the script:
```powershell
.\test-api.ps1
```

---

## Quick Test Checklist

- [ ] Login and get USER_ID
- [ ] Create category
- [ ] Get all categories
- [ ] Get single category
- [ ] Update category
- [ ] Delete category
- [ ] Create product
- [ ] Get all products
- [ ] Get single product
- [ ] Update product
- [ ] Delete product
- [ ] Add to cart
- [ ] Get cart items
- [ ] Update cart item
- [ ] Delete cart item
- [ ] Add to watchlist
- [ ] Get watchlist
- [ ] Delete watchlist item
- [ ] Get profile
- [ ] Update profile

✅ All 20 endpoints tested!
