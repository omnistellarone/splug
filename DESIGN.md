# DESIGN.md — Visual Design System & UX Specification

## 1. Purpose

This file defines the visual language, interaction patterns, layout rules, responsive behavior, and component styling for the electronics e-commerce application described in `PRD.md` and `PLAN.md`.

Antigravity must read this file before implementing customer-facing UI.

Priority of references:

1. **Design System & Component Spec (Authoritative):** **Kalki Design System** (brand `#4F46E5`, typeface `Inter`, see §65).
2. **Primary UI Kit reference:** the E-commerce Filter & Sort UI Kit supplied by the user.
3. **Secondary UI Kit reference:** the Cart Drawer UI Kit supplied by the user.

The product should be **inspired by** these references, not reproduced pixel-for-pixel.

The target result is:
- clean,
- premium,
- modern,
- lightweight,
- fast,
- conversion-oriented,
- strongly usable on both desktop and mobile,
- appropriate for an electronics store.

---

# 2. Design Direction

## Core visual characteristics

The primary reference establishes the following visual language:

- pale cool-gray / blue-tinted page background,
- white elevated surfaces,
- dark navy text,
- vivid blue-violet accent,
- soft rounded corners,
- thin low-contrast borders,
- restrained shadows,
- compact controls,
- crisp product cards,
- filter-heavy discovery experience,
- clear active states,
- responsive side drawers,
- minimal ornamentation,
- very little visual noise.

The storefront should feel like a blend of:

- Shopify-style clarity,
- modern electronics retail,
- premium SaaS polish,
- lightweight marketplace usability.

Avoid an overly “luxury fashion” appearance. This is an electronics store, so clarity, specifications, variants, trust, stock state, and price should remain more important than decorative styling.

---

# 3. Brand Personality

The brand should communicate:

- Reliable
- Modern
- Technically competent
- Fast
- Premium but accessible
- Clean
- Trustworthy

Do not use:
- playful cartoon styling,
- neon cyberpunk aesthetics,
- oversized decorative typography,
- excessive drop shadows.

**Liquid Glass is explicitly approved** for hero sections, navigation surfaces, card overlays,
drawer headers, and marketing strips. It must always serve legibility — glass effects must not
make text unreadable. Glass must degrade gracefully to solid surfaces on low-end devices
or when `prefers-reduced-transparency` is set.

---

# 4. Color System

Use design tokens. Do not scatter raw color values throughout components.

## 4.1 Light Theme

Suggested starting tokens:

```css
--background: #F5F7FC;
--surface: #FFFFFF;
--surface-subtle: #F8FAFD;
--surface-hover: #F3F5FA;

--text-primary: #0B1F33;
--text-secondary: #5F6B7A;
--text-muted: #8B95A5;

--border: #E4E9F1;
--border-strong: #D3DBE7;

--primary: #4F46F5;
--primary-hover: #4338E8;
--primary-soft: #EEF0FF;

--accent: #695CFF;
--accent-secondary: #3158FF;

--success: #13A66D;
--success-soft: #EAF8F2;

--warning: #E9A116;
--warning-soft: #FFF7E5;

--danger: #E84C5B;
--danger-soft: #FFF0F2;

--sale: #F04455;
--new: #13A66D;

--overlay: rgba(5, 17, 32, 0.42);
```

The primary visual impression should be:
- pale background,
- white content surfaces,
- navy text,
- blue-violet interaction color.

---

## 4.2 Dark Theme

Dark mode must be intentionally designed, not automatically inverted.

Suggested starting tokens:

```css
--background: #07111F;
--surface: #0D1B2A;
--surface-subtle: #122235;
--surface-hover: #172A40;

--text-primary: #F6F8FC;
--text-secondary: #B7C2D1;
--text-muted: #8593A6;

--border: #22354A;
--border-strong: #324A64;

--primary: #716BFF;
--primary-hover: #817CFF;
--primary-soft: #20214C;

--success: #37C58B;
--warning: #F0B84A;
--danger: #F36A75;
```

Do not use pure black as the dominant background.

---

# 5. Typography

Use a modern sans-serif that works well for interfaces.

Preferred:
1. Inter
2. Geist
3. Plus Jakarta Sans

Use one family throughout unless branding later requires otherwise.

## Type scale

```text
Display XL     48–56px / 1.05–1.1
Display        40–48px / 1.1
H1             32–40px / 1.15
H2             26–32px / 1.2
H3             20–24px / 1.25
Body Large     16–18px / 1.5
Body           14–16px / 1.5
Small          12–13px / 1.45
Micro          11–12px / 1.4
```

Weights:
- 400 regular,
- 500 medium,
- 600 semibold,
- 700 bold.

Avoid using 800/900 except for rare campaign headings.

Product names should normally be medium or semibold.

Prices should be semibold/bold.

---

# 6. Spacing System

Use a 4px base scale:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Rules:
- product cards: 12–16px internal padding,
- sidebar/filter groups: 16–20px vertical separation,
- page sections: 48–80px desktop,
- mobile sections: 28–48px,
- form field gap: 16px,
- major card gap: 20–24px.

Whitespace must feel intentional but not wasteful.

---

# 7. Radius System

Use restrained radii.

```text
xs: 6px
sm: 8px
md: 10px
lg: 12px
xl: 16px
drawer: 16–20px where visually appropriate
pill: 999px only for badges/chips
```

The main reference uses compact corners. Avoid the “everything is 24px rounded” look.

---

# 8. Elevation & Borders

Most surfaces should use borders rather than strong shadows.

## Default card
```text
1px solid border token
very subtle shadow, if any
```

Suggested shadow:
```css
box-shadow: 0 4px 16px rgba(16, 34, 58, 0.05);
```

## Floating drawer / dropdown
```css
box-shadow: 0 18px 50px rgba(12, 27, 48, 0.16);
```

Avoid heavy shadow stacking.

---

# 9. Responsive Breakpoints

Recommended:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1440px+
```

Primary content maximum width:
- approximately 1280–1440px.

Use responsive fluid gutters:
- mobile: 16px,
- tablet: 24px,
- desktop: 32–40px.

---

# 10. Global Page Structure

Desktop:

```text
Announcement bar (optional)
Header
Secondary category nav (optional)
Main content
Footer
```

Mobile:

```text
Compact header
Page content
Optional sticky bottom navigation
```

The store should not have a permanently huge header.

---

# 11. Header

## Desktop

Recommended layout:

```text
Logo | Search | Navigation / utilities
```

Utilities:
- Wishlist
- Account
- Cart

Search should be visually prominent for electronics.

Suggested desktop search:
- 360–520px wide,
- subtle tinted background,
- search icon left,
- clear button if populated,
- optional suggestion dropdown.

Header height:
- roughly 64–76px.

Optional secondary navigation:
- Shop
- Categories
- Deals
- New arrivals
- Brands
- Support

Use dropdowns sparingly.

---

## Mobile

Header:
- menu button,
- logo,
- search/cart icons.

Search may occupy:
- second row,
or
- expandable overlay.

If using a bottom navigation:
- Home
- Shop
- Search
- Cart
- Account

Do not duplicate too many navigation controls at once.

---

# 12. Homepage

Homepage should not mimic the filter reference literally; it should apply the same design language.

Recommended sequence:

1. Hero
2. Category shortcuts
3. Featured products
4. Promotional strip
5. New arrivals
6. Popular brands
7. Best sellers
8. Benefits/trust strip
9. Newsletter
10. Footer

---

## 12.1 Hero

Style:
- clean split layout,
- large product image,
- concise copy,
- one strong primary CTA,
- optional secondary CTA.

Do not place more than 2 CTAs.

Example composition:

```text
[Eyebrow]
Latest tech, better prices.

Premium electronics
without the noise.

[Shop Now] [Browse Deals]

                       [Hero product imagery]
```

Use dark navy or subtle tinted hero surface rather than a busy image background.

---

# 13. Category Navigation

Use icon + label category tiles inspired by the reference's category icon filter.

Electronics examples:
- Phones
- Laptops
- Audio
- Gaming
- Smart Home
- Accessories

Desktop:
- horizontal row/grid.

Mobile:
- horizontally scrollable cards or 2–3 column compact grid.

Selected category:
- primary-soft background,
- primary border/icon.

---

# 14. Product Listing / Shop Page

This is the most important page for matching the primary reference.

## Desktop structure

```text
----------------------------------------------------------
| Filter sidebar | Results toolbar                       |
|                | Product grid                          |
|                | Product grid                          |
|                | Product grid                          |
----------------------------------------------------------
```

Recommended proportions:
- sidebar: 240–280px,
- content: remaining width.

Product grid:
- 3 columns on medium desktop,
- 4 columns on wide desktop.

---

# 15. Filter Sidebar

Primary visual reference: supplied Filter & Sort UI.

Filters should be grouped in expandable sections.

Recommended filters for electronics:
- Category
- Brand
- Price Range
- Availability
- Rating
- Storage
- RAM
- Screen Size
- Connectivity
- Condition, if relevant

Each group:
- title,
- expand/collapse chevron,
- options,
- counts where helpful.

Example:

```text
Brand
☐ Apple        (24)
☐ Samsung      (18)
☐ Sony         (12)
☐ HP            (9)
```

Controls:
- compact checkbox,
- 36–40px minimum interactive height where needed,
- muted count,
- primary selection state.

Use “Clear all” near filter heading.

---

# 16. Price Range

Use:
- dual handle slider if reliable/accessibly implemented,
- minimum and maximum numeric inputs.

Example:

```text
Price Range
────────●════════●────
₦ 0          ₦ 2,000,000
```

Inputs should remain manually editable.

Mobile slider must not require pixel-perfect finger movement to work.

---

# 17. Shop Results Toolbar

Desktop toolbar:

```text
Showing 1–12 of 256 products
                     Sort by: Popularity
                     [Grid] [List]
```

Possible controls:
- result count,
- active category title,
- sort,
- grid/list toggle,
- product count per page only if genuinely useful.

Do not overload the toolbar.

---

# 18. Sort Menu

Options:
- Popularity
- Newest first
- Price: low to high
- Price: high to low
- Best selling
- Customer rating

Desktop:
- select/dropdown.

Mobile:
- bottom sheet or compact menu.

Selected sort:
- visible check mark,
- soft primary background.

---

# 19. Active Filter Chips

Above product grid or inside mobile filters:

```text
[Samsung ×]
[₦200k – ₦800k ×]
[4★ & Up ×]

