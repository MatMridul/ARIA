import json
from pathlib import Path
from datetime import datetime, timezone
from graphify.export import to_html
from graphify.detect import save_manifest
from graphify.cli import _stamped_manifest_files
from graphify.build import build_from_json

input_path = str(Path('.').resolve())

# Export HTML
extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding="utf-8"))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8"))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding="utf-8"))
labels     = json.loads(Path('graphify-out/.graphify_labels.json').read_text(encoding="utf-8"))
labels_int = {int(k): v for k, v in labels.items()}

G = build_from_json(extraction, root=input_path, directed=False)
communities = {int(k): v for k, v in analysis['communities'].items()}

# HTML export
to_html(G, communities, 'graphify-out/graph.html', community_labels=labels_int)
print("Generated graphify-out/graph.html")

# Step 9: Save manifest
_corpus = detection.get('all_files') or detection['files']
_manifest_files = _stamped_manifest_files(_corpus, extraction, Path(input_path))
_sem_types = ('document', 'paper', 'image')
_dispatched = {f for t, fl in detection['files'].items() if t in _sem_types for f in fl}
_stamped = {f for fl in _manifest_files.values() for f in fl}
_cleared = _dispatched - _stamped
_scan = {f for fl in _corpus.values() for f in fl}
save_manifest(_manifest_files, root=input_path, scan_corpus=_scan, clear_semantic=_cleared or None)

# Cost tracker
input_tok = extraction.get('input_tokens', 0)
output_tok = extraction.get('output_tokens', 0)

cost_path = Path('graphify-out/cost.json')
if cost_path.exists():
    cost = json.loads(cost_path.read_text(encoding="utf-8"))
else:
    cost = {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}

cost['runs'].append({
    'date': datetime.now(timezone.utc).isoformat(),
    'input_tokens': input_tok,
    'output_tokens': output_tok,
    'files': detection.get('total_files', 0),
})
cost['total_input_tokens'] += input_tok
cost['total_output_tokens'] += output_tok
cost_path.write_text(json.dumps(cost, indent=2, ensure_ascii=False), encoding="utf-8")

print(f'This run: {input_tok:,} input tokens, {output_tok:,} output tokens')
print(f'All time: {cost["total_input_tokens"]:,} input, {cost["total_output_tokens"]:,} output')

# Clean up temp files
for p in [
    Path('graphify-out/.graphify_detect.json'),
    Path('graphify-out/.graphify_extract.json'),
    Path('graphify-out/.graphify_ast.json'),
    Path('graphify-out/.graphify_semantic.json'),
    Path('graphify-out/.graphify_analysis.json')
]:
    p.unlink(missing_ok=True)
print("Manifest saved, HTML exported, and cleanup complete.")
