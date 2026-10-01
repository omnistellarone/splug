"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RefreshCw, ShoppingCart, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function CheckoutFailureContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("ref");
  const reason = searchParams.get("reason");

  const getReasonMessage = (code: string | null) => {
    switch (code) {
      case "abandoned":
        return "The transaction was cancelled or abandoned before completion.";
      case "failed":
        return "The card issuer declined the transaction or insufficient funds were detected.";
      case "verification_error":
        return "We were unable to verify the transaction status with Paystack.";
      case "order_not_found":
        return "The corresponding order could not be located in our system.";
      default:
        return "An unexpected issue occurred while processing your payment.";
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 animate-in fade-in duration-300">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-12 space-y-6 shadow-xl relative">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center shadow-lg shadow-[var(--danger)]/10">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--danger)] uppercase tracking-wider">
            Payment Not Completed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Checkout Incomplete
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            {getReasonMessage(reason)}
          </p>
        </div>

        {reference && (
          <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs">
            <span className="text-[var(--text-muted)] block mb-1">
              Transaction Reference
            </span>
            <code className="text-xs font-mono font-semibold text-[var(--text-primary)]">
              {reference}
            </code>
          </div>
        )}

        <div className="p-4 rounded-xl bg-[var(--surface-subtle)] text-xs text-[var(--text-muted)] text-left flex items-start gap-2.5">
          <HelpCircle className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <span>
            Don’t worry — if your bank account was debited, Paystack will automatically reverse the charge within 24 hours. Your cart items are still saved.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border)]">
          <Button asChild size="lg" className="flex-1 font-bold gap-2">
            <Link href="/checkout">
              <RefreshCw className="h-4 w-4" />
              <span>Retry Payment</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1 font-semibold gap-2"
          >
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
              <span>Return to Cart</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-xs text-[var(--text-muted)]">
          Loading…
        </div>
      }
    >
      <CheckoutFailureContent />
    </React.Suspense>
  );
}
