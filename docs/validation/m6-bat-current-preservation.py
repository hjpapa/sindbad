from pathlib import Path
from hashlib import sha256
import json
root=Path('.');v=root/'docs/validation';before=v/'m6-bat-before'
records=json.loads((before/'files.json').read_text(encoding='utf-8'))
for r in records:assert sha256((before/r['path']).read_bytes()).hexdigest()==r['sha256']
media=json.loads((v/'m6-bat-before-media.json').read_text(encoding='utf-8'))
for path,digest in media.items():assert sha256((root/path).read_bytes()).hexdigest()==digest,path
allowed={'src/content/enemyActions.ts','src/content/maps.ts','src/content/assets.manifest.ts','src/game/stage.ts'}
unchanged=[r for r in records if r['path'].startswith('src/') and r['path'] not in allowed]
for r in unchanged:assert sha256((root/r['path']).read_bytes()).hexdigest()==r['sha256']
native=root/'art-source/webtoon/generated/bat-m6/bat-actions-01.png'
meta=json.loads(native.with_suffix('.json').read_text(encoding='utf-8'));assert native.read_bytes()==Path(meta['toolPath']).read_bytes()
report={'backupFiles':len(records),'unchangedMedia':len(media),'unchangedOldSources':len(unchanged),'allowedChangedSources':sorted(allowed),'nativeEqualsTool':True,'nativeSha256':sha256(native.read_bytes()).hexdigest(),'artStatus':'ART_DRAFT'}
(v/'m6-bat-current-preservation.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf-8'))
print(json.dumps(report))
