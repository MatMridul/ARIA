import * as React from "react";
import { ScenarioSelector } from "./ScenarioSelector";
import { MerchantProfileSelector } from "./MerchantProfileSelector";
import { RiskAppetiteDial } from "./RiskAppetiteDial";
import { PlaybackControls } from "./PlaybackControls";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { HelpCircle, Sliders, Terminal } from "lucide-react";
import { cn } from "@/design/ui";

export function CommandHUD({ className }: { className?: string }) {
  const { setCommandPaletteOpen, setHelpDialogOpen, setWhatIfOpen } = useAppStore();

  return (
    <div
      id="tour-hud"
      className={cn(
        "glass-dock rounded-2xl p-1.5 flex flex-wrap items-center justify-between gap-3 shadow-2xl z-30",
        className
      )}
    >
      {/* Left: Merchant Profile Scale & Incident Selection */}
      <div className="flex items-center gap-2">
        <MerchantProfileSelector />
        <ScenarioSelector />
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
