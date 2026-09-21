import * as React from "react";
import { useAppStore } from "@/lib/store";
import { useSimulate } from "@/lib/hooks";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShieldAlert, ShieldCheck, Gauge } from "lucide-react";
import { cn } from "@/design/ui";

export function RiskAppetiteDial() {
  const { scenario, setScenario } = useAppStore();
  const { data: sim } = useSimulate(scenario);

  const threshold = scenario.intervention_threshold;
  const currentConfidence = sim?.attribution?.confidence ?? 0;
  const willIntervene = currentConfidence >= threshold;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-3 px-3 py-1 bg-white/[0.02] border border-white/[0.08] rounded-xl backdrop-blur-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-help">
              <Gauge className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-3xs uppercase font-semibold tracking-wider text-text-muted">
                Risk τ
              </span>
              <span className="font-mono text-xs font-semibold text-text-primary tabular min-w-[2.25rem]">
                {threshold.toFixed(2)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-2.5 text-xs">
            <div className="font-semibold text-text-primary">
              Intervention Threshold (τ = {threshold.toFixed(2)})
            </div>
            <p className="mt-1 text-2xs text-text-secondary leading-relaxed">
              If attribution confidence $\ge \tau$, ARIA executes corrective rerouting.
              Otherwise, it enforces strict <span className="font-mono text-status-degraded">do_nothing</span> to prevent costly false interventions.
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Tactile Slider */}
        <div className="w-24 sm:w-32">
          <Slider
            min={0.0}
            max={1.0}
            step={0.05}
            value={[threshold]}
            onValueChange={([val]) => setScenario({ intervention_threshold: Number(val.toFixed(2)) })}
          />
        </div>

        {/* Real-Time Threshold Gate Indicator */}
        <div
          className={cn(
            "flex items-center gap-1 text-3xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all duration-300",
            willIntervene
              ? "bg-status-healthy/10 text-status-healthy border-status-healthy/30 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]"
              : "bg-status-degraded/10 text-status-degraded border-status-degraded/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.3)]"
          )}
        >
          {willIntervene ? (
            <>
              <ShieldCheck className="h-3 w-3" />
              <span>Act</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3 w-3" />
              <span>Halt</span>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
