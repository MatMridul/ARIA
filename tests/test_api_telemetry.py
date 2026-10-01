"""Integration tests for live telemetry ingestion endpoints in FastAPI."""

from fastapi.testclient import TestClient
from web.api.main import app

client = TestClient(app)


def test_api_telemetry_lifecycle():
    # 1. Reset live buffer
    res = client.post("/api/telemetry/reset")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    # 2. Ingest healthy event
    event = {
        "transaction_id": "tx_live_001",
        "amount": 125.0,
        "method": "card",
        "psp_id": "psp_2",
        "bank_id": "bank_A",
        "success": True,
        "latency_ms": 42.0,
    }
    res = client.post("/api/telemetry/ingest", json=event)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["ingested_count"] == 1
    assert data["verdict"]["total_events"] == 1
    assert data["verdict"]["detection"]["triggered"] is False
    assert data["verdict"]["circuit_states"]["psp_2"] == "CLOSED"

    # 3. Ingest a batch of failure events on psp_1
    failures = [
        {
            "transaction_id": f"tx_fail_{i}",
            "amount": 80.0,
            "method": "card",
            "psp_id": "psp_1",
            "bank_id": "bank_A",
            "success": False,
            "failure_code": "GATEWAY_TIMEOUT",
            "latency_ms": 5000.0,
        }
        for i in range(12)
    ]
    res = client.post("/api/telemetry/ingest", json={"events": failures})
    assert res.status_code == 200
    verdict = res.json()["verdict"]
    assert verdict["detection"]["triggered"] is True
    assert "psp_1" in verdict["detection"]["dropped_nodes"]
    assert verdict["circuit_states"]["psp_1"] == "OPEN"
    assert verdict["attribution"]["root_cause_kind"] == "psp"
    assert verdict["recommended_action"]["kind"] == "reroute"

    # 4. GET /api/telemetry/live inspects state without re-ingesting
    res = client.get("/api/telemetry/live")
    assert res.status_code == 200
    live_data = res.json()["verdict"]
    assert live_data["total_events"] == 13
    assert live_data["circuit_states"]["psp_1"] == "OPEN"
