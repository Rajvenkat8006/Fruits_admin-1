# Fruits Platform — API Integration Guide

Base URL (local): `http://localhost:3000`

Auth header (mobile apps):

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Admin web also uses the `token` httpOnly cookie set by login.

---

## 1. Roles

| Role | App | Access |
|------|-----|--------|
| `SUPER_ADMIN` | Admin web (`/admin`) | Full platform |
| `SUB_ADMIN` | Admin web (`/admin`) | Own shop only |
| `USER` | Customer mobile app | Nearby shops, cart, own orders |
| `DELIVERY_BOY` | Delivery mobile app | Assigned orders only |

Public register always creates `USER`. Sub-admins and delivery boys are created by admin APIs.

### Seeded Super Admin

Credentials are set in `.env` (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`) and written to MongoDB by:

```bash
npm run db:seed
```

Default example (change in `.env` as needed):

```text
Email: admin@gmail.com
Password: 123456
```

Login uses the **database** user only — not `.env` at runtime. Sub-admins are created from the admin UI after Super Admin login.

---

## 2. Auth

### POST `/api/auth/login`

```json
{ "email": "user@example.com", "password": "secret" }
```

**Success**

```json
{
  "token": "<jwt>",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "USER",
    "shopId": null
  },
  "message": "Login successful"
}
```

JWT payload: `{ userId, role, shopId }`.

**Mobile redirect rule**

- User app: accept only `role === "USER"`; otherwise logout.
- Delivery app: accept only `role === "DELIVERY_BOY"`; otherwise logout.
- Admin web: accept only `SUPER_ADMIN` | `SUB_ADMIN`.

### POST `/api/auth/register`

Creates `USER` only.

```json
{ "name": "Venkat", "email": "v@example.com", "password": "secret1" }
```

### GET `/api/auth/me`

Returns `{ authenticated, user }` including `role`, `shopId`, `shop`.

### POST `/api/auth/logout`

Clears cookie.

---

## 3. USER mobile APIs

### GET `/api/shops/nearby?lat=&lng=&radiusKm=20`

Returns active shops sorted by distance (`distanceKm`).

### GET `/api/shops/:id/products`

Shop catalog from `ShopProduct` (price/stock per shop).

```json
{
  "shop": { "id": "...", "name": "..." },
  "products": [
    {
      "shopProductId": "...",
      "productId": "...",
      "name": "Apple",
      "price": 180,
      "stock": 50,
      "imageUrl": "..."
    }
  ]
}
```

### Cart

| Method | Path | Body |
|--------|------|------|
| GET | `/api/cart` | — |
| POST | `/api/cart` | `{ productId, shopId, quantity, shopProductId? }` |
| PATCH | `/api/cart/:id` | `{ quantity }` |
| DELETE | `/api/cart/:id` | — |
| DELETE | `/api/cart` | Clear all |

**Rule:** one shop per cart. Mixing shops returns `409`.

### Orders

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/orders` | Place order from cart |
| GET | `/api/orders` | My orders |
| GET | `/api/orders/:id` | Track one order |
| PATCH | `/api/orders/:id` | `{ "status": "CANCELLED" }` if PENDING/CONFIRMED |

**POST `/api/orders` body**

```json
{
  "shopId": "<optional if cart already has shop>",
  "couponCode": "OPTIONAL",
  "paymentMethod": "COD",
  "shippingAddress": {
    "name": "Venkat",
    "street": "...",
    "city": "...",
    "state": "...",
    "zip": "...",
    "country": "IN",
    "phone": "..."
  }
}
```

Stock is decremented on `ShopProduct`. Order stores `shopId`.

### Profile

| Method | Path |
|--------|------|
| GET | `/api/profile` |
| PUT / PATCH | `/api/profile` | `{ name?, email? }` or multipart with `profilePic` |

---

## 4. DELIVERY_BOY mobile APIs

### GET `/api/delivery/me`

Profile + assigned shop.

### GET `/api/delivery/orders?status=active|completed|<OrderStatus>`

