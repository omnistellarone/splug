import Link from "next/link";
import { ShieldCheck, Truck, RefreshCcw, BadgeCheck } from "@/components/ui/icons";

const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All Products" },
    { href: "/category/phones", label: "Phones" },
    { href: "/category/laptops", label: "Laptops" },
    { href: "/category/audio", label: "Audio" },
    { href: "/category/gaming", label: "Gaming" },
  ],
  Support: [
    { href: "/support", label: "Help Center" },
    { href: "/support/returns", label: "Returns" },
    { href: "/support/shipping", label: "Shipping Info" },
    { href: "/support/track", label: "Track Order" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
  Account: [
    { href: "/sign-in", label: "Sign In" },
    { href: "/sign-up", label: "Create Account" },
    { href: "/account/orders", label: "My Orders" },
    { href: "/account/wishlist", label: "Wishlist" },
  ],
};

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On all orders nationwide",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "Protected by Paystack",
  },
  {
    icon: BadgeCheck,
    title: "Genuine Products",
    desc: "100% authentic items",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    desc: "7-day return policy",
  },
];

export function SiteFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="bg-[#0B1F33] dark:bg-[#050D18] text-[var(--text-muted)] mt-auto border-t border-[var(--border)]/40"
    >
      {/* Trust strip — DESIGN.md §50 */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      className="text-[var(--primary)]"
                      aria-hidden
                    />
                  </div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-white/50">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <p className="text-2xl font-bold text-white flex items-center gap-1">
              <span>Slurge</span>
              <span className="text-xs font-semibold opacity-70 tracking-normal align-top -mt-1.5">
                ®
              </span>
            </p>
            <p className="mt-2 text-sm text-white/50 max-w-[220px]">
              Premium electronics at fair prices, delivered across Nigeria.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Slurge Electronics. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
