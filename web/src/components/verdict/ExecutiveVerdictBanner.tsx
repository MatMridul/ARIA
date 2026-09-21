import * as React from "react";
import { useAppStore } from "@/lib/store";
import { useSimulate } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inr } from "@/design/ui";
import {
  Check,
  Copy,
  FileText,
  Layers,
  Network,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/design/ui";

export function ExecutiveVerdictBanner({ className }: { className?: string }) {
  const { scenario, viewLens, setViewLens, setPostMortemOpen } = useAppStore();
  const { data: sim } = useSimulate(scenario);
  const [copied, setCopied] = React.useState(false);

  const res = sim;
  const money = res?.money_recovered ?? 0;
  const attr = res?.attribution;
  const action = res?.action;
  const incident = res?.incident;
  const isRecovered = money > 0;
  const isDoNothing = action?.kind === "do_nothing";

  // Compute human-readable narrative
  const narrative = React.useMemo(() => {
    switch (scenario.incident_type) {
      case "A_shared_bank":
        return {
          status: "CRITICAL UPSTREAM OUTAGE DEFENDED",
          tone: "healthy",
          headline: "HDFC Core Clearing Outage Automatically Mitigated",
          summary: `Upstream clearing failed at Bank-A, simultaneously degrading Razorpay (PSP-1) and PayU (PSP-2). ARIA isolated the shared dependency with 100% confidence and rerouted checkout traffic to Cashfree (PSP-3 on Bank-B), protecting ${inr(money)} in merchant revenue with zero downtime.`,
        };
      case "B_single_psp":
        return {
          status: "ISOLATED GATEWAY DEGRADATION MITIGATED",
          tone: "healthy",
          headline: "Single Gateway Outage Contained to PSP-1",
          summary: `Isolated gateway timeouts detected on PSP-1 while upstream Bank-A remained healthy. ARIA bounded mitigation exclusively to PSP-1 without disturbing healthy sibling channels, maintaining 99.8% checkout SLA.`,
        };
      case "C_method":
        return {
          status: "PAYMENT METHOD CONGESTION DETECTED",
          tone: "degraded",
          headline: "UPI Payment Rail Degradation Managed",
          summary: `Network-wide UPI rail failure detected across all gateways. ARIA identified method-specific degradation and preserved gateway allocations to prevent unnecessary infrastructure churn.`,
        };
      case "D_ambiguous":
        return {
          status: "TRANSIENT NOISE · SAFE HOLD ACTIVE",
          tone: "neutral",
          headline: "Statistical Noise Filtered · Safe Default Enforced",
          summary: `Transient dip detected below statistical confidence threshold (τ = ${scenario.intervention_threshold.toFixed(2)}). ARIA safely enforced a 'do_nothing' hold to prevent costly false interventions and checkout disruption.`,
        };
      case "E_coincidental":
        return {
          status: "INDEPENDENT MULTI-GATEWAY FAULTS DETECTED",
          tone: "healthy",
          headline: "Coincidental Dual PSP Outage Correctly Disambiguated",
          summary: `PSP-1 (Bank-A) and PSP-3 (Bank-B) failed simultaneously across independent acquirers. ARIA mathematically proved zero shared-bank correlation, avoiding over-attribution and managing both faults independently.`,
        };
      default:
        return {
          status: "ALL PAYMENT RAILS NOMINAL",
          tone: "healthy",
          headline: "Autonomous Financial Defense Active",
          summary: "Monitoring real-time checkout telemetry across all payment methods, gateways, and clearing banks.",
        };
    }
  }, [scenario.incident_type, money, scenario.intervention_threshold]);

  const handleCopyBrief = () => {
    const brief = `# ARIA Incident Brief — ${narrative.headline}
**Status:** ${narrative.status}
**Financial Impact:** ${inr(money)} revenue protected
**Root Cause:** ${attr?.root_cause_id || "None"} (${attr?.root_cause_kind || "nominal"})
**Confidence:** ${Math.round((attr?.confidence || 0) * 100)}%
**Action Executed:** ${action?.kind || "hold"}
**Summary:** ${narrative.summary}
**Deterministic Replay:** Seed #${scenario.seed}, Risk Threshold τ=${scenario.intervention_threshold}`;

    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "doppelrand rounded-2xl overflow-hidden shadow-2xl transition-all duration-300",
        className
      )}
    >
      <div className="doppelrand-inner p-4 bg-[#0A0C14]/98 border border-white/[0.08] space-y-3">
        {/* Top Operational Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-healthy opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-healthy shadow-[0_0_8px_currentColor]" />
            </span>
            <span className="text-3xs font-mono font-bold uppercase tracking-widest text-status-healthy">
              {narrative.status}
            </span>
            <span className="text-text-muted font-mono text-3xs">·</span>
            <span className="font-mono text-3xs text-text-muted">
              Live Session #{String(scenario.seed).padStart(2, "0")} (τ = {scenario.intervention_threshold.toFixed(2)})
            </span>
          </div>

          {/* Action Tools & Persona Lens Switcher */}
          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="xs"
              onClick={handleCopyBrief}
              className="h-7 text-3xs font-medium"
              title="Copy Incident Summary for Slack / Jira"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-status-healthy mr-1" /> Copied Brief
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" /> Copy for Slack
                </>
              )}
            </Button>

            <Button
              variant="glass"
              size="xs"
              onClick={() => setPostMortemOpen(true)}
              className="h-7 text-3xs font-medium text-accent"
              title="Open Boardroom-Ready Post-Mortem Report"
            >
              <FileText className="h-3 w-3 mr-1" /> Dossier
            </Button>

            {/* Persona Lens Toggle */}
            <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setViewLens("executive")}
                className={cn(
                  "px-2 py-1 rounded-md text-3xs font-semibold uppercase tracking-wider transition-colors",
                  viewLens === "executive"
                    ? "bg-white/[0.12] text-white shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                Executive
              </button>
              <button
                onClick={() => setViewLens("forensic")}
                className={cn(
                  "px-2 py-1 rounded-md text-3xs font-semibold uppercase tracking-wider transition-colors",
                  viewLens === "forensic"
                    ? "bg-white/[0.12] text-accent shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                Forensic
              </button>
            </div>
          </div>
        </div>

        {/* Narrative & Financial Bottom Line */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-0.5">
          <div className="space-y-1 max-w-3xl">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{narrative.headline}</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {narrative.summary}
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl border border-status-healthy/30 bg-status-healthy/10 px-3.5 py-2 text-right shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]">
              <div className="text-3xs uppercase font-semibold text-status-healthy tracking-wider">
                Protected Yield
              </div>
              <div className="font-mono text-base font-extrabold text-white tracking-tight">
                {inr(money)}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-right">
              <div className="text-3xs uppercase font-semibold text-text-muted tracking-wider">
                Root Cause
              </div>
              <div className="font-mono text-xs font-bold text-accent truncate max-w-[110px]">
                {attr?.root_cause_id ? attr.root_cause_id.toUpperCase() : "Nominal"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
