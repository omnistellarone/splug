import * as React from "react";
import type { Metadata } from "next";
import {
  getProducts,
  getCategories,
  getBrands,
} from "@/lib/catalog/queries";
import { CatalogFilterBar } from "@/components/catalog/catalog-filter-bar";
import { ProductGrid } from "@/components/catalog/product-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Electronics — Splug Electronics",
  description:
    "Browse authentic smartphones, laptops, audio gear, and gaming consoles with official warranty and nationwide delivery in Nigeria.",
};

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string | string[];
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    on_sale?: string;
    sort?: "popularity" | "newest" | "price_asc" | "price_desc" | "rating";
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const brandsFilter = Array.isArray(params.brand)
    ? params.brand
    : params.brand
    ? [params.brand]
    : undefined;

  const [categories, brands, queryResult] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts({
      query: params.q,
      category: params.category,
      brand: brandsFilter,
      minPrice: params.min_price ? parseInt(params.min_price, 10) : undefined,
      maxPrice: params.max_price ? parseInt(params.max_price, 10) : undefined,
      inStockOnly: params.in_stock === "true",
      onSaleOnly: params.on_sale === "true",
      sort: params.sort,
      page: params.page ? parseInt(params.page, 10) : 1,
      limit: 16,
    }),
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Explore Electronics
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Authentic gadgets sourced directly from verified manufacturers
        </p>
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
