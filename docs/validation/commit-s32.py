from pathlib import Path
from hashlib import sha256
import json,subprocess

root=Path.cwd();folder=root/'docs/validation'
baseline=json.loads((folder/'s32-rescue-caption-runtime-hashes.json').read_text(encoding='utf-8'))['before']
assert all((root/p).is_file() and sha256((root/p).read_bytes()).hexdigest()==h for p,h in baseline.items())
screens=json.loads((folder/'s32-rescue-final-screenshots.json').read_text(encoding='utf-8'))
assert all(sha256((root/p['path']).read_bytes()).hexdigest()==p['sha256'] for p in screens)
paths=['PROJECT_STATUS.md','docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md','docs/PLAYTEST_LOG.md','src/content/finalStages.ts','src/content/maps.ts','src/content/storyDesign.ts','src/content/validate.ts','src/core/adventure.ts','src/core/storyMechanics.ts','src/core/rescue.ts','src/game/stage.ts','tests/unit/spirit-actions.test.ts','tests/unit/rescue.test.ts','tests/e2e/s32-rescue.spec.ts','docs/validation/deployment-4e14c40-inspection.json','docs/validation/commit-s32.py']
paths += [p['path'] for p in screens]
paths += [p.relative_to(root).as_posix() for p in folder.glob('s32-rescue-*') if p.is_file()]
for name in ['first','final','verified','caption']:
    paths += [p.relative_to(root).as_posix() for p in (folder/f's32-rescue-{name}-report').rglob('*') if p.is_file()]
for name in ['caption/s32-rescue','verified/m6-spirit']:
    paths += [p.relative_to(root).as_posix() for p in (root/'docs/screenshots/s32-rescue'/name).glob('*.json')]
for name in ['first-test-results/s32-rescue-S32-legacy-resc-28ad1-ayable-without-paying-twice','final-test-results/s32-rescue-tablet-S32-join-f0368-and-restores-one-R07-reward']:
    paths += [p.relative_to(root).as_posix() for p in (root/'docs/screenshots/s32-rescue'/name).rglob('*') if p.is_file()]
paths=sorted(set(paths));manifest=folder/'s32-rescue-commit-files.json'
manifest.write_text(json.dumps({'runtimeHashesVerified':len(baseline),'screenshotsVerified':len(screens),'files':paths},indent=2)+'\n',encoding='utf-8')
paths.append(manifest.relative_to(root).as_posix())
spec=folder/'s32-rescue-commit-pathspec.tmp';spec.write_bytes(b'\0'.join(p.encode('utf-8') for p in paths)+b'\0')
subprocess.run(['git','add','-f',f'--pathspec-from-file={spec.relative_to(root).as_posix()}','--pathspec-file-nul'],check=True)
subprocess.run(['git','diff','--cached','--check'],check=True)
print(json.dumps({'stagedFiles':len(paths),'runtimeHashesVerified':len(baseline),'screenshotsVerified':len(screens)}))
