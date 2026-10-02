import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, ShoppingBag } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 liquid-glass p-8 sm:p-10 rounded-3xl border border-[var(--glass-border)] shadow-2xl">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
          <Compass className="h-8 w-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-[var(--primary)] uppercase">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            The gadget, product page, or destination you are looking for has either moved or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="w-full sm:w-auto font-semibold gap-2 shadow-sm">
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Shop</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto font-semibold gap-2"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
