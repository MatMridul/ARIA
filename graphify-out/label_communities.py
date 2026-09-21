import json
from pathlib import Path
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import suggest_questions
from graphify.report import generate
from graphify.export import to_json

input_path = str(Path('.').resolve())

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding="utf-8"))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8"))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding="utf-8"))

G = build_from_json(extraction, root=input_path, directed=False)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

# Generate plain language labels for communities based on constituent nodes
labels = {}
for cid, nodes in communities.items():
    nodes_str = " ".join(nodes).lower()
    if "web_src_design_ui" in nodes_str or "badge" in nodes_str or "button" in nodes_str:
        label = "Frontend UI Components"
    elif "baseline" in nodes_str and "independent" in nodes_str:
        label = "Graph-Blind Baseline Diagnosis"
    elif "decide_actions" in nodes_str or "policy" in nodes_str:
        label = "Decision & Policy Engine"
    elif "tokens" in nodes_str or "health_hex" in nodes_str or "design_tokens" in nodes_str:
        label = "Design Tokens & Presentation Types"
    elif "eval_sweep" in nodes_str or "cache" in nodes_str or "fastapi" in nodes_str or "basemodel" in nodes_str:
        label = "Web API & Evaluation Sweep Cache"
    elif "simulator" in nodes_str or "simconfig" in nodes_str or "cohort" in nodes_str:
        label = "Transaction Simulation Engine"
    elif "manifest" in nodes_str or "model_entities" in nodes_str:
        label = "Payment Graph Model & Manifest Ingestion"
    elif "eval_metrics" in nodes_str or "money_recovered" in nodes_str:
        label = "Evaluation Metrics & Scoring"
    elif "tsconfig" in nodes_str or "ref_dom" in nodes_str:
        label = "TypeScript Configuration & DOM Types"
    elif "web_src_lib_client" in nodes_str or "schemas" in nodes_str:
        label = "Web API Client & Zod Schemas"
    elif "eval_scenarios" in nodes_str or "incidents" in nodes_str or "run_once" in nodes_str:
        label = "Incident Scenarios & Trace Evaluation"
    elif "autoprefixer" in nodes_str or "postcss" in nodes_str:
        label = "PostCSS & Dev Tooling"
    elif "react" in nodes_str or "react_router" in nodes_str:
        label = "React Runtime & Routing Dependencies"
    elif "diagnosis_detect" in nodes_str:
        label = "Detection & Recovery Pipeline"
    elif "test_failure_code" in nodes_str or "model_graph" in nodes_str:
        label = "Payment Topology & Failure Code Tests"
    elif "steering" in nodes_str or "thesis" in nodes_str:
        label = "Thesis & Build Steering"
    elif "recon" in nodes_str or "audit" in nodes_str:
        label = "Frontend Reconnaissance & Audit"
    elif "frontier" in nodes_str or "reporting" in nodes_str:
        label = "Reporting & Frontier Visualization"
    elif "adapter" in nodes_str or "dr_00" in nodes_str:
        label = "Domain Adapter & Decision Records"
    elif "test" in nodes_str:
        label = f"Test Suite Subsystem {cid}"
    elif "web" in nodes_str:
        label = f"Web Console Feature {cid}"
    else:
        # Fallback to dominant node token
        sample = nodes[0].replace("_", " ").title()[:25]
        label = f"{sample} Module ({cid})"
    labels[cid] = label

questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, input_path, suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding="utf-8")
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding="utf-8")

wrote = to_json(G, communities, 'graphify-out/graph.json', community_labels=labels)
print('Report updated with community labels and graph.json exported successfully')
