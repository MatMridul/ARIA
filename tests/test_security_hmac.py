"""Unit & integration tests for HMAC signature verification and idempotency replay guards."""

import json
import os
import time
import pytest
from fastapi.testclient import TestClient

from ariadne.security.hmac import (
    DEFAULT_WEBHOOK_SECRET,
    generate_signature,
    verify_signature,
)
from ariadne.security.idempotency import IdempotencyGuard
from web.api.main import app

client = TestClient(app)


def test_hmac_valid_signature_cycle():
    secret = "test_secret_key_123"
    payload = json.dumps({"transaction_id": "tx_test_1", "amount": 100.0})

    header, ts = generate_signature(secret, payload)
    assert header.startswith(f"t={ts},v1=")

    is_valid, reason = verify_signature(secret, payload, header)
    assert is_valid is True
    assert reason == "valid"


def test_hmac_tampered_payload_rejected():
    secret = "test_secret_key_123"
    original_payload = json.dumps({"transaction_id": "tx_test_1", "amount": 100.0})
    header, _ = generate_signature(secret, original_payload)

    tampered_payload = json.dumps({"transaction_id": "tx_test_1", "amount": 999.0})
    is_valid, reason = verify_signature(secret, tampered_payload, header)
    assert is_valid is False
    assert reason == "signature_mismatch"


def test_hmac_expired_timestamp_rejected():
    secret = "test_secret_key_123"
    payload = json.dumps({"transaction_id": "tx_test_1"})

    # Timestamp 400 seconds in the past (exceeds default 300s window)
    expired_ts = time.time() - 400
    header, _ = generate_signature(secret, payload, timestamp=expired_ts)

    is_valid, reason = verify_signature(secret, payload, header, tolerance_seconds=300)
    assert is_valid is False
    assert reason == "timestamp_out_of_tolerance"


def test_hmac_malformed_headers():
    secret = "test_secret_key_123"
    payload = "hello"

    assert verify_signature(secret, payload, "") == (False, "missing_or_invalid_header")
    assert verify_signature(secret, payload, "invalid_header") == (False, "malformed_signature_header")
    assert verify_signature(secret, payload, "t=abc,v1=123") == (False, "invalid_timestamp_format")


def test_idempotency_guard_lifecycle():
    guard = IdempotencyGuard(capacity=5, ttl_seconds=10.0)

    # First arrival: not a duplicate
    assert guard.is_duplicate("tx_100", now=1000.0) is False
    # Immediate retry: is a duplicate
    assert guard.is_duplicate("tx_100", now=1001.0) is True

    # Different key: not a duplicate
    assert guard.is_duplicate("tx_101", now=1002.0) is False

    # Arrival after TTL expiration: should be accepted again
    assert guard.is_duplicate("tx_100", now=1015.0) is False


def test_idempotency_guard_batch_filtering():
    guard = IdempotencyGuard(capacity=100, ttl_seconds=60.0)
    events = [
        {"transaction_id": "tx_A", "amount": 50},
        {"transaction_id": "tx_B", "amount": 60},
        {"transaction_id": "tx_A", "amount": 50},  # duplicate
    ]

    unique, duplicates = guard.filter_events(events)
    assert len(unique) == 2
    assert len(duplicates) == 1
    assert duplicates[0]["transaction_id"] == "tx_A"


def test_api_ingest_hmac_and_idempotency_integration():
    # 1. Reset state
    client.post("/api/telemetry/reset")

    # 2. Test valid signature ingestion
    payload = json.dumps({
        "events": [
            {
                "transaction_id": "tx_auth_001",
                "amount": 150.0,
                "psp_id": "psp_1",
                "bank_id": "bank_A",
                "success": True,
            }
        ]
    })
    sig_header, _ = generate_signature(DEFAULT_WEBHOOK_SECRET, payload)

    res = client.post(
        "/api/telemetry/ingest",
        content=payload,
        headers={"Content-Type": "application/json", "X-Aria-Signature": sig_header},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["ingested_count"] == 1
    assert data["duplicate_count"] == 0

    # 3. Test replay attack / duplicate transmission
    res_dup = client.post(
        "/api/telemetry/ingest",
        content=payload,
        headers={"Content-Type": "application/json", "X-Aria-Signature": sig_header},
    )
    assert res_dup.status_code == 200
    dup_data = res_dup.json()
    assert dup_data["ingested_count"] == 0
    assert dup_data["duplicate_count"] == 1
    assert "duplicate and ignored" in dup_data["message"]

    # 4. Test corrupted signature rejected with 401
    bad_header = sig_header[:-6] + "dead00"
    res_bad = client.post(
        "/api/telemetry/ingest",
        content=payload,
        headers={"Content-Type": "application/json", "X-Aria-Signature": bad_header},
    )
    assert res_bad.status_code == 401
    assert "Invalid webhook signature" in res_bad.json()["detail"]


def test_api_ingest_strict_signature_mode():
    os.environ["ARIA_REQUIRE_SIGNATURE"] = "true"
    try:
        payload = json.dumps({"transaction_id": "tx_strict_001", "success": True})

        # Missing header under strict mode -> 401
        res = client.post(
            "/api/telemetry/ingest",
            content=payload,
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 401
        assert "Missing required X-Aria-Signature" in res.json()["detail"]

        # Providing valid header -> 200
        sig_header, _ = generate_signature(DEFAULT_WEBHOOK_SECRET, payload)
        res_ok = client.post(
            "/api/telemetry/ingest",
            content=payload,
            headers={"Content-Type": "application/json", "X-Aria-Signature": sig_header},
        )
        assert res_ok.status_code == 200
    finally:
        os.environ["ARIA_REQUIRE_SIGNATURE"] = "false"
