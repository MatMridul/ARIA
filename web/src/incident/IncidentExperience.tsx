/**
 * Incident / Root Cause Analysis / Recovery experience.
 * Features CommandHUD, Doppelrand cards, ProofMatrix, and live simulation feeds.
 */
import { useMemo } from "react";
import { Badge, Card, CardHeader } from "@/design/ui";
import { useAppStore, useSimulate, type SimulateRequest } from "@/lib";
import { INCIDENT_META } from "./helpers";
import { IncidentTimeline } from "./IncidentTimeline";
import { RecoveryConsole } from "./RecoveryConsole";
import { ComparisonMini } from "./ComparisonMini";
import { CommandHUD } from "@/components/hud/CommandHUD";
import { ProofMatrix } from "@/components/telemetry/ProofMatrix";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SimulatedDisclosure,
} from "./States";
import { Dna, ShieldAlert, Sparkles } from "lucide-react";

export function IncidentExperience() {
  const { scenario } = useAppStore();

  const req: SimulateRequest = useMemo(
    () => ({ ...scenario, system: "ariadne" }),
    [scenario]
  );

  const { data, isLoading, isFetching, error, refetch } = useSimulate(req);
  const meta = INCIDENT_META[scenario.incident_type];

  return (
    <div className="h-full overflow-y-auto p-6 bg-bg-base">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Floating Top HUD */}
        <CommandHUD />

        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Dna className="h-4 w-4 text-accent" />
                <span>Incident Forensic Diagnostic Console</span>
              </div>
            }
            subtitle="Causal proof trajectory: anomaly detection → graph deduction → policy execution → financial yield realization."
            right={meta.isThesis ? <Badge tone="accent">★ Thesis Scenario</Badge> : undefined}
          />
          <div className="space-y-3 p-5">
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 space-y-1">
              <span className="text-3xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-status-healthy" /> Benchmark Operational Invariant
              </span>
              <p className="text-xs text-text-secondary leading-relaxed font-mono">{meta.correct}</p>
            </div>
            <SimulatedDisclosure />
          </div>
        </Card>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data ? (
          <EmptyState label="No simulation trace generated yet." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card className="p-6">
              <IncidentTimeline res={data} />
            </Card>
            <div className="space-y-6">
              <ProofMatrix />
              <div className="doppelrand rounded-2xl">
                <div className="doppelrand-inner">
                  <RecoveryConsole
                    action={data.action}
                    moneyRecovered={data.money_recovered}
                  />
                </div>
              </div>
              <ComparisonMini res={data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
