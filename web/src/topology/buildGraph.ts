/**
 * Build React Flow nodes + edges from the static topology and the CURRENT
 * simulation window. Computes per-node 20-window history for inline micro-sparklines.
 */
import type { Health } from "@/design/ui";
import type { Attribution, SimWindow, Topology } from "@/lib";
import {
  bankHealth,
  healthFromDelta,
  methodHealth,
  pspsForMethod,
  statsById,
} from "./deriveHealth";
import { layoutPositions } from "./layout";
import type {
  BankNodeData,
  FlowEdgeData,
  MethodNodeData,
  PspNodeData,
  TopoEdge,
  TopoNode,
} from "./types";

/** Worse of two healths (down > degraded > healthy > idle). */
function worse(a: Health, b: Health): Health {
  const rank: Record<Health, number> = { idle: 0, healthy: 1, degraded: 2, down: 3 };
  return rank[a] >= rank[b] ? a : b;
}

export interface BuiltGraph {
  nodes: TopoNode[];
  edges: TopoEdge[];
}

export interface BuildInput {
  topology: Topology;
  /** current window (undefined => all-healthy baseline view) */
  win?: SimWindow;
  /** all simulation windows for history sparklines */
  windows?: SimWindow[];
  /** attribution to highlight once the incident is diagnosed (undefined => none) */
  attribution?: Attribution;
  /** reroute target PSP id, if a recovery action moved traffic (undefined => none) */
  rerouteToPsp?: string;
}

export function buildGraph({
  topology,
  win,
  windows = [],
  attribution,
  rerouteToPsp,
}: BuildInput): BuiltGraph {
  const pos = layoutPositions(topology);
  const stats = statsById(win);

  const evidencePsps = new Set(attribution?.psp_causes ?? []);
  const rootBankId =
    attribution?.root_cause_kind === "bank" ? attribution.root_cause_id : undefined;

  // Helper to extract success-rate history across windows
  function getNodeHistory(nodeId: string): number[] {
    if (!windows || windows.length === 0) return Array(20).fill(1.0);
    return windows.map((w) => {
      const s = w.nodes.find((n) => n.node_id === nodeId);
      return s?.success_rate ?? 1.0;
    });
  }

  function getBankHistory(pspIds: string[]): number[] {
    if (!windows || windows.length === 0) return Array(20).fill(1.0);
    return windows.map((w) => {
      const pStats = w.nodes.filter((n) => pspIds.includes(n.node_id));
      if (pStats.length === 0) return 1.0;
      return pStats.reduce((acc, s) => acc + s.success_rate, 0) / pStats.length;
    });
  }

  // ---- nodes ---------------------------------------------------------------
  const nodes: TopoNode[] = [];

  nodes.push({
    id: topology.merchant.id,
    type: "merchant",
    position: { x: pos[topology.merchant.id].x, y: pos[topology.merchant.id].y },
    data: { nodeId: topology.merchant.id, label: topology.merchant.label },
  });

  for (const m of topology.methods) {
    const routed = pspsForMethod(topology, m.id);
    const mStat = stats[m.id];
    const data: MethodNodeData = {
      nodeId: m.id,
      label: m.label,
      health: methodHealth(m.id, routed, stats),
      stat: mStat,
      history: getNodeHistory(m.id),
    };
    nodes.push({ id: m.id, type: "method", position: { x: pos[m.id].x, y: pos[m.id].y }, data });
  }

  for (const p of topology.psps) {
    const pStat = stats[p.id];
    const data: PspNodeData = {
      nodeId: p.id,
      label: p.label,
      bankId: p.bank_id,
      health: healthFromDelta(pStat),
      stat: pStat,
      history: getNodeHistory(p.id),
      onEvidencePath: evidencePsps.has(p.id),
      rerouteTarget: rerouteToPsp === p.id,
    };
    nodes.push({ id: p.id, type: "psp", position: { x: pos[p.id].x, y: pos[p.id].y }, data });
  }

  for (const b of topology.banks) {
    const bh = bankHealth(b.psps, stats);
    const pspStats = b.psps.map((id) => stats[id]).filter(Boolean);
    const avgSr =
      pspStats.length > 0
        ? pspStats.reduce((acc, s) => acc + s.success_rate, 0) / pspStats.length
        : undefined;

    const data: BankNodeData = {
      nodeId: b.id,
      label: b.label,
      role: b.role,
      shared: b.shared,
      pspIds: b.psps,
      health: bh.health,
      coverage: bh.coverage,
      isRootCause: rootBankId === b.id,
      avgSuccessRate: avgSr,
      history: getBankHistory(b.psps),
    };
    nodes.push({ id: b.id, type: "bank", position: { x: pos[b.id].x, y: pos[b.id].y }, data });
  }

  // ---- edges ---------------------------------------------------------------
  const edges: TopoEdge[] = [];
  const nodeHealth = new Map<string, Health>();
  for (const n of nodes) nodeHealth.set(n.id, (n.data as { health?: Health }).health ?? "healthy");

  function edgeData(from: string, to: string, opts?: Partial<FlowEdgeData>): FlowEdgeData {
    const h = worse(nodeHealth.get(from) ?? "healthy", nodeHealth.get(to) ?? "healthy");
    return { health: h, highlighted: false, reroute: false, ...opts };
  }

  // Merchant -> Method
  for (const m of topology.methods) {
    edges.push({
      id: `e-merchant-${m.id}`,
      source: topology.merchant.id,
      target: m.id,
      type: "flow",
      data: edgeData(topology.merchant.id, m.id),
    });
  }

  // Method -> PSP (per routing row)
  for (const r of topology.routing) {
    if (r.weight <= 0) continue;
    const isReroute = rerouteToPsp === r.psp_id;
    edges.push({
      id: `e-${r.method}-${r.psp_id}`,
      source: r.method,
      target: r.psp_id,
      type: "flow",
      data: edgeData(r.method, r.psp_id, { reroute: isReroute }),
    });
  }

  // PSP -> Bank (settlement)
  for (const p of topology.psps) {
    const highlighted = evidencePsps.has(p.id) && rootBankId === p.bank_id;
    edges.push({
      id: `e-${p.id}-${p.bank_id}`,
      source: p.id,
      target: p.bank_id,
      type: "flow",
      data: edgeData(p.id, p.bank_id, { highlighted }),
    });
  }

  return { nodes, edges };
}
