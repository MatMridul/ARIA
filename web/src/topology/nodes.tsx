/**
 * ARIA Precision Hardware Node Engine.
 *
 * Implements authentic industrial switchboard chips with:
 * - Matte anthracite substrate with 1px specular top highlights and micro-bezel framing.
 * - Real-time embedded 20-window micro-sparkline waveform on each chip face.
 * - Solid state optical status LEDs with calibrated glow falloff.
 * - Non-shifting tabular telemetry (Success Rate, Signed Delta %, Window Volume).
 * - Interactive slide-over deep-dive inspection on click.
 */
import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn, type Health } from "@/design/ui";
import { useAppStore } from "@/lib/store";
import { TOKENS } from "@/design/tokens";
import {
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  Building2,
  Store,
  Sparkles,
  Zap,
} from "lucide-react";
import type {
  MerchantNodeData,
  MethodNodeData,
  PspNodeData,
  BankNodeData,
} from "./types";

const HEALTH_COLORS: Record<Health, { bg: string; text: string; border: string; glow: string; dot: string; stroke: string }> = {
  healthy: {
    bg: "bg-status-healthy/10",
    text: "text-status-healthy",
    border: "border-status-healthy/40",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    dot: "bg-status-healthy",
    stroke: "#10B981",
  },
  degraded: {
    bg: "bg-status-degraded/10",
    text: "text-status-degraded",
    border: "border-status-degraded/50",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.25)]",
    dot: "bg-status-degraded",
    stroke: "#F59E0B",
  },
  down: {
    bg: "bg-status-down/15",
    text: "text-status-down",
    border: "border-status-down/70",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.35)]",
    dot: "bg-status-down",
    stroke: "#EF4444",
  },
  idle: {
    bg: "bg-white/[0.02]",
    text: "text-text-muted",
    border: "border-white/[0.08]",
    glow: "",
    dot: "bg-white/30",
    stroke: "#64748B",
  },
};

