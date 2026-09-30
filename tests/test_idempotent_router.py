"""Unit tests for the idempotent routing coordinator and ambiguous timeout safety."""

from typing import Optional
import pytest

from ariadne.decide.idempotent_router import (
    GatewayClient,
    GatewayDeclinedError,
    GatewayTimeoutError,
    IdempotentRoutingCoordinator,
    TransactionRequest,
    TransactionStatus,
)


class MockGateway:
    def __init__(
        self,
        gateway_id: str,
        auth_behavior: str = "success",  # "success", "timeout", "decline", "error"
        inquiry_result: Optional[TransactionStatus] = None,
        void_result: bool = True,
    ):
        self.gateway_id = gateway_id
        self.auth_behavior = auth_behavior
        self.inquiry_result = inquiry_result
        self.void_result = void_result
        self.auth_calls = 0
        self.inquiry_calls = 0
        self.void_calls = 0

    def authorize(self, request: TransactionRequest) -> bool:
        self.auth_calls += 1
        if self.auth_behavior == "success":
            return True
        elif self.auth_behavior == "timeout":
            raise GatewayTimeoutError("Connection timed out waiting for PSP TCP ACK")
        elif self.auth_behavior == "decline":
            raise GatewayDeclinedError("Card issuer declined: Insufficient funds (51)")
        else:
            raise RuntimeError("Fatal gateway 500 internal server error")

    def inquire_status(self, idempotency_key: str) -> Optional[TransactionStatus]:
        self.inquiry_calls += 1
        return self.inquiry_result

    def void_or_reverse(self, idempotency_key: str) -> bool:
        self.void_calls += 1
        return self.void_result


def test_happy_path_authorization():
    primary = MockGateway("stripe_us", auth_behavior="success")
    fallback = MockGateway("adyen_eu", auth_behavior="success")
    coordinator = IdempotentRoutingCoordinator()

    req = TransactionRequest(
        idempotency_key="tx_101",
        merchant_id="merchant_alpha",
        amount_cents=5000,
        currency="USD",
    )

    result = coordinator.execute_payment(req, primary, fallback)

    assert result.status == TransactionStatus.SUCCESS
    assert result.final_gateway_id == "stripe_us"
    assert primary.auth_calls == 1
    assert fallback.auth_calls == 0
    assert primary.void_calls == 0


def test_explicit_decline_does_not_reroute():
    primary = MockGateway("stripe_us", auth_behavior="decline")
    fallback = MockGateway("adyen_eu", auth_behavior="success")
    coordinator = IdempotentRoutingCoordinator()

    req = TransactionRequest(
        idempotency_key="tx_102",
        merchant_id="merchant_alpha",
        amount_cents=12000,
        currency="USD",
    )

    result = coordinator.execute_payment(req, primary, fallback)

    assert result.status == TransactionStatus.DECLINED
    assert result.final_gateway_id == "stripe_us"
    assert primary.auth_calls == 1
    # Card is declined; must not spam or retry alternative gateways
    assert fallback.auth_calls == 0


def test_ambiguous_timeout_inquiry_detects_prior_success_prevents_double_charge():
    # Primary dropped connection, but inquiry reveals bank actually charged the card
    primary = MockGateway(
        "stripe_us",
        auth_behavior="timeout",
        inquiry_result=TransactionStatus.SUCCESS,
    )
    fallback = MockGateway("adyen_eu", auth_behavior="success")
    coordinator = IdempotentRoutingCoordinator()

    req = TransactionRequest(
        idempotency_key="tx_103",
        merchant_id="merchant_alpha",
        amount_cents=7500,
        currency="USD",
    )

    result = coordinator.execute_payment(req, primary, fallback)

    assert result.status == TransactionStatus.DOUBLE_CHARGE_PREVENTED
    assert result.final_gateway_id == "stripe_us"
    assert primary.inquiry_calls == 1
    # Fallback was never called; customer was NOT double-charged!
    assert fallback.auth_calls == 0


def test_ambiguous_timeout_clean_void_and_fallback_recovery():
    # Primary times out, inquiry unknown, void succeeds -> safe to reroute!
    primary = MockGateway(
        "stripe_us",
        auth_behavior="timeout",
        inquiry_result=None,
        void_result=True,
    )
    fallback = MockGateway("adyen_eu", auth_behavior="success")
    coordinator = IdempotentRoutingCoordinator()

    req = TransactionRequest(
        idempotency_key="tx_104",
        merchant_id="merchant_alpha",
        amount_cents=9900,
        currency="USD",
    )

    result = coordinator.execute_payment(req, primary, fallback)

    assert result.status == TransactionStatus.SUCCESS
    assert result.final_gateway_id == "adyen_eu"
    assert result.reversal_executed is True
    assert primary.void_calls == 1
    assert fallback.auth_calls == 1


def test_ambiguous_timeout_failed_void_triggers_safety_halt():
    # Primary times out and void fails -> DO NOT CHARGE FALLBACK (too dangerous)
    primary = MockGateway(
        "stripe_us",
        auth_behavior="timeout",
        inquiry_result=None,
        void_result=False,  # Reversal could not be confirmed
    )
    fallback = MockGateway("adyen_eu", auth_behavior="success")
    coordinator = IdempotentRoutingCoordinator()

    req = TransactionRequest(
        idempotency_key="tx_105",
        merchant_id="merchant_alpha",
        amount_cents=45000,
        currency="USD",
    )

    result = coordinator.execute_payment(req, primary, fallback)

    assert result.status == TransactionStatus.SAFETY_HALTED
    assert result.final_gateway_id is None
    # Crucial safety invariant: Fallback must NEVER be called when primary state is ambiguous
    assert fallback.auth_calls == 0


def test_idempotency_replay_returns_cached_result():
    primary = MockGateway("stripe_us", auth_behavior="success")
    coordinator = IdempotentRoutingCoordinator()

    req = TransactionRequest(
        idempotency_key="tx_106_replay",
        merchant_id="merchant_alpha",
        amount_cents=3000,
        currency="USD",
    )

    first_result = coordinator.execute_payment(req, primary)
    second_result = coordinator.execute_payment(req, primary)

    assert first_result == second_result
    # Underlying gateway was only invoked once
    assert primary.auth_calls == 1
