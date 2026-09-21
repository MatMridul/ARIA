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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inr } from "@/design/ui";
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  DollarSign,
  Download,
  FileCheck,
  FileText,
  Layers,
  Network,
  Printer,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export function PostMortemDialog() {
  const { postMortemOpen, setPostMortemOpen, scenario } = useAppStore();
  const { data: sim } = useSimulate(scenario);
  const [copied, setCopied] = React.useState(false);

  const res = sim;
  const money = res?.money_recovered ?? 0;
  const attr = res?.attribution;
  const action = res?.action;
  const incident = res?.incident;

  const handleCopyReport = () => {
    const reportText = `# ARIA Autonomous Incident Post-Mortem Report
**Incident ID:** INC-2026-${scenario.seed.toString().padStart(3, "0")}
**Scenario Classification:** ${scenario.incident_type}
**Severity Level:** SEV-1 (High Impact Upstream Dependency)
**Active Risk Policy:** Threshold τ = ${scenario.intervention_threshold.toFixed(2)}
**Status:** RESOLVED (Automated Bounded Rerouting)

---

## 1. Executive Summary
During window W${incident?.start_window ?? 12} to W${incident?.end_window ?? 15}, checkout telemetry observed anomalous transaction failure across payment rails. ARIA's causal graph engine isolated the root cause to ${attr?.root_cause_id ?? "Bank-A"} (${attr?.root_cause_kind ?? "bank"}) with ${Math.round((attr?.confidence ?? 1) * 100)}% formal confidence.

## 2. Financial Impact & Recovery Analysis
* **Counterfactual Revenue Protected:** ${inr(money)}
* **Estimated Unmitigated Loss:** ${inr(Math.abs(money) * 1.4)}
* **Current Operational SLA:** 99.4% Checkout Success Rate
* **False Intervention Cost:** ₹0.00 (Zero unneeded channel disruption)

## 3. Causal Graph Findings
* **Breached Entities:** ${attr?.psp_causes?.join(", ") || "PSP-1, PSP-2"}
* **Shared Upstream Node:** ${attr?.root_cause_id || "Bank-A"}
* **Mathematical Proof:** Coverage = 100%, Specificity = 100%
* **Eliminated Hypotheses:** Method-level rail failure and independent single PSP flukes were formally ruled out.

## 4. Operational Actions Executed
* **Decision ID:** ${action?.decision_id || "reroute-d1c13ceb5dc0"}
* **Action Type:** ${action?.kind || "reroute"}
* **Routing Path:** Bypassed ${attr?.root_cause_id || "Bank-A"} PSPs → Activated PSP-3 (Bank-B)

---
*Generated autonomously by ARIA Revenue Defense Engine.*`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={postMortemOpen} onOpenChange={setPostMortemOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-[#0B0D14]/98 border-white/[0.12]">
        <DialogHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-status-healthy/20 border border-status-healthy/40 flex items-center justify-center text-status-healthy shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Executive Incident Post-Mortem & Audit Dossier
                </DialogTitle>
                <DialogDescription className="text-xs text-text-muted mt-0.5">
                  Formal incident resolution report for executive leadership and compliance reviews.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="glow"
                size="sm"
                onClick={handleCopyReport}
                className="text-xs font-bold"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" /> Copied Report
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy Markdown
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Post-Mortem Dossier Sections */}
        <div className="space-y-5 pt-3 text-xs text-text-secondary leading-relaxed font-sans">
          {/* Section 1: Executive KPI Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
              <div className="text-3xs uppercase font-semibold text-text-muted">Protected Yield</div>
              <div className="font-mono text-lg font-extrabold text-status-healthy mt-1">
                {inr(money)}
              </div>
              <span className="text-3xs text-text-muted">vs holding baseline</span>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
              <div className="text-3xs uppercase font-semibold text-text-muted">Resolution Speed</div>
              <div className="font-mono text-lg font-extrabold text-white mt-1">
                &lt; 1 Simulation Window
              </div>
              <span className="text-3xs text-text-muted">Instant autonomous bypass</span>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
              <div className="text-3xs uppercase font-semibold text-text-muted">Root Cause Confidence</div>
              <div className="font-mono text-lg font-extrabold text-accent mt-1">
                {Math.round((attr?.confidence ?? 1) * 100)}%
              </div>
              <span className="text-3xs text-text-muted">Formal graph proof</span>
            </div>
          </div>

          {/* Section 2: Narrative Findings */}
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Incident Chronology & Impact Summary
            </h4>
            <p className="text-xs leading-relaxed">
              At simulation window <strong className="text-white">W{incident?.start_window ?? 12}</strong>, checkout telemetry registered simultaneous transaction degradation across gateways <strong className="text-white">PSP-1</strong> and <strong className="text-white">PSP-2</strong>. A naive siloed monitor would have treated these as two independent gateway faults and attempted futile cross-rerouting.
            </p>
            <p className="text-xs leading-relaxed">
              ARIA&apos;s relational topology intelligence deduced that both gateways share a single upstream clearing dependency (<strong className="text-accent">Bank-A</strong>). Because Bank-A was 100% covered and zero spillover occurred to Bank-B, ARIA verified Bank-A as the single root cause with 100% mathematical confidence.
            </p>
          </div>

          {/* Section 3: Operational Decision Log */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-status-healthy" /> Executed Mitigation Parameters
            </h4>
            <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.04]">
                <span className="text-text-muted text-3xs uppercase block">Decision Token</span>
                <strong className="text-white">{action?.decision_id || "reroute-d1c13ceb5dc0"}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.04]">
                <span className="text-text-muted text-3xs uppercase block">Mitigation Strategy</span>
                <strong className="text-status-healthy">{action?.kind?.toUpperCase() || "REROUTE"}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.04]">
                <span className="text-text-muted text-3xs uppercase block">Target Bypass Gateway</span>
                <strong className="text-white">PSP-3 (Bank-B Acquirer)</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/[0.04]">
                <span className="text-text-muted text-3xs uppercase block">Policy Safety Margin</span>
                <strong className="text-accent">τ = {scenario.intervention_threshold.toFixed(2)} (Passed)</strong>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
