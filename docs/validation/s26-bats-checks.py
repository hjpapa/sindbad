from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,time

root=Path.cwd(); folder=root/'docs/validation'; results=[]
commands=[['npm.cmd','run','typecheck'],['npm.cmd','run','lint'],['npm.cmd','run','test'],['npm.cmd','run','validate:content'],['npm.cmd','run','build'],['npx.cmd','tsx','scripts/check-art-budget.ts']]
for i,command in enumerate(commands,1):
    path=folder/f's26-bats-final-check-{i}.txt';assert not path.exists(),path
    started=time.monotonic();date=datetime.now(timezone.utc).isoformat()
    with path.open('wb') as output:result=subprocess.run(command,cwd=root,stdout=output,stderr=subprocess.STDOUT)
    results.append({'command':' '.join(command).replace('.cmd',''),'exitCode':result.returncode,'started':date,'seconds':round(time.monotonic()-started,3),'log':path.relative_to(root).as_posix()})
    (folder/'s26-bats-final-checks.json').write_bytes((json.dumps(results,indent=2)+'\n').encode('utf-8'))
    print(json.dumps(results[-1]),flush=True)
    if result.returncode:raise SystemExit(result.returncode)
