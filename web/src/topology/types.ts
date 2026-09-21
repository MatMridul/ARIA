/** Internal typed data carried on React Flow nodes/edges for the topology graph. */
import type { Node, Edge } from "@xyflow/react";
import type { Health } from "@/design/ui";
import type { NodeStat } from "@/lib/schemas";

export interface MerchantNodeData extends Record<string, unknown> {
  nodeId: string;
  label: string;
}

export interface MethodNodeData extends Record<string, unknown> {
  nodeId: string;
  label: string;
  health: Health;
  stat?: NodeStat;
  history?: number[];
}

export interface PspNodeData extends Record<string, unknown> {
  nodeId: string;
  label: string;
  bankId: string;
  health: Health;
  stat?: NodeStat;
  history?: number[];
  /** part of the highlighted attribution evidence path */
  onEvidencePath: boolean;
  /** a healthy reroute target during recovery */
  rerouteTarget: boolean;
}

export interface BankNodeData extends Record<string, unknown> {
  nodeId: string;
  label: string;
  role: string;
  shared: boolean;
  pspIds: string[];
  health: Health;
  /** fraction of this bank's PSPs currently breached (0..1) */
  coverage: number;
  /** this bank is the attributed root cause of the active incident */
  isRootCause: boolean;
  /** aggregate inferred stats from child PSPs */
  avgSuccessRate?: number;
  history?: number[];
}

export type TopoNode =
  | Node<MerchantNodeData, "merchant">
  | Node<MethodNodeData, "method">
  | Node<PspNodeData, "psp">
  | Node<BankNodeData, "bank">;

export interface FlowEdgeData extends Record<string, unknown> {
  /** edge health drives particle speed: healthy=fast, degraded=slow, down=stopped */
  health: Health;
  /** on the highlighted attribution evidence path */
  highlighted: boolean;
  /** this edge is a live reroute (traffic moved here) */
  reroute: boolean;
  /** volume flow */
  volume?: number;
}

export type TopoEdge = Edge<FlowEdgeData>;
