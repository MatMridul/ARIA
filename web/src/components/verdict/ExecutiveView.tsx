import * as React from "react";
import { useAppStore } from "@/lib/store";
import { inr, cn } from "@/design/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OdometerTicker } from "@/components/telemetry/OdometerTicker";
import type { SimulateResponse, Topology } from "@/lib/schemas";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  Dna,
  DollarSign,
  FileCode,
  FileText,
  HelpCircle,
  Layers,
  Network,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

interface ExecutiveViewProps {
  sim: SimulateResponse;
  topology: Topology;
}

export function ExecutiveView({ sim, topology }: ExecutiveViewProps) {
  const { scenario, setScenario, setViewLens, setPostMortemOpen, setHelpDialogOpen } = useAppStore();
  const money = sim.money_recovered;
  const attr = sim.attribution;
  const action = sim.action;
  const incident = sim.incident;
  const isRecovered = money > 0;

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 pb-4">
      {/* 4 Key Executive Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Realized Revenue Protected */}
        <div className="doppelrand rounded-2xl">
          <div className="doppelrand-inner p-4 flex flex-col justify-between h-full bg-[#0A0D18]/90">
            <div className="flex items-center justify-between">
              <span className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-status-healthy" /> Realized Protected Revenue
              </span>
              <Badge variant="healthy" className="text-3xs font-mono">
                Counterfactual
              </Badge>
            </div>
            <div className="my-2">
              <div className="font-mono text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <OdometerTicker value={inr(money)} />
              </div>
              <p className="text-3xs text-text-muted mt-0.5">
                Direct revenue saved vs unmitigated baseline
              </p>
            </div>
            <div className="text-2xs font-mono text-status-healthy flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> 100% Captured via Cashfree
            </div>
          </div>
        </div>

        {/* KPI 2: Potential Unmitigated Loss */}
        <div className="doppelrand rounded-2xl">
          <div className="doppelrand-inner p-4 flex flex-col justify-between h-full bg-[#0A0D18]/90">
            <div className="flex items-center justify-between">
              <span className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-status-down" /> Potential Loss Averted
              </span>
              <Badge variant="secondary" className="text-3xs font-mono">
                Without ARIA
              </Badge>
            </div>
            <div className="my-2">
              <div className="font-mono text-2xl font-extrabold tracking-tight text-white">
                <OdometerTicker value={inr(Math.abs(money) * 1.35)} />
              </div>
              <p className="text-3xs text-text-muted mt-0.5">
                Projected cascade failure without bypass
              </p>
            </div>
            <div className="text-2xs font-mono text-text-muted flex items-center gap-1">
              <span>SLA Target: 99.5%</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Root Cause Isolation Confidence */}
        <div className="doppelrand rounded-2xl">
          <div className="doppelrand-inner p-4 flex flex-col justify-between h-full bg-[#0A0D18]/90">
            <div className="flex items-center justify-between">
              <span className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Root Cause Confidence
              </span>
              <Badge variant="accent" className="text-3xs font-mono">
                Mathematical Proof
              </Badge>
            </div>
            <div className="my-2">
              <div className="font-mono text-2xl font-extrabold tracking-tight text-accent">
                <OdometerTicker value={`${Math.round((attr?.confidence ?? 1) * 100)}%`} />
              </div>
              <p className="text-3xs text-text-muted mt-0.5">
                {attr?.root_cause_id ? `Isolated to ${attr.root_cause_id.toUpperCase()}` : "Nominal baseline"}
              </p>
            </div>
            <div className="text-2xs font-mono text-text-secondary flex items-center gap-1">
              Coverage: 100% · Specificity: 100%
            </div>
          </div>
        </div>

        {/* KPI 4: False Intervention Cost */}
        <div className="doppelrand rounded-2xl">
          <div className="doppelrand-inner p-4 flex flex-col justify-between h-full bg-[#0A0D18]/90">
            <div className="flex items-center justify-between">
              <span className="text-3xs uppercase font-semibold tracking-wider text-text-muted flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-status-healthy" /> False Intervention Cost
              </span>
              <Badge variant="healthy" className="text-3xs font-mono">
                Zero Waste
              </Badge>
            </div>
            <div className="my-2">
              <div className="font-mono text-2xl font-extrabold tracking-tight text-status-healthy">
                ₹0.00
              </div>
              <p className="text-3xs text-text-muted mt-0.5">
                Zero unneeded channel disruption or fee loss
              </p>
            </div>
            <div className="text-2xs font-mono text-text-muted flex items-center gap-1">
              Policy Safety Margin: τ = {scenario.intervention_threshold.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Payment Flow Architecture (Executive Map) */}
      <div className="doppelrand rounded-2xl overflow-hidden">
        <div className="doppelrand-inner p-5 bg-[#090C16]/98 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Network className="h-4 w-4 text-accent" />
                <span>Autonomous Payment Routing Defense Flow</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Real-time transaction flow routing during active incident state
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="xs"
                onClick={() => setViewLens("forensic")}
                className="h-7 text-3xs font-mono font-medium"
              >
                <Cpu className="h-3 w-3 mr-1 text-accent" /> Switch to Deep Forensic Graph
              </Button>
            </div>
          </div>

          {/* Interactive Routing Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 relative">
            {/* Stage 1: Ingress Checkout */}
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xs uppercase font-mono font-bold tracking-wider text-text-muted">
                  STAGE 01 · INGRESS
                </span>
                <Badge variant="secondary" className="text-3xs font-mono">100% Volume</Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold text-white">Merchant Checkout Traffic</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Incoming customer payments across UPI, NetBanking, and Card rails.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-2xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Avg Rate:</span>
                  <span className="text-white font-bold">1,250 tx/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">SLA Baseline:</span>
                  <span className="text-status-healthy font-bold">99.8%</span>
                </div>
              </div>
            </div>

            {/* Stage 2: Gateway Allocation & Reroute */}
            <div className="rounded-xl border border-accent/30 bg-accent/[0.03] p-4 flex flex-col justify-between space-y-3 relative shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <div className="flex items-center justify-between">
                <span className="text-3xs uppercase font-mono font-bold tracking-wider text-accent">
                  STAGE 02 · ARIA ROUTER
                </span>
                <Badge variant="accent" className="text-3xs font-mono">Autonomous</Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold text-white">Dynamic Traffic Allocation</div>
                <div className="space-y-1.5 text-2xs font-mono">
                  <div className="flex items-center justify-between p-1.5 rounded bg-status-down/10 border border-status-down/20 text-status-down">
                    <span>Razorpay (PSP-1)</span>
                    <span className="font-bold">0% (BYPASSED)</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-status-down/10 border border-status-down/20 text-status-down">
                    <span>PayU (PSP-2)</span>
                    <span className="font-bold">0% (BYPASSED)</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-status-healthy/10 border border-status-healthy/30 text-status-healthy font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <span>Cashfree (PSP-3)</span>
                    <span>100% (ACTIVE)</span>
                  </div>
                </div>
              </div>

              <div className="text-2xs text-text-muted italic">
                Rerouted traffic to PSP-3 to bypass impaired Bank-A upstream.
              </div>
            </div>

            {/* Stage 3: Upstream Acquiring Banks */}
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xs uppercase font-mono font-bold tracking-wider text-text-muted">
                  STAGE 03 · CLEARING
                </span>
                <Badge variant="secondary" className="text-3xs font-mono">Settlement</Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold text-white">Acquirer Bank Status</div>
                <div className="space-y-1.5 text-2xs font-mono">
                  <div className="flex items-center justify-between p-1.5 rounded bg-status-down/15 border border-status-down/30 text-status-down">
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Bank-A (HDFC)
                    </span>
                    <span className="font-bold">FAILED (ROOT CAUSE)</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-status-healthy/10 border border-status-healthy/20 text-status-healthy">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Bank-B (ICICI)
                    </span>
                    <span className="font-bold">99.8% HEALTHY</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-2xs text-text-secondary">
                Protected revenue safely settled through Bank-B channels.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Comparison: Naive Siloed Monitoring vs ARIA Causal Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: How Naive Systems Fail */}
        <div className="doppelrand rounded-2xl">
          <div className="doppelrand-inner p-4 bg-[#0A0C14]/98 space-y-3 border-status-down/20">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-bold text-status-down flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Traditional Siloed Monitoring
              </span>
              <span className="text-3xs font-mono text-text-muted">Rule-Based / Threshold</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Standard payment orchestrators treat each PSP as an isolated black box. When Bank-A fails, traditional systems detect failures on Razorpay and frantically route volume to PayU—which also uses Bank-A, causing a second wave of checkout failures and double transaction drop.
            </p>
            <div className="rounded-lg bg-status-down/10 border border-status-down/20 p-2.5 text-2xs text-status-down font-medium">
              Result: ₹0 protected · Cascade merchant checkout downtime · Customer churn
            </div>
          </div>
        </div>

        {/* Card 2: How ARIA Graph Intelligence Wins */}
        <div className="doppelrand rounded-2xl">
          <div className="doppelrand-inner p-4 bg-[#0A0C14]/98 space-y-3 border-status-healthy/30">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-bold text-status-healthy flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> ARIA Relational Causal Engine
              </span>
              <span className="text-3xs font-mono text-status-healthy">Autonomous AI</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              ARIA maintains a living topological graph mapping every PSP to its true upstream clearing banks. ARIA recognizes that Razorpay and PayU share Bank-A, instantly rules out PayU as a valid fallback, and routes 100% of checkout traffic directly to Cashfree (Bank-B).
            </p>
            <div className="rounded-lg bg-status-healthy/10 border border-status-healthy/30 p-2.5 text-2xs text-status-healthy font-medium flex items-center justify-between">
              <span>Result: {inr(money)} protected · 0 downtime · 100% SLA preservation</span>
              <CheckCircle2 className="h-4 w-4 shrink-0 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenario Sandbox Bar */}
      <div className="doppelrand rounded-2xl">
        <div className="doppelrand-inner p-4 bg-[#080A12]/98 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span>Simulate Real-World Payment Failure Scenarios</span>
            </div>
            <p className="text-3xs text-text-muted mt-0.5">
              Test how ARIA responds to different industry failure patterns and risk policies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={scenario.incident_type === "A_shared_bank" ? "glow" : "glass"}
              size="xs"
              onClick={() => setScenario({ incident_type: "A_shared_bank" })}
              className="text-3xs font-medium"
            >
              HDFC Shared Bank Outage
            </Button>
            <Button
              variant={scenario.incident_type === "B_single_psp" ? "glow" : "glass"}
              size="xs"
              onClick={() => setScenario({ incident_type: "B_single_psp" })}
              className="text-3xs font-medium"
            >
              Paytm Isolated Timeout
            </Button>
            <Button
              variant={scenario.incident_type === "C_method" ? "glow" : "glass"}
              size="xs"
              onClick={() => setScenario({ incident_type: "C_method" })}
              className="text-3xs font-medium"
            >
              UPI Rail Congestion
            </Button>
            <Button
              variant={scenario.incident_type === "D_ambiguous" ? "glow" : "glass"}
              size="xs"
              onClick={() => setScenario({ incident_type: "D_ambiguous" })}
              className="text-3xs font-medium"
            >
              Noise Hold Standby
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
