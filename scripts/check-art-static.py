"""Run the documented static art checks in order and retain actual logs."""
from pathlib import Path
from datetime import datetime, timezone
import json, subprocess, sys, time
ROOT=Path(__file__).resolve().parents[1]
name=sys.argv[1]
assert name.replace('-','').isalnum()
commands=[['python','scripts/optimize-webtoon.py'],['python','scripts/audit-webtoon.py'],
    ['npm.cmd','run','typecheck'],['npm.cmd','run','lint'],['npm.cmd','run','test'],
    ['npm.cmd','run','validate:content'],['npm.cmd','run','build'],['npx.cmd','tsx','scripts/check-art-budget.ts']]
records=[]
report=ROOT/f'docs/validation/{name}-checks.json'
assert not report.exists(),'preserve existing validation report'
for index,command in enumerate(commands,1):
    path=ROOT/f'docs/validation/{name}-check-{index}.txt'
    started=datetime.now(timezone.utc).isoformat();at=time.monotonic()
    with path.open('w',encoding='utf-8') as output:
        result=subprocess.run(command,cwd=ROOT,stdout=output,stderr=subprocess.STDOUT)
    records.append({'command':' '.join(command).replace('.cmd',''),'started':started,'exitCode':result.returncode,
        'seconds':round(time.monotonic()-at,2),'output':path.relative_to(ROOT).as_posix()})
    report.write_bytes((json.dumps(records,indent=2)+'\n').encode('utf-8'))
    print(f'{index}/8 exit {result.returncode}: {records[-1]["command"]}',flush=True)
    if result.returncode:sys.exit(result.returncode)
