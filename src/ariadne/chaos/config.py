"""Configuration loader for Netflix Chaos Monkey (Simian Army).

Loads declarative settings from `chaosmonkey.toml` with environment variable overrides.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

try:
    import tomllib
except ImportError:  # pragma: no cover
    import tomli as tomllib  # type: ignore


@dataclass
class LatencyMonkeyConfig:
    enabled: bool = True
    probability: float = 0.10
    min_delay_ms: int = 150
    max_delay_ms: int = 800


@dataclass
class FaultMonkeyConfig:
    enabled: bool = True
    probability: float = 0.05
    status_code: int = 503
    error_message: str = "[CHAOS MONKEY] Simulating transient upstream provider outage"


@dataclass
class WorkerMonkeyConfig:
    enabled: bool = True
    kill_probability: float = 0.20
    check_interval_seconds: float = 10.0
    auto_recover: bool = True


@dataclass
class ChaosConfig:
    enabled: bool = False
    working_hours_only: bool = False
    track_journal: bool = True
    latency_monkey: LatencyMonkeyConfig = field(default_factory=LatencyMonkeyConfig)
    fault_monkey: FaultMonkeyConfig = field(default_factory=FaultMonkeyConfig)
    worker_monkey: WorkerMonkeyConfig = field(default_factory=WorkerMonkeyConfig)

    def to_dict(self) -> dict:
        return {
            "enabled": self.enabled,
            "working_hours_only": self.working_hours_only,
            "track_journal": self.track_journal,
            "latency_monkey": {
                "enabled": self.latency_monkey.enabled,
                "probability": self.latency_monkey.probability,
                "min_delay_ms": self.latency_monkey.min_delay_ms,
                "max_delay_ms": self.latency_monkey.max_delay_ms,
            },
            "fault_monkey": {
                "enabled": self.fault_monkey.enabled,
                "probability": self.fault_monkey.probability,
                "status_code": self.fault_monkey.status_code,
                "error_message": self.fault_monkey.error_message,
            },
            "worker_monkey": {
                "enabled": self.worker_monkey.enabled,
                "kill_probability": self.worker_monkey.kill_probability,
                "check_interval_seconds": self.worker_monkey.check_interval_seconds,
                "auto_recover": self.worker_monkey.auto_recover,
            },
        }


def load_chaos_config(config_path: Optional[str | Path] = None) -> ChaosConfig:
    """Load Chaos Monkey configuration from TOML and environment variables."""
    cfg = ChaosConfig()

    path_to_try = None
    if config_path:
        path_to_try = Path(config_path)
    else:
        # Search relative to repo root or cwd
        candidates = [
            Path("chaosmonkey.toml"),
            Path(__file__).resolve().parents[3] / "chaosmonkey.toml",
        ]
        for c in candidates:
            if c.is_file():
                path_to_try = c
                break

    if path_to_try and path_to_try.is_file():
        with open(path_to_try, "rb") as f:
            data = tomllib.load(f)

        chaos_sec = data.get("chaos", {})
        cfg.enabled = bool(chaos_sec.get("enabled", cfg.enabled))
        cfg.working_hours_only = bool(chaos_sec.get("working_hours_only", cfg.working_hours_only))
        cfg.track_journal = bool(chaos_sec.get("track_journal", cfg.track_journal))

        lat_sec = data.get("latency_monkey", {})
        if lat_sec:
            cfg.latency_monkey = LatencyMonkeyConfig(
                enabled=bool(lat_sec.get("enabled", True)),
                probability=float(lat_sec.get("probability", 0.10)),
                min_delay_ms=int(lat_sec.get("min_delay_ms", 150)),
                max_delay_ms=int(lat_sec.get("max_delay_ms", 800)),
            )

        fault_sec = data.get("fault_monkey", {})
        if fault_sec:
            cfg.fault_monkey = FaultMonkeyConfig(
                enabled=bool(fault_sec.get("enabled", True)),
                probability=float(fault_sec.get("probability", 0.05)),
                status_code=int(fault_sec.get("status_code", 503)),
                error_message=str(fault_sec.get("error_message", cfg.fault_monkey.error_message)),
            )

        worker_sec = data.get("worker_monkey", {})
        if worker_sec:
            cfg.worker_monkey = WorkerMonkeyConfig(
                enabled=bool(worker_sec.get("enabled", True)),
                kill_probability=float(worker_sec.get("kill_probability", 0.20)),
                check_interval_seconds=float(worker_sec.get("check_interval_seconds", 10.0)),
                auto_recover=bool(worker_sec.get("auto_recover", True)),
            )

    # Environment variable overrides
    if "ARIA_CHAOS_ENABLED" in os.environ:
        cfg.enabled = os.environ["ARIA_CHAOS_ENABLED"].strip().lower() in ("1", "true", "yes")

    if "ARIA_CHAOS_FAULT_PROB" in os.environ:
        try:
            cfg.fault_monkey.probability = float(os.environ["ARIA_CHAOS_FAULT_PROB"])
        except ValueError:
            pass

    if "ARIA_CHAOS_LATENCY_PROB" in os.environ:
        try:
            cfg.latency_monkey.probability = float(os.environ["ARIA_CHAOS_LATENCY_PROB"])
        except ValueError:
            pass

    return cfg
