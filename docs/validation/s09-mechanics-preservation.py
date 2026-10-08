from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,sys

root=Path.cwd();folder=root/'docs/validation'
old=json.loads((folder/'m6-roc-regression-repair-runtime-hashes.json').read_text(encoding='utf-8'))['before']
prefix=sys.argv[1] if len(sys.argv)>1 else 's09-mechanics-final'
current=json.loads((folder/f'{prefix}-runtime-hashes.json').read_text(encoding='utf-8'))['before']
allowed={'src/content/finalStages.ts','src/content/storyDesign.ts','src/content/maps.ts','src/content/validate.ts','src/core/save.ts','src/game/stage.ts',
    'tests/unit/roc-actions.test.ts','tests/e2e/journey-bot.ts','tests/e2e/m3-opening.spec.ts','tests/e2e/roc-actions.spec.ts',
    'src/core/rocBoss.ts','src/core/glide.ts','tests/unit/roc-mechanics.test.ts','tests/e2e/roc-mechanics.spec.ts'}
changes=sorted(p for p in old.keys()|current.keys() if old.get(p)!=current.get(p))
unexpected=[p for p in changes if p not in allowed and not p.startswith('dist/')]
assert not unexpected,unexpected
media={p:h for p,h in old.items() if p.startswith(('art-source/','public/'))}
assert all((root/p).is_file() and sha256((root/p).read_bytes()).hexdigest()==h for p,h in media.items())
data={'date':datetime.now(timezone.utc).isoformat(),'baseline':'m6-roc-regression-repair-runtime-hashes.json',
    'unchangedPreviousSourceRuntimeFiles':sum(current.get(p)==h for p,h in old.items()),'originalAndRuntimeAssetsUnchanged':len(media),
    'intentionalChanges':changes,'unexpectedChanges':unexpected,'lockfileAndDependenciesUnchanged':current['package-lock.json']==old['package-lock.json'] and current['package.json']==old['package.json']}
(folder/f'{prefix}-preservation.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print(json.dumps(data),flush=True)
