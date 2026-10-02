import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Truck, Headphones } from "lucide-react";
import { HeroSection } from "@/components/store/hero-section";
import { getFeaturedProducts, getCategories } from "@/lib/catalog/queries";
import { ProductCard } from "@/components/catalog/product-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Splug Electronics — Premium Electronics Store Nigeria",
  description:
    "Shop authentic smartphones, laptops, audio gear, and gaming equipment with warranty support and express nationwide delivery in Nigeria.",
};

const CATEGORY_ICONS: Record<string, string> = {
  phones: "📱",
  laptops: "💻",
  audio: "🎧",
  gaming: "🎮",
  "smart-home": "🏠",
  accessories: "🔌",
  tablets: "📟",
  cameras: "📷",
  wearables: "⌚",
  networking: "📡",
};

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection />

      {/* ── Category Navigation Grid ── */}
      <section
        aria-labelledby="categories-heading"
        className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10 py-12 sm:py-16"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              id="categories-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]"
            >
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Curated hardware from the world’s leading electronics brands
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((cat) => {
            const emoji = CATEGORY_ICONS[cat.slug] || "⚡";
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all duration-200 hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/5 hover:-translate-y-1 group"
              >
                <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
                  {emoji}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors text-center">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Products Grid ── */}
      <section
        id="catalog"
        aria-labelledby="featured-heading"
        className="bg-[var(--surface-subtle)] py-14 sm:py-20 border-y border-[var(--border)] scroll-mt-20"
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Handpicked for You</span>
              </div>
              <h2
                id="featured-heading"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]"
              >
                Featured Gadgets & Tech
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1 group"
            >
              <span>Explore full catalog</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Proposition / Trust Strip ── */}
      <section className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl p-6 liquid-glass border border-[var(--glass-border)] space-y-2">
            <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              100% Genuine Guaranteed
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Every unit is factory sealed with authentic manufacturer serial numbers and verified IMEI.
            </p>
          </div>

          <div className="rounded-2xl p-6 liquid-glass border border-[var(--glass-border)] space-y-2">
            <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Express Nationwide Dispatch
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Same-day delivery within Lagos and 24–48 hour insured transit to Abuja, Port Harcourt, and Ibadan.
            </p>
          </div>

          <div className="rounded-2xl p-6 liquid-glass border border-[var(--glass-border)] space-y-2">
            <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Official Local Warranty
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Hassle-free coverage at verified brand service centers across Nigeria for up to 12 months.
            </p>
          </div>

          <div className="rounded-2xl p-6 liquid-glass border border-[var(--glass-border)] space-y-2">
            <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <Headphones className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              Direct Technical Support
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Got setup questions? Our certified electronics team is reachable 7 days a week.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
