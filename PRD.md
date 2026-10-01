# PRD — Modern Electronics E‑Commerce Store

## 1. Product Summary

Build a production-capable, Shopify-inspired electronics e-commerce web application.

The product must provide:
- A fast, polished customer storefront.
- Product discovery, search, filtering, variants, wishlist, reviews, cart, and checkout.
- Email/password and Google authentication.
- Persistent application data in Supabase PostgreSQL.
- Product media in Supabase Storage.
- Paystack payments.
- Mailgun transactional emails.
- A full merchant/admin dashboard.
- Responsive light and dark themes.
- Deployment on Vercel.

The visual direction should blend:
1. Shopify-like clarity and usability.
2. Premium/minimal presentation suitable for electronics.

The initial market assumption is Nigeria and the initial currency is NGN (₦). Currency and market configuration should not be hard-coded in a way that prevents later expansion.

---

## 2. Goals

### Primary goals
- Allow customers to discover electronics, inspect variants/specifications, add products to a cart, authenticate, pay, and track orders.
- Allow administrators to manage products, variants, stock, categories, orders, reviews, coupons, and customers.
- Persist all important data using Supabase.
- Implement checkout securely using Paystack.
- Send transactional emails using Mailgun.
- Support Google OAuth configured through Google Cloud and Supabase Auth.
- Provide a codebase that can continue beyond the assignment.

### Secondary goals
- Excellent mobile UX.
- Fast perceived performance.
- Strong accessibility.
- Strong authorization and Row Level Security.
- Good SEO for product/category pages.
- Clear architecture for Antigravity and future developers.

### Non-goals for V1
- Multi-vendor marketplace.
- Seller onboarding.
- Multiple warehouses.
- Complex tax engines.
- International shipping calculation.
- Subscription billing.
- Native mobile apps.
- AI recommendations.
- ERP/warehouse integrations.

---

## 3. Users

### 3.1 Guest
Can:
- Browse catalog.
- Search and filter.
- View product pages.
- Build a temporary cart.
- View reviews.
- Add items to a temporary wishlist only if desired by implementation, but persistent wishlist requires login.

Cannot:
- Complete checkout.
- View order history.
- Submit reviews.
- Access account pages.

### 3.2 Customer
Can:
- Sign up with email/password.
- Sign in with Google.
- Manage profile.
- Manage saved addresses.
- Maintain a persistent cart.
- Maintain a persistent wishlist.
- Checkout through Paystack.
- View order history and order status.
- Submit product reviews.
- Use valid coupon codes.

### 3.3 Admin
Can:
- Access a protected admin area.
- View dashboard metrics.
- Create/edit/archive products.
- Manage product variants and stock.
- Manage categories.
- Upload product images.
- View and manage orders.
- Update order fulfillment status.
- View customers.
- Manage coupons.
- Moderate reviews.
- View low-stock products.

Admin privileges must never be granted based only on UI checks.

---

## 4. Core User Journeys

### 4.1 Browse to purchase
Home → Shop → Product detail → Select variant → Add to cart → Cart → Sign in (if needed) → Checkout → Paystack → Payment verification → Order success → Confirmation email.

### 4.2 Google authentication
Sign in → Continue with Google → Google consent → Supabase callback → Session created → Cart merge → Return to intended page.

### 4.3 Order tracking
Account → Orders → Order detail → View payment and fulfillment status.

### 4.4 Admin fulfillment
Admin → Orders → Order detail → Update status to processing/shipped/delivered → Status history stored → Mailgun notification sent.

### 4.5 Product management
Admin → Products → Add/edit product → Add variants → Upload images → Set inventory → Publish.

---

## 5. Customer-Facing Features

## 5.1 Global navigation
- Logo.
- Shop link.
- Category navigation.
- Search.
- Wishlist.
- Cart badge.
- Account/sign-in.
- Theme toggle: light/dark/system.
- Responsive mobile navigation.

### Acceptance criteria
- Navigation works on mobile, tablet, and desktop.
- Cart badge updates without full page reload.
- Theme preference persists.

---

## 5.2 Homepage
Sections should support:
- Hero area.
- Featured categories.
- Featured products.
- New arrivals.
- Best sellers.
- Promotional banner.
- Trust/value proposition strip.
- Optional newsletter section.

Content should be manageable from code/config for V1; a CMS is not required.

---

## 5.3 Catalog / Shop
Features:
- Product grid.
- Pagination or “load more”.
- Search.
- Category filter.
- Brand filter.
- Price filter.
- Availability filter.
- Variant/spec filters where useful.
- Sorting:
  - Featured.
  - Newest.
  - Price low-to-high.
  - Price high-to-low.
  - Best selling.
  - Rating.

### Acceptance criteria
- Filters are represented in URL search parameters when practical.
- Catalog pages can be linked/shared with active filters.
- Empty state is helpful.
- Loading state uses skeletons rather than layout jumps.

