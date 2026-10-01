"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserNav } from "@/components/store/user-nav";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/category/phones", label: "Phones" },
  { href: "/category/laptops", label: "Laptops" },
  { href: "/category/audio", label: "Audio" },
  { href: "/category/gaming", label: "Gaming" },
  { href: "/shop?deals=true", label: "Deals" },
];

export function SiteHeader() {
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── Desktop / Tablet Header ── */}
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          "bg-white/95 dark:bg-[#07111F]/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/90",
          scrolled ? "shadow-md bg-white dark:bg-[#07111F]" : "shadow-xs"
        )}
        style={{ height: "68px" }}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 md:px-6 lg:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 text-xl font-black tracking-tight text-slate-950 dark:text-white"
            aria-label="Splug Electronics — Home"
          >
            Splug<span className="text-[var(--primary)]">.</span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 max-w-[500px] md:flex mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones, laptops, audio, accessories…"
                aria-label="Search products"
                className={cn(
                  "w-full rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm font-semibold",
                  "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700",
                  "text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400",
                  "transition-all duration-150",
                  "focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                )}
              />
            </form>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 text-sm font-bold rounded-lg",
                  "text-slate-800 dark:text-slate-100 transition-colors duration-150",
                  "hover:text-[var(--primary)] hover:bg-slate-100 dark:hover:bg-slate-800/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Utilities */}
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                "text-slate-800 dark:text-slate-100 transition-colors duration-150",
                "hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[var(--primary)]"
              )}
            >
              <Heart size={18} strokeWidth={2} />
            </Link>

            {/* Dynamic Cart Drawer Trigger */}
            <CartTrigger />

            {/* Dynamic User Navigation Menu */}
            <UserNav />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className={cn(
                "flex lg:hidden h-9 w-9 items-center justify-center rounded-lg",
                "text-slate-800 dark:text-slate-100 transition-colors duration-150",
                "hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[var(--primary)]"
              )}
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={2} />
              ) : (
                <Menu size={20} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Nav Drawer ── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-label="Mobile navigation"
          className={cn(
            "fixed inset-0 z-40 flex flex-col pt-[68px]",
            "bg-white/98 dark:bg-[#07111F]/98 backdrop-blur-xl animate-in fade-in-0 duration-200"
          )}
        >
          {/* Mobile search */}
          <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                autoFocus
                className={cn(
                  "w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium",
                  "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700",
                  "text-slate-900 dark:text-white placeholder:text-slate-400",
                  "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                )}
              />
            </form>
          </div>

          {/* Links */}
          <nav aria-label="Mobile navigation links" className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-base font-bold rounded-xl",
                  "text-slate-900 dark:text-slate-100 transition-colors",
                  "hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[var(--primary)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
