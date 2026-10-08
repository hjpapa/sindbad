from pathlib import Path
import json
v=Path('docs/validation')
def read(name):return json.loads((v/name).read_text(encoding='utf-8'))
rows=[{'report':name,'stats':read(name)['stats']} for name in ('m6-bat-target.json','m6-bat-recheck2.json','m6-bat-recheck3.json')]
data={'completedTargetRuns':rows,'interruptedRun':{'output':'docs/validation/m6-bat-recheck-output.txt','reason':'checkpoint was incorrectly treated as a completed interaction objective; stopped before a full result; no complete JSON result'},
'repairs':['One touch hit lowers HP but does not defeat this existing bat; use the actual second melee attack.',
'Checkpoints save on grounded proximity; observe the saved checkpoint instead of waiting for an interaction objective.',
'Phaser retries aborted loads. Count actual requests and verify every retry is blocked; preserve SVG recovery and require no unexpected errors.'],
'failureEvidence':['docs/screenshots/m6-bat/first-target-failure/','docs/screenshots/m6-bat/second-target-failure/','docs/screenshots/m6-bat/third-target-failure/'],
'documentHelperError':'Python3.9 reported non-UTF-8 source in the Korean document helper; explicit UTF-8 coding declaration repaired it. Files are written with explicit UTF-8 bytes.',
'runtimeRulesChangedForRepairs':False,'deletedOriginals':False,'artStatus':'ART_DRAFT'}
(v/'m6-bat-development.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print(json.dumps(rows))
