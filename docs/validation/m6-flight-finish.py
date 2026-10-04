"""Gather only this run's real final evidence, preserving prior reports."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json, shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
V=ROOT/'docs/validation'
full=json.loads((V/'m6-flight-e2e-final.json').read_text(encoding='utf-8'))
assert full['stats']['expected']==57 and all(full['stats'][key]==0 for key in ('unexpected','flaky','skipped'))
freeze=json.loads((V/'m6-flight-final-runtime-hashes.json').read_text(encoding='utf-8'))
assert freeze['unchanged'] and not freeze['changes']
target=ROOT/'docs/screenshots/m6-flight/final/m6-flight'
assert len(list(target.glob('*.png')))==28
copies=[]
for path in (ROOT/'docs/screenshots/m6-flight/mobile').glob('*.png'):
    copies.append((path,target/path.name))
assert len(copies)==6
journey=json.loads((V/'complete-journey.json').read_text(encoding='utf-8'))
assert journey['errors']==[]
assert len(journey['stages'])==36 and len(journey['save']['weapons'])==7 and len(journey['save']['treasures'])==7
assert 'ending' in journey['save']['flags']
assert datetime.fromisoformat(journey['date'].replace('Z','+00:00'))>=datetime.fromisoformat(full['stats']['startTime'].replace('Z','+00:00'))
shutil.copyfile(V/'complete-journey.json',V/'m6-flight-complete-journey.json')
campaign=list((ROOT/'test-results').glob('complete-journey-*/S*-route.png'))
assert len(campaign)==7
copies.extend((path,target/f'campaign-{path.name}') for path in campaign)
for original,dest in copies:
    assert original.stat().st_mtime >= datetime.fromisoformat(full['stats']['startTime'].replace('Z','+00:00')).timestamp() or 'mobile' in original.parts
    assert not dest.exists(),'Preserve prior final evidence'
    shutil.copyfile(original,dest);assert original.read_bytes()==dest.read_bytes()
items=[]
for path in sorted(target.glob('*.png')):
    with Image.open(path) as image:
        image.load();assert image.format=='PNG'
        size=list(image.size)
    original=next((a for a,b in copies if b==path),path)
    items.append({'path':path.relative_to(ROOT).as_posix(),'original':original.relative_to(ROOT).as_posix(),'size':size,'sha256':sha256(path.read_bytes()).hexdigest()})
assert len(items)==41
report={'date':datetime.now(timezone.utc).isoformat(),'status':'ART_DRAFT','screenshots':items,'copiedScreenshots':len(copies),'stats':full['stats'],'frozenFiles':freeze['files'],'method':'real final flight captures 28; mobile smoke 6; this fresh campaign 7; PNG decode and byte-identical copies. Save fixtures are distinct from the fresh campaign; physical devices and final art approval unverified.'}
(V/'m6-flight-final-screenshots.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf-8'))
print(json.dumps({'stats':full['stats'],'screenshots':len(items),'copies':len(copies),'frozenFiles':freeze['files']}))
