import * as React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] transition-colors">
      {/* Minimal Top Header */}
      <header className="h-16 px-6 sm:px-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-sm">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Splug<span className="text-[var(--primary)]">.</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
