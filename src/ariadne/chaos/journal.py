"""Resilience Journal for Netflix Chaos Monkey.

Maintains an in-memory audit ledger of all injected faults, delays, and worker terminations.
"""
from __future__ import annotations

import time
from collections import deque
from dataclasses import asdict, dataclass
from threading import Lock
from typing import List


@dataclass
class ChaosStrike:
    timestamp: float
    monkey: str  # "latency" | "fault" | "worker"
    target: str   # request path or worker task name
    impact: str   # description of injected chaos
    auto_recovered: bool = True

    def to_dict(self) -> dict:
        return asdict(self)


class ChaosJournal:
    """Thread-safe ledger recording all simian strikes and recoveries."""

    def __init__(self, max_entries: int = 200) -> None:
        self._max_entries = max_entries
        self._entries: deque[ChaosStrike] = deque(maxlen=max_entries)
        self._lock = Lock()
        self._counts = {
            "total": 0,
            "latency": 0,
            "fault": 0,
            "worker": 0,
            "recovered": 0,
        }

    def record(self, monkey: str, target: str, impact: str, auto_recovered: bool = True) -> ChaosStrike:
        strike = ChaosStrike(
            timestamp=time.time(),
            monkey=monkey,
            target=target,
            impact=impact,
            auto_recovered=auto_recovered,
        )
        with self._lock:
            self._entries.appendleft(strike)
            self._counts["total"] += 1
            if monkey in self._counts:
                self._counts[monkey] += 1
            if auto_recovered:
                self._counts["recovered"] += 1
        return strike

    def get_history(self, limit: int = 50) -> List[dict]:
        with self._lock:
            return [e.to_dict() for e in list(self._entries)[:limit]]

    def get_summary(self) -> dict:
        with self._lock:
            return {
                "total_strikes": self._counts["total"],
                "latency_strikes": self._counts["latency"],
                "fault_strikes": self._counts["fault"],
                "worker_kills": self._counts["worker"],
                "auto_recovered_count": self._counts["recovered"],
                "journal_capacity": self._max_entries,
                "active_history_count": len(self._entries),
            }

    def reset(self) -> None:
        with self._lock:
            self._entries.clear()
            for k in self._counts:
                self._counts[k] = 0
