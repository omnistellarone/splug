# PLAN — Architecture and Implementation Plan

## 1. Locked Technology Decisions

### Application
- Next.js App Router.
- TypeScript.
- Full-stack Next.js: Server Components, Server Actions where appropriate, and Route Handlers for external integrations/webhooks.

### UI
- Tailwind CSS.
- shadcn/ui.
- Radix primitives as underlying accessible interaction primitives.
- Lucide icons.
- Responsive light/dark/system theme.

### Data / Auth / Storage
- Supabase PostgreSQL.
- `@supabase/supabase-js`.
- `@supabase/ssr` for cookie-compatible server-side authentication.
- Supabase Auth:
  - Email/password.
  - Google OAuth.
- Supabase Storage for product images.

### Payments
- Paystack.

### Email
- Mailgun HTTP API, called server-side only.

### Deployment
- Vercel.

### State
- Server/database state should stay server-first.
- Small UI state may use React state/context.
- Cart UX may use Zustand with persistence for guest/optimistic state.
- Avoid adding Redux unless requirements substantially change.

### Validation / forms
- Zod.
- React Hook Form for complex client forms where useful.
- Server-side validation remains mandatory.

---

## 2. Architecture Principles

1. Supabase PostgreSQL is the source of truth for persistent business data.
2. Supabase Auth owns authentication identity.
3. The browser never receives privileged keys.
4. UI authorization is not security; database/server authorization is security.
5. Prices, discounts, stock, order totals, and payment states are calculated/validated server-side.
6. Public catalog pages should be server-first for SEO/performance.
7. Interactive islands should be client components only where required.
8. External side effects (payment/email) must be idempotent where practical.
9. Orders store snapshots so historical records do not change with catalog edits.
10. Product deletion is normally archival/soft deletion.
11. Build an MVP cleanly, but keep boundaries that support future scaling.

---

## 3. Suggested Repository Structure

```text
.
├── AGENTS.md
├── PLAN.md
├── PRD.md
├── app/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── shop/
│   │   ├── category/[slug]/
│   │   ├── product/[slug]/
│   │   ├── search/
│   │   ├── cart/
│   │   └── wishlist/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── auth/
│   │   └── callback/route.ts
│   ├── checkout/
│   │   ├── page.tsx
│   │   ├── success/
│   │   └── failure/
│   ├── account/
│   │   ├── page.tsx
│   │   ├── profile/
│   │   ├── addresses/
│   │   └── orders/[id]/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── reviews/
│   │   ├── coupons/
│   │   └── settings/
│   └── api/
│       ├── checkout/initialize/route.ts
│       ├── payments/paystack/verify/route.ts
│       ├── webhooks/paystack/route.ts
│       └── health/route.ts
├── components/
│   ├── ui/
│   ├── store/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   └── admin/
├── features/
│   ├── auth/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── inventory/
│   ├── reviews/
│   ├── wishlist/
│   ├── coupons/
│   └── email/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── paystack/
│   ├── mailgun/
│   ├── auth/
│   ├── validation/
│   ├── money/
│   └── utils/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── emails/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
└── middleware/proxy file as required by the selected Next.js/Supabase setup
```

Use the convention required by the installed Next.js version for request/session proxying. Do not force an outdated filename convention.

---

## 4. Environment Variables

Create `.env.example`. Never commit real credentials.

