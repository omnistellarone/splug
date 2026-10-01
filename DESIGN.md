# DESIGN.md — Visual Design System & UX Specification

## 1. Purpose

This file defines the visual language, interaction patterns, layout rules, responsive behavior, and component styling for the electronics e-commerce application described in `PRD.md` and `PLAN.md`.

Antigravity must read this file before implementing customer-facing UI.

Priority of references:

1. **Primary reference:** the E-commerce Filter & Sort UI Kit supplied by the user.
2. **Secondary reference:** the Cart Drawer UI Kit supplied by the user.

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
