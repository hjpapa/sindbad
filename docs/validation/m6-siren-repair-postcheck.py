from pathlib import Path
from hashlib import sha256
import json,shutil
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];V=ROOT/'docs/validation'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
first=read(V/'m6-siren-final-runtime-hashes.json');second=read(V/'m6-siren-wave-repair-runtime-hashes.json')
assert first['unchanged'] and second['unchanged']
a,b=first['before'],second['before'];changes=sorted(k for k in a.keys()|b.keys() if a.get(k)!=b.get(k))
assert changes==['tests/e2e/flame-waves.spec.ts'],changes
repair=read(V/'m6-siren-wave-repair.json');assert repair['stats']['expected']==1 and repair['stats']['unexpected']==0
screens=[];folder=ROOT/'docs/screenshots/m6-siren/wave-repair';folder.mkdir(parents=True,exist_ok=True)
for p in sorted((ROOT/'test-results').rglob('*.png')):
    q=folder/p.name;assert not q.exists();shutil.copyfile(p,q);assert p.read_bytes()==q.read_bytes()
    with Image.open(q) as im:im.load();size=im.size
    screens.append({'source':p.relative_to(ROOT).as_posix(),'preserved':q.relative_to(ROOT).as_posix(),'size':size,'sha256':sha256(q.read_bytes()).hexdigest()})
data=read(V/'m6-siren-postcheck.json');data.update(fullRunExitCode=1,repairExitCode=0,repairStats=repair['stats'],repairFrozenFiles=second['files'],betweenRunsChanged=changes,gameRuntimeAssetsBuildUnchangedAcrossRuns=True,repairScreenshots=screens,restoredPriorReports=len(read(V/'m6-siren-regression-reports.json')['reports']))
(V/'m6-siren-postcheck.json').write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(json.dumps({k:data[k] for k in ('fullStats','repairStats','betweenRunsChanged','restoredPriorReports')},indent=2))
print(f'{len(screens)} repair screenshots preserved and decoded')
