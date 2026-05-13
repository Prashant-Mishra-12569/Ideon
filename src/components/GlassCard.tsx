import * as React from "react";
import { cn } from "@/lib/utils";

export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass border-gradient rounded-2xl p-6 transition-all duration-300",
      className,
    )}
    {...props}
  />
));
GlassCard.displayName = "GlassCard";
