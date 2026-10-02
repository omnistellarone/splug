import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md,8px)] text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--action-primary-rest)] text-[var(--text-on-brand)] hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-pressed)] shadow-sm active:scale-[0.98]",
        secondary:
          "bg-[var(--action-secondary-rest)] text-[var(--text-primary)] hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-pressed)] border border-[var(--border-default)] shadow-xs active:scale-[0.98]",
        outline:
          "border border-[var(--border-default)] bg-transparent hover:bg-[var(--action-tertiary-hover)] text-[var(--text-primary)] active:scale-[0.98]",
        ghost:
          "bg-transparent hover:bg-[var(--action-tertiary-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        link:
          "text-[var(--text-brand)] underline-offset-4 hover:underline p-0 h-auto",
        destructive:
          "bg-[var(--action-danger-rest)] text-[var(--text-on-danger)] hover:bg-[var(--action-danger-hover)] active:bg-[var(--action-danger-pressed)] active:scale-[0.98]",
        glass:
          "liquid-glass text-[var(--text-primary)] hover:border-[var(--border-focus)]/60 hover:shadow-md active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[var(--radius-sm,4px)] px-3 text-xs",
        lg: "h-12 rounded-[var(--radius-lg,12px)] px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
