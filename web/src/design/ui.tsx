/**
 * ARIA design-system primitives. Pure UI, no data, no API imports.
 * Upgraded with hardware Doppelrand double-bezel styling and specular lighting.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Health = "healthy" | "degraded" | "down" | "idle";

const HEALTH_COLOR: Record<Health, string> = {
  healthy: "bg-status-healthy",
  degraded: "bg-status-degraded",
  down: "bg-status-down",
  idle: "bg-border-strong",
};

export function StatusDot({ health, pulse }: { health: Health; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            HEALTH_COLOR[health]
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]",
          HEALTH_COLOR[health]
        )}
      />
    </span>
  );
}

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="doppelrand rounded-2xl overflow-hidden shadow-2xl">
      <div
        className={cn(
          "doppelrand-inner",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-3.5">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-text-primary">{title}</h3>
        {subtitle && <p className="mt-0.5 text-2xs text-text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "healthy" | "degraded" | "down" | "info" | "accent";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.04] text-text-secondary border-white/[0.08]",
    healthy: "bg-status-healthy/10 text-status-healthy border-status-healthy/30 shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]",
    degraded: "bg-status-degraded/10 text-status-degraded border-status-degraded/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]",
    down: "bg-status-down/10 text-status-down border-status-down/30 shadow-[0_0_10px_-2px_rgba(239,68,68,0.2)]",
    info: "bg-status-info/10 text-status-info border-status-info/30 shadow-[0_0_10px_-2px_rgba(6,182,212,0.2)]",
    accent: "bg-accent/15 text-indigo-300 border-accent/30 shadow-[0_0_10px_-2px_rgba(99,102,241,0.25)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-2xs font-medium tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "default";
}) {
  const variants: Record<string, string> = {
    primary: "bg-accent text-white shadow-glow-accent hover:bg-accent/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    default: "bg-accent text-white shadow-glow-accent hover:bg-accent/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
    secondary: "bg-white/[0.04] text-text-primary border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14]",
    ghost: "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary",
    danger: "bg-status-down text-white hover:bg-status-down/90 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Metric({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: "healthy" | "degraded" | "down" | "default";
  hint?: string;
}) {
  const toneColor =
    tone === "healthy"
      ? "text-status-healthy"
      : tone === "degraded"
      ? "text-status-degraded"
      : tone === "down"
      ? "text-status-down"
      : "text-text-primary";
  return (
    <div className="px-4 py-3">
      <div className="text-3xs uppercase font-semibold tracking-wider text-text-muted">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold font-mono tabular tracking-tight", toneColor)}>{value}</div>
      {hint && <div className="mt-0.5 text-3xs text-text-muted">{hint}</div>}
    </div>
  );
}

export function inr(n: number): string {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(Math.round(n));
  return `${sign}₹${a.toLocaleString("en-IN")}`;
}
