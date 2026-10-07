/** TanStack Query hooks — the typed data seam feature folders consume. */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAudit,
  fetchEvaluation,
  fetchIncidents,
  fetchSimulate,
  fetchTopology,
} from "./client";
import { useAppStore } from "./store";
import type { LiveVerdict, SimulateRequest } from "./schemas";

export function useTopology() {
  return useQuery({ queryKey: ["topology"], queryFn: fetchTopology, staleTime: Infinity });
}

export function useSimulate(req: SimulateRequest, enabled = true) {
  return useQuery({
    queryKey: ["simulate", req],
    queryFn: () => fetchSimulate(req),
    enabled,
    staleTime: Infinity, // deterministic per (type,seed,threshold,system)
  });
}

export function useEvaluation(seeds?: number[], thresholds?: number[]) {
  return useQuery({
    queryKey: ["evaluation", seeds, thresholds],
    queryFn: () => fetchEvaluation(seeds, thresholds),
    staleTime: Infinity,
  });
}

export function useIncidents() {
  return useQuery({ queryKey: ["incidents"], queryFn: fetchIncidents, staleTime: Infinity });
}

export function useAudit(req: SimulateRequest, enabled = true) {
  return useQuery({
    queryKey: ["audit", req],
    queryFn: () => fetchAudit(req),
    enabled,
    staleTime: Infinity,
  });
}

export function useLiveTelemetryStream() {
  const isLiveMode = useAppStore((s) => s.isLiveMode);
  const setLiveVerdict = useAppStore((s) => s.setLiveVerdict);
  const setLiveStreamConnected = useAppStore((s) => s.setLiveStreamConnected);

  useEffect(() => {
    if (!isLiveMode) {
      setLiveStreamConnected(false);
      return;
    }

    const eventSource = new EventSource("/api/telemetry/stream");

    eventSource.onopen = () => {
      setLiveStreamConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "initial" || payload.type === "verdict" || payload.type === "reset") {
          setLiveVerdict(payload.verdict as LiveVerdict);
        }
      } catch (err) {
        console.error("Failed to parse live telemetry stream event:", err);
      }
    };

    eventSource.onerror = () => {
      setLiveStreamConnected(false);
    };

    return () => {
      eventSource.close();
      setLiveStreamConnected(false);
    };
  }, [isLiveMode, setLiveVerdict, setLiveStreamConnected]);
}
