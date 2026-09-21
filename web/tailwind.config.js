/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ARIA Mission Control OLED Substrate
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
        // Semantic status colors with backward compatibility
        healthy: "#10B981",
        degraded: "#F59E0B",
        down: "#EF4444",
        info: "#06B6D4",
        accent: "#6366F1",
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
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "3xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        "glow-healthy": "0 0 20px -3px rgba(16, 185, 129, 0.35)",
        "glow-degraded": "0 0 20px -3px rgba(245, 158, 11, 0.35)",
        "glow-down": "0 0 24px -2px rgba(239, 68, 68, 0.45)",
        "glow-accent": "0 0 20px -3px rgba(99, 102, 241, 0.35)",
        "glow-cyan": "0 0 20px -3px rgba(6, 182, 212, 0.35)",
        "inner-specular": "inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-ping": "radar 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "70%": { transform: "scale(2.2)", opacity: "0" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