Only orders where `deliveryBoyId === me`.

### GET `/api/delivery/orders/:id`

Detail if assigned to me.

### PATCH `/api/delivery/orders/:id/status`

```json
{ "status": "PICKED_UP" }
```

Allowed transitions:

```text
ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

Any other transition → `400`.

---

## 5. Admin APIs (web)

All require `SUPER_ADMIN` or `SUB_ADMIN` unless noted.

| Area | Paths | Super | Sub |
|------|-------|:-----:|:---:|
| Dashboard | `GET /api/admin/dashboard` | Platform | Own shop |
| Shops | `/api/admin/shops` | CRUD | 403 |
| Sub-admins | `/api/admin/sub-admins` | CRUD | 403 |
| Users | `/api/admin/users` | List/block | 403 |
| Delivery boys | `/api/admin/delivery-boys` | All shops | Own shop |
| Categories | `GET/POST/PUT/DELETE /api/admin/categories` | CRUD + icon upload | **GET only** (select when adding products) |
| Products (master) | `/api/admin/products` | CRUD | Read + create |
| Shop stock | `/api/admin/shop-products` | Filter any | Own shop |
| Orders | `GET/PATCH /api/admin/orders` | All | Own shop |
| Assign delivery | `POST /api/admin/orders/:id/assign` | Yes | Own shop |

### Categories with icons

Platform-level fruit categories (like circular home chips in a mobile app).

- **Super Admin** creates categories with an icon image (`multipart/form-data`: `name` + `icon` file).
- Icon is stored on `Category.icon` (e.g. `/uploads/...`) and returned in list APIs.
- **Sub Admin** cannot create/edit/delete categories — they **select** `categoryId` when creating products.
- Mobile apps can render `GET /api/admin/categories` (or a future public list) using `icon` + `name` as circular chips.

```http
POST /api/admin/categories
Authorization: Bearer <super-admin-token>
Content-Type: multipart/form-data

name=Apples
icon=<image file>
```

```json
{
  "id": "...",
  "name": "Apples",
  "slug": "apples",
  "icon": "/uploads/uuid-apples.png"
}
```

Assign body:

```json
{ "deliveryBoyId": "<userId with role DELIVERY_BOY>" }
```

Sets `deliveryBoyId` and status `ASSIGNED`.

---

## 6. Order status machine

```text
PENDING
  → CONFIRMED
  → PREPARING
  → READY
  → ASSIGNED          (admin assigns delivery boy)
  → PICKED_UP         (delivery app)
  → OUT_FOR_DELIVERY  (delivery app)
  → DELIVERED         (delivery app)

Also: CANCELLED (user early / admin), plus legacy PAID/FULFILLED/PROCESSING/REFUNDED
```

---

## 7. Error codes

| Code | Meaning |
|------|---------|
| 401 | Missing/invalid token |
| 403 | Wrong role or shop scope |
| 404 | Resource not found |
| 409 | Conflict (email taken, mixed-shop cart) |
| 400 | Validation / invalid status transition |

Response shape:

```json
{ "error": "Forbidden" }
```

---

## 8. Suggested mobile folder layout (separate repos)

```text
fruits-user/          # Expo — role USER only
fruits-delivery/      # Expo — role DELIVERY_BOY only
```

### Integration checklist

1. Point `API_BASE_URL` at this Next.js server.
2. Login → store JWT in SecureStore.
3. Reject wrong role immediately after login.
4. Send `Authorization: Bearer` on every request.
5. On app launch call `GET /api/auth/me`.
6. Never trust client-only role checks for security — backend enforces RBAC.
7. User flow: nearby → shop products → cart → checkout → track orders.
8. Delivery flow: list assigned → detail → status updates.

### Example login (mobile)

```ts
const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
const data = await res.json()
if (data.user.role !== 'USER') throw new Error('Use delivery app')
await SecureStore.setItemAsync('token', data.token)
```

---

## 9. Dev commands

```bash
npx prisma db push
npm run db:seed
npm run dev
```