Clear all
```

Chip:
- soft neutral or primary-soft background,
- small radius/pill,
- close icon,
- 28–34px height.

---

# 20. Product Card

The product card should strongly reflect the primary reference.

Structure:

```text
┌───────────────────────────┐
│ [Badge]              ♡    │
│                           │
│       Product image       │
│                           │
│ ○ ○ ○  optional variants  │
│ Product category/brand    │
│ Product name              │
│ ★ 4.8 (126 reviews)       │
│ ₦450,000  ₦499,000  -10%  │
│ [      Add to Cart      ] │
└───────────────────────────┘
```

Rules:
- image area has stable aspect ratio,
- image uses object-contain for electronics,
- product name max 2 lines,
- secondary metadata subtle,
- current price visually strongest,
- old price muted + strikethrough,
- discount in success color,
- badges top-left,
- wishlist top-right.

Button:
- dark/navy or primary depending on page,
- full width,
- compact,
- icon optional.

Reference-like dark “Add to Cart” buttons are encouraged.

Hover:
- slight elevation/border emphasis,
- image scale max ~1.02–1.04,
- do not make card jump.

---

# 21. Product Badges

Supported:
- Sale
- New
- Bestseller
- Low stock
- Out of stock

Style:
- tiny pill,
- 11–12px text,
- semibold,
- strong contrast.

Examples:
- Sale → danger/red.
- New → success/green.
- Bestseller → primary/violet.

No more than 2 badges should compete at once.

---

# 22. Product Quick Actions

Desktop may show:
- wishlist,
- quick view.

Mobile should prioritize:
- wishlist,
- add to cart.

Quick view is optional. Do not implement it if it delays core flows.

---

# 23. Grid / List Toggle

Inspired by reference.

Grid is default.

List mode:
- thumbnail left,
- title/spec summary center,
- price/action right on desktop.

On small mobile screens, list mode may be disabled if it harms usability.

---

# 24. Mobile Filter Experience

The primary reference uses a mobile filter drawer.

Use a right-side drawer or bottom sheet.

Preferred:
- right-side full-height drawer for filter-heavy shopping,
- bottom sheet for sort.

Drawer structure:

```text
Filters                           ×

Category                      ⌃
...
Price Range                   ⌃
...
Brand                         ⌃
...
Rating                        ⌃
...

[Apply Filters (3)]
[Reset]
```

Rules:
- header remains visible,
- content scrolls,
- footer actions remain sticky,
- selected count shown,
- background page dimmed,
- escape/back closes drawer,
- focus trapped,
- restore focus on close.

---

# 25. Product Detail Page

Desktop:
- gallery left,
- product info right.

Suggested proportions:
- 55% imagery,
- 45% information.

Product info order:
1. Brand / category
2. Product title
3. Rating
4. Price / discount
5. Short description
6. Variant controls
7. Stock status
8. Quantity
9. Add to cart
10. Buy now optional
11. Wishlist
12. Delivery / returns / secure payment reassurance

Below:
- Overview
- Specifications
- Reviews
- Related products

For electronics, specifications should be easy to scan.

Use two-column spec rows on desktop:
```text
Processor       Apple M4
Memory          16 GB
Storage         512 GB SSD
Display         14.2"
```

---

# 26. Variant Selector

Electronics variants might include:
- color,
- storage,
- RAM,
- connectivity.

Use buttons/cards rather than generic selects where practical.

Example:

```text
Storage
[128 GB] [256 GB] [512 GB]

Color
[● Black] [● Silver] [● Blue]
```

Unavailable variant:
- disabled,
- reduced contrast,
- optional diagonal strike.

Selected:
- primary border,
- subtle primary-soft background.

---

# 27. Cart Drawer

The secondary visual reference is used here.

Desktop:
- right-side slide-in drawer,
- page behind receives dark translucent overlay.

Width:
- ~400–460px.

Mobile:
- near/full width drawer.

Structure:

```text
Your Cart (3)                         ×

[img] Product name
      variant
      price
      [-] 1 [+]                  trash

...

Subtotal                         ₦...
Discount                         -₦...
Shipping                         Free
--------------------------------------
Total                            ₦...

[Proceed to Checkout]
[View Cart]
```

Drawer should:
- update quantities inline,
- remove items,
- show subtotal immediately,
- keep checkout CTA visible,
- not require a full page refresh.

---

# 28. Cart Removal

Avoid intrusive confirmation for every removal.

Preferred:
- remove immediately,
- show toast: “Item removed — Undo”.

Use confirmation only for destructive bulk actions if needed.

This is smoother than the reference's dedicated remove confirmation card.

---

# 29. Cross-sell in Cart

Optional, based on secondary reference.

At bottom of cart drawer:
- “You may also like”
- max 2–3 compact products.

Do not let cross-sells push checkout action far below the fold.

---

# 30. Empty Cart

Use:
- simple line illustration/icon,
- title,
- short explanation,
- primary or outline “Continue Shopping” button.

Example:

```text
Your cart is empty

You have not added anything yet.

[Continue Shopping]
```

Avoid childish illustration styling.

---

# 31. Full Cart Page

Desktop layout:
- cart items left,
- summary card right.

Summary card may be sticky.

Mobile:
- stacked,
- checkout summary near bottom,
- optional sticky checkout bar.

Coupon belongs in summary.

---

# 32. Checkout

Checkout should feel quieter than the storefront.

No large promotional navigation.

Desktop layout:

```text
Checkout form                         Order summary
```

Suggested:
- 60 / 40 split.

Sections:
1. Contact
2. Shipping address
3. Payment
4. Order summary

Use cards sparingly. Prefer clean grouped sections with dividers.

Primary CTA:
- “Pay ₦XXX,XXX”

Order summary should remain sticky on desktop where possible.

---

# 33. Checkout Form Inputs

Height:
- 44–48px.

Style:
- white/surface background,
- subtle border,
- 8–10px radius,
- visible focus ring using primary color.

Labels must remain visible.

Do not use placeholder-only labels.

Validation:
- inline below field,
- danger color,
- concise message.

---

# 34. Authentication Screens

Use clean centered or split layout.

Preferred desktop:
- illustration/product/lifestyle panel,
- form panel.

Mobile:
- form only,
- decorative panel removed.

Sign-in options:
- Google button,
- divider,
- email/password.

Google button:
- neutral outline,
- Google icon,
- “Continue with Google”.

Do not style Google auth as the same primary filled button.

---

# 35. Account Area

Desktop:
- left navigation + content.

Navigation:
- Overview
- Orders
- Wishlist
- Addresses
- Profile
- Sign out

Mobile:
- top tabs, accordion, or menu.

Order cards:
- order number,
- date,
- total,
- status,
- View order.

Status badges:
- pending → warning,
- paid → primary,
- processing → blue,
- shipped → violet,
- delivered → success,
- cancelled/refunded → muted/danger.

---

# 36. Admin Dashboard

Admin should use the same design tokens but a denser layout.

Desktop:
- collapsible left sidebar,
- top bar,
- main content.

Sidebar:
- Dashboard
- Products
- Categories
- Orders
- Customers
- Inventory
- Reviews
- Coupons
- Settings

Use navy / dark sidebar in light theme if desired, while retaining the same primary accent.

---

# 37. Admin Dashboard Cards

Metrics:
- Revenue
- Orders
- Customers
- Average Order Value
- Low Stock

Cards:
- compact,
- white surface,
- thin border,
- 12px radius,
- restrained icon background.

Do not overuse gradients.

---

# 38. Admin Tables

Use clean data tables.

Rules:
- sticky header if long,
- row hover,
- 44–52px row height,
- server pagination,
- column sorting where relevant,
- filters above table,
- compact actions menu.

Status displayed as badges.

Mobile:
- switch to stacked record cards if table becomes unusable.

---

# 39. Product Admin Form

Break into meaningful sections:

```text
Basic Information
Media
Pricing
Variants
Inventory
Category / Brand
SEO
Publishing
```

Desktop may use:
- main content + sticky publishing sidebar.

Avoid one enormous form with no grouping.

---

# 40. Buttons

## Primary
- filled primary or dark navy,
- white text,
- 40–46px height.

## Secondary
- white/surface,
- border,
- dark text.

## Ghost
- transparent,
- hover surface.

## Danger
- danger-soft or danger fill where appropriate.

Rules:
- one dominant primary action per local region,
- icon buttons have tooltips on desktop,
- minimum touch target ~44px when standalone.

---

# 41. Iconography

Use Lucide.

Recommended stroke:
- default Lucide stroke,
- consistent sizing.

Common:
- Search
- Heart
- ShoppingCart
- User
- SlidersHorizontal
- Grid2X2
- List
- ChevronDown
- X
- Trash2
- Plus
- Minus
- Star
- Package
- Truck
- ShieldCheck

Do not mix icon families unnecessarily.

---

# 42. Form Controls

Checkbox:
- compact square,
- primary fill when checked.

Radio:
- clear selected ring/dot.

Switch:
- use for boolean admin settings.

Select:
- custom accessible select using shadcn/Radix.

Slider:
- accessible keyboard controls.

---

# 43. Toasts

Position:
- desktop: top-right or bottom-right,
- mobile: bottom with safe area.

Examples:
- Added to cart.
- Added to wishlist.
- Coupon applied.
- Item removed. Undo
- Address saved.

Do not use toasts for errors that require user action inside a form; show those inline too.

---

# 44. Loading States

Use skeletons.

Examples:
- product card skeleton,
- product page gallery skeleton,
- table rows,
- order summary.

Avoid blocking full-screen spinners for ordinary navigation.

Buttons may show:
- spinner + “Adding…”
- spinner + “Processing…”

Disable repeat submission during mutation.

---

# 45. Empty States

Every major list needs a designed empty state:
- cart,
- wishlist,
- orders,
- search results,
- admin products,
- reviews.

Structure:
- icon/illustration,
- title,
- concise explanation,
- one useful CTA.

---

# 46. Error States

Examples:
- Product unavailable.
- Could not load products.
- Payment verification still pending.
- Invalid coupon.
- Search returned no results.

Do not show raw API errors.

---

# 47. Motion

Keep motion restrained.

Recommended:
- drawer 180–240ms,
- dropdown 120–180ms,
- hover 120–160ms,
- toast 180–220ms.

Use ease-out.

Respect `prefers-reduced-motion`.

No large parallax effects.

---

# 48. Image Treatment

Product imagery:
- neutral or very light backgrounds,
- object-contain,
- 1:1 or 4:3 product card ratio,
- consistent padding around product.

Hero imagery may be larger and more editorial.

Do not distort uploaded media.

Use Next.js image optimization where appropriate.

---

# 49. Electronics-Specific Product Card Enhancements

Where useful, show one short spec line under title:

Examples:
- `256 GB · 8 GB RAM`
- `14" · M4 · 16 GB`
- `ANC · 30 hr battery`

