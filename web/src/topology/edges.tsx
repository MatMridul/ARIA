/**
 * Semantic-motion traffic edge — ARIA's visual signature.
 *
 * Traffic "particles" flow from source to target along the edge path using SVG
 * <animateMotion> (GPU-friendly, declarative). Speed encodes health:
 *   healthy  -> fast flow (money moving)
 *   degraded -> slow sluggish flow (payments struggling)
 *   down     -> NO particles (flow stopped, dashed line)
 *   reroute  -> rapid emerald burst (mitigation active)
 */
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { Health } from "@/design/ui";
import { HEALTH_HEX, TOKENS } from "@/design/tokens";
import type { FlowEdgeData } from "./types";

const DUR: Record<Health, number> = {
  healthy: 1.8, // brisk
  degraded: 4.5, // sluggish
  down: 0, // stopped
  idle: 3.0,
};

export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const d = (data ?? {}) as FlowEdgeData;
  const health: Health = d.health ?? "idle";
  const highlighted = !!d.highlighted;
  const reroute = !!d.reroute;

  // Particle timing & counts
  const dur = reroute ? 1.0 : DUR[health];
  const particlesCount = reroute ? 3 : 2;
  const showParticles = dur > 0;

  const baseColor = highlighted
    ? TOKENS.status.accent
    : reroute
    ? TOKENS.status.healthy
    : HEALTH_HEX[health];

  const width = highlighted || reroute ? 2.5 : health === "down" ? 1.2 : 1.5;
  const opacity = health === "down" ? 0.3 : 0.85;

  return (
    <>
      {/* Background glow stroke on highlighted / rerouted paths */}
      {(highlighted || reroute) && (
        <path
          d={edgePath}
          fill="none"
          stroke={baseColor}
          strokeWidth={6}
          opacity={0.25}
          className="blur-sm"
        />
      )}

      {/* Main Base Edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: baseColor,
          strokeWidth: width,
          opacity,
          strokeDasharray: health === "down" ? "4 4" : undefined,
          transition: "stroke 0.3s ease, opacity 0.3s ease",
        }}
      />

      {/* SVG Animated Particles */}
      {showParticles &&
        Array.from({ length: particlesCount }).map((_, i) => (
          <circle
            key={`${id}-p${i}`}
            r={reroute ? 3.5 : highlighted ? 3 : 2.2}
            fill={baseColor}
            opacity={0.95}
            style={{
              filter: reroute
                ? "drop-shadow(0 0 6px rgba(16, 185, 129, 0.9))"
                : highlighted
                ? "drop-shadow(0 0 6px rgba(99, 102, 241, 0.9))"
                : `drop-shadow(0 0 4px ${baseColor})`,
            }}
          >
            <animateMotion
              dur={`${dur}s`}
              begin={`${(dur / particlesCount) * i}s`}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
        ))}
    </>
  );
}

export const edgeTypes = { flow: FlowEdge };
