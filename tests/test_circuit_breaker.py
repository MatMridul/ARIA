"""Unit tests for the resilient payment gateway circuit breaker."""

import time
from ariadne.decide.circuit_breaker import CircuitBreaker, CircuitState


def test_circuit_breaker_starts_closed():
    cb = CircuitBreaker(gateway_id="stripe_us", failure_threshold=3)
    assert cb.state == CircuitState.CLOSED
    assert cb.can_route() is True


def test_circuit_breaker_trips_to_open_after_failures():
    cb = CircuitBreaker(gateway_id="stripe_us", failure_threshold=3, recovery_cooldown_seconds=1.0)
    
    cb.record_failure()
    assert cb.state == CircuitState.CLOSED
    cb.record_failure()
    assert cb.state == CircuitState.CLOSED
    cb.record_failure()
    assert cb.state == CircuitState.OPEN
    assert cb.can_route() is False


def test_circuit_breaker_transitions_to_half_open_after_cooldown():
    cb = CircuitBreaker(gateway_id="stripe_us", failure_threshold=2, recovery_cooldown_seconds=0.05)
    
    cb.record_failure()
    cb.record_failure()
    assert cb.state == CircuitState.OPEN
    
    # Wait for cooldown to elapse
    time.sleep(0.06)
    
    # Next call to can_route should promote to HALF_OPEN
    assert cb.can_route() is True
    assert cb.state == CircuitState.HALF_OPEN


def test_circuit_breaker_recovers_to_closed_on_canary_success():
    cb = CircuitBreaker(
        gateway_id="stripe_us", 
        failure_threshold=1, 
        recovery_cooldown_seconds=0.01,
        canary_success_threshold=2
    )
    cb.record_failure()
    assert cb.state == CircuitState.OPEN
    time.sleep(0.02)
    
    assert cb.can_route() is True
    assert cb.state == CircuitState.HALF_OPEN
    
    cb.record_success()
    assert cb.state == CircuitState.HALF_OPEN
    
    cb.record_success()
    assert cb.state == CircuitState.CLOSED
    assert cb.can_route() is True


def test_circuit_breaker_re_trips_immediately_on_canary_failure():
    cb = CircuitBreaker(
        gateway_id="stripe_us", 
        failure_threshold=1, 
        recovery_cooldown_seconds=0.01,
        canary_success_threshold=3
    )
    cb.record_failure()
    assert cb.state == CircuitState.OPEN
    time.sleep(0.02)
    
    # Trigger promotion to HALF_OPEN
    assert cb.can_route() is True
    assert cb.state == CircuitState.HALF_OPEN
    
    # Any failure during canary trial trips right back to OPEN
    cb.record_failure()
    assert cb.state == CircuitState.OPEN
    assert cb.can_route() is False
