"""Real-time sliding window buffer for live transaction telemetry ingestion.

Maintains an in-memory sliding time window of atomic payment events, computes
dynamic node statistics, maintains per-PSP circuit breakers, and triggers
real-time set-theoretic attribution and policy generation.
"""

from __future__ import annotations

import threading
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from ariadne.decide.actions import Action
from ariadne.decide.circuit_breaker import CircuitBreaker, CircuitState
from ariadne.decide.policy import select_action
from ariadne.diagnosis.attribute import Attribution, attribute
from ariadne.diagnosis.detect import Detection, detect
from ariadne.model.entities import Method, Transaction
from ariadne.model.graph import PaymentGraph, default_graph
from ariadne.observe.aggregate import NodeStats

_DEFAULT_DETECT_THRESHOLD = 0.15
_DEFAULT_INTERVENTION_THRESHOLD = 0.70


@dataclass
class TelemetryEvent:
    transaction_id: str
    amount: float
    method: str          # "card" | "upi" | "netbanking"
    psp_id: str          # "psp_1", "psp_2", "stripe", etc.
    bank_id: str         # "bank_A", "bank_B", etc.
    success: bool
    latency_ms: float = 50.0
    failure_code: Optional[str] = None
    timestamp: float = field(default_factory=time.time)
    cohort: str = "live"
    geography: str = "US"


@dataclass
class LiveEvaluationVerdict:
    timestamp: float
    total_events: int
    window_duration_seconds: float
    overall_success_rate: float
    detection: Detection
    attribution: Attribution
    recommended_action: Action
    circuit_states: Dict[str, str]
    node_stats: Dict[str, dict]


