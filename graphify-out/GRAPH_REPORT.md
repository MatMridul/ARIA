# Graph Report - ARIADNE  (2026-09-20)

## Corpus Check
- 131 files · ~99,174 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 693 nodes · 1769 edges · 56 communities (38 shown, 18 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 187 edges (avg confidence: 0.94)
- Token cost: 12,000 input · 4,500 output

## Community Hubs (Navigation)
- Frontend UI Components
- Graph-Blind Baseline Diagnosis
- Decision & Policy Engine
- Frontend UI Components
- Web API & Evaluation Sweep Cache
- Transaction Simulation Engine
- Payment Graph Model & Manifest Ingestion
- Transaction Simulation Engine
- TypeScript Configuration & DOM Types
- Web API Client & Zod Schemas
- Transaction Simulation Engine
- PostCSS & Dev Tooling
- React Runtime & Routing Dependencies
- Transaction Simulation Engine
- Payment Topology & Failure Code Tests
- Incident Scenarios & Trace Evaluation
- Frontend Reconnaissance & Audit
- Web API & Evaluation Sweep Cache
- Web API Client & Zod Schemas
- Payment Graph Model & Manifest Ingestion
- Thesis & Build Steering
- Web Console Feature 21
- Transaction Simulation Engine
- Reporting & Frontier Visualization
- Web Console Feature 24
- Frontend Reconnaissance & Audit
- Web Console Feature 26
- Web Console Feature 27
- Reporting & Frontier Visualization
- React Runtime & Routing Dependencies
- Frontend Reconnaissance & Audit
- Frontend Reconnaissance & Audit
- Incident Scenarios & Trace Evaluation
- Domain Adapter & Decision Records
- Docs Build Order Phases Module (34)
- Docs Build Spec Shared Se Module (35)
- Docs Frontend Stack Decis Module (36)
- Docs Scope Tiers Module (37)
- Thesis & Build Steering
- Thesis & Build Steering
- Pkg Ariadne Module (40)
- Readme Aria System Overvi Module (41)
- Release Report Release Su Module (42)

## God Nodes (most connected - your core abstractions)
1. `Method` - 52 edges
2. `default_graph()` - 43 edges
3. `PaymentGraph` - 39 edges
4. `IncidentType` - 39 edges
5. `cn()` - 36 edges
6. `SimConfig` - 34 edges
7. `run_once()` - 30 edges
8. `generate()` - 28 edges
9. `NodeStats` - 26 edges
10. `select_action()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `test_baseline_sees_same_inputs_as_ariadne_but_no_graph()` --indirect_call--> `baseline_attribute()`  [INFERRED]
  tests/test_baseline.py → src/ariadne/baseline/independent.py
- `test_retry_recovers_on_noise_too()` --calls--> `money_recovered()`  [INFERRED]
  tests/test_failure_code_independence.py → src/ariadne/eval/metrics.py
- `test_no_history_gives_zero_delta()` --uses--> `Method`  [INFERRED]
  tests/test_aggregate.py → src/ariadne/model/entities.py
- `test_rate_volume_and_latency()` --uses--> `Method`  [INFERRED]
  tests/test_aggregate.py → src/ariadne/model/entities.py
- `test_rolling_baseline_and_delta()` --uses--> `Method`  [INFERRED]
  tests/test_aggregate.py → src/ariadne/model/entities.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shared Dependency Discrimination Framework** — kiro_steering_the_thesis_thesis_claim, kiro_steering_the_thesis_shared_bank_scenario, kiro_steering_the_thesis_coincidental_incident_e, docs_adapter_fair_baseline, docs_decisions_dr_001 [EXTRACTED 1.00]

## Communities (56 total, 18 thin omitted)

### Community 0 - "Frontend UI Components"
Cohesion: 0.05
Nodes (80): Badge(), Button(), Card(), CardHeader(), cn(), HEALTH_COLOR, inr(), Metric() (+72 more)

### Community 1 - "Graph-Blind Baseline Diagnosis"
Cohesion: 0.07
Nodes (63): baseline_attribute(), Attribution, The fair non-relational baseline (BUILD_SPEC §3.9, DR-001 C1). The STRONGEST…, _worst_method(), attribute(), _bank_score(), _method_fault(), _psp_delta() (+55 more)

### Community 2 - "Decision & Policy Engine"
Cohesion: 0.07
Nodes (53): Action, _decision_id(), disable_method(), do_nothing(), Bounded recovery actions (BUILD_SPEC §3.10, adapter §6). Every action is…, Move a method's traffic from a bad PSP to a healthy sibling. Bounds: to_psp…, Temporarily disable a method. Bound: never disable the LAST working method., Bounded retry for retriable failure codes only. Bound: 1 <= max_retries <= 3. (+45 more)

### Community 3 - "Frontend UI Components"
Cohesion: 0.07
Nodes (44): HEALTH_HEX, TOKENS, Health, Attribution, NodeStat, SimWindow, Topology, buildGraph() (+36 more)

### Community 4 - "Web API & Evaluation Sweep Cache"
Cohesion: 0.09
Nodes (30): BaseModel, get, post, _cache_path(), get_sweep(), _git_commit(), _key(), precompute_default() (+22 more)

### Community 5 - "Transaction Simulation Engine"
Cohesion: 0.13
Nodes (26): Random, SimConfig, _effective_rate(), _failure_code(), generate(), _in_window(), _incident_drop(), Deterministic payment-ecosystem simulator (BUILD_SPEC §3.5, adapter §7). The… (+18 more)

### Community 6 - "Payment Graph Model & Manifest Ingestion"
Cohesion: 0.14
Nodes (27): PSP, A payment company / gateway. Stable id, static attributes only., _as_list(), manifest_to_graph(), NormalizedTopology, Topology ingestion boundary — manifest -> PaymentGraph. The minimum credible…, Validate + convert a manifest into the existing PaymentGraph. Raises…, Raised when a manifest is structurally invalid. Message lists every issue. (+19 more)

### Community 7 - "Transaction Simulation Engine"
Cohesion: 0.13
Nodes (23): active_true_causes(), is_action_audited(), is_no_cause(), is_unsafe_action(), Action, Honest scoring (BUILD_SPEC §3.13). This module is part of eval/ -- the ONLY…, Window-aware RCA: a hit iff the blamed set matches exactly the causes active in…, Every executed action must carry a decision_id, an evidence path, and a… (+15 more)

### Community 8 - "TypeScript Configuration & DOM Types"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules (+15 more)

### Community 9 - "Web API Client & Zod Schemas"
Cohesion: 0.12
Nodes (21): fetchSimulate(), postJSON(), ActionSchema, AttributionSchema, Audit, AuditSchema, ComparisonSideSchema, EvalSideSchema (+13 more)

### Community 10 - "Transaction Simulation Engine"
Cohesion: 0.19
Nodes (18): Same loop as run_once, but returns a per-window TRACE for the API/UI. This is…, run_once_trace(), Reproducible incident batch (BUILD_SPEC §3.12). Mixes all FIVE incident types…, _draw(), IncidentType, make_incident(), Enum, str (+10 more)

### Community 11 - "PostCSS & Dev Tooling"
Cohesion: 0.12
Nodes (17): autoprefixer, postcss, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react, devDependencies (+9 more)

### Community 12 - "React Runtime & Routing Dependencies"
Cohesion: 0.12
Nodes (17): clsx, react, react-dom, react-router-dom, tailwind-merge, dependencies, clsx, react (+9 more)

### Community 13 - "Transaction Simulation Engine"
Cohesion: 0.17
Nodes (14): detect(), A PSP is 'down' when its success rate fell below baseline by more than…, money_recovered(), revenue(action) - revenue(no_action) under the SAME seed/draws. Both re-…, _blamed_ids(), _incident_active(), _incident_windows(), Attribution (+6 more)

### Community 14 - "Payment Topology & Failure Code Tests"
Cohesion: 0.18
Nodes (14): default_graph(), 3 methods, 3 PSPs, 2 banks (DR-001 A1). bank_A is SHARED by PSP-1 & PSP-2 (the…, Regression for audit P2 #6: failure codes are assigned INDEPENDENTLY of whether…, If retry recovered ONLY on incident-caused failures, it would return 0 on a…, _retriable_fraction(), test_incident_failures_do_not_all_get_the_same_code(), test_retriable_fraction_similar_in_incident_and_clean_windows(), test_retry_recovers_on_noise_too() (+6 more)

### Community 15 - "Incident Scenarios & Trace Evaluation"
Cohesion: 0.19
Nodes (8): AuditView(), queryClient, router, AuditPage(), EvaluationPage(), IncidentsPage(), AppShell(), GROUPS

### Community 16 - "Frontend Reconnaissance & Audit"
Cohesion: 0.21
Nodes (8): INCIDENT_OPTIONS, SEEDS, THRESHOLDS, SafetyPanel(), SeedVariancePanel(), EmptyState(), ErrorState(), LoadingState()

### Community 17 - "Web API & Evaluation Sweep Cache"
Cohesion: 0.22
Nodes (12): RunMetrics, A reproducible batch for one seed. Each scenario gets its own SimConfig seeded…, scenario_batch(), compare_systems_on_incident(), discrimination_result(), _mean(), Multi-system comparison, discrimination result, batch + threshold sweep. Split…, Run one seed's full batch (all five incident types) for one system at one… (+4 more)

### Community 18 - "Web API Client & Zod Schemas"
Cohesion: 0.29
Nodes (10): EvaluationView(), fetchAudit(), fetchEvaluation(), fetchIncidents(), fetchTopology(), getJSON(), useAudit(), useEvaluation() (+2 more)

### Community 19 - "Payment Graph Model & Manifest Ingestion"
Cohesion: 0.28
Nodes (6): importTopology(), ImportResult, ConnectPage(), validate(), EXAMPLE_MANIFEST, State

### Community 20 - "Thesis & Build Steering"
Cohesion: 0.25
Nodes (8): ATLAS Domain Adapter for Merchant Payment Ecosystem, ARIA Microscopic Build Spec, DR-001: 3/3/2 Topology, Attribution Formula & Acting Baseline, DR-002: Attribution Branch Disambiguation & Method Concentration Gate, Incident E (Coincidental Failure Control), Incident A (Shared Bank Scenario), Shared Dependency Discrimination Thesis, FastAPI Web API Contract (/api/topology, /api/simulate, /api/evaluation)

### Community 21 - "Web Console Feature 21"
Cohesion: 0.29
Nodes (6): allowScripts, esbuild@0.21.5, name, private, type, version

### Community 22 - "Transaction Simulation Engine"
Cohesion: 0.40
Nodes (6): Whole-incident scoring (used in unit fixtures). A/B/C: the single true node…, root_cause_hit(), _ground_truth(), GroundTruth, ONLY the eval harness may read this. diagnosis/ and baseline/ must not., test_root_cause_hit_scoring()

### Community 23 - "Reporting & Frontier Visualization"
Cohesion: 0.40
Nodes (3): The headline figure (BUILD_SPEC §3.15). Recovery-vs-risk frontier: x =…, A short markdown run report summarising the sweep + discrimination result.…, write_report()

### Community 24 - "Web Console Feature 24"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Knowledge Gaps
- **101 isolated node(s):** `ariadne`, `name`, `private`, `version`, `type` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Method` connect `Decision & Policy Engine` to `Graph-Blind Baseline Diagnosis`, `Web API & Evaluation Sweep Cache`, `Transaction Simulation Engine`, `Payment Graph Model & Manifest Ingestion`, `Transaction Simulation Engine`, `Transaction Simulation Engine`, `Transaction Simulation Engine`, `Payment Topology & Failure Code Tests`, `Transaction Simulation Engine`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `PaymentGraph` connect `Decision & Policy Engine` to `Graph-Blind Baseline Diagnosis`, `Transaction Simulation Engine`, `Payment Graph Model & Manifest Ingestion`, `Transaction Simulation Engine`, `Transaction Simulation Engine`, `Transaction Simulation Engine`, `Payment Topology & Failure Code Tests`, `Transaction Simulation Engine`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `default_graph()` connect `Payment Topology & Failure Code Tests` to `Graph-Blind Baseline Diagnosis`, `Decision & Policy Engine`, `Web API & Evaluation Sweep Cache`, `Transaction Simulation Engine`, `Payment Graph Model & Manifest Ingestion`, `Transaction Simulation Engine`, `Transaction Simulation Engine`, `Transaction Simulation Engine`, `Transaction Simulation Engine`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `Method` (e.g. with `disable_method()` and `reroute()`) actually correct?**
  _`Method` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `PaymentGraph` (e.g. with `disable_method()` and `reroute()`) actually correct?**
  _`PaymentGraph` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `IncidentType` (e.g. with `active_true_causes()` and `is_no_cause()`) actually correct?**
  _`IncidentType` has 30 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ariadne`, `name`, `private` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._