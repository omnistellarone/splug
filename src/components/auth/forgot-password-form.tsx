"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = React.useActionState(
    forgotPasswordAction,
    null
  );

  if (state?.success) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-6 rounded-2xl bg-[var(--success-soft)] border border-[var(--success)]/20 space-y-3">
          <CheckCircle2 className="h-10 w-10 text-[var(--success)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Reset Link Sent
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            If an account exists with that email address, we’ve sent instructions
            to reset your password. Please check your inbox.
          </p>
        </div>

        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3.5 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger)]/20 text-xs text-[var(--danger)] font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email" required>
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={!!state?.fieldErrors?.email}
        />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-[var(--danger)]">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full mt-2 font-medium"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending reset link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to sign in
        </Link>
      </div>
    </form>
  );
}