Keep it concise.

Do not overload cards with full specs.

---

# 50. Trust / Benefit Strip

Inspired by the secondary reference.

Possible items:
- Free Shipping
- Secure Payment
- Genuine Products
- Easy Returns

Use small line icons and short labels.

Desktop:
- horizontal strip.

Mobile:
- 2×2 grid or horizontal scroll.

---

# 51. Footer

Use dark navy footer in light theme.

Sections:
- Shop
- Support
- Company
- Account
- Newsletter

Bottom:
- copyright,
- privacy,
- terms,
- payment icons where appropriate.

Do not make footer visually louder than the store.

---

# 52. Mobile Sticky Behaviors

Recommended:
- product page: sticky bottom add-to-cart bar,
- shop: sticky filter/sort toolbar when useful,
- checkout: sticky pay button only if it does not cover form content.

Respect mobile safe-area insets.

---

# 53. Breakpoint Behavior Summary

## ≥ 1280px
- 4-column product grid.
- persistent filter sidebar.
- full header navigation.

## 1024–1279px
- 3-column product grid.
- filter sidebar remains if space permits.

## 768–1023px
- 2–3 columns.
- filters may become drawer.
- compact navigation.

## < 768px
- 2-column product grid where cards remain readable.
- 1 column for dense list view or very narrow screens.
- filter drawer.
- bottom-sheet sort.
- compact header.
- cart drawer full width.

## < 380px
- consider 1-column cards if product card content becomes cramped.

---

# 54. Accessibility Requirements

Target WCAG 2.2 AA.

Mandatory:
- keyboard navigation,
- semantic headings,
- accessible names,
- visible focus state,
- minimum contrast,
- labels,
- error associations,
- reduced motion handling,
- focus trap in drawers/dialogs,
- focus restoration on close.

Do not communicate status through color alone.

---

# 55. Design Tokens in Tailwind

Antigravity should map semantic tokens into CSS variables and Tailwind.

Use semantic classes rather than literal colors where possible:

```text
bg-background
bg-card
text-foreground
text-muted-foreground
border-border
bg-primary
text-primary-foreground
bg-destructive
```

Extend with store-specific tokens only where needed:
- success,
- warning,
- sale,
- surface-subtle.

---

# 56. Component Inventory

Implement/reuse:

## Global
- AppHeader
- MobileHeader
- SearchBox
- CategoryNav
- ThemeToggle
- AppFooter
- MobileBottomNav

## Catalog
- ProductCard
- ProductGrid
- ProductListItem
- ProductBadge
- PriceDisplay
- RatingDisplay
- WishlistButton
- CategoryTile
- FilterSidebar
- MobileFilterDrawer
- PriceRangeFilter
- ActiveFilterChips
- SortSelect
- ViewToggle

## Product
- ProductGallery
- VariantSelector
- QuantityControl
- StockBadge
- SpecificationsTable
- ReviewsSummary
- ReviewCard

## Cart
- CartDrawer
- CartLineItem
- CartSummary
- CouponInput
- EmptyCart
- CrossSellStrip

## Checkout
- CheckoutSection
- AddressForm
- AddressPicker
- CheckoutSummary
- PaymentButton

## Account
- AccountSidebar
- OrderCard
- OrderStatusBadge
- AddressCard

## Admin
- AdminSidebar
- AdminHeader
- MetricCard
- DataTable
- StatusBadge
- ProductForm
- VariantEditor
- InventoryEditor

---

# 57. Reference Translation Rules

The supplied filter/sort design is the **highest-priority inspiration**.

Antigravity should retain these qualities:
- white product surface on pale background,
- left filter sidebar desktop,
- filter drawer mobile,
- blue-violet selection color,
- dark navy product CTA,
- compact product cards,
- visible ratings and discounts,
- grid/list control,
- active filter chips,
- clean sorting dropdown.

From the cart reference, use:
- right-side slide-in cart,
- inline quantity controls,
- summary + checkout CTA,
- mobile drawer adaptation,
- simple empty-cart state,
- optional cross-sell.

Do NOT copy:
- logos,
- exact text,
- exact product imagery,
- exact branding,
- exact composition measurements,
- creator branding/footer,
- UI numbering,
- decorative handwritten annotations.

---

# 58. Storefront Design Acceptance Criteria

Before storefront UI is considered complete:

- [ ] Light theme feels coherent.
- [ ] Dark theme is intentionally styled.
- [ ] Shop page visually follows the primary reference direction.
- [ ] Desktop filter sidebar works.
- [ ] Mobile filter drawer works.
- [ ] Sort works on desktop/mobile.
- [ ] Product grid is responsive.
- [ ] Product cards have consistent image dimensions.
- [ ] Active filter chips are usable.
- [ ] Cart drawer works from header.
- [ ] Quantity changes happen without page reload.
- [ ] Empty cart is designed.
- [ ] Product page variants are obvious.
- [ ] Mobile product page has a usable purchase flow.
- [ ] Checkout is quiet and focused.
- [ ] Forms have visible labels and validation.
- [ ] Account pages are responsive.
- [ ] Admin layout is coherent with storefront tokens.
- [ ] Focus states are visible.
- [ ] No component relies on hover alone.
- [ ] Reduced-motion preference is respected.
- [ ] No obvious layout shift occurs during common loading states.

---

# 59. Antigravity Visual QA Checklist

For every completed screen, check:

### Hierarchy
- Is the most important action obvious?
- Is price visually clear?
- Are secondary details subordinate?

### Spacing
- Are cards padded consistently?
- Are neighboring sections clearly separated?
- Is mobile content touching screen edges?

### Responsiveness
- Does it work at 320px?
- 375px?
- 768px?
- 1024px?
- 1440px?

### Interaction
- Are buttons large enough?
- Are hover/focus/pressed/disabled states implemented?
- Can drawers be closed with keyboard/back action?

### Consistency
- Same radius scale?
- Same border language?
- Same icon family?
- Same price formatting?
- Same status badge logic?

### Performance
- Are images optimized?
- Are unnecessary Client Components avoided?
- Are skeletons stable in size?

---

# 60. Design Implementation Order

Do not implement every screen independently.

Recommended sequence:

1. Design tokens / theme.
2. Typography.
3. Buttons / fields / badges.
4. Global header/footer.
5. Product card.
6. Product grid.
7. Filter sidebar.
8. Mobile filter drawer.
9. Sort + filter chips.
10. Product page.
11. Cart drawer.
12. Full cart.
13. Checkout.
14. Auth.
15. Account.
16. Admin shell.
17. Admin tables/forms.
18. Accessibility pass.
19. Dark mode refinement.
20. Mobile QA.

This order prevents inconsistent one-off styling.

---

# 61. Final Visual Target

When the user opens the application, it should immediately feel like a polished modern electronics retailer.

The shop page should be the strongest expression of the supplied primary reference:

- pale background,
- crisp white shop surface,
- organized left filter panel,
- neat product grid,
- clean sorting controls,
- restrained blue-violet accents,
- high-contrast dark purchase buttons,
- product-first visual hierarchy.

The cart should then adopt the secondary reference's strongest idea:

- fast slide-in interaction,
- editable quantities,
- immediate totals,
- obvious checkout action.

The entire product must feel like one system, not a collection of copied screens.

---

# 62. Liquid Glass Visual System

## 62.1 What "Liquid Glass" means for this product

Liquid Glass is a surface treatment that combines:
- translucent frosted background blur (`backdrop-filter: blur`),
- a thin luminous inner border that catches light,
- a very subtle inner-shadow to create depth,
- gentle refraction hinting via layered gradients,
- animated fluid movement (via GSAP) that responds to scroll or pointer.

It is **not** the iOS 7 flat-glass look. It is not neon. It reads like a premium,
softly lit glass panel sitting above the page background.

## 62.2 Approved Glass Surfaces

| Surface | Usage |
|---|---|
| `glass-nav` | Main header/nav bar — frosted blur over hero/page content |
| `glass-hero` | Hero section background panel |
| `glass-card` | Marketing or featured product cards |
| `glass-drawer-header` | Cart / filter drawer header strip |
| `glass-badge` | Floating promo badges on hero |
| `glass-tooltip` | Contextual info overlays |

Do NOT apply glass to:
- main product grid cards (use white surface — legibility first),
- checkout form sections (clarity required),
- admin data tables,
- error/warning alerts.

## 62.3 Glass CSS Tokens

Add to the design token layer:

```css
/* Light */
--glass-bg: rgba(255, 255, 255, 0.55);
--glass-border: rgba(255, 255, 255, 0.75);
--glass-blur: 18px;
--glass-shadow: 0 8px 32px rgba(16, 34, 58, 0.10),
                inset 0 1px 0 rgba(255, 255, 255, 0.80);
--glass-highlight: linear-gradient(
  135deg,
  rgba(255,255,255,0.40) 0%,
  rgba(255,255,255,0.05) 100%
);

/* Dark */
--glass-bg-dark: rgba(13, 27, 42, 0.55);
--glass-border-dark: rgba(255, 255, 255, 0.10);
--glass-shadow-dark: 0 8px 32px rgba(0, 0, 0, 0.35),
                     inset 0 1px 0 rgba(255, 255, 255, 0.08);
```

## 62.4 Glass Utility Classes

Create a `glass` utility in globals.css:

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.dark .glass {
  background: var(--glass-bg-dark);
  border-color: var(--glass-border-dark);
  box-shadow: var(--glass-shadow-dark);
}
```

## 62.5 Graceful Degradation

When `@media (prefers-reduced-transparency: reduce)` is active:

```css
@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: var(--surface);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

---

# 63. GSAP Animation System

## 63.1 Package

Install:
```bash
npm install gsap
```

