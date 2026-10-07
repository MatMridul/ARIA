# DR-003 — Live Telemetry Streaming Plane and Real-Time Breaker Projection

- **Status:** Accepted
- **Status history:** Proposed 2026-10-07 → Accepted 2026-10-07
- **Date proposed:** 2026-10-07
- **Date resolved:** 2026-10-07
- **Supersedes / Superseded by:** —

## Question

How should ARIA ingest high-frequency payment telemetry, stream real-time events to the operator UI, and project autonomous circuit breaker states onto the topology graph without introducing heavyweight infrastructure dependencies?

## Context

Prior to this decision, ARIA's core diagnostic engine relied entirely on offline batch simulations (`/api/simulate` reading deterministic seeded scenarios). While sufficient to prove the mathematical attribution thesis in `DR-001` and `DR-002`, this architecture had two major deficiencies:
1. It lacked an ingestion boundary for live incoming payment webhooks (`/api/telemetry/ingest`).
2. The operator cockpit had no streaming visual plane to observe live degradation as transactions flowed through edges in real time.
3. Autonomous circuit breaker trips (CLOSED → OPEN → HALF_OPEN) were evaluated during post-simulation batch scoring rather than projected dynamically on the interactive topology canvas.

Constraints: Zero operational database/broker overhead (no Kafka/Redis dependencies for portfolio deployments), full compatibility with containerized single-process deployment on Render, and sub-100ms UI update latency.

## Evidence

1. **TestClient Concurrency Traps:** Using infinite `StreamingResponse` without termination controls caused deadlocks during synchronous test runs with Starlette's `TestClient`. Implementing a bounded `limit: int = 0` query parameter allowed `TestClient` to verify streaming payloads cleanly in test automation without hanging test runners.
2. **Bandwidth & Connection Footprint:** WebSockets introduce bidirectional state tracking, ping/pong heartbeats, and firewall proxy issues on free/low-tier container hosts (Render). In contrast, HTTP Server-Sent Events (SSE) provide lightweight, unidirectionally streamed chunks (`text/event-stream`) handled natively by standard browser `EventSource` / `fetch` streams over existing HTTP/1.1 and HTTP/2 connections.
3. **In-Memory Ring Buffer Performance:** An in-memory fixed-size FIFO ring buffer (`StreamingTelemetryBuffer`, max 10,000 events) easily absorbed 500+ txns/sec bursts in memory with sub-millisecond append latency and zero external network hops.

## Options

1. **Option A: Full WebSocket Gateway + Celery/Redis Broker.**
   * *Pros:* True bi-directional communication; supports server-push and client-command multiplexing.
   * *Cons:* Requires running a secondary Redis container or external broker, increasing deployment costs and operational failure points. Violates the minimal self-contained deployment principle.
2. **Option B: Periodic Polling (`setInterval` / `GET /api/telemetry/events?since=...`).**
   * *Pros:* Simple HTTP requests, trivial caching.
   * *Cons:* High request overhead, wasteful HTTP handshakes, jittery UI updates, and poor simulation of real payment streaming consoles.
3. **Option C: Server-Sent Events (SSE) with In-Memory Ring Buffer + In-Browser Traffic Synthesis.**
   * *Pros:* Unidirectional streaming via native HTTP, zero external broker dependencies, sub-50ms latency, native reconnect handling in browsers, lightweight container footprint.
   * *Cons:* Ephemeral buffer state is lost if the web container restarts.

## Proposed Decision

Adopt **Option C**:
* Implement `/api/telemetry/stream` using FastAPI's `StreamingResponse` with `media_type="text/event-stream"`.
* Back the endpoint with a thread-safe in-memory `StreamingTelemetryBuffer`.
* Provide an in-browser traffic generator directly inside the operator console to synthesize realistic payment streams with configurable fault injection without requiring third-party webhook sender setups.
* Project circuit breaker status badges (CLOSED, OPEN, HALF_OPEN) dynamically onto canvas edge labels in real time.

## Strongest Argument Against

In-memory ring buffers provide zero durability. If the Render container spins down due to inactivity or crashes, all accumulated telemetry disappears. In a production enterprise system, payment events require an immutable write-ahead log (Kafka or PostgreSQL ledger) to prevent unrecoverable data loss during crashes.

---

## External Challenge

The external challenge affirmed that for a high-signal reference architecture and interactive portfolio system, deploying a Kafka or RabbitMQ cluster adds unnecessary complexity, configuration drift, and maintenance burdens. However, the challenge highlighted that calling this system "v1.0.0" would be dishonest if telemetry persistence and replay protection were left completely in volatile RAM. 

Furthermore, test automation must not hang when hitting infinite streaming responses, and the migration to persistent storage must be documented in a concrete roadmap rather than ignored.

## Resolution

1. The SSE streaming endpoint `/api/telemetry/stream` was implemented with an explicit `limit: int = 0` parameter so automated testing suites (`pytest`) can test streaming payloads deterministically without deadlocks.
2. The durability limitation is accepted for `v0.3.0`, but formally slated for resolution in `v0.5.0` via an embedded SQLite audit ledger (documented in [`docs/ROADMAP.md`](../ROADMAP.md)).
3. The release tag for this milestone is fixed at **`v0.3.0`**, acknowledging the pre-v1.0 evolutionary status under SemVer.

## Decision

**Accepted.** Deploy Server-Sent Events (SSE) streaming with in-memory ring buffers and in-browser traffic generation as the core real-time telemetry plane for ARIA `v0.3.0`.

## Consequences

* Enables continuous real-time visual demonstration on the deployed Render instance at zero incremental infrastructure cost.
* Establishes the event contracts that will be hardened in `v0.4.0` (HMAC signatures and idempotency keys) and persisted in `v0.5.0` (SQLite ledger).
* Unlocks the completion of Milestone `v0.3.0` and PR #1 merge.
