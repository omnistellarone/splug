"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Plus,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "@/components/ui/icons";
import { useCartStore } from "@/lib/cart/store";
import { calculateCartTotals } from "@/lib/cart/merge";
import { formatMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/client";
import {
  getUserAddressesAction,
  saveAddressAction,
  validateCouponAction,
  initializeCheckoutOrderAction,
} from "@/lib/checkout/actions";
import type { Address } from "@/lib/types/database";
import type { ShippingAddressSnapshot } from "@/lib/checkout/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Enugu",
  "Delta",
  "Edo",
  "Kaduna",
  "Anambra",
  "Akwa Ibom",
  "Imo",
  "Abia",
  "Osun",
  "Kwara",
  "Plateau",
  "Other",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hasHydrated } = useCartStore();

  const [user, setUser] = React.useState<{ id: string; email?: string } | null>(
    null
  );
  const [authChecking, setAuthChecking] = React.useState(true);

  // Address selection state
  const [savedAddresses, setSavedAddresses] = React.useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = React.useState(false);

  // New address input state
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [addressLine1, setAddressLine1] = React.useState("");
  const [addressLine2, setAddressLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [customerNote, setCustomerNote] = React.useState("");

  // Coupon state
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discountMinor: number;
  } | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [couponLoading, setCouponLoading] = React.useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

  // Cart calculations
  const cartTotals = calculateCartTotals(items);
  const subtotalMinor = cartTotals.subtotalMinor;

  const FREE_SHIPPING_THRESHOLD_MINOR = 100000000; // ₦1,000,000
  const STANDARD_SHIPPING_MINOR = 350000; // ₦3,500
  const qualifiesForFreeShipping = subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR;
  const shippingMinor = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_MINOR;
  const discountMinor = appliedCoupon ? appliedCoupon.discountMinor : 0;
  const totalMinor = Math.max(0, subtotalMinor - discountMinor + shippingMinor);

  // Check auth and load addresses
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email });
        const addresses = await getUserAddressesAction();
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
          const metaName = (authUser.user_metadata?.full_name as string) || (authUser.user_metadata?.name as string) || "";
          if (metaName) {
            setFullName(metaName);
          }
        }
      } else {
        setUser(null);
      }
      setAuthChecking(false);
    });
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);

    const res = await validateCouponAction(couponCode, subtotalMinor);
    setCouponLoading(false);

    if (res.valid && res.code) {
      setAppliedCoupon({ code: res.code, discountMinor: res.discountMinor });
      setCouponError(null);
    } else {
      setCouponError(res.error || "Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);

    let shippingAddress: ShippingAddressSnapshot;

    if (showNewAddressForm || savedAddresses.length === 0) {
      if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim()) {
        setCheckoutError("Please fill in all required shipping address fields (including delivery state).");
        return;
      }

      shippingAddress = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || undefined,
        city: city.trim(),
        state,
        country: "NG",
      };

      // Save address for future use in background
      saveAddressAction({
        full_name: shippingAddress.full_name,
        phone: shippingAddress.phone,
        address_line1: shippingAddress.address_line1,
        address_line2: shippingAddress.address_line2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        is_default: savedAddresses.length === 0,
      }).catch((e) => console.error("Error saving address:", e));
    } else {
      const selected = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!selected) {
        setCheckoutError("Please select a delivery address.");
        return;
      }

      shippingAddress = {
        full_name: selected.full_name,
        phone: selected.phone,
        address_line1: selected.address_line1,
        address_line2: selected.address_line2 || undefined,
        city: selected.city,
        state: selected.state,
        country: selected.country,
      };
    }

    setIsSubmitting(true);

    try {
      const result = await initializeCheckoutOrderAction({
        shippingAddress,
        couponCode: appliedCoupon?.code,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        customerNote: customerNote.trim() || undefined,
      });

      if (!result.success) {
        if (result.redirect) {
          router.push(result.redirect);
          return;
        }
        setCheckoutError(result.error || "Unable to proceed to payment. Please retry.");
        setIsSubmitting(false);
        return;
      }

      if (result.authorizationUrl) {
        // Redirect to Paystack secure checkout page
        window.location.href = result.authorizationUrl;
      } else {
        setCheckoutError("Missing payment authorization URL.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Order initialization exception:", err);
      setCheckoutError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (authChecking || !hasHydrated) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-xs text-[var(--text-muted)]">Preparing secure checkout…</p>
      </div>
    );
  }

  // Auth gate — AGENTS.md §15: Checkout requires signed-in user
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shadow-sm">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Account Required for Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            To ensure genuine order tracking, insured shipping, and manufacturer warranty coverage, please sign in or create an account.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Button asChild size="lg" className="w-full font-bold">
            <Link href="/sign-in?next=/checkout">Sign In to Continue</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full font-semibold">
            <Link href="/sign-up?next=/checkout">Create Free Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
          Your Cart is Empty
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          You need at least one electronics item in your cart to proceed with checkout.
        </p>
        <Button asChild className="font-semibold">
          <Link href="/shop">Browse Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[var(--primary)] font-bold uppercase tracking-wider mb-1">
          <Lock className="h-3.5 w-3.5" />
          <span>256-Bit Encrypted Secure Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Complete Your Order
        </h1>
      </div>

      {checkoutError && (
        <div className="p-4 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] text-xs sm:text-sm flex items-start gap-2.5 border border-[var(--danger)]/20 animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Delivery & Shipping Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* ── Section 1: Shipping Address ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Delivery Address
                </h2>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showNewAddressForm ? "Select Saved" : "New Address"}</span>
                </button>
              )}
            </div>

            {/* Saved addresses selector */}
            {!showNewAddressForm && savedAddresses.length > 0 && (
              <div className="space-y-3">
                {savedAddresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4",
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary-soft)]/40 ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-primary)]">
                            {addr.full_name}
                          </span>
                          <span className="text-[var(--text-muted)]">•</span>
                          <span className="text-[var(--text-muted)] font-medium">
                            {addr.phone}
                          </span>
                          {addr.is_default && (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-[var(--text-secondary)]">
                          {addr.address_line1}
                          {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                        </p>
                        <p className="text-[var(--text-muted)]">
                          {addr.city}, {addr.state}, Nigeria
                        </p>
                      </div>

                      <div
                        className={cn(
                          "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border)]"
                        )}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New address input form */}
            {(showNewAddressForm || savedAddresses.length === 0) && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-semibold">
                      Recipient Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Recipient full name"
                      autoComplete="off"
                      className="h-10 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Phone Number (for Courier Call) *
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08012345678"
                      autoComplete="off"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addressLine1" className="text-xs font-semibold">
                    Street Address / House Number *
                  </Label>
                  <Input
                    id="addressLine1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House / building number, street name"
                    autoComplete="off"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addressLine2" className="text-xs font-semibold">
                    Apartment / Suite / Landmark (Optional)
                  </Label>
                  <Input
                    id="addressLine2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apartment, suite, landmark (optional)"
                    autoComplete="off"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold">
                      City / Area *
                    </Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City or local area"
                      autoComplete="off"
                      className="h-10 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-semibold">
                      State *
                    </Label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="">Select Delivery State *</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Note */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
              <Label htmlFor="customerNote" className="text-xs font-semibold">
                Delivery Instructions (Optional)
              </Label>
              <Input
                id="customerNote"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Call before arrival, leave with security at gate"
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* ── Section 2: Payment Provider ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Payment Method
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Instant, secure processing via Paystack
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" />
                <div className="text-xs">
                  <span className="font-bold text-[var(--text-primary)] block">
                    Paystack Direct Gateway
                  </span>
                  <span className="text-[var(--text-muted)]">
                    Debit Card, Bank Transfer, USSD, Apple Pay & QR
                  </span>
                </div>
              </div>
              <ShieldCheck className="h-5 w-5 text-[var(--success)]" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Paystack Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-[var(--glass-border)] liquid-glass p-6 sm:p-8 space-y-6 shadow-xl sticky top-24">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
            </h2>

            {/* Line items preview */}
            <div className="divide-y divide-[var(--border)] max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-[var(--text-muted)]">Item</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {item.productName}
                    </p>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Qty: {item.quantity} × {formatMoney(item.priceMinor)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] shrink-0">
                    {formatMoney(item.priceMinor * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5 pt-2 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo Code (e.g. WELCOME10)"
                  className="h-9 text-xs uppercase"
                  disabled={couponLoading || !!appliedCoupon}
                />
                {appliedCoupon ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                    }}
                    className="h-9 text-xs text-[var(--danger)]"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="h-9 text-xs px-3"
                    disabled={couponLoading}
                  >
                    {couponLoading ? "…" : "Apply"}
                  </Button>
                )}
              </div>
              {appliedCoupon && (
                <p className="text-[11px] text-[var(--success)] font-semibold">
                  ✓ Code {appliedCoupon.code} applied (-{formatMoney(appliedCoupon.discountMinor)})
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-[var(--danger)] font-medium">
                  {couponError}
                </p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoney(subtotalMinor)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-[var(--success)]">
                  <span>Coupon Discount</span>
                  <span className="font-bold">
                    -{formatMoney(appliedCoupon.discountMinor)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>Delivery Fee</span>
                </span>
                <span>
                  {qualifiesForFreeShipping ? (
                    <strong className="text-[var(--success)]">FREE (Express)</strong>
                  ) : (
                    formatMoney(shippingMinor)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-base">
                <span className="font-bold text-[var(--text-primary)]">Grand Total</span>
                <span className="text-xl font-extrabold text-[var(--text-primary)]">
                  {formatMoney(totalMinor)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <Button
              type="button"
              size="lg"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full h-12 font-bold gap-2 text-sm shadow-xl shadow-[var(--primary)]/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to Paystack…</span>
                </>
              ) : (
                <>
                  <span>Pay with Paystack</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
              <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
              <span>Full buyer protection & official brand warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
