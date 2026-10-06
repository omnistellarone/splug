# Slurge Electronics — Mobile App (Android / Expo)

This is the Android mobile companion app for Slurge Electronics, built with **React Native**, **Expo SDK 57**, and **TypeScript**. It faithfully implements the 8 high-fidelity screens from the **Kalki Premium** design system, connected directly to the existing Next.js backend and Supabase database.

---

## 📱 Features & Stitch Screen Implementations

1. **Authentication (`AuthScreen`)**:
   - Secure sign in & registration via Supabase Auth.
   - Tokens securely saved using `expo-secure-store`.
   - Biometric authentication trigger simulation.
   - Google OAuth via browser/app redirect (`slurge://auth/callback`).

2. **Storefront & Discovery (`HomeScreen`)**:
   - Kalki Premium dark aesthetic (`#070709` deep background, neon cyan `#00F0FF` & electric violet `#7928CA` accents).
   - Real-time catalog search with debouncing.
   - Category filtering (Smartphones, Audio, Laptops, Wearables, Gaming).
   - Dynamic product cards with minor-unit NGN currency formatting and badges.

3. **Product Details (`ProductDetailsScreen`)**:
   - Full-bleed image carousel with pagination dots.
   - Variant selector (Storage, Color, etc.) with dynamic pricing and live stock indicator.
   - One-tap "Add to Cart" and fast "Buy Now" flow.

4. **Interactive Cart (`CartScreen`)**:
   - Real-time cart state synchronized with both local storage (guest) and Supabase DB (authenticated).
   - Dynamic free-shipping progress tracker (₦150,000 threshold).
   - Promo coupon code verification (`SAVE10`, etc.).
   - Quantity decrement/increment with atomic stock-limit validation.

5. **Delivery & Checkout (`CheckoutScreen`)**:
   - Delivery address picker and "Add New Address" modal with default address toggling.
   - Server-validated order creation (`/api/checkout`).
   - Secure Paystack payment initialization.
   - In-app Paystack checkout modal powered by `react-native-webview`.

6. **Payment Status & Verification (`PaymentStatusScreen`)**:
   - Real-time payment verification against the Next.js server (`/api/payments/paystack/verify?reference=...&format=json`).
   - Instant visual feedback for successful transactions with Paystack reference details.
   - Safe retry action for failed or cancelled transactions.

7. **Live Order Tracking (`OrderTrackingScreen`)**:
   - Step-by-step delivery progress milestones (Confirmed, Processing, Shipped, Delivered).
   - Courier info (GIG Logistics / DHL Express), tracking ID, and delivery address snapshot.
   - Itemized order snapshot list.

8. **User Profile & History (`AccountScreen`)**:
   - User identity details and session status.
   - Order history with status badges and deep-links to tracking.
   - Dynamic API Host Switcher (toggle between Android Emulator `http://10.0.2.2:3000`, local machine IP, or production URL without rebuilding the app).
   - Safe sign out and session purge.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

> **Network Note for Android**:
> - When running on the **Android Emulator**, `http://10.0.2.2:3000` routes directly to `localhost:3000` on your host PC.
> - When running on a **Physical Android Device**, set `EXPO_PUBLIC_API_URL` to your PC's LAN IP (e.g. `http://192.168.1.50:3000`), or change it on the fly in the app's **Account** tab!

---

## 🚀 Running the App in Development

1. **Start the Next.js Web Backend**:
   ```bash
   # From root directory
   npm run dev
   ```

2. **Start the Expo Development Server**:
   ```bash
   cd mobile
   npm start
   ```

3. **Run on Android Emulator**:
   ```bash
   npm run android
   ```

---

## 📦 Standalone Signed APK

The standalone Android APK is built directly using Gradle (`assembleRelease`):

- **Location**: `mobile/android/app/build/outputs/apk/release/app-release.apk`
- Also copied to root: `slurge-electronics-release.apk`

To install on a connected phone or emulator:
```bash
adb install -r slurge-electronics-release.apk
```
