"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: standard mount-detection pattern for SSR hydration safety
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-lg bg-[var(--surface-hover)] animate-pulse",
          className
        )}
        aria-hidden
      />
    );
  }

  const current = themes.find((t) => t.value === theme) ?? themes[2];
  const Icon = current.icon;

  const cycleTheme = () => {
    const idx = themes.findIndex((t) => t.value === theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next.value);
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label={`Switch theme. Current: ${current.label}`}
      title={`Theme: ${current.label}`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg",
        "text-[var(--text-secondary)] transition-colors duration-150",
        "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]",
        className
      )}
    >
      <Icon size={18} strokeWidth={1.75} />
    </button>
  );
}
