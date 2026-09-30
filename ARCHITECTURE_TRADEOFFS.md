# ARIA Architecture Tradeoffs, Edge Cases & Production Hardening

This document outlines the core engineering tradeoffs, failure modes, and edge cases in Project ARIA (Adaptive Revenue Intelligence & Action). It serves as both an internal engineering design review and a technical blueprint for transitioning ARIA from a high-fidelity discrete simulation engine into a multi-region, distributed financial routing infrastructure.

---

## 1. Domain Edge Cases & Failure Mode Taxonomy

### A. Traffic Physics & Cascading Failures

#### 1. Route Flapping & The Oscillation Trap
* **The Problem:** Gateway A degrades $\rightarrow$ ARIA shifts 100% of volume to Gateway B $\rightarrow$ Gateway A's error rate drops to zero because it has zero incoming traffic $\rightarrow$ The anomaly detector assumes Gateway A has recovered and shifts traffic back $\rightarrow$ Gateway A immediately fails under load again.
* **Impact:** Route thrashing, HTTP connection overhead, cache invalidation, and intermittent merchant declines.
* **Production Mitigation:** **Hysteresis Damping & Step-Wise Canary Ramping**.
  * Require a mandatory quiet cooldown window (e.g., 300 seconds) after degradation.
  * Re-introduction follows a progressive traffic canary schedule: $5\% \rightarrow 20\% \rightarrow 50\% \rightarrow 100\%$, with immediate rollback if error budgets are breached.

#### 2. The "Thundering Herd" / Cascading Death Spiral
* **The Problem:** Gateway A processes 50,000 TPS; Gateway B is configured as fallback but only has a provisioned connection pool of 15,000 TPS. When Gateway A suffers an outage, ARIA re-routes 50,000 TPS to Gateway B.
* **Impact:** Gateway B's connection pools exhaust, rate limits trigger, and both primary and secondary gateways fail simultaneously, magnifying a single PSP issue into a platform-wide outage.
* **Production Mitigation:** **Capacity-Envelope Constrained Routing**.
  * Every routing target has a hard dynamic cap:
    $$\text{MaxAllocatedTPS} = \min(\text{GatewayCapacityLimit} \times 0.85, \text{RateLimitThreshold})$$
  * Overflow volume above total available platform capacity is gracefully queued or rejected early with explicit backpressure (`HTTP 429 Retry-After`) rather than overwhelming downstream PSPs.

---

### B. Financial & Compliance Invariants

#### 3. Cross-Vault Token Incompatibility
* **The Problem:** Recurring subscription payments frequently use network-tokenized credentials vaulted within a specific PSP (e.g., Stripe Customer Tokens). When Stripe fails, ARIA attempts to reroute the transaction to Checkout.com or Adyen.
* **Impact:** Checkout.com cannot decrypt or submit proprietary tokens stored in a third-party vault. Transactions fail with unrecoverable `INVALID_PAYMENT_METHOD` errors.
* **Production Mitigation:** **Token Portability Graph Constraints**.
  * Transactions with proprietary single-PSP tokens have infinite weight ($\infty$) on alternative edges unless an independent token orchestrator (e.g., TokenEx, VGS) or universal Network Tokenization (Visa/Mastercard VTS/MDES) is configured.

#### 4. The Margin Inversion (Pyrrhic Routing)
* **The Problem:** A domestic debit transaction in Germany fails on the local processor. ARIA reroutes it to a US-based acquiring gateway where authorization succeeds.
* **Impact:** The transaction succeeded, but the merchant incurred cross-border acquiring fees (+200 bps) and FX markups (+150 bps) on an order with a 3% gross margin. The merchant lost net capital on the sale.
* **Production Mitigation:** **Margin-Constrained Optimization Objective**.
  * The objective function must maximize net realized revenue, not pure authorization rate:
    $$\max \Big( P(\text{Success}) \times \text{GrossMargin} - \text{InterchangeFee} - \text{CrossBorderAssessment} - \text{SwitchingFee} \Big)$$

#### 5. Regional 3D Secure / SCA In-Flight Splitting
* **The Problem:** European PSD2 regulations require Strong Customer Authentication (SCA / 3DS2). A customer is presented with an authentication challenge via Gateway A. During challenge execution, Gateway A experiences a socket drop.
* **Impact:** 3DS cryptographic authentication values (`CAVV`, `ECI`, `XID`) are bound to the specific acquiring merchant ID and 3DS Server GUID. Passing partially authenticated challenges to Gateway B results in immediate issuer fraud rejections.
* **Production Mitigation:** **Lifecycle Stage Enforcement**.
  * ARIA enforces strict stage checkpoints: transactions can be dynamically rerouted *pre-authentication* or *post-settlement*, but *in-flight challenges* must trigger a fresh, independent authentication cycle.

