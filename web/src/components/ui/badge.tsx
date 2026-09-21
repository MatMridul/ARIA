import * as React from "react";
import { cn } from "@/design/ui";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "healthy"
    | "degraded"
    | "down"
    | "info"
    | "accent";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "bg-white/[0.06] text-text-primary border-white/[0.1]",
    secondary: "bg-bg-raised text-text-secondary border-border-DEFAULT",
    outline: "border-border-strong text-text-secondary",
    healthy: "bg-status-healthy/10 text-status-healthy border-status-healthy/30 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]",
    degraded: "bg-status-degraded/10 text-status-degraded border-status-degraded/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]",
    down: "bg-status-down/10 text-status-down border-status-down/30 shadow-[0_0_10px_-2px_rgba(239,68,68,0.2)]",
    info: "bg-status-info/10 text-status-info border-status-info/30 shadow-[0_0_10px_-2px_rgba(6,182,212,0.2)]",
    accent: "bg-brand-accent/15 text-indigo-300 border-brand-accent/30 shadow-[0_0_10px_-2px_rgba(99,102,241,0.25)]",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-medium tracking-wide transition-colors",
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
