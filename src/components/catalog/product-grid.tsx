import * as React from "react";
import { PackageSearch } from "lucide-react";
import type { ProductWithDetails } from "@/lib/catalog/types";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: ProductWithDetails[];
  onResetFilters?: () => void;
}

export function ProductGrid({ products, onResetFilters }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] p-12 text-center my-8">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--surface)] text-[var(--text-muted)] flex items-center justify-center mb-4 shadow-sm border border-[var(--border)]">
          <PackageSearch className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          No products match your criteria
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
          Try expanding your price range, searching for another keyword, or clearing the selected filters.
        </p>
        {onResetFilters && (
          <div className="mt-6">
            <Button variant="secondary" onClick={onResetFilters}>
              Reset all filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} priority={idx < 4} />
      ))}
    </div>
  );
}
