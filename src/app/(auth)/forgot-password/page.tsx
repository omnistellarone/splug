import * as React from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — Splug Electronics",
  description: "Reset your Splug Electronics account password securely.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your email to receive recovery instructions"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
