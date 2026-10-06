# Mobile Setup and API Integration Report

## 1. Executive Summary

This report documents the architectural alignment, backend API enhancements, security safeguards, and implementation details for the **Slurge Electronics Android Mobile Application**.

The mobile application is located in the `mobile/` directory, completely preserving the existing Next.js web application. It is built using **React Native**, **Expo SDK 57**, and **TypeScript**, styled according to the **Kalki Premium** design system (from the provided 8 Stitch design screens), and connects directly to the Supabase PostgreSQL backend and Next.js Route Handlers.

---

## 2. API Routes & Endpoint Audit

| Endpoint | Method | Mobile Auth Strategy | Request Payload / Params | Response | Server Security Enforced |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/cart` | `GET` | Bearer Token / Anonymous Session | Header `Authorization: Bearer <jwt>` | `{ items: CartItem[], totalMinor: number }` | RLS enforced via token-scoped Supabase client |
| `/api/cart` | `POST` | Bearer Token / Anonymous Session | `{ variantId: string, quantity: number }` | `{ success: true, item: CartItem }` | Atomic server stock check |
| `/api/cart/merge` | `POST` | Bearer Token | `{ localItems: Array<{variantId, quantity}> }` | `{ success: true, count: number }` | Merges guest cart on login atomically |
| `/api/addresses` | `GET` | Bearer Token | Header `Authorization: Bearer <jwt>` | `{ addresses: DeliveryAddress[] }` | RLS filter on `user_id = auth.uid()` |
| `/api/addresses` | `POST` | Bearer Token | `{ fullName, phone, addressLine1, city, state, postalCode, isDefault }` | `{ success: true, address: DeliveryAddress }` | Server Zod validation, atomic default flag reset |
| `/api/checkout` | `POST` | Bearer Token | `{ addressId: string, couponCode?: string, callbackUrl?: string }` | `{ success: true, orderId: string, paymentReference: string, authorizationUrl: string, totalMinor: number }` | Recalculates cart server-side, validates stock, initiates Paystack securely |
| `/api/payments/paystack/verify` | `GET` | Public / Server Token | `?reference=<ref>&format=json` | `{ success: true, orderId: string, reference: string, status: "paid", amountMinor: number }` | HMAC signature and server-to-server Paystack API verification |
| `/api/orders` | `GET` | Bearer Token | Header `Authorization: Bearer <jwt>` | `{ orders: OrderSummary[] }` | RLS query scoped to user |
| `/api/orders/[id]` | `GET` | Bearer Token | Header `Authorization: Bearer <jwt>` | `{ order: OrderDetailWithTimeline }` | RLS verification, snapshot lines, milestone tracking |

---

## 3. Security & Credential Isolation

1. **Zero Secret Key Exposure**:
   - `PAYSTACK_SECRET_KEY` remains strictly server-side in Next.js environment variables.
   - `MAILGUN_API_KEY` remains strictly server-side.
   - `SUPABASE_SERVICE_ROLE_KEY` is never bundled into mobile JavaScript or APK assets.
   - Mobile bundles only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, safe for public distribution.

2. **Secure Token Storage**:
   - Uses `expo-secure-store` (hardware-backed Android Keystore) to store auth access and refresh tokens.
   - Automatic session refresh and token restoration on app launch.

3. **Dual Authentication Gateway (`server-auth.ts`)**:
   - Web application continues using cookie sessions via `@supabase/ssr`.
   - Mobile requests pass `Authorization: Bearer <token>`.
   - The unified server helper `getAuthenticatedUserClient(request)` detects the token and instantiates an authenticated Supabase client with the user's JWT, ensuring all PostgreSQL Row Level Security (RLS) policies apply identically on mobile as on web.

---

## 4. Screen Implementations vs. Stitch References

| Screen | Stitch File Reference | React Native Implementation | Key Capabilities |
| :--- | :--- | :--- | :--- |
| 1. Authentication | `auth.html` | `mobile/src/screens/AuthScreen.tsx` | Sign In, Sign Up, Biometrics trigger, Google OAuth redirect |
| 2. Storefront | `home.html` | `mobile/src/screens/HomeScreen.tsx` | Live catalog search, category pills, hero promotion banner, product grid |
| 3. Product Details | `product_details.html` | `mobile/src/screens/ProductDetailsScreen.tsx` | Gallery carousel, variant picker, dynamic stock badges, Add to Cart / Buy Now |
| 4. Cart | `cart.html` | `mobile/src/screens/CartScreen.tsx` | Real-time totals, Free Shipping progress bar, promo code validation, item removal |
| 5. Delivery & Checkout | `checkout.html` | `mobile/src/screens/CheckoutScreen.tsx` | Saved address selection, Add New Address modal, in-app Paystack WebView |
| 6. Payment Status | `payment_status.html` | `mobile/src/screens/PaymentStatusScreen.tsx` | Verification spinner, Success / Failed state, reference confirmation |
| 7. Order Tracking | `order_tracking.html` | `mobile/src/screens/OrderTrackingScreen.tsx` | Step milestones (Confirmed, Processing, Shipped, Delivered), courier tracking, order lines |
| 8. Account & History | `account.html` | `mobile/src/screens/AccountScreen.tsx` | Profile card, past order history list, API Host Switcher, secure sign-out |

---

## 5. Standalone Signed APK

- **Build Tool**: Android Gradle Wrapper (`gradlew.bat assembleRelease`)
- **Java Runtime**: Android Studio OpenJDK 25 (`C:\Program Files\Android\Android Studio\jbr`)
- **Android SDK**: API 37 (`C:\Users\HP\AppData\Local\Android\Sdk`)
- **Package ID**: `com.slurge.electronics`
- **Output Artifact**: `mobile/android/app/build/outputs/apk/release/app-release.apk`
- **Standalone Capability**: Bundles the hermes bytecode JS bundle offline; does not require Metro or any development server running to open and navigate.

---

## 6. List of Unverified / Incomplete Items

1. **Google OAuth Production Client ID**:
   - The app code includes Google OAuth redirect handler (`slurge://auth/callback` via `expo-web-browser`).
   - Final end-to-end execution of Google Sign In requires configuring the Google Cloud OAuth 2.0 Web Client ID in the Supabase Dashboard (`Auth > Providers > Google`).
2. **Mailgun Production DNS Verification**:
   - The backend Mailgun client functions in test mode with sandbox/mock addresses.
   - Sending to real customer inboxes requires human verification of domain DNS records (SPF, DKIM, MX).
3. **Paystack Live Secret Key**:
   - The app operates in Paystack Test Mode (`sk_test_...` and `pk_test_...`).
   - Live debit/credit card settlement requires switching environment variables to Paystack Live keys upon production deployment.
