/**
 * SINGLE source of truth for raw color values used OUTSIDE Tailwind classes —
 * i.e. anywhere we must pass a literal hex (SVG strokes/fills, React Flow, Recharts,
 * canvas). These mirror `tailwind.config.js`.
 */
export const TOKENS = {
  bg: {
    base: "#030305",
    inset: "#07070A",
    surface: "#0C0D12",
    raised: "#13151C",
    hover: "#1C1F2B",
    overlay: "rgba(3, 3, 5, 0.85)",
  },
  border: {
    subtle: "rgba(255, 255, 255, 0.06)",
    DEFAULT: "rgba(255, 255, 255, 0.10)",
    strong: "rgba(255, 255, 255, 0.18)",
    highlight: "rgba(255, 255, 255, 0.35)",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    muted: "#64748B",
  },
  status: {
    healthy: "#10B981",
    healthyGlow: "rgba(16, 185, 129, 0.25)",
    degraded: "#F59E0B",
    degradedGlow: "rgba(245, 158, 11, 0.25)",
    down: "#EF4444",
    downGlow: "rgba(239, 68, 68, 0.35)",
    info: "#06B6D4",
    infoGlow: "rgba(6, 182, 212, 0.25)",
    accent: "#6366F1",
    accentGlow: "rgba(99, 102, 241, 0.25)",
  },
} as const;

import type { Health } from "./ui";

/** Health -> canonical hex, for SVG/chart literals only. */
export const HEALTH_HEX: Record<Health, string> = {
  healthy: TOKENS.status.healthy,
  degraded: TOKENS.status.degraded,
  down: TOKENS.status.down,
  idle: "#333D4E",
};
