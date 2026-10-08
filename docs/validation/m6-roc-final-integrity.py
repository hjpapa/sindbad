from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,sys
root=Path(__file__).resolve().parents[2];v=root/'docs/validation'
read=lambda p:json.loads((root/p).read_text(encoding='utf-8'))
digest=lambda p:sha256(p.read_bytes()).hexdigest()
name=sys.argv[1] if len(sys.argv)>1 else 'm6-roc-final'
frozen=read(f'docs/validation/{name}-runtime-hashes.json');assert frozen['unchanged']
for key,value in frozen['before'].items():assert digest(root/key)==value,key
media=read('docs/validation/m6-roc-before-media.json');assert len(media)==575
for key,value in media.items():assert digest(root/key)==value,key
before=v/'m6-roc-before';rows=read('docs/validation/m6-roc-before/files.json')
allowed={'src/content/assets.manifest.ts','src/content/enemyActions.ts','src/content/maps.ts','src/game/stage.ts','scripts/audit-webtoon.py','scripts/optimize-webtoon.py','tests/unit/enemy-actions.test.ts','tests/e2e/spirit-actions.spec.ts'}
changed=[]
for row in rows:
    key=row['path'];assert digest(before/key)==row['sha256'],key
    if key.startswith(('src/','scripts/','tests/')) and digest(root/key)!=row['sha256']:
        assert key in allowed,key;changed.append(key)
reports=read('docs/validation/m6-roc-regression-reports.json')['reports']
for row in reports:
    assert digest(root/row['restoredOriginal'])==row['originalSha256']
    assert digest(root/row['currentRunCopy'])==row['currentRunSha256']
ports=read('docs/validation/m6-roc-stopped-servers.json')['ports'];assert all(row['state']=='closed' for row in ports)
failures=[]
for folder in ('first-target-failure','second-target-failure','third-target-failure','full-regression-failure'):
    for p in (root/f'docs/screenshots/m6-roc/{folder}').rglob('*'):
        if p.is_file():failures.append({'path':p.relative_to(root).as_posix(),'sha256':digest(p)})
for failure in read('docs/validation/m6-roc-full-regression-failures.json')['failures']:
    for row in failure['files']:assert digest(root/row['path'])==row['sha256']
out={'date':datetime.now(timezone.utc).isoformat(),'testedFilesUnchanged':len(frozen['before']),
     'originalMediaUnchanged':len(media),'backupFilesVerified':len(rows),'allowedExistingCodeChanges':changed,
     'historicalReportsRestored':len(reports),'failureFilesPreserved':failures,'ownedPorts':ports,
     'artStatus':'ART_DRAFT','commitPushDeployThisTurn':False}
(v/'m6-roc-final-integrity.json').write_bytes((json.dumps(out,indent=2)+'\n').encode('utf-8'))
print(json.dumps({k:val for k,val in out.items() if k!='failureFilesPreserved'}))
