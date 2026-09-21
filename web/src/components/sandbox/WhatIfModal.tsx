import * as React from "react";
import { useAppStore } from "@/lib/store";
import { useSimulate } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inr, cn } from "@/design/ui";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  DollarSign,
  HelpCircle,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

export function WhatIfModal() {
  const {
    whatIfOpen,
    setWhatIfOpen,
    scenario,
    whatIfReroutePercent,
    setWhatIfReroutePercent,
    whatIfCapacityPercent,
    setWhatIfCapacityPercent,
  } = useAppStore();
  const { data: sim } = useSimulate(scenario);

  const baseRecovery = sim?.money_recovered ?? 42800;
  
  // Compute simulated counterfactual recovery under custom slider parameters
  const simulatedYield = Math.round(
    baseRecovery * (whatIfReroutePercent / 100) * (whatIfCapacityPercent / 100)
  );
  const yieldDelta = simulatedYield - baseRecovery;

  return (
    <Dialog open={whatIfOpen} onOpenChange={setWhatIfOpen}>
      <DialogContent className="max-w-2xl bg-[#090C16]/98 border-white/[0.12] p-6 space-y-5">
        <DialogHeader className="border-b border-white/[0.08] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Interactive "What-If" Counterfactual Sandbox</span>
                  <Badge variant="accent" className="text-3xs font-mono">Policy Simulator</Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-text-muted mt-0.5">
                  Simulate alternative routing allocations and capacity constraints to evaluate counterfactual revenue impact.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Sliders Container */}
        <div className="space-y-4">
          {/* Slider 1: Traffic Reroute % */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Traffic Rerouted to Fallback Gateway (PSP-3)
                </span>
                <span className="text-3xs text-text-muted">
                  Percentage of checkout volume diverted away from degraded Bank-A
                </span>
              </div>
              <span className="font-mono text-base font-extrabold text-accent">
                {whatIfReroutePercent}%
              </span>
            </div>
            <Slider
              value={[whatIfReroutePercent]}
              onValueChange={(val) => setWhatIfReroutePercent(val[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-3xs font-mono text-text-muted">
              <span>0% (Do Nothing / Full Drop)</span>
              <span>50% (Split Routing)</span>
              <span>100% (ARIA Optimal)</span>
            </div>
          </div>

          {/* Slider 2: Fallback Capacity Ceiling % */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Bank-B (ICICI) Fallback Capacity Limit
                </span>
                <span className="text-3xs text-text-muted">
                  Maximum throughput threshold Bank-B can absorb before queue congestion
                </span>
              </div>
              <span className="font-mono text-base font-extrabold text-status-healthy">
                {whatIfCapacityPercent}%
              </span>
            </div>
            <Slider
              value={[whatIfCapacityPercent]}
              onValueChange={(val) => setWhatIfCapacityPercent(val[0])}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-3xs font-mono text-text-muted">
              <span>50% (Throttled Acquirer)</span>
              <span>75% (Moderate Headroom)</span>
              <span>100% (Full Capacity)</span>
            </div>
          </div>
        </div>

        {/* Real-time Counterfactual Impact Comparison */}
        <div className="grid grid-cols-3 gap-3">
          {/* Box 1: Baseline Do Nothing */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-center">
            <span className="text-3xs uppercase font-semibold text-text-muted block">
              "Do Nothing" Baseline
            </span>
            <div className="font-mono text-lg font-bold text-status-down mt-1">
              ₹0.00
            </div>
            <span className="text-3xs text-text-muted">100% unmitigated loss</span>
          </div>

          {/* Box 2: Custom Sandbox Yield */}
          <div className="p-3.5 rounded-xl bg-accent/[0.06] border border-accent/30 text-center shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <span className="text-3xs uppercase font-semibold text-accent block">
              Simulated Custom Yield
            </span>
            <div className="font-mono text-xl font-extrabold text-white mt-1">
              {inr(simulatedYield)}
            </div>
            <span className={cn("text-3xs font-mono font-semibold", yieldDelta < 0 ? "text-status-down" : "text-status-healthy")}>
              {yieldDelta === 0 ? "Equal to Optimal" : `${yieldDelta > 0 ? "+" : ""}${inr(yieldDelta)} vs Optimal`}
            </span>
          </div>

          {/* Box 3: ARIA Autonomous Optimal */}
          <div className="p-3.5 rounded-xl bg-status-healthy/[0.06] border border-status-healthy/30 text-center">
            <span className="text-3xs uppercase font-semibold text-status-healthy block">
              ARIA Optimal Policy
            </span>
            <div className="font-mono text-lg font-bold text-status-healthy mt-1">
              {inr(baseRecovery)}
            </div>
            <span className="text-3xs text-status-healthy font-semibold">100% Preserved</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setWhatIfReroutePercent(100);
              setWhatIfCapacityPercent(100);
            }}
            className="text-xs text-text-muted hover:text-white"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Reset to ARIA Optimal
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={() => setWhatIfOpen(false)}
            className="text-xs font-bold"
          >
            Done Simulating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
