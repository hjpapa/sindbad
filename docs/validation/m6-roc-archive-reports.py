"""Preserve this run's legacy report output, then restore previous reports."""
from pathlib import Path
from hashlib import sha256
import json,shutil
ROOT=Path(__file__).resolve().parents[2];V=ROOT/'docs/validation';before=V/'m6-roc-before'
records=json.loads((before/'files.json').read_text(encoding='utf-8'));rows=[]
out=V/'m6-roc-regression-reports';out.mkdir(exist_ok=True)
for row in records:
    key=row['path']
    if not key.startswith('docs/validation/') or not key.endswith('.json'):continue
    path=ROOT/key;old=before/key
    assert sha256(old.read_bytes()).hexdigest()==row['sha256']
    digest=sha256(path.read_bytes()).hexdigest()
    if digest==row['sha256']:continue
    preserved=out/path.name;assert not preserved.exists()
    shutil.copyfile(path,preserved);assert sha256(preserved.read_bytes()).hexdigest()==digest
    shutil.copyfile(old,path);assert sha256(path.read_bytes()).hexdigest()==row['sha256']
    rows.append({'restoredOriginal':key,'originalSha256':row['sha256'],'currentRunCopy':preserved.relative_to(ROOT).as_posix(),'currentRunSha256':digest})
(V/'m6-roc-regression-reports.json').write_bytes((json.dumps({'method':'Legacy tests/audits write fixed report names. Current-run bytes preserved under a unique folder; exact previous report bytes restored from pre-task backup. No evidence deleted.','reports':rows},indent=2)+'\n').encode('utf-8'))
print(f'Preserved current outputs and restored {len(rows)} prior report originals')
