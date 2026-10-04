"""Freeze actual source/assets/build and tests before/after a full local run."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
import sys
ROOT=Path(__file__).resolve().parents[1]
phase,name=sys.argv[1:3]
out=ROOT/f'docs/validation/{name}-runtime-hashes.json'
def snapshot():
    files=[p for folder in ('src','public','dist','scripts','tests','art-source')
        for p in (ROOT/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
    files += [ROOT/f for f in ('package.json','package-lock.json','index.html','vite.config.ts','playwright.config.ts','tsconfig.json')]
    return {p.relative_to(ROOT).as_posix():sha256(p.read_bytes()).hexdigest() for p in sorted(files)}
if phase=='start':
    assert not out.exists(),'preserve previous validation snapshots'
    data={'started':datetime.now(timezone.utc).isoformat(),'method':'SHA256 of actual source, runtime, built files, scripts/tests and new originals before/after full E2E','before':snapshot()}
else:
    data=json.loads(out.read_text(encoding='utf-8'))
    after=snapshot()
    changes=sorted(p for p in data['before'].keys()|after.keys() if data['before'].get(p)!=after.get(p))
    data.update(finished=datetime.now(timezone.utc).isoformat(),files=len(after),unchanged=not changes,changes=changes)
    assert not changes,changes
out.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
print(f'{phase}: {len(data["before"])} actual file hashes'+('; all unchanged' if phase!='start' else ''))