GSAP is a **client-side only** library. Only import it inside:
- `"use client"` components,
- `useEffect` or `useGSAP` hooks.

Never import GSAP at the module level in Server Components.

Use the `useGSAP` hook from `@gsap/react` where available for automatic cleanup:
```bash
npm install @gsap/react
```

## 63.2 Animation Principles

| Rule | Requirement |
|---|---|
| Duration | Hero reveals: 0.8–1.2s. Micro-interactions: 0.15–0.3s. Scroll triggers: 0.6–1.0s. |
| Easing | `power2.out` for entrances. `power2.inOut` for state transitions. `elastic.out(1, 0.5)` for bouncy glass settle only. |
| Stagger | Product grids: 0.06s per card. Category tiles: 0.08s. |
| Scroll | Use `ScrollTrigger` plugin. Scrub animated glass blur on hero scroll. |
| Reduced motion | Wrap all GSAP animations in a `prefersReducedMotion` check. Fall back to instant CSS transitions. |

## 63.3 Required Animations

### Hero Section
- **Glass panel reveal**: `gsap.from(".hero-glass", { opacity: 0, y: 30, duration: 1, ease: "power2.out" })`
- **Headline stagger**: words or lines animate in with `SplitText` or manual span wrapping, stagger 0.04s
- **CTA button**: scale from 0.92 → 1, opacity 0 → 1 with slight delay
- **Hero product image**: parallax shift on scroll via `ScrollTrigger` (y: 0 → -40px over scroll range)
- **Floating glass badge** (e.g. "New Arrival"): gentle float loop `y: -8px` over 2.5s, `yoyo: true, repeat: -1`

### Header / Nav
- **Glass nav entrance**: slide down from y: -20, opacity 0 → 1 on mount
- **Scroll behavior**: at scroll > 60px, transition nav to denser glass (more blur, slightly opaque) — animate via `gsap.to`
- **Cart badge pop**: scale 1 → 1.3 → 1 on item count change, duration 0.25s

### Product Grid
- **Card entrance on scroll**: `ScrollTrigger` batch — each card fades and translates from `y: 24, opacity: 0`
- **Card hover**: subtle lift via `gsap.to(el, { y: -4, duration: 0.2 })` — complement CSS shadow
- **Wishlist heart**: burst scale animation on toggle

### Cart Drawer
- **Drawer slide-in**: `gsap.from(".cart-drawer", { x: "100%", duration: 0.3, ease: "power2.out" })`
- **Line items stagger**: items animate in with `y: 10, opacity: 0`, stagger 0.05s
- **Quantity change**: number flip / scale pulse

### Category Tiles
- **Entrance**: stagger from `y: 20, opacity: 0` on page load or scroll into view

### Page Transitions
- Use a lightweight fade (opacity) between route changes where `next/navigation` allows.
- Do not use heavy 3D page flip effects.

## 63.4 ScrollTrigger Setup

Register in a top-level client component:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Only register once — place in a layout-level client component or a singleton module.

## 63.5 Animation Performance Rules

- Animate only `transform` and `opacity` (GPU-composited).
- Do not animate `width`, `height`, `top`, `left` directly.
- Use `will-change: transform` on heavy animated elements.
- Kill ScrollTrigger instances on component unmount.
- Batch `ScrollTrigger.batch` for grid animations.
- Never block the main thread with long GSAP timelines on every render.

## 63.6 Reduced Motion Guard

```ts
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  // run GSAP animation
}
```

## 63.7 Liquid Glass + GSAP Combined Effects

### Glass hover refraction
On card hover, animate the inner highlight gradient position:
```ts
gsap.to(card, {
  "--glass-highlight-angle": "160deg",
  duration: 0.4,
  ease: "power1.out",
});
```
(Requires a CSS custom property that drives a `background` gradient.)

### Hero glass breathing
A gentle scale/blur pulse on the hero glass panel:
```ts
gsap.to(".hero-glass-blob", {
  scale: 1.04,
  opacity: 0.7,
  duration: 3.5,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1,
});
```

### Nav glass intensification on scroll
```ts
ScrollTrigger.create({
  start: 60,
  onEnter: () =>
    gsap.to("nav", { "--glass-blur": "28px", duration: 0.4 }),
  onLeaveBack: () =>
    gsap.to("nav", { "--glass-blur": "18px", duration: 0.4 }),
});
```

---

# 64. Updated Design Acceptance Criteria (Liquid Glass + GSAP)

In addition to the criteria in §58:

- [ ] Hero section has liquid glass panel with GSAP entrance animation.
- [ ] Navigation bar uses glass surface and transitions on scroll.
- [ ] Product card hover is animated via GSAP (lift + shadow).
- [ ] Product grid cards use ScrollTrigger stagger entrance.
- [ ] Cart drawer uses GSAP slide-in with item stagger.
- [ ] Cart badge count change triggers a pop animation.
- [ ] Wishlist heart button has a burst animation.
- [ ] All GSAP animations are skipped when `prefers-reduced-motion: reduce` is set.
- [ ] Glass surfaces degrade to solid backgrounds when `prefers-reduced-transparency: reduce` is set.
- [ ] GSAP is never imported in Server Components.
- [ ] ScrollTrigger instances are cleaned up on unmount.
- [ ] Animations do not cause layout shift (only transform/opacity animated).

---

# 65. Kalki Design System

Implementation spec for the Kalki Design System design system.
Generated from brand `#4F46E5` and typeface `Inter` on 2026-10-02.

This document and the Figma file are produced from the same source, so they
cannot disagree. Regenerate both together rather than editing either by hand.

## Rules

1. **Components read semantic tokens only.** Never a primitive, never a raw hex.
   This is what makes a rebrand a one-file change.
2. **Primitives are the palette, semantics are the API.** `brand/600` is a colour;
   `action/primary/rest` is a decision. Application code consumes the second.
3. **Spacing steps are named, not sized.** `space/4` stays `space/4` if the scale
   is retuned; `12px` does not.
4. **Every interactive element has a visible focus state.** It is a peer of hover
   and pressed, not an afterthought.
5. **Colour is never the only signal.** Pair it with a word, an icon or a shape.

## Getting the tokens

The tables below are the reference. The same values are repeated at the end
of this document as CSS custom properties and as JSON, ready to paste into a
build — see Appendix: tokens as code.

## Colour

### Primitives

| Step | brand | neutral | success | warning | danger | info |
| --- | --- | --- | --- | --- | --- | --- |
| 50 | `#F3F5FF` | `#F4F5F9` | `#EEF9EF` | `#FDF4E8` | `#FFF2F0` | `#EEF7FF` |
| 100 | `#E4E9FF` | `#E8E9F0` | `#D6F3DB` | `#FCE7C7` | `#FFE2DE` | `#DAECFF` |
| 200 | `#CFD7FF` | `#D7D9E1` | `#B3E9BD` | `#F9D398` | `#FFCBC4` | `#BBDDFF` |
| 300 | `#B8C2FF` | `#C4C6D1` | `#8DDC9E` | `#F3BC62` | `#FFAFA5` | `#98CCFF` |
| 400 | `#98A4FF` | `#A9ACB9` | `#5EC679` | `#E29E00` | `#FF8276` | `#5FB3FF` |
| 500 | `#7A84FF` | `#9093A0` | `#34AE5B` | `#C18700` | `#F2584F` | `#2C99F0` |
| 600 | `#6261FF` | `#797C89` | `#139546` | `#A47200` | `#D5413A` | `#0681D4` |
| 700 | `#4F46E5` | `#626570` | `#037A36` | `#865C00` | `#B0312C` | `#0069AE` |
| 800 | `#3D37B6` | `#4E5059` | `#05612B` | `#6B4900` | `#8D2722` | `#00538C` |
| 900 | `#312D91` | `#3E3F47` | `#0A4D22` | `#563A00` | `#70201C` | `#054270` |
| 950 | `#1D1C5C` | `#26272D` | `#083115` | `#372400` | `#471411` | `#062A47` |

The step marked in the Figma file with a star is the brand colour exactly as it
was entered. Ramps are generated in OKLCH, so the steps are perceptually even.

### Semantic tokens

Each token resolves to a primitive. Only a light mode was generated.

| Token | Light |
| --- | --- |
| `bg/canvas` | `neutral/50` |
| `bg/surface` | `base/white` |
| `bg/subtle` | `neutral/100` |
| `bg/muted` | `neutral/200` |
| `bg/inverse` | `neutral/900` |
| `text/primary` | `neutral/900` |
| `text/secondary` | `neutral/700` |
| `text/muted` | `neutral/500` |
| `text/disabled` | `neutral/400` |
| `text/inverse` | `base/white` |
| `text/brand` | `brand/700` |
| `border/subtle` | `neutral/200` |
| `border/default` | `neutral/300` |
| `border/strong` | `neutral/400` |
| `border/focus` | `brand/500` |
| `action/primary/rest` | `brand/700` |
| `action/primary/hover` | `brand/800` |
| `action/primary/pressed` | `brand/900` |
| `action/primary/disabled` | `neutral/200` |
| `action/secondary/rest` | `base/white` |
| `action/secondary/hover` | `brand/50` |
| `action/secondary/pressed` | `brand/100` |
| `action/tertiary/hover` | `neutral/100` |
| `action/tertiary/pressed` | `neutral/200` |
| `action/danger/rest` | `danger/600` |
| `action/danger/hover` | `danger/700` |
| `action/danger/pressed` | `danger/800` |
| `text/on-brand` | `base/white` |
| `text/on-danger` | `base/white` |
| `feedback/success/bg` | `success/50` |
| `feedback/success/border` | `success/200` |
| `feedback/success/solid` | `success/600` |
| `feedback/success/text` | `success/700` |
| `feedback/warning/bg` | `warning/50` |
| `feedback/warning/border` | `warning/200` |
| `feedback/warning/solid` | `warning/600` |
| `feedback/warning/text` | `warning/700` |
| `feedback/danger/bg` | `danger/50` |
| `feedback/danger/border` | `danger/200` |
| `feedback/danger/solid` | `danger/600` |
| `feedback/danger/text` | `danger/700` |
| `feedback/info/bg` | `info/50` |
| `feedback/info/border` | `info/200` |
| `feedback/info/solid` | `info/600` |
| `feedback/info/text` | `info/700` |

## Scale

### Spacing

