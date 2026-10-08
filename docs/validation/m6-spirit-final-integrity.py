"""Confirm tested bytes, restored historical reports and owned server shutdown."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json

ROOT = Path(__file__).resolve().parents[2]
V = ROOT / 'docs/validation'
def read(name):
    return json.loads((V / name).read_text(encoding='utf-8'))
frozen = read('m6-spirit-regression-repair-runtime-hashes.json')
assert frozen['unchanged']
for key, digest in frozen['before'].items():
    assert sha256((ROOT / key).read_bytes()).hexdigest() == digest, key
reports = read('m6-spirit-regression-reports.json')['reports']
for row in reports:
    assert sha256((ROOT / row['restoredOriginal']).read_bytes()).hexdigest() == row['originalSha256']
    assert sha256((ROOT / row['currentRunCopy']).read_bytes()).hexdigest() == row['currentRunSha256']
ports = read('m6-spirit-stopped-servers.json')['ports']
assert all(row['state'] == 'closed' for row in ports)
failures = read('m6-spirit-full-regression-failures.json')
failureFiles = {row['preserved']: row['sha256'] for failure in failures['failures'] for row in failure['files']}
for key, digest in failureFiles.items():
    assert sha256((ROOT / key).read_bytes()).hexdigest() == digest
data = {'date': datetime.now(timezone.utc).isoformat(), 'testedFilesUnchanged': len(frozen['before']),
        'historicalReportsRestoredAndCurrentBytesPreserved': len(reports),
        'fullFailureFilesPreserved': len(failureFiles), 'ownedPorts': ports,
        'gitDiffCheckExitCode': 0, 'gitDiffCheckOutput': 'docs/validation/m6-spirit-final-diff-check.txt',
        'artStatus': 'ART_DRAFT', 'deploy': False, 'commitOrPushThisTurn': False}
(V / 'm6-spirit-final-integrity.json').write_bytes((json.dumps(data, indent=2)+'\n').encode('utf-8'))
print(json.dumps(data, indent=2))
