import * as React from "react";
import type { ProductWithDetails } from "@/lib/catalog/types";

interface ProductSpecsTableProps {
  product: ProductWithDetails;
}

export function ProductSpecsTable({ product }: ProductSpecsTableProps) {
  const activeVariant = product.variants[0];

  const specs = [
    { label: "Brand", value: product.brand?.name || "Official" },
    { label: "Category", value: product.category?.name || "Electronics" },
    { label: "SKU / Model", value: activeVariant?.sku || product.slug },
    {
      label: "Configurations",
      value: product.variants
        .map((v) => Object.values(v.options).filter(Boolean).join(" / "))
        .filter(Boolean)
        .join(", ") || "Standard",
    },
    {
      label: "Weight",
      value: activeVariant?.weight_grams
        ? `${activeVariant.weight_grams} grams`
        : "Approx. 200–500g",
    },
    { label: "Warranty", value: "1 Year Official Brand Warranty (Nigeria)" },
    { label: "Condition", value: "Brand New, Sealed in Box" },
    { label: "Box Contents", value: "Device, Documentation, Official Charging Cable" },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
      <div className="bg-[var(--surface-subtle)] px-6 py-4 border-b border-[var(--border)]">
        <h3 className="font-bold text-sm text-[var(--text-primary)]">
          Technical Specifications
        </h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-xs sm:text-sm hover:bg-[var(--surface-hover)] transition-colors"
          >
            <span className="font-medium text-[var(--text-muted)]">
              {spec.label}
            </span>
            <span className="sm:col-span-2 font-semibold text-[var(--text-primary)] mt-0.5 sm:mt-0">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
