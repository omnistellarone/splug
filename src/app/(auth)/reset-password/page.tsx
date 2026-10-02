import * as React from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set New Password — Slurge Electronics",
  description: "Set a new password for your Slurge Electronics account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Create New Password"
      subtitle="Ensure your new password is at least 8 characters long"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
