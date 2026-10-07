"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "@/components/ui/icons";
import { signUpAction } from "@/lib/auth/actions";
import { GoogleSignInButton } from "./google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignUpForm() {
  const [state, formAction, isPending] = React.useActionState(signUpAction, null);
  const [showPassword, setShowPassword] = React.useState(false);

  if (state?.success && state.error) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--success-soft)] border border-[var(--success)]/20 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-[var(--success)] mx-auto" />
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          Account Created!
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {state.error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state?.error && !state.success && (
        <div className="p-3.5 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger)]/20 text-xs text-[var(--danger)] font-medium">
          {state.error}
        </div>
      )}

      {/* Google Sign Up */}
      <GoogleSignInButton label="Sign up with Google" redirectTo="/" />

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[var(--border)]" />
        <span className="absolute bg-[var(--surface)] px-3 text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold rounded-full">
          Or register with email
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" required>
            Full Name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            required
            error={!!state?.fieldErrors?.fullName}
          />
          {state?.fieldErrors?.fullName && (
            <p className="text-xs text-[var(--danger)]">
              {state.fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
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
          <Label htmlFor="password" required>
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters (1 uppercase, 1 number)"
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

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" required>
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            error={!!state?.fieldErrors?.confirmPassword}
          />
          {state?.fieldErrors?.confirmPassword && (
            <p className="text-xs text-[var(--danger)]">
              {state.fieldErrors.confirmPassword[0]}
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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  );
}
