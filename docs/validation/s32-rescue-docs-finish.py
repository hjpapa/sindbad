from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,subprocess

root=Path.cwd();folder=root/'docs/validation'
before=json.loads((folder/'s32-rescue-caption-runtime-hashes.json').read_text(encoding='utf-8'))['before']
changed=[p for p,h in before.items() if not (root/p).is_file() or sha256((root/p).read_bytes()).hexdigest()!=h]
assert not changed,changed
result=subprocess.run(['git','diff','--check'],capture_output=True);assert result.returncode==0
(folder/'s32-rescue-docs-diff-check.txt').write_bytes(result.stdout+result.stderr)
report={'date':datetime.now(timezone.utc).isoformat(),'runtimeFiles':len(before),'runtimeUnchangedAfterDocs':True,'diffExitCode':result.returncode,'head':subprocess.run(['git','rev-parse','HEAD'],capture_output=True,text=True,check=True).stdout.strip(),'documents':['PROJECT_STATUS.md','docs/PLAYTEST_LOG.md','docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md'],'newWorkCommitted':False,'push':False,'deployCommand':False}
(folder/'s32-rescue-docs-finish.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
