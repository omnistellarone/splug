"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log sanitized error telemetry
    console.error("Application error boundary triggered:", error.message);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 liquid-glass p-8 sm:p-10 rounded-3xl border border-[var(--glass-border)] shadow-2xl">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-[var(--danger)] uppercase">
            Service Interruption
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            We encountered an unexpected issue while loading this page. Our technical team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto font-semibold gap-2 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto font-semibold gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
