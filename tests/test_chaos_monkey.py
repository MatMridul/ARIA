"""Tests for Netflix Chaos Monkey (Simian Army) engine and API endpoints."""
import asyncio
import os
import pytest
from fastapi.testclient import TestClient

from ariadne.chaos import (
    ChaosConfig,
    ChaosJournal,
    ChaosMonkeyMiddleware,
    FaultMonkeyConfig,
    LatencyMonkeyConfig,
    WorkerMonkeyConfig,
    WorkerSupervisor,
    load_chaos_config,
)
from web.api.main import app, chaos_config, chaos_journal, worker_supervisor

client = TestClient(app)


def test_chaos_config_loading_and_overrides(monkeypatch, tmp_path):
    # Test file-based config
    custom_toml = tmp_path / "custom_chaos.toml"
    custom_toml.write_text(
        """
[chaos]
enabled = true
working_hours_only = true
track_journal = true

[latency_monkey]
enabled = true
probability = 0.40
min_delay_ms = 100
max_delay_ms = 300

[fault_monkey]
enabled = true
probability = 0.25
status_code = 503
error_message = "Custom fault"

[worker_monkey]
enabled = true
kill_probability = 0.50
check_interval_seconds = 5.0
auto_recover = true
"""
    )
    cfg = load_chaos_config(custom_toml)
    assert cfg.enabled is True
    assert cfg.working_hours_only is True
    assert cfg.latency_monkey.probability == 0.40
    assert cfg.fault_monkey.probability == 0.25
    assert cfg.worker_monkey.check_interval_seconds == 5.0

    # Test env overrides
    monkeypatch.setenv("ARIA_CHAOS_ENABLED", "false")
    monkeypatch.setenv("ARIA_CHAOS_FAULT_PROB", "0.99")
    monkeypatch.setenv("ARIA_CHAOS_LATENCY_PROB", "0.88")
    env_cfg = load_chaos_config(custom_toml)
    assert env_cfg.enabled is False
    assert env_cfg.fault_monkey.probability == 0.99
    assert env_cfg.latency_monkey.probability == 0.88


def test_chaos_journal_lifecycle():
    journal = ChaosJournal(max_entries=10)
    journal.reset()

    journal.record(monkey="latency", target="GET /api/topology", impact="250ms delay")
    journal.record(monkey="fault", target="POST /api/telemetry/ingest", impact="HTTP 503")
    journal.record(monkey="worker", target="worker:heartbeat", impact="Terminated worker", auto_recovered=True)

    summary = journal.get_summary()
    assert summary["total_strikes"] == 3
    assert summary["latency_strikes"] == 1
    assert summary["fault_strikes"] == 1
    assert summary["worker_kills"] == 1
    assert summary["auto_recovered_count"] == 3

    history = journal.get_history(limit=5)
    assert len(history) == 3
    assert history[0]["monkey"] == "worker"

    journal.reset()
    assert journal.get_summary()["total_strikes"] == 0
    assert len(journal.get_history()) == 0


def test_chaos_middleware_forced_attack_headers():
    chaos_journal.reset()

    # 1. Force Fault Monkey
    res_fault = client.get("/api/topology", headers={"X-Chaos-Attack": "fault"})
    assert res_fault.status_code == 503
    assert res_fault.headers.get("X-Chaos-Injected") == "fault"
    assert res_fault.headers.get("X-Simian-Army") == "FaultMonkey"
    assert "[CHAOS MONKEY]" in res_fault.json()["detail"]

    # 2. Force Latency Monkey
    res_lat = client.get("/api/topology", headers={"X-Chaos-Attack": "latency"})
    assert res_lat.status_code == 200
    assert res_lat.headers.get("X-Chaos-Injected") == "latency"
    assert res_lat.headers.get("X-Simian-Army") == "LatencyMonkey"
    assert "X-Chaos-Delay-Ms" in res_lat.headers

    # Verify recorded in journal
    summary = chaos_journal.get_summary()
    assert summary["fault_strikes"] >= 1
    assert summary["latency_strikes"] >= 1


