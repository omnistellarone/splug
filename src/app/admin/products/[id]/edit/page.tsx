import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCategories, getBrands } from "@/lib/catalog/queries";
import { getProductForEditAction } from "@/lib/admin/actions";
import { EditProductForm } from "@/components/admin/edit-product-form";

export const metadata: Metadata = {
  title: "Edit Product — Slurge Admin",
  description: "Modify product specifications, price, stock, or imagery.",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductForEditAction(id),
    getCategories(),
    getBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in-0 duration-300">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Edit Product
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Update details, change pricing or stock, and modify imagery for {product.name}
        </p>
      </div>

      <EditProductForm
        productId={id}
        initialData={product}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
