from pathlib import Path
from hashlib import sha256
import json, shutil, subprocess
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/validation/m6-kite-before'
assert not OUT.exists()
files=[p for folder in ('src','scripts','tests') for p in (ROOT/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files += [ROOT/f for f in ('AGENTS.md','PROJECT_STATUS.md','README.md','docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md','docs/PLAYTEST_LOG.md')]
files += list((ROOT/'docs/validation').glob('*.json'))
files += [ROOT/f for f in ('art-source/webtoon/enemy-actions.json','art-source/webtoon/enemy-actions.webp','public/assets/webtoon/enemy-actions.webp','public/assets/draft/kite.svg')]
rows=[]
for path in sorted(set(files)):
    relative=path.relative_to(ROOT); target=OUT/relative
    target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    rows.append({'path':relative.as_posix(),'sha256':sha256(path.read_bytes()).hexdigest()})
(OUT/'files.json').write_bytes((json.dumps(rows,indent=2)+'\n').encode('utf-8'))
(OUT/'git-status.txt').write_bytes(subprocess.check_output(['git','status','--short'],cwd=ROOT))
print(f'Preserved {len(rows)} files')
