/**
 * TimeTravelScrubber — Dual-channel digital logic timeline instrument.
 * Displays exact window intervals, incident detection triggers, and mitigation markers.
 */
import * as React from "react";
import { useAppStore } from "@/lib/store";
import { useSimulate } from "@/lib/hooks";
import { motion } from "framer-motion";
import { cn } from "@/design/ui";
import { Clock, ShieldAlert, Sparkles, Zap } from "lucide-react";

export function TimeTravelScrubber({ className }: { className?: string }) {
  const { scenario, selectedWindow, setSelectedWindow, setIsPlaying } = useAppStore();
  const { data: sim } = useSimulate(scenario);

  const windows = sim?.windows ?? [];
  const incidentInfo = sim?.incident;
  const startWin = incidentInfo?.start_window ?? 4;
  const endWin = incidentInfo?.end_window ?? 12;

  const handleSelectWindow = (idx: number) => {
    setIsPlaying(false);
    setSelectedWindow(idx);
  };

  return (
    <div
      className={cn(
        "doppelrand rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl",
        className
      )}
    >
      <div className="doppelrand-inner p-3.5 space-y-2.5">
        {/* Scrubber Telemetry Header */}
        <div className="flex items-center justify-between text-2xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span className="font-bold uppercase tracking-wider text-text-primary">
              20-Window Incident Sequence Timeline
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-3xs">
            <span className="flex items-center gap-1.5 text-status-down bg-status-down/10 border border-status-down/30 px-2 py-0.5 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-status-down" />
              Fault: W{startWin.toString().padStart(2, "0")}–W{endWin.toString().padStart(2, "0")}
            </span>
            <span className="flex items-center gap-1.5 text-status-healthy bg-status-healthy/10 border border-status-healthy/30 px-2 py-0.5 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-status-healthy" />
              Recovery: W{(endWin + 1).toString().padStart(2, "0")}+
            </span>
            <span className="text-white bg-white/[0.1] border border-white/[0.15] px-2 py-0.5 rounded-md font-bold">
              Window {selectedWindow.toString().padStart(2, "0")} / 19
            </span>
          </div>
        </div>

        {/* 20-Window Timeline Analyzer Track */}
        <div className="relative flex items-end gap-1.5 h-12 bg-black/60 rounded-xl p-2 border border-white/[0.06] select-none">
          {Array.from({ length: 20 }).map((_, idx) => {
            const winData = windows[idx];
            const isSelected = selectedWindow === idx;
            const isIncident = idx >= startWin && idx <= endWin;
            const isRecovery = idx > endWin;
            const isTriggered = winData?.detection?.triggered ?? false;

            // Compute health bar height from average success rate in that window
            let avgSuccess = 1.0;
            if (winData?.nodes && winData.nodes.length > 0) {
              avgSuccess =
                winData.nodes.reduce((acc, n) => acc + n.success_rate, 0) /
                winData.nodes.length;
            }
            const barHeightPct = Math.max(25, Math.round(avgSuccess * 100));

            return (
              <div
                key={idx}
                onClick={() => handleSelectWindow(idx)}
                className={cn(
                  "relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer transition-all rounded-[2px]",
                  isSelected ? "bg-white/[0.15]" : "hover:bg-white/[0.08]"
                )}
                title={`Window ${idx}: ${(avgSuccess * 100).toFixed(1)}% Success Rate`}
              >
                {/* Zone background shading */}
                {isIncident && (
                  <div className="absolute inset-0 bg-status-down/[0.15] rounded-[2px] pointer-events-none" />
                )}
                {isRecovery && (
                  <div className="absolute inset-0 bg-status-healthy/[0.1] rounded-[2px] pointer-events-none" />
                )}

                {/* Vertical Waveform Bar */}
                <div
                  style={{ height: `${barHeightPct}%` }}
                  className={cn(
                    "w-full rounded-[2px] transition-all duration-200",
                    isIncident
                      ? isTriggered
                        ? "bg-status-down shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        : "bg-status-degraded"
                      : isRecovery
                      ? "bg-status-healthy"
                      : "bg-accent/80"
                  )}
                />

                {/* Tick Label */}
                <span
                  className={cn(
                    "text-[8px] font-mono mt-1 tabular leading-none",
                    isSelected
                      ? "text-white font-bold"
                      : "text-text-muted group-hover:text-text-secondary"
                  )}
                >
                  {idx}
                </span>

                {/* Magnetic Needle Marker */}
                {isSelected && (
                  <div className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
