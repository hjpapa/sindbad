from pathlib import Path
from hashlib import sha256
import json, shutil, subprocess
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/validation/m6-roc-before'
assert not OUT.exists()
files=[p for folder in ('src','scripts','tests') for p in (ROOT/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
files += [ROOT/f for f in ('AGENTS.md','PROJECT_STATUS.md','README.md','docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md','docs/PLAYTEST_LOG.md')]
files += list((ROOT/'docs/validation').glob('*.json'))
rows=[]
for p in sorted(set(files)):
    key=p.relative_to(ROOT);q=OUT/key;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
    rows.append({'path':key.as_posix(),'sha256':sha256(p.read_bytes()).hexdigest()})
media={p.relative_to(ROOT).as_posix():sha256(p.read_bytes()).hexdigest() for folder in ('art-source','public/assets') for p in (ROOT/folder).rglob('*') if p.is_file() and p.suffix in ('.png','.webp','.svg')}
(OUT/'files.json').write_bytes((json.dumps(rows,indent=2)+'\n').encode('utf-8'))
(ROOT/'docs/validation/m6-roc-before-media.json').write_bytes((json.dumps(media,indent=2)+'\n').encode('utf-8'))
(OUT/'git-head.txt').write_bytes(subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT))
print(f'Preserved {len(rows)} files; recorded {len(media)} existing media hashes')
