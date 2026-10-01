"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Camera,
  Cpu,
  Shield,
  BatteryCharging,
  RotateCcw,
  Check,
  Music,
  Radio,
  Sliders,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FinishId = "natural" | "blue" | "black" | "desert";
type ViewMode = "front" | "back" | "profile";
type ScreenTab = "chip" | "camera" | "specs";
type IslandMode = "music" | "flight" | "call";

interface Finish {
  id: FinishId;
  name: string;
  tagline: string;
  accentHex: string;
  outerBandGradient: string;
  backGlassGradient: string;
  cameraIslandGradient: string;
  lensRingBorder: string;
  swatchClass: string;
}

const FINISHES: Finish[] = [
  {
    id: "natural",
    name: "Natural Titanium",
    tagline: "Aerospace-grade Grade 5 titanium with satin micro-blasted luster",
    accentHex: "#A6A39C",
    outerBandGradient: "from-[#C4C0B8] via-[#949089] to-[#6A6761]",
    backGlassGradient: "from-[#8B8881] via-[#75726C] to-[#5C5954]",
    cameraIslandGradient: "from-[#96938C] to-[#6E6B65]",
    lensRingBorder: "border-[#C0BCB4]",
    swatchClass: "bg-[#9A968F]",
  },
  {
    id: "blue",
    name: "Deep Blue Titanium",
    tagline: "Celestial dark cobalt alloy with dynamic specular sheen",
    accentHex: "#3F5272",
    outerBandGradient: "from-[#4F688F] via-[#2F3E56] to-[#1E2737]",
    backGlassGradient: "from-[#2A374D] via-[#1E2837] to-[#141B26]",
    cameraIslandGradient: "from-[#354662] to-[#202C3D]",
    lensRingBorder: "border-[#5E79A4]",
    swatchClass: "bg-[#2E3C50]",
  },
  {
    id: "black",
    name: "Space Black Titanium",
    tagline: "Satin stealth obsidian with Diamond-Like Carbon protective coating",
    accentHex: "#2E3035",
    outerBandGradient: "from-[#43464C] via-[#26282B] to-[#141517]",
    backGlassGradient: "from-[#222327] via-[#18191B] to-[#0E0F10]",
    cameraIslandGradient: "from-[#2C2E33] to-[#17181A]",
    lensRingBorder: "border-[#4D5057]",
    swatchClass: "bg-[#1E1F22]",
  },
  {
    id: "desert",
    name: "Desert Titanium",
    tagline: "Warm golden bronze titanium forged with refined specular highlights",
    accentHex: "#B8A38B",
    outerBandGradient: "from-[#D5C2AA] via-[#A8947C] to-[#7D6B56]",
    backGlassGradient: "from-[#A28F77] via-[#8C7A64] to-[#6E5F4E]",
    cameraIslandGradient: "from-[#AF9C84] to-[#806E59]",
    lensRingBorder: "border-[#DCcaaE]",
    swatchClass: "bg-[#B09B82]",
  },
];

