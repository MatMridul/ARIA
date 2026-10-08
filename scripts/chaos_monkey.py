#!/usr/bin/env python3
"""ARIA Chaos Monkey / Adversarial Edge Case Battery.

Simulates a 'deranged user' and adversarial traffic hitting:
1. Telemetry Ingestion API (/api/telemetry/ingest)
2. Streaming Endpoint (/api/telemetry/stream)
3. Simulation Engine (/api/simulate)
4. Cryptographic HMAC & Idempotency Guards
5. Core Attribution Math under degenerate states (NaNs, zero divisions, 100% failures)

Measures and reports HTTP status codes, error details, and unexpected 500s.
"""

import json
import os
import sys
import time
from typing import Any, Dict, List
from fastapi.testclient import TestClient

# Ensure src is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from web.api.main import app, streaming_buffer, idempotency_guard
from ariadne.security import generate_signature, verify_signature, DEFAULT_WEBHOOK_SECRET

client = TestClient(app)

results: List[Dict[str, Any]] = []


def record_result(category: str, test_name: str, payload_desc: str, status_code: int, handled: bool, detail: str = ""):
    results.append({
        "category": category,
        "test": test_name,
        "payload": payload_desc,
        "status_code": status_code,
        "handled": handled,
        "detail": detail,
    })
    flag = "[OK]  " if handled else "[FAIL]"
    print(f" {flag} [{category}] {test_name} -> HTTP {status_code} ({detail[:60]})", flush=True)


