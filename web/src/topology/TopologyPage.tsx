/**
 * <TopologyPage> — Living cybernetic payment dependency graph surface.
 *
 * Full-bleed cybernetic viewport with:
 * - Floating top CommandHUD dock.
 * - Hardware Doppelrand nodes with multi-ring distress shockwave radars.
 * - Glowing laser particle streams with reroute bursts.
 * - Integrated 20-Window Time-Travel Scrubber.
 * - Interactive slide-over deep-dive inspection drawer on node click.
 */
import * as React from "react";
import { useMemo } from "react";
import { Badge, Button, Card, CardHeader } from "@/design/ui";
import { useAppStore, useSimulate, useTopology } from "@/lib";
import { PaymentGraph } from "./PaymentGraph";
import { SidePanel } from "./SidePanel";
import { buildGraph } from "./buildGraph";
import { CommandHUD } from "@/components/hud/CommandHUD";
import { TimeTravelScrubber } from "@/components/telemetry/TimeTravelScrubber";
import { Dna, Network, ShieldCheck, Sparkles } from "lucide-react";

export function TopologyPage() {
  const { scenario, customTopology, selectedWindow } = useAppStore();

  const topo = useTopology();
  const sim = useSimulate(scenario, topo.isSuccess);

  const windows = sim.data?.windows ?? [];
  const currentWindowIdx = Math.min(selectedWindow, Math.max(0, windows.length - 1));
  const win = windows[currentWindowIdx];

  // Has the incident been diagnosed at/through the current window?
  const diagnosed = useMemo(() => {
    if (!sim.data) return false;
    for (let i = 0; i <= currentWindowIdx && i < windows.length; i++) {
      if (windows[i]?.detection?.triggered) return true;
    }
    return false;
  }, [sim.data, windows, currentWindowIdx]);

  const attribution = diagnosed ? sim.data?.attribution : undefined;

  // Reroute target PSP if action is reroute and past the recovery window
  const rerouteToPsp = useMemo(() => {
    if (!sim.data || !diagnosed) return undefined;
    const act = sim.data.action;
    if (act.kind !== "reroute") return undefined;
    const past2of3 = currentWindowIdx >= Math.floor((windows.length * 2) / 3);
    if (!past2of3) return undefined;
    const to = act.params["to_psp"];
    return typeof to === "string" ? to : undefined;
  }, [sim.data, diagnosed, currentWindowIdx, windows.length]);

  const topologyData = customTopology || topo.data;

  const graph = useMemo(() => {
    if (!topologyData) return { nodes: [], edges: [] };
    return buildGraph({
      topology: topologyData,
      win,
      windows,
      attribution,
      rerouteToPsp,
    });
  }, [topologyData, win, windows, attribution, rerouteToPsp]);

  if (topo.isLoading) {
    return (
      <div className="grid h-full place-items-center bg-bg-base p-8">
        <div className="flex flex-col items-center gap-3">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-xs font-mono text-text-muted">Synthesizing payment topology lattice…</span>
        </div>
      </div>
    );
  }

  if (topo.isError || !topologyData) {
    return (
      <div className="grid h-full place-items-center bg-bg-base p-8">
        <Card className="max-w-md p-6 text-center space-y-4">
          <h3 className="text-sm font-bold text-status-down">Topology Initialization Failed</h3>
          <p className="text-xs text-text-secondary">{(topo.error as Error)?.message ?? "Unable to fetch payment nodes."}</p>
          <Button variant="default" onClick={() => topo.refetch()}>
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg-base overflow-hidden relative">
      {/* Floating Glass HUD Dock */}
      <div className="absolute top-4 left-5 right-5 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <CommandHUD />
        </div>
      </div>

      {/* Main Canvas & Side Intelligence Panel */}
      <div className="flex min-h-0 flex-1 relative">
        <div className="relative min-w-0 flex-1">
          {scenario.incident_type === "A_shared_bank" && (
            <div className="absolute top-20 left-6 z-10 pointer-events-none">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/70 px-3 py-1.5 backdrop-blur-md shadow-2xl">
                <Badge tone="accent" className="text-3xs uppercase font-mono">
                  Thesis Benchmark
                </Badge>
                <span className="text-2xs text-text-secondary">
                  Shared dependency <strong className="text-white">Bank-A</strong> causes correlated dual PSP failure.
                </span>
              </div>
            </div>
          )}

          <PaymentGraph nodes={graph.nodes} edges={graph.edges} />

          {/* Bottom Time-Travel Scrubber Dock */}
          <div className="absolute bottom-4 left-6 right-6 z-20 pointer-events-none">
            <div className="pointer-events-auto max-w-4xl mx-auto shadow-2xl">
              <TimeTravelScrubber />
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="w-80 shrink-0 border-l border-white/[0.06] bg-[#07080C]/95 backdrop-blur-xl overflow-y-auto hidden xl:block">
          <SidePanel sim={sim.data} win={win} attribution={attribution} />
        </div>
      </div>
    </div>
  );
}
