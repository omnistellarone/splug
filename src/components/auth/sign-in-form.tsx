"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signInAction } from "@/lib/auth/actions";
import { GoogleSignInButton } from "./google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SignInFormProps {
  redirectTo?: string;
  errorMessage?: string;
}

export function SignInForm({ redirectTo = "/account", errorMessage }: SignInFormProps) {
  const [state, formAction, isPending] = React.useActionState(signInAction, null);
  const [showPassword, setShowPassword] = React.useState(false);

  const displayError = state?.error || errorMessage;

  return (
    <div className="space-y-6">
      {displayError && (
        <div className="p-3.5 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger)]/20 text-xs text-[var(--danger)] font-medium">
          {displayError}
        </div>
      )}

      {/* Google OAuth Option */}
      <GoogleSignInButton redirectTo={redirectTo} />

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[var(--border)]" />
        <span className="absolute bg-[var(--surface)] px-3 text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold rounded-full">
          Or with email
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--primary)] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="pr-10"
              error={!!state?.fieldErrors?.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {state?.fieldErrors?.password && (
            <p className="text-xs text-[var(--danger)]">
              {state.fieldErrors.password[0]}
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
