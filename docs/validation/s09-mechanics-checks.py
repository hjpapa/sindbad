from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,sys,time

folder=Path('docs/validation');rows=[];prefix=sys.argv[1] if len(sys.argv)>1 else 's09-mechanics-check'
commands=['npm run typecheck','npm run lint','npm run test','npm run validate:content','npm run build','python scripts/audit-webtoon.py','npx tsx scripts/check-art-budget.ts']
for i,command in enumerate(commands,1):
    started=datetime.now(timezone.utc).isoformat();began=time.monotonic();path=folder/f'{prefix}-{i}.txt'
    with path.open('wb') as log:result=subprocess.run(command,shell=True,stdout=log,stderr=subprocess.STDOUT)
    rows.append({'command':command,'exitCode':result.returncode,'started':started,'seconds':round(time.monotonic()-began,3),'log':path.as_posix()})
    (folder/f'{prefix}s.json').write_bytes((json.dumps(rows,indent=2)+'\n').encode('utf-8'))
    print(json.dumps(rows[-1]),flush=True)
    if result.returncode:sys.exit(result.returncode)