Suggested variables:

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STORE_NAME=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=
MAILGUN_API_BASE_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Notes:
- Google client credentials may be configured primarily in Supabase Dashboard rather than consumed directly by application code. Keep these env names only if the final implementation actually needs them.
- `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and `MAILGUN_API_KEY` are server-only.
- Do not prefix secrets with `NEXT_PUBLIC_`.

---

## 5. Database Model

Use UUID primary keys unless a compelling reason exists otherwise.
Use `timestamptz` for timestamps.
Use integer minor units for money (`price_minor`) to avoid floating point errors.

### 5.1 Enums
Suggested PostgreSQL enums:
- `app_role`: customer, admin.
- `product_status`: draft, active, archived.
- `order_status`: pending_payment, paid, processing, shipped, delivered, cancelled, refunded.
- `payment_status`: pending, success, failed, refunded.
- `review_status`: pending, approved, rejected.
- `discount_type`: percentage, fixed.

Avoid changing enum values casually once production data exists.

---

### 5.2 `profiles`
- `id uuid PK` → `auth.users.id`.
- `full_name text`.
- `phone text`.
- `avatar_url text`.
- `created_at`.
- `updated_at`.

Do not store admin authorization in user-editable profile fields.

---

### 5.3 `user_roles`
- `user_id uuid PK/FK`.
- `role app_role`.
- `created_at`.

Only trusted server/admin SQL paths can modify roles.

---

### 5.4 `addresses`
- `id uuid PK`.
- `user_id uuid FK`.
- `recipient_name`.
- `phone`.
- `line1`.
- `line2`.
- `city`.
- `state`.
- `country`.
- `postal_code`.
- `is_default`.
- timestamps.

---

### 5.5 `categories`
- `id uuid PK`.
- `parent_id uuid nullable`.
- `name`.
- `slug unique`.
- `description`.
- `image_path`.
- `is_active`.
- `sort_order`.
- timestamps.

---

### 5.6 `products`
- `id uuid PK`.
- `category_id uuid`.
- `name`.
- `slug unique`.
- `brand`.
- `short_description`.
- `description`.
- `specifications jsonb`.
- `status product_status`.
- `is_featured`.
- `seo_title`.
- `seo_description`.
- timestamps.

Do not put final variant-specific inventory directly on the product row.

---

### 5.7 `product_options`
Examples: Color, Storage, RAM.
- `id uuid PK`.
- `product_id`.
- `name`.
- `position`.

### 5.8 `product_option_values`
- `id uuid PK`.
- `option_id`.
- `value`.
- `position`.

---

### 5.9 `product_variants`
- `id uuid PK`.
- `product_id uuid`.
- `sku text unique`.
- `price_minor bigint`.
- `compare_at_price_minor bigint nullable`.
- `stock_quantity integer`.
- `reserved_quantity integer default 0`.
- `low_stock_threshold integer`.
- `is_active boolean`.
- `attributes jsonb`.
- timestamps.

Constraints:
- Prices >= 0.
- Stock/reserved >= 0.
- Reserved <= stock where reservation model requires it.

`attributes` stores the concrete option-value representation needed to render/resolve the variant. If implementation uses a normalized variant-value join table instead, do so consistently.

---

### 5.10 `product_images`
- `id uuid PK`.
- `product_id`.
- `variant_id nullable`.
- `storage_path`.
- `alt_text`.
- `position`.
- timestamps.

Use Supabase Storage for files; store paths/metadata in application tables.

---

### 5.11 `inventory_movements`
- `id uuid PK`.
- `variant_id`.
- `quantity_delta integer`.
- `reason`.
- `order_id nullable`.
- `created_by nullable`.
- `created_at`.

This is an audit log, not the sole source of current stock.

---

### 5.12 `carts`
- `id uuid PK`.
- `user_id uuid unique`.
- timestamps.

### 5.13 `cart_items`
- `id uuid PK`.
- `cart_id`.
- `variant_id`.
- `quantity`.
- unique `(cart_id, variant_id)`.
- timestamps.

Do not persist trusted totals here.

---

### 5.14 `wishlist_items`
- `user_id`.
- `product_id`.
- `created_at`.
- composite primary key `(user_id, product_id)`.

---

### 5.15 `reviews`
- `id uuid PK`.
- `product_id`.
- `user_id`.
- `rating smallint CHECK 1..5`.
- `title`.
- `body`.
- `status review_status`.
- `verified_purchase boolean`.
- timestamps.
- unique `(user_id, product_id)` for V1 unless multiple reviews are intentionally supported.

---

### 5.16 `coupons`
- `id uuid PK`.
- `code text unique`.
- `discount_type`.
- `value`.
- `minimum_subtotal_minor`.
- `max_discount_minor nullable`.
- `starts_at`.
- `ends_at`.
- `usage_limit nullable`.
- `per_user_limit nullable`.
- `is_active`.
- timestamps.

### 5.17 `coupon_redemptions`
- `id uuid PK`.
- `coupon_id`.
- `user_id`.
- `order_id`.
- `created_at`.

---

### 5.18 `orders`
- `id uuid PK`.
- `order_number text unique`.
- `user_id`.
- `status order_status`.
- `payment_status payment_status`.
- `currency char/text default 'NGN'`.
- `subtotal_minor`.
- `discount_minor`.
- `shipping_minor default 0`.
- `tax_minor default 0`.
- `total_minor`.
- `coupon_id nullable`.
- `shipping_address_snapshot jsonb`.
- `customer_email_snapshot`.
- `customer_name_snapshot`.
- `payment_reference text unique nullable`.
- `internal_note text nullable`.
- `paid_at nullable`.
- `created_at`.
- `updated_at`.

---

### 5.19 `order_items`
Store immutable purchase snapshots:
- `id uuid PK`.
- `order_id`.
- `product_id nullable`.
- `variant_id nullable`.
- `product_name`.
- `variant_name`.
- `sku`.
- `unit_price_minor`.
- `quantity`.
- `line_total_minor`.
- `image_path nullable`.
- `attributes jsonb`.

Product/variant foreign keys may be nullable to preserve history after archival/data retention operations.

---

### 5.20 `payments`
- `id uuid PK`.
- `order_id`.
- `provider text` = paystack.
- `reference text unique`.
- `provider_transaction_id text/bigint-compatible representation nullable`.
- `status payment_status`.
- `amount_minor`.
- `currency`.
- `channel nullable`.
- `paid_at nullable`.
- `raw_metadata jsonb` with care not to store prohibited secrets.
- timestamps.

---

### 5.21 `order_status_history`
- `id uuid PK`.
- `order_id`.
- `from_status nullable`.
- `to_status`.
- `changed_by nullable`.
- `note nullable`.
- `created_at`.

---

### 5.22 `email_events`
Optional but recommended:
- `id uuid PK`.
- `order_id nullable`.
- `user_id nullable`.
- `template_key`.
- `recipient`.
- `provider_message_id nullable`.
- `status`.
- `error_message nullable`.
- `created_at`.

Do not store sensitive message contents unnecessarily.

---

## 6. Indexes

At minimum consider:
- `products(slug)`.
- `products(status, category_id)`.
- `products(brand)`.
- Search index for product text.
- `product_variants(product_id, is_active)`.
- `product_variants(sku)`.
- `orders(user_id, created_at desc)`.
- `orders(status, created_at desc)`.
- `payments(reference)`.
- `reviews(product_id, status, created_at desc)`.
- `cart_items(cart_id)`.
- `wishlist_items(user_id)`.
- `coupons(code)`.

Profile query plans after real data exists; do not add indexes blindly.

---

## 7. RLS / Authorization Model

Enable RLS on every exposed application table.

### Public/anonymous
Can read only:
- Active categories.
- Active products.
- Active product variants needed for catalog.
- Public product image metadata.
- Approved reviews.

Cannot:
- Write catalog data.
- Read users, carts, orders, payments, addresses, admin data.

### Authenticated customer
Can:
- Read/update own profile fields.
- CRUD own addresses.
- CRUD own cart/cart items.
- CRUD own wishlist.
- Read own orders and order items.
- Read own permitted payment summary.
- Create/update own review subject to policy/business rules.

Cannot:
- Change roles.
- Modify product prices.
- Modify inventory.
- Modify order payment status.
- Read other customers’ private data.

### Admin
Admin checks should use a secure database helper such as `is_admin()` based on `user_roles`, or trusted server-side service-role paths.

Admin can manage:
- Products.
- Categories.
- Variants.
- Inventory.
- Orders/fulfillment.
- Coupons.
- Review moderation.

### Critical rule
Do not rely on pathname middleware alone to secure admin actions. Every privileged write must be authorized on the server/database.

---

## 8. Supabase Storage

Create a bucket such as:
- `product-images`.

For public product imagery:
- Public read is acceptable.
- Upload/update/delete only by authorized admins.

Rules:
- Restrict MIME types to image formats actually supported.
- Set sensible max file size.
- Generate unique object paths.
- Delete/replace through Storage APIs, not direct mutation of the internal storage schema.
- Store object path, not a fragile transformed URL, in the database.

Optional additional private buckets later:
- invoices.
- user documents.

---

## 9. Auth Architecture

Use Supabase Auth with SSR-compatible clients.

Create:
- Browser Supabase client.
- Server Supabase client.
- Privileged admin/service client in a server-only module.

### Email/password
Implement:
- Sign up.
- Sign in.
- Sign out.
- Password reset.
- Session refresh behavior required by the current Supabase SSR guide.

### Google OAuth
Flow:
1. User clicks “Continue with Google”.
2. App calls Supabase `signInWithOAuth({ provider: 'google' })`.
3. Redirect target points to `/auth/callback`.
4. Google authenticates user.
5. Supabase returns authorization code.
6. Callback exchanges code for session.
7. App redirects to original/intended path.
8. Merge guest cart into persisted customer cart.

### Google Cloud setup checklist
When implementation reaches this phase:
1. Create/select a Google Cloud project.
2. Configure Google Auth Platform / OAuth consent screen.
3. Choose the appropriate audience.
4. Create OAuth 2.0 Web Application credentials.
5. Add the exact authorized redirect URI shown by Supabase for the Google provider.
6. Copy Google Client ID and Client Secret into the Supabase Google provider configuration.
7. Enable the Google provider in Supabase Auth.
8. Configure Supabase Site URL and allowed redirect URLs for:
   - local development.
   - Vercel preview strategy if previews are used.
   - production domain.
9. Test both new-user and returning-user sign-in.
10. Use separate Google credentials/environments where practical for production isolation.

Do not improvise callback URLs. Use the current values shown by the Supabase dashboard/docs at implementation time.

---

## 10. Cart Strategy

### Guest
- Zustand store with persistence to localStorage.
- Store only identifiers, quantity, and minimal display cache.
- Product/price truth remains server data.

### Authenticated
- Database cart is canonical.
- UI may optimistically update for responsiveness.
- Mutations synchronize to Supabase.
- On sign-in, merge local guest items:
  - If variant already exists in DB cart, add quantities up to stock/business limit.
  - Otherwise insert.
  - Clear guest storage only after successful merge.

### Checkout
Re-read cart from database/server.
Never checkout using only Zustand/localStorage contents.

---

## 11. Checkout and Paystack

### 11.1 Initialize checkout
Server endpoint/action:
1. Require authenticated user.
2. Load cart.
3. Load current variants/products.
4. Reject inactive/missing variants.
5. Validate requested quantities.
6. Recalculate subtotal.
7. Validate coupon.
8. Shipping = 0 for V1.
9. Calculate total.
10. Create pending order + item snapshots in a DB transaction/RPC.
11. Generate unique Paystack reference.
12. Save pending payment.
13. Initialize Paystack from the server.
14. Return authorization URL/access information required by the chosen Paystack flow.

### 11.2 Payment verification
Do not treat a browser redirect as proof of payment.

Use:
- Server-side Paystack verification endpoint.
- Paystack webhook.

### 11.3 Webhook
Route:
`POST /api/webhooks/paystack`

Requirements:
- Read the raw request body safely.
- Validate `x-paystack-signature` using HMAC SHA-512 and the Paystack secret.
- Reject invalid events.
- Locate payment by reference.
- Confirm amount/currency/reference matches expected order.
- Process `charge.success` idempotently.
- Return HTTP 200 quickly after safe processing strategy.

### 11.4 Idempotent finalization
A function/RPC should ensure:
- The same Paystack event/reference cannot fulfill twice.
- Payment transitions to success once.
- Order transitions to paid once.
- Inventory is decremented once.
- Inventory movement records are inserted once.
- Coupon redemption is recorded once.
- Cart is cleared after successful finalization.
- Confirmation email is queued/sent after DB commit.

Use a unique constraint on payment reference and transactional database logic.

### 11.5 Inventory race handling
V1 minimum:
- Revalidate stock immediately before order creation.
- Atomically decrement stock during successful payment finalization.

Production-hardening option:
- Add inventory reservations with expiry during payment initiation to reduce overselling.
- Release expired reservations safely.
- This can be Phase 2 if assignment scope needs to remain manageable.

---

## 12. Mailgun

Use Mailgun HTTP API from server-only code.

Create a reusable email service:
```text
sendEmail()
sendOrderConfirmation()
sendOrderStatusChanged()
```

Templates:
- `order-confirmation`.
- `order-processing`.
- `order-shipped`.
- `order-delivered`.
- `order-cancelled`.
- `order-refunded`.

Requirements:
- HTML + sensible plain-text fallback.
- Environment-specific sender.
- Do not call Mailgun from Client Components.
- Log message/provider result without logging secrets.
- If Mailgun fails, order/payment remains valid.
- Allow safe retry of failed email events.

Production setup later:
- Verify sending domain.
- Configure DNS records as required by Mailgun.
- Use a real sender domain.
- Configure production Mailgun region/base URL correctly.

---

## 13. Admin Design

Admin uses the same design system but a denser layout.

### Dashboard cards
- Revenue.
- Orders.
- Customers.
- Average order value.
- Low-stock products.

### Tables
Use:
- Pagination.
- Search.
- Filters.
- Sort.
- Row actions.
- Responsive overflow behavior.

Avoid loading the entire dataset into the browser for filtering.

---

## 14. Themes

Implement light/dark/system selection.

Requirements:
- No hydration flash where practical.
- Persist choice.
- Admin and storefront both support themes.
- Product imagery should remain visually appropriate in both.

---

## 15. Error Handling

Create consistent error model:
- Validation errors.
- Authentication required.
- Authorization denied.
- Not found.
- Stock conflict.
- Coupon invalid.
- Payment initialization failed.
- Payment verification failed.
- External email failure.

User-facing errors should be readable.
Server logs can be more detailed but must not expose secrets.

---

## 16. Testing Strategy

### Unit
- Money calculations.
- Coupon calculations.
- Cart merge.
- Order total calculation.
- Paystack signature helper.
- Status transition rules.

### Integration
- Supabase RLS behavior.
- Checkout order creation.
- Idempotent payment finalization.
- Inventory decrement.
- Coupon redemption.
- Admin authorization.

### E2E
Use Playwright or equivalent:
1. Browse catalog.
2. Add variant to cart.
3. Sign up/sign in.
4. Cart persists/merges.
5. Checkout validation.
6. Payment test path (mock external boundary where appropriate).
7. Order appears in account.
8. Admin changes order status.
9. Unauthorized user cannot access admin.
10. Theme switch.

Do not make live paid transactions in automated tests.

---

## 17. Development Phases

# Phase 0 — Project foundation
Deliver:
- Next.js TypeScript app.
- Tailwind.
- shadcn/ui baseline.
- Theme system.
- ESLint/formatting.
- `.env.example`.
- Supabase clients.
- Health route.
- Basic shell/layout.
- Test runner.

Definition of done:
- Build succeeds.
- Lint succeeds.
- App deploys to Vercel preview.
- No secrets committed.

---

# Phase 1 — Database, migrations, RLS, seed
Deliver:
- Supabase schema.
- Enums.
- Tables.
- Constraints.
- Indexes.
- RLS.
- Helper SQL functions.
- Seed electronics catalog.

Seed example categories:
- Smartphones.
- Laptops.
- Audio.
- Gaming.
- Accessories.

Definition of done:
- Fresh migration reproduces database.
- Seed works.
- RLS tests prove customers cannot read each other's private data.

---

# Phase 2 — Authentication
Deliver:
- Email/password.
- Logout.
- Password reset.
- Google OAuth.
- Profile bootstrap.
- Protected account pages.
- Admin guard/helper.

Definition of done:
- Email sign-in works.
- Google sign-in works locally and on configured deployment.
- User cannot self-promote to admin.

---

# Phase 3 — Storefront catalog
Deliver:
- Homepage.
- Shop.
- Categories.
- Product page.
- Images.
- Variants.
- Search.
- Filters.
- Sorting.
- Responsive UI.
- SEO metadata.

Definition of done:
- Catalog is usable without login.
- Variant price/availability behaves correctly.
- Public pages are indexable and fast.

---

# Phase 4 — Cart and wishlist
Deliver:
- Guest Zustand cart.
- Persistent auth cart.
- Login merge.
- Quantity updates.
- Wishlist.

Definition of done:
- Refresh preserves cart.
- Login merges safely.
- Auth cart persists across devices/sessions.

---

# Phase 5 — Checkout + Paystack
Deliver:
- Auth-required checkout.
- Address selection/create.
- Server total calculation.
- Coupons.
- Pending order.
- Paystack initialization.
- Callback UI.
- Verification.
- Signed webhook.
- Idempotent finalization.
- Inventory decrement.

Definition of done:
- Paystack test payment results in exactly one successful order fulfillment.
- Replayed webhook does not duplicate fulfillment.
- Client cannot change order price.

---

# Phase 6 — Mailgun
Deliver:
- Email service.
- Order confirmation.
- Processing/shipped/delivered emails.
- Email event logging/retry-safe behavior.

Definition of done:
- Test order sends confirmation.
- Admin status changes send correct email.
- Failed email does not corrupt order.

---

# Phase 7 — Account and reviews
Deliver:
- Profile.
- Addresses.
- Order history.
- Order detail.
- Reviews.
- Verified purchase logic where implemented.

---

# Phase 8 — Admin dashboard
Deliver:
- Analytics summary.
- Products.
- Categories.
- Variants/inventory.
- Orders.
- Customers.
- Coupons.
- Review moderation.

Definition of done:
- Customer cannot call admin mutations directly.
- Archived products remain intact in historical orders.

---

# Phase 9 — Hardening
Deliver:
- Accessibility pass.
- Performance pass.
- SEO.
- Error handling.
- Loading/empty states.
- Rate limiting for sensitive routes.
- Test coverage for critical flows.
- Security audit of RLS.
- Vercel production configuration.
- Paystack live-mode checklist.
- Mailgun production domain checklist.
- Google OAuth production callback checklist.

---

## 18. UI Page Inventory

### Store
- `/`
- `/shop`
- `/category/[slug]`
- `/product/[slug]`
- `/search`
- `/cart`
- `/wishlist`

### Auth
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/auth/callback`

