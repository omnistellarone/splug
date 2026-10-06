---
name: Kalki Premium
colors:
  surface: '#f8f9fd'
  surface-dim: '#d9dade'
  surface-bright: '#f8f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f7'
  surface-container: '#edeef2'
  surface-container-high: '#e7e8ec'
  surface-container-highest: '#e1e2e6'
  on-surface: '#191c1f'
  on-surface-variant: '#464555'
  inverse-surface: '#2e3134'
  inverse-on-surface: '#eff1f5'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e2e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e2e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#45464e'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9fd'
  on-background: '#191c1f'
  surface-variant: '#e1e2e6'
  brand-50: '#F3F5FF'
  brand-700: '#4F46E5'
  brand-950: '#1D1C5C'
  neutral-50: '#F4F5F9'
  neutral-100: '#E8E9F0'
  neutral-200: '#D7D9E1'
  neutral-400: '#9CA3AF'
  neutral-500: '#6B7280'
  neutral-700: '#374151'
  neutral-900: '#111827'
  success-600: '#139546'
  warning-600: '#A47200'
  danger-600: '#D5413A'
  info-600: '#0681D4'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -1.5px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
    letterSpacing: -1.0px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.5px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.25px
  headline-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0px
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0px
  label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.2px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 2rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a refined enterprise polish paired with subtle geometric warmth, elevating standard enterprise UI into a sophisticated, high-performance experience. The visual style bridges systematic precision and accessible luxury.

### Brand Personality
- **Authoritative yet Approachable:** Combines robust functional reliability with warm, welcoming typography.
- **Precision-Driven:** Structured layouts, clean data displays, and intentional whitespace convey deep competence.
- **Tactile & Modern:** Leverages nuanced surface layering and subtle glassmorphic effects to create depth without visual clutter.

### Target Audience
Enterprise users, financial operators, and sophisticated consumers who demand speed, clarity, and uncompromising aesthetic execution.

### Emotional Response
Confidence, calm control, and effortless efficiency. The interface should feel responsive, stable, and naturally intuitive.

## Colors

The color palette is anchored by a neutral cool-gray canvas and deep slate inverses, energized by a vivid blue-violet primary accent. 

### Semantic Application
- **Canvas & Surfaces:** Use `--bg/canvas` (`#F4F5F9`) for application backgrounds and `--bg/surface` (`#FFFFFF`) for elevated containers and cards.
- **Text Hierarchy:** High-contrast dark slate (`--text/primary`) drives readability, supported by neutral tiers for secondary and muted descriptions.
- **Interactive States:** The primary brand hue (`#4F46E5`) defines active controls, focus rings, and primary actions, while dedicated status colors handle feedback uniformly.

## Typography

Typography pairs geometric warmth in headings with neutral, utilitarian clarity in body text. 

### Scaling & Responsiveness
- Headings utilize **Plus Jakarta Sans** for soft, approachable enterprise framing.
- Body and utility text utilize **Inter** for exceptional legibility across dense data tables and long-form reading contexts.
- For viewports below 768px, scale down display and headline-lg tokens by 20% to prevent horizontal overflow and maintain vertical rhythm.

## Layout & Spacing

Built on a rigorous **4px base grid rhythm**, the layout system enforces predictable alignment and proportional whitespace across all viewports.

### Grid & Responsiveness
- **Fluid Grid:** Adapts content smoothly within a maximum constrained width of 1280px to 1440px.
- **Gutters & Margins:** Responsive scaling applies 16px gutters on mobile, 24px on tablets, and 32px–40px on desktop environments.
- **Component Spacing:** Use `space-sm` (8px) for tight groupings (icon-to-text), `space-md` (16px) for standard padding, and `space-xl` (40px+) for major section breaks.

## Elevation & Depth

Depth is conveyed primarily through clean structural borders, reserving shadows and environmental occlusion for floating interactive layers.

### Principles
- **Flat Surfaces:** Data tables, standard forms, and background panels remain flat, separated by subtle 1px borders (`--border/subtle`).
- **Surface Tiers:** Cards and static containers utilize a crisp, low-diffusion shadow (`0 1px 3px rgba(0, 0, 0, 0.06)`).
- **Overlays & Glass:** Modals, dropdowns, and sticky headers employ heavy multi-stop elevation (`0 18px 50px rgba(12, 27, 48, 0.16)`) and Liquid Glass backdrop blurs (`backdrop-filter: blur(18px) saturate(180%)`) to establish distinct z-index hierarchy.

## Shapes

The design system adopts a **Rounded** shape language (`roundedness: 2`), featuring a default control radius of `0.5rem` (8px) that balances friendly approachability with enterprise rigor.

### Radius Scale
- **Small (`4px`):** Checkboxes, tooltips, nested tags, and inner badges.
- **Medium (`8px`):** Primary buttons, inputs, selects, cards, and modal containers.
- **Large / Pill (`9999px`):** Status pills, avatars, and floating action indicators.

## Components

All components must adhere strictly to the established design tokens for color, typography, spacing, and radius.

### Buttons
- **Primary:** Filled with `--action/primary/rest` (`#4F46E5`), text set in `--text/on-brand`, 8px border radius, and medium control height (40px). Hover and active states transition smoothly using brand shade steps.
- **Secondary:** Surface-filled with base white, 1px default border, and neutral text.
- **Danger:** Utilizes `--action/danger/rest` for destructive workflows.

### Input Fields
- Standard height of 40px (48px for checkout/prominent forms), 8px border radius, `--border/default` border, and 14px body-sm text. Focus states trigger a 2px `--border/focus` ring with zero layout shift.

### Cards & Containers
- Surface-filled (`--bg/surface`) with a 12px radius and standard card shadow. Internal padding must lock to 16px (`space/5`) or 24px (`space/7`).

### Checkboxes & Radios
- 4px radius for checkboxes, full circle for radios. Unchecked states use `--border/default`; checked states map directly to `--action/primary/rest`.

### Additional Components
- **Badging & Status Indicators:** Use feedback color tokens (`success`, `warning`, `danger`, `info`) paired with 2px vertical padding and pill rounding.
- **Data Tables:** Enforce alternating row tints using `--bg/subtle` on hover, with 12px cell padding and sticky header elevation.