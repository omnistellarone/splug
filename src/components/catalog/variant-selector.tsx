"use client";

import * as React from "react";
import { ShoppingCart, Check, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import type { ProductVariantWithDetails } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  productId: string;
  productSlug?: string;
  productName: string;
  productImage?: string;
  variants: ProductVariantWithDetails[];
}

export function VariantSelector({
  productId,
  productSlug,
  productName,
  productImage,
  variants,
}: VariantSelectorProps) {
  const addItemToCart = useCartStore((state) => state.addItem);

  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    variants[0]?.id || ""
  );
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  if (!selectedVariant) {
    return (
      <div className="p-4 rounded-xl bg-[var(--surface-subtle)] text-sm text-[var(--text-muted)]">
        This product is currently unavailable.
      </div>
    );
  }

  const price = selectedVariant.price_minor;
  const compareAt = selectedVariant.compare_at_minor;
  const hasDiscount = !!compareAt && compareAt > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : 0;

  const stock = selectedVariant.stock;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    addItemToCart({
      variantId: selectedVariant.id,
      productId,
      productSlug,
      productName,
      variantSku: selectedVariant.sku,
      variantOptions: selectedVariant.options,
      priceMinor: selectedVariant.price_minor,
      image: productImage,
      quantity,
      maxStock: selectedVariant.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Price Row ── */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-extrabold text-[var(--text-primary)]">
            {formatMoney(price)}
          </span>
          {hasDiscount && compareAt && (
            <span className="text-lg text-[var(--text-muted)] line-through">
              {formatMoney(compareAt)}
            </span>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="font-bold">
              Save {discountPercent}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Price in Nigerian Naira (NGN) • Includes genuine warranty & VAT
        </p>
      </div>

      {/* ── Variant Option Selectors ── */}
      {variants.length > 1 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Select Configuration:
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              SKU: {selectedVariant.sku}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              const label =
                Object.values(variant.options).filter(Boolean).join(" • ") ||
                variant.sku;

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "flex flex-col text-left p-3.5 rounded-xl border transition-all relative cursor-pointer",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]/50 ring-1 ring-[var(--primary)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isSelected
                          ? "text-[var(--primary)]"
                          : "text-[var(--text-primary)]"
                      )}
                    >
                      {label}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[var(--primary)]" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {formatMoney(variant.price_minor)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stock Status ── */}
      <div className="flex items-center gap-2 pt-1">
        {isOutOfStock ? (
          <Badge variant="secondary" className="text-xs text-[var(--danger)]">
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge variant="warning" className="text-xs">
            Only {stock} units left in stock!
          </Badge>
        ) : (
          <Badge variant="success" className="text-xs">
            ✓ In Stock — Ready for immediate dispatch
          </Badge>
        )}
      </div>

      {/* ── Quantity & Add to Cart Action ── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--surface)] h-12">
          <button
            type="button"
            disabled={quantity <= 1 || isOutOfStock}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3.5 h-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-semibold text-[var(--text-primary)]">
            {quantity}
          </span>
          <button
            type="button"
            disabled={quantity >= Math.min(stock, 10) || isOutOfStock}
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3.5 h-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <Button
          type="button"
          size="lg"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={cn(
            "flex-1 h-12 text-sm font-semibold gap-2 shadow-lg transition-all",
            added
              ? "bg-[var(--success)] hover:bg-[var(--success)] text-white shadow-[var(--success)]/20"
              : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-[var(--primary)]/20"
          )}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </>
          )}
        </Button>
      </div>

      {/* ── Trust Badges Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Truck className="h-4 w-4 text-[var(--primary)] shrink-0" />
          <span>24-48h Delivery in Lagos & Abuja</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <ShieldCheck className="h-4 w-4 text-[var(--success)] shrink-0" />
          <span>1-Year Official Manufacturer Warranty</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <RefreshCw className="h-4 w-4 text-[var(--warning)] shrink-0" />
          <span>7-Day Return Policy on Faults</span>
        </div>
      </div>
    </div>
  );
}