| Token | Value |
| --- | --- |
| `space/0` | 0px |
| `space/1` | 2px |
| `space/2` | 4px |
| `space/3` | 8px |
| `space/4` | 12px |
| `space/5` | 16px |
| `space/6` | 20px |
| `space/7` | 24px |
| `space/8` | 32px |
| `space/9` | 40px |
| `space/10` | 48px |
| `space/11` | 64px |

### Radius

| Token | Value |
| --- | --- |
| `radius/none` | 0px |
| `radius/sm` | 4px |
| `radius/md` | 8px |
| `radius/lg` | 12px |
| `radius/xl` | 16px |
| `radius/2xl` | 24px |
| `radius/full` | 9999px |

### Control heights

| Token | Value |
| --- | --- |
| `control/height/sm` | 32px |
| `control/height/md` | 40px |
| `control/height/lg` | 48px |

## Typography

Family: `Inter`. Scale is 1.25 from a 16px base.

| Token | Size | Line height | Weight | Tracking |
| --- | --- | --- | --- | --- |
| `display` | 48px | 56px | bold | -1.5px |
| `heading-1` | 38px | 46px | bold | -1px |
| `heading-2` | 30px | 38px | semibold | -0.5px |
| `heading-3` | 24px | 32px | semibold | -0.25px |
| `heading-4` | 20px | 28px | semibold | 0px |
| `body-lg` | 18px | 28px | regular | 0px |
| `body` | 16px | 24px | regular | 0px |
| `body-sm` | 14px | 20px | regular | 0px |
| `label` | 14px | 20px | medium | 0px |
| `caption` | 12px | 16px | regular | 0.2px |

## Components

### Button

The primary action control. Layout covers label-only, icon with label on either side, and icon-only — so an icon button is a variant of the same component rather than a separate one that drifts out of sync.

**Matrix:** 4 tones · 3 sizes · 4 states · 4 layouts

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Tone` | Variant | Primary, Secondary, Tertiary, Danger |
| `Size` | Variant | Small, Medium, Large |
| `State` | Variant | Default, Hover, Pressed, Disabled |
| `Layout` | Variant | Label only, Icon left, Icon right, Icon only |
| `Label` | Text | Any — absent on the icon-only layout |
| `Icon` | Instance swap | Any 16px icon component |
| `Focused` | Boolean | Shows the keyboard focus ring |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | Resting fill | `action/*/rest` |
| Hover | Fill steps one shade darker | `action/*/hover` |
| Pressed | Fill steps two shades darker | `action/*/pressed` |
| Focused | 2px ring outside the container, combines with any other state | `border/focus` |
| Disabled | Flat neutral fill, muted label, no interaction | `action/primary/disabled, text/disabled` |

#### Specs

| Element | Small | Medium | Large |
| --- | --- | --- | --- |
| Vertical padding | space/2 · 4px | space/4 · 12px | space/5 · 16px |
| Horizontal padding | space/4 · 12px | space/5 · 16px | space/6 · 20px |
| Icon-only padding | space/3 · 8px | space/4 · 12px | space/5 · 16px |
| Gap | space/2 · 4px | space/3 · 8px | space/3 · 8px |
| Icon size | 14px | 16px | 20px |
| Label | body-sm | body-sm | body |
| Corner radius | radius/md · 8px | radius/md · 8px | radius/md · 8px |

#### Do

- Use one Primary button per view, for the single action you most want taken.
- Lead the label with a verb — “Save changes”, “Create project”, “Send invite”.
- Reserve Danger for destructive, irreversible actions such as deleting an account.
- Pair an icon with a label wherever there is room; the icon speeds recognition.

#### Don't

- Don’t place two Primary buttons side by side — nothing then reads as the default.
- Don’t write vague labels like “OK”, “Submit” or “Click here”.
- Don’t use Danger to mean “important”. It means “this cannot be undone”.
- Don’t use icon-only in a row of labelled buttons; the odd one out reads as decoration.

#### Accessibility

- Icon-only buttons need an accessible name — aria-label in code, a tooltip in the design.
- Every tone/label pairing is generated at 4.5:1 or better against its fill.
- Small at 32px high is below the 44px touch target guidance; keep it to pointer-first UI.
- Hover and Pressed are prototyping aids. In code, drive them from :hover and :active.

#### Related

- **Alert** — Alerts that need acting on carry a button — keep it Secondary so it does not outrank the page’s primary action.
- **Card** — A card’s primary action belongs inside the card it acts on, not in a toolbar above it.
- **Tooltip** — The icon-only layout needs one; the glyph alone is rarely unambiguous.

### Input

Text entry in all the shapes a real form needs. The component is the whole field — label, control and helper text — because a bare box can't express “label on top, message underneath”.

**Matrix:** 7 types · 4 states

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Type` | Variant | Text, Phone, Password, Multiselect, Quantity, Textarea, Card |
| `State` | Variant | Default, Focus, Error, Disabled |
| `Label` | Text | Any |
| `Value` | Text | Any |
| `Helper text` | Text | Any |
| `Show label` | Boolean | Default on |
| `Show helper text` | Boolean | Default on |
| `Show leading icon` | Boolean | Text type — default off |
| `Show trailing icon` | Boolean | Text type — default off |
| `Leading icon` | Instance swap | Any 16px icon component |
| `Trailing icon` | Instance swap | Any 16px icon component |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | 1px neutral border, muted placeholder | `border/default` |
| Focus | 2px brand border | `border/focus` |
| Error | 2px danger border, and the helper text turns red | `feedback/danger/solid, feedback/danger/text` |
| Disabled | Subtle fill, muted border, muted label, value and helper | `bg/subtle, border/subtle, text/disabled` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Control height | control/height/md | 40px (bound) |
| Textarea height | — | 96px |
| Width | — | 280px; quantity 132px |
| Vertical padding | space/3 | 8px |
| Horizontal padding | space/4 | 12px |
| Gap | space/3 | 8px |
| Label to control | space/2 | 4px |
| Corner radius | radius/md | 8px |
| Border (default) | border/width/default | 1px |
| Border (focus, error) | border/width/strong | 2px |
| Stepper | radius/sm | 24x24px |
| Label / value / helper | font/size/* | label, body-sm, caption |

#### Do

- Keep the label visible above the field; it is the only durable name the field has.
- Use the helper slot for the format you expect, then reuse it for the error when one occurs.
- Size the field to the content — Quantity is deliberately narrow, Textarea deliberately tall.
- Use Multiselect when the answer is a set; the chips show what has been chosen without opening anything.

#### Don't

- Don’t use the placeholder as the label. It vanishes the moment someone types.
- Don’t validate on every keystroke — wait until the field is left before showing Error.
- Don’t split a card number into four separate boxes; one field is far easier to paste into.
- Don’t disable a field without saying, in the helper text, what would enable it.

#### Accessibility

- The label must be programmatically tied to the control, not merely sitting above it.
- Focus is a 2px border rather than colour alone, so it survives greyscale and high-contrast modes.
- Error is carried by the border, an explicit message and aria-invalid — never by red alone.
- The password reveal is a real button with an accessible name that flips between Show and Hide.
- Quantity steppers need names too; the field itself should still accept a typed number.

#### Related

- **Alert** — Field-level errors sit under the input; form-level errors belong in an Alert above the form.
- **Checkbox** — For a yes/no answer, a checkbox is faster to scan than a field.
- **Select** — Select when the answer is chosen from a known list rather than typed.

### Checkbox

Multi-select control, including the indeterminate state a parent checkbox needs.

**Matrix:** 3 selections · 3 states

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Selected` | Variant | Unchecked, Checked, Indeterminate |
| `State` | Variant | Default, Hover, Disabled |
| `Label` | Text | Any |
| `Focused` | Boolean | Shows the keyboard focus ring |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | 1px neutral border when unchecked, brand fill when checked | `border/default, action/primary/rest` |
| Hover | Border darkens one step | `border/strong` |
| Focused | 2px ring outside the box | `border/focus` |
| Disabled | Subtle fill, muted border and label | `bg/subtle, text/disabled` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Box | — | 18x18px |
| Box radius | radius/sm | 4px |
| Check glyph | — | 14px |
| Gap to label | space/3 | 8px |
| Label | font/size/body-sm | 14/20 |

#### Do

- Use Indeterminate on a parent that controls a partially selected group.
- Write labels as positive statements — “Send me updates”, not “Don’t send updates”.
- Stack a group vertically; scanning a column is faster than scanning a row.

#### Don't

- Don’t use a checkbox for a setting that applies immediately — that is a Switch.
- Don’t nest more than one level of parent/child checkboxes.
- Don’t make the box the only clickable target.

#### Accessibility

- The label is part of the hit target; people click the words, not the 18px box.
- Indeterminate is a visual state only — in code it is the DOM `indeterminate` property.
- Keyboard focus must be visible on the box itself, not just the label.

#### Related

- **Radio** — Radio when exactly one option may be chosen; Checkbox when any number may.
- **Switch** — Switch when the change takes effect immediately, with no Save step.
- **Select** — Select once the list of options grows past about seven.

### Radio

Single choice within a group. Selection is mutually exclusive and cannot be undone by clicking again.

**Matrix:** 2 selections · 3 states

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Selected` | Variant | Unselected, Selected |
| `State` | Variant | Default, Hover, Disabled |
| `Label` | Text | Any |
| `Focused` | Boolean | Shows the keyboard focus ring |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | 1px neutral border, or 2px brand when selected | `border/default, border/focus` |
| Hover | Border darkens one step | `border/strong` |
| Focused | 2px ring outside the control | `border/focus` |
| Disabled | Subtle fill, muted border, muted dot and label | `bg/subtle, text/disabled` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Ring | radius/full | 18x18px |
| Dot | radius/full | 8x8px |
| Border (unselected) | border/width/default | 1px |
| Border (selected) | border/width/strong | 2px |
| Gap to label | space/3 | 8px |

#### Do

- Offer at least two options — a lone radio cannot be deselected, which traps people.
- Preselect the safest or most common option so the group is never empty.
- Keep the list under about seven items; beyond that use a select.

#### Don't

- Don’t use radios when more than one answer can be true — that is a Checkbox.
- Don’t rely on a radio to trigger an action; it records a choice, it doesn’t submit it.
- Don’t reorder options between visits; people remember position.

#### Accessibility

- All radios in a group share one name, so arrow keys move between them.
- The group needs its own label describing what is being chosen.
- Selected is carried by the inner dot and a 2px ring, not by colour alone.

#### Related

- **Checkbox** — Checkbox when more than one answer can be true at once.
- **Switch** — Switch for a single immediate on/off, rather than a choice between options.
- **Select** — Select once there are more options than are worth showing at once.

### Switch

Immediate on/off toggle. The change takes effect the moment it is flipped.

**Matrix:** 2 selections · 2 states

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Selected` | Variant | Off, On |
| `State` | Variant | Default, Disabled |
| `Focused` | Boolean | Shows the keyboard focus ring |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default (off) | Muted track, knob left | `bg/muted` |
| Default (on) | Brand track, knob right | `action/primary/rest` |
| Focused | 2px ring outside the track | `border/focus` |
| Disabled | Subtle or muted track, no interaction | `bg/subtle, action/primary/disabled` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Track | radius/full | 44x24px |
| Knob | radius/full | 20x20px |
| Track padding | — | 2px |
| Knob shadow | — | 0 1 2, black 15% |

#### Do

- Use it only where the change takes effect immediately, with no Save step.
- Label the setting, not the action — “Email notifications”, not “Enable notifications”.
- Show the resulting state elsewhere if the effect isn’t visible on screen.

#### Don't

- Don’t put a switch in a form that ends in a Save button — use a Checkbox.
- Don’t add “On” / “Off” text beside it; the control already says which it is.
- Don’t use one to choose between two named options — that is a segmented control.

#### Accessibility

- Exposed as role="switch" with aria-checked, not as a plain checkbox.
- The 44px-wide track meets touch target guidance at every size.
- State is carried by knob position as well as track colour.

#### Related

- **Checkbox** — Checkbox when the change only applies once the form is saved.
- **Radio** — Radio when choosing between two or more named options rather than toggling one.

### Badge

Compact status marker. Subtle for dense lists, Solid when the status must be noticed.

**Matrix:** 6 tones · 2 emphases

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Tone` | Variant | Neutral, Brand, Success, Warning, Danger, Info |
| `Emphasis` | Variant | Subtle, Solid |
| `Label` | Text | Any — one or two words |
| `Show dot` | Boolean | Default on |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Subtle | 50-step fill with 700-step text | `feedback/*/bg, feedback/*/text` |
| Solid | 600-step fill with an inverse label | `feedback/*/solid, text/inverse` |
| — | A badge is not interactive, so it has no hover or pressed state | `—` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Vertical padding | space/1 | 2px |
| Horizontal padding | space/3 | 8px |
| Gap | space/2 | 4px |
| Dot | radius/full | 6x6px |
| Corner radius | radius/full | full |
| Label | font/size/caption | 12/16 |

#### Do

- Keep labels to one or two words — “Paid”, “Overdue”, “In review”.
- Use Subtle inside dense lists and tables where Solid would shout.
- Map one tone to one meaning and hold it across the whole product.

#### Don't

- Don’t rely on tone alone; the word carries the meaning, the colour reinforces it.
- Don’t make badges interactive — if it can be clicked it should be a button or tag.
- Don’t stack more than two or three on one row.

#### Accessibility

- Subtle pairs 700-step text on a 50-step fill, which clears AA at this size.
- Colour is never the only signal — screen readers announce the label.
- Avoid all-caps labels; they are slower to read and can be spelled out letter by letter.

#### Related

- **Alert** — An Alert when the status needs explaining rather than just labelling.
- **Avatar** — Avatars and badges often sit together in a list row; keep one of them muted.

### Alert

Inline message banner. Tone drives the icon, fill and border together so they can never disagree.

**Matrix:** 4 tones

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Tone` | Variant | Info, Success, Warning, Danger |
| `Title` | Text | Any |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Info | Neutral-blue fill, info glyph | `feedback/info/*` |
| Success | Green fill, tick glyph | `feedback/success/*` |
| Warning | Amber fill, triangle glyph | `feedback/warning/*` |
| Danger | Red fill, cross glyph | `feedback/danger/*` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Width | — | 420px (fills its column) |
| Padding | space/4 | 12px |
| Gap | space/3 | 8px |
| Corner radius | radius/md | 8px |
| Icon | — | 16px |
| Title / body | font/size/label, body-sm | 14/20 |

