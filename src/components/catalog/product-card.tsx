"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Star, ShoppingBag, Check } from "@/components/ui/icons";
import { formatMoney } from "@/lib/money";
import type { ProductWithDetails } from "@/lib/catalog/types";
import { useCartStore } from "@/lib/cart/store";
import { useWishlistStore } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithDetails;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const productIds = useWishlistStore((state) => state.productIds);
  const isWishlisted = productIds.includes(product.id);
  const toggleWishlistStore = useWishlistStore((state) => state.toggleItem);
  const addItemToCart = useCartStore((state) => state.addItem);

  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState(0);
  const [addedAnim, setAddedAnim] = React.useState(false);

  const activeVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const price = activeVariant ? activeVariant.price_minor : product.minPriceMinor;
  const compareAt = activeVariant?.compare_at_minor || product.compareAtMinor;
  const hasDiscount = !!compareAt && compareAt > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeVariant || !product.inStock) return;

    addItemToCart({
      variantId: activeVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantSku: activeVariant.sku,
      variantOptions: activeVariant.options,
      priceMinor: activeVariant.price_minor,
      image: product.primaryImage || undefined,
      quantity: 1,
      maxStock: activeVariant.stock,
    });

    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistStore(product.id);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 hover:border-[var(--primary)]/40 hover:shadow-xl hover:shadow-[var(--primary)]/5 transition-all duration-300">
      {/* Top Badges & Wishlist */}
      <div className="flex items-center justify-between gap-2 mb-2 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasDiscount && (
            <span className="inline-flex items-center rounded-md bg-[var(--danger)] text-white px-2 py-0.5 text-[11px] font-bold tracking-tight">
              -{discountPercent}%
            </span>
          )}
          {product.inStock ? (
            <span className="inline-flex items-center rounded-md bg-[var(--success-soft)] text-[var(--success)] px-2 py-0.5 text-[10px] font-semibold">
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-[var(--surface-subtle)] text-[var(--text-muted)] px-2 py-0.5 text-[10px] font-semibold">
              Out of Stock
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
            isWishlisted
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
          )}
        >
          <Heart
            className={cn("h-4 w-4 transition-transform active:scale-75", isWishlisted && "fill-current")}
          />
        </button>
      </div>

      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full rounded-xl overflow-hidden bg-[var(--surface-subtle)] mb-3.5 block"
      >
        {product.primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImage}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 block"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[var(--text-muted)] text-xs">
            No image
          </div>
        )}
      </Link>

      {/* Variant Color Dots (if applicable) */}
      {product.variants.length > 1 && (
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          {product.variants.slice(0, 4).map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSelectedVariantIndex(i);
              }}
              title={v.options.color || v.sku}
              className={cn(
                "h-3 w-3 rounded-full border transition-all",
                selectedVariantIndex === i
                  ? "ring-2 ring-[var(--primary)] ring-offset-1 scale-110 border-transparent bg-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--text-muted)]/40 hover:opacity-100"
              )}
            />
          ))}
          {product.variants.length > 4 && (
            <span className="text-[10px] text-[var(--text-muted)] font-medium ml-1">
              +{product.variants.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Brand & Category */}
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
        {product.brand?.name || "Genuine"} • {product.category?.name || "Electronics"}
      </div>

      {/* Product Title */}
      <Link
        href={`/product/${product.slug}`}
        className="font-medium text-sm text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug mb-2"
      >
        {product.name}
      </Link>

      {/* Ratings */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3 mt-auto">
        <div className="flex items-center text-amber-500">
          <Star className="h-3.5 w-3.5 fill-current" />
        </div>
        <span className="font-semibold text-[var(--text-primary)]">
          {product.ratingAverage.toFixed(1)}
        </span>
        <span>({product.ratingCount})</span>
      </div>

      {/* Pricing Row */}
      <div className="flex items-baseline gap-2 mb-3.5 flex-wrap">
        <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
          {formatMoney(price)}
        </span>
        {hasDiscount && compareAt && (
          <span className="text-xs text-[var(--text-muted)] line-through">
            {formatMoney(compareAt)}
          </span>
        )}
      </div>

      {/* Add To Cart Button */}
      <button
        type="button"
        onClick={handleQuickAdd}
        disabled={!product.inStock}
        className={cn(
          "w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 select-none cursor-pointer",
          addedAnim
            ? "bg-[var(--success)] text-white shadow-sm"
            : product.inStock
            ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-[0.98] shadow-sm"
            : "bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed"
        )}
      >
        {addedAnim ? (
          <>
            <Check className="h-4 w-4" />
            <span>Added to Cart</span>
          </>
        ) : (
          <>
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{product.inStock ? "Add to Cart" : "Out of Stock"}</span>
          </>
        )}
      </button>
    </div>
  );
}
