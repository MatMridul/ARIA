import * as React from "react";
import { ScenarioSelector } from "./ScenarioSelector";
import { MerchantProfileSelector } from "./MerchantProfileSelector";
import { RiskAppetiteDial } from "./RiskAppetiteDial";
import { PlaybackControls } from "./PlaybackControls";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Activity, HelpCircle, Radio, Sliders, Terminal, Zap } from "lucide-react";
import { cn } from "@/design/ui";

export function CommandHUD({ className }: { className?: string }) {
  const {
    isLiveMode,
    setIsLiveMode,
    liveStreamConnected,
    setLiveDrawerOpen,
    setCommandPaletteOpen,
    setHelpDialogOpen,
    setWhatIfOpen,
  } = useAppStore();

  return (
    <div
      id="tour-hud"
      className={cn(
        "glass-dock rounded-2xl p-1.5 flex flex-wrap items-center justify-between gap-3 shadow-2xl z-30",
        className
      )}
    >
      {/* Left: Mode Toggle, Merchant Profile Scale & Incident Selection */}
      <div className="flex items-center gap-2">
        {/* Operational Mode Toggle */}
        <button
          onClick={() => {
            const next = !isLiveMode;
            setIsLiveMode(next);
            if (next) setLiveDrawerOpen(true);
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-3xs font-semibold tracking-wide uppercase transition-all duration-200 border",
            isLiveMode
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              : "bg-white/[0.03] border-white/[0.08] text-text-muted hover:text-white hover:bg-white/[0.06]"
          )}
          title={isLiveMode ? "Streaming Live Telemetry (Click to switch to replay)" : "Switch to Live Ingestion Plane"}
        >
          {isLiveMode ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Live Stream</span>
            </>
          ) : (
            <>
              <Radio className="h-3 w-3" />
              <span>Sim Replay</span>
            </>
          )}
        </button>

        {isLiveMode && (
          <Button
            variant="glass"
            size="sm"
            onClick={() => setLiveDrawerOpen(true)}
            className="flex items-center gap-1 text-3xs font-medium text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5"
            title="Open Live Webhook Controller & Streamer"
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono">Webhooks</span>
          </Button>
        )}

        <MerchantProfileSelector />
        {!isLiveMode && <ScenarioSelector />}
      </div>

      {/* Center: Playback Transport Controller */}
      <div className="flex items-center gap-2">
        <PlaybackControls />
      </div>

      {/* Right: Risk Appetite Dial, What-If Sandbox, Help Guide, & Command Trigger */}
      <div className="flex items-center gap-2">
        <RiskAppetiteDial />

        <Button
          variant="glass"
          size="sm"
          onClick={() => setWhatIfOpen(true)}
          className="flex items-center gap-1 text-3xs font-medium text-accent hover:text-white px-2.5"
          title="Open What-If Policy Sandbox (W)"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span className="font-mono">What-If</span>
        </Button>

        <Button
          variant="glass"
          size="sm"
          onClick={() => setHelpDialogOpen(true)}
          className="hidden sm:flex items-center gap-1 text-3xs font-medium text-text-muted hover:text-white px-2"
          title="System Architecture Guide & Interactive Tour (?)"
        >
          <HelpCircle className="h-3.5 w-3.5 text-accent" />
          <span className="font-mono">Guide</span>
        </Button>

        <Button
          variant="glass"
          size="sm"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden lg:flex items-center gap-1.5 text-3xs font-medium text-text-muted hover:text-text-primary px-2.5"
          title="Open Command Palette (Cmd + K)"
        >
          <Terminal className="h-3.5 w-3.5 text-accent" />
          <span className="font-mono">⌘K</span>
        </Button>
      </div>
    </div>
  );
}