export function HeroSection() {
  const [activeFinish, setActiveFinish] = useState<Finish>(FINISHES[0]);
  const [viewMode, setViewMode] = useState<ViewMode>("front");
  const [screenTab, setScreenTab] = useState<ScreenTab>("chip");
  const [islandMode, setIslandMode] = useState<IslandMode>("music");
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [cameraZoom, setCameraZoom] = useState<"0.5x" | "1x" | "2x" | "5x">("5x");
  const [fpsCounter, setFpsCounter] = useState(120);

  // 3D Tilt calculation
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Live FPS oscillation to simulate real GPU benchmark
  useEffect(() => {
    const timer = setInterval(() => {
      setFpsCounter(118 + Math.floor(Math.random() * 3));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Normalized tilt degrees (capped between -12 and +12)
    const rotateY = ((x - centerX) / centerX) * 12;
    const rotateX = -((y - centerY) / centerY) * 12;
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleTriggerShutter = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 240);
  };

  const cycleIslandMode = () => {
    setIslandExpanded((prev) => !prev);
    if (islandMode === "music") setIslandMode("flight");
    else if (islandMode === "flight") setIslandMode("call");
    else setIslandMode("music");
  };

  return (
    <section
      aria-label="Flagship Showcase: iPhone 17 Pro"
      className="relative overflow-hidden bg-[#050811] text-white border-b border-slate-800/80 min-h-[780px] lg:min-h-[860px] flex items-center py-12 lg:py-16"
    >
      {/* ── Atmospheric Specular Glows ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary radial spotlight on the device */}
        <div
          className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full opacity-35 blur-[140px] transition-colors duration-700"
          style={{ backgroundColor: activeFinish.accentHex }}
        />
        {/* Subtle cobalt atmospheric depth */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px]" />
        {/* Indigo counter-glow */}
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px]" />
        {/* Ultra-fine grid matrix texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 md:px-6 lg:px-10 w-full z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN: High-Contrast Flagship Copy & Commerce Actions
             ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center space-y-6">
            
            {/* Keynote Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-xs font-bold text-blue-400 w-fit backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <span>Flagship Keynote · 2026 Edition</span>
            </div>

            {/* Master Headline */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400/90 mb-2">
                Apple iPhone 17 Pro
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.06]">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  Titanium.
                </span>
                <span className="block text-white">Pure Power.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-white">
                  Beyond Pro.
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-[520px]">
              Forged in aerospace-grade <strong className="text-white font-semibold">Grade 5 titanium</strong>.
              Driven by the groundbreaking 3nm <strong className="text-white font-semibold">A19 Pro silicon</strong> with hardware ray tracing, an all-new 48MP tetraprism telephoto lens, and the interactive Dynamic Island.
            </p>

            {/* Finish Switcher Component */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
                <span>Finish: <strong className="text-white">{activeFinish.name}</strong></span>
                <span className="text-slate-400 text-[11px]">{activeFinish.tagline}</span>
              </div>
              <div className="flex items-center gap-3" role="radiogroup" aria-label="Select titanium finish">
                {FINISHES.map((finish) => {
                  const isSelected = activeFinish.id === finish.id;
                  return (
                    <button
                      key={finish.id}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={finish.name}
                      onClick={() => setActiveFinish(finish)}
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 cursor-pointer",
                        finish.swatchClass,
                        isSelected
                          ? "ring-2 ring-white ring-offset-3 ring-offset-[#050811] scale-110 shadow-lg"
                          : "opacity-75 hover:opacity-100 hover:scale-105"
                      )}
                    >
                      {isSelected && (
                        <Check size={16} className="text-white drop-shadow-md stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing Strip & Nigerian Stock Verification */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ₦1,450,000
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  or ₦120,800/mo (0% interest)
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
                <Shield size={14} className="flex-shrink-0" />
                <span>Official Apple Nigeria 1-Year Warranty · Free insured same-day dispatch in Lagos & Abuja</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/shop?brand=Apple"
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm",
                  "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white",
                  "shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98]",
                  "transition-all duration-200"
                )}
              >
                <span>Buy iPhone 17 Pro</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setViewMode(viewMode === "front" ? "back" : "front");
                }}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm",
                  "bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600",
                  "backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <RotateCcw size={16} />
                <span>Rotate: {viewMode === "front" ? "Pro Camera (Back)" : "XDR OLED (Front)"}</span>
              </button>
            </div>

            {/* Quick Micro-Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/60">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">3nm</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">A19 Pro Silicon</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">48MP</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">5x Tetraprism Zoom</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">33h</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Pro Battery Endurance</p>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT COLUMN: Interactive 3D Phone Spec Animation Showcase
             ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center justify-center">
            
            {/* View Mode Switcher Header */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md mb-6 shadow-xl">
              <button
                type="button"
                onClick={() => setViewMode("front")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === "front"
                    ? "bg-white text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Sliders size={14} />
                <span>Front & Display</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("back")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === "back"
                    ? "bg-white text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Camera size={14} />
                <span>Pro Camera (Back)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("profile")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === "profile"
                    ? "bg-white text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Shield size={14} />
                <span>Titanium Band</span>
              </button>
            </div>

            {/* 3D Stage Container with Perspective */}
            <div
              ref={cardRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[500px] flex items-center justify-center py-4 cursor-grab active:cursor-grabbing select-none"
              style={{
                perspective: "1200px",
              }}
            >
              {/* Floating Holographic Spec Badges (Hotspots) */}
              
              {/* Spec Badge 1: A19 Pro */}
              <div
                onClick={() => {
                  setViewMode("front");
                  setScreenTab("chip");
                }}
                className={cn(
                  "absolute -left-4 sm:-left-8 top-16 z-30 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl",
                  "bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-blue-400 transition-all duration-200 hover:scale-105"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <Cpu size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-white">A19 Pro 3nm</p>
                  <p className="text-[9px] text-slate-400 font-medium">6-Core GPU Ray Tracing</p>
                </div>
              </div>

              {/* Spec Badge 2: 48MP Tetraprism */}
              <div
                onClick={() => {
                  setViewMode("back");
                }}
                className={cn(
                  "absolute -right-4 sm:-right-8 top-28 z-30 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl",
                  "bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-indigo-400 transition-all duration-200 hover:scale-105"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Camera size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-white">48MP 5x Optical</p>
                  <p className="text-[9px] text-slate-400 font-medium">120mm Tetraprism Lens</p>
                </div>
              </div>

              {/* Spec Badge 3: Grade 5 Titanium */}
              <div
                onClick={() => setViewMode("profile")}
                className={cn(
                  "absolute -left-6 sm:-left-10 bottom-24 z-30 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl",
                  "bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-amber-400 transition-all duration-200 hover:scale-105"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Shield size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-white">Grade 5 Titanium</p>
                  <p className="text-[9px] text-slate-400 font-medium">Aerospace Strength</p>
                </div>
              </div>

              {/* Spec Badge 4: All-Day Battery */}
              <div
                onClick={() => {
                  setViewMode("front");
                  setScreenTab("specs");
                }}
                className={cn(
                  "absolute -right-6 sm:-right-10 bottom-20 z-30 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl",
                  "bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-emerald-400 transition-all duration-200 hover:scale-105"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <BatteryCharging size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-white">33h Endurance</p>
                  <p className="text-[9px] text-slate-400 font-medium">MagSafe Fast Charge</p>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  THE 3D CHASSIS (TRANSFORMED PHONE)
                 ───────────────────────────────────────────────────────────── */}
              <div
                className="relative transition-transform duration-200 ease-out will-change-transform"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${
                    isHovered ? 1.03 : 1
                  }, ${isHovered ? 1.03 : 1}, 1)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* 3D Drop Shadow */}
                <div
                  className="absolute inset-0 rounded-[54px] blur-2xl opacity-50 -z-10 translate-y-6 transition-all duration-500"
                  style={{ backgroundColor: activeFinish.accentHex }}
                />

                {/* Outer Titanium CNC Machined Bezel Band */}
                <div
                  className={cn(
                    "relative w-[300px] sm:w-[328px] h-[610px] sm:h-[640px] rounded-[52px] p-[10px]",
                    "bg-gradient-to-b shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-colors duration-500 border border-white/20",
                    activeFinish.outerBandGradient
                  )}
                >
                  {/* Left Side Physical Buttons: Action Button & Volume Up/Down */}
                  <div className="absolute -left-[5px] top-24 w-[4px] h-7 rounded-l-sm bg-slate-400 shadow-sm" />
                  <div className="absolute -left-[5px] top-36 w-[4px] h-12 rounded-l-sm bg-slate-400 shadow-sm" />
                  <div className="absolute -left-[5px] top-52 w-[4px] h-12 rounded-l-sm bg-slate-400 shadow-sm" />

                  {/* Right Side Physical Buttons: Power & Camera Control */}
                  <div className="absolute -right-[5px] top-32 w-[4px] h-16 rounded-r-sm bg-slate-400 shadow-sm" />
                  <div className="absolute -right-[5px] top-56 w-[4px] h-12 rounded-r-sm bg-slate-500/80 border-t border-b border-white/30" />

                  {/* ─────────────────────────────────────────────────────────
                      VIEW 1: FRONT FACE (Super Retina XDR OLED Display)
                     ───────────────────────────────────────────────────────── */}
                  {viewMode === "front" && (
                    <div className="relative w-full h-full rounded-[44px] bg-black overflow-hidden flex flex-col justify-between border-[3.5px] border-[#0a0a0c]">
                      
                      {/* Interactive Dynamic Island */}
                      <div className="absolute top-2.5 inset-x-0 z-40 flex justify-center">
                        <div
                          onClick={cycleIslandMode}
                          className={cn(
                            "group cursor-pointer transition-all duration-300 ease-spring rounded-full bg-black border border-white/10 px-3 py-1 flex items-center justify-between shadow-2xl",
                            islandExpanded ? "w-[240px] h-10" : "w-[124px] h-[30px]"
                          )}
                          title="Click to cycle Dynamic Island alerts"
                        >
                          {islandMode === "music" && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                                  <Music size={9} className="text-black stroke-[3]" />
                                </div>
                                <span className="text-[10px] font-bold text-white tracking-tight truncate max-w-[58px]">
                                  Burna Boy
                                </span>
                              </div>
                              {/* Animated Audio Equalizer Bars */}
                              <div className="flex items-end gap-[2px] h-3.5 pr-1">
                                <span className="w-[2.5px] bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDuration: "500ms" }} />
                                <span className="w-[2.5px] bg-emerald-400 rounded-full animate-bounce h-3.5" style={{ animationDuration: "750ms" }} />
                                <span className="w-[2.5px] bg-emerald-400 rounded-full animate-bounce h-1.5" style={{ animationDuration: "400ms" }} />
                                <span className="w-[2.5px] bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDuration: "600ms" }} />
                              </div>
                            </>
                          )}

                          {islandMode === "flight" && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Plane size={11} className="text-amber-400 rotate-45" />
                                <span className="text-[10px] font-bold text-amber-300">LOS → ABV</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-white">45m</span>
                            </>
                          )}

                          {islandMode === "call" && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Radio size={11} className="text-red-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-red-400">Apple Store</span>
                              </div>
                              <span className="text-[9px] font-mono text-white/90">01:24</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Display Status Bar */}
                      <div className="pt-3 px-6 flex items-center justify-between text-[11px] font-semibold text-white/80 z-20">
                        <span className="tracking-tight">9:41</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-white/70">5G</span>
                          <div className="flex items-center gap-0.5">
                            <div className="w-5 h-2.5 rounded-sm border border-white/60 p-[1px] flex items-center">
                              <div className="h-full w-full bg-emerald-400 rounded-2xs" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Screen Content Tabs (Interactive OLED Widgets) */}
                      <div className="flex-1 flex flex-col justify-between px-4 pt-10 pb-4 z-10">
                        
                        {/* Tab Switcher on the Phone Screen */}
                        <div className="flex items-center justify-center gap-1 p-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 mb-2">
                          <button
                            type="button"
                            onClick={() => setScreenTab("chip")}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                              screenTab === "chip" ? "bg-white text-black" : "text-white/70 hover:text-white"
                            )}
                          >
                            A19 Silicon
                          </button>
                          <button
                            type="button"
                            onClick={() => setScreenTab("camera")}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                              screenTab === "camera" ? "bg-white text-black" : "text-white/70 hover:text-white"
                            )}
                          >
                            48MP Camera
                          </button>
                          <button
                            type="button"
                            onClick={() => setScreenTab("specs")}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                              screenTab === "specs" ? "bg-white text-black" : "text-white/70 hover:text-white"
                            )}
                          >
                            Pro Display
                          </button>
                        </div>

                        {/* TAB 1: A19 PRO SILICON BENCHMARK GAUGE */}
                        {screenTab === "chip" && (
                          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 py-2 animate-in fade-in zoom-in-95 duration-200">
                            {/* Chip Die Graphic */}
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-blue-500/40 shadow-xl shadow-blue-500/20">
                              <Cpu size={36} className="text-blue-400 animate-pulse" />
                              <span className="absolute bottom-1.5 text-[8px] font-mono tracking-widest text-blue-300 font-bold">
                                A19 PRO
                              </span>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-white">3nm Next-Gen Silicon</p>
                              <p className="text-[10px] text-blue-400 font-medium">Hardware Ray Tracing Enabled</p>
                            </div>

                            {/* Telemetry Meter */}
                            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 font-medium">GPU Framerate</span>
                                <span className="font-mono font-bold text-emerald-400">{fpsCounter} FPS</span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full w-[96%]" />
                              </div>
                              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                                <span>6-Core Pro GPU</span>
                                <span>35 TOPS NPU</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: 48MP CAMERA LIVE VIEWFINDER */}
                        {screenTab === "camera" && (
                          <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-b from-slate-900 to-black p-3 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
                            {/* Shutter flash overlay */}
                            {shutterFlash && (
                              <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none" />
                            )}

                            {/* Viewfinder Grid */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                              <div className="w-full h-full border border-white grid grid-cols-3 grid-rows-3" />
                            </div>

                            {/* Sensor specs */}
                            <div className="flex items-center justify-between text-[9px] font-mono text-amber-300 z-10">
                              <span>RAW MAX · 48MP</span>
                              <span>ƒ/1.78 · 1/2000s</span>
                            </div>

                            {/* Center focus reticle */}
                            <div className="mx-auto my-auto flex h-14 w-14 items-center justify-center border border-amber-400/80 rounded-md z-10">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            </div>

                            {/* Zoom Switcher Controls */}
                            <div className="z-10 flex items-center justify-center gap-1.5 mb-2">
                              {(["0.5x", "1x", "2x", "5x"] as const).map((zoom) => (
                                <button
                                  key={zoom}
                                  type="button"
                                  onClick={() => setCameraZoom(zoom)}
                                  className={cn(
                                    "h-6 w-6 rounded-full text-[9px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center",
                                    cameraZoom === zoom
                                      ? "bg-amber-400 text-black scale-110 shadow-md"
                                      : "bg-black/60 text-white/80 border border-white/20 hover:bg-white/20"
                                  )}
                                >
                                  {zoom}
                                </button>
                              ))}
                            </div>

                            {/* Interactive Shutter Trigger */}
                            <div className="z-10 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={handleTriggerShutter}
                                aria-label="Trigger sample 48MP photo capture"
                                className="h-9 w-9 rounded-full border-2 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition-all cursor-pointer shadow-lg"
                              >
                                <div className="h-7 w-7 rounded-full bg-white shadow-inner" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: PRO DISPLAY SPECS */}
                        {screenTab === "specs" && (
                          <div className="flex-1 flex flex-col justify-center space-y-2.5 py-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-center">
                              <Sparkles size={20} className="mx-auto text-amber-400 mb-1" />
                              <p className="text-xs font-bold text-white">Super Retina XDR OLED</p>
                              <p className="text-[10px] text-slate-300">ProMotion 1Hz to 120Hz Adaptive</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                                <p className="text-sm font-extrabold text-white">3,000</p>
                                <p className="text-[9px] text-slate-400">Nits Peak Outdoor</p>
                              </div>
                              <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                                <p className="text-sm font-extrabold text-emerald-400">33h</p>
                                <p className="text-[9px] text-slate-400">Video Playback</p>
                              </div>
                            </div>

                            <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center">
                              <p className="text-[10px] font-bold text-slate-200">Ceramic Shield 2.0</p>
                              <p className="text-[9px] text-slate-400">4x tougher drop performance</p>
                            </div>
                          </div>
                        )}

                        {/* Bottom Home Indicator Bar */}
                        <div className="w-28 h-1 rounded-full bg-white/40 mx-auto mt-2" />
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      VIEW 2: BACK FACE (Matte Glass Rear + Monolithic Camera)
                     ───────────────────────────────────────────────────────── */}
                  {viewMode === "back" && (
                    <div
                      className={cn(
                        "relative w-full h-full rounded-[44px] overflow-hidden flex flex-col justify-between p-4 transition-colors duration-500 border border-white/10 shadow-inner",
                        "bg-gradient-to-b",
                        activeFinish.backGlassGradient
                      )}
                    >
                      {/* Monolithic Sapphire Camera Plateau */}
                      <div
                        className={cn(
                          "relative w-36 h-36 rounded-[28px] p-2.5 shadow-2xl border border-white/20 transition-colors duration-500",
                          "bg-gradient-to-br",
                          activeFinish.cameraIslandGradient
                        )}
                      >
                        {/* Lens 1: 48MP Main Fusion Camera (Top Left) */}
                        <div
                          className={cn(
                            "absolute top-2.5 left-2.5 h-14 w-14 rounded-full bg-[#07090E] p-[3px] border-2 shadow-xl",
                            activeFinish.lensRingBorder
                          )}
                        >
                          <div className="h-full w-full rounded-full bg-gradient-to-tr from-[#020306] via-[#10141f] to-[#1a233a] border border-blue-500/30 flex items-center justify-center">
                            <div className="h-5 w-5 rounded-full bg-radial from-blue-400/40 to-transparent blur-[1px]" />
                          </div>
                        </div>

                        {/* Lens 2: 48MP Ultra-Wide Lens (Bottom Left) */}
                        <div
                          className={cn(
                            "absolute bottom-2.5 left-2.5 h-14 w-14 rounded-full bg-[#07090E] p-[3px] border-2 shadow-xl",
                            activeFinish.lensRingBorder
                          )}
                        >
                          <div className="h-full w-full rounded-full bg-gradient-to-tr from-[#020306] via-[#10141f] to-[#1a233a] border border-indigo-500/30 flex items-center justify-center">
                            <div className="h-5 w-5 rounded-full bg-radial from-indigo-400/40 to-transparent blur-[1px]" />
                          </div>
                        </div>

                        {/* Lens 3: 12MP 5x Tetraprism Periscope (Right Center) */}
                        <div
                          className={cn(
                            "absolute top-10 right-2.5 h-14 w-14 rounded-full bg-[#07090E] p-[3px] border-2 shadow-xl",
                            activeFinish.lensRingBorder
                          )}
                        >
                          <div className="h-full w-full rounded-full bg-gradient-to-tr from-[#020306] via-[#10141f] to-[#1a233a] border border-cyan-500/30 flex items-center justify-center">
                            <div className="h-5 w-5 rounded-full bg-radial from-cyan-400/40 to-transparent blur-[1px]" />
                          </div>
                        </div>

                        {/* True Tone Dual Flash */}
                        <div className="absolute top-3.5 right-6 h-4 w-4 rounded-full bg-amber-100/90 border border-amber-300 shadow-sm flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        </div>

                        {/* LiDAR Scanner Aperture */}
                        <div className="absolute bottom-4 right-6 h-4 w-4 rounded-full bg-black border border-slate-700 shadow-inner" />
                      </div>

                      {/* Center Metallic Embossed Logo */}
                      <div className="my-auto mx-auto flex flex-col items-center opacity-85">
                        <div className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-white via-slate-200 to-slate-400 drop-shadow-md">
                          Splug<span className="text-blue-400">.</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-1">
                          Titanium Pro
                        </span>
                      </div>

                      {/* Bottom Regulatory / Heritage Mark */}
                      <div className="text-center text-[8px] font-mono text-white/40 pb-2">
                        Designed in California · Verified for Nigeria
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      VIEW 3: TITANIUM PROFILE BAND (Hardware Engineering View)
                     ───────────────────────────────────────────────────────── */}
                  {viewMode === "profile" && (
                    <div className="relative w-full h-full rounded-[44px] bg-[#0c0e14] p-5 flex flex-col justify-between text-white border border-slate-800">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold mb-3">
                          <Shield size={12} />
                          <span>Aerospace Metallurgy</span>
                        </div>
                        <h4 className="text-base font-bold text-white">Grade 5 Titanium</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          Precision CNC milled exterior bonded via solid-state diffusion to a 100% recycled aluminum substructure.
                        </p>
                      </div>

                      {/* Engineering Callouts */}
                      <div className="space-y-2.5">
                        <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                          <div className="flex items-center justify-between text-xs font-bold text-white">
                            <span>Action Button</span>
                            <span className="text-[10px] text-amber-400 font-mono">Custom Tactile</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Instant switch between Silent, Camera, Flashlight, or Shortcuts</p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                          <div className="flex items-center justify-between text-xs font-bold text-white">
                            <span>Camera Control</span>
                            <span className="text-[10px] text-blue-400 font-mono">Capacitive Sensor</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Slide to zoom, light press to focus, deep press to capture</p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                          <div className="flex items-center justify-between text-xs font-bold text-white">
                            <span>Thermal Architecture</span>
                            <span className="text-[10px] text-emerald-400 font-mono">+20% Sustained</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Graphene heat spreader for intense gaming & 4K ProRes capture</p>
                        </div>
                      </div>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setViewMode("front")}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 mx-auto"
                        >
                          <span>Return to Display View</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Interactive Instruction Note under the 3D Phone */}
            <p className="text-xs text-slate-400 text-center mt-4 flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>Hover & drag to tilt in 3D · Click buttons & Dynamic Island to interact</span>
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
