import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Control Center — Splug Electronics",
  description: "Secure management console for Splug store operations.",
};

const NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Strict server-side authorization check — AGENTS.md §9
  if (!session.user || !session.isAdmin) {
    redirect("/sign-in?redirectTo=/admin");
  }

  const { user, profile } = session;
  const adminName =
    profile?.display_name || user.email?.split("@")[0] || "Administrator";

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-black text-lg tracking-tight text-[var(--text-primary)]"
            >
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white font-black text-sm flex items-center justify-center shadow-md shadow-[var(--primary)]/20">
                S
              </span>
              <span>Splug Ops</span>
            </Link>
            <Badge
              variant="destructive"
              className="text-[10px] font-bold uppercase tracking-wider py-0.5"
            >
              Admin
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 font-semibold"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </Link>
            </Button>

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {adminName}
              </span>
            </div>

            <form action={signOutAction}>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] h-8 font-semibold"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-[var(--border)]/50 py-1.5">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
