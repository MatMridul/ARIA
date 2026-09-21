/**
 * <CommandTopology> — the living payment graph as an EMBEDDABLE instrument for the
 * Command Center. Unlike the full TopologyPage (which owns scenario controls + a
 * side panel), this renders just the graph, driven from a SimulateResponse passed
 * in by the composing page. It runs its own window playback and — critically —
 * opens on the DIAGNOSED frame (the representative window where the thesis is
 * visible), then lets the operator play/scrub. Pure composition of existing
 * topology building blocks; no new data logic, no fabrication.
 */
import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import type { SimulateResponse, Topology } from "@/lib";
import { PaymentGraph } from "./PaymentGraph";
import { buildGraph } from "./buildGraph";

export function CommandTopology({
  topology,
  sim,
}: {
  topology: Topology;
  sim: SimulateResponse;
}) {
  const { selectedWindow } = useAppStore();
  const windows = sim.windows;
  const currentIdx = Math.min(Math.max(0, selectedWindow), windows.length - 1);
  const win = windows[currentIdx];

  // Reveal attribution once detection has fired at/through the current window.
  const diagnosed = useMemo(() => {
    for (let i = 0; i <= currentIdx && i < windows.length; i++) {
      if (windows[i]?.detection.triggered) return true;
    }
    return false;
  }, [windows, currentIdx]);

  const attribution = diagnosed ? sim.attribution : undefined;

  const rerouteToPsp = useMemo(() => {
    if (!diagnosed || sim.action.kind !== "reroute") return undefined;
    const past = currentIdx >= Math.floor((windows.length * 2) / 3);
    if (!past) return undefined;
    const to = sim.action.params["to_psp"];
    return typeof to === "string" ? to : undefined;
  }, [diagnosed, sim.action, currentIdx, windows.length]);

  const graph = useMemo(
    () => buildGraph({ topology, win, windows, attribution, rerouteToPsp }),
    [topology, win, windows, attribution, rerouteToPsp]
  );

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
        <PaymentGraph nodes={graph.nodes} edges={graph.edges} showLegend={false} />
      </div>
    </div>
  );
}