def test_chaos_middleware_exemptions_and_bypass():
    # Health and chaos endpoints must never be struck even with forced headers
    res_chaos = client.get("/api/chaos/status", headers={"X-Chaos-Attack": "fault"})
    assert res_chaos.status_code == 200
    assert "status" in res_chaos.json()

    # X-Chaos-Bypass header overrides forced attacks
    res_bypass = client.get(
        "/api/topology",
        headers={"X-Chaos-Attack": "fault", "X-Chaos-Bypass": "true"},
    )
    assert res_bypass.status_code == 200


def test_chaos_probabilistic_fault_injection():
    try:
        # Temporarily enable 100% fault rate
        chaos_config.enabled = True
        chaos_config.fault_monkey.enabled = True
        chaos_config.fault_monkey.probability = 1.0

        res = client.get("/api/topology")
        assert res.status_code == 503
        assert res.headers.get("X-Chaos-Injected") == "fault"
    finally:
        # Restore safe defaults
        chaos_config.enabled = False
        chaos_config.fault_monkey.probability = 0.05


@pytest.mark.asyncio
async def test_worker_supervisor_auto_healing():
    cfg = ChaosConfig(
        enabled=True,
        worker_monkey=WorkerMonkeyConfig(
            enabled=True,
            kill_probability=1.0,
            auto_recover=True,
        ),
    )
    journal = ChaosJournal()
    supervisor = WorkerSupervisor(config=cfg, journal=journal)

    execution_counter = 0

    async def sample_worker():
        nonlocal execution_counter
        while True:
            execution_counter += 1
            await asyncio.sleep(0.01)

    supervisor.register_worker("test_runner", sample_worker)
    supervisor.start()

    # Allow worker to run initially
    await asyncio.sleep(0.05)
    assert execution_counter > 0

    # Strike the worker with Worker Monkey
    struck = supervisor.strike_worker("test_runner")
    assert struck is True

    # Supervisor should auto-recover and restart the worker
    await asyncio.sleep(0.15)
    status = supervisor.get_status()
    assert status["workers"]["test_runner"]["restart_count"] >= 1
    assert status["workers"]["test_runner"]["active"] is True

    # Random strike
    random_target = supervisor.strike_random_worker()
    assert random_target == "test_runner"

    supervisor.stop()
    assert supervisor.get_status()["running"] is False


def test_api_chaos_control_and_inspection_endpoints():
    # 1. GET /api/chaos/status
    res = client.get("/api/chaos/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "config" in data
    assert "summary" in data
    assert "history" in data
    assert "supervisor" in data

    # 2. POST /api/chaos/configure
    update_res = client.post(
        "/api/chaos/configure",
        json={
            "enabled": True,
            "fault_probability": 0.12,
            "latency_probability": 0.34,
            "worker_kill_probability": 0.56,
        },
    )
    assert update_res.status_code == 200
    cfg = update_res.json()["config"]
    assert cfg["enabled"] is True
    assert cfg["fault_monkey"]["probability"] == 0.12
    assert cfg["latency_monkey"]["probability"] == 0.34
    assert cfg["worker_monkey"]["kill_probability"] == 0.56

    # 3. POST /api/chaos/strike/worker
    strike_res = client.post("/api/chaos/strike/worker?name=telemetry_heartbeat")
    assert strike_res.status_code == 200

    # 4. POST /api/chaos/reset
    reset_res = client.post("/api/chaos/reset")
    assert reset_res.status_code == 200
    status_after_reset = client.get("/api/chaos/status").json()
    assert status_after_reset["summary"]["total_strikes"] == 0

    # Restore disabled state
    client.post("/api/chaos/configure", json={"enabled": False, "fault_probability": 0.05})
