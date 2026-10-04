from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];V=ROOT/'docs/validation'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,data):p.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
before=V/'m6-siren-before';old=read(before/'files.json')
for row in old:assert sha256((before/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
media=read(V/'m6-siren-before-media.json')
for key,digest in media.items():assert sha256((ROOT/key).read_bytes()).hexdigest()==digest,key
allowed={'src/content/enemyActions.ts','src/game/stage.ts','src/content/maps.ts','src/content/assets.manifest.ts'}
oldsrc=[r for r in old if r['path'].startswith('src/') and r['path'] not in allowed]
for row in oldsrc:assert sha256((ROOT/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
natives=[]
for n in ('01','02'):
    meta=read(ROOT/f'art-source/webtoon/generated/siren-m6/siren-actions-{n}.json')
    local=ROOT/f'art-source/webtoon/generated/siren-m6/siren-actions-{n}.png';tool=Path(meta['toolPath'])
    assert local.read_bytes()==tool.read_bytes();natives.append({'path':local.relative_to(ROOT).as_posix(),'toolPath':str(tool),'sha256':sha256(local.read_bytes()).hexdigest(),'status':meta['status']})
write(V/'m6-siren-preservation.json',{'backups':len(old),'unchangedMedia':len(media),'unchangedOldSource':len(oldsrc),'allowedChangedSource':sorted(allowed),'natives':natives,'artStatus':'ART_DRAFT'})
full=read(V/'m6-siren-e2e-final.json');checks=read(V/'m6-siren-release-checks.json');assert all(c['exitCode']==0 for c in checks)
frozen=read(V/'m6-siren-final-runtime-hashes.json');assert frozen['unchanged']
primary=ROOT/'docs/screenshots/m6-siren/final/m6-siren';primary.mkdir(parents=True,exist_ok=True);copies=[]
for device in ('phone','tablet'):
    for mode in ('normal','fallback'):
        source=primary/f'{device}-{mode}.json';data=read(source);assert data['errors']==[]
        shutil.copyfile(source,V/f'm6-siren-{device}-{mode}.json')
mobile=read(V/'m6-siren-mobile.json')
for device in ('phone','tablet'):
    for label in ('start','swing','dialogue'):
        source=ROOT/f'docs/screenshots/m6-siren/mobile/mobile-{device}-{label}.png';target=primary/source.name
        shutil.copyfile(source,target);assert source.read_bytes()==target.read_bytes();copies.append({'source':source.relative_to(ROOT).as_posix(),'preserved':target.relative_to(ROOT).as_posix()})
journey=ROOT/'docs/validation/complete-journey.json';campaign=read(journey)
assert len(campaign['stages'])==36 and campaign['errors']==[]
shutil.copyfile(journey,V/'m6-siren-complete-journey.json')
for path in sorted((ROOT/'test-results').rglob('*-route.png')):
    target=primary/f'campaign-{path.name}';shutil.copyfile(path,target);assert path.read_bytes()==target.read_bytes()
    copies.append({'source':path.relative_to(ROOT).as_posix(),'preserved':target.relative_to(ROOT).as_posix()})
screens=[]
for path in sorted(primary.glob('*.png')):
    with Image.open(path) as im:im.load();size=im.size
    screens.append({'path':path.relative_to(ROOT).as_posix(),'size':size,'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()})
write(V/'m6-siren-final-screenshots.json',{'screens':screens,'verifiedCopies':copies,'count':len(screens)})
budget=read(V/'art-budget.json');shutil.copyfile(V/'art-budget.json',V/'m6-siren-art-budget.json')
write(V/'m6-siren-postcheck.json',{'date':datetime.now(timezone.utc).isoformat(),'fullStats':full['stats'],'staticCommands':len(checks),'units':111,'frozenFiles':frozen['files'],'screenshots':len(screens),'mediaPreserved':len(media),'backupsPreserved':len(old),'budgetBytes':budget['totalBytes'],'campaign':campaign['stages'],'mobile':mobile,'artStatus':'ART_DRAFT','previousCommit':'9727657','push':'blocked by automatic review; explicit payload/destination approval pending','deploy':False,'unverified':['physical phone/tablet','iOS Safari','child usability','long-run FPS/heat','physical speaker mix','final user art approval']})
print(json.dumps({'stats':full['stats'],'screenshots':len(screens),'copies':len(copies),'budget':budget['totalBytes'],'backups':len(old),'media':len(media)},indent=2))