### Checkout
- `/checkout`
- `/checkout/success`
- `/checkout/failure`

### Account
- `/account`
- `/account/profile`
- `/account/addresses`
- `/account/orders`
- `/account/orders/[id]`

### Admin
- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/categories`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/customers`
- `/admin/coupons`
- `/admin/reviews`

---

## 19. Design Details for Antigravity

Storefront:
- Max-width content container with generous whitespace.
- Strong product cards.
- High-quality image aspect-ratio handling.
- Sticky add-to-cart region on mobile product pages where appropriate.
- Filter drawer on mobile.
- Sidebar or toolbar filters on desktop.
- Responsive cart drawer may complement, not replace, full cart page.
- Use subtle motion; do not over-animate.

Admin:
- Collapsible sidebar.
- Breadcrumbs.
- Command/search affordance optional.
- Data tables with server pagination.
- Forms split into logical cards/sections.
- Product editor should handle variants clearly.

---

## 20. Official Integration Facts to Respect

Implementation should follow current official documentation at build time.

Current verified architectural points:
- Supabase supports Next.js SSR auth via cookie-aware clients.
- Supabase recommends RLS for exposed tables.
- Supabase Storage access is controlled through RLS and bucket policies; service keys bypass RLS and therefore must remain server-only.
- Paystack transaction initialization must be done with the secret key on the backend.
- Paystack payment status should be verified server-side.
- Paystack webhooks include an `x-paystack-signature` HMAC SHA-512 signature.
- Mailgun supports sending via its HTTP API and accepts HTML/text/template content.
- Supabase Google auth requires Google Cloud/OAuth configuration plus correct redirect URLs.

Before implementation, check the latest official docs because package APIs and dashboard labels can change.
