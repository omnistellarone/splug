"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, Menu, X } from "@/components/ui/icons";
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
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isHomeHero = pathname === "/" && !scrolled;

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
      {/* ── Main Site Header ── */}
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isHomeHero
            ? "bg-white/90 dark:bg-transparent border-b border-slate-200/80 dark:border-transparent text-slate-900 dark:text-white backdrop-blur-xl dark:backdrop-blur-none"
            : "bg-white/95 dark:bg-[#080A0F]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs text-slate-900 dark:text-white",
          scrolled && "shadow-md"
        )}
        style={{ height: "68px" }}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 md:px-6 lg:px-10">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex-shrink-0 text-xl font-bold tracking-tight transition-colors duration-200 flex items-center gap-1 text-slate-950 dark:text-white"
            aria-label="Slurge — Home"
          >
            <span>Slurge</span>
            <span className="text-[11px] font-semibold opacity-75 tracking-normal align-top -mt-1.5">
              ®
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden flex-1 max-w-[460px] md:flex mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search
                size={16}
                className={cn(
                  "absolute left-3.5 top-1/2 -translate-y-1/2",
                  isHomeHero ? "text-slate-400 dark:text-white/60" : "text-slate-400 dark:text-slate-500"
                )}
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones, laptops, audio, accessories…"
                aria-label="Search products"
                className={cn(
                  "w-full rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm font-medium transition-all duration-200",
                  isHomeHero
                    ? "bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 focus:bg-white dark:focus:bg-white/15 focus:border-[var(--primary)] dark:focus:border-white/40 focus:ring-2 focus:ring-[var(--primary)]/20 dark:focus:ring-white/20"
                    : "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
                  "focus:outline-none"
                )}
              />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150",
                  isHomeHero
                    ? "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Header Utilities */}
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle
              className={cn(
                "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
              )}
            />

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150",
                "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              )}
            >
              <Heart size={18} strokeWidth={1.75} />
            </Link>

            {/* Cart Trigger */}
            <CartTrigger
              className={cn(
                "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              )}
            />

            {/* User Account Navigation */}
            <UserNav
              className={cn(
                "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              )}
            />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className={cn(
                "flex lg:hidden h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150",
                "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
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

      {/* ── Mobile Navigation Drawer ── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-40 flex flex-col pt-[68px] bg-white/98 dark:bg-[#080A0F]/98 backdrop-blur-xl animate-in fade-in-0 duration-200"
        >
          {/* Mobile search bar */}
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
                  "w-full rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium",
                  "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700",
                  "text-slate-900 dark:text-white placeholder:text-slate-400",
                  "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                )}
              />
            </form>
          </div>

          {/* Mobile links */}
          <nav aria-label="Mobile navigation links" className="flex flex-col p-4 gap-1.5 flex-1 overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-base font-semibold rounded-xl",
                  "text-slate-900 dark:text-slate-100 transition-colors",
                  "hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[var(--primary)]"
                )}
              >
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="my-2 border-t border-slate-200 dark:border-slate-800 pt-2" />

            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[var(--primary)]"
            >
              <Heart size={18} />
              <span>Saved Wishlist</span>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
