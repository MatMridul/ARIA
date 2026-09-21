import json
from pathlib import Path

root = Path(r"C:\Mridul\Programs\ARIADNE")

nodes = [
    # Steering & Thesis
    {
        "id": "kiro_steering_the_thesis_thesis_claim",
        "label": "Shared Dependency Discrimination Thesis",
        "file_type": "concept",
        "source_file": str(root / ".kiro" / "steering" / "the-thesis.md"),
        "source_location": "the-thesis.md#L8-L10",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "kiro_steering_the_thesis_shared_bank_scenario",
        "label": "Incident A (Shared Bank Scenario)",
        "file_type": "concept",
        "source_file": str(root / ".kiro" / "steering" / "the-thesis.md"),
        "source_location": "the-thesis.md#L14-L24",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "kiro_steering_the_thesis_coincidental_incident_e",
        "label": "Incident E (Coincidental Failure Control)",
        "file_type": "concept",
        "source_file": str(root / ".kiro" / "steering" / "the-thesis.md"),
        "source_location": "the-thesis.md#L26-L33",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "kiro_steering_ariadne_build_principles_principles",
        "label": "ARIA Build Principles & Invariants",
        "file_type": "rationale",
        "source_file": str(root / ".kiro" / "steering" / "ariadne-build-principles.md"),
        "source_location": "ariadne-build-principles.md#L8-L45",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "kiro_steering_where_everything_lives_spec_map",
        "label": "ARIA Spec & Code Pointer Map",
        "file_type": "document",
        "source_file": str(root / ".kiro" / "steering" / "where-everything-lives.md"),
        "source_location": "where-everything-lives.md#L1-L21",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    # Root README & Release Report
    {
        "id": "readme_aria_system_overview",
        "label": "ARIA System Overview",
        "file_type": "document",
        "source_file": str(root / "README.md"),
        "source_location": "README.md#L1-L82",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "release_report_release_summary",
        "label": "ARIA Release Summary",
        "file_type": "document",
        "source_file": str(root / "RELEASE_REPORT.md"),
        "source_location": "RELEASE_REPORT.md#L1-L50",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    # Docs
    {
        "id": "docs_build_order_phases",
        "label": "Phase-by-Phase Build Order",
        "file_type": "document",
        "source_file": str(root / "docs" / "BUILD_ORDER.md"),
        "source_location": "BUILD_ORDER.md#L12-L75",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_build_spec_contract",
        "label": "ARIA Microscopic Build Spec",
        "file_type": "document",
        "source_file": str(root / "docs" / "BUILD_SPEC.md"),
        "source_location": "BUILD_SPEC.md#L1-L150",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_build_spec_shared_seed_counterfactual",
        "label": "Shared-Seed Counterfactual Protocol",
        "file_type": "rationale",
        "source_file": str(root / "docs" / "BUILD_SPEC.md"),
        "source_location": "BUILD_SPEC.md#L396-L405",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_scope_tiers",
        "label": "ARIA Minimal Scope Tiers (1/2/3)",
        "file_type": "document",
        "source_file": str(root / "docs" / "SCOPE.md"),
        "source_location": "SCOPE.md#L16-L75",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_adapter_domain_model",
        "label": "ATLAS Domain Adapter for Merchant Payment Ecosystem",
        "file_type": "document",
        "source_file": str(root / "docs" / "adapter.md"),
        "source_location": "adapter.md#L1-L100",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_adapter_fair_baseline",
        "label": "Fair Non-Relational Baseline Specification",
        "file_type": "concept",
        "source_file": str(root / "docs" / "adapter.md"),
        "source_location": "adapter.md#L159-L167",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_decisions_dr_001",
        "label": "DR-001: 3/3/2 Topology, Attribution Formula & Acting Baseline",
        "file_type": "rationale",
        "source_file": str(root / "docs" / "decisions" / "DR-001-ariadne-core-design.md"),
        "source_location": "DR-001-ariadne-core-design.md#L1-L199",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_decisions_dr_002",
        "label": "DR-002: Attribution Branch Disambiguation & Method Concentration Gate",
        "file_type": "rationale",
        "source_file": str(root / "docs" / "decisions" / "DR-002-attribution-branch-disambiguation.md"),
        "source_location": "DR-002-attribution-branch-disambiguation.md#L1-L150",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_frontend_recon_audit",
        "label": "ARIA Frontend Reconnaissance & Live Render Audit",
        "file_type": "document",
        "source_file": str(root / "docs" / "FRONTEND_RECON.md"),
        "source_location": "FRONTEND_RECON.md#L1-L100",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "docs_frontend_stack_decision_stack",
        "label": "Frontend Stack Decision (Vite + React + TS)",
        "file_type": "rationale",
        "source_file": str(root / "docs" / "frontend-stack-decision.md"),
        "source_location": "frontend-stack-decision.md#L1-L50",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    # Web & Reports
    {
        "id": "web_contract_api_spec",
        "label": "FastAPI Web API Contract (/api/topology, /api/simulate, /api/evaluation)",
        "file_type": "document",
        "source_file": str(root / "web" / "CONTRACT.md"),
        "source_location": "CONTRACT.md#L1-L100",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "web_frontend_audit_findings",
        "label": "Frontend Codebase Audit Findings",
        "file_type": "document",
        "source_file": str(root / "web" / "FRONTEND_AUDIT.md"),
        "source_location": "FRONTEND_AUDIT.md#L1-L50",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "reports_run_report_evaluation_results",
        "label": "Evaluation Sweep Run Report & Metrics",
        "file_type": "document",
        "source_file": str(root / "reports" / "run_report.md"),
        "source_location": "run_report.md#L1-L50",
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    # Artifact Images
    {
        "id": "artifacts_frontend_recon_01_command_center",
        "label": "Command Center View Screenshot",
        "file_type": "image",
        "source_file": str(root / "artifacts" / "frontend-recon" / "01-command-center.png"),
        "source_location": None,
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "artifacts_frontend_recon_02_topology",
        "label": "Topology Graph View Screenshot",
        "file_type": "image",
        "source_file": str(root / "artifacts" / "frontend-recon" / "02-topology.png"),
        "source_location": None,
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "artifacts_frontend_recon_03_incidents_rca",
        "label": "Incidents & RCA View Screenshot",
        "file_type": "image",
        "source_file": str(root / "artifacts" / "frontend-recon" / "03-incidents-rca.png"),
        "source_location": None,
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    },
    {
        "id": "reports_frontier_plot",
        "label": "Recovery vs. False Intervention Cost Frontier Plot",
        "file_type": "image",
        "source_file": str(root / "reports" / "frontier.png"),
        "source_location": None,
        "source_url": None, "captured_at": None, "author": None, "contributor": None
    }
]

edges = [
    # Thesis and core links
    {
        "source": "kiro_steering_the_thesis_thesis_claim",
        "target": "kiro_steering_the_thesis_shared_bank_scenario",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / ".kiro" / "steering" / "the-thesis.md"),
        "source_location": "the-thesis.md#L12",
        "weight": 1.0
    },
    {
        "source": "kiro_steering_the_thesis_thesis_claim",
        "target": "kiro_steering_the_thesis_coincidental_incident_e",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / ".kiro" / "steering" / "the-thesis.md"),
        "source_location": "the-thesis.md#L26",
        "weight": 1.0
    },
    {
        "source": "docs_adapter_domain_model",
        "target": "kiro_steering_the_thesis_thesis_claim",
        "relation": "implements",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "docs" / "adapter.md"),
        "source_location": "adapter.md#L21-L25",
        "weight": 1.0
    },
    {
        "source": "docs_build_spec_contract",
        "target": "docs_adapter_domain_model",
        "relation": "implements",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "docs" / "BUILD_SPEC.md"),
        "source_location": "BUILD_SPEC.md#L3-L6",
        "weight": 1.0
    },
    {
        "source": "docs_decisions_dr_001",
        "target": "docs_build_spec_contract",
        "relation": "rationale_for",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "docs" / "decisions" / "DR-001-ariadne-core-design.md"),
        "source_location": "DR-001-ariadne-core-design.md#L34-L38",
        "weight": 1.0
    },
    {
        "source": "docs_decisions_dr_002",
        "target": "docs_decisions_dr_001",
        "relation": "conceptually_related_to",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "docs" / "decisions" / "DR-002-attribution-branch-disambiguation.md"),
        "source_location": "DR-002-attribution-branch-disambiguation.md#L1-L15",
        "weight": 1.0
    },
    {
        "source": "web_contract_api_spec",
        "target": "docs_build_spec_contract",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "web" / "CONTRACT.md"),
        "source_location": "CONTRACT.md#L8-L24",
        "weight": 1.0
    },
    {
        "source": "reports_frontier_plot",
        "target": "reports_run_report_evaluation_results",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "reports" / "run_report.md"),
        "source_location": "run_report.md#L1-L20",
        "weight": 1.0
    },
    {
        "source": "docs_frontend_recon_audit",
        "target": "web_frontend_audit_findings",
        "relation": "references",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "docs" / "FRONTEND_RECON.md"),
        "source_location": "FRONTEND_RECON.md#L3-L8",
        "weight": 1.0
    }
]

hyperedges = [
    {
        "id": "shared_dependency_discrimination_suite",
        "label": "Shared Dependency Discrimination Framework",
        "nodes": [
            "kiro_steering_the_thesis_thesis_claim",
            "kiro_steering_the_thesis_shared_bank_scenario",
            "kiro_steering_the_thesis_coincidental_incident_e",
            "docs_adapter_fair_baseline",
            "docs_decisions_dr_001"
        ],
        "relation": "participate_in",
        "confidence": "EXTRACTED",
        "confidence_score": 1.0,
        "source_file": str(root / "docs" / "adapter.md")
    }
]

semantic_output = {
    "nodes": nodes,
    "edges": edges,
    "hyperedges": hyperedges,
    "input_tokens": 12000,
    "output_tokens": 4500
}

Path("graphify-out/.graphify_semantic.json").write_text(json.dumps(semantic_output, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Generated semantic JSON: {len(nodes)} nodes, {len(edges)} edges, {len(hyperedges)} hyperedges")
