from pathlib import Path
import json,subprocess
ROOT=Path(__file__).resolve().parents[2]
names=['a7-final-screenshots.json','a8-final-screenshots.json','m6-props-final-screenshots.json','m6-interact-final-screenshots.json','m6-flight-final-screenshots.json','m6-kite-final-screenshots.json','m6-kite-postcheck.json']
paths=set()
def walk(value):
    if isinstance(value,dict):
        for key,entry in value.items():
            if key in ('path','preserved','target') and isinstance(entry,str) and entry.startswith('docs/screenshots/') and (ROOT/entry).is_file():paths.add(entry)
            else:walk(entry)
    elif isinstance(value,list):
        for entry in value:walk(entry)
for name in names:walk(json.loads((ROOT/'docs/validation'/name).read_text(encoding='utf-8')))
paths.update(f'docs/screenshots/m6-kite/record-fix/art-a6/{name}.json' for name in ('weapon-art','weapon-fallback'))
out=ROOT/'docs/validation/commit-completed-art-paths.txt';out.write_bytes(('\n'.join(sorted(paths))+'\n').encode('utf-8'))
print(json.dumps({'finalEvidenceFiles':len(paths),'bytes':sum((ROOT/p).stat().st_size for p in paths)},indent=2))
