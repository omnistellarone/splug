"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

export function CartTrigger() {
  const { items, openCart, hasHydrated } = useCartStore();

  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Shopping cart with ${totalCount} items`}
      id="cart-icon"
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer",
        "text-[var(--text-secondary)] transition-colors duration-150 select-none",
        "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
      )}
    >
      <ShoppingCart size={18} strokeWidth={1.75} />
      {hasHydrated && totalCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[10px] font-extrabold shadow-sm animate-in zoom-in-50">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </button>
  );
}
