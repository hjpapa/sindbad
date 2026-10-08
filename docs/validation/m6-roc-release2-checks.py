from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,sys
folder=Path('docs/validation');rows=[]
commands=['python scripts/optimize-webtoon.py','python scripts/audit-webtoon.py','npm run typecheck','npm run lint','npm run test','npm run validate:content','npm run build','npx tsx scripts/check-art-budget.ts']
for i,command in enumerate(commands,1):
    started=datetime.now(timezone.utc).isoformat();path=folder/f'm6-roc-release2-check-{i}.txt'
    with path.open('wb') as log:result=subprocess.run(command,shell=True,stdout=log,stderr=subprocess.STDOUT)
    rows.append({'command':command,'exitCode':result.returncode,'started':started,'finished':datetime.now(timezone.utc).isoformat(),'log':path.as_posix()})
    (folder/'m6-roc-release2-checks.json').write_bytes((json.dumps(rows,indent=2)+'\n').encode('utf-8'))
    print(json.dumps(rows[-1]),flush=True)
    if result.returncode:sys.exit(result.returncode)
