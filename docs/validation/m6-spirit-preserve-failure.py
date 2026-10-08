from pathlib import Path
from hashlib import sha256
import json,shutil,sys
ROOT=Path(__file__).resolve().parents[2];out=ROOT/f'docs/screenshots/m6-spirit/{sys.argv[1]}';assert not out.exists();rows=[]
for path in (ROOT/'test-results').rglob('*'):
    if not path.is_file():continue
    target=out/path.relative_to(ROOT/'test-results');target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    assert path.read_bytes()==target.read_bytes();rows.append({'source':path.relative_to(ROOT).as_posix(),'preserved':target.relative_to(ROOT).as_posix(),'sha256':sha256(target.read_bytes()).hexdigest()})
(out/'files.json').write_bytes((json.dumps(rows,indent=2)+'\n').encode('utf-8'));print(f'Preserved {len(rows)} failure files')
