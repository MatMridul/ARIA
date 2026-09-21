/**
 * <PaymentGraph> — the living payment topology rendered with React Flow.
 * Pure presentation: receives built nodes/edges and custom node/edge type maps.
 * Integrates NodeInspectorSheet slide-over drawer on node click.
 */
import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type ColorMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes";
import { edgeTypes } from "./edges";
import { Legend } from "./Legend";
import { useAppStore } from "@/lib/store";
import type { TopoEdge, TopoNode } from "./types";

export function PaymentGraph({
  nodes,
  edges,
  showLegend = true,
}: {
  nodes: TopoNode[];
  edges: TopoEdge[];
  showLegend?: boolean;
}) {
  const { setSelectedNodeId } = useAppStore();
  const nt = useMemo(() => nodeTypes, []);
  const et = useMemo(() => edgeTypes, []);

  return (
    <div
      className="instrument-grid relative h-full w-full select-none"
      aria-label="Payment dependency graph"
      role="img"
      onClick={() => setSelectedNodeId(null)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nt}
        edgeTypes={et}
        colorMode={"dark" as ColorMode}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll
        minZoom={0.35}
        maxZoom={1.75}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
      >
        <Background variant={BackgroundVariant.Dots} gap={36} size={1} color="rgba(255,255,255,0.06)" />
        <Controls showInteractive={false} className="!border-white/[0.08] !bg-[#0C0D12]/90 !shadow-2xl !rounded-xl overflow-hidden" />
        {showLegend && <Legend />}
      </ReactFlow>

      <div className="instrument-vignette pointer-events-none absolute inset-0" />
    </div>
  );
}
