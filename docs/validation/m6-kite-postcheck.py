from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];V=ROOT/'docs/validation'
full=json.loads((V/'m6-kite-e2e-final.json').read_text(encoding='utf-8'));repair=json.loads((V/'m6-kite-record-fix.json').read_text(encoding='utf-8'))
assert full['stats']['expected']==60 and full['stats']['unexpected']==1
assert repair['stats']['expected']==2 and repair['stats']['unexpected']==0 and repair['stats']['skipped']==0 and repair['stats']['flaky']==0
first=json.loads((V/'m6-kite-final-runtime-hashes.json').read_text(encoding='utf-8'));second=json.loads((V/'m6-kite-record-fix-runtime-hashes.json').read_text(encoding='utf-8'))
assert first['unchanged'] and second['unchanged']
a,b=first['before'],second['before'];changes=sorted(key for key in a.keys()|b.keys() if a.get(key)!=b.get(key))
assert changes==['tests/e2e/weapon-art.spec.ts'],changes
shots=[]
for path in sorted((ROOT/'docs/screenshots/m6-kite/record-fix').rglob('*.png')):
    with Image.open(path) as im:im.load();size=im.size
    shots.append({'path':path.relative_to(ROOT).as_posix(),'size':size,'sha256':sha256(path.read_bytes()).hexdigest()})
for name in ('weapon-art','weapon-fallback'):
    report=json.loads((ROOT/f'docs/screenshots/m6-kite/record-fix/art-a6/{name}.json').read_text(encoding='utf-8'))
    assert report['pass'] and report['errors']==[]
doc={'method':'Full60passed/1Windows report-open failure; after changing only weapon test report paths, isolated2passed. Not an uninterrupted61pass full run.',
 'fullStats':full['stats'],'recordRepairStats':repair['stats'],'fullFrozenFiles':first['files'],'repairFrozenFiles':second['files'],'betweenRunsChanged':changes,
 'gameRuntimeAssetsBuildUnchangedAcrossRuns':True,'unitTests':109,'staticChecks':8,'primaryScreenshots':69,'repairScreenshots':shots,
 'artStatus':'ART_DRAFT','commit':False,'push':False,'deploy':False,
 'unverified':['physical phone/tablet','iOS Safari','child usability','long-run FPS/heat','physical speaker mix','final user art approval']}
doc.update(fullRunExitCode=1,recordRepairExitCode=0,repairScreenshotCount=len(shots),gitDiffCheckExitCode=0,
           stoppedServerChecks={'5174':'ECONNREFUSED','5175':'ECONNREFUSED'},
           nativeToolPaths=[
               'C:/Users/tbose/.codex/generated_images/01a10013-499c-7b11-9c12-3ae8826e542a/exec-028feba0-2c38-4bd4-81f6-a92b9eeaed7e.png',
               'C:/Users/tbose/.codex/generated_images/01a10013-499c-7b11-9c12-3ae8826e542a/exec-b7184a37-c641-4be9-8f10-bb3bc05bf4e0.png'])
(V/'m6-kite-postcheck.json').write_bytes((json.dumps(doc,indent=2)+'\n').encode('utf-8'))
print(json.dumps({key:doc[key] for key in ('fullStats','recordRepairStats','fullFrozenFiles','repairFrozenFiles','betweenRunsChanged','primaryScreenshots')},indent=2))
print(f'Repair screenshots {len(shots)} decoded')
