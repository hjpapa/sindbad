"""Decode originals/runtime and verify complete alpha, measured grip and provenance."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
from PIL import Image
import importlib.util
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('weapon_packing',ROOT/'scripts/pack-weapons.py')
packing=importlib.util.module_from_spec(spec)
spec.loader.exec_module(packing)
source=ROOT/'art-source/weapons'
data=json.loads((source/'weapons.sources.json').read_text(encoding='utf-8'))
measurements=json.loads((source/'weapons.measurements.json').read_text(encoding='utf-8'))
assert len(measurements)==7 and sum(c['selected'] for c in data['candidates'])==7
files=[]
for candidate in data['candidates']:
    raw=ROOT/candidate['path']
    assert sha256(raw.read_bytes()).hexdigest()==candidate['sha256']
    with Image.open(raw) as image:
        assert list(image.size)==candidate['nativeSize']
        if not candidate['selected']:
            continue
        key=candidate['id']
        m=measurements[key]
        assert sha256((ROOT/f'public/assets/weapons/{key}.svg').read_bytes()).hexdigest()==m['svgSha256']
        normalized,_=packing.normalize(image.convert('RGBA'),candidate['measuredGrip'],tuple(m['size']),m['grip'])
    for role,size,path in [('original',tuple(m['size']),source/f'{key}.webp'),
                           ('runtime',(80,160) if key=='W05' else (160,64),ROOT/f'public/assets/weapons/{key}.webp')]:
        with Image.open(path) as image:
            image.load()
            assert image.size==size and image.mode=='RGBA'
            assert image.getchannel('A').getextrema()==(0,255)
            if role=='original':
                assert image.tobytes()==normalized.tobytes()
            px,py=size[0]*m['originX'],size[1]*m['originY']
            assert image.getpixel((round(px),round(py)))[3]>=200
            visible=image.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
            assert visible[0]>0 and visible[1]>0 and visible[2]<size[0] and visible[3]<size[1]
            files.append({'path':path.relative_to(ROOT).as_posix(),'role':role,'size':size,'grip':[px,py],
                'visibleBounds':visible,'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()})
report={'date':datetime.now(timezone.utc).isoformat(),'pass':True,'artStatus':'ART_DRAFT',
    'method':'native hashes, preserved SVG hashes, exact lossless uniform normalization, 14 real decodes, transparent boundaries and opaque measured grip; visual approval separate',
    'nativeCandidates':len(data['candidates']),'files':files}
(ROOT/'docs/validation/weapons.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print('PASS: 7 original + 7 runtime weapons; 8 native PNG and 7 SVG hashes preserved; opaque grip, sizes, transparency and lossless RGBA.')
