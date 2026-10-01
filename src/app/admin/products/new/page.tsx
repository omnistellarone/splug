import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCategories, getBrands } from "@/lib/catalog/queries";
import { createProductAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Add New Product — Splug Admin",
  description: "Create a new electronics product listing and initial variant.",
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  async function handleCreateProduct(formData: FormData) {
    "use server";
    const res = await createProductAction(formData);
    if (res.success) {
      redirect("/admin/products");
    }
  }

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
          Enter product details, category, brand, and initial variant stock
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
        <form action={handleCreateProduct} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
              General Information
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-[var(--text-secondary)]">
                Product Title *
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="categoryId" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Category *
                </Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brandId" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Brand *
                </Label>
                <select
                  id="brandId"
                  name="brandId"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Select a brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-[var(--text-secondary)]">
                Product Description
              </Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Detailed technical specifications, features, warranty, and contents..."
                className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Initial Variant & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-xs font-semibold text-[var(--text-secondary)]">
                  SKU Identifier *
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  required
                  placeholder="e.g. SONY-WH1000XM5-BLK"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priceNaira" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Retail Price (₦) *
                </Label>
                <Input
                  id="priceNaira"
                  name="priceNaira"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 450000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Initial Units In Stock *
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  defaultValue="10"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/products">Cancel</Link>
            </Button>
            <Button type="submit" className="font-semibold shadow-sm">
              Save & Publish Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
