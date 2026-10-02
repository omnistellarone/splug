"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2 } from "@/components/ui/icons";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = React.useActionState(
    resetPasswordAction,
    null
  );
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3.5 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger)]/20 text-xs text-[var(--danger)] font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password" required>
          New Password
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
          Confirm New Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
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
            Updating password...
          </>
        ) : (
          "Save New Password"
        )}
      </Button>
    </form>
  );
}
