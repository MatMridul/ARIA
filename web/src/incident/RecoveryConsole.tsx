/**
 * Recommended intervention — an operational decision surface.
 * Features Doppelrand framing, spring Odometer numbers, and bounded policy controls.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, inr } from "@/design/ui";
import type { Action } from "@/lib";
import { isDoNothing } from "./helpers";
import { OdometerTicker } from "@/components/telemetry/OdometerTicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

type Choice = "execute" | "do_nothing" | null;

function prettyPsp(id: unknown): string {
  return typeof id === "string" && id.startsWith("psp_") ? `PSP-${id.slice(4)}` : String(id ?? "");
}

export function RecoveryConsole({
  action,
  moneyRecovered,
}: {
  action: Action;
  moneyRecovered: number;
}) {
  const [choice, setChoice] = useState<Choice>(null);
  const recommendedDoNothing = isDoNothing(action.kind);
  const negative = moneyRecovered < 0;

  const method = typeof action.params["method"] === "string" ? (action.params["method"] as string).toUpperCase() : null;
  const from = prettyPsp(action.params["from_psp"]);
  const to = prettyPsp(action.params["to_psp"]);

  return (
    <div className="p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span className="text-3xs font-semibold uppercase tracking-widest text-text-muted">
            Bounded Action Policy
          </span>
        </div>
        <Badge variant="healthy" className="text-3xs uppercase font-mono">
          <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Bounded
        </Badge>
      </div>

      {/* Intervention Action Banner */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-1.5">
            {action.kind === "do_nothing" ? "HOLD / NO INTERVENTION" : action.kind}
          </span>
          <span className="font-mono text-3xs text-text-muted">
            {action.decision_id || "DEC-DEFAULT"}
          </span>
        </div>

        {method && to && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/[0.04] font-mono">
            <span className="text-white font-semibold">{method}</span>
            <span className="text-text-muted">:</span>
            <span className="text-status-down">{from}</span>
            <ArrowRight className="h-3 w-3 text-accent" />
            <span className="text-status-healthy font-semibold">{to}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1 text-2xs">
          <div>
            <div className="text-3xs uppercase text-text-muted">Expected Yield</div>
            <div className="font-mono text-xs font-semibold text-text-primary mt-0.5">
              {inr(action.expected_recovery)}
            </div>
          </div>
          <div>
            <div className="text-3xs uppercase text-text-muted">Action Confidence</div>
            <div className="font-mono text-xs font-semibold text-accent mt-0.5">
              {Math.round(action.confidence * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Operator Execution Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={choice === "execute" ? "glow" : "secondary"}
          size="sm"
          onClick={() => setChoice("execute")}
          disabled={recommendedDoNothing}
          className="text-xs font-semibold"
        >
          Execute Action
        </Button>
        <Button
          variant={choice === "do_nothing" ? "glass" : "outline"}
          size="sm"
          onClick={() => setChoice("do_nothing")}
          className="text-xs font-medium text-text-secondary"
        >
          Hold / Do Nothing
        </Button>
      </div>

      {recommendedDoNothing && (
        <p className="text-3xs text-status-degraded leading-snug">
          Policy safety rule: confidence &lt; τ threshold. Execution is safely inhibited.
        </p>
      )}

      <AnimatePresence mode="wait">
        {choice === "execute" && (
          <motion.div
            key="x"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-white/[0.08] bg-[#0A0C12] p-3 space-y-1"
          >
            <div className="text-3xs uppercase font-semibold text-text-muted">
              Measured Counterfactual Delta
            </div>
            <div
              className={cn(
                "font-mono text-xl font-bold tabular",
                negative ? "text-status-down" : "text-status-healthy"
              )}
            >
              <OdometerTicker value={inr(moneyRecovered)} />
            </div>
            <p className="text-3xs text-text-secondary leading-relaxed">
              {negative
                ? "Intervention reduced net revenue vs holding. Highlighted transparently."
                : "Realized financial recovery achieved by routing around degraded dependency."}
            </p>
          </motion.div>
        )}

        {choice === "do_nothing" && (
          <motion.div
            key="d"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-white/[0.08] bg-[#0A0C12] p-3 space-y-1"
          >
            <div className="text-3xs uppercase font-semibold text-text-muted">
              Safe Default Standby
            </div>
            <div className="font-mono text-xl font-bold text-text-secondary tabular">
              <OdometerTicker value={inr(0)} />
            </div>
            <p className="text-3xs text-text-secondary leading-relaxed">
              Zero intervention risk executed. Preserved baseline routing parameters.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
