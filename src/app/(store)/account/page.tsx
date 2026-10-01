import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  MapPin,
  Heart,
  Shield,
  LogOut,
  ChevronRight,
  ExternalLink,
  User,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Account — Splug Electronics",
  description: "Manage your profile, shipping addresses, and past electronics orders.",
};

export default async function AccountPage() {
  const session = await getCurrentUserSession();

  if (!session.user) {
    redirect("/sign-in?redirectTo=/account");
  }

  const { user, profile, isAdmin } = session;
  const displayName = profile?.display_name || user.email?.split("@")[0] || "Customer";
  const initial = displayName.charAt(0).toUpperCase();

  const accountCards = [
    {
      title: "My Orders",
      description: "Track shipments, view order history & invoices",
      href: "/account/orders",
      icon: Package,
      badge: "0 active",
    },
    {
      title: "Saved Addresses",
      description: "Manage your delivery addresses for express checkout",
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      title: "Profile Settings",
      description: "Edit your name, phone number, and personal contact info",
      href: "/account/profile",
      icon: User,
    },
    {
      title: "Wishlist",
      description: "Your saved electronics items & stock notifications",
      href: "/account/wishlist",
      icon: Heart,
    },
    {
      title: "Account Security",
      description: "Update your password and security credentials",
      href: "/reset-password",
      icon: Shield,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Profile Overview Banner (Liquid Glass) */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 liquid-glass border border-[var(--glass-border)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              initial
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {displayName}
              </h1>
              {isAdmin ? (
                <Badge variant="destructive" className="font-semibold uppercase tracking-wider">
                  Admin
                </Badge>
              ) : (
                <Badge variant="default" className="font-semibold uppercase tracking-wider">
                  Customer
                </Badge>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button asChild variant="outline" className="border-[var(--primary)]/30 text-[var(--primary)] gap-2">
              <Link href="/admin">
                <span>Admin Portal</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <form action={signOutAction}>
            <Button type="submit" variant="secondary" className="gap-2 text-[var(--danger)] hover:bg-[var(--danger-soft)]">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Account Navigation Grid */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mb-5">
          Account Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {accountCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--primary)]/40 hover:shadow-md transition-all duration-200 flex items-start gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {card.title}
                    </h3>
                    {card.badge && (
                      <span className="text-xs bg-[var(--surface-subtle)] text-[var(--text-muted)] px-2 py-0.5 rounded-full font-medium">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2">
                    {card.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0 mt-3" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
