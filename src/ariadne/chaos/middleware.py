"""FastAPI / Starlette Middleware for Netflix-style Chaos Monkey.

Injects probabilistic latency (Latency Monkey) and dependency faults (Fault Monkey)
into active HTTP pipelines to verify client timeouts and steady-state resilience.
"""
from __future__ import annotations

import asyncio
import random
from typing import Callable, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from ariadne.chaos.config import ChaosConfig
from ariadne.chaos.journal import ChaosJournal


class ChaosMonkeyMiddleware(BaseHTTPMiddleware):
    """Runtime fault and latency injection middleware inspired by Netflix Chaos Monkey."""

    def __init__(
        self,
        app,
        config: ChaosConfig,
        journal: Optional[ChaosJournal] = None,
    ) -> None:
        super().__init__(app)
        self.config = config
        self.journal = journal or ChaosJournal()

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check bypass header
        if request.headers.get("X-Chaos-Bypass", "").lower() in ("true", "1"):
            return await call_next(request)

        # Exempt infrastructure, health, docs, and chaos control endpoints
        path = request.url.path
        if (
            path in ("/health", "/api/health", "/metrics", "/docs", "/openapi.json")
            or path.startswith("/api/chaos")
        ):
            return await call_next(request)

        # Check explicit test trigger headers
        forced_attack = request.headers.get("X-Chaos-Attack", "").lower()

        # 1. Fault Monkey
        should_fault = False
        if forced_attack == "fault":
            should_fault = True
        elif self.config.enabled and self.config.fault_monkey.enabled:
            should_fault = random.random() < self.config.fault_monkey.probability

        if should_fault:
            fault_cfg = self.config.fault_monkey
            if self.config.track_journal:
                self.journal.record(
                    monkey="fault",
                    target=f"{request.method} {path}",
                    impact=f"Injected HTTP {fault_cfg.status_code}: {fault_cfg.error_message}",
                    auto_recovered=True,
                )
            return JSONResponse(
                status_code=fault_cfg.status_code,
                content={"detail": fault_cfg.error_message},
                headers={
                    "X-Chaos-Injected": "fault",
                    "X-Simian-Army": "FaultMonkey",
                },
            )

        # 2. Latency Monkey
        should_delay = False
        if forced_attack == "latency":
            should_delay = True
        elif self.config.enabled and self.config.latency_monkey.enabled:
            should_delay = random.random() < self.config.latency_monkey.probability

        delay_applied_ms = 0.0
        if should_delay:
            lat_cfg = self.config.latency_monkey
            delay_sec = random.uniform(
                lat_cfg.min_delay_ms / 1000.0,
                lat_cfg.max_delay_ms / 1000.0,
            )
            delay_applied_ms = delay_sec * 1000.0
            await asyncio.sleep(delay_sec)

            if self.config.track_journal:
                self.journal.record(
                    monkey="latency",
                    target=f"{request.method} {path}",
                    impact=f"Injected artificial delay of {delay_applied_ms:.1f}ms",
                    auto_recovered=True,
                )

        response = await call_next(request)
        if should_delay:
            response.headers["X-Chaos-Injected"] = "latency"
            response.headers["X-Chaos-Delay-Ms"] = f"{delay_applied_ms:.1f}"
            response.headers["X-Simian-Army"] = "LatencyMonkey"

        return response