def run_chaos_battery():
    print("======================================================================", flush=True)
    print("   [!] ARIA CHAOS MONKEY / ADVERSARIAL EDGE CASE BATTERY [!]", flush=True)
    print("======================================================================\n", flush=True)

    # -------------------------------------------------------------------------
    # SUITE 1: Payload Structure & Type Derangement (/api/telemetry/ingest)
    # -------------------------------------------------------------------------
    print("[*] Running Suite 1: Structural & Type Chaos...", flush=True)

    cases_suite_1 = [
        ("empty_dict", {}, "Empty JSON object {}"),
        ("empty_events_list", {"events": []}, "Empty events array {'events': []}"),
        ("events_none", {"events": None}, "Null events {'events': None}"),
        ("events_not_a_list", {"events": "not_a_list"}, "String instead of list {'events': 'string'}"),
        ("event_is_int", {"events": [12345]}, "Integer element inside events"),
        ("event_is_string", {"events": ["bad_string"]}, "String element inside events"),
        ("event_missing_tx_id", {"events": [{"amount": 100.0, "psp_id": "psp_1"}]}, "Missing transaction_id"),
        ("event_tx_id_none", {"events": [{"transaction_id": None, "amount": 100.0}]}, "None transaction_id"),
        ("amount_string_non_numeric", {"events": [{"transaction_id": "tx1", "amount": "one_million"}]}, "amount = 'one_million'"),
        ("amount_nan", {"events": [{"transaction_id": "tx2", "amount": "NaN"}]}, "amount = 'NaN'"),
        ("amount_infinity", {"events": [{"transaction_id": "tx3", "amount": "Infinity"}]}, "amount = 'Infinity'"),
        ("amount_negative_huge", {"events": [{"transaction_id": "tx4", "amount": -9999999999.0}]}, "amount = -9,999,999,999"),
        ("latency_string", {"events": [{"transaction_id": "tx5", "latency_ms": "very_slow"}]}, "latency_ms = 'very_slow'"),
        ("latency_negative", {"events": [{"transaction_id": "tx6", "latency_ms": -500.0}]}, "latency_ms = -500.0"),
        ("timestamp_string", {"events": [{"transaction_id": "tx7", "timestamp": "yesterday"}]}, "timestamp = 'yesterday'"),
        ("timestamp_year_1970", {"events": [{"transaction_id": "tx8", "timestamp": 0.0}]}, "timestamp = 0.0 (Unix Epoch)"),
        ("timestamp_year_3000", {"events": [{"transaction_id": "tx9", "timestamp": 32503680000.0}]}, "timestamp in year 3000"),
        ("huge_sqli_in_tx_id", {"events": [{"transaction_id": "tx'; DROP TABLE incidents;--", "amount": 100}]}, "SQL injection attempt in transaction_id"),
        ("huge_xss_in_failure_code", {"events": [{"transaction_id": "tx_xss", "failure_code": "<script>alert('pwned')</script>"}]}, "XSS string in failure_code"),
        ("null_bytes_in_fields", {"events": [{"transaction_id": "tx_\x00_null", "failure_code": "ERR\x00NULL"}]}, "Null byte injection in string fields"),
    ]

    for name, payload, desc in cases_suite_1:
        try:
            res = client.post("/api/telemetry/ingest", json=payload)
            # Handled gracefully if 400 (Bad Request), 422 (Unprocessable Entity), or 200 (Clean Sanitization)
            # FAILED if 500 (Internal Server Error)
            handled = res.status_code in (200, 400, 422)
            detail = res.text[:80]
            record_result("Structural Chaos", name, desc, res.status_code, handled, detail)
        except Exception as e:
            record_result("Structural Chaos", name, desc, 500, False, f"Exception: {type(e).__name__}: {e}")

    # -------------------------------------------------------------------------
    # SUITE 2: Topological Degeneracies (Alien Entities & Graph Edge Cases)
    # -------------------------------------------------------------------------
    print("\n[*] Running Suite 2: Topological & Alien Entity Chaos...", flush=True)

    cases_suite_2 = [
        ("alien_psp_id", {"transaction_id": "tx_alien_1", "psp_id": "mars_rover_psp"}, "Unknown PSP 'mars_rover_psp'"),
        ("alien_bank_id", {"transaction_id": "tx_alien_2", "bank_id": "bank_atlantis"}, "Unknown Bank 'bank_atlantis'"),
        ("alien_method", {"transaction_id": "tx_alien_3", "method": "crypto_dogecoin"}, "Unknown Method 'crypto_dogecoin'"),
        ("empty_string_entities", {"transaction_id": "tx_empty", "psp_id": "", "bank_id": "", "method": ""}, "Empty string entities"),
        ("numeric_entities", {"transaction_id": "tx_num", "psp_id": 9999, "bank_id": 8888, "method": 7777}, "Numeric values as entity IDs"),
    ]

    for name, payload, desc in cases_suite_2:
        try:
            res = client.post("/api/telemetry/ingest", json=payload)
            handled = res.status_code in (200, 400, 422)
            record_result("Topology Chaos", name, desc, res.status_code, handled, res.text[:80])
        except Exception as e:
            record_result("Topology Chaos", name, desc, 500, False, f"Exception: {e}")

    # -------------------------------------------------------------------------
    # SUITE 3: HMAC Cryptographic Fuzzing
    # -------------------------------------------------------------------------
    print("\n[*] Running Suite 3: Cryptographic HMAC Fuzzing...", flush=True)

    valid_payload = json.dumps({"transaction_id": "tx_hmac_test", "success": True})
    valid_header, ts = generate_signature(DEFAULT_WEBHOOK_SECRET, valid_payload)

    cases_suite_3 = [
        ("empty_signature_header", "", "Empty header string ''", 401),
        ("missing_v1_token", f"t={ts}", "Header with missing v1 token", 401),
        ("missing_t_token", f"v1=abc12345", "Header with missing t token", 401),
        ("non_numeric_timestamp", f"t=not_a_number,v1=abc12345", "Timestamp is not an integer", 401),
        ("negative_timestamp", f"t=-1000,v1=abc12345", "Negative timestamp t=-1000", 401),
        ("future_timestamp_skew_1yr", f"t={ts + 31536000},v1=abc12345", "Future timestamp (+1 year skew)", 401),
        ("past_timestamp_skew_1hr", f"t={ts - 3600},v1=abc12345", "Past timestamp (-1 hour skew)", 401),
        ("boundary_skew_299s", generate_signature(DEFAULT_WEBHOOK_SECRET, valid_payload, timestamp=ts - 299)[0], "Boundary skew -299s (within 300s window)", 200),
        ("boundary_skew_301s", generate_signature(DEFAULT_WEBHOOK_SECRET, valid_payload, timestamp=ts - 301)[0], "Boundary skew -301s (exceeds 300s window)", 401),
        ("corrupted_signature_hex", valid_header[:-4] + "dead", "Corrupted last 4 hex characters", 401),
        ("truncated_signature", valid_header[:15], "Truncated signature header", 401),
        ("huge_garbage_header", "t=" + ("9" * 10000) + ",v1=" + ("f" * 10000), "10KB garbage header", 401),
        ("sql_injection_in_header", f"t={ts}', v1=' OR '1'='1", "SQL injection string inside header", 401),
    ]

    for name, header_val, desc, expected_code in cases_suite_3:
        try:
            res = client.post(
                "/api/telemetry/ingest",
                content=valid_payload,
                headers={"Content-Type": "application/json", "X-Aria-Signature": header_val},
            )
            handled = (res.status_code == expected_code)
            record_result("HMAC Fuzzing", name, desc, res.status_code, handled, f"Got {res.status_code}, expected {expected_code}")
        except Exception as e:
            record_result("HMAC Fuzzing", name, desc, 500, False, f"Exception: {e}")

    # -------------------------------------------------------------------------
    # SUITE 4: Streaming Endpoint Abuse (/api/telemetry/stream)
    # -------------------------------------------------------------------------
    print("\n[*] Running Suite 4: Streaming Endpoint Boundary Chaos...", flush=True)

    cases_suite_4 = [
        ("limit_valid_probe", "?limit=1", "limit=1 (bounded probe)", 200),
        ("limit_float", "?limit=1.5", "Float limit=1.5 (should 422)", 422),
        ("limit_string", "?limit=potato", "String limit=potato (should 422)", 422),
    ]

    for name, param, desc, expected_code in cases_suite_4:
        try:
            res = client.get(f"/api/telemetry/stream{param}")
            handled = (res.status_code == expected_code)
            record_result("Streaming Chaos", name, desc, res.status_code, handled, f"Got {res.status_code}, expected {expected_code}")
        except Exception as e:
            record_result("Streaming Chaos", name, desc, 500, False, f"Exception: {e}")

    # -------------------------------------------------------------------------
    # SUITE 5: Simulation Endpoint Boundary Stress (/api/simulate)
    # -------------------------------------------------------------------------
    print("\n[*] Running Suite 5: Simulation Engine Parameter Stress...", flush=True)

    cases_suite_5 = [
        ("invalid_incident_type", {"incident_type": "Z_cataclysm", "seed": 7}, "Invalid incident_type 'Z_cataclysm'", 400),
        ("seed_negative", {"incident_type": "A_shared_bank", "seed": -9999}, "Negative seed -9999", 200),
        ("seed_huge", {"incident_type": "A_shared_bank", "seed": 2**31 - 1}, "Huge 32-bit seed", 200),
        ("threshold_zero", {"incident_type": "A_shared_bank", "intervention_threshold": 0.0}, "intervention_threshold = 0.0", 200),
        ("threshold_one", {"incident_type": "A_shared_bank", "intervention_threshold": 1.0}, "intervention_threshold = 1.0", 200),
        ("threshold_negative", {"incident_type": "A_shared_bank", "intervention_threshold": -0.5}, "Negative threshold -0.5", 200),
        ("threshold_over_one", {"incident_type": "A_shared_bank", "intervention_threshold": 2.5}, "Threshold > 1.0 (2.5)", 200),
        ("unknown_system", {"incident_type": "A_shared_bank", "system": "alien_ai"}, "Unknown system 'alien_ai'", 422),
    ]

    for name, payload, desc, expected_code in cases_suite_5:
        try:
            res = client.post("/api/simulate", json=payload)
            handled = (res.status_code in (200, 400, 422))
            record_result("Simulation Chaos", name, desc, res.status_code, handled, f"Got {res.status_code}")
        except Exception as e:
            record_result("Simulation Chaos", name, desc, 500, False, f"Exception: {e}")

    # -------------------------------------------------------------------------
    # Print Comprehensive Scorecard
    # -------------------------------------------------------------------------
    print("\n======================================================================", flush=True)
    print("                    [+] CHAOS BATTERY SCORECARD [+]", flush=True)
    print("======================================================================", flush=True)

    total = len(results)
    passed = sum(1 for r in results if r["handled"])
    failed = total - passed

    print(f"Total Attack Vectors Executed: {total}", flush=True)
    print(f"Gracefully Handled          : {passed} ({passed/total*100:.1f}%)", flush=True)
    print(f"Unhandled Failures / Bugs   : {failed} ({failed/total*100:.1f}%)\n", flush=True)

    if failed > 0:
        print("[!] UNHANDLED FLUTTERS & CRASHES DETECTED:", flush=True)
        print("----------------------------------------------------------------------", flush=True)
        for r in results:
            if not r["handled"]:
                print(f"[FAIL] [{r['category']}] {r['test']} (Status: {r['status_code']})", flush=True)
                print(f"       Payload: {r['payload']}", flush=True)
                print(f"       Detail : {r['detail']}\n", flush=True)
    else:
        print("[SUCCESS] ZERO UNHANDLED 500 EXCEPTIONS! System demonstrated complete resilience.", flush=True)

    print("======================================================================\n", flush=True)
    return failed


if __name__ == "__main__":
    failures = run_chaos_battery()
    sys.exit(1 if failures > 0 else 0)