---

## 5.4 Search
- Search product name.
- Search SKU where appropriate.
- Search brand.
- Search descriptions/specification text where practical.
- Debounced suggestions.
- Full results page.

V1 may use PostgreSQL text search and indexes. External search services are not required.

---

## 5.5 Product detail page
Required:
- Product name.
- Brand.
- Price.
- Compare-at price when discounted.
- Product image gallery.
- Description.
- Specifications.
- Variant selectors.
- Stock availability.
- Quantity selector.
- Add to cart.
- Wishlist.
- Rating summary.
- Reviews.
- Related products.
- Delivery/free-shipping messaging.

Electronics variants may include:
- Color.
- Storage.
- Memory/RAM.
- Model.
- Connectivity.

### Acceptance criteria
- Invalid/unavailable variant combinations cannot be added.
- Price and stock update when variant changes.
- Add-to-cart uses the selected variant, not only product ID.

---

## 5.6 Cart
- Add item.
- Remove item.
- Update quantity.
- Display selected variant.
- Price breakdown.
- Coupon input.
- Free shipping line.
- Estimated total.
- Cart badge.
- Empty state.

### Persistence strategy
- Guest cart: local persistent client state.
- Authenticated cart: Supabase is source of truth.
- On login: merge guest cart into authenticated cart.
- UI may optimistically update before server synchronization.
- Server recalculates all trusted totals at checkout.

---

## 5.7 Authentication
Methods:
- Email/password.
- Google OAuth through Supabase Auth and Google Cloud configuration.
- Password reset.
- Email verification if enabled.

Requirements:
- Cookie-compatible SSR authentication.
- Protected account/admin routes.
- Redirect users back to intended page after successful sign-in when practical.

---

## 5.8 Customer account
Pages:
- Account overview.
- Profile.
- Addresses.
- Orders.
- Order details.
- Wishlist.
- Logout.

### Address fields
At minimum:
- Recipient full name.
- Phone.
- Address line 1.
- Address line 2 optional.
- City.
- State.
- Country.
- Postal code optional.
- Default flag.

---

## 5.9 Wishlist
- Authenticated persistent wishlist.
- Add/remove from cards and product page.
- Move wishlist item to cart.
- Prevent duplicates.

---

## 5.10 Reviews
Customers can:
- View approved reviews.
- Submit rating 1–5.
- Submit title/body.
- Edit/delete their own review if business rules permit.

Admin can:
- Approve/reject/hide reviews.

Recommended:
- Mark a review as verified purchase when the user has a delivered/paid order containing that product.

---

## 5.11 Coupons
Support:
- Percentage discount.
- Fixed amount discount.
- Start/end dates.
- Minimum cart amount.
- Usage limit.
- Per-user usage limit.
- Active/inactive state.

Server must validate coupons. Client calculations are informational only.

---

## 5.12 Checkout
Checkout requires authentication.

Sections:
1. Contact details.
2. Shipping address.
3. Order summary.
4. Coupon.
5. Payment initiation.
6. Paystack redirect/modal flow.
7. Payment verification.
8. Success/failure state.

Initial shipping model:
- Free shipping.

### Security requirements
- Never trust prices, stock, discount amount, or total from the browser.
- Re-read product/variant prices from Supabase on the server.
- Validate coupon on the server.
- Generate a unique payment reference.
- Initialize Paystack from the server only.
- Verify payment from the server.
- Accept Paystack webhook events.
- Verify webhook signatures.
- Make order finalization idempotent.

---

## 5.13 Orders
Customer-visible order statuses:
- Pending payment.
- Paid.
- Processing.
- Shipped.
- Delivered.
- Cancelled.
- Refunded.

An order detail must show:
- Human-readable order number.
- Date.
- Items.
- Item snapshots.
- Totals.
- Shipping address snapshot.
- Payment status.
- Fulfillment status.
- Status history.

Historical orders must not change if the original product is later edited.

---

## 5.14 Transactional email
Mailgun sends:
- Welcome/optional account email if implemented.
- Order confirmation.
- Payment confirmation where distinct.
- Processing status update.
- Shipped update.
- Delivered update.
- Cancelled/refunded update where appropriate.

Emails should contain:
- Store identity.
- Customer name.
- Order number.
- Relevant status.
- Order summary.
- Link back to the order page.

Email failures must not roll back an already-successful payment/order transaction.

---

## 6. Admin Features

## 6.1 Admin dashboard
Show:
- Revenue.
- Orders.
- Average order value.
- Customers.
- Products.
- Low stock count.
- Recent orders.
- Best-selling products.
- Order status distribution.

Metrics should come from server-side queries.

---

## 6.2 Product management
Admin can:
- Create product.
- Edit product.
- Archive/unarchive product.
- Set brand/category.
- Set slug.
- Manage description/specifications.
- Mark featured.
- Manage SEO metadata.
- Manage variants.
- Manage images.
- Manage stock.

