import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/design/ui";

export function ConfidenceArcGauge({
  confidence,
  size = 110,
  strokeWidth = 9,
  className,
}: {
  confidence: number; // 0.0 to 1.0
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, confidence));
  const offset = circumference - clamped * circumference;

  const uniqueId = React.useId().replace(/:/g, "_");
  const getGradientId = () => {
    if (clamped >= 0.8) return `gaugeHealthy_${uniqueId}`;
    if (clamped >= 0.5) return `gaugeDegraded_${uniqueId}`;
    return `gaugeDown_${uniqueId}`;
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`gaugeHealthy_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id={`gaugeDegraded_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id={`gaugeDown_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${getGradientId()})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 18,
          }}
          style={{
            filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))",
          }}
        />
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-base font-bold text-text-primary tabular leading-none">
          {(clamped * 100).toFixed(0)}%
        </span>
        <span className="text-3xs uppercase font-semibold text-text-muted tracking-widest mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
}
