import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/design/ui";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "glass"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "glow"
    | "cyber";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const variantClasses = {
      default:
        "bg-accent text-white shadow-sm hover:bg-accent/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
      glass:
        "bg-white/[0.04] hover:bg-white/[0.08] text-text-primary border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md",
      secondary:
        "bg-bg-raised text-text-primary border border-border-DEFAULT hover:border-border-strong hover:bg-bg-hover",
      outline:
        "border border-border-DEFAULT text-text-secondary hover:text-text-primary hover:bg-white/[0.03]",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]",
      destructive:
        "bg-status-down text-white hover:bg-status-down/90 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]",
      glow:
        "bg-gradient-to-r from-accent to-indigo-600 text-white shadow-glow-accent hover:brightness-110",
      cyber:
        "bg-status-info/10 text-status-info border border-status-info/30 hover:bg-status-info/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]",
    }[variant];

    const sizeClasses = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-8 rounded-md px-3 text-2xs",
      xs: "h-7 rounded-md px-2.5 text-3xs font-semibold tracking-wider uppercase",
      lg: "h-10 rounded-lg px-6 text-sm",
      icon: "h-8 w-8 p-0",
    }[size];

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none",
          variantClasses,
          sizeClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
