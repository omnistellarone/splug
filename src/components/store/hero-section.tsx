"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export function HeroSection() {
  const [deviceTilt, setDeviceTilt] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setDeviceTilt({
      x: (y / rect.height) * -8,
      y: (x / rect.width) * 8,
    });
  };

  const handleMouseLeave = () => {
    setDeviceTilt({ x: 0, y: 0 });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Welcome to Slurge — Tomorrow's Tech Today"
      className="relative overflow-hidden bg-[#08090D] text-white min-h-[600px] lg:min-h-[660px] flex items-center pt-8 pb-16 sm:py-16 lg:py-20"
    >
      {/* ── Background Technical Dot Mesh (Image 3) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.9) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Atmospheric Radial Glow behind Device ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[10%] w-[420px] h-[260px] rounded-full bg-purple-700/10 blur-[100px]"
      />

      {/* ── Iridescent Fluid Wave Banner (Image 1 / Image 3) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 w-full overflow-hidden select-none z-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/hero-wave.png"
          alt=""
          className="w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] object-cover object-bottom opacity-85 mix-blend-lighten"
          loading="eager"
        />
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Copy, Checklist, CTA */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left max-w-[680px]">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-white leading-[1.12]">
              See your{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">desired future</span>
                {/* Stylized Underline curve matching Image 3 */}
                <svg
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full text-indigo-400 stroke-current"
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

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300/85 leading-relaxed font-normal max-w-[560px]">
              Step into tomorrow&apos;s tech world with Slurge: your go-to hub for
              cutting-edge phones and electronics at prices that can&apos;t be beat.
            </p>

            {/* Feature Checklist (2x2 Grid) */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs sm:text-sm text-slate-200/90 font-medium">
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-white shrink-0 stroke-[2.5]" />
                <span>Browse over 300 innovative gadgets</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-white shrink-0 stroke-[2.5]" />
                <span>Enjoy Free Shipping Every Time</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-white shrink-0 stroke-[2.5]" />
                <span>Get It Delivered Within 24 Hours</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-white shrink-0 stroke-[2.5]" />
                <span>Rated 99.8% for Customer Happiness</span>
              </div>
            </div>

            {/* CTA Button Group */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center rounded-xl bg-white px-6 sm:px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-xl shadow-black/25 hover:bg-slate-100 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-white/20"
              >
                <span>Start Shopping at Slurge Today</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hands Holding Foldable Device (Image 2 / Image 3) */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
            <div
              className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[540px] xl:max-w-[580px] transition-transform duration-300 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${deviceTilt.x}deg) rotateY(${deviceTilt.y}deg)`,
              }}
            >
              {/* Soft ambient shadow below the hands */}
              <div
                aria-hidden="true"
                className="absolute inset-x-8 -bottom-6 h-12 bg-black/50 blur-2xl rounded-full pointer-events-none"
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero/hero-device.png"
                alt="Hands holding the flagship foldable smartphone with vibrant desert landscape and widgets"
                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] select-none pointer-events-none"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
