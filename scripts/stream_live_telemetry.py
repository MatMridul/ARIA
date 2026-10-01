"""ARIA Live Telemetry Generator & Webhook Streamer.

Streams real-time payment transactions into ARIA's /api/telemetry/ingest endpoint
to simulate live production traffic, inject failure scenarios, and observe autonomous
detection, attribution, and circuit breaker interventions in real time.

Zero external dependencies (uses standard library urllib).

Usage:
    python scripts/stream_live_telemetry.py --target http://127.0.0.1:8001/api/telemetry/ingest --scenario psp_outage
    python scripts/stream_live_telemetry.py --scenario bank_outage --tps 20 --duration 45
"""

import argparse
import json
import random
import sys
import time
import urllib.error
import urllib.request
from typing import Dict, List

PSPS = ["psp_1", "psp_2", "psp_3"]
METHODS = ["card", "upi", "netbanking"]
BANKS = {
    "psp_1": "bank_A",
    "psp_2": "bank_A",  # psp_1 and psp_2 share bank_A
    "psp_3": "bank_B",  # psp_3 is isolated on bank_B
}


def make_transaction(
    idx: int,
    psp_id: str,
    success: bool,
    failure_code: str | None = None,
    latency_ms: float = 45.0,
    amount: float = 100.0,
) -> dict:
    return {
        "transaction_id": f"tx_stream_{idx}_{int(time.time()*1000)}",
        "amount": round(amount, 2),
        "method": random.choice(METHODS),
        "psp_id": psp_id,
        "bank_id": BANKS[psp_id],
        "success": success,
        "latency_ms": round(latency_ms, 1),
        "failure_code": failure_code,
        "timestamp": time.time(),
        "cohort": "live_stream",
        "geography": random.choice(["US", "EU", "APAC"]),
    }


def send_batch(target_url: str, batch: List[dict]) -> dict:
    data = json.dumps({"events": batch}).encode("utf-8")
    req = urllib.request.Request(
        target_url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "ARIA-Streamer/1.0"},
    )
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run_streamer(target_url: str, scenario: str, tps: int, duration_seconds: int) -> None:
    print("=" * 72)
    print(f"[*] ARIA REAL-TIME TELEMETRY STREAMER")
    print(f"[*] Target:   {target_url}")
    print(f"[*] Scenario: {scenario.upper()}")
    print(f"[*] Rate:     {tps} tx/sec | Duration: {duration_seconds}s")
    print("=" * 72)

    # First test connection and reset buffer
    reset_url = target_url.replace("/ingest", "/reset")
    try:
        req = urllib.request.Request(reset_url, data=b"{}", headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            print("[+] Successfully connected to ARIA. Live buffer reset.")
    except Exception as e:
        print(f"[!] Warning: Could not connect to {reset_url}: {e}")
        print("[!] Ensure the ARIA API server is running (e.g. uvicorn web.api.main:app --port 8001)")
        sys.exit(1)

    batch_interval = 0.5  # send every 500ms
    batch_size = max(1, int(tps * batch_interval))
    start_time = time.time()
    tx_count = 0

    print("\n[STREAM ACTIVE] Press Ctrl+C to stop.\n")
    print(f"{'Time':<8} | {'Sent':<6} | {'SuccRate':<9} | {'Detection':<12} | {'Root Cause':<16} | {'Circuit Breakers'}")
    print("-" * 78)

    try:
        while (time.time() - start_time) < duration_seconds:
            elapsed = time.time() - start_time
            batch: List[dict] = []

            for _ in range(batch_size):
                tx_count += 1
                psp = random.choice(PSPS)
                amount = random.uniform(20.0, 350.0)

                # Scenario fault injection logic
                if scenario == "healthy":
                    succ = random.random() < 0.98
                    code = None if succ else "CARD_EXPIRED"
                    lat = random.gauss(55, 10)
                elif scenario == "psp_outage":
                    # psp_1 suffers an outage between 10s and 30s
                    if 10.0 <= elapsed <= 30.0 and psp == "psp_1":
                        succ = random.random() < 0.10  # 90% failure rate
                        code = "GATEWAY_TIMEOUT"
                        lat = random.gauss(4500, 200)
                    else:
                        succ = random.random() < 0.98
                        code = None if succ else "INSUFFICIENT_FUNDS"
                        lat = random.gauss(55, 10)
                elif scenario == "bank_outage":
                    # bank_A suffers an outage between 10s and 30s -> affects psp_1 AND psp_2!
                    if 10.0 <= elapsed <= 30.0 and psp in ("psp_1", "psp_2"):
                        succ = random.random() < 0.15  # 85% failure
                        code = "BANK_ISSUER_UNAVAILABLE"
                        lat = random.gauss(3800, 300)
                    else:
                        succ = random.random() < 0.98
                        code = None
                        lat = random.gauss(55, 10)
                else:
                    succ = True
                    code = None
                    lat = 50.0

                batch.append(make_transaction(tx_count, psp, succ, code, lat, amount))

            # Dispatch batch to ARIA
            resp = send_batch(target_url, batch)
            v = resp.get("verdict", {})
            sr = v.get("overall_success_rate", 1.0) * 100
            det = "TRIGGERED" if v.get("detection", {}).get("triggered") else "NORMAL"
            attr = v.get("attribution", {})
            cause = f"{attr.get('root_cause_kind', 'none')}:{attr.get('root_cause_id', '')}"
            if attr.get("confidence", 0) > 0:
                cause += f" ({attr.get('confidence'):.2f})"
            cb_str = " ".join([f"{p[:4]}:{s[:4]}" for p, s in v.get("circuit_states", {}).items()])

            time_str = f"+{int(elapsed)}s"
            print(f"{time_str:<8} | {tx_count:<6} | {sr:>7.1f}% | {det:<12} | {cause:<16} | {cb_str}")

            time.sleep(batch_interval)

    except KeyboardInterrupt:
        print("\n[*] Stream terminated by operator.")

    print("=" * 78)
    print(f"[*] Stream complete. Ingested {tx_count} live transactions into ARIA.")


def main():
    parser = argparse.ArgumentParser(description="ARIA Live Telemetry Generator")
    parser.add_argument(
        "--target",
        default="http://127.0.0.1:8001/api/telemetry/ingest",
        help="ARIA ingestion webhook URL",
    )
    parser.add_argument(
        "--scenario",
        choices=["healthy", "psp_outage", "bank_outage"],
        default="psp_outage",
        help="Telemetry failure scenario to stream",
    )
    parser.add_argument("--tps", type=int, default=15, help="Transactions per second")
    parser.add_argument("--duration", type=int, default=35, help="Stream duration in seconds")
    args = parser.parse_args()

    run_streamer(args.target, args.scenario, args.tps, args.duration)


if __name__ == "__main__":
    main()
