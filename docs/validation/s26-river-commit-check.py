"""Check the validated bytes and list only S26 files for the requested commit."""
from pathlib import Path
from hashlib import sha256
import json
import subprocess

root = Path.cwd()
folder = root / 'docs/validation'
load = lambda p: json.loads(p.read_text(encoding='utf-8'))
freeze = load(folder / 's26-river-repair-runtime-hashes.json')
assert freeze['unchanged'] and freeze['files'] == 1011
changes = [p for p, h in freeze['before'].items()
           if not (root / p).is_file() or sha256((root / p).read_bytes()).hexdigest() != h]
assert not changes, changes
inventory = load(folder / 's26-river-final-screenshots.json')
assert len(inventory) == 42
assert all(sha256((root / item['path']).read_bytes()).hexdigest() == item['sha256']
           for item in inventory)
assert subprocess.check_output(['git', 'diff', '--cached', '--name-only'], text=True).strip() == ''
code = {'src/content/finalStages.ts', 'src/content/maps.ts', 'src/content/reachability.ts',
        'src/game/stage.ts', 'src/core/river.ts', 'tests/e2e/journey-bot.ts',
        'tests/e2e/mobile-abilities.spec.ts', 'tests/e2e/s26-bats.spec.ts',
        'tests/e2e/s26-river.spec.ts', 'tests/unit/river.test.ts'}
docs = {'PROJECT_STATUS.md', 'docs/ART_PROMPTS.md', 'docs/ASSET_REGISTER.md', 'docs/PLAYTEST_LOG.md'}
tracked_changes = set(subprocess.check_output(['git', 'diff', '--name-only'], text=True).splitlines())
assert tracked_changes <= code | docs, tracked_changes - code - docs
files = code | docs
files.update(p.relative_to(root).as_posix() for p in folder.glob('s26-river-*') if p.is_file())
for relative in ('docs/screenshots/s26-river/verified',
                 'docs/validation/s26-river-final-report', 'docs/validation/s26-river-repair-report'):
    files.update(p.relative_to(root).as_posix() for p in (root / relative).rglob('*') if p.is_file())
files.update({'docs/validation/s26-river-commit-files.json', 'docs/validation/s26-river-commit-paths.txt'})
paths = sorted(files)
(folder / 's26-river-commit-paths.txt').write_bytes(('\n'.join(paths) + '\n').encode('utf-8'))
result = {'validatedFilesUnchanged': 1011, 'verifiedScreenshotsUnchanged': 42,
          'checksRerun': False, 'files': paths,
          'localRepeatedCapturesPreserved': True, 'deployment': False}
(folder / 's26-river-commit-files.json').write_bytes((json.dumps(result, indent=2) + '\n').encode('utf-8'))
print(json.dumps({'validatedFilesUnchanged': 1011, 'verifiedScreenshots': 42,
                  'commitFiles': len(paths), 'bytes': sum((root / p).stat().st_size for p in paths)}))
