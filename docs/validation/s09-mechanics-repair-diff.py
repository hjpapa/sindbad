from pathlib import Path
from datetime import datetime,timezone
import json

folder=Path('docs/validation')
old=json.loads((folder/'s09-mechanics-release2-final-runtime-hashes.json').read_text(encoding='utf-8'))['before']
new=json.loads((folder/'s09-mechanics-regression-repair-runtime-hashes.json').read_text(encoding='utf-8'))['before']
changes=sorted(p for p in old.keys()|new.keys() if old.get(p)!=new.get(p))
assert changes==['tests/e2e/m3-opening.spec.ts'],changes
data={'date':datetime.now(timezone.utc).isoformat(),'changes':changes,'runtimeAssetsBuildUnchanged':True,'reason':'Wait for actual S09 player and boss readiness before calling the battle helper; no game change.'}
(folder/'s09-mechanics-repair-code-diff.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print(json.dumps(data))
