# Slurge Electronics — Mobile Application REST API Documentation

This documentation covers the RESTful API endpoints available in Slurge for building Mobile Applications (React Native, Flutter, Swift/iOS, Kotlin/Android).

---

## 1. Postman Collection

Import the included file:
`postman/slurge-api.postman_collection.json`

### Environment Variables
- `BASE_URL`: Base URL of the API (e.g. `https://splug-teal.vercel.app` or `http://localhost:3000`)
- `AUTH_TOKEN`: JWT Access Token obtained from Supabase Auth sign-in

---

## 2. Authentication

Slurge uses Supabase Auth. Mobile clients can authenticate directly using email/password, Google OAuth, or Apple Sign-In.

### Headers for Protected Endpoints:
```http
Authorization: Bearer <AUTH_TOKEN>
Content-Type: application/json
```

---

## 3. Endpoints Overview

### Catalog & Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Retrieve list of all active categories with icons and slugs |
| `GET` | `/api/products` | Retrieve paginated products with category, price, and sorting filters |
| `GET` | `/api/products?q=:query` | Search products by name, description, brand, or SKU |
| `GET` | `/api/products/:slug` | Retrieve single product details, variants, images, stock, & related items |

### Shopping Cart (Database Persisted)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get authenticated user's cart items and calculated totals |
| `POST` | `/api/cart` | Add or update variant item quantity (`{ variantId, quantity }`) |
| `DELETE` | `/api/cart` | Remove an item (`{ variantId }`) or clear cart (`{ clearAll: true }`) |

### Checkout & Payments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/coupons/validate` | Validate coupon code against subtotal (`{ code, subtotalMinor }`) |
| `POST` | `/api/checkout` | Create pending order, snapshot prices, and generate Paystack authorization URL |
| `GET` | `/api/payments/paystack/verify?reference=:ref` | Verify payment status with Paystack |

### Order History
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | Get list of user orders with line items and fulfillment status |
| `GET` | `/api/orders/:id` | Get single order details, tracking number, and shipping address snapshot |

### Store Operations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Get global store settings (Free delivery threshold, currency, contact info) |
| `PATCH` | `/api/settings` | Update free delivery threshold (Admin only) |
| `GET` | `/api/health` | Health check endpoint |

---

## 4. Money & Currency Convention

All monetary amounts are represented as **integer minor units (kobo for NGN)**:
- `100 kobo = ₦1.00`
- `₦100,000 = 10000000 minor units`
- Avoid floating-point arithmetic.
