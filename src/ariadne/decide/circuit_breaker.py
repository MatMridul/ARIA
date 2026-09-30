"""Circuit breaker state machine for resilient payment gateway routing.

Prevents route flapping and cascading failures by managing transitions between
CLOSED (healthy), OPEN (tripped/cooldown), and HALF_OPEN (canary probing) states.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class CircuitState(str, Enum):
    CLOSED = "CLOSED"         # Normal operation, traffic flows freely
    OPEN = "OPEN"             # Route degraded, all regular traffic shunted away
    HALF_OPEN = "HALF_OPEN"   # Cooldown elapsed, probing with bounded canary traffic


@dataclass
class CircuitBreaker:
    gateway_id: str
    failure_threshold: int = 5            # Consecutive failures to trip open
    recovery_cooldown_seconds: float = 30.0  # Time to stay OPEN before testing HALF_OPEN
    canary_success_threshold: int = 3     # Consecutive successes in HALF_OPEN to close
    canary_traffic_ratio: float = 0.10     # Max fraction of traffic allowed when HALF_OPEN
    
    # Internal state
    state: CircuitState = CircuitState.CLOSED
    failure_count: int = 0
    success_count: int = 0
    opened_at: Optional[float] = None
    last_state_change: float = field(default_factory=time.time)

    def can_route(self, request_hash: Optional[int] = None) -> bool:
        """Determines whether a transaction should be permitted through this gateway.
        
        In HALF_OPEN, uses deterministic hashing or a ratio check to admit only
        canary probe traffic.
        """
        now = time.time()
        
        # Check if OPEN state should automatically transition to HALF_OPEN
        if self.state == CircuitState.OPEN:
            if self.opened_at is not None and (now - self.opened_at) >= self.recovery_cooldown_seconds:
                self._transition_to(CircuitState.HALF_OPEN)
            else:
                return False

        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.HALF_OPEN:
            # Deterministic canary bucketing if request_hash provided, otherwise sample
            if request_hash is not None:
                bucket = (request_hash % 100) / 100.0
                return bucket < self.canary_traffic_ratio
            return True

        return False

    def record_success(self) -> None:
        """Records a successful transaction completion."""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.canary_success_threshold:
                self._transition_to(CircuitState.CLOSED)
        elif self.state == CircuitState.CLOSED:
            # Reset transient failures on clean success
            self.failure_count = 0

    def record_failure(self) -> None:
        """Records a failed or timed-out transaction attempt."""
        if self.state == CircuitState.CLOSED:
            self.failure_count += 1
            if self.failure_count >= self.failure_threshold:
                self._transition_to(CircuitState.OPEN)
        elif self.state == CircuitState.HALF_OPEN:
            # Any failure during canary trial immediately trips back to OPEN with full cooldown
            self._transition_to(CircuitState.OPEN)

    def _transition_to(self, new_state: CircuitState) -> None:
        now = time.time()
        self.state = new_state
        self.last_state_change = now
        
        if new_state == CircuitState.OPEN:
            self.opened_at = now
            self.failure_count = 0
            self.success_count = 0
        elif new_state == CircuitState.HALF_OPEN:
            self.success_count = 0
            self.failure_count = 0
        elif new_state == CircuitState.CLOSED:
            self.opened_at = None
            self.failure_count = 0
            self.success_count = 0
