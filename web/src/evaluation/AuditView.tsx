/**
 * Audit log — derived from a single simulated run.
 * Features Doppelrand containers, Lucide badges, and full scenario synchronization.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore, useAudit, type IncidentTypeId } from "@/lib";
import { Card, CardHeader, Badge, StatusDot } from "@/design/ui";
import { EmptyState, ErrorState, LoadingState } from "./States";
import { CommandHUD } from "@/components/hud/CommandHUD";
import { CheckCircle2, FileCheck, FileCode, Shield, ShieldAlert, Sparkles, Terminal } from "lucide-react";

function Disclosure() {
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-xl border border-status-degraded/30 bg-status-degraded/10 p-3 text-2xs text-text-secondary shadow-lg"
    >
      <StatusDot health="degraded" pulse />
      <p className="leading-relaxed">
        <strong className="text-text-primary">Derived-From-Run Guarantee:</strong> This reflects
        the active simulated run, not a mutable persisted ledger. The <span className="font-mono text-white">window</span> column
        corresponds to exact simulation window iterations. Re-running the identical scenario seed reproduces this exact trace deterministically.
      </p>
    </div>
  );
}

export function AuditView() {
  const { scenario } = useAppStore();
  const { data, isPending, isError, error, refetch } = useAudit(scenario);

  return (
    <div className="h-full overflow-y-auto p-6 bg-bg-base">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Floating Top HUD */}
        <CommandHUD />

        <header className="pt-2">
          <div className="flex items-center gap-2 text-text-muted text-3xs font-semibold uppercase tracking-widest">
            <FileCode className="h-4 w-4 text-accent" />
            Verification & Compliance
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight mt-0.5">
            Bounded Action Execution Audit Log
          </h1>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            Every operational action executed by ARIA carries a cryptographically verifiable decision ID,
            its causal graph deduction path, and risk calibration metrics.
          </p>
        </header>

        <Disclosure />

        {isPending && <LoadingState label="Deriving deterministic audit records from active run…" />}

        {isError && (
          <ErrorState
            message={error instanceof Error ? error.message : "Unknown error contacting /api/audit"}
            onRetry={() => refetch()}
          />
        )}

        {!isPending && !isError && data && data.entries.length === 0 && (
          <EmptyState>
            This scenario produced zero active interventions. Under noise/ambiguous conditions, ARIA safely enforced a hold policy (do_nothing) to protect merchant revenue.
          </EmptyState>
        )}

        {!isPending && !isError && data && data.entries.length > 0 && (
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-status-healthy" />
                  <span>Audited System Interventions</span>
                </div>
              }
              subtitle={`${data.entries.length} audited intervention(s) · Engine source: ${data.source}`}
              right={<Badge tone="info">{data.scenario.system.toUpperCase()}</Badge>}
            />
            <ul className="divide-y divide-white/[0.06]">
              {data.entries.map((e, i) => (
                <motion.li
                  key={e.decision_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="p-4 space-y-3 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">Window {e.window}</Badge>
                      <Badge tone="accent">{e.action_kind.replace(/_/g, " ")}</Badge>
                      <span className="font-mono text-xs font-semibold text-text-primary">
                        {e.decision_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Badge tone={e.audited ? "healthy" : "down"}>
                        {e.audited ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                        {e.audited ? "Audited & Verified" : "UNAUDITED"}
                      </Badge>
                      <span className="font-mono text-xs font-semibold text-accent tabular">
                        {(e.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                  </div>

                  {Object.keys(e.params).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(e.params).map(([k, v]) => (
                        <span
                          key={k}
                          className="rounded-lg border border-white/[0.08] bg-black/40 px-2 py-0.5 font-mono text-2xs text-text-secondary"
                        >
                          <span className="text-text-muted">{k}:</span> <strong className="text-white">{String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {e.evidence_path.length > 0 && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1">
                      <div className="text-3xs uppercase font-semibold text-text-muted tracking-wider">
                        Causal Proof Steps
                      </div>
                      <ol className="space-y-1 pt-1">
                        {e.evidence_path.map((step, j) => (
                          <li key={j} className="font-mono text-2xs text-text-secondary flex items-start gap-2">
                            <span className="text-text-muted font-bold">{j + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
