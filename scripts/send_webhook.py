#!/usr/bin/env python3
"""ARIA Webhook Test Harness & Signing CLI.

Sends cryptographically signed payment telemetry webhooks to ARIA's ingestion endpoint.
Supports fault simulation, payload tampering (401 verification), and idempotency replay tests.

Usage:
    # 1. Send normal healthy transactions to local server
    python scripts/send_webhook.py --count 10

    # 2. Simulate bank failure burst to live Render production instance
    python scripts/send_webhook.py --url https://aria-ionv.onrender.com/api/telemetry/ingest --scenario bank_outage --count 20

    # 3. Test HMAC rejection with tampered signature
    python scripts/send_webhook.py --tamper

    # 4. Test idempotency deduplication with duplicate transaction IDs
    python scripts/send_webhook.py --replay
"""

import argparse
import json
import random
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List

# Ensure ariadne is on import path
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from ariadne.security.hmac import DEFAULT_WEBHOOK_SECRET, generate_signature


def build_events(scenario: str, count: int, psp_override: str | None = None, replay: bool = False) -> List[Dict[str, Any]]:
    psps = ["psp_1", "psp_2", "psp_3"]
    banks = {"psp_1": "bank_A", "psp_2": "bank_A", "psp_3": "bank_B"}
    methods = ["card", "upi", "netbanking"]

    events = []
    base_id = "replay_fixed_tx_999" if replay else f"tx_cli_{int(time.time())}"

    for i in range(count):
        psp = psp_override if psp_override else random.choice(psps)
        method = random.choice(methods)
        tx_id = base_id if replay else f"{base_id}_{i}"

        success = True
        failure_code = None
        latency = 45.0 + random.uniform(5.0, 25.0)

        if scenario == "psp_outage" and psp == "psp_1":
            success = random.random() < 0.10
            if not success:
                failure_code = "GATEWAY_TIMEOUT"
                latency = 4800.0 + random.uniform(100.0, 300.0)
        elif scenario == "bank_outage" and (psp in ("psp_1", "psp_2")):
            success = random.random() < 0.15
            if not success:
                failure_code = "BANK_ISSUER_UNAVAILABLE"
                latency = 3900.0 + random.uniform(100.0, 400.0)
        else:
            success = random.random() < 0.98
            if not success:
                failure_code = "INSUFFICIENT_FUNDS"

        events.append({
            "transaction_id": tx_id,
            "amount": round(random.uniform(25.0, 250.0), 2),
            "method": method,
            "psp_id": psp,
            "bank_id": banks.get(psp, "bank_A"),
            "success": success,
            "latency_ms": round(latency, 1),
            "failure_code": failure_code,
            "timestamp": time.time(),
            "cohort": "cli_client",
            "geography": "US",
        })

    return events


def post_webhook(url: str, payload_bytes: bytes, sig_header: str) -> Dict[str, Any]:
    req = urllib.request.Request(
        url,
        data=payload_bytes,
        headers={
            "Content-Type": "application/json",
            "X-Aria-Signature": sig_header,
            "User-Agent": "ARIA-CLI-Harness/0.4.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="ARIA Payment Telemetry Webhook Signing CLI")
    parser.add_argument("--url", default="http://127.0.0.1:8000/api/telemetry/ingest", help="Target ingestion URL")
    parser.add_argument("--secret", default=DEFAULT_WEBHOOK_SECRET, help="HMAC signing secret")
    parser.add_argument("--scenario", choices=["healthy", "psp_outage", "bank_outage"], default="healthy", help="Traffic scenario")
    parser.add_argument("--count", type=int, default=5, help="Number of events in batch")
    parser.add_argument("--psp", default=None, help="Target specific PSP (psp_1, psp_2, psp_3)")
    parser.add_argument("--tamper", action="store_true", help="Intentionally corrupt HMAC signature to verify 401 rejection")
    parser.add_argument("--replay", action="store_true", help="Send duplicate transaction IDs to test idempotency deduplication")

    args = parser.parse_args()

    print(f"\n==================================================================")
    print(f" ARIA Webhook Ingestion Harness [v0.4.0]")
    print(f" Target URL : {args.url}")
    print(f" Scenario   : {args.scenario} ({args.count} events)")
    print(f" Tamper Mode: {'ENABLED (expecting 401)' if args.tamper else 'Disabled'}")
    print(f" Replay Mode: {'ENABLED (testing deduplication)' if args.replay else 'Disabled'}")
    print(f"==================================================================\n")

    events = build_events(args.scenario, args.count, psp_override=args.psp, replay=args.replay)
    body_dict = {"events": events}
    payload_str = json.dumps(body_dict)
    payload_bytes = payload_str.encode("utf-8")

    sig_header, ts = generate_signature(args.secret, payload_bytes)
    if args.tamper:
        sig_header = sig_header[:-6] + "deadbeef"  # Corrupt the last hex bytes

    print(f"[*] Computed X-Aria-Signature:")
    print(f"    {sig_header}")
    print(f"[*] Transmitting {len(events)} events ({len(payload_bytes)} bytes)...")

    try:
        resp = post_webhook(args.url, payload_bytes, sig_header)
        print(f"\n[+] HTTP 200 OK — Ingestion Succeeded!")
        print(f"    Ingested Count  : {resp.get('ingested_count')}")
        print(f"    Duplicate Count : {resp.get('duplicate_count', 0)}")
        if resp.get("message"):
            print(f"    Notice          : {resp.get('message')}")

        verdict = resp.get("verdict", {})
        det = verdict.get("detection", {})
        attr = verdict.get("attribution", {})
        circuits = verdict.get("circuit_states", {})

        print(f"\n[+] Real-time Telemetry Verdict:")
        print(f"    Anomaly Triggered : {det.get('triggered', False)}")
        print(f"    Attributed Cause  : {attr.get('root_cause_id') or 'None'} ({attr.get('root_cause_kind')})")
        print(f"    Attribution Conf  : {attr.get('confidence', 0.0):.2f}")
        print(f"    Circuit Breakers  : {circuits}")

    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        if args.tamper and e.code == 401:
            print(f"\n[+] EXPECTED RESULT: HTTP 401 Unauthorized!")
            print(f"    Server correctly rejected tampered signature: {body}")
        else:
            print(f"\n[-] HTTP Error {e.code}: {e.reason}")
            print(f"    Detail: {body}")
            sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\n[-] Connection Failed: {e.reason}")
        print(f"    Verify that the server is running at {args.url}")
        sys.exit(1)


if __name__ == "__main__":
    main()
