"""Collect only actual completed run evidence; retain old reports/screenshots."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
V=ROOT/'docs/validation';out=ROOT/'docs/screenshots/m6-kite/final/m6-kite'
full=json.loads((V/'m6-kite-e2e-final.json').read_text(encoding='utf-8'))
assert full['stats']['expected']==60 and full['stats']['unexpected']==1 and full['stats']['skipped']==0 and full['stats']['flaky']==0,full['stats']
freeze=json.loads((V/'m6-kite-final-runtime-hashes.json').read_text());assert freeze['unchanged']
checks=json.loads((V/'m6-kite-release-checks.json').read_text());assert len(checks)==8 and all(item['exitCode']==0 for item in checks)
journey=json.loads((V/'complete-journey.json').read_text(encoding='utf-8'))
assert len(journey['stages'])==36 and journey['errors']==[],journey
assert len(journey['save']['weapons'])==7 and len(journey['save']['treasures'])==7
assert 'ending' in journey['save']['flags']
shutil.copyfile(V/'complete-journey.json',V/'m6-kite-complete-journey.json')
mobile=json.loads((V/'m6-kite-mobile2-output.txt').read_text(encoding='utf-8-sig'))
(V/'m6-kite-mobile2.json').write_bytes((json.dumps(mobile,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
copies=[]
for path in sorted((ROOT/'docs/screenshots/m6-kite/mobile2').glob('*.png')):
    target=out/path.name;shutil.copyfile(path,target);copies.append((path,target))
for path in sorted((ROOT/'docs/screenshots/m6-kite/touch-diagnostic').glob('*.png')):
    target=out/('touch-'+path.name);shutil.copyfile(path,target);copies.append((path,target))
campaign=list((ROOT/'test-results').glob('complete-journey-*/S*-route.png'));assert len(campaign)==7
for path in sorted(campaign):
    target=out/('campaign-'+path.name);shutil.copyfile(path,target);copies.append((path,target))
for source,target in copies:assert source.read_bytes()==target.read_bytes()
screens=[]
for path in sorted(out.glob('*.png')):
    with Image.open(path) as im:
        im.load();size=im.size
    screens.append({'path':path.relative_to(ROOT).as_posix(),'width':size[0],'height':size[1],'sha256':sha256(path.read_bytes()).hexdigest()})
assert len(screens)==69,len(screens)
copydata=[{'source':p.relative_to(ROOT).as_posix(),'target':q.relative_to(ROOT).as_posix(),'byteIdentical':True} for p,q in copies]
(V/'m6-kite-final-screenshots.json').write_bytes((json.dumps({'screens':screens,'copies':copydata,'count':len(screens),'artStatus':'ART_DRAFT'},indent=2)+'\n').encode('utf-8'))
for name in ('art-budget','illustrations'):
    shutil.copyfile(V/f'{name}.json',V/f'm6-kite-{name}.json')
print(json.dumps({'date':datetime.now(timezone.utc).isoformat(),'stats':full['stats'],'frozenFiles':freeze['files'],
 'screens':len(screens),'journey':journey,'touchDiagnostic':json.loads((V/'m6-kite-touch-diagnostic.json').read_text()),
 'mobile2':mobile},ensure_ascii=False,indent=2))
