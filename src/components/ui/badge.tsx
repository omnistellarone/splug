import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-normal transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand-50)] text-[var(--brand-700)] dark:bg-[var(--brand-950)] dark:text-[var(--brand-300)] border border-[var(--brand-200)]/60 dark:border-[var(--brand-800)]/60",
        secondary:
          "bg-[var(--neutral-100)] text-[var(--neutral-700)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-200)] border border-[var(--neutral-200)] dark:border-[var(--neutral-700)]",
        success:
          "bg-[var(--success-50)] text-[var(--success-700)] dark:bg-[var(--success-950)] dark:text-[var(--success-300)] border border-[var(--success-200)]/60 dark:border-[var(--success-800)]/60",
        warning:
          "bg-[var(--warning-50)] text-[var(--warning-700)] dark:bg-[var(--warning-950)] dark:text-[var(--warning-300)] border border-[var(--warning-200)]/60 dark:border-[var(--warning-800)]/60",
        destructive:
          "bg-[var(--danger-50)] text-[var(--danger-700)] dark:bg-[var(--danger-950)] dark:text-[var(--danger-300)] border border-[var(--danger-200)]/60 dark:border-[var(--danger-800)]/60",
        info:
          "bg-[var(--info-50)] text-[var(--info-700)] dark:bg-[var(--info-950)] dark:text-[var(--info-300)] border border-[var(--info-200)]/60 dark:border-[var(--info-800)]/60",
        solid:
          "bg-[var(--brand-600)] text-white shadow-xs",
        glass:
          "liquid-glass text-[var(--text-primary)] backdrop-blur-md shadow-xs",
        outline:
          "text-[var(--text-secondary)] border border-[var(--border-default)] bg-transparent",
      },
      emphasis: {
        subtle: "",
        solid: "text-white border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      emphasis: "subtle",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, emphasis, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, emphasis }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "success" && "bg-[var(--success-600)]",
            variant === "warning" && "bg-[var(--warning-600)]",
            variant === "destructive" && "bg-[var(--danger-600)]",
            variant === "info" && "bg-[var(--info-600)]",
            variant === "secondary" && "bg-[var(--neutral-500)]",
            (!variant || variant === "default") && "bg-[var(--brand-600)]"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
