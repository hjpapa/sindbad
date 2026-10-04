from pathlib import Path
from hashlib import sha256
import json
ROOT=Path(__file__).resolve().parents[2]
BEFORE=ROOT/'docs/validation/m6-kite-before'
rows=json.loads((BEFORE/'files.json').read_text(encoding='utf-8'))
for row in rows:assert sha256((BEFORE/row['path']).read_bytes()).hexdigest()==row['sha256']
changed={'src/content/enemyActions.ts','src/content/assets.manifest.ts','src/content/finalStages.ts','src/game/stage.ts'}
unchanged=[]
for row in rows:
    key=row['path']
    if (key.startswith('src/') and key not in changed) or key in ('art-source/webtoon/enemy-actions.json','art-source/webtoon/enemy-actions.webp','public/assets/webtoon/enemy-actions.webp','public/assets/draft/kite.svg'):
        assert sha256((ROOT/key).read_bytes()).hexdigest()==row['sha256'],key
        unchanged.append(key)
old=(BEFORE/'src/content/finalStages.ts').read_text(encoding='utf-8')
new=(ROOT/'src/content/finalStages.ts').read_text(encoding='utf-8')
assert old.replace("kind:'kite' as const,hp:","kind:'kite' as const,actionArt:'kite' as const,hp:")==new
native_dir=Path('C:/Users/tbose/.codex/generated_images/01a10013-499c-7b11-9c12-3ae8826e542a')
native=[]
for source,target in [('exec-028feba0-2c38-4bd4-81f6-a92b9eeaed7e.png','kite-actions-01-rejected.png'),('exec-b7184a37-c641-4be9-8f10-bb3bc05bf4e0.png','kite-actions-02.png')]:
    p=ROOT/'art-source/webtoon/generated/kite-m6'/target
    assert p.read_bytes()==(native_dir/source).read_bytes()
    native.append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha256(p.read_bytes()).hexdigest()})
report={'backupFiles':len(rows),'backupAllIntact':True,'unchanged':unchanged,'unchangedCount':len(unchanged),
        'mapsOnlyActionArtAdded':True,'nativeOriginals':native,'artStatus':'ART_DRAFT'}
prior=json.loads((BEFORE/'docs/validation/m6-flight-final-runtime-hashes.json').read_text(encoding='utf-8'))['before']
media=[]
for key,digest in prior.items():
    if key.startswith(('art-source/','public/assets/')) and Path(key).suffix in ('.png','.webp','.svg'):
        assert sha256((ROOT/key).read_bytes()).hexdigest()==digest,key
        media.append(key)
report.update(priorMediaUnchanged=media,priorMediaCount=len(media))
(ROOT/'docs/validation/m6-kite-preservation.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf-8'))
print(f'PASS: {len(rows)} backups; {len(unchanged)} prior sources/atlas/SVG and {len(media)} prior media unchanged; 2 native PNGs preserved; only kite actionArt added to maps')
