"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  RotateCcw,
} from "@/components/ui/icons";
import type { Category, Brand } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CatalogFilterBarProps {
  categories: Category[];
  brands: Brand[];
  totalResults: number;
}

const SORT_OPTIONS = [
  { value: "popularity", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "rating", label: "Highest Rated" },
];

const PRICE_PRESETS = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₦500k", min: 0, max: 50000000 },
  { label: "₦500k – ₦1.5M", min: 50000000, max: 150000000 },
  { label: "₦1.5M – ₦3M", min: 150000000, max: 300000000 },
  { label: "Over ₦3M", min: 300000000, max: undefined },
];

export function CatalogFilterBar({
  categories,
  brands,
  totalResults,
}: CatalogFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(
    searchParams.get("q") || ""
  );

  const activeCategory = searchParams.get("category") || "all";
  const activeSort = searchParams.get("sort") || "popularity";
  const selectedBrands = searchParams.getAll("brand");
  const inStockOnly = searchParams.get("in_stock") === "true";
  const onSaleOnly = searchParams.get("on_sale") === "true";
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");

  // Count active filters
  const activeFilterCount =
    (activeCategory !== "all" ? 1 : 0) +
    selectedBrands.length +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);

  // Helper to push updated search params
  const updateParams = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      params.delete(key);
      if (val === null || val === undefined) {
        // deleted
      } else if (Array.isArray(val)) {
        val.forEach((item) => params.append(key, item));
      } else if (val) {
        params.set(key, val);
      }
    });

    params.delete("page"); // reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  };

  const handleCategorySelect = (slug: string) => {
    updateParams({ category: slug === "all" ? null : slug });
  };

  const handleBrandToggle = (slug: string) => {
    const current = new Set(selectedBrands);
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    updateParams({ brand: Array.from(current) });
  };

  const handlePricePreset = (min?: number, max?: number) => {
    updateParams({
      min_price: min !== undefined ? min.toString() : null,
      max_price: max !== undefined ? max.toString() : null,
    });
  };

  const handleClearAll = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === activeSort)?.label || "Most Popular";

  return (
    <div className="space-y-4 mb-8">
      {/* ── Top Bar: Search, Mobile Filter Toggle, Sort Dropdown ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search phones, laptops, audio..."
            className="w-full h-10 rounded-xl pl-9 pr-20 bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams({ q: null });
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-[var(--surface-hover)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)] hover:text-white transition-colors"
          >
            Find
          </button>
        </form>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden gap-2 h-10 border-[var(--border)]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-[var(--primary)] text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Results Count (Desktop) */}
          <span className="hidden sm:inline-block text-xs text-[var(--text-muted)] font-medium">
            <strong className="text-[var(--text-primary)]">{totalResults}</strong> items
          </span>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-10 border-[var(--border)] text-xs font-semibold"
              >
                <span className="text-[var(--text-muted)] font-normal hidden md:inline">
                  Sort:
                </span>
                <span>{currentSortLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => updateParams({ sort: opt.value })}
                  className="flex items-center justify-between text-xs"
                >
                  <span className={activeSort === opt.value ? "font-bold text-[var(--primary)]" : ""}>
                    {opt.label}
                  </span>
                  {activeSort === opt.value && (
                    <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Category Pills Horizontal Bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => handleCategorySelect("all")}
          className={cn(
            "h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 select-none",
            activeCategory === "all"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          )}
        >
          All Electronics
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategorySelect(cat.slug)}
            className={cn(
              "h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 select-none",
              activeCategory === cat.slug
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Active Filters Chips Row ── */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Active:
          </span>

          {activeCategory !== "all" && (
            <Badge variant="secondary" className="gap-1.5 pr-1 py-1">
              <span>{categories.find((c) => c.slug === activeCategory)?.name || activeCategory}</span>
              <button
                type="button"
                onClick={() => handleCategorySelect("all")}
                className="hover:text-[var(--danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedBrands.map((bSlug) => (
            <Badge key={bSlug} variant="secondary" className="gap-1.5 pr-1 py-1">
              <span>{brands.find((b) => b.slug === bSlug)?.name || bSlug}</span>
              <button
                type="button"
                onClick={() => handleBrandToggle(bSlug)}
                className="hover:text-[var(--danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {inStockOnly && (
            <Badge variant="secondary" className="gap-1.5 pr-1 py-1">
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={() => updateParams({ in_stock: null })}
                className="hover:text-[var(--danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {onSaleOnly && (
            <Badge variant="secondary" className="gap-1.5 pr-1 py-1">
              <span>On Sale</span>
              <button
                type="button"
                onClick={() => updateParams({ on_sale: null })}
                className="hover:text-[var(--danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(minPrice || maxPrice) && (
            <Badge variant="secondary" className="gap-1.5 pr-1 py-1">
              <span>Price filtered</span>
              <button
                type="button"
                onClick={() => handlePricePreset(undefined, undefined)}
                className="hover:text-[var(--danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* ── Mobile Filter Drawer (Modal) ── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in-0"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-full max-w-xs bg-[var(--surface)] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Filter Products
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Brands */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
                  Brands
                </h4>
                <div className="space-y-2">
                  {brands.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.slug)}
                        onChange={() => handleBrandToggle(b.slug)}
                        className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Presets */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
                  Price Range
                </h4>
                <div className="space-y-1.5">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePricePreset(p.min, p.max)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                        (minPrice === p.min?.toString() && maxPrice === p.max?.toString()) ||
                          (!minPrice && !maxPrice && p.min === undefined)
                          ? "bg-[var(--primary-soft)] text-[var(--primary)] font-bold"
                          : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <label className="flex items-center justify-between text-xs text-[var(--text-secondary)] cursor-pointer">
                  <span>In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => updateParams({ in_stock: e.target.checked ? "true" : null })}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-[var(--text-secondary)] cursor-pointer">
                  <span>On Sale</span>
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => updateParams({ on_sale: e.target.checked ? "true" : null })}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                </label>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border)] flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handleClearAll}
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => setMobileDrawerOpen(false)}
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
