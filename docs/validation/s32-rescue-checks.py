from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,time,sys

root=Path.cwd();folder=root/'docs/validation';results=[];tag=sys.argv[1] if len(sys.argv)>1 else 's32-rescue'
commands=[['npm.cmd','run','typecheck'],['npm.cmd','run','lint'],['npm.cmd','run','test'],['npm.cmd','run','validate:content'],['npm.cmd','run','build'],['npx.cmd','tsx','scripts/check-art-budget.ts']]
budget=folder/'art-budget.json';original=budget.read_bytes() if budget.exists() else None
try:
    for i,command in enumerate(commands,1):
        path=folder/f'{tag}-check-{i}.txt';assert not path.exists(),path
        started=time.monotonic();date=datetime.now(timezone.utc).isoformat()
        with path.open('wb') as output:result=subprocess.run(command,cwd=root,stdout=output,stderr=subprocess.STDOUT)
        results.append({'command':' '.join(command).replace('.cmd',''),'exitCode':result.returncode,'started':date,'seconds':round(time.monotonic()-started,3),'log':path.relative_to(root).as_posix()})
        (folder/f'{tag}-checks.json').write_bytes((json.dumps(results,indent=2)+'\n').encode('utf-8'))
        print(json.dumps(results[-1]),flush=True)
        if result.returncode:raise SystemExit(result.returncode)
    if budget.exists():(folder/f'{tag}-art-budget.json').write_bytes(budget.read_bytes())
finally:
    if original is not None:budget.write_bytes(original)
