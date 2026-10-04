"""Verify preserved evidence, native PNGs and previously verified chest/heart."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
ROOT=Path(__file__).resolve().parents[1]
backup=json.loads((ROOT/'docs/validation/m6-interact-before/backups.json').read_text(encoding='utf-8'))
for item in backup:
    assert sha256((ROOT/item['backup']).read_bytes()).hexdigest()==item['sha256'],item['backup']
sources=json.loads((ROOT/'art-source/webtoon/world-props.sources.json').read_text(encoding='utf-8'))
for item in sources['candidates']:
    original=Path(item['nativePath']) if 'nativePath' in item else None
    copied=ROOT/item['path']
    assert sha256(copied.read_bytes()).hexdigest()==item['sha256']
    if original: assert original.read_bytes()==copied.read_bytes()
old=json.loads((ROOT/'docs/validation/m6-interact-before/docs/validation/world-props.json').read_text(encoding='utf-8'))
for item in old['files']:
    assert sha256((ROOT/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']
report={'date':datetime.now(timezone.utc).isoformat(),'pass':True,'backupFiles':len(backup),
    'nativePngFiles':len(sources['candidates']),'previousChestHeartFiles':len(old['files']),
    'method':'backup SHA256; native copied hashes and byte equality where nativePath recorded; previous chest/heart source and runtime hashes unchanged'}
(ROOT/'docs/validation/m6-interact-preservation.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf-8'))
print(json.dumps(report))