---

### C. Distributed Systems & State Concurrency

#### 6. The Two-Phase Commit Hang (Unknown Timeout vs. Definite Failure)
* **The Problem:** ARIA dispatches an auth request to Gateway A. The socket times out after 8,000ms with no response. ARIA's circuit breaker opens and immediately retries on Gateway B.
* **Impact:** Gateway A actually authorized the charge on the cardholder's bank before dropping the TCP ACK. Gateway B also authorizes the charge. **The customer is double-billed.**
* **Production Mitigation:** **Idempotent Void-Before-Reroute Handshake**.
  * On an ambiguous timeout (`ETIMEDOUT` / socket hang), ARIA issues an asynchronous cancellation/reversal request with the transaction's deterministic idempotency key before authorizing on an alternative route.

#### 7. Split-Brain Routing During Horizontal Auto-Scaling
* **The Problem:** Under high load, 10 independent ARIA FastAPI worker pods evaluate transaction streams. Pod 1 detects a localized gateway anomaly and flips routing to Gateway B. Pod 2 has not crossed the error threshold and continues directing traffic to Gateway A.
* **Impact:** Inconsistent merchant settlement, split telemetry, and fragmented counterfactual measurements.
* **Production Mitigation:** **Centralized Leased Routing Epochs via Redis / etcd**.
  * Routing policies are not held in ephemeral local memory. They are synchronized via atomic leases in Redis with monotonic version IDs (`epoch_id`). Workers fetch and cache policies with sub-second TTLs and subscribe to Redis Pub/Sub policy invalidation channels.

---

### D. Causal Inference & Mathematical Edge Cases

#### 8. Simpson's Paradox in Multi-Dimensional Telemetry
* **The Problem:** Gateway A shows an overall approval rate of 82%, while Gateway B shows 75%. ARIA concludes Gateway A is superior.
* **The Reality:**
  * For Visa Domestic: Gateway A = 88%, Gateway B = 93%
  * For Amex International: Gateway A = 50%, Gateway B = 65%
  Gateway B is actually superior in *both* segments. Gateway A's aggregate metric was inflated solely because it received 90% easy domestic cards.
* **Production Mitigation:** **Stratified Tuple Segmentation**.
  * Performance profiles are partitioned across the coordinate tuple:
    $$(\text{CardBrand}, \text{IssuingCountry}, \text{Currency}, \text{BinRange})$$
    Eliminates aggregate confounding variables.

#### 9. The Unobserved Counterfactual & Exploration Budget
* **The Problem:** Claiming "X dollars saved" assumes 100% certainty of what would have happened on the unselected route.
* **Production Mitigation:** **$\epsilon$-Greedy Controlled Exploration**.
  * Allocate an explicit, configurable exploration budget ($\epsilon = 0.5\% - 1.0\%$) to keep sending traffic through degraded or baseline routes. This maintains an unbiased empirical control group for Inverse Propensity Score (IPS) weighting.

---

## 2. Immediate Tonight Action Checklist

- [x] **Document Edge Cases & Tradeoffs** (This file: `ARCHITECTURE_TRADEOFFS.md`).
- [x] **Implement Circuit Breaker State Machine** in `src/ariadne/decide/circuit_breaker.py`:
  - Three-state machine: `CLOSED` (normal), `OPEN` (degraded, traffic shunted), `HALF_OPEN` (probing canary traffic).
  - Cooldown timers, failure count sliding windows, and hysteresis damping.
- [x] **Add Idempotency & Ambiguous Timeout Router** in `src/ariadne/decide/idempotent_router.py`:
  - Out-of-band inquiry to detect silent authorization success before rerouting.
  - Strict Void-Before-Reroute handshake eliminating double-charge risks.
  - Verified with 6 unit tests in `tests/test_idempotent_router.py` (85/85 total tests green).
- [ ] **Prepare the 90-Second Interview Elevator Pitch**:
  - Focus on *why* set-theoretic rule synthesis was chosen over black-box deep learning (deterministic guarantees, regulator transparency, microsecond execution).
  - Articulate the 3 core production limitations (streaming ingestion, distributed consensus, cross-vault token portability).
