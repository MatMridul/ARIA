"""Idempotent payment routing coordinator with ambiguous timeout resolution.

Guarantees strict financial correctness:
1. Prevents duplicate charges under ambiguous network timeouts (2PC socket hang).
2. Executes a mandatory Void-Before-Reroute or Status-Inquiry handshake before
   attempting secondary fallback routes.
3. Provides deterministic idempotency caching keyed by (merchant_id, idempotency_key).
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Protocol


class TransactionStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    DECLINED = "DECLINED"
    VOIDED = "VOIDED"
    AMBIGUOUS_TIMEOUT = "AMBIGUOUS_TIMEOUT"
    DOUBLE_CHARGE_PREVENTED = "DOUBLE_CHARGE_PREVENTED"
    SAFETY_HALTED = "SAFETY_HALTED"


class GatewayTimeoutError(Exception):
    """Raised when a gateway network socket times out without an HTTP ACK."""
    pass


class GatewayDeclinedError(Exception):
    """Raised when a transaction is explicitly declined by the issuer (e.g. NSF)."""
    pass


@dataclass(frozen=True)
class TransactionRequest:
    idempotency_key: str
    merchant_id: str
    amount_cents: int
    currency: str
    payment_method: str = "card"


@dataclass
class AttemptRecord:
    gateway_id: str
    action: str  # "authorize" | "inquire" | "reverse"
    status: str
    timestamp: float = field(default_factory=time.time)
    detail: Optional[str] = None


@dataclass
class PaymentExecutionResult:
    idempotency_key: str
    final_gateway_id: Optional[str]
    status: TransactionStatus
    amount_cents: int
    attempts: List[AttemptRecord] = field(default_factory=list)
    reversal_executed: bool = False
    notes: str = ""


class GatewayClient(Protocol):
    """Protocol that payment gateway drivers must implement."""
    gateway_id: str

    def authorize(self, request: TransactionRequest) -> bool:
        """Attempt authorization. Returns True on success, raises on failure/timeout."""
        ...

    def inquire_status(self, idempotency_key: str) -> Optional[TransactionStatus]:
        """Query gateway to determine whether an in-flight charge actually succeeded."""
        ...

    def void_or_reverse(self, idempotency_key: str) -> bool:
        """Issue an immediate pre-authorization void or reversal to prevent settlement."""
        ...


class IdempotentRoutingCoordinator:
    """Orchestrates multi-gateway execution while eliminating double-charge risks."""

    def __init__(self) -> None:
        # In-memory idempotency cache: (merchant_id, idempotency_key) -> PaymentExecutionResult
        self._completed_transactions: Dict[str, PaymentExecutionResult] = {}
        # Concurrency guard for in-flight requests
        self._in_flight: set[str] = set()

    def _cache_key(self, merchant_id: str, idempotency_key: str) -> str:
        return f"{merchant_id}:{idempotency_key}"

    def execute_payment(
        self,
        request: TransactionRequest,
        primary_gateway: GatewayClient,
        fallback_gateway: Optional[GatewayClient] = None,
    ) -> PaymentExecutionResult:
        cache_key = self._cache_key(request.merchant_id, request.idempotency_key)

        # 1. Idempotency Check: Return previously cached result immediately
        if cache_key in self._completed_transactions:
            return self._completed_transactions[cache_key]

        if cache_key in self._in_flight:
            raise RuntimeError(f"Concurrent in-flight payment request for key {request.idempotency_key}")

        self._in_flight.add(cache_key)
        attempts: List[AttemptRecord] = []

        try:
            # 2. Attempt Authorization on Primary Gateway
            try:
                attempts.append(AttemptRecord(gateway_id=primary_gateway.gateway_id, action="authorize", status="attempting"))
                success = primary_gateway.authorize(request)
                if success:
                    attempts[-1].status = "success"
                    res = PaymentExecutionResult(
                        idempotency_key=request.idempotency_key,
                        final_gateway_id=primary_gateway.gateway_id,
                        status=TransactionStatus.SUCCESS,
                        amount_cents=request.amount_cents,
                        attempts=attempts,
                        notes="Authorized on primary route without incident.",
                    )
                    self._completed_transactions[cache_key] = res
                    return res
            except GatewayDeclinedError as e:
                # Explicit decline (e.g. insufficient funds) — DO NOT reroute, issuer declined cardholder
                attempts[-1].status = "declined"
                res = PaymentExecutionResult(
                    idempotency_key=request.idempotency_key,
                    final_gateway_id=primary_gateway.gateway_id,
                    status=TransactionStatus.DECLINED,
                    amount_cents=request.amount_cents,
                    attempts=attempts,
                    notes=f"Explicit issuer decline: {str(e)}",
                )
                self._completed_transactions[cache_key] = res
                return res

            except GatewayTimeoutError:
                # Ambiguous socket timeout! Gateway A might or might not have captured funds.
                attempts[-1].status = "ambiguous_timeout"
                
                # 3. Step A: Perform Out-of-Band Status Inquiry
                inquiry_status = primary_gateway.inquire_status(request.idempotency_key)
                attempts.append(
                    AttemptRecord(
                        gateway_id=primary_gateway.gateway_id,
                        action="inquire",
                        status=str(inquiry_status) if inquiry_status else "unknown",
                    )
                )

                if inquiry_status == TransactionStatus.SUCCESS:
                    # Gateway A actually succeeded before dropping the connection!
                    # Adopt primary authorization to prevent double-charging cardholder on Gateway B.
                    res = PaymentExecutionResult(
                        idempotency_key=request.idempotency_key,
                        final_gateway_id=primary_gateway.gateway_id,
                        status=TransactionStatus.DOUBLE_CHARGE_PREVENTED,
                        amount_cents=request.amount_cents,
                        attempts=attempts,
                        notes="Primary socket timed out, but inquiry confirmed auth succeeded. Reroute aborted to avoid double billing.",
                    )
                    self._completed_transactions[cache_key] = res
                    return res

                # 4. Step B: Force Void / Reversal Handshake on Primary Gateway
                void_success = primary_gateway.void_or_reverse(request.idempotency_key)
                attempts.append(
                    AttemptRecord(
                        gateway_id=primary_gateway.gateway_id,
                        action="reverse",
                        status="success" if void_success else "failed",
                    )
                )

                if not void_success:
                    # If we cannot guarantee Primary was voided, NEVER blindly charge Fallback.
                    # Halt safely for operator reconciliation.
                    res = PaymentExecutionResult(
                        idempotency_key=request.idempotency_key,
                        final_gateway_id=None,
                        status=TransactionStatus.SAFETY_HALTED,
                        amount_cents=request.amount_cents,
                        attempts=attempts,
                        reversal_executed=False,
                        notes="CRITICAL: Primary timed out and reversal handshake failed. Execution halted to eliminate duplicate capture risk.",
                    )
                    self._completed_transactions[cache_key] = res
                    return res

                # 5. Step C: Primary is guaranteed voided/neutralized. Safe to proceed to Fallback!
                if fallback_gateway is not None:
                    attempts.append(AttemptRecord(gateway_id=fallback_gateway.gateway_id, action="authorize", status="attempting"))
                    try:
                        fallback_success = fallback_gateway.authorize(request)
                        if fallback_success:
                            attempts[-1].status = "success"
                            res = PaymentExecutionResult(
                                idempotency_key=request.idempotency_key,
                                final_gateway_id=fallback_gateway.gateway_id,
                                status=TransactionStatus.SUCCESS,
                                amount_cents=request.amount_cents,
                                attempts=attempts,
                                reversal_executed=True,
                                notes="Primary timed out and was successfully voided; recovered cleanly via fallback route.",
                            )
                            self._completed_transactions[cache_key] = res
                            return res
                    except Exception as fb_err:
                        attempts[-1].status = "fallback_failed"
                        attempts[-1].detail = str(fb_err)

                # Both or fallback failed
                res = PaymentExecutionResult(
                    idempotency_key=request.idempotency_key,
                    final_gateway_id=None,
                    status=TransactionStatus.AMBIGUOUS_TIMEOUT,
                    amount_cents=request.amount_cents,
                    attempts=attempts,
                    reversal_executed=True,
                    notes="Primary was voided after timeout; fallback route was unavailable or failed.",
                )
                self._completed_transactions[cache_key] = res
                return res

        finally:
            self._in_flight.remove(cache_key)
