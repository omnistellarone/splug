import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20",
        secondary:
          "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]",
        success:
          "bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20",
        warning:
          "bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20",
        destructive:
          "bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/20",
        glass:
          "liquid-glass text-[var(--text-primary)] backdrop-blur-md",
        outline:
          "text-[var(--text-secondary)] border border-[var(--border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
