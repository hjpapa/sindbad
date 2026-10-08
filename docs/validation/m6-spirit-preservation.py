from pathlib import Path
from hashlib import sha256
import json
ROOT=Path(__file__).resolve().parents[2];V=ROOT/'docs/validation'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
before=V/'m6-spirit-before';rows=read(before/'files.json')
for row in rows:assert sha256((before/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
media=read(V/'m6-spirit-before-media.json')
for key,digest in media.items():assert sha256((ROOT/key).read_bytes()).hexdigest()==digest,key
allowed={'src/content/enemyActions.ts','src/game/stage.ts','src/content/maps.ts','src/content/assets.manifest.ts'}
oldsrc=[r for r in rows if r['path'].startswith('src/') and r['path'] not in allowed]
for row in oldsrc:assert sha256((ROOT/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
natives=[]
for n in ('01','02'):
    local=ROOT/f'art-source/webtoon/generated/spirit-m6/spirit-actions-{n}.png';meta=read(local.with_suffix('.json'));tool=Path(meta['toolPath'])
    assert local.read_bytes()==tool.read_bytes();natives.append({'path':local.relative_to(ROOT).as_posix(),'toolPath':str(tool),'sha256':sha256(local.read_bytes()).hexdigest(),'status':meta['status']})
data={'backups':len(rows),'unchangedMedia':len(media),'unchangedOldSource':len(oldsrc),'allowedChangedSource':sorted(allowed),'natives':natives,'artStatus':'ART_DRAFT'}
(V/'m6-spirit-preservation.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print(json.dumps(data))
