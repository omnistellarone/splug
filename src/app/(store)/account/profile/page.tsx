import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, User, Mail, Phone, ShieldCheck } from "@/components/ui/icons";
import { getCurrentUserSession } from "@/lib/auth/session";
import { updateProfileAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Profile Settings — Slurge Electronics",
  description: "View and update your personal details and contact information.",
};

export default async function ProfilePage() {
  const session = await getCurrentUserSession();

  if (!session.user) {
    redirect("/sign-in?redirectTo=/account/profile");
  }

  const { user, profile, isAdmin } = session;
  const displayName = profile?.display_name || "";
  const phone = profile?.phone || "";

  async function handleUpdateProfile(formData: FormData) {
    "use server";
    await updateProfileAction(formData);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Account</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Manage your personal identity, contact details, and account security
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-4 pb-6 border-b border-[var(--border)]">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            {(displayName || user.email || "C").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {displayName || "Unnamed Customer"}
              </h2>
              {isAdmin && (
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" }) : "Recently"}
            </p>
          </div>
        </div>

        <form action={handleUpdateProfile} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-semibold text-[var(--text-secondary)]">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                id="displayName"
                name="displayName"
                defaultValue={displayName}
                placeholder="e.g. Babatunde Adeleke"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-[var(--text-secondary)]">
              Email Address (Login ID)
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                id="email"
                type="email"
                disabled
                defaultValue={user.email || ""}
                className="pl-10 opacity-75 bg-[var(--surface-muted)] cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
              <span>Verified email address</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-[var(--text-secondary)]">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={phone}
                placeholder="e.g. 08012345678"
                className="pl-10"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" className="font-semibold shadow-sm">
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security Quick Link */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Password & Credentials</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Change your password or request a security reset link
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/reset-password">Change Password</Link>
        </Button>
      </div>
    </div>
  );
}
