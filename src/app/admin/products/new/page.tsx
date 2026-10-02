import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "@/components/ui/icons";
import { getCategories, getBrands } from "@/lib/catalog/queries";
import { NewProductForm } from "@/components/admin/new-product-form";

export const metadata: Metadata = {
  title: "Add New Product — Slurge Admin",
  description: "Create a new electronics product listing and initial variant.",
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Add New Product
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Enter product details, upload product image, and set initial variant inventory
        </p>
      </div>

      {/* Interactive Form Component with Image Upload & Live Feedback */}
      <NewProductForm categories={categories} brands={brands} />
    </div>
  );
}
