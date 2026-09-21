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
import { Button } from "@/components/ui/button";
import { inr, cn } from "@/design/ui";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Network,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  TrendingDown,
  XCircle,
  Zap,
} from "lucide-react";

export function NodeInspectorDrawer() {
  const {
    selectedNodeId,
    setSelectedNodeId,
    inspectorOpen,
    setInspectorOpen,
    scenario,
    selectedWindow,
  } = useAppStore();
  const topo = useTopology();
  const sim = useSimulate(scenario);

  const safeNodeId = selectedNodeId || "";
  const nodeName = safeNodeId.toUpperCase();
  const isBank = safeNodeId.startsWith("bank-");
  const isPsp = safeNodeId.startsWith("psp-");
  const isMethod = safeNodeId.startsWith("method-");

  const incident = sim.data?.incident;
  const attr = sim.data?.attribution;
  const rep = sim.data?.windows[selectedWindow];

  // Determine if this node is currently faulted or breached
  const isRootCause = attr?.root_cause_id?.toLowerCase() === safeNodeId.toLowerCase();
  const isBreached = rep?.detection?.dropped_nodes?.includes(safeNodeId);
  const isRerouted = safeNodeId === "psp-3";

  const nodeType = isBank ? "Clearing Bank" : isPsp ? "Payment Aggregator (PSP)" : "Method Rail";

  // Mock live transaction log entries for deep realism (unconditionally called hook)
  const mockLogs = React.useMemo(() => {
    if (!safeNodeId) return [];
    const logs = [];
    const baseTime = Date.now() - 30000;
    for (let i = 0; i < 8; i++) {
      const timeStr = new Date(baseTime + i * 3800).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const txId = `tx_${Math.random().toString(36).substring(2, 9)}`;
      const amount = (Math.floor(Math.random() * 45) + 5) * 100;

      if (isBreached || isRootCause) {
        logs.push({
          time: timeStr,
          id: txId,
          amount: `₹${amount}`,
          status: i % 3 === 0 ? 200 : 504,
          statusText: i % 3 === 0 ? "200 OK" : "504 GATEWAY_TIMEOUT",
          latency: i % 3 === 0 ? "340ms" : "2,840ms",
        });
      } else {
        logs.push({
          time: timeStr,
          id: txId,
          amount: `₹${amount}`,
          status: 200,
          statusText: "200 OK",
          latency: `${Math.floor(Math.random() * 120) + 140}ms`,
        });
      }
    }
    return logs;
  }, [safeNodeId, isBreached, isRootCause, selectedWindow]);

  const isOpen = Boolean(selectedNodeId && inspectorOpen);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setInspectorOpen(open);
        if (!open) setSelectedNodeId(null);
      }}
    >
      <SheetContent side="right" className="w-[420px] sm:w-[480px] bg-[#0A0C16]/98 border-white/[0.12] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                {isBank ? <Building2 className="h-4 w-4" /> : isPsp ? <Server className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{nodeName || "NODE INSPECTION"}</span>
                  <Badge variant={isRootCause || isBreached ? "down" : "healthy"} className="text-3xs font-mono uppercase">
                    {isRootCause ? "Root Cause" : isBreached ? "Degraded" : isRerouted ? "Reroute Target" : "Nominal"}
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-2xs text-text-muted mt-0.5">
                  {nodeType} · Hardware Chip Forensics
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-text-secondary">
          {/* Section 1: Telemetry Latency Meters */}
          <div className="space-y-2">
            <div className="text-3xs uppercase font-semibold text-text-muted tracking-wider flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-accent" /> Latency & SLA Health
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-3xs text-text-muted block">P50 Latency</span>
                <span className="font-mono text-sm font-bold text-white mt-0.5 block">
                  {isBreached ? "840ms" : "165ms"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-3xs text-text-muted block">P95 Latency</span>
                <span className="font-mono text-sm font-bold text-status-degraded mt-0.5 block">
                  {isBreached ? "2,420ms" : "320ms"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-3xs text-text-muted block">Success Rate</span>
                <span className={cn("font-mono text-sm font-bold mt-0.5 block", isBreached ? "text-status-down" : "text-status-healthy")}>
                  {isBreached ? "42.0%" : "99.8%"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Error Code Distribution */}
          <div className="space-y-2">
            <div className="text-3xs uppercase font-semibold text-text-muted tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3 w-3 text-status-degraded" /> Error Code Distribution (W{selectedWindow})
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              {isBreached ? (
                <>
                  <div className="flex justify-between text-2xs font-mono">
                    <span className="text-status-down">HTTP 504 GATEWAY_TIMEOUT</span>
                    <span className="font-bold text-white">58.0% (1,420 errors)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden flex">
                    <div className="bg-status-down h-full w-[58%]" />
                    <div className="bg-status-degraded h-full w-[12%]" />
                    <div className="bg-status-healthy h-full w-[30%]" />
                  </div>
                  <div className="flex justify-between text-3xs text-text-muted pt-1">
                    <span>Upstream Acquirer Core Timeout</span>
                    <span className="text-status-healthy">30% Nominal Settled</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-2xs font-mono text-status-healthy">
                  <span>HTTP 200 OK (Nominal Baseline)</span>
                  <span>99.8%</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Relational Topology Connections */}
          <div className="space-y-2">
            <div className="text-3xs uppercase font-semibold text-text-muted tracking-wider flex items-center gap-1.5">
              <Network className="h-3 w-3 text-accent" /> Relational Graph Topology
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-2xs font-mono">
              {isPsp ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Primary Upstream Bank:</span>
                    <strong className="text-white">
                      {safeNodeId === "psp-3" ? "Bank-B (ICICI)" : "Bank-A (HDFC)"}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Supported Rails:</span>
                    <span className="text-text-secondary">UPI, Card, NetBanking</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Current ARIA Policy:</span>
                    <strong className={safeNodeId === "psp-3" ? "text-status-healthy" : "text-status-down"}>
                      {safeNodeId === "psp-3" ? "100% TRAFFIC ACTIVE" : "0% BYPASSED"}
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Connected Gateways:</span>
                    <span className="text-white">
                      {safeNodeId === "bank-a" ? "PSP-1, PSP-2" : "PSP-3"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Clearing Rail:</span>
                    <span className="text-text-secondary">Core Banking System (CBS)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Correlation Status:</span>
                    <strong className={isRootCause ? "text-status-down" : "text-status-healthy"}>
                      {isRootCause ? "100% Causal Root Cause" : "Zero Spillover (Nominal)"}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 4: Live Simulated HTTP Transaction Stream */}
          <div className="space-y-2">
            <div className="text-3xs uppercase font-semibold text-text-muted tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-status-healthy" /> Live Transaction Stream
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] text-status-healthy">
                <span className="h-1.5 w-1.5 rounded-full bg-status-healthy animate-pulse" /> LIVE
              </span>
            </div>
            <div className="rounded-xl bg-black/60 border border-white/[0.08] p-2.5 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
              {mockLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-0.5 border-b border-white/[0.03] last:border-0">
                  <span className="text-text-muted">{log.time}</span>
                  <span className="text-text-secondary">{log.id}</span>
                  <span className="text-white font-bold">{log.amount}</span>
                  <span className={log.status === 200 ? "text-status-healthy" : "text-status-down font-bold"}>
                    {log.statusText}
                  </span>
                  <span className="text-text-muted">{log.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between">
          <span className="text-3xs text-text-muted font-mono">
            Node ID: {safeNodeId}
          </span>
          <Button
            variant="glass"
            size="xs"
            onClick={() => {
              setInspectorOpen(false);
              setSelectedNodeId(null);
            }}
            className="text-xs"
          >
            Close Inspector (Esc)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
