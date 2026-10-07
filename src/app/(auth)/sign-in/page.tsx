import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In — Slurge Electronics",
  description: "Sign in to your Slurge account to manage your orders, wishlist, and profile.",
};

interface SignInPageProps {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
    reset?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo || "/";

  let errorMessage: string | undefined;
  if (params.error === "auth_exchange_failed") {
    errorMessage = "Could not authenticate with Google. Please try again.";
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Slurge account"
      footer={
        <p>
          Don’t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Create one now
          </Link>
        </p>
      }
    >
      {params.reset === "success" && (
        <div className="mb-4 p-3.5 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/20 text-xs text-[var(--success)] font-medium text-center">
          Password updated successfully! You may now sign in.
        </div>
      )}
      <SignInForm redirectTo={redirectTo} errorMessage={errorMessage} />
    </AuthCard>
  );
}
