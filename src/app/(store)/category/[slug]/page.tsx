import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "@/components/ui/icons";
import {
  getProducts,
  getCategories,
  getBrands,
} from "@/lib/catalog/queries";
import { CatalogFilterBar } from "@/components/catalog/catalog-filter-bar";
import { ProductGrid } from "@/components/catalog/product-grid";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    brand?: string | string[];
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    on_sale?: string;
    sort?: "popularity" | "newest" | "price_asc" | "price_desc" | "rating";
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: "Category Not Found — Slurge" };
  }

  return {
    title: `${category.name} in Nigeria — Slurge Electronics`,
    description: `Shop authentic ${category.name.toLowerCase()} with official manufacturer warranty and express shipping across Nigeria.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);
  if (!currentCategory && slug !== "deals") {
    notFound();
  }

  const brandsFilter = Array.isArray(sParams.brand)
    ? sParams.brand
    : sParams.brand
    ? [sParams.brand]
    : undefined;

  const queryResult = await getProducts({
    category: slug === "deals" ? undefined : slug,
    onSaleOnly: slug === "deals" ? true : sParams.on_sale === "true",
    query: sParams.q,
    brand: brandsFilter,
    minPrice: sParams.min_price ? parseInt(sParams.min_price, 10) : undefined,
    maxPrice: sParams.max_price ? parseInt(sParams.max_price, 10) : undefined,
    inStockOnly: sParams.in_stock === "true",
    sort: sParams.sort,
    limit: 16,
  });

  const title = slug === "deals" ? "Special Deals & Discounts" : currentCategory?.name || slug;
  const description =
    slug === "deals"
      ? "Limited-time offers and verified price drops on premium electronics"
      : currentCategory?.description || `Explore our premium collection of ${title.toLowerCase()}`;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text-primary)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-[var(--text-primary)]">
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--text-primary)] font-semibold">{title}</span>
      </nav>

      {/* Category Banner */}
      <div className="mb-8 rounded-3xl liquid-glass border border-[var(--glass-border)] p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <CatalogFilterBar
        categories={categories}
        brands={brands}
        totalResults={queryResult.total}
      />

      {/* Products Grid */}
      <ProductGrid products={queryResult.products} />
    </div>
  );
}
