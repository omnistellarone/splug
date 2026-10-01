"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist/store";
import { FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { productIds, hasHydrated } = useWishlistStore();

  const wishlistedProducts = FIXTURE_PRODUCTS.filter((p) =>
    productIds.includes(p.id)
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-10 sm:py-14 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          My Saved Wishlist
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Keep track of your favorite gadgets and receive instant price drop updates
        </p>
      </div>

      {hasHydrated && wishlistedProducts.length === 0 ? (
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center shadow-sm">
            <Heart className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Click the heart icon on any product to save it here for later.
            </p>
          </div>
          <Button asChild size="lg" className="font-semibold gap-2 shadow-sm">
            <Link href="/shop">
              <Sparkles className="h-4 w-4" />
              <span>Explore Electronics</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