class StreamingTelemetryBuffer:
    """Thread-safe sliding window buffer and live evaluator."""

    def __init__(
        self,
        graph: Optional[PaymentGraph] = None,
        window_size_seconds: float = 60.0,
        detect_threshold: float = _DEFAULT_DETECT_THRESHOLD,
        intervention_threshold: float = _DEFAULT_INTERVENTION_THRESHOLD,
    ) -> None:
        self.graph = graph or default_graph()
        self.window_size_seconds = window_size_seconds
        self.detect_threshold = detect_threshold
        self.intervention_threshold = intervention_threshold

        self._lock = threading.Lock()
        self._events: deque[TelemetryEvent] = deque()
        self._historical_baselines: Dict[str, float] = {}

        # Initialize CircuitBreakers for all known PSPs in graph
        self._circuit_breakers: Dict[str, CircuitBreaker] = {
            psp: CircuitBreaker(gateway_id=psp) for psp in self.graph.psps
        }

    def reset(self) -> None:
        """Clear all buffered telemetry and reset circuit breakers."""
        with self._lock:
            self._events.clear()
            self._historical_baselines.clear()
            for cb in self._circuit_breakers.values():
                cb.state = CircuitState.CLOSED
                cb.failure_count = 0
                cb.success_count = 0

    def ingest(self, event: TelemetryEvent) -> LiveEvaluationVerdict:
        """Ingests a single transaction event and returns the live evaluation verdict."""
        return self.ingest_batch([event])

    def ingest_batch(self, events: List[TelemetryEvent]) -> LiveEvaluationVerdict:
        """Ingests a batch of transaction events atomically."""
        now = time.time()
        with self._lock:
            for ev in events:
                self._events.append(ev)
                
                # Update CircuitBreaker for the corresponding PSP
                if ev.psp_id in self._circuit_breakers:
                    cb = self._circuit_breakers[ev.psp_id]
                    if ev.success:
                        cb.record_success()
                    else:
                        cb.record_failure()

            # Evict events older than window_size_seconds
            cutoff = now - self.window_size_seconds
            while self._events and self._events[0].timestamp < cutoff:
                self._events.popleft()

            # Run real-time evaluation over active sliding window
            return self._evaluate_locked(now)

    def get_current_verdict(self) -> LiveEvaluationVerdict:
        """Inspects current sliding window without ingesting new events."""
        now = time.time()
        with self._lock:
            # Evict stale events first
            cutoff = now - self.window_size_seconds
            while self._events and self._events[0].timestamp < cutoff:
                self._events.popleft()
            return self._evaluate_locked(now)

    def _evaluate_locked(self, now: float) -> LiveEvaluationVerdict:
        total_events = len(self._events)
        if total_events == 0:
            detection = Detection(triggered=False, dropped_nodes=[], window=0)
            attribution = Attribution(root_cause_id="", root_cause_kind="none", confidence=0.0)
            action = select_action(attribution, self.graph, {}, self.intervention_threshold)
            return LiveEvaluationVerdict(
                timestamp=now,
                total_events=0,
                window_duration_seconds=self.window_size_seconds,
                overall_success_rate=1.0,
                detection=detection,
                attribution=attribution,
                recommended_action=action,
                circuit_states={p: cb.state.value for p, cb in self._circuit_breakers.items()},
                node_stats={},
            )

        # 1. Compute Success & Volume aggregates per PSP and per Method
        psp_counts: Dict[str, Tuple[int, int, float]] = {}  # psp -> (successes, total, lat_sum)
        method_counts: Dict[str, Tuple[int, int, float]] = {}

        total_success = 0
        for ev in self._events:
            if ev.success:
                total_success += 1

            # PSP stats
            s, n, lat = psp_counts.get(ev.psp_id, (0, 0, 0.0))
            psp_counts[ev.psp_id] = (s + (1 if ev.success else 0), n + 1, lat + ev.latency_ms)

            # Method stats
            ms, mn, mlat = method_counts.get(ev.method, (0, 0, 0.0))
            method_counts[ev.method] = (ms + (1 if ev.success else 0), mn + 1, mlat + ev.latency_ms)

        overall_sr = total_success / total_events

        # 2. Build NodeStats mapping for diagnosis
        stats: Dict[str, NodeStats] = {}
        serializable_stats: Dict[str, dict] = {}

        # PSP node stats
        for psp in self.graph.psps:
            s, n, lat = psp_counts.get(psp, (0, 0, 0.0))
            sr = s / n if n > 0 else 1.0
            base = self._historical_baselines.get(psp, 0.98)
            delta = sr - base
            avg_lat = lat / n if n > 0 else 0.0
            stats[psp] = NodeStats(
                node_id=psp,
                node_kind="psp",
                success_rate=sr,
                volume=n,
                avg_latency_ms=avg_lat,
                baseline_rate=base,
                delta=delta,
            )
            serializable_stats[psp] = {
                "node_id": psp,
                "kind": "psp",
                "success_rate": round(sr, 4),
                "volume": n,
                "avg_latency_ms": round(avg_lat, 1),
                "delta": round(delta, 4),
            }

        # Method node stats
        for m in Method:
            ms, mn, mlat = method_counts.get(m.value, (0, 0, 0.0))
            msr = ms / mn if mn > 0 else 1.0
            mbase = self._historical_baselines.get(m.value, 0.98)
            mdelta = msr - mbase
            mavg_lat = mlat / mn if mn > 0 else 0.0
            stats[m.value] = NodeStats(
                node_id=m.value,
                node_kind="method",
                success_rate=msr,
                volume=mn,
                avg_latency_ms=mavg_lat,
                baseline_rate=mbase,
                delta=mdelta,
            )
            serializable_stats[m.value] = {
                "node_id": m.value,
                "kind": "method",
                "success_rate": round(msr, 4),
                "volume": mn,
                "avg_latency_ms": round(mavg_lat, 1),
                "delta": round(mdelta, 4),
            }

        # 3. Detect and Attribute failures
        det = detect(stats, detect_threshold=self.detect_threshold, window=1)
        attr = attribute(stats, self.graph, det)
        act = select_action(attr, self.graph, stats, self.intervention_threshold)

        return LiveEvaluationVerdict(
            timestamp=now,
            total_events=total_events,
            window_duration_seconds=self.window_size_seconds,
            overall_success_rate=round(overall_sr, 4),
            detection=det,
            attribution=attr,
            recommended_action=act,
            circuit_states={p: cb.state.value for p, cb in self._circuit_breakers.items()},
            node_stats=serializable_stats,
        )
