"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { calculateCartTotals } from "@/lib/cart/merge";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } =
    useCartStore();

  const totals = calculateCartTotals(items);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round(
      (totals.subtotalMinor / totals.freeShippingThresholdMinor) * 100
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in-0 duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className="relative w-full max-w-md bg-[var(--surface)] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-[var(--border)]"
      >
        {/* ── Drawer Header (Liquid Glass) ── */}
        <div className="px-6 py-4 border-b border-[var(--border)] liquid-glass flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                Your Cart
              </h2>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Free Shipping Progress Bar ── */}
        <div className="px-6 py-3 bg-[var(--surface-subtle)] border-b border-[var(--border)] shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Truck className="h-3.5 w-3.5 text-[var(--primary)]" />
              {totals.qualifiesForFreeShipping ? (
                <span className="text-[var(--success)] font-bold">
                  🎉 Free express shipping unlocked!
                </span>
              ) : (
                <span>
                  Add{" "}
                  <strong className="text-[var(--primary)]">
                    {formatMoney(totals.amountNeededForFreeShippingMinor)}
                  </strong>{" "}
                  for FREE delivery
                </span>
              )}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-bold">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
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

        {/* ── Cart Items List ── */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-[var(--surface-subtle)] text-[var(--text-muted)] flex items-center justify-center border border-[var(--border)]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Your cart is empty
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Looks like you haven’t added any tech to your cart yet. Explore our genuine gadgets with warranty.
              </p>
            </div>
            <Button
              asChild
              onClick={closeCart}
              className="mt-2 font-semibold gap-2 shadow-sm"
            >
              <Link href="/shop">
                <Sparkles className="h-4 w-4" />
                <span>Explore Products</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[var(--border)]">
            {items.map((item) => {
              const variantOptionsText =
                Object.values(item.variantOptions).filter(Boolean).join(" • ") ||
                item.variantSku;

              return (
                <div
                  key={item.variantId}
                  className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group"
                >
                  {/* Thumbnail */}
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

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.productSlug || item.productId}`}
                        onClick={closeCart}
                        className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.productName} from cart`}
                        className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {variantOptionsText}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      {/* Stepper */}
                      <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--surface)] h-7">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="px-2 h-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-[var(--text-primary)]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.maxStock}
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="px-2 h-full text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {formatMoney(item.priceMinor * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Sticky Drawer Footer ── */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[var(--border)] bg-[var(--surface)] shrink-0 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)] font-medium">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-[var(--text-primary)]">
                  {formatMoney(totals.subtotalMinor)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Shipping estimate</span>
                <span>
                  {totals.qualifiesForFreeShipping
                    ? "FREE (Express)"
                    : "Calculated at checkout"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                asChild
                size="lg"
                onClick={closeCart}
                className="w-full font-bold gap-2 h-12 shadow-lg shadow-[var(--primary)]/20 text-sm"
              >
                <Link href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                onClick={closeCart}
                className="w-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <Link href="/cart">View Full Cart Details</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
