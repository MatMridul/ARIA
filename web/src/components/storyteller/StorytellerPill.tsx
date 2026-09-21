import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useSimulate } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inr, cn } from "@/design/ui";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FastForward,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export function StorytellerPill({ className }: { className?: string }) {
  const {
    scenario,
    selectedWindow,
    setSelectedWindow,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
  } = useAppStore();
  const { data: sim } = useSimulate(scenario);

  const incident = sim?.incident;
  const startWin = incident?.start_window ?? 12;
  const endWin = incident?.end_window ?? 15;
  const money = sim?.money_recovered ?? 0;
  const rootCause = sim?.attribution?.root_cause_id?.toUpperCase() ?? "BANK-A";

  // Autoplay loop timer (steady single interval)
  React.useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(250, 1400 / playbackSpeed);
    const timer = setInterval(() => {
      setSelectedWindow((prev) => {
        if (prev >= 19) {
          setIsPlaying(false);
          return 19;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, setSelectedWindow, setIsPlaying]);

  // Compute live narrative for current window
  const narrative = React.useMemo(() => {
    if (selectedWindow < startWin) {
      return {
        phase: "Phase 1: Baseline Nominal",
        tone: "healthy" as const,
        icon: ShieldCheck,
        badgeVariant: "healthy" as const,
        text: `Window W${selectedWindow}: All payment gateways & clearing banks operating within 99.8% SLA tolerance.`,
      };
    }
    if (selectedWindow === startWin) {
      return {
        phase: "Phase 2: Anomaly Ingress",
        tone: "down" as const,
        icon: AlertTriangle,
        badgeVariant: "down" as const,
        text: `Window W${selectedWindow}: Upstream ${rootCause} latency spikes +420ms. PSP-1 & PSP-2 checkout success plunges.`,
      };
    }
    if (selectedWindow === startWin + 1) {
      return {
        phase: "Phase 3: Causal Graph Inference",
        tone: "accent" as const,
        icon: Sparkles,
        badgeVariant: "accent" as const,
        text: `Window W${selectedWindow}: ARIA computes 100% shared-bank correlation ($S=1.00$). Bypasses naive cross-routing to PayU.`,
      };
    }
    if (selectedWindow <= endWin) {
      return {
        phase: "Phase 4: Autonomous Mitigation",
        tone: "healthy" as const,
        icon: Zap,
        badgeVariant: "healthy" as const,
        text: `Window W${selectedWindow}: Rerouting 100% checkout traffic to Cashfree on healthy Bank-B channels.`,
      };
    }
    return {
      phase: "Phase 5: Protected Yield",
      tone: "healthy" as const,
      icon: CheckCircle2,
      badgeVariant: "healthy" as const,
      text: `Window W${selectedWindow}: Autonomous bypass complete. Realized ${inr(money)} in preserved merchant checkout revenue.`,
    };
  }, [selectedWindow, startWin, endWin, money, rootCause]);

  const Icon = narrative.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.12] bg-[#070912]/95 backdrop-blur-2xl shadow-2xl p-2.5 transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant={isPlaying ? "glow" : "glass"}
            size="xs"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-3 font-semibold text-xs"
            title="Toggle Live Story Autoplay (Space)"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1 fill-current" /> Autoplay Story
              </>
            )}
          </Button>

          <Button
            variant="glass"
            size="xs"
            onClick={() => setSelectedWindow(Math.max(0, selectedWindow - 1))}
            disabled={selectedWindow <= 0}
            className="h-8 w-8 p-0"
            title="Step Back 1 Window ([)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="px-2 py-1 rounded-lg bg-black/60 border border-white/[0.06] font-mono text-xs font-bold text-white tabular min-w-[54px] text-center">
            W{String(selectedWindow).padStart(2, "0")}/19
          </div>

          <Button
            variant="glass"
            size="xs"
            onClick={() => setSelectedWindow(Math.min(19, selectedWindow + 1))}
            disabled={selectedWindow >= 19}
            className="h-8 w-8 p-0"
            title="Step Forward 1 Window (])"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="glass"
            size="xs"
            onClick={() => setSelectedWindow(0)}
            className="h-8 w-8 p-0 text-text-muted hover:text-white"
            title="Reset to Window 00"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {/* Speed Selector */}
          <div className="hidden lg:flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/[0.04]">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors",
                  playbackSpeed === speed
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Center / Right: Synchronized Live Narrative Text */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5 px-2">
          <Badge
            variant={narrative.badgeVariant}
            className="text-3xs font-mono shrink-0 uppercase flex items-center gap-1"
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span>{narrative.phase}</span>
          </Badge>

          <AnimatePresence mode="wait">
            <motion.p
              key={`${selectedWindow}-${narrative.phase}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-text-primary truncate font-medium"
            >
              {narrative.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