/** High-precision embedded micro-sparkline SVG */
function NodeSparkline({
  history = [],
  health,
  width = 64,
  height = 16,
}: {
  history?: number[];
  health: Health;
  width?: number;
  height?: number;
}) {
  if (!history || history.length === 0) return null;

  const strokeColor = HEALTH_COLORS[health].stroke;
  const max = 1.0;
  const min = 0.0;
  const range = max - min || 1;

  const points = history
    .map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible opacity-85">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/** Master Industrial Hardware Chip Enclosure */
function HardwareChip({
  nodeId,
  health,
  width,
  emphasize,
  isRootCause,
  children,
}: {
  nodeId: string;
  health: Health;
  width: number;
  emphasize?: boolean;
  isRootCause?: boolean;
  children: React.ReactNode;
}) {
  const { selectedNodeId, setSelectedNodeId } = useAppStore();
  const isSelected = selectedNodeId === nodeId;
  const colors = HEALTH_COLORS[health];

  return (
    <div
      style={{ width }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNodeId(nodeId);
      }}
      className={cn(
        "relative cursor-pointer select-none transition-all duration-150 rounded-xl p-[1.5px]",
        isRootCause
          ? "bg-gradient-to-b from-status-down via-status-down/40 to-status-down/10 shadow-[0_0_24px_rgba(239,68,68,0.35)] ring-1 ring-status-down/60"
          : isSelected
          ? "bg-gradient-to-b from-accent via-accent/50 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.35)] ring-1 ring-accent"
          : emphasize
          ? "bg-gradient-to-b from-indigo-400/50 via-indigo-500/20 to-transparent shadow-[0_0_14px_rgba(99,102,241,0.25)]"
          : "bg-white/[0.08] hover:bg-white/[0.15]"
      )}
    >
      {/* Inner Matte Obsidian Substrate */}
      <div
        className={cn(
          "relative rounded-[10px] bg-[#0A0C12] p-2.5 backdrop-blur-md border border-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
          colors.glow,
          isSelected && "bg-[#0F121C]"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Header Row with Type, ID, and Optical LED */
function ChipHeader({
  type,
  id,
  health,
  icon: Icon,
}: {
  type: string;
  id: string;
  health: Health;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colors = HEALTH_COLORS[health];

  return (
    <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-white/[0.05]">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-text-muted" />
        <span className="text-3xs uppercase font-semibold tracking-wider text-text-muted">
          {type}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-3xs text-text-muted tabular">{id}</span>
        {/* Optical Solid LED */}
        <span className="relative flex h-2 w-2">
          {health === "down" && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-status-down opacity-60 animate-ping" />
          )}
          <span className={cn("relative inline-flex rounded-full h-2 w-2 shadow-[0_0_5px_currentColor]", colors.dot)} />
        </span>
      </div>
    </div>
  );
}

// ---------------- Merchant Node ----------------
export function MerchantNode({ data }: NodeProps) {
  const d = data as MerchantNodeData;
  return (
    <HardwareChip nodeId={d.nodeId || "merchant"} health="healthy" width={160}>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-white/40 shadow-[0_0_6px_white]"
      />
      <ChipHeader type="Checkout" id="MX-01" health="healthy" icon={Store} />
      <div className="mt-1.5">
        <div className="text-xs font-semibold text-text-primary truncate">{d.label}</div>
        <div className="mt-1 flex items-center justify-between text-3xs text-text-muted font-mono">
          <span>Ingress Terminal</span>
          <span className="text-status-healthy font-semibold">100% Active</span>
        </div>
      </div>
    </HardwareChip>
  );
}

// ---------------- Method Node ----------------
export function MethodNode({ data }: NodeProps) {
  const d = data as MethodNodeData;
  const colors = HEALTH_COLORS[d.health];
  const sr = d.stat?.success_rate != null ? (d.stat.success_rate * 100).toFixed(1) + "%" : "100.0%";
  const delta = d.stat?.delta != null ? (d.stat.delta * 100).toFixed(1) + "%" : "0.0%";

  return (
    <HardwareChip nodeId={d.nodeId || d.label} health={d.health} width={160}>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-white/40 shadow-[0_0_6px_white]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-white/40 shadow-[0_0_6px_white]"
      />
      <ChipHeader type="Rail" id={d.label.toUpperCase()} health={d.health} icon={Layers} />
      <div className="mt-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary truncate">{d.label}</span>
          <span className={cn("font-mono text-xs font-bold tabular", colors.text)}>
            {sr}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between text-3xs">
          <NodeSparkline history={d.history} health={d.health} width={55} height={12} />
          {d.stat && (
            <span
              className={cn(
                "font-mono font-medium tabular",
                d.stat.delta < 0 ? "text-status-down" : "text-status-healthy"
              )}
            >
              {d.stat.delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
      </div>
    </HardwareChip>
  );
}

// ---------------- PSP Node ----------------
export function PspNode({ data }: NodeProps) {
  const d = data as PspNodeData;
  const colors = HEALTH_COLORS[d.health];
  const idNum = d.label.replace(/\D/g, "");
  const sr = d.stat?.success_rate != null ? (d.stat.success_rate * 100).toFixed(1) + "%" : "100.0%";
  const delta = d.stat?.delta != null ? (d.stat.delta * 100).toFixed(1) + "%" : "0.0%";

  return (
    <HardwareChip
      nodeId={d.nodeId || d.label}
      health={d.health}
      width={175}
      emphasize={d.onEvidencePath || d.rerouteTarget}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-white/40 shadow-[0_0_6px_white]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-white/40 shadow-[0_0_6px_white]"
      />
      <ChipHeader type="Gateway" id={`PSP-${idNum}`} health={d.health} icon={Activity} />
      <div className="mt-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary truncate">{d.label}</span>
          <span className={cn("font-mono text-xs font-bold tabular", colors.text)}>
            {sr}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between text-3xs">
          <NodeSparkline history={d.history} health={d.health} width={62} height={12} />

          {d.onEvidencePath ? (
            <span className="inline-flex items-center gap-0.5 text-3xs font-semibold uppercase tracking-wider text-accent bg-accent/15 px-1.5 py-0.2 rounded">
              Evidence
            </span>
          ) : d.rerouteTarget ? (
            <span className="inline-flex items-center gap-0.5 text-3xs font-semibold uppercase tracking-wider text-status-healthy bg-status-healthy/15 px-1.5 py-0.2 rounded">
              Bypass →
            </span>
          ) : d.stat ? (
            <span
              className={cn(
                "font-mono font-medium tabular",
                d.stat.delta < 0 ? "text-status-down" : "text-status-healthy"
              )}
            >
              {d.stat.delta > 0 ? `+${delta}` : delta}
            </span>
          ) : null}
        </div>
      </div>
    </HardwareChip>
  );
}

// ---------------- Bank Node ----------------
export function BankNode({ data }: NodeProps) {
  const d = data as BankNodeData;
  const colors = HEALTH_COLORS[d.health];

  return (
    <div className="relative">
      <HardwareChip
        nodeId={d.nodeId || d.label}
        health={d.health}
        width={200}
        emphasize={d.shared}
        isRootCause={d.isRootCause}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2 !w-2 !border-0 !bg-white/40 shadow-[0_0_6px_white]"
        />
        <ChipHeader
          type={`Acquirer · ${d.role}`}
          id={d.label.replace(/\s+/g, "").toUpperCase()}
          health={d.health}
          icon={Building2}
        />

        <div className="mt-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary truncate">{d.label}</span>
            {d.isRootCause ? (
              <span className="inline-flex items-center gap-1 text-3xs font-bold uppercase tracking-wider text-status-down bg-status-down/20 border border-status-down/50 px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                Root Cause
              </span>
            ) : d.avgSuccessRate != null ? (
              <span className={cn("font-mono text-xs font-bold tabular", colors.text)}>
                {(d.avgSuccessRate * 100).toFixed(1)}%
              </span>
            ) : null}
          </div>

          <div className="mt-1.5 flex items-center justify-between border-t border-white/[0.05] pt-1 text-3xs">
            <NodeSparkline history={d.history} health={d.health} width={75} height={12} />

            {d.shared ? (
              <span className="text-status-info font-medium flex items-center gap-1 font-mono">
                Shared ({d.pspIds.length} PSPs)
              </span>
            ) : (
              <span className="text-text-muted font-mono">{d.pspIds.length} PSP Rail</span>
            )}
          </div>
        </div>
      </HardwareChip>
    </div>
  );
}

export const nodeTypes = {
  merchant: MerchantNode,
  method: MethodNode,
  psp: PspNode,
  bank: BankNode,
};
