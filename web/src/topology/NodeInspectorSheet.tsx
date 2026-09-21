import * as React from "react";
import { useAppStore } from "@/lib/store";
import { useSimulate, useTopology } from "@/lib/hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  TrendingDown,
  Zap,
} from "lucide-react";
import { cn } from "@/design/ui";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TOKENS } from "@/design/tokens";

export function NodeInspectorSheet() {
  const { selectedNodeId, setSelectedNodeId, scenario } = useAppStore();
  const { data: topology } = useTopology();
  const { data: sim } = useSimulate(scenario);

  const isOpen = Boolean(selectedNodeId);

  // Find node identity in topology
  const nodeInfo = React.useMemo(() => {
    if (!selectedNodeId || !topology) return null;

    if (topology.merchant.id === selectedNodeId) {
      return { id: selectedNodeId, label: topology.merchant.label, kind: "merchant" };
    }
    const method = topology.methods.find((m) => m.id === selectedNodeId);
    if (method) return { id: method.id, label: method.label, kind: "method" };

    const psp = topology.psps.find((p) => p.id === selectedNodeId);
    if (psp) return { id: psp.id, label: psp.label, kind: "psp", bankId: psp.bank_id };

    const bank = topology.banks.find((b) => b.id === selectedNodeId);
    if (bank) return { id: bank.id, label: bank.label, kind: "bank", shared: bank.shared, psps: bank.psps };

    return { id: selectedNodeId, label: selectedNodeId, kind: "unknown" };
  }, [selectedNodeId, topology]);

  // Compute window history for this node
  const historyData = React.useMemo(() => {
    if (!selectedNodeId || !sim?.windows) return [];

    return sim.windows.map((w) => {
      let sr = 1.0;
      let vol = 100;
      let latency = 120;
      let delta = 0;

      if (nodeInfo?.kind === "bank") {
        // Infer bank performance from its PSPs
        const bankPspIds = (nodeInfo as any)?.psps ?? [];
        const pStats = w.nodes.filter((n) => bankPspIds.includes(n.node_id));
        if (pStats.length > 0) {
          sr = pStats.reduce((acc, s) => acc + s.success_rate, 0) / pStats.length;
          vol = pStats.reduce((acc, s) => acc + s.volume, 0);
          latency = pStats.reduce((acc, s) => acc + s.avg_latency_ms, 0) / pStats.length;
          delta = pStats.reduce((acc, s) => acc + s.delta, 0) / pStats.length;
        }
      } else {
        const stat = w.nodes.find((n) => n.node_id === selectedNodeId);
        if (stat) {
          sr = stat.success_rate;
          vol = stat.volume;
          latency = stat.avg_latency_ms;
          delta = stat.delta;
        }
      }

      return {
        window: `W${w.window}`,
        windowNum: w.window,
        successRate: Number((sr * 100).toFixed(1)),
        volume: vol,
        latency: Math.round(latency),
        delta: Number((delta * 100).toFixed(1)),
      };
    });
  }, [selectedNodeId, sim, nodeInfo]);

  // Current window metrics
  const latestMetric = historyData[historyData.length - 1];
  const isBreached = (latestMetric?.delta ?? 0) < -5;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setSelectedNodeId(null)}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Badge variant={isBreached ? "down" : "healthy"} className="text-3xs uppercase font-mono">
              {nodeInfo?.kind ?? "NODE"}
            </Badge>
            <span className="text-3xs font-mono text-text-muted">{selectedNodeId}</span>
          </div>
          <SheetTitle className="text-lg font-bold text-text-primary tracking-tight mt-1">
            {nodeInfo?.label}
          </SheetTitle>
          <SheetDescription className="text-xs text-text-secondary">
            Real-time telemetry and counterfactual impact analysis.
          </SheetDescription>
        </SheetHeader>

        {/* Live KPI Cards */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-left">
            <div className="text-3xs uppercase font-semibold text-text-muted">Success Rate</div>
            <div
              className={cn(
                "mt-1 font-mono text-lg font-bold tabular",
                isBreached ? "text-status-down" : "text-status-healthy"
              )}
            >
              {latestMetric?.successRate ?? 100}%
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-left">
            <div className="text-3xs uppercase font-semibold text-text-muted">Volume</div>
            <div className="mt-1 font-mono text-lg font-bold text-text-primary tabular">
              {latestMetric?.volume ?? 0} <span className="text-2xs font-normal text-text-muted">tx/w</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-left">
            <div className="text-3xs uppercase font-semibold text-text-muted">Latency</div>
            <div className="mt-1 font-mono text-lg font-bold text-text-primary tabular">
              {latestMetric?.latency ?? 120} <span className="text-2xs font-normal text-text-muted">ms</span>
            </div>
          </div>
        </div>

        {/* Historical 20-Window Sparkline */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-accent" /> 20-Window Success Profile
            </span>
            <span className="font-mono text-3xs text-text-muted">Windows 00-19</span>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="srGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isBreached ? TOKENS.status.down : TOKENS.status.healthy}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={isBreached ? TOKENS.status.down : TOKENS.status.healthy}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="windowNum" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0C0E14",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="successRate"
                  stroke={isBreached ? TOKENS.status.down : TOKENS.status.healthy}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#srGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Separator className="my-4 bg-white/[0.06]" />

        {/* Counterfactual Diagnosis & Routing Advice */}
        <div className="space-y-3">
          <div className="text-2xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-accent" /> Counterfactual Impact Analysis
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0A0C12] p-3.5 space-y-2.5 text-xs">
            {isBreached ? (
              <>
                <div className="flex items-start gap-2 text-status-down">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Active Degradation Detected:</span> Node is experiencing significant drop from baseline.
                  </div>
                </div>
                <p className="text-2xs text-text-secondary leading-relaxed pl-6">
                  ARIA graph policy recommends rerouting or isolating traffic to prevent systemic payment failure spillover.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 text-status-healthy">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Operating Within Baseline Parameters:</span> Latency and success thresholds are healthy.
                  </div>
                </div>
                <p className="text-2xs text-text-secondary leading-relaxed pl-6">
                  Traffic is flowing nominally. Node capacity is available to receive rerouted volume if required.
                </p>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
