from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,subprocess,re
from PIL import Image

root=Path.cwd();folder=root/'docs/validation'
def read(name):return json.loads((folder/name).read_text(encoding='utf-8'))
def write(name,data):
    path=folder/name;assert not path.exists(),path
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
old=read('s26-river-repair-runtime-hashes.json')['before']
first=read('s32-rescue-first-runtime-hashes.json');second=read('s32-rescue-final-runtime-hashes.json');broad=read('s32-rescue-verified-runtime-hashes.json');final=read('s32-rescue-caption-runtime-hashes.json')
assert first['unchanged'] and second['unchanged'] and broad['unchanged'] and final['unchanged']
actual=final['before'];media=[p for p in old if p.startswith(('art-source/','public/'))]
assert all(old[p]==actual.get(p) for p in media)
dependencies=['package.json','package-lock.json','vite.config.ts','playwright.config.ts','tsconfig.json']
assert all(old[p]==actual.get(p) for p in dependencies)
changed=sorted(p for p in old.keys()|actual.keys() if old.get(p)!=actual.get(p))
allowed={'src/content/finalStages.ts','src/content/maps.ts','src/content/storyDesign.ts','src/content/validate.ts','src/core/adventure.ts','src/core/storyMechanics.ts','src/core/rescue.ts','src/game/stage.ts','tests/unit/spirit-actions.test.ts','tests/unit/rescue.test.ts','tests/e2e/s32-rescue.spec.ts'}
unexpected=[p for p in changed if p not in allowed and not p.startswith('dist/')];assert not unexpected,unexpected
screens=[]
for surface in ['docs/screenshots/s32-rescue/verified/m6-spirit','docs/screenshots/s32-rescue/caption/s32-rescue']:
    for path in sorted((root/surface).rglob('*.png')):
        with Image.open(path) as im:size=im.size
        screens.append({'path':path.relative_to(root).as_posix(),'width':size[0],'height':size[1],'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()})
for path in sorted((root/'docs/screenshots/s32-rescue/verified-test-results').rglob('S25-physical-bridge.png')):
    with Image.open(path) as im:size=im.size
    screens.append({'path':path.relative_to(root).as_posix(),'width':size[0],'height':size[1],'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()})
write('s32-rescue-final-screenshots.json',screens)
primary=read('s32-rescue-e2e-first.json')['stats'];beforeSeal=read('s32-rescue-e2e-final.json')['stats'];verified=read('s32-rescue-e2e-verified.json')['stats'];caption=read('s32-rescue-e2e-caption.json')['stats'];assert all(s['unexpected']==0 and s['skipped']==0 and s['flaky']==0 for s in (verified,caption))
write('s32-rescue-development.json',{'first':primary,'firstExitCode':1,'preservedFailure':'docs/screenshots/s32-rescue/first-test-results/s32-rescue-S32-legacy-resc-28ad1-ayable-without-paying-twice/','reason':'Legacy XP assertion included a real heart pickup (XP2); measured before combat after walking instead. No enemy reward duplicated.','inspectionRepairs':['Separate captive caption from neighbouring journal caption and include it in label decluttering.','Use actual floor intervals when snapping Ariana across the balcony seam.'],'beforeRepairTest':'docs/validation/s32-rescue-before-repair.test.ts.txt','beforeCaptionSource':'docs/validation/s32-rescue-before-caption.stage.ts.txt','beforeSealFix':beforeSeal,'beforeSealFixExitCode':1,'sealFailure':'At x2027.56 the passive seal x2052 was selected instead of the active light x2000. Exclude gates opened by another proof from interaction; test explicitly from the seal side and leave until the actual position is outside the channel radius.','preservedSealFailure':'docs/screenshots/s32-rescue/final-test-results/s32-rescue-tablet-S32-join-f0368-and-restores-one-R07-reward/','beforeSealSource':'docs/validation/s32-rescue-before-seal.stage.ts.txt','beforeSealTest':'docs/validation/s32-rescue-before-seal.test.ts.txt','final':verified,'finalExitCode':0})
diff=subprocess.run(['git','diff','--check'],cwd=root,capture_output=True);(folder/'s32-rescue-final-diff-check.txt').write_bytes(diff.stdout+diff.stderr);assert diff.returncode==0
net=subprocess.run(['netstat','-ano'],capture_output=True,text=True)
listeners=[line.strip() for line in net.stdout.splitlines() if 'LISTENING' in line and re.search(r':(?:5174|5175|9323)\s',line)]
report={'date':datetime.now(timezone.utc).isoformat(),'checks':read('s32-rescue-caption-checks.json'),'unitTests':135,'unitFiles':30,'e2ePrimary':primary,'e2eBeforeSealFix':beforeSeal,'e2eBroadVerified':verified,'e2eFinal':caption,'e2eFinalExitCode':0,'afterBroadChanges':sorted(p for p in broad['before'].keys()|actual.keys() if broad['before'].get(p)!=actual.get(p)),'captionScope':'After all selected 10 passed, only opened-seal completion caption and read-only observation/assertions were added. Re-ran all 7 S32 conditions; three unrelated regression conditions are from the prior 10-pass run.','runtimeFilesUnchangedPerRun':len(actual),'previousMediaUnchanged':len(media),'dependenciesUnchanged':True,'changed':changed,'unexpected':unexpected,'screenshots':len(screens),'budgetBytes':read('s32-rescue-caption-art-budget.json')['totalBytes'],'budgetReportRestored':sha256((folder/'art-budget.json').read_bytes()).hexdigest()==sha256(subprocess.run(['git','show','HEAD:docs/validation/art-budget.json'],capture_output=True,check=True).stdout).hexdigest(),'listeners':listeners,'artStatus':'ART_DRAFT','newWorkCommitted':False,'push':False,'deployment':'none for this task; previous automatic deployment inspection retained','unverified':['full E2E suite','new-game 36-stage completion after these changes','all selected 10 rerun after the final opened-seal caption change (affected S32 7 rerun)','physical phones/tablets and iOS Safari','child usability and sustained FPS/heat/audio','final illustration approval'],'baselineNote':'Ordinary sandbox snapshot attempted before edits failed with WinError5. Previous validated S26 runtime snapshot supplies unchanged original/asset/dependency baseline; all four S32 runs use fresh host snapshots.'}
write('s32-rescue-finish.json',report)
print(json.dumps({k:report[k] for k in ('unitTests','e2eFinal','runtimeFilesUnchangedPerRun','previousMediaUnchanged','screenshots','budgetBytes','budgetReportRestored','listeners')},ensure_ascii=False))
