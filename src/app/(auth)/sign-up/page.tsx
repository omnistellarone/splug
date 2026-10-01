import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account — Splug Electronics",
  description: "Join Splug Electronics for genuine gadgets, fast Nigerian delivery, and warranty support.",
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join Splug for authentic electronics and instant warranty"
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
