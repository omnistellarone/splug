"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Gamepad,
  Wifi,
  SmartHome,
  Plug,
  Watch,
  Zap,
  Sparkles,
  ShieldCheck,
  Truck,
} from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserNav } from "@/components/store/user-nav";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { cn } from "@/lib/utils";

type MegaMenuKey = "categories" | "deals" | null;

interface CategoryMenuItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const CATEGORY_GROUPS: {
  title: string;
  items: CategoryMenuItem[];
}[] = [
  {
    title: "Mobile & Computing",
    items: [
      {
        title: "Smartphones & Foldables",
        description: "iPhone 16, Samsung Galaxy, Pixel 9",
        href: "/category/phones",
        icon: Smartphone,
      },
      {
        title: "Laptops & Ultrabooks",
        description: "MacBook Pro, Dell XPS, ThinkPad",
        href: "/category/laptops",
        icon: Laptop,
      },
      {
        title: "Tablets & iPads",
        description: "iPad Pro, Air, Galaxy Tab Series",
        href: "/shop?q=tablet",
        icon: Tablet,
      },
    ],
  },
  {
    title: "Audio & Entertainment",
    items: [
      {
        title: "Headphones & Earbuds",
        description: "Sony XM5, AirPods Max, Bose QC",
        href: "/category/audio",
        icon: Headphones,
      },
      {
        title: "Gaming Rigs & Consoles",
        description: "PlayStation 5, Xbox Series X, Switch",
        href: "/category/gaming",
        icon: Gamepad,
      },
      {
        title: "Smart Speakers & Sound",
        description: "Sonos, Marshall, Bluetooth Audio",
        href: "/shop?category=audio",
        icon: Wifi,
      },
    ],
  },
  {
    title: "Smart Home & Essentials",
    items: [
      {
        title: "Smart Home & Security",
        description: "Automated hubs, sensors, cameras",
        href: "/category/smart-home",
        icon: SmartHome,
      },
      {
        title: "Fast Chargers & GaN",
        description: "100W GaN adapters, power banks",
        href: "/category/accessories",
        icon: Plug,
      },
      {
        title: "Wearables & Smartwatches",
        description: "Apple Watch Series 10, Galaxy Watch",
        href: "/shop?q=watch",
        icon: Watch,
      },
    ],
  },
];

