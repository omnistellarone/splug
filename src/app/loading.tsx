import * as React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-2xl liquid-glass border border-[var(--glass-border)] flex items-center justify-center shadow-lg">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        </div>
      </div>
      <p className="text-xs font-medium text-[var(--text-muted)] animate-pulse">
        Loading Slurge Electronics…
      </p>
    </div>
  );
}
