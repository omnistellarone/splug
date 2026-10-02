"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ArrowRight, Pause, Play, RotateCcw, ChevronDown } from "@/components/ui/icons";
import { Hero3DStage, type ProductView } from "./hero-3d-stage";

export function HeroSection() {
  const [activeView, setActiveView] = React.useState<ProductView>("both");
  const [isPaused, setIsPaused] = React.useState(false);
  const [replayKey, setReplayKey] = React.useState(0);

  // Check prefers-reduced-motion
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsPaused(true);
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsPaused(true);
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleToggleMotion = () => {
    setIsPaused((prev) => !prev);
  };

  const handleReplayIntro = () => {
    setIsPaused(false);
    setReplayKey((k) => k + 1);
  };

  return (
    <section
      data-hero-motion={isPaused ? "paused" : "running"}
      aria-labelledby="hero-main-title"
      className="relative overflow-hidden bg-[#101014] text-white min-h-[680px] lg:min-h-[760px] flex flex-col justify-between pt-6 pb-8 lg:py-12 select-none"
    >
      {/* ── Atmospheric Radial Glows (matching splug-hero design) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 78% 58%, rgba(39, 34, 54, 0.45), transparent 56%), radial-gradient(ellipse at 8% 100%, rgba(36, 53, 74, 0.28), transparent 50%)",
        }}
      />

      {/* ── Technical Dot Mesh Overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12] z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Organic Liquid Glass Ribbon with Swell & Drift Animations ── */}
      <div
        aria-hidden="true"
        className="hero-glass-ribbon pointer-events-none absolute inset-x-[-10%] bottom-[-15%] sm:bottom-[-10%] lg:bottom-[-16%] h-[45%] sm:h-[50%] lg:h-[56%] z-[1] opacity-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/liquid-glass.png"
          alt=""
          width={1440}
          height={288}
          className="hero-glass-ribbon-img w-full h-full object-fill block mix-blend-screen"
          loading="eager"
        />
      </div>

      {/* ── Top Secondary Controls / Quick Mode Bar ── */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 w-full flex items-center justify-between mb-4 sm:mb-6">
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300/80 font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Interactive 3D Showcase
          </span>
          <span className="text-slate-400">•</span>
          <button
            type="button"
            onClick={() => setActiveView("duo")}
            className={`transition-colors hover:text-white ${activeView === "duo" ? "text-white font-semibold" : "text-slate-400"}`}
          >
            iPhone Duo
          </button>
          <span className="text-slate-500">/</span>
          <button
            type="button"
            onClick={() => setActiveView("pro")}
            className={`transition-colors hover:text-white ${activeView === "pro" ? "text-white font-semibold" : "text-slate-400"}`}
          >
            iPhone 18 Pro
          </button>
        </div>

        {/* Motion control toggle */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMotion}
            aria-label={isPaused ? "Resume animation" : "Pause animation"}
            aria-pressed={isPaused}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs text-slate-300 transition-colors"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span className="text-[11px] hidden sm:inline">Resume motion</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span className="text-[11px] hidden sm:inline">Pause motion</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReplayIntro}
            aria-label="Replay intro animation"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs text-slate-300 transition-colors"
            title="Replay intro"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="text-[11px] hidden md:inline">Replay</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center min-h-[460px] sm:min-h-[500px]">
          
          {/* Left Column: Headlines, Copy, Checklist, CTA */}
          <div
            key={replayKey}
            className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center text-left max-w-[660px] animate-in fade-in slide-in-from-bottom-3 duration-700"
          >
            {/* Main Headline (User specified exact text) */}
            <h1
              id="hero-main-title"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.15rem] font-bold tracking-tight text-white leading-[1.12]"
            >
              See your{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 text-white">desired future</span>
                {/* Stylized Underline curve accent */}
                <svg
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full text-indigo-400 stroke-current drop-shadow-[0_0_12px_rgba(129,140,248,0.5)]"
                  viewBox="0 0 280 14"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 10C75 3 205 3 278 9"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              with our cinematic software
            </h1>

            {/* Subtitle (User specified exact text) */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300/90 leading-relaxed font-normal max-w-[560px]">
              Step into tomorrow&apos;s tech world with Slurge: your go-to hub for
              cutting-edge phones and electronics at prices that can&apos;t be beat.
            </p>

            {/* Feature Checklist 2x2 (User specified exact 4 points) */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs sm:text-sm text-slate-200/95 font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Check className="h-3.5 w-3.5 text-indigo-300 stroke-[2.5]" />
                </div>
                <span>Browse over 300 innovative gadgets</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Check className="h-3.5 w-3.5 text-indigo-300 stroke-[2.5]" />
                </div>
                <span>Enjoy Free Shipping Every Time</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Check className="h-3.5 w-3.5 text-indigo-300 stroke-[2.5]" />
                </div>
                <span>Get It Delivered Within 24 Hours</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Check className="h-3.5 w-3.5 text-indigo-300 stroke-[2.5]" />
                </div>
                <span>Rated 99.8% for Customer Happiness</span>
              </div>
            </div>

            {/* CTA Button (User specified: Start Shopping at Slurge Today) */}
            <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center rounded-xl bg-[#f2eef8] px-7 py-3.5 text-sm font-semibold text-[#18141f] shadow-[0_4px_22px_rgba(201,180,255,0.18)] hover:bg-white hover:shadow-[0_6px_32px_rgba(201,180,255,0.32)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Start Shopping at Slurge Today</span>
                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Three-Dimensional Interactive Product Stage */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full h-[360px] sm:h-[440px] md:h-[480px] lg:h-[540px] flex items-center justify-center">
            <Hero3DStage
              activeView={activeView}
              isPaused={isPaused}
              onViewChange={setActiveView}
              className="w-full h-full"
            />
          </div>

        </div>
      </div>

      {/* ── Hero Footer: View Picker & Scroll Exploration Link ── */}
      <div className="relative z-20 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 w-full flex items-center justify-between pt-4 mt-2 border-t border-white/5 text-xs">
        <span className="hidden sm:inline text-slate-400 font-normal">
          Two ways to see what&apos;s next.
        </span>

        {/* View Switcher Pill (Together, Duo, 18 Pro) */}
        <div
          role="group"
          aria-label="Smartphone 3D product view selection"
          className="mx-auto sm:mx-0 flex items-center p-1 rounded-full bg-[#16131e]/90 border border-white/10 shadow-lg shadow-black/40 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setActiveView("both")}
            aria-pressed={activeView === "both"}
            className={`min-h-[36px] min-w-[72px] px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeView === "both"
                ? "bg-[#eee7f8] text-[#21192b] shadow-sm font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            Together
          </button>
          <button
            type="button"
            onClick={() => setActiveView("duo")}
            aria-pressed={activeView === "duo"}
            className={`min-h-[36px] min-w-[64px] px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeView === "duo"
                ? "bg-[#eee7f8] text-[#21192b] shadow-sm font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            Duo
          </button>
          <button
            type="button"
            onClick={() => setActiveView("pro")}
            aria-pressed={activeView === "pro"}
            className={`min-h-[36px] min-w-[64px] px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeView === "pro"
                ? "bg-[#eee7f8] text-[#21192b] shadow-sm font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            18 Pro
          </button>
        </div>

        {/* Explore link scrolling into the catalog section */}
        <a
          href="#featured-products"
          className="hidden sm:inline-flex items-center gap-1.5 text-slate-300/80 hover:text-white transition-colors group"
        >
          <span>Explore Catalog</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