#### Do

- Place it next to whatever it refers to, not floating at the top of the page.
- Say what happened and what to do next — “Card declined. Try another payment method.”
- Keep it to two lines; anything longer belongs on the page itself.

#### Don't

- Don’t stack several alerts — people read the first and ignore the rest.
- Don’t use Danger for something recoverable; Warning is usually the honest choice.
- Don’t auto-dismiss an alert carrying an error someone still has to act on.

#### Accessibility

- Danger and Warning should be announced live so screen readers don’t miss them.
- Each tone carries a distinct icon, so the four are distinguishable without colour.
- Don’t move focus to an alert unless it blocks progress.

#### Related

- **Badge** — A Badge when a single word conveys the status and no action is needed.
- **Button** — Pair with a Secondary button when the message requires the reader to do something.
- **Toast** — A Toast when the message is about an event that just happened and can disappear.

### Avatar

Represents a person. Initials are the fallback when there is no photo.

**Matrix:** 3 sizes · 2 types

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Size` | Variant | Small, Medium, Large |
| `Type` | Variant | Initials, Icon |
| `Initials` | Text | One or two characters |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Initials | Muted fill with secondary text | `bg/muted, text/secondary` |
| Icon | Muted fill with a silhouette glyph | `bg/muted, text/muted` |
| — | An avatar is not interactive on its own and has no hover state | `—` |

#### Specs

| Element | Small | Medium | Large |
| --- | --- | --- | --- |
| Container | 24x24px | 32x32px | 40x40px |
| Glyph | 12px | 16px | 20px |
| Initials | caption | body-sm | body |
| Corner radius | radius/full | radius/full | radius/full |

#### Do

- Replace the fill with an image paint to show a photo; the circular clip is already set.
- Fall back to Initials before Icon — a name identifies better than a silhouette.
- Use one or two initials, taken from the name as the person wrote it.

#### Don't

- Don’t use an avatar as the only way to identify someone in a dense list.
- Don’t generate initials from an email address; “jd@” is not a name.
- Don’t scale below 24px — initials stop being legible.

#### Accessibility

- An avatar is decorative when the name is already beside it; hide it from screen readers.
- Standing alone, it needs alt text carrying the person’s full name.
- Initials on bg/muted clear AA at every size in the set.

#### Related

- **Badge** — Use a Badge alongside for role or status, rather than tinting the avatar.
- **Card** — In a person card, the avatar leads and the name follows.

### Select

Single choice from a known list. Shares Input's states exactly, so a form built from both stays consistent.

**Matrix:** 4 states · open and closed

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `State` | Variant | Default, Focus, Error, Disabled |
| `Menu` | Variant | Closed, Open |
| `Label` | Text | Any |
| `Value` | Text | Any |
| `Helper text` | Text | Any |
| `Show label` | Boolean | Default on |
| `Show helper text` | Boolean | Default on |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | 1px neutral border, muted placeholder, chevron down | `border/default` |
| Focus | 2px brand border | `border/focus` |
| Error | 2px danger border, helper turns red | `feedback/danger/solid` |
| Disabled | Subtle fill, muted border and text | `bg/subtle, text/disabled` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Control height | control/height/md | 40px |
| Width | — | 280px |
| Menu padding | space/1 | 2px |
| Option padding | space/2 / space/3 | 4 / 8px |
| Option radius | radius/sm | 4px |
| Menu elevation | — | 0 4 12, black 12% |
| Selected mark | text/brand | 14px check |

#### Do

- Use it when the options are known, mutually exclusive and more than about seven.
- Order options the way a reader expects — alphabetical, or by frequency, not by database id.
- Mark the current selection in the menu, not just in the closed control.

#### Don't

- Don’t use a select for two options. That is a Radio pair or a Switch.
- Don’t hide the chosen value behind a placeholder once a choice is made.
- Don’t nest a select inside a menu inside a modal; one layer of choosing is enough.

#### Accessibility

- Keyboard must open the menu, move with arrows, choose with Enter and close with Escape.
- The closed control needs the same label association as any other field.
- The selected option is announced as selected, not merely drawn with a tick.

#### Related

- **Input** — Input when the answer is typed rather than chosen from a list.
- **Radio** — Radio when there are only a few options and they are worth showing at once.

### Tooltip

A short label for something that has none — most often an icon-only button. The arrow points back at the target.

**Matrix:** 4 placements

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Placement` | Variant | Top, Right, Bottom, Left |
| `Label` | Text | A few words |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Top | Sits above the target, arrow below | `bg/inverse` |
| Bottom | Sits below the target, arrow above | `bg/inverse` |
| Left | Sits left of the target, arrow right | `bg/inverse` |
| Right | Sits right of the target, arrow left | `bg/inverse` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Vertical padding | space/2 | 4px |
| Horizontal padding | space/3 | 8px |
| Corner radius | radius/sm | 4px |
| Label | font/size/caption | 12/16 |
| Arrow | — | 10px |

#### Do

- Give every icon-only button one — the glyph alone is rarely unambiguous.
- Name the action: “Delete”, not “Click to delete this item permanently”.
- Show it on hover and on keyboard focus, not on hover alone.

#### Don't

- Don’t put anything in it that the person needs — a tooltip is unreachable on touch.
- Don’t put a link or a button inside one; it disappears before it can be reached.
- Don’t repeat a label that is already visible.

#### Accessibility

- Attach it with aria-describedby so it is announced with the control, not as a separate stop.
- It must appear on keyboard focus, and Escape must dismiss it.
- Never use one to supply the accessible name of an icon-only button — that is aria-label's job.

#### Related

- **Button** — The icon-only Button layout is the main thing that needs a tooltip.
- **Alert** — An Alert when the message matters enough that it must not be missed.

### Accordion

A titled section that opens and closes, for content that is worth offering but not worth showing by default.

