"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const cleanups: (() => void)[] = [];

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // ── Hero glass panel reveal — DESIGN.md §63.3 ──
      if (glassRef.current) {
        gsap.from(glassRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power2.out",
          delay: 0.1,
        });
      }

      // ── Badge float loop ──
      if (badgeRef.current) {
        const tween = gsap.to(badgeRef.current, {
          y: -8,
          duration: 2.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        cleanups.push(() => tween.kill());
      }

      // ── Headline entrance ──
      if (headlineRef.current) {
        const spans = headlineRef.current.querySelectorAll("[data-word]");
        if (spans.length) {
          gsap.from(spans, {
            opacity: 0,
            y: 20,
            stagger: 0.04,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.3,
          });
        }
      }

      // ── CTA scale entrance ──
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          opacity: 0,
          scale: 0.92,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.7,
        });
      }

      // ── Blob breathing ──
      if (blobRef.current) {
        const tween = gsap.to(blobRef.current, {
          scale: 1.06,
          opacity: 0.55,
          duration: 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        cleanups.push(() => tween.kill());
      }

      // ── Parallax on scroll ──
      if (sectionRef.current) {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            if (glassRef.current) {
              gsap.set(glassRef.current, {
                y: self.progress * -40,
              });
            }
          },
        });
        cleanups.push(() => trigger.kill());
      }
    })();

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const headline = "Premium electronics without the noise.".split(" ");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[var(--text-primary)] min-h-[600px] lg:min-h-[680px] flex items-center"
    >
      {/* Gradient blobs — background depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div
          ref={blobRef}
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full
                     bg-[var(--primary)] opacity-40 blur-[120px] will-change-transform"
        />
        <div
          className="absolute -bottom-20 -right-20 h-[380px] w-[380px] rounded-full
                     bg-[var(--accent)] opacity-25 blur-[100px]"
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     h-[300px] w-[600px] rounded-full
                     bg-[var(--accent-secondary)] opacity-10 blur-[80px]"
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ── Left: content ── */}
          <div ref={glassRef} className="glass rounded-2xl p-8 md:p-10 lg:p-12 will-change-transform">
            {/* Floating badge — DESIGN.md §62.2 glass-badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-6
                         rounded-full glass text-xs font-semibold
                         text-[var(--primary)] will-change-transform"
              aria-label="New arrivals available"
            >
              <Zap size={12} strokeWidth={2.5} aria-hidden />
              New Arrivals · Just dropped
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              ref={headlineRef}
              className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold
                         leading-[1.1] tracking-tight text-white"
            >
              {headline.map((word, i) => (
                <span
                  key={i}
                  data-word
                  className={cn(
                    "inline-block mr-[0.25em]",
                    word === "Premium" || word === "electronics"
                      ? "text-white"
                      : "text-white/80"
                  )}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p className="mt-5 text-base text-white/60 max-w-[420px] leading-relaxed">
              Shop the latest phones, laptops, audio, and gaming gear.
              Genuine products. Fast delivery across Nigeria.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="mt-8 flex flex-wrap gap-3 will-change-transform">
              <Link
                href="/shop"
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
                  "bg-[var(--primary)] hover:bg-[var(--primary-hover)]",
                  "text-white font-semibold text-sm",
                  "transition-colors duration-150",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                )}
              >
                Shop Now
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </Link>
              <Link
                href="/shop?deals=true"
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
                  "bg-white/10 hover:bg-white/20 border border-white/20",
                  "text-white font-semibold text-sm",
                  "transition-colors duration-150",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                )}
              >
                Browse Deals
              </Link>
            </div>

            {/* Trust micro-stats */}
            <div className="mt-10 flex gap-8">
              {[
                { value: "50K+", label: "Happy customers" },
                { value: "10K+", label: "Products" },
                { value: "4.9★", label: "Avg. rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: visual placeholder ── */}
          <div
            className="hidden lg:flex items-center justify-center"
            aria-hidden
          >
            <div
              className="relative w-[380px] h-[380px] glass rounded-3xl
                         flex items-center justify-center"
            >
              <div className="text-8xl opacity-80">📱</div>
              {/* Floating spec chips */}
              <div
                className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2
                           text-xs font-semibold text-white/90"
              >
                M4 · 16 GB RAM
              </div>
              <div
                className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2
                           text-xs font-semibold text-white/90"
              >
                From ₦1,200,000
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