const DEALS_GROUPS: {
  title: string;
  items: CategoryMenuItem[];
}[] = [
  {
    title: "Exclusive Savings",
    items: [
      {
        title: "Flash Tech Deals",
        description: "Save up to 35% on curated hardware",
        href: "/shop?deals=true",
        icon: Zap,
      },
      {
        title: "Clearance Center",
        description: "Last-chance inventory at reduced prices",
        href: "/shop?deals=true",
        icon: Sparkles,
      },
      {
        title: "Free Express Shipping",
        description: "Nationwide orders above ₦100,000 ship free",
        href: "/shop",
        icon: Truck,
      },
    ],
  },
  {
    title: "Top Ecosystems",
    items: [
      {
        title: "Apple Ecosystem",
        description: "iPhone, MacBook, iPad, AirPods, Watch",
        href: "/shop?brand=Apple",
        icon: Laptop,
      },
      {
        title: "Sony Audio & Gaming",
        description: "Award-winning XM5 & PS5 gaming consoles",
        href: "/shop?brand=Sony",
        icon: Headphones,
      },
      {
        title: "Samsung Galaxy World",
        description: "Galaxy S24 Ultra & foldables collection",
        href: "/shop?brand=Samsung",
        icon: Smartphone,
      },
    ],
  },
  {
    title: "Customer Guarantees",
    items: [
      {
        title: "24-Hour Dispatch",
        description: "Fast fulfillment across Lagos & Abuja",
        href: "/about",
        icon: Truck,
      },
      {
        title: "100% Genuine Warranty",
        description: "Official manufacturer backed guarantee",
        href: "/about",
        icon: ShieldCheck,
      },
      {
        title: "Live Dedicated Support",
        description: "Direct assistance via WhatsApp & phone",
        href: "/contact",
        icon: Sparkles,
      },
    ],
  },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);

  const [activeMenu, setActiveMenu] = useState<MegaMenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<"categories" | "deals" | null>("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // Click outside to close desktop mega menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (menu: "categories" | "deals") => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const toggleMenu = (menu: "categories" | "deals") => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
      setActiveMenu(null);
    }
  };

  return (
    <div
      ref={headerRef}
      className="fixed top-2.5 sm:top-4 inset-x-0 mx-auto max-w-[1380px] w-[calc(100%-1.25rem)] sm:w-[calc(100%-2.5rem)] z-50 transition-all duration-300 select-none"
    >
      {/* ── Main Floating Bar (Pill Container) ── */}
      <header
        className={cn(
          "relative flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 h-16 sm:h-[68px] rounded-2xl sm:rounded-3xl transition-all duration-300",
          "bg-white/95 dark:bg-[#0c0e18]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-900/10 dark:shadow-black/50 text-slate-900 dark:text-white"
        )}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-extrabold tracking-tight transition-colors duration-200 flex items-center gap-1 text-slate-950 dark:text-white"
          aria-label="Slurge — Home"
        >
          <span>Slurge</span>
          <span className="text-[11px] font-semibold opacity-75 tracking-normal align-top -mt-1.5 text-indigo-600 dark:text-indigo-400">
            ®
          </span>
        </Link>

        {/* Desktop Mega Menu Triggers */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 mx-auto"
        >
          {/* Categories & Hardware Trigger */}
          <button
            type="button"
            onClick={() => toggleMenu("categories")}
            onMouseEnter={() => handleMouseEnter("categories")}
            aria-expanded={activeMenu === "categories"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150",
              activeMenu === "categories"
                ? "bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-white shadow-xs"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/[0.06]"
            )}
          >
            <span>Categories & Hardware</span>
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200",
                activeMenu === "categories" && "rotate-180"
              )}
            />
          </button>

          {/* Deals & Brands Trigger */}
          <button
            type="button"
            onClick={() => toggleMenu("deals")}
            onMouseEnter={() => handleMouseEnter("deals")}
            aria-expanded={activeMenu === "deals"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150",
              activeMenu === "deals"
                ? "bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-white shadow-xs"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/[0.06]"
            )}
          >
            <span>Deals & Brands</span>
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200",
                activeMenu === "deals" && "rotate-180"
              )}
            />
          </button>

          {/* Direct Link: All Products */}
          <Link
            href="/shop"
            onMouseEnter={() => setActiveMenu(null)}
            className="px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
          >
            All Products
          </Link>

          {/* Direct Link: Orders */}
          <Link
            href="/account/orders"
            onMouseEnter={() => setActiveMenu(null)}
            className="px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
          >
            Track Orders
          </Link>
        </nav>

        {/* Right Section: Compact Search + Utilities */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Desktop Compact Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:block w-44 xl:w-56"
          >
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gadgets…"
              aria-label="Search products"
              className={cn(
                "w-full rounded-full py-1.5 pl-9 pr-3 text-xs font-medium transition-all duration-200",
                "bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "focus:bg-white dark:focus:bg-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              )}
            />
          </form>

          {/* Theme Toggle */}
          <ThemeToggle
            className="text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
          />

          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 transition-colors"
          >
            <Heart size={18} strokeWidth={1.75} />
          </Link>

          {/* Cart Drawer Trigger */}
          <CartTrigger
            className="text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
          />

          {/* User Account Dropdown */}
          <UserNav
            className="text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
          />

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* ── Desktop Mega Menu Dropdown Panel ── */}
      {activeMenu && (
        <div
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
          className="hidden lg:block absolute top-[calc(100%+8px)] left-0 right-0 w-full rounded-2xl sm:rounded-3xl bg-white/98 dark:bg-[#0c0e18]/98 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-slate-950/20 dark:shadow-black/70 p-6 xl:p-8 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {activeMenu === "categories" && (
            <div className="grid grid-cols-12 gap-6 items-stretch">
              {/* Category Columns (9 cols total: 3 groups x 3 items) */}
              <div className="col-span-9 grid grid-cols-3 gap-6">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-2.5">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setActiveMenu(null)}
                            className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/90 dark:hover:bg-white/[0.06] transition-all duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-white/[0.06] text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-150">
                                <ItemIcon size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {item.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={15}
                              className="text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-150"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Featured Promo Card (matching hosting.com style) */}
              <div className="col-span-3">
                <Link
                  href="/shop?deals=true"
                  onClick={() => setActiveMenu(null)}
                  className="group relative flex flex-col justify-between h-full rounded-2xl p-5 bg-gradient-to-br from-slate-950 via-[#121626] to-[#1c1836] border border-white/10 text-white overflow-hidden hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  <div className="relative z-10">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-3">
                      Featured Hardware
                    </span>
                    <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-200 transition-colors">
                      Next-Gen Flagships
                    </h4>
                    <p className="text-xs text-slate-300/80 leading-relaxed mb-4">
                      Explore titanium iPhone 16 Pro, M3 silicon laptops & cutting-edge hardware.
                    </p>
                  </div>

                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-white/5 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/hero/hero-device.png"
                      alt="Next-Gen Flagship Hardware"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-indigo-300 group-hover:text-white transition-colors">
                    <span>Explore Flagships</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          )}

          {activeMenu === "deals" && (
            <div className="grid grid-cols-12 gap-6 items-stretch">
              {/* Deals Columns (9 cols total: 3 groups x 3 items) */}
              <div className="col-span-9 grid grid-cols-3 gap-6">
                {DEALS_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-2.5">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setActiveMenu(null)}
                            className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/90 dark:hover:bg-white/[0.06] transition-all duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-white/[0.06] text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-150">
                                <ItemIcon size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {item.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <ArrowRight
                              size={15}
                              className="text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-150"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Featured Promo Card */}
              <div className="col-span-3">
                <Link
                  href="/shop?deals=true"
                  onClick={() => setActiveMenu(null)}
                  className="group relative flex flex-col justify-between h-full rounded-2xl p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-[#0e1620] border border-white/10 text-white overflow-hidden hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                >
                  <div className="relative z-10">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-3">
                      Limited Promotion
                    </span>
                    <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-emerald-200 transition-colors">
                      Seasonal Tech Drop
                    </h4>
                    <p className="text-xs text-slate-300/80 leading-relaxed mb-4">
                      Claim store coupon vouchers during checkout for extra instant discounts.
                    </p>
                  </div>

                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-white/5 mb-3 flex items-center justify-center p-3">
                    <Truck size={48} className="text-emerald-400 opacity-80 group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-emerald-300 group-hover:text-white transition-colors">
                    <span>Claim Vouchers</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mobile Responsive Drawer (Accordion Style) ── */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-label="Mobile Navigation Menu"
          className="lg:hidden absolute top-[calc(100%+8px)] left-0 right-0 w-full rounded-2xl bg-white/98 dark:bg-[#0c0e18]/98 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-2xl p-4 sm:p-5 max-h-[calc(100vh-100px)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gadgets, brands, models…"
              aria-label="Search products"
              className={cn(
                "w-full rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium",
                "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700",
                "text-slate-900 dark:text-white placeholder:text-slate-400",
                "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              )}
            />
          </form>

          {/* Accordion 1: Categories & Hardware */}
          <div className="border-b border-slate-200/80 dark:border-slate-800/80 py-2">
            <button
              type="button"
              onClick={() =>
                setMobileAccordion((prev) => (prev === "categories" ? null : "categories"))
              }
              className="flex w-full items-center justify-between py-2 text-sm font-bold text-slate-900 dark:text-white"
            >
              <span>Categories & Hardware</span>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  mobileAccordion === "categories" && "rotate-180"
                )}
              />
            </button>

            {mobileAccordion === "categories" && (
              <div className="pt-2 pb-1 space-y-4">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                      {group.title}
                    </p>
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-white/[0.06] text-indigo-600 dark:text-indigo-400">
                            <ItemIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accordion 2: Deals & Brands */}
          <div className="border-b border-slate-200/80 dark:border-slate-800/80 py-2">
            <button
              type="button"
              onClick={() =>
                setMobileAccordion((prev) => (prev === "deals" ? null : "deals"))
              }
              className="flex w-full items-center justify-between py-2 text-sm font-bold text-slate-900 dark:text-white"
            >
              <span>Deals & Top Brands</span>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  mobileAccordion === "deals" && "rotate-180"
                )}
              />
            </button>

            {mobileAccordion === "deals" && (
              <div className="pt-2 pb-1 space-y-4">
                {DEALS_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                      {group.title}
                    </p>
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-white/[0.06] text-indigo-600 dark:text-indigo-400">
                            <ItemIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Navigation Links */}
          <div className="py-3 space-y-1">
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <span>All Products</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <span>Track Orders</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <span>Saved Wishlist</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <span>My Account</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
