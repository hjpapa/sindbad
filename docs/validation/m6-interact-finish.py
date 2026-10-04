"""Collect actual final-run evidence without changing game or asset files."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
VALID=ROOT/'docs/validation'
report=json.loads((VALID/'m6-interact-e2e-final.json').read_text(encoding='utf-8'))
assert report['stats']['expected']==53 and not any(report['stats'].get(k,0) for k in ('unexpected','flaky','skipped'))
freeze=json.loads((VALID/'m6-interact-final-runtime-hashes.json').read_text(encoding='utf-8'))
assert freeze['unchanged'] and not freeze['changes']
started=datetime.fromisoformat(freeze['started']).timestamp()
screens=ROOT/'docs/screenshots/m6-interact/final/m6-interact'
screens.mkdir(parents=True,exist_ok=True)
copied=[]
for path in sorted((ROOT/'docs/screenshots/m6-interact/mobile').glob('*.png')):
    target=screens/f'mobile-{path.name}'
    shutil.copyfile(path,target);assert path.read_bytes()==target.read_bytes()
    copied.append({'source':path.relative_to(ROOT).as_posix(),'path':target.relative_to(ROOT).as_posix()})
journey=VALID/'complete-journey.json'
assert journey.stat().st_mtime>=started
target=VALID/'m6-interact-complete-journey.json'
shutil.copyfile(journey,target);assert journey.read_bytes()==target.read_bytes()
for stage in ('S05','S10','S15','S19','S25','S29','S36'):
    matches=list((ROOT/'test-results').glob(f'complete-journey-*/{stage}-route.png'))
    assert len(matches)==1,(stage,matches)
    path=matches[0];assert path.stat().st_mtime>=started
    target=screens/f'campaign-{stage}-route.png'
    shutil.copyfile(path,target);assert path.read_bytes()==target.read_bytes()
    copied.append({'source':path.relative_to(ROOT).as_posix(),'path':target.relative_to(ROOT).as_posix()})
files=[]
for name in ('S01-boss-cleared','S02-boomerang','S03-storm-crystal','S04-moving-whale','S04-whale-face','S05-bubble-golden','S06-first-flame','S07-boat','S07-cave-resume','S07-wave-warning','S08-mirrors','S08-hidden-journal'):
    matches=list((ROOT/'test-results').glob(f'*/{name}.png'))
    assert len(matches)==1,(name,matches)
    path=matches[0];assert path.stat().st_mtime>=started
    target=screens/f'play-{name}.png'
    shutil.copyfile(path,target);assert path.read_bytes()==target.read_bytes()
    copied.append({'source':path.relative_to(ROOT).as_posix(),'path':target.relative_to(ROOT).as_posix()})
for path in sorted([*screens.glob('*.png'),*(ROOT/'docs/screenshots/m6-interact/final/m6-props').glob('*.png')]):
    with Image.open(path) as image:
        image.load();assert image.format=='PNG'
        files.append({'path':path.relative_to(ROOT).as_posix(),'size':list(image.size),
            'sha256':sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
for name,target in [('world-props.json','m6-interact-art.json'),('art-budget.json','m6-interact-art-budget.json')]:
    shutil.copyfile(VALID/name,VALID/target)
mobile=json.loads((VALID/'m6-interact-mobile-output.txt').read_text(encoding='utf-8-sig'))
assert not mobile['phone']['errors'] and not mobile['tablet']['errors']
(VALID/'m6-interact-mobile.json').write_bytes((json.dumps(mobile,indent=2)+'\n').encode('utf-8'))
plan=json.loads((VALID/'m6-interact-plan.json').read_text(encoding='utf-8'))
plan['status']='implemented; actual map/fallback and gameplay regression verified; ART_DRAFT'
for item in plan['items']:item['status']='implemented; runtime mapping verified; ART_DRAFT'
(VALID/'m6-interact-plan.json').write_bytes((json.dumps(plan,indent=2)+'\n').encode('utf-8'))
result={'date':datetime.now(timezone.utc).isoformat(),'pass':True,'stats':report['stats'],
    'runtimeFilesUnchanged':freeze['files'],'screenshots':files,'copied':copied,
    'method':'fresh complete journey and PNGs from final run; byte-identical copy; actual PNG decoding and SHA256; screenshots of map starts only show their viewport',
    'artStatus':'ART_DRAFT'}
(VALID/'m6-interact-final-screenshots.json').write_bytes((json.dumps(result,indent=2)+'\n').encode('utf-8'))
print(json.dumps({'stats':report['stats'],'screenshots':len(files),'copied':len(copied),'runtimeFiles':freeze['files']}))
