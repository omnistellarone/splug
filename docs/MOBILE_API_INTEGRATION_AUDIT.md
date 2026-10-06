# Slurge Electronics — Mobile Backend & API Integration Architecture Audit

## 1. Executive Summary

This document inspects and audits the existing Slurge Electronics backend code to prepare for building the Android mobile application (React Native + Expo + TypeScript). It inventories all existing API routes, Supabase SDK & RPC operations, authentication flows, Paystack payment workflows, and Mailgun email delivery mechanics. It pinpoints mobile compatibility gaps and establishes the bridge for mobile clients without inventing arbitrary endpoints or altering production customer data.

---

## 2. Inventory of Existing Backend API Routes

| HTTP Method | Route | Description | Auth Mode | Mobile Compatibility Status |
|---|---|---|---|---|
| `GET` | `/api/products` | Paginated product catalog with category, search query, price filter, sorting | Public | **Fully Compatible** |
| `GET` | `/api/products/[slug]` | Product details with variants, images, and related products | Public | **Fully Compatible** |
| `GET` | `/api/categories` | Active product categories listing | Public | **Fully Compatible** |
| `GET` | `/api/settings` | Operational store settings (e.g. Free shipping threshold: ₦1,000,000) | Public | **Fully Compatible** |
| `PATCH` | `/api/settings` | Admin threshold update | Admin (Cookie / Bearer) | Web/Admin only |
| `POST` | `/api/coupons/validate` | Validates coupon code and calculates discount against minor units subtotal | Public / User | **Fully Compatible** |
| `GET` | `/api/cart` | Retrieves customer's database cart items & calculated totals | Auth (Cookie / Bearer) | **Fix Required**: Relied on cookie-only server action; updated to support Bearer token client |
| `POST` | `/api/cart` | Upsert / update cart item quantity for authenticated customer | Auth (Cookie / Bearer) | **Fix Required**: Relied on cookie client for RLS mutation; updated to support Bearer token client |
| `DELETE` | `/api/cart` | Remove item or clear user cart | Auth (Cookie / Bearer) | **Fix Required**: Relied on cookie client; updated to support Bearer token client |
| `POST` | `/api/checkout` | Authoritative stock check, order creation, and Paystack initialization | Auth (Cookie / Bearer) | **Fix Required**: Relied on cookie client; updated to accept Bearer token and return payment authorization |
| `GET` | `/api/orders` | Customer order history listing with line item snapshots | Auth (Bearer / Cookie) | **Fix Required**: Needed authenticated client with Bearer header to satisfy RLS |
| `GET` | `/api/orders/[id]` | Order details with line item snapshots & status tracking | Auth (Bearer / Cookie) | **Fix Required**: Needed authenticated client with Bearer header to satisfy RLS |
| `GET` | `/api/payments/paystack/verify` | Paystack redirect verification, calls `finalize_payment` RPC & Mailgun | Public / Callback | **Enhanced for Mobile**: Supports JSON responses when `Accept: application/json` or `?format=json` is provided |
| `POST` | `/api/webhooks/paystack` | Verifies HMAC SHA-512 signature, executes `finalize_payment` RPC, logs Mailgun email | Service-to-service | **Fully Compatible** |
| `GET` | `/api/health` | Health check endpoint | Public | **Fully Compatible** |

---

## 3. Missing Mobile-Compatible APIs Identified

1. **Delivery Addresses (`/api/addresses`)**:
   - *Current Web State*: Addressed via Next.js Server Actions (`getUserAddressesAction`, `saveAddressAction`, `deleteAddressAction`, `setDefaultAddressAction` in `src/lib/checkout/actions.ts`).
   - *Mobile Need*: REST API endpoints (`GET`, `POST`, `DELETE`, `PATCH`) accepting `Authorization: Bearer <token>` to query and mutate addresses directly adhering to RLS (`auth.uid() = user_id`).
2. **Cart Merge on Login (`/api/cart/merge`)**:
   - *Current Web State*: Performed on client login transition via `mergeCartOnLoginAction`.
   - *Mobile Need*: Dedicated endpoint allowing the mobile app to sync local guest items into the database cart upon user authentication.
3. **Mobile-friendly Payment Verification (`/api/payments/paystack/verify?format=json`)**:
   - *Current Web State*: Always redirects to `/checkout/success` or `/checkout/failure` web pages.
   - *Mobile Need*: Return structured JSON `{ success: true, orderId, reference, status }` so the mobile app or in-app payment flow can verify and display the native status screen (Stitch Screen 6).

---

## 4. Supabase SDK & Database RPC Operations

