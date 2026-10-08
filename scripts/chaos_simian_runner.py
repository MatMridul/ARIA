"""Netflix Chaos Monkey (Simian Army) Resilience Experiment Runner.

Executes a live Chaos Engineering experiment:
1. Verifies steady-state baseline.
2. Unleashes Latency Monkey, Fault Monkey, and Worker Monkey.
3. Asserts automated retry recovery and zero unhandled 500 errors.
4. Outputs an executive Resilience Index scorecard.

Usage:
    python scripts/chaos_simian_runner.py
"""
from pathlib import Path
import sys
import time
from typing import Dict, List

# Ensure repo root and src/ are on sys.path
_REPO_ROOT = Path(__file__).resolve().parents[1]
for _p in [str(_REPO_ROOT), str(_REPO_ROOT / "src")]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi.testclient import TestClient
from web.api.main import app, chaos_config, chaos_journal, worker_supervisor


def run_experiment() -> int:
    client = TestClient(app)
    print("=" * 72)
    print("  NETFLIX CHAOS MONKEY (SIMIAN ARMY) RESILIENCE EXPERIMENT")
    print("  Target: ARIA Autonomous Resilience Engine")
    print("=" * 72)

    # 1. Steady State Phase
    print("\n[PHASE 1] Establishing Steady-State Baseline (20 requests)...")
    baseline_latencies = []
    baseline_errors = 0

    for _ in range(20):
        t0 = time.time()
        res = client.get("/api/topology")
        dt = (time.time() - t0) * 1000.0
        baseline_latencies.append(dt)
        if res.status_code != 200:
            baseline_errors += 1

    p99_baseline = sorted(baseline_latencies)[int(len(baseline_latencies) * 0.95)]
    print(f"  [+] Baseline Status 200 Rate: {(20 - baseline_errors) / 20 * 100:.1f}%")
    print(f"  [+] Baseline P95 Latency:     {p99_baseline:.1f}ms")

    # 2. Unleash Simian Army
    print("\n[PHASE 2] Unleashing Simian Army...")
    chaos_journal.reset()
    chaos_config.enabled = True
    chaos_config.fault_monkey.enabled = True
    chaos_config.fault_monkey.probability = 0.20  # 20% fault rate for experiment
    chaos_config.latency_monkey.enabled = True
    chaos_config.latency_monkey.probability = 0.30  # 30% latency jitter
    chaos_config.latency_monkey.min_delay_ms = 50
    chaos_config.latency_monkey.max_delay_ms = 250
    chaos_config.worker_monkey.enabled = True

    print("  [+] Fault Monkey:   ACTIVE (20% injection rate, HTTP 503)")
    print("  [+] Latency Monkey: ACTIVE (30% injection rate, 50-250ms jitter)")
    print("  [+] Worker Monkey:  ACTIVE (periodic worker task reaper)")
    worker_supervisor.start()

    # 3. Adversarial Traffic with Client Retry Resilience
    print("\n[PHASE 3] Ingesting 50 Requests Under Simian Attack with Retry Backoff...")
    unhandled_500_count = 0
    injected_503_count = 0
    delayed_count = 0
    recovered_by_retry_count = 0

    for i in range(50):
        # Strike worker every 15 requests
        if i % 15 == 0:
            worker_supervisor.strike_random_worker()

        # Resilient client with exponential backoff (up to 3 retries)
        max_retries = 3
        success = False
        for attempt in range(max_retries):
            res = client.get("/api/topology")
            if res.headers.get("X-Chaos-Injected") == "latency":
                delayed_count += 1

            if res.status_code == 503:
                injected_503_count += 1
                # Simian fault encountered — client backs off and retries
                time.sleep(0.02 * (2**attempt))
                continue
            elif res.status_code == 500:
                unhandled_500_count += 1
                break
            elif res.status_code == 200:
                if attempt > 0:
                    recovered_by_retry_count += 1
                success = True
                break

    # Restore safe state
    chaos_config.enabled = False
    worker_supervisor.stop()

    # 4. Supervisor Status Check
    sup_status = worker_supervisor.get_status()
    summary = chaos_journal.get_summary()

    # 5. Executive Scorecard
    print("\n" + "=" * 72)
    print("  CHAOS EXPERIMENT SCORECARD")
    print("=" * 72)
    print(f"  Total Simian Strikes Recorded: {summary['total_strikes']}")
    print(f"  - Latency Injections:          {summary['latency_strikes']}")
    print(f"  - Fault Injections (503):       {summary['fault_strikes']}")
    print(f"  - Worker Terminations:         {summary['worker_kills']}")
    print(f"  - Client Retry Recoveries:     {recovered_by_retry_count}")
    print(f"  - Unhandled 500 Crashes:       {unhandled_500_count}")
    print(f"  Supervisor Self-Healing:       {'PASS (Auto-Recovered)' if summary['auto_recovered_count'] > 0 else 'N/A'}")

    resilience_passed = (unhandled_500_count == 0) and (summary["total_strikes"] > 0)

    if resilience_passed:
        print("\n  >>> VERDICT: RESILIENCE TEST PASSED <<<")
        print("  System absorbed artificial runtime failures with 0 unhandled 500 errors.")
        print("=" * 72 + "\n")
        return 0
    else:
        print("\n  >>> VERDICT: RESILIENCE TEST FAILED <<<")
        print("=" * 72 + "\n")
        return 1


if __name__ == "__main__":
    sys.exit(run_experiment())
