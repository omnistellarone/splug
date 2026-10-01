"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref");
  const orderId = searchParams.get("orderId");

  // Empty cart upon successful verified checkout
  React.useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 animate-in fade-in duration-300">
      {/* ── Liquid Glass Success Card ── */}
      <div className="rounded-3xl border border-[var(--glass-border)] liquid-glass p-8 sm:p-12 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--success)]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto h-20 w-20 rounded-3xl bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center shadow-lg shadow-[var(--success)]/10 animate-bounce duration-1000">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--success)] uppercase tracking-wider">
            Payment Verified & Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Your electronics order has been placed successfully and received in our fulfillment center. We have queued your order for packing.
          </p>
        </div>

        {/* Reference Strip */}
        {reference && (
          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs space-y-1">
            <span className="text-[var(--text-muted)] block">
              Payment Reference
            </span>
            <code className="text-xs sm:text-sm font-mono font-bold text-[var(--primary)] break-all">
              {reference}
            </code>
          </div>
        )}

        {/* Logistics Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start gap-3">
            <Truck className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[var(--text-primary)] block">
                Express Delivery
              </span>
              <span className="text-[var(--text-muted)]">
                24 - 48 hours delivery within Lagos & Abuja
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--success)] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[var(--text-primary)] block">
                Official Warranty
              </span>
              <span className="text-[var(--text-muted)]">
                Factory warranty active starting from delivery day
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border)]">
          <Button asChild size="lg" className="flex-1 font-bold gap-2">
            <Link href={orderId ? `/account/orders/${orderId}` : "/account/orders"}>
              <Package className="h-4 w-4" />
              <span>Track in My Orders</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 font-semibold gap-2"
          >
            <Link href="/shop">
              <Sparkles className="h-4 w-4" />
              <span>Continue Shopping</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-xs text-[var(--text-muted)]">
          Loading order details…
        </div>
      }
    >
      <CheckoutSuccessContent />
    </React.Suspense>
  );
}