Avoid destructive deletion for products referenced by orders.

---

## 6.3 Category management
- Create.
- Edit.
- Archive.
- Optional parent category.
- Slug.
- Image optional.
- Sort order.

---

## 6.4 Inventory
- Stock quantity per variant.
- Low-stock threshold.
- Out-of-stock behavior.
- Inventory movement audit entries.
- Admin adjustment with reason.

---

## 6.5 Order management
Admin can:
- Search/filter orders.
- View details.
- Update fulfillment status.
- View payment status.
- Add internal note.
- View status history.
- Trigger appropriate status email automatically.

A payment should not be manually marked successful from the normal admin UI.

---

## 6.6 Customer management
Admin can view:
- Customer profile.
- Email.
- Order count.
- Lifetime spend.
- Recent orders.

Sensitive auth credentials are never visible.

---

## 6.7 Review moderation
- Pending.
- Approved.
- Rejected/hidden.
- Filters and search.

---

## 6.8 Coupon management
- Create/update/deactivate.
- Usage statistics.
- Validation preview where helpful.

---

## 7. Design Requirements

### Direction
Blend:
- Shopify-like clarity.
- Premium minimal electronics aesthetic.

### Principles
- Large clean product imagery.
- Strong typography hierarchy.
- Spacious layout.
- Restrained decoration.
- Fast micro-interactions.
- Clear primary action.
- Minimal modal usage.
- Skeleton loading.
- Useful empty/error states.
- Mobile-first behavior.

### Theme
Support:
- Light.
- Dark.
- System.

Persist user preference.

### Component system
Use:
- Tailwind CSS.
- shadcn/ui.
- Radix primitives where shadcn uses/provides them.
- Lucide icons unless a specific need requires another set.

Do not make the storefront look like an unmodified shadcn demo.

---

## 8. Accessibility

Target WCAG 2.2 AA where practical.

Requirements:
- Keyboard navigation.
- Visible focus states.
- Semantic HTML.
- Form labels.
- Error descriptions.
- Image alt text.
- Accessible dialogs/dropdowns.
- Sufficient contrast in both themes.
- Do not rely on color alone for statuses.

---

## 9. Performance

Targets:
- Use Next.js server rendering/static generation where appropriate.
- Optimize images.
- Lazy-load non-critical UI.
- Avoid unnecessary client components.
- Minimize layout shift.
- Paginate large admin/customer datasets.
- Add indexes for frequently queried/filter columns.
- Cache public catalog reads where safe while ensuring stock/order data remains fresh enough.

---

## 10. SEO

For public pages:
- Human-readable slugs.
- Product metadata.
- Category metadata.
- Canonical URLs.
- Open Graph metadata.
- Structured product data where practical.
- Sitemap.
- robots configuration.

Admin/account pages should not be indexed.

---

## 11. Security

Mandatory:
- Row Level Security on exposed Supabase tables.
- Server-side authorization for privileged actions.
- Service-role key never exposed to browser.
- Paystack secret never exposed to browser.
- Mailgun API key never exposed to browser.
- Validate server inputs.
- Rate-limit sensitive endpoints where practical.
- Verify webhook signatures.
- Do not trust client totals or roles.
- Prevent users from changing their own admin role.
- Sanitize/escape user-generated review content.
- Record audit/status history for important order events.

---

## 12. Analytics / Observability

V1:
- Structured server logs.
- Error boundaries.
- Friendly user-facing errors.
- Payment/order logging without leaking secrets.

Recommended later:
- Vercel Analytics.
- Error tracking such as Sentry.
- Product analytics.

---

## 13. Success Criteria

The assignment is complete when:
1. A guest can browse products and build a cart.
2. A user can register with email/password.
3. A user can sign in with Google.
4. User/session data persists via Supabase.
5. Product/category/variant/inventory data persists via Supabase.
6. Product images are stored in Supabase Storage.
7. A signed-in user can checkout through Paystack test mode.
8. Payment is verified server-side.
9. An order is stored with line-item snapshots.
10. Inventory is updated safely after successful payment.
11. Mailgun sends an order confirmation.
12. Admin can update fulfillment status.
13. Mailgun sends shipping/status emails.
14. Customer can see order history.
15. Wishlist works.
16. Reviews work with moderation.
17. Coupons work.
18. Admin dashboard works.
19. Light/dark/system theme works.
20. App is deployed to Vercel.
21. Production secrets are not committed.
22. RLS policies prevent unauthorized data access.
23. Critical flows have automated tests.

---

## 14. Future Expansion
- Multi-currency.
- Paid shipping and delivery zones.
- Returns portal.
- Refund automation.
- Product bundles.
- Back-in-stock alerts.
- Multiple warehouses.
- Advanced search provider.
- Recommendations.
- CMS.
- Native mobile app.