### Database Tables & RLS Policies
- `profiles`: Synced with `auth.users`, user can read/update own profile.
- `user_roles`: Admin authorization verification via `public.is_admin()`.
- `categories`: Public select on active categories.
- `products`: Public select on active products.
- `product_variants`: Owns SKU, price (minor units), compare-at price, stock, options, active state.
- `product_images`: Storage paths and primary flags.
- `cart_items`: Scoped to `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE.
- `addresses`: Scoped to `auth.uid() = user_id`. Enforces single default address via partial unique index.
- `coupons` & `coupon_uses`: Validates coupon constraints and enforces single usage per user.
- `orders`: Insert and read scoped to `auth.uid() = user_id`. Mutation restricted to service-role (webhook/verify).
- `order_items`: Snapshots of catalog state at purchase time.
- `order_status_history`: Audit milestones for live tracking.
- `payment_records`: Full audit trail of Paystack transactions.
- `inventory_movements`: Stock decrement and replenishment movements.
- `email_events`: Transactional email delivery logs.

### Database RPC Functions
- `public.finalize_payment(p_order_id, p_paystack_reference, p_amount_minor, p_event_type, p_raw_payload)`:
  - Security Definer PostgreSQL function.
  - Idempotent: checks if `payment_records` already has processed entry.
  - Updates `orders` status to `'paid'` and `payment_status` to `'paid'`.
  - Atomically decrements `stock` in `product_variants`.
  - Inserts `inventory_movements` record (`reason = 'purchase'`).
  - Logs `order_status_history`.

---

## 5. Authentication Flow & Mobile Session Architecture

### Web Application Flow
- Built on `@supabase/ssr` using HTTP cookies (`cookieStore`).
- Server Actions call `createClient()` which reads cookies from incoming HTTP headers.

### Mobile Application Flow
- Uses `@supabase/supabase-js` on React Native / Expo with `expo-secure-store`.
- Tokens (`access_token` JWT, `refresh_token`) are stored securely on the Android device via `ExpoSecureStoreAdapter`.
- When communicating with backend Next.js API routes, the mobile client attaches:
  `Authorization: Bearer <access_token>`.
- The backend validates the JWT with Supabase and sets PostgREST headers so that Postgres RLS policies (`auth.uid() = user_id`) enforce tenant isolation.
- Google OAuth: Configured using Expo WebBrowser / Supabase OAuth with deep linking (`slurge://auth-callback`).

---

## 6. Paystack Payment Integration

- **Secret Keys**: Server-only (`PAYSTACK_SECRET_KEY`). Never exposed to mobile client.
- **Public Key**: Safe for client initialization if needed (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`).
- **Initialization**: Triggered server-side via `POST /api/checkout`. Returns Paystack `authorization_url` and unique transaction `reference`.
- **Payment Execution**: Mobile app opens `authorization_url` in an in-app WebView modal or browser session.
- **Verification**:
  - Primary: Paystack webhook (`POST /api/webhooks/paystack`) with HMAC SHA-512 signature verification.
  - Secondary: Server verification endpoint (`GET /api/payments/paystack/verify?reference=...&format=json`) triggered upon payment completion.
  - Atomically runs `finalize_payment` RPC in Supabase.

---

## 7. Mailgun Transactional Email Integration

- **Credentials**: Server-only (`MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`).
- **Trigger**: Fired automatically after `finalize_payment` marks order as paid in `POST /api/webhooks/paystack` and `GET /api/payments/paystack/verify`.
- **Fault Tolerance**: Non-blocking asynchronous delivery. If Mailgun fails or is in test mode, the failure is logged to `email_events` table and the paid order is preserved.

---

## 8. Stitch Design Screens Mapping

| Stitch Screen Folder | Visual Target | Mobile Screen / Component |
|---|---|---|
| `1._sign_in_session_recovery` | Dark/slate themed sign-in, create account tabs, email/phone, password, biometrics, Google OAuth, session recovery | `AuthScreen` / `SignInView` / `SignUpView` |
| `2._home_storefront_catalog` | Top banner promo, category filter pills, featured product grid, ratings, prices in ₦, bottom tab navigation | `HomeScreen` / `CatalogView` / `ProductCard` |
| `3._product_details_iphone_16_pro_max` | Multi-image preview, storage/color variant selector, stock badges, specs, Add to Cart & Buy Now | `ProductDetailsScreen` / `VariantSelector` |
| `4._shopping_cart_item_management` | Cart items, quantity controls, coupon promo application, free shipping progress, checkout button | `CartScreen` / `CartItemRow` / `OrderSummary` |
| `5._delivery_address_checkout` | Saved address cards, add new address modal, payment method selector, order review, Pay with Paystack | `CheckoutScreen` / `AddressSelector` |
| `6._payment_verification_status_states` | Status spinner, success checkmark with Paystack ref, failure retry view, View Order button | `PaymentStatusScreen` |
| `7._live_order_tracking_milestones` | Timeline steps (Placed -> Verified -> Processing -> Dispatched -> Delivered), courier badge, order summary | `OrderTrackingScreen` |
| `8._account_order_history` | User profile summary, past orders list with status pills, order details modal, logout button | `AccountScreen` / `OrderHistoryView` |
