/**
 * ARIA Cyber-Financial Mission Control Center.
 *
 * Protagonist view featuring:
 * - Floating glassmorphic HUD dock (ScenarioSelector, Playback, RiskAppetiteDial).
 * - Living payment network topology canvas with custom hardware chips and particle streams.
 * - Interactive 20-Window Time-Travel Scrubber.
 * - Precision intelligence rail with Mathematical Deduction Proof Matrix and bounded Recovery Console.
 * - Real-time Spring Odometer KPIs.
 */
import * as React from "react";
import { motion } from "framer-motion";
import { cn, inr } from "@/design/ui";
import { useAppStore, useLiveTelemetryStream, useSimulate, useTopology } from "@/lib";
import { CommandTopology } from "@/topology";
import { CommandHUD } from "@/components/hud/CommandHUD";
import { ProofMatrix } from "@/components/telemetry/ProofMatrix";
import { TimeTravelScrubber } from "@/components/telemetry/TimeTravelScrubber";
import { OdometerTicker } from "@/components/telemetry/OdometerTicker";
import { RecoveryConsole } from "@/incident/RecoveryConsole";
import { ErrorState, LoadingState, prettyNodeId, representativeWindow, windowSuccessRate } from "@/incident";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, DollarSign, Layers, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";

import { ExecutiveVerdictBanner } from "@/components/verdict/ExecutiveVerdictBanner";
import { ExecutiveView } from "@/components/verdict/ExecutiveView";
import { StorytellerPill } from "@/components/storyteller/StorytellerPill";

