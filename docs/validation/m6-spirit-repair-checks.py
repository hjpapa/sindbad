"""Recheck TypeScript and unit contracts after E2E-only observation repairs."""
from pathlib import Path
from datetime import datetime, timezone
import json
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
V = ROOT / 'docs/validation'
results = []
for number, name in enumerate(('typecheck', 'lint', 'test'), 1):
    started = datetime.now(timezone.utc).isoformat()
    clock = time.monotonic()
    output = V / f'm6-spirit-repair-check-{number}.txt'
    with output.open('wb') as log:
        result = subprocess.run(['cmd.exe', '/c', 'npm.cmd', 'run', name], cwd=ROOT,
                                stdout=log, stderr=subprocess.STDOUT)
    results.append({'command': f'npm run {name}', 'started': started,
                    'exitCode': result.returncode, 'seconds': round(time.monotonic()-clock, 2),
                    'output': output.relative_to(ROOT).as_posix()})
    print(json.dumps(results[-1]), flush=True)
    if result.returncode:
        break
(V / 'm6-spirit-repair-checks.json').write_bytes(
    (json.dumps(results, indent=2) + '\n').encode('utf-8'))
assert len(results) == 3 and all(row['exitCode'] == 0 for row in results)
