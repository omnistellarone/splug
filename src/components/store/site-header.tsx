"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Heart, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserNav } from "@/components/store/user-nav";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/category/phones", label: "Phones" },
  { href: "/category/laptops", label: "Laptops" },
  { href: "/category/audio", label: "Audio" },
  { href: "/category/gaming", label: "Gaming" },
  { href: "/shop?deals=true", label: "Deals" },
];

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // GSAP entrance + scroll glass intensification — DESIGN.md §63.3
  useEffect(() => {
    let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | null =
      null;

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger: ST } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ST);
      ScrollTrigger = ST;

      if (!headerRef.current || prefersReducedMotion) return;

      // Entrance animation — slide down from y: -20
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      // Scroll: intensify glass blur
      ST.create({
        start: 60,
        onEnter: () => {
          setScrolled(true);
        },
        onLeaveBack: () => {
          setScrolled(false);
        },
      });
    };

    init();

    return () => {
      ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      {/* ── Desktop / Tablet Header ── */}
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          "glass",
          scrolled ? "[--glass-blur:28px] border-[var(--glass-border)]" : ""
        )}
        style={{ height: "68px" }}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-4 md:px-6 lg:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 text-xl font-bold tracking-tight text-[var(--text-primary)]"
            aria-label="Splug Electronics — Home"
          >
            Splug<span className="text-[var(--primary)]">.</span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 max-w-[520px] md:flex mx-auto">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search phones, laptops, audio…"
                aria-label="Search products"
                className={cn(
                  "w-full rounded-lg py-2.5 pl-9 pr-4 text-sm",
                  "bg-[var(--surface-subtle)] border border-[var(--border)]",
                  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                  "transition-colors duration-150",
                  "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                )}
              />
            </div>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Primary navigation" className="hidden lg:flex gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg",
                  "text-[var(--text-secondary)] transition-colors duration-150",
                  "hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Utilities */}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                "text-[var(--text-secondary)] transition-colors duration-150",
                "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <Heart size={18} strokeWidth={1.75} />
            </Link>

            {/* Dynamic Cart Drawer Trigger */}
            <CartTrigger />

            {/* Dynamic User Navigation Menu */}
            <UserNav />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className={cn(
                "flex lg:hidden h-9 w-9 items-center justify-center rounded-lg",
                "text-[var(--text-secondary)] transition-colors duration-150",
                "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              {mobileOpen ? (
                <X size={18} strokeWidth={1.75} />
              ) : (
                <Menu size={18} strokeWidth={1.75} />
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
            "bg-[var(--background)]/95 backdrop-blur-sm"
          )}
        >
          {/* Mobile search */}
          <div className="px-4 py-4 border-b border-[var(--border)]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search products…"
                aria-label="Search products"
                autoFocus
                className={cn(
                  "w-full rounded-lg py-3 pl-9 pr-4 text-sm",
                  "bg-[var(--surface)] border border-[var(--border)]",
                  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                  "focus:outline-none focus:border-[var(--primary)]"
                )}
              />
            </div>
          </div>

          {/* Mobile nav links */}
          <nav aria-label="Mobile navigation" className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 text-base font-medium rounded-lg",
                  "text-[var(--text-primary)] transition-colors duration-150",
                  "hover:bg-[var(--surface-hover)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Spacer so content clears the fixed header */}
      <div style={{ height: "68px" }} aria-hidden />
    </>
  );
}
