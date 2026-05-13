import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-wide transition-all duration-300 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "text-white bg-gradient-neon shadow-[0_8px_28px_-8px_color-mix(in_oklab,var(--neon-purple)_60%,transparent)] hover:shadow-[0_12px_40px_-6px_color-mix(in_oklab,var(--neon-cyan)_55%,transparent)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "text-foreground bg-transparent border border-white/15 hover:border-transparent hover:text-white hover:shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--neon-cyan)_60%,transparent)] hover:bg-white/5",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-white/5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
      pulse: {
        true: "animate-pulse-glow",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", pulse: false },
  },
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  asChild?: boolean;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, pulse, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(neonButtonVariants({ variant, size, pulse }), className)}
      {...props}
    />
  ),
);
NeonButton.displayName = "NeonButton";

export { neonButtonVariants };
