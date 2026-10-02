import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { VariantSelector } from "@/components/catalog/variant-selector";
import { ProductSpecsTable } from "@/components/catalog/product-specs-table";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductReviews } from "@/components/catalog/product-reviews";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found — Splug" };
  }

  return {
    title: product.meta_title || `${product.name} — Splug Electronics`,
    description: product.meta_description || product.description,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.primaryImage ? [product.primaryImage] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category?.slug,
    4
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-6 sm:py-10 space-y-12">
      {/* ── Breadcrumb Navigation ── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] flex-wrap"
      >
        <Link href="/" className="hover:text-[var(--text-primary)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-[var(--text-primary)]">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/category/${product.category.slug}`}
              className="hover:text-[var(--text-primary)]"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--text-primary)] font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* ── Product Hero Section: Gallery + Buy Box ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            primaryImage={product.primaryImage}
            productName={product.name}
          />
        </div>

        {/* Buy Box Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                {product.brand?.name || "Official Brand"}
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-xs text-[var(--text-muted)]">
                {product.category?.name || "Electronics"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Interactive Variant Picker & Buy Action */}
          <VariantSelector
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            productImage={product.primaryImage || undefined}
            variants={product.variants}
          />
        </div>
      </div>

      {/* ── Product Overview & Detailed Description ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 border-t border-[var(--border)]">
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
              Product Overview
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Key Highlights */}
          <div className="rounded-2xl p-6 liquid-glass border border-[var(--glass-border)] space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
              <span>Splug Genuine Guarantee</span>
            </h3>
            <ul className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                <span>100% Genuine, brand-new electronics in factory-sealed retail boxes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                <span>Eligible for official brand service center support nationwide</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                <span>Secure payment verification and insured shipping protection</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Specs Column */}
        <div className="lg:col-span-5">
          <ProductSpecsTable product={product} />
        </div>
      </div>

      {/* ── Verified Customer Reviews ── */}
      <ProductReviews productId={product.id} productName={product.name} />

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              You Might Also Like
            </h2>
            <Link
              href={`/category/${product.category?.slug || "phones"}`}
              className="text-xs sm:text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              View more in {product.category?.name || "category"} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
