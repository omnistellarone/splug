"use client";

import * as React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let ctx: gsap.Context | null = null;
    const animate = async () => {
      if (typeof window === "undefined" || !cardRef.current) return;
      const { default: gsap } = await import("gsap");
      ctx = gsap.context(() => {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            ease: "power3.out",
          }
        );
      });
    };
    animate();
    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(79, 70, 245, 0.22) 0%, rgba(105, 92, 255, 0.08) 50%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-10 w-[450px] h-[450px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(49, 88, 255, 0.18) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={cardRef}
        className="relative w-full max-w-md liquid-glass rounded-3xl p-8 sm:p-10 shadow-2xl border border-[var(--glass-border)]"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 group transition-transform hover:scale-105"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-md shadow-[var(--primary)]/25">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Splug<span className="text-[var(--primary)]">.</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {subtitle}
          </p>
        </div>

        {/* Card Body */}
        {children}

        {/* Card Footer */}
        {footer && (
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-secondary)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
