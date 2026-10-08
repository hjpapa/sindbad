from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json, subprocess, re

root=Path.cwd(); folder=root/'docs/validation'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
def dump(p, data):
    p.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))

runtime=load(folder/'s09-mechanics-regression-repair-runtime-hashes.json')
hashes=runtime['before']
changed=[p for p,h in hashes.items() if not (root/p).is_file() or sha256((root/p).read_bytes()).hexdigest()!=h]
assert not changed, changed
restored=[]
for name in ('illustrations.json','art-budget.json','complete-journey.json'):
    assert (folder/name).read_bytes()==(folder/'s09-mechanics-before/validation-reports'/name).read_bytes()
    restored.append(name)
for name in ('PROJECT_STATUS.md','docs/PLAYTEST_LOG.md','docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md'):
    text=(root/name).read_text(encoding='utf-8')
    assert '\ufffd' not in text,name
output=subprocess.check_output(['netstat','-ano'],text=True)
lines=[line for line in output.splitlines() if re.search(r':(?:5174|5175|9323)\s',line)]
listeners=[line for line in lines if 'LISTENING' in line]
assert not listeners,listeners
dump(folder/'s09-mechanics-stopped-servers.json',{'date':datetime.now(timezone.utc).isoformat(),'method':'netstat -ano all interfaces','ports':[5174,5175,9323],'listeners':listeners,'otherSocketStates':lines})
dev=load(folder/'s09-mechanics-development.json')
dev['additionalChecks'].extend([
    {'run':'release2-final','result':'11 passed, 1 failed; exit 1','reason':'M3 continuous-route test called the boss helper before the S09 player and boss were ready. Runtime was unchanged after this run.','evidence':'docs/screenshots/s09-mechanics/primary-test-results/m3-opening-S09-S12-continu-2fe28-d-R03-with-save-safe-bosses/'},
    {'run':'regression-repair','result':'1 passed; exit 0','reason':'Only the M3 test gained a wait for actual player and boss readiness. Typecheck and lint passed. The complete 12/81 cases were not rerun.'},
    {'run':'documentation-helper','result':'Completed by explicitly reading UTF-8 source and compiling it in Python.','reason':'Direct Python source invocation reported an encoding error; explicit Unicode source compilation succeeded. No partial document writes preceded the successful run.'}
])
dump(folder/'s09-mechanics-development.json',dev)
finish=load(folder/'s09-mechanics-finish.json')
finish.update({'finalDiffCheckExitCode':0,'runtimeFilesUnchangedAfterDocs':len(hashes),'restoredReportBytesVerified':restored,'serversListening':listeners,'repairTypecheckExitCode':0,'repairLintExitCode':0})
dump(folder/'s09-mechanics-finish.json',finish)
print(json.dumps({'runtimeFiles':len(hashes),'changed':changed,'reportsRestored':restored,'listeners':listeners,'docsUtf8':True}))
