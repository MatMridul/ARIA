# ARIA — Release Roadmap & Definition of Done (v0.3.0 → v1.0.0)

> **Context & Mandate:** ARIA is a **Capstone Engineering Reference Architecture**, not an open-ended SaaS product or a perpetual open-source maintenance commitment. 
> 
> The purpose of this document is to define an explicit, immutable **Finish Line**. Once `v1.0.0` is reached, development permanently halts, the codebase is frozen, and ARIA stands as an unshakeable, completed technical artifact for portfolio evaluation and technical interviews.

---

## 1. Architectural Principles & SemVer Philosophy

ARIA follows [Semantic Versioning 2.0.0](https://semver.org/):
* **`0.y.z` (Active Prototyping & Exploration):** Internal APIs, ingestion contracts, and state structures are actively evolving. Used during initial development.
* **`1.0.0` (The Immutable Contract):** Signifies that all primary research questions, architectural invariants, security boundaries, and audit trails are complete, tested, and frozen.

Treating this project as a perpetual open-source effort invites endless maintenance, scope creep, and burnout. ARIA stops when it has proven every layer of a modern payment reliability system: **Math → Engine → Cockpit → Streaming → Ingestion Security → Durable Auditability**.

---

## 2. Release Progression

```
[ v0.1.0 ]  Core Engine & Simulation Harness          ──► DONE
    │
[ v0.2.0 ]  Mission Control Cockpit & FastAPI Gateway   ──► DONE
    │
[ v0.3.0 ]  Live Telemetry Plane & Render Deployment    ──► CURRENT (PR #1)
    │
[ v0.4.0 ]  Ingestion Security, HMAC & Idempotency      ──► TARGET (Next Sprint)
    │
[ v0.5.0 ]  Crash-Resilient Audit Ledger (SQLite)       ──► TARGET (Persistence)
    │
[ v1.0.0 ]  THE FINISH LINE — Frozen Reference Arch    ──► PERMANENT COMPLETION
```

---

### Milestone Breakdown

### `v0.1.0` — Core Attribution Engine & Simulation Harness *(COMPLETED)*
* **Focus:** Algorithmic foundation, graph representation, honest adversary simulation.
* **Shipped Deliverables:**
  * Graph topology model: `PaymentGraph` (methods → PSPs → banks).
  * Set-theoretic relational attribution engine isolating shared-bank degradations.
  * Deterministic scenario simulator with isolated ground-truth generation.
  * Shared Dependency Discrimination validation across 5 scenario types (A through E).
  * Counterfactual recovery-vs-risk frontier plot (`reports/frontier.png`).
  * 89 automated tests (`pytest`).
* **Architectural Decisions:** [`DR-001`](decisions/DR-001-ariadne-core-design.md).

---

### `v0.2.0` — Mission Control Operator Cockpit *(COMPLETED)*
* **Focus:** Operator observability, human-in-the-loop decision console.
* **Shipped Deliverables:**
  * React 18 + TypeScript + Vite tactical console (`web/`).
  * Interactive SVG/Canvas payment dependency graph with real-time health coloring.
  * Incident RCA breakdown panel detailing root cause, confidence, and blast radius.
  * Bounded action recommendation panel with simulated recovery estimates.
  * FastAPI server serving `/api/topology`, `/api/incidents`, `/api/simulate`, `/api/audit`.
* **Architectural Decisions:** [`DR-002`](decisions/DR-002-attribution-branch-disambiguation.md).

---

### `v0.3.0` — Live Telemetry Streaming Plane & Cloud Deployment *(CURRENT)*
* **Focus:** Real-time event boundaries, autonomous circuit breakers, production CI/CD.
* **Shipped Deliverables:**
  * Server-Sent Events (SSE) streaming endpoint (`/api/telemetry/stream`).
  * High-throughput in-memory ring buffer (`StreamingTelemetryBuffer`).
  * In-browser live traffic generator synthesizing realistic payment flows with configurable fault rates.
  * Dynamic autonomous 3-state circuit breaker badges (CLOSED / OPEN / HALF_OPEN) rendered live on canvas edges.
  * Automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
  * Live containerized production deployment on Render (`https://aria-ionv.onrender.com`).
  * Test suite expanded to 90/90 passing automated tests.
* **Architectural Decisions:** [`DR-003`](decisions/DR-003-live-telemetry-plane.md) *(Pending close)*.

---

### `v0.4.0` — Ingestion Security, Webhook HMAC & Idempotency Boundary *(NEXT)*
* **Focus:** Hardening the public webhook boundary against replay attacks and spoofed telemetry.
* **Target Deliverables:**
  1. **HMAC-SHA256 Signature Verification:**
     * Ingestion dependency validating `X-Aria-Signature` (mirroring Stripe/Adyen webhook authentication).
     * Rejection of unauthenticated or tampered payloads at the network perimeter.
  2. **Idempotency Key Tracking:**
     * Sliding-window deduplication guard for incoming transaction/webhook event IDs to reject duplicate network retries.
  3. **Realistic Webhook Ingestion Schema:**
     * Support standard payload structures for payment failures, timeouts, and success webhooks.
  4. **Signed CLI Test Harness (`scripts/send_webhook.py`):**
     * Lightweight developer tool to sign and fire realistic webhook traffic bursts into the live deployment.
* **Resume Signal:** Production payment security standards, cryptographic payload authentication, replay prevention, and idempotency guarantees.

---

### `v0.5.0` — Crash-Resilient Audit Ledger *(PERSISTENCE)*
* **Focus:** Replacing ephemeral memory with an append-only, transactional audit ledger.
* **Target Deliverables:**
  1. **Embedded SQLite / SQLModel Ledger:**
     * Zero-maintenance, container-local relational storage (no expensive external DB infrastructure to run or manage).
  2. **Durable State Invariants:**
     * Persistence of historical incidents, diagnosis logs, and confidence vectors across container restarts.
     * Durable log of autonomous circuit breaker state transitions and operator reroute actions.
  3. **Console Audit Trail:**
     * Operator console `/audit` view renders historical incident records fetched from persistent storage.
* **Resume Signal:** Transactional consistency, crash recovery, financial auditability, and persistence layer design.

---

### `v1.0.0` — The Capstone Freeze *(THE FINISH LINE)*
* **Focus:** Verification, packaging, and final development freeze.
* **Definition of Done (Exit Criteria):**
  1. **Clean Pipeline:** 100% tests passing, zero TypeScript/lint errors, automated deploy green.
  2. **Architecture Decisions Closed:** All decision records (`DR-001` through `DR-004`) marked `Accepted`.
  3. **Visual Showcase:** 60-second video/GIF walkthrough embedded at the top of `README.md` demonstrating:
     * Live telemetry streaming in action.
     * Fault injection tripping an autonomous circuit breaker.
     * Relational attribution pinpointing the root-cause bank.
  4. **Frozen API & Documentation:** Interactive OpenAPI documentation (`/docs`) with finalized schemas.
  5. **Completion Banner in `README.md`:**
     ```markdown
     > **Project Status: Complete Reference Architecture (v1.0.0)**  
     > ARIA is a completed, production-hardened reference implementation for payment 
     > dependency graph attribution. All research goals, security invariants, and 
     > telemetry benchmarks are fulfilled and frozen.
     ```
* **Post-v1.0 Policy:** **NO FURTHER CODE CHANGES.** The repository transitions to read-only maintenance.

---

## 3. Deliberate Anti-Scope (What We Are Intentionally NOT Building)

To prevent the classic student trap of endless building, the following features are **strictly out of scope**:

| Excluded Feature | Why It Is Excluded |
| :--- | :--- |
| **Multi-Tenant SaaS / Auth** | ARIA is designed as an internal infrastructure engine for a merchant or payment orchestrator, not a consumer SaaS. Adding user logins, passwords, or Stripe billing adds zero architectural signal. |
| **External Distributed Databases (Kafka / Cassandra)** | Over-engineering for a reference project. Embedded SQLite proves transactional competence with zero ops cost. |
| **Live Merchant Sandbox API Keys** | Connecting real sandbox credentials adds third-party fragility without changing the mathematical or routing thesis. |
| **LLMs / AI Agents / Chatbots** | ARIA's value is deterministic, set-theoretic mathematical rigor and explainable attribution, not non-deterministic prompt tuning. |

---

## 4. Technical Interview Defense Guide

When discussing ARIA with recruiters, hiring managers, or Staff Engineers, use the following framing:

> *"ARIA was built as a staged reference architecture to solve cascading failures in multi-PSP payment routing:*
> * *In **v0.1–v0.2**, I validated the core set-theoretic attribution algorithm and built an operator cockpit.*
> * *In **v0.3**, I introduced a real-time telemetry streaming plane with autonomous circuit breakers and deployed it to production with CI/CD.*
> * *In **v0.4–v0.5**, I hardened the ingestion boundary with HMAC signature verification, idempotency keys, and an embedded SQLite audit ledger.*
> * *Once all architectural invariants were proven and tested, I cut **v1.0.0** and froze development, treating it as an immutable reference implementation rather than an open-ended side project."*

This answers the two questions senior interviewers care about most:
1. *Does this candidate know how to design real systems?* **Yes.**
2. *Does this candidate know when a software system is complete?* **Yes.**
