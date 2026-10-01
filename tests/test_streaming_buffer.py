"""Unit tests for the live streaming telemetry buffer and real-time evaluator."""

import time
from ariadne.model.graph import default_graph
from ariadne.observe.streaming_buffer import (
    LiveEvaluationVerdict,
    StreamingTelemetryBuffer,
    TelemetryEvent,
)


def test_streaming_buffer_healthy_traffic():
    buffer = StreamingTelemetryBuffer(window_size_seconds=10.0)
    
    # Send 20 successful transactions across psp_1, psp_2, psp_3
    events = [
        TelemetryEvent(
            transaction_id=f"tx_{i}",
            amount=50.0,
            method="card",
            psp_id=f"psp_{(i % 3) + 1}",
            bank_id="bank_A",
            success=True,
            latency_ms=45.0,
        )
        for i in range(20)
    ]
    
    verdict = buffer.ingest_batch(events)
    assert verdict.total_events == 20
    assert verdict.overall_success_rate == 1.0
    assert verdict.detection.triggered is False
    assert verdict.attribution.root_cause_kind == "none"
    assert verdict.recommended_action.kind == "do_nothing"
    assert all(state == "CLOSED" for state in verdict.circuit_states.values())


def test_streaming_buffer_single_psp_failure_burst():
    buffer = StreamingTelemetryBuffer(window_size_seconds=10.0, detect_threshold=0.15)
    
    # 30 healthy events on psp_2 and psp_3
    healthy = [
        TelemetryEvent(
            transaction_id=f"tx_h_{i}",
            amount=50.0,
            method="card",
            psp_id="psp_2" if i % 2 == 0 else "psp_3",
            bank_id="bank_A" if i % 2 == 0 else "bank_B",
            success=True,
        )
        for i in range(30)
    ]
    
    # 15 consecutive failure events on psp_1
    failures = [
        TelemetryEvent(
            transaction_id=f"tx_f_{i}",
            amount=75.0,
            method="card",
            psp_id="psp_1",
            bank_id="bank_A",
            success=False,
            failure_code="GATEWAY_TIMEOUT",
        )
        for i in range(15)
    ]
    
    verdict = buffer.ingest_batch(healthy + failures)
    
    assert verdict.detection.triggered is True
    assert "psp_1" in verdict.detection.dropped_nodes
    # Circuit breaker for psp_1 should trip OPEN
    assert verdict.circuit_states["psp_1"] == "OPEN"
    # Attribution identifies psp_1 as root cause
    assert verdict.attribution.root_cause_kind == "psp"
    assert verdict.attribution.root_cause_id == "psp_1"
    # Action proposes rerouting away from psp_1
    assert verdict.recommended_action.kind == "reroute"
    assert verdict.recommended_action.params["from_psp"] == "psp_1"


def test_streaming_buffer_event_expiry():
    # 0.1s short sliding window
    buffer = StreamingTelemetryBuffer(window_size_seconds=0.05)
    
    ev = TelemetryEvent(
        transaction_id="tx_old",
        amount=10.0,
        method="card",
        psp_id="psp_1",
        bank_id="bank_A",
        success=True,
        timestamp=time.time() - 0.1,  # In the past
    )
    
    verdict = buffer.ingest(ev)
    # The event is older than window_size_seconds (0.05) and gets evicted immediately
    assert verdict.total_events == 0