**Matrix:** 2 expanded · 3 states

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Expanded` | Variant | Collapsed, Expanded |
| `State` | Variant | Default, Hover, Disabled |
| `Title` | Text | Any |
| `Content` | Text | Any |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | Surface fill, chevron down when collapsed | `bg/surface, border/subtle` |
| Hover | Header tints; the body does not | `action/tertiary/hover` |
| Disabled | Muted title and chevron, no interaction | `text/disabled` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Width | — | 440px (resizable) |
| Header padding | space/4 / space/5 | 12 / 16px |
| Body padding | space/5 | 16px |
| Corner radius | radius/md | 8px |
| Chevron | — | 16px, flips on expand |

#### Do

- Write titles that say what is inside, so the panel can be judged without opening it.
- Let more than one section be open when the sections are genuinely independent.
- Make the whole header row the target, not just the chevron.

#### Don't

- Don’t hide anything essential behind one — collapsed content is frequently never opened.
- Don’t nest accordions. If you need to, the content wants a page of its own.
- Don’t animate the chevron without also moving the panel; the two read as one action.

#### Accessibility

- The header is a button with aria-expanded, inside a heading of the right level.
- The panel is associated with its header via aria-controls.
- Expanded state is carried by the chevron direction as well as by the open panel.

#### Related

- **Tabs** — Tabs when the sections are alternatives; Accordion when they are additions.
- **Card** — A Card when the content should always be visible.

### Tabs

One tab in a tab bar. Place several in a row and give exactly one the Selected state.

**Matrix:** 4 states

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `State` | Variant | Default, Hover, Selected, Disabled |
| `Label` | Text | One or two words |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | Secondary label, no indicator | `text/secondary` |
| Hover | Label darkens, neutral indicator appears | `text/primary, border/default` |
| Selected | Brand label and a 2px brand indicator | `text/brand, border/focus` |
| Disabled | Muted label, no indicator, no interaction | `text/disabled` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Padding | space/4 | 12px |
| Indicator | border/width/strong | 2px, bottom only |
| Label | font/size/label | 14/20 medium |

#### Do

- Keep labels to one or two words so the bar stays scannable.
- Always have exactly one tab selected — a tab bar has no empty state.
- Keep the tab bar in place when switching; only the panel below should change.

#### Don't

- Don’t use tabs for a sequence — that is a stepper, and tabs imply free movement.
- Don’t scroll a tab bar horizontally if you can avoid it; unseen tabs are unused tabs.
- Don’t change the selected tab as a side effect of something else on the page.

#### Accessibility

- The bar is role=tablist, each tab role=tab, each panel role=tabpanel.
- Arrow keys move between tabs; Tab moves out of the bar and into the panel.
- Selection is carried by the indicator and the label colour, not by colour alone.

#### Related

- **Accordion** — Accordion when the sections are additions rather than alternatives.
- **Badge** — A Badge inside a tab is the usual way to carry a count.

### Toast

Transient confirmation, on an inverse surface so it reads as an overlay rather than as part of the page.

**Matrix:** 4 tones

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Tone` | Variant | Info, Success, Warning, Danger |
| `Message` | Text | One line |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Info | Neutral confirmation | `bg/inverse, feedback/info/border` |
| Success | Something completed | `bg/inverse, feedback/success/border` |
| Warning | Completed with a caveat | `bg/inverse, feedback/warning/border` |
| Danger | Something failed | `bg/inverse, feedback/danger/border` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Width | — | 380px |
| Padding | space/4 | 12px |
| Gap | space/3 | 8px |
| Corner radius | radius/md | 8px |
| Elevation | — | 0 6 16, black 20% |
| Icon | feedback/*/border | 16px |

#### Do

- Use it to confirm something that already happened, in one line.
- Give anything with a Danger tone a way to retry or to see the detail.
- Show one at a time; queue the rest.

#### Don't

- Don’t put anything essential in one — it disappears, and it may never be read.
- Don’t auto-dismiss an error the person still has to act on.
- Don’t use one for form validation. That belongs under the field.

#### Accessibility

- Announce it politely for confirmations and assertively for failures.
- Anything auto-dismissing needs at least five seconds, and longer if it carries an action.
- The dismiss control needs a name and must be reachable by keyboard.

#### Related

- **Alert** — An Alert when the message is part of the page and should persist.
- **Badge** — A Badge when the state is ongoing rather than an event that just occurred.

### Modal

A blocking dialog for a decision that cannot be deferred. Its footer holds real Button instances, so a change to Button reaches it too.

**Matrix:** 1 component · uses Button

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Title` | Text | Any — phrase it as a question |
| `Body` | Text | Any |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | Surface fill, subtle border, heavy elevation | `bg/surface, border/subtle` |
| — | A modal has no states of its own; its buttons carry them | `—` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Width | — | 480px |
| Section padding | space/5 | 16px |
| Footer gap | space/3 | 8px |
| Corner radius | radius/lg | 12px |
| Elevation | — | 0 12 32, black 18% |
| Footer buttons | — | Button instances, Medium |

#### Do

- Title it with the question being asked — “Delete this project?”, not “Confirm”.
- Say plainly in the body what will happen, especially if it cannot be undone.
- Label the confirming button with the verb, so it reads without the title.

#### Don't

- Don’t use one for anything that could be a page, an inline edit or an undoable action.
- Don’t stack modals. A second one means the first asked the wrong question.
- Don’t label the buttons OK and Cancel when the action has a name.

#### Accessibility

- Focus moves into the dialog on open, is trapped while it is open, and returns on close.
- Escape must close it, and so must clicking the scrim.
- role=dialog with aria-modal, labelled by its own title.

#### Related

- **Button** — The footer is built from Button instances rather than redrawn buttons.
- **Alert** — An Alert when the message can sit in the page instead of blocking it.

### Card

Surface container for grouped content, with bound padding, radius, border and elevation.

**Matrix:** 1 component

#### Props

| Prop | Type | Values |
| --- | --- | --- |
| `Title` | Text | Any |
| `Body` | Text | Any |

#### States

| State | What changes | Token |
| --- | --- | --- |
| Default | Surface fill, subtle border, one-step elevation | `bg/surface, border/subtle` |
| — | A card has no states of its own; interactive cards get them from the control inside | `—` |

#### Specs

| Element | Token | Value |
| --- | --- | --- |
| Width | — | 320px (resizable) |
| Padding | space/5 | 16px |
| Gap | space/3 | 8px |
| Corner radius | radius/lg | 12px |
| Border | border/width/default | 1px |
| Elevation | — | 0 1 3, black 6% |

#### Do

- Group content that belongs together and can be understood on its own.
- Keep every card in a row to the same width so the grid stays even.
- Put the primary action inside the card it acts on.

#### Don't

- Don’t nest a card inside a card — that usually means the hierarchy is wrong.
- Don’t raise the elevation unless the card genuinely floats above the page.
- Don’t use a card purely to draw a box around unrelated content.

#### Accessibility

- A card that is entirely clickable needs one link or button, not a click handler on the box.
- The title should be a real heading so the page outline holds together.
- The 1px border does the separating work, so the card survives high-contrast mode.

#### Related

- **Button** — Put the card’s action inside it, so the target and its label stay together.
- **Alert** — An Alert when the content is a message about state rather than content in its own right.
- **Modal** — A Modal when the content must be decided on before anything else can happen.

## Reference implementation

A worked example of the mapping this spec implies: variant props become data
attributes, and every value is a token.

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border: 0;
  border-radius: var(--radius-md);
  font: 500 var(--font-size-body-sm) / var(--line-height-body-sm) var(--font-family);
  background: var(--action-primary-rest);
  color: var(--text-on-brand);
}

.button:hover  { background: var(--action-primary-hover); }
.button:active { background: var(--action-primary-pressed); }

/* Focus is orthogonal to hover and pressed, so it is its own rule. */
.button:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.button[data-tone="secondary"] {
  background: var(--action-secondary-rest);
  color: var(--text-brand);
  box-shadow: inset 0 0 0 1px var(--border-default);
}

.button[data-size="small"] { padding: var(--space-2) var(--space-4); }
.button[data-size="large"] {
  padding: var(--space-5) var(--space-6);
  font-size: var(--font-size-body);
}

/* Icon-only keeps the target square. */
.button[data-layout="icon-only"] { padding: var(--space-4); }

