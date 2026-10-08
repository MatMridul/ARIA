"""Sliding-window idempotency and duplicate event protection for telemetry ingestion."""

import threading
import time
from collections import OrderedDict
from typing import Any, List, Set, Tuple


class IdempotencyGuard:
    """Thread-safe sliding-window deduplication guard for transaction events and webhooks.

    Maintains an ordered ring of recently observed transaction IDs / idempotency keys
    with an expiration TTL to drop retried network duplicates.
    """

    def __init__(self, capacity: int = 20000, ttl_seconds: float = 600.0):
        self.capacity = capacity
        self.ttl_seconds = ttl_seconds
        self._lock = threading.Lock()
        # Maps key -> arrival_timestamp
        self._store: OrderedDict[str, float] = OrderedDict()

    def is_duplicate(self, key: str, now: float | None = None) -> bool:
        """Check if key has been observed within the TTL window.
        If new, records the key and returns False.
        If already present and valid, returns True.
        """
        if not key:
            return False

        current_time = now if now is not None else time.time()

        with self._lock:
            # 1. Prune expired entries from the front of the OrderedDict
            cutoff = current_time - self.ttl_seconds
            while self._store:
                oldest_key, oldest_ts = next(iter(self._store.items()))
                if oldest_ts < cutoff:
                    self._store.pop(oldest_key)
                else:
                    break

            # 2. Check if key is already observed
            if key in self._store:
                return True

            # 3. Enforce capacity limit
            if len(self._store) >= self.capacity:
                self._store.popitem(last=False)

            # 4. Record new entry
            self._store[key] = current_time
            return False

    def filter_events(self, events: List[Any], now: float | None = None) -> Tuple[List[Any], List[Any]]:
        """Splits an incoming event batch into (unique_events, duplicate_events).
        Extracts key from event.transaction_id or event['transaction_id'].
        """
        unique_events: List[Any] = []
        duplicate_events: List[Any] = []

        for ev in events:
            key = None
            if hasattr(ev, "transaction_id"):
                key = ev.transaction_id
            elif isinstance(ev, dict):
                key = ev.get("transaction_id") or ev.get("idempotency_key") or ev.get("id")

            if key and self.is_duplicate(str(key), now=now):
                duplicate_events.append(ev)
            else:
                unique_events.append(ev)

        return unique_events, duplicate_events

    def reset(self) -> None:
        """Clear all stored idempotency keys."""
        with self._lock:
            self._store.clear()

    def size(self) -> int:
        """Return count of active keys in cache."""
        with self._lock:
            return len(self._store)
