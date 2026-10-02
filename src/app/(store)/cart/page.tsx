"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
} from "@/components/ui/icons";
import { useCartStore } from "@/lib/cart/store";
import { calculateCartTotals } from "@/lib/cart/merge";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, freeShippingThresholdMinor } =
    useCartStore();
  const [couponCode, setCouponCode] = React.useState("");
  const [couponMessage, setCouponMessage] = React.useState<string | null>(null);

  const totals = calculateCartTotals(items, freeShippingThresholdMinor);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage("Coupons will be verified and applied during checkout.");
  };

  const progressPercent = Math.min(
    100,
    Math.round(
      (totals.subtotalMinor / totals.freeShippingThresholdMinor) * 100
    )
  );

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center shadow-sm">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            You haven’t added any tech to your cart yet. Discover authentic phones, laptops, and gaming consoles with local warranty.
          </p>
        </div>
        <Button asChild size="lg" className="font-semibold gap-2 shadow-lg shadow-[var(--primary)]/20">
          <Link href="/shop">
            <Sparkles className="h-4 w-4" />
            <span>Start Shopping Now</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-10 sm:py-14 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Shopping Cart
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review your electronics items and proceed to secure checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Items Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert */}
          <div className="rounded-2xl p-4 bg-[var(--surface)] border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <Truck className="h-4 w-4 text-[var(--primary)]" />
                {totals.qualifiesForFreeShipping ? (
                  <span className="text-[var(--success)] font-bold">
                    🎉 Free express shipping unlocked for your order!
                  </span>
                ) : (
                  <span>
                    Add{" "}
                    <strong className="text-[var(--primary)]">
                      {formatMoney(totals.amountNeededForFreeShippingMinor)}
                    </strong>{" "}
                    more for FREE delivery in Lagos & Abuja
                  </span>
                )}
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)]">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  totals.qualifiesForFreeShipping
                    ? "bg-[var(--success)]"
                    : "bg-[var(--primary)]"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden shadow-sm">
            {items.map((item) => {
              const variantOptionsText =
                Object.values(item.variantOptions).filter(Boolean).join(" • ") ||
                item.variantSku;

              return (
                <div
                  key={item.variantId}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] p-2 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-[var(--text-muted)]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={`/product/${item.productSlug || item.productId}`}
                        className="text-sm sm:text-base font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-[var(--text-muted)]">
                        {variantOptionsText}
                      </p>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] sm:hidden block pt-1">
                        {formatMoney(item.priceMinor)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[var(--border)]">
                    {/* Stepper */}
                    <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--surface)] h-9">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="px-2.5 h-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.maxStock}
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="px-2.5 h-full text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Total Price for line */}
                    <div className="text-right min-w-[100px]">
                      <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] block">
                        {formatMoney(item.priceMinor * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                          {formatMoney(item.priceMinor)} each
                        </span>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Remove ${item.productName}`}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-1.5 rounded-lg hover:bg-[var(--danger-soft)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-[var(--glass-border)] liquid-glass p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Items Subtotal ({totals.itemCount})</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatMoney(totals.subtotalMinor)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span>
                  {totals.qualifiesForFreeShipping ? (
                    <strong className="text-[var(--success)]">FREE</strong>
                  ) : (
                    "Calculated at checkout"
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-base">
                <span className="font-bold text-[var(--text-primary)]">
                  Estimated Total
                </span>
                <span className="text-xl font-extrabold text-[var(--text-primary)]">
                  {formatMoney(totals.subtotalMinor)}
                </span>
              </div>
            </div>

            {/* Coupon Code Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2">
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon / Promo code"
                  className="h-10 text-xs uppercase"
                />
                <Button type="submit" variant="secondary" className="h-10 text-xs px-4">
                  Apply
                </Button>
              </div>
              {couponMessage && (
                <p className="text-[11px] text-[var(--primary)] font-medium">
                  {couponMessage}
                </p>
              )}
            </form>

            <Button
              asChild
              size="lg"
              className="w-full h-12 font-bold gap-2 text-sm shadow-lg shadow-[var(--primary)]/20"
            >
              <Link href="/checkout">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] pt-2">
              <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
              <span>Insured checkout powered by Paystack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
