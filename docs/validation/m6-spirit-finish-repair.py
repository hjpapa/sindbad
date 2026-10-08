# -*- coding: utf-8 -*-
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
V = ROOT / 'docs/validation'
def read(name):
    return json.loads((V / name).read_text(encoding='utf-8'))
def write(name, data):
    (V / name).write_bytes((json.dumps(data, ensure_ascii=False, indent=2)+'\n').encode('utf-8'))

report = read('m6-spirit-regression-repair.json')
assert report['stats']['expected'] == 5 and report['stats']['unexpected'] == 0
assert report['stats']['skipped'] == 0 and report['stats']['flaky'] == 0
frozen = read('m6-spirit-regression-repair-runtime-hashes.json')
assert frozen['unchanged']
original = read('m6-spirit-final-runtime-hashes.json')
assert original['unchanged']
changes = sorted(key for key in original['before'].keys() | frozen['before'].keys()
                 if original['before'].get(key) != frozen['before'].get(key))
assert changes == ['tests/e2e/m2.spec.ts', 'tests/e2e/siren-actions.spec.ts'], changes
checks = read('m6-spirit-repair-checks.json')
assert len(checks) == 3 and all(row['exitCode'] == 0 for row in checks)
evidence = ROOT / 'docs/screenshots/m6-spirit/regression-repair'
evidence.mkdir(parents=True, exist_ok=True)
for label in ('frontal-shield', 'recovery-hit'):
    paths = list((ROOT / 'test-results').rglob(f'S05-{label}.png'))
    assert len(paths) == 1
    target = evidence / paths[0].name
    shutil.copyfile(paths[0], target)
    assert target.read_bytes() == paths[0].read_bytes()
for device in ('phone', 'tablet'):
    for mode in ('normal', 'fallback'):
        source = evidence / f'm6-siren/{device}-{mode}.json'
        data = json.loads(source.read_text(encoding='utf-8'))
        assert data['errors'] == []
        shutil.copyfile(source, V / f'm6-spirit-repaired-siren-{device}-{mode}.json')
screens = []
for path in sorted(evidence.rglob('*.png')):
    with Image.open(path) as im:
        im.load()
        size = im.size
    screens.append({'path': path.relative_to(ROOT).as_posix(), 'size': size,
                    'sha256': sha256(path.read_bytes()).hexdigest()})
assert len(screens) == 34, len(screens)
write('m6-spirit-regression-repair-screenshots.json', {'count': len(screens), 'screens': screens})
result = {'date': datetime.now(timezone.utc).isoformat(),
          'full': {'report': 'docs/validation/m6-spirit-e2e-final.json', 'exitCode': 1,
                   'stats': read('m6-spirit-e2e-final.json')['stats']},
          'targeted': {'report': 'docs/validation/m6-spirit-regression-repair.json',
                       'exitCode': 0, 'stats': report['stats']},
          'changesAfterFull': changes,
          'unchangedGameAssetsBuildAndOtherFiles': len(frozen['before'])-len(changes),
          'targetRunFrozenFiles': frozen['files'], 'targetRunUnchanged': True,
          'screenshots': len(screens), 'staticRechecks': checks,
          'repairs': ['Guardian waits for a new frontal telegraph after recovery; HP blocking and subsequent recovery damage remain asserted.',
                      'Siren actor/shot observations use a single read-only simulation snapshot before screenshot encoding; exact shot counts and velocities remain asserted.'],
          'limitation': 'Full 73-case suite was not repeated after these two E2E-only repairs. Do not report a single 73-pass full run.'}
write('m6-spirit-regression-repair-summary.json', result)
post = read('m6-spirit-postcheck.json')
post['regressionRepair'] = result
write('m6-spirit-postcheck.json', post)
print(json.dumps({'full': result['full']['stats'], 'targeted': report['stats'],
                  'changedOnly': changes, 'repairScreenshots': len(screens)}, indent=2))
