"""Preserve the pre-flight sources and prior flat reports before changing them."""
from pathlib import Path
from hashlib import sha256
import json, shutil, subprocess, sys
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/validation/m6-flight-before'
if len(sys.argv)>1:
    rows=json.loads((OUT/'files.json').read_text(encoding='utf-8'))
    for item in rows:
        assert sha256((OUT/item['path']).read_bytes()).hexdigest()==item['sha256']
    print(f'PASS: {len(rows)} preserved pre-flight files')
    sys.exit(0)
assert not OUT.exists(), 'Preserve prior backups'
files=[p for folder in ('src','scripts','tests') for p in (ROOT/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files += [ROOT/f for f in ('AGENTS.md','PROJECT_STATUS.md','README.md','docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md','docs/PLAYTEST_LOG.md')]
files += list((ROOT/'docs/validation').glob('*.json'))
files += [ROOT/'art-source/webtoon/world-props.sources.json',ROOT/'art-source/webtoon/world-props.measurements.json']
files += [ROOT/f'public/assets/draft/{key}.svg' for key in ('flightRing','stormCloud','debris')]
rows=[]
for path in sorted(set(files)):
    relative=path.relative_to(ROOT); target=OUT/relative
    target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    rows.append({'path':relative.as_posix(),'sha256':sha256(path.read_bytes()).hexdigest()})
(OUT/'files.json').write_bytes((json.dumps(rows,indent=2)+'\n').encode('utf-8'))
(OUT/'git-status.txt').write_bytes(subprocess.check_output(['git','status','--short'],cwd=ROOT))
print(f'Preserved {len(rows)} files')