.button:disabled {
  background: var(--action-primary-disabled);
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

```tsx
type ButtonProps = {
  tone?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "small" | "medium" | "large";
  layout?: "label" | "icon-left" | "icon-right" | "icon-only";
  icon?: React.ReactNode;
  label?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  tone = "primary",
  size = "medium",
  layout = "label",
  icon,
  label,
  ...rest
}: ButtonProps) {
  // An icon-only button still needs an accessible name.
  const labelled = layout === "icon-only" ? { "aria-label": label } : {};

  return (
    <button
      className="button"
      data-tone={tone}
      data-size={size}
      data-layout={layout}
      {...labelled}
      {...rest}
    >
      {(layout === "icon-left" || layout === "icon-only") && icon}
      {layout !== "icon-only" && <span>{label}</span>}
      {layout === "icon-right" && icon}
    </button>
  );
}
```

## Appendix: tokens as code

Generated from the same palette as everything above, so these cannot
disagree with the tables or with the Figma variables.

### CSS custom properties

```css
/* Primitives */
:root {
  --brand-50: #F3F5FF;
  --brand-100: #E4E9FF;
  --brand-200: #CFD7FF;
  --brand-300: #B8C2FF;
  --brand-400: #98A4FF;
  --brand-500: #7A84FF;
  --brand-600: #6261FF;
  --brand-700: #4F46E5;
  --brand-800: #3D37B6;
  --brand-900: #312D91;
  --brand-950: #1D1C5C;
  --neutral-50: #F4F5F9;
  --neutral-100: #E8E9F0;
  --neutral-200: #D7D9E1;
  --neutral-300: #C4C6D1;
  --neutral-400: #A9ACB9;
  --neutral-500: #9093A0;
  --neutral-600: #797C89;
  --neutral-700: #626570;
  --neutral-800: #4E5059;
  --neutral-900: #3E3F47;
  --neutral-950: #26272D;
  --success-50: #EEF9EF;
  --success-100: #D6F3DB;
  --success-200: #B3E9BD;
  --success-300: #8DDC9E;
  --success-400: #5EC679;
  --success-500: #34AE5B;
  --success-600: #139546;
  --success-700: #037A36;
  --success-800: #05612B;
  --success-900: #0A4D22;
  --success-950: #083115;
  --warning-50: #FDF4E8;
  --warning-100: #FCE7C7;
  --warning-200: #F9D398;
  --warning-300: #F3BC62;
  --warning-400: #E29E00;
  --warning-500: #C18700;
  --warning-600: #A47200;
  --warning-700: #865C00;
  --warning-800: #6B4900;
  --warning-900: #563A00;
  --warning-950: #372400;
  --danger-50: #FFF2F0;
  --danger-100: #FFE2DE;
  --danger-200: #FFCBC4;
  --danger-300: #FFAFA5;
  --danger-400: #FF8276;
  --danger-500: #F2584F;
  --danger-600: #D5413A;
  --danger-700: #B0312C;
  --danger-800: #8D2722;
  --danger-900: #70201C;
  --danger-950: #471411;
  --info-50: #EEF7FF;
  --info-100: #DAECFF;
  --info-200: #BBDDFF;
  --info-300: #98CCFF;
  --info-400: #5FB3FF;
  --info-500: #2C99F0;
  --info-600: #0681D4;
  --info-700: #0069AE;
  --info-800: #00538C;
  --info-900: #054270;
  --info-950: #062A47;
  --base-white: #FFFFFF;
  --base-black: #000000;
}

/* Semantic — light */
:root {
  --bg-canvas: var(--neutral-50);
  --bg-surface: var(--base-white);
  --bg-subtle: var(--neutral-100);
  --bg-muted: var(--neutral-200);
  --bg-inverse: var(--neutral-900);
  --text-primary: var(--neutral-900);
  --text-secondary: var(--neutral-700);
  --text-muted: var(--neutral-500);
  --text-disabled: var(--neutral-400);
  --text-inverse: var(--base-white);
  --text-brand: var(--brand-700);
  --border-subtle: var(--neutral-200);
  --border-default: var(--neutral-300);
  --border-strong: var(--neutral-400);
  --border-focus: var(--brand-500);
  --action-primary-rest: var(--brand-700);
  --action-primary-hover: var(--brand-800);
  --action-primary-pressed: var(--brand-900);
  --action-primary-disabled: var(--neutral-200);
  --action-secondary-rest: var(--base-white);
  --action-secondary-hover: var(--brand-50);
  --action-secondary-pressed: var(--brand-100);
  --action-tertiary-hover: var(--neutral-100);
  --action-tertiary-pressed: var(--neutral-200);
  --action-danger-rest: var(--danger-600);
  --action-danger-hover: var(--danger-700);
  --action-danger-pressed: var(--danger-800);
  --text-on-brand: var(--base-white);
  --text-on-danger: var(--base-white);
  --feedback-success-bg: var(--success-50);
  --feedback-success-border: var(--success-200);
  --feedback-success-solid: var(--success-600);
  --feedback-success-text: var(--success-700);
  --feedback-warning-bg: var(--warning-50);
  --feedback-warning-border: var(--warning-200);
  --feedback-warning-solid: var(--warning-600);
  --feedback-warning-text: var(--warning-700);
  --feedback-danger-bg: var(--danger-50);
  --feedback-danger-border: var(--danger-200);
  --feedback-danger-solid: var(--danger-600);
  --feedback-danger-text: var(--danger-700);
  --feedback-info-bg: var(--info-50);
  --feedback-info-border: var(--info-200);
  --feedback-info-solid: var(--info-600);
  --feedback-info-text: var(--info-700);
}

/* Scale */
:root {
  --space-0: 0px;
  --space-1: 2px;
  --space-2: 4px;
  --space-3: 8px;
  --space-4: 12px;
  --space-5: 16px;
  --space-6: 20px;
  --space-7: 24px;
  --space-8: 32px;
  --space-9: 40px;
  --space-10: 48px;
  --space-11: 64px;
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}

/* Typography */
:root {
  --font-family: "Inter";
  --font-size-display: 48px;
  --line-height-display: 56px;
  --font-size-heading-1: 38px;
  --line-height-heading-1: 46px;
  --font-size-heading-2: 30px;
  --line-height-heading-2: 38px;
  --font-size-heading-3: 24px;
  --line-height-heading-3: 32px;
  --font-size-heading-4: 20px;
  --line-height-heading-4: 28px;
  --font-size-body-lg: 18px;
  --line-height-body-lg: 28px;
  --font-size-body: 16px;
  --line-height-body: 24px;
  --font-size-body-sm: 14px;
  --line-height-body-sm: 20px;
  --font-size-label: 14px;
  --line-height-label: 20px;
  --font-size-caption: 12px;
  --line-height-caption: 16px;
}
```

### JSON

For Style Dictionary, or any pipeline that prefers structured input.

```json
{
  "color": {
    "brand": {
      "50": "#F3F5FF",
      "100": "#E4E9FF",
      "200": "#CFD7FF",
      "300": "#B8C2FF",
      "400": "#98A4FF",
      "500": "#7A84FF",
      "600": "#6261FF",
      "700": "#4F46E5",
      "800": "#3D37B6",
      "900": "#312D91",
      "950": "#1D1C5C"
    },
    "neutral": {
      "50": "#F4F5F9",
      "100": "#E8E9F0",
      "200": "#D7D9E1",
      "300": "#C4C6D1",
      "400": "#A9ACB9",
      "500": "#9093A0",
      "600": "#797C89",
      "700": "#626570",
      "800": "#4E5059",
      "900": "#3E3F47",
      "950": "#26272D"
    },
    "success": {
      "50": "#EEF9EF",
      "100": "#D6F3DB",
      "200": "#B3E9BD",
      "300": "#8DDC9E",
      "400": "#5EC679",
      "500": "#34AE5B",
      "600": "#139546",
      "700": "#037A36",
      "800": "#05612B",
      "900": "#0A4D22",
      "950": "#083115"
    },
    "warning": {
      "50": "#FDF4E8",
      "100": "#FCE7C7",
      "200": "#F9D398",
      "300": "#F3BC62",
      "400": "#E29E00",
      "500": "#C18700",
      "600": "#A47200",
      "700": "#865C00",
      "800": "#6B4900",
      "900": "#563A00",
      "950": "#372400"
    },
    "danger": {
      "50": "#FFF2F0",
      "100": "#FFE2DE",
      "200": "#FFCBC4",
      "300": "#FFAFA5",
      "400": "#FF8276",
      "500": "#F2584F",
      "600": "#D5413A",
      "700": "#B0312C",
      "800": "#8D2722",
      "900": "#70201C",
      "950": "#471411"
    },
    "info": {
      "50": "#EEF7FF",
      "100": "#DAECFF",
      "200": "#BBDDFF",
      "300": "#98CCFF",
      "400": "#5FB3FF",
      "500": "#2C99F0",
      "600": "#0681D4",
      "700": "#0069AE",
      "800": "#00538C",
      "900": "#054270",
      "950": "#062A47"
    }
  },
  "semantic": {
    "bg/canvas": { "light": "neutral/50" },
    "bg/surface": { "light": "base/white" },
    "bg/subtle": { "light": "neutral/100" },
    "bg/muted": { "light": "neutral/200" },
    "bg/inverse": { "light": "neutral/900" },
    "text/primary": { "light": "neutral/900" },
    "text/secondary": { "light": "neutral/700" },
    "text/muted": { "light": "neutral/500" },
    "text/disabled": { "light": "neutral/400" },
    "text/inverse": { "light": "base/white" },
    "text/brand": { "light": "brand/700" },
    "border/subtle": { "light": "neutral/200" },
    "border/default": { "light": "neutral/300" },
    "border/strong": { "light": "neutral/400" },
    "border/focus": { "light": "brand/500" },
    "action/primary/rest": { "light": "brand/700" },
    "action/primary/hover": { "light": "brand/800" },
    "action/primary/pressed": { "light": "brand/900" },
    "action/primary/disabled": { "light": "neutral/200" },
    "action/secondary/rest": { "light": "base/white" },
    "action/secondary/hover": { "light": "brand/50" },
    "action/secondary/pressed": { "light": "brand/100" },
    "action/tertiary/hover": { "light": "neutral/100" },
    "action/tertiary/pressed": { "light": "neutral/200" },
    "action/danger/rest": { "light": "danger/600" },
    "action/danger/hover": { "light": "danger/700" },
    "action/danger/pressed": { "light": "danger/800" },
    "text/on-brand": { "light": "base/white" },
    "text/on-danger": { "light": "base/white" },
    "feedback/success/bg": { "light": "success/50" },
    "feedback/success/border": { "light": "success/200" },
    "feedback/success/solid": { "light": "success/600" },
    "feedback/success/text": { "light": "success/700" },
    "feedback/warning/bg": { "light": "warning/50" },
    "feedback/warning/border": { "light": "warning/200" },
    "feedback/warning/solid": { "light": "warning/600" },
    "feedback/warning/text": { "light": "warning/700" },
    "feedback/danger/bg": { "light": "danger/50" },
    "feedback/danger/border": { "light": "danger/200" },
    "feedback/danger/solid": { "light": "danger/600" },
    "feedback/danger/text": { "light": "danger/700" },
    "feedback/info/bg": { "light": "info/50" },
    "feedback/info/border": { "light": "info/200" },
    "feedback/info/solid": { "light": "info/600" },
    "feedback/info/text": { "light": "info/700" }
  },
  "space": {
    "0": 0,
    "1": 2,
    "2": 4,
    "3": 8,
    "4": 12,
    "5": 16,
    "6": 20,
    "7": 24,
    "8": 32,
    "9": 40,
    "10": 48,
    "11": 64
  },
  "radius": {
    "none": 0,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "2xl": 24,
    "full": 999
  },
  "type": {
    "family": "Inter",
    "display": { "size": 48, "lineHeight": 56, "weight": "bold" },
    "heading-1": { "size": 38, "lineHeight": 46, "weight": "bold" },
    "heading-2": { "size": 30, "lineHeight": 38, "weight": "semibold" },
    "heading-3": { "size": 24, "lineHeight": 32, "weight": "semibold" },
    "heading-4": { "size": 20, "lineHeight": 28, "weight": "semibold" },
    "body-lg": { "size": 18, "lineHeight": 28, "weight": "regular" },
    "body": { "size": 16, "lineHeight": 24, "weight": "regular" },
    "body-sm": { "size": 14, "lineHeight": 20, "weight": "regular" },
    "label": { "size": 14, "lineHeight": 20, "weight": "medium" },
    "caption": { "size": 12, "lineHeight": 16, "weight": "regular" }
  }
}
```
