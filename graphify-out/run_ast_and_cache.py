import json
from pathlib import Path
from graphify.extract import collect_files, extract
from graphify.cache import check_semantic_cache

detect_path = Path('graphify-out/.graphify_detect.json')
detect = json.loads(detect_path.read_text(encoding='utf-8'))

# Part A: AST
code_files = []
for f in detect.get('files', {}).get('code', []):
    p = Path(f)
    code_files.extend(collect_files(p) if p.is_dir() else [p])

if code_files:
    result = extract(code_files, cache_root=Path('.').resolve())
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'AST: {len(result["nodes"])} nodes, {len(result["edges"])} edges')
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}), encoding='utf-8')
    print('No code files')

# Part B0: Cache check for documents and images
all_non_code = [f for cat in ('document', 'paper', 'image') for f in detect['files'].get(cat, [])]
spec_path = r'C:\Users\mridu\.gemini\config\skills\graphify\references\extraction-spec.md'
cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(all_non_code, root=str(Path('.').resolve()), prompt_file=spec_path)

if cached_nodes or cached_edges or cached_hyperedges:
    Path('graphify-out/.graphify_cached.json').write_text(json.dumps({'nodes': cached_nodes, 'edges': cached_edges, 'hyperedges': cached_hyperedges}, ensure_ascii=False), encoding='utf-8')
else:
    Path('graphify-out/.graphify_cached.json').unlink(missing_ok=True)

Path('graphify-out/.graphify_uncached.txt').write_text('\n'.join(uncached), encoding='utf-8')
print(f'Cache: {len(all_non_code)-len(uncached)} files hit, {len(uncached)} files need extraction')
