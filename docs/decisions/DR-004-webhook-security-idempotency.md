# DR-004 — Cryptographic Webhook Authentication and Sliding-Window Idempotency

- **Status:** Accepted
- **Status history:** Proposed 2026-10-08 → Accepted 2026-10-08
- **Date proposed:** 2026-10-08
- **Date resolved:** 2026-10-08
- **Supersedes / Superseded by:** —

## Question

How should ARIA authenticate incoming telemetry webhooks at the perimeter and guard against duplicate network retries without introducing heavyweight distributed cache infrastructure?

## Context

In production payment orchestration systems, telemetry webhooks originate from external PSPs (Stripe, Adyen, Razorpay, Checkout.com) and client gateways. Prior to this decision, `/api/telemetry/ingest` accepted unauthenticated JSON payloads. 

This exposed the system to three critical operational risks:
1. **Telemetry Spoofing:** Attackers or rogue services could inject artificial failure bursts, fraudulently tripping autonomous circuit breakers and forcing reroutes.
2. **Timing Attacks:** Standard string comparisons on authentication tokens or hashes leak timing information via early-exit character matching.
3. **Replay Storms & Double-Counting:** Network retries from upstream gateways delivering duplicate event IDs would distort sliding-window failure rates, degrading legitimate PSP nodes.

## Evidence

1. **HMAC-SHA256 Industry Alignment:** Leading financial APIs (Stripe `Stripe-Signature`, Adyen HMAC-SHA256) utilize timestamped HMAC-SHA256 digests. Combining a timestamp `t` and raw payload in the signed digest `t.payload` binds the signature to a specific point in time, neutralizing replay attacks when paired with a tolerance threshold.
2. **In-Memory Ring Deduplication Performance:** A thread-safe `OrderedDict` sliding window with TTL pruning (`IdempotencyGuard`) handles up to 20,000 recent transaction IDs with sub-millisecond lookup latency, completely eliminating the need for an external Redis cluster for single-instance or reference container deployments.
3. **Web Crypto API in Modern Browsers:** Modern browsers natively support `window.crypto.subtle.sign("HMAC", ...)` without external JavaScript cryptographic libraries, allowing the in-browser simulator to transmit real, signed webhooks natively.

## Options

1. **Option A: JWT / Bearer Token Header (`Authorization: Bearer <token>`).**
   * *Pros:* Simple header parsing.
   * *Cons:* Does not sign the payload body. An in-flight attacker or proxy can tamper with payload contents (e.g. changing `success: true` to `false`) without invalidating the bearer token.
2. **Option B: Distributed Redis Cache + Central Auth Service.**
   * *Pros:* Globally shared state across horizontally scaled multi-region clusters.
   * *Cons:* Introduces external infrastructure dependencies, monthly hosting costs, and network hops for what is fundamentally an embedded reference architecture.
3. **Option C: Timestamped HMAC-SHA256 (`X-Aria-Signature`) + In-Memory Sliding-Window Deduplication.**
   * *Pros:* Zero external dependencies, timing-safe validation via `hmac.compare_digest`, body tamper protection, clock skew tolerance (300s window), and in-memory deduplication.
   * *Cons:* In-memory idempotency cache clears upon container reboot (formally resolved downstream in `v0.5.0` via SQLite persistent ledger).

## Proposed Decision

Adopt **Option C**:
* Implement `X-Aria-Signature: t=<timestamp>,v1=<signature>` using HMAC-SHA256.
* Enforce timing-safe comparison with `hmac.compare_digest`.
* Reject timestamps with clock skew > 300 seconds.
* Deduplicate transaction IDs via `IdempotencyGuard` sliding window before handing batches to the streaming buffer.
* Provide standalone CLI harness (`scripts/send_webhook.py`) and Web Crypto in-browser signing in the operator cockpit.

## Strongest Argument Against

In-memory deduplication does not survive container crashes or horizontal worker autoscaling across multiple distinct machine nodes.

---

## External Challenge

The challenge acknowledged that HMAC-SHA256 with timestamp binding is the gold standard for payment webhooks. However, for developer ergonomics and existing integration tests, the system must support both permissive mode (default for local development) and strict mode (`ARIA_REQUIRE_SIGNATURE=true`), returning descriptive error responses (e.g., distinguishing between timestamp expiration, malformed headers, and signature mismatches).

## Resolution

1. Permissive mode permits unsigned requests with a warning when `ARIA_REQUIRE_SIGNATURE` is not set, while strictly verifying any request that provides the `X-Aria-Signature` header.
2. Strict mode (`ARIA_REQUIRE_SIGNATURE=true`) returns `401 Unauthorized` for missing signatures.
3. The durability limitation across container restarts is slated for permanent resolution in Milestone `v0.5.0` via the SQLite persistence ledger.

## Decision

**Accepted.** Standardize on HMAC-SHA256 perimeter verification and sliding-window idempotency guards for ARIA `v0.4.0`.

## Consequences

* Secures telemetry perimeter against forgery and replay attacks.
* Adds standalone developer CLI tool (`scripts/send_webhook.py`).
* Expands automated test suite to 98 passing tests.
* Unlocks Milestone `v0.4.0` completion and paves the way for `v0.5.0` persistent audit ledger.