export function CommandCenterPage() {
  const { scenario, customTopology, selectedWindow, viewLens } = useAppStore();
  const topo = useTopology();
  const sim = useSimulate(scenario, topo.isSuccess);

  // Maintain live SSE connection when Live Mode is toggled
  useLiveTelemetryStream();

  if (topo.isLoading || sim.isLoading) {
    return <LoadingState label="Initializing Cyber-Financial Mission Control Plane…" />;
  }
  if (topo.error) return <ErrorState error={topo.error} onRetry={() => topo.refetch()} />;
  if (sim.error) return <ErrorState error={sim.error} onRetry={() => sim.refetch()} />;
  if (!topo.data || !sim.data) return <LoadingState label="Synchronizing telemetry telemetry feeds…" />;

  const topologyData = customTopology || topo.data;
  const res = sim.data;
  const rep = res.windows[selectedWindow] || representativeWindow(res);
  const attr = res.attribution;
  const action = res.action;
  const doNothing = action.kind === "do_nothing";
  const negative = res.money_recovered < 0;
  const successRate = windowSuccessRate(rep);
  const incidentActive = rep.detection.dropped_nodes.length > 0;

  return (
    <div className="flex h-full flex-col bg-bg-base overflow-hidden relative">
      {/* Floating Top Control HUD */}
      <div className="px-5 pt-3.5 pb-2 shrink-0 z-20">
        <CommandHUD />
      </div>

      {/* 3-Second Executive Verdict & Operational Summary */}
      <div className="px-5 pb-2 shrink-0 z-10">
        <ExecutiveVerdictBanner />
      </div>

      {viewLens === "executive" ? (
        /* Executive Persona Lens: Clear Financial Defense Narrative & Routing Architecture */
        <div className="flex-1 min-h-0 px-5 flex flex-col overflow-hidden">
          <ExecutiveView sim={res} topology={topologyData} />
        </div>
      ) : (
        /* Forensic Persona Lens: Deep Telemetry Canvas, Proof Matrix & Time Analyzer */
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Top Telemetry KPI Bar */}
          <div id="tour-kpis" className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-2 shrink-0">
            {/* KPI 1: Recovered Revenue */}
            <div className="doppelrand rounded-2xl">
              <div className="doppelrand-inner p-3 flex items-center justify-between">
                <div>
                  <div className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-status-healthy" /> Realized Recovery
                  </div>
                  <div
                    className={cn(
                      "font-mono text-xl font-extrabold tracking-tight mt-0.5",
                      negative
                        ? "text-status-down"
                        : "bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    )}
                  >
                    <OdometerTicker value={inr(res.money_recovered)} />
                  </div>
                </div>
                <Badge variant={negative ? "down" : "healthy"} className="text-3xs font-mono">
                  Counterfactual
                </Badge>
              </div>
            </div>

            {/* KPI 2: Expected Recovery */}
            <div className="doppelrand rounded-2xl">
              <div className="doppelrand-inner p-3 flex items-center justify-between">
                <div>
                  <div className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-accent" /> Expected Yield
                  </div>
                  <div className="font-mono text-xl font-extrabold text-text-primary tracking-tight mt-0.5">
                    <OdometerTicker value={inr(action.expected_recovery)} />
                  </div>
                </div>
                <Badge variant="secondary" className="text-3xs font-mono">
                  Policy Estimate
                </Badge>
              </div>
            </div>

            {/* KPI 3: Window Success Rate */}
            <div className="doppelrand rounded-2xl">
              <div className="doppelrand-inner p-3 flex items-center justify-between">
                <div>
                  <div className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1">
                    <Activity className="h-3 w-3 text-status-info" /> Success Rate
                  </div>
                  <div
                    className={cn(
                      "font-mono text-xl font-extrabold tracking-tight mt-0.5",
                      successRate < 0.9 ? "text-status-down" : "text-status-healthy"
                    )}
                  >
                    <OdometerTicker value={`${(successRate * 100).toFixed(1)}%`} />
                  </div>
                </div>
                <span className="font-mono text-3xs text-text-muted">Window {rep.window}</span>
              </div>
            </div>

            {/* KPI 4: Active Fault State */}
            <div className="doppelrand rounded-2xl">
              <div className="doppelrand-inner p-3 flex items-center justify-between">
                <div>
                  <div className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1">
                    <Zap className="h-3 w-3 text-status-degraded" /> Fault Target
                  </div>
                  <div className="text-base font-bold text-white tracking-tight mt-0.5 truncate max-w-[140px]">
                    {res.incident.target_id ? prettyNodeId(res.incident.target_id) : "None (Nominal)"}
                  </div>
                </div>
                <Badge variant={incidentActive ? "down" : "healthy"} className="text-3xs font-mono uppercase">
                  {incidentActive ? "Breach Active" : "Nominal"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Workspace Body: Living Network (Center) + Intelligence Rail (Right) */}
          <div className="flex min-h-0 flex-1 px-5 pb-3 gap-4">
            {/* Living Payment Network (Protagonist Canvas) */}
            <div id="tour-topology" className="relative flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              {/* Floating Storyteller Pill with Live Narrative Commentary */}
              <div className="p-2 z-10 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
                <StorytellerPill />
              </div>

              <div className="flex-1 min-h-0 relative">
                <CommandTopology topology={topologyData} sim={res} />
              </div>

              {/* Integrated Time-Travel Scrubber */}
              <div id="tour-scrubber" className="p-2 shrink-0 bg-black/60 backdrop-blur-xl border-t border-white/[0.06]">
                <TimeTravelScrubber />
              </div>
            </div>

            {/* Right Intelligence & Deduction Rail */}
            <div className="w-[380px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
              {/* Visual Deduction Matrix */}
              <div id="tour-proof">
                <ProofMatrix />
              </div>

              {/* Bounded Recovery Console */}
              <div id="tour-recovery" className="doppelrand rounded-2xl">
                <div className="doppelrand-inner">
                  <RecoveryConsole action={action} moneyRecovered={res.money_recovered} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Causal Sequence Ribbon */}
          <div className="shrink-0 border-t border-white/[0.06] bg-[#07080C]/95 px-5 py-2.5">
            <CausalRibbon
              detected={incidentActive}
              diagnosed={attr.root_cause_kind !== "none"}
              intervened={!doNothing}
              recovered={res.money_recovered !== 0}
              money={res.money_recovered}
              action={action.kind}
              negative={negative}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CausalRibbon({
  detected,
  diagnosed,
  intervened,
  recovered,
  money,
  action,
  negative,
}: {
  detected: boolean;
  diagnosed: boolean;
  intervened: boolean;
  recovered: boolean;
  money: number;
  action: string;
  negative: boolean;
}) {
  const steps = [
    { key: "detected", label: "Telemetry Detection", done: detected, detail: detected ? "Anomalous Delta Breach" : "Monitoring Baseline" },
    { key: "diagnosed", label: "Causal Graph Inference", done: diagnosed, detail: diagnosed ? "Shared Root Cause Isolated" : "No Dependency Fault" },
    { key: "intervention", label: "Policy Execution", done: intervened, detail: intervened ? action.replace(/_/g, " ") : "Hold Standby" },
    { key: "recovered", label: "Yield Realization", done: recovered, detail: recovered ? inr(money) : "0", tone: negative ? "down" : "healthy" },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-3">
      {steps.map((s, i) => (
        <div
          key={s.key}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border p-2 transition-all duration-300",
            s.done
              ? "bg-white/[0.03] border-white/[0.1] shadow-inner-specular"
              : "border-white/[0.04] bg-white/[0.01] opacity-50"
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-2xs font-mono font-bold transition-all",
              s.done
                ? "border-accent/60 bg-accent/20 text-accent shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                : "border-white/[0.1] bg-white/[0.02] text-text-muted"
            )}
          >
            0{i + 1}
          </span>
          <div className="min-w-0">
            <div className="text-3xs font-semibold uppercase tracking-wider text-text-muted">
              {s.label}
            </div>
            <div className="truncate font-mono text-xs font-semibold text-text-primary capitalize">
              {s.detail}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
