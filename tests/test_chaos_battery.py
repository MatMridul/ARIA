"""Automated Adversarial Chaos Battery for ARIA.

Fuzzes the API boundaries with deranged user inputs, type mismatches,
degenerate payloads, cryptographic edge cases, and extreme values.
Enforces zero unhandled 500 exceptions across all vectors.
"""

import json
from fastapi.testclient import TestClient

from web.api.main import app
from ariadne.security import generate_signature, DEFAULT_WEBHOOK_SECRET

client = TestClient(app)


def test_chaos_structural_and_type_fuzzing():
    """Fuzz /api/telemetry/ingest with malformed types and boundary payloads."""
    cases = [
        ("empty_dict", {}),
        ("empty_events_list", {"events": []}),
        ("events_none", {"events": None}),
        ("events_not_a_list", {"events": "not_a_list"}),
        ("event_is_int", {"events": [12345]}),
        ("event_is_string", {"events": ["bad_string"]}),
        ("event_missing_tx_id", {"events": [{"amount": 100.0, "psp_id": "psp_1"}]}),
        ("event_tx_id_none", {"events": [{"transaction_id": None, "amount": 100.0}]}),
        ("amount_string_non_numeric", {"events": [{"transaction_id": "tx1", "amount": "one_million"}]}),
        ("amount_nan", {"events": [{"transaction_id": "tx2", "amount": "NaN"}]}),
        ("amount_infinity", {"events": [{"transaction_id": "tx3", "amount": "Infinity"}]}),
        ("amount_negative_huge", {"events": [{"transaction_id": "tx4", "amount": -9999999999.0}]}),
        ("latency_string", {"events": [{"transaction_id": "tx5", "latency_ms": "very_slow"}]}),
        ("latency_negative", {"events": [{"transaction_id": "tx6", "latency_ms": -500.0}]}),
        ("timestamp_string", {"events": [{"transaction_id": "tx7", "timestamp": "yesterday"}]}),
        ("timestamp_year_1970", {"events": [{"transaction_id": "tx8", "timestamp": 0.0}]}),
        ("timestamp_year_3000", {"events": [{"transaction_id": "tx9", "timestamp": 32503680000.0}]}),
        ("huge_sqli_in_tx_id", {"events": [{"transaction_id": "tx'; DROP TABLE incidents;--", "amount": 100}]}),
        ("huge_xss_in_failure_code", {"events": [{"transaction_id": "tx_xss", "failure_code": "<script>alert('pwned')</script>"}]}),
        ("null_bytes_in_fields", {"events": [{"transaction_id": "tx_\x00_null", "failure_code": "ERR\x00NULL"}]}),
    ]

    for name, payload in cases:
        res = client.post("/api/telemetry/ingest", json=payload)
        assert res.status_code in (200, 400, 422), f"Vector '{name}' produced unexpected status {res.status_code}: {res.text}"


def test_chaos_topological_alien_entities():
    """Verify that unknown/alien entities are gracefully ingested without crashing the graph."""
    cases = [
        {"transaction_id": "tx_alien_1", "psp_id": "mars_rover_psp"},
        {"transaction_id": "tx_alien_2", "bank_id": "bank_atlantis"},
        {"transaction_id": "tx_alien_3", "method": "crypto_dogecoin"},
        {"transaction_id": "tx_empty", "psp_id": "", "bank_id": "", "method": ""},
        {"transaction_id": "tx_num", "psp_id": 9999, "bank_id": 8888, "method": 7777},
    ]

    for payload in cases:
        res = client.post("/api/telemetry/ingest", json=payload)
        assert res.status_code == 200, f"Alien entity vector failed: {res.text}"


def test_chaos_hmac_cryptographic_fuzzing():
    """Fuzz HMAC header parsing with corrupted, expired, and malicious values."""
    valid_payload = json.dumps({"transaction_id": "tx_hmac_fuzz", "success": True})
    valid_header, ts = generate_signature(DEFAULT_WEBHOOK_SECRET, valid_payload)

    cases = [
        ("empty_signature_header", "", 401),
        ("missing_v1_token", f"t={ts}", 401),
        ("missing_t_token", "v1=abc12345", 401),
        ("non_numeric_timestamp", "t=not_a_number,v1=abc12345", 401),
        ("negative_timestamp", "t=-1000,v1=abc12345", 401),
        ("future_timestamp_skew_1yr", f"t={ts + 31536000},v1=abc12345", 401),
        ("past_timestamp_skew_1hr", f"t={ts - 3600},v1=abc12345", 401),
        ("boundary_skew_299s", generate_signature(DEFAULT_WEBHOOK_SECRET, valid_payload, timestamp=ts - 299)[0], 200),
        ("boundary_skew_301s", generate_signature(DEFAULT_WEBHOOK_SECRET, valid_payload, timestamp=ts - 301)[0], 401),
        ("corrupted_signature_hex", valid_header[:-4] + "dead", 401),
        ("truncated_signature", valid_header[:15], 401),
        ("huge_garbage_header", "t=" + ("9" * 10000) + ",v1=" + ("f" * 10000), 401),
        ("sql_injection_in_header", f"t={ts}', v1=' OR '1'='1", 401),
    ]

    for name, header_val, expected_code in cases:
        res = client.post(
            "/api/telemetry/ingest",
            content=valid_payload,
            headers={"Content-Type": "application/json", "X-Aria-Signature": header_val},
        )
        assert res.status_code == expected_code, f"HMAC vector '{name}' expected {expected_code}, got {res.status_code}"


def test_chaos_streaming_endpoint_boundary():
    """Fuzz query parameters on SSE streaming endpoint."""
    cases = [
        ("?limit=1", 200),
        ("?limit=-5", 422),
        ("?limit=1.5", 422),
        ("?limit=potato", 422),
    ]

    for param, expected_code in cases:
        res = client.get(f"/api/telemetry/stream{param}")
        assert res.status_code == expected_code, f"Stream vector '{param}' expected {expected_code}, got {res.status_code}"


def test_chaos_simulation_parameter_stress():
    """Stress simulation engine endpoint with invalid scenarios and boundary numbers."""
    cases = [
        ({"incident_type": "Z_cataclysm", "seed": 7}, 422),
        ({"incident_type": "A_shared_bank", "seed": -9999}, 200),
        ({"incident_type": "A_shared_bank", "seed": 2**31 - 1}, 200),
        ({"incident_type": "A_shared_bank", "intervention_threshold": 0.0}, 200),
        ({"incident_type": "A_shared_bank", "intervention_threshold": 1.0}, 200),
        ({"incident_type": "A_shared_bank", "intervention_threshold": -0.5}, 200),
        ({"incident_type": "A_shared_bank", "intervention_threshold": 2.5}, 200),
        ({"incident_type": "A_shared_bank", "system": "alien_ai"}, 422),
    ]

    for payload, expected_code in cases:
        res = client.post("/api/simulate", json=payload)
        assert res.status_code == expected_code, f"Simulation vector with payload {payload} expected {expected_code}, got {res.status_code}"
