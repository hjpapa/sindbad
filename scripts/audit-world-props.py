"""Audit generated provenance, exact lossless sources, runtime bounds and SVGs."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
from PIL import Image
from world_prop_pixels import normalize_world_prop

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art-source/webtoon'
data = json.loads((SOURCE/'world-props.sources.json').read_text(encoding='utf-8'))
selected = [item for item in data['candidates'] if item['selected']]
planned=json.loads((ROOT/'docs/validation/m6-interact-plan.json').read_text(encoding='utf-8'))
flight=json.loads((ROOT/'docs/validation/m6-flight-plan.json').read_text(encoding='utf-8'))
assert len(selected)==30 and {item['key'] for item in selected}=={'prop-chest','prop-heart',*(item['key'] for item in planned['items']),*(item['key'] for item in flight['items'])}
for item in data['candidates']:
    assert sha256((ROOT/item['path']).read_bytes()).hexdigest() == item['sha256']
for name,digest in data['legacyHashes'].items():
    assert sha256((ROOT/'public/assets/draft'/f'{name}.svg').read_bytes()).hexdigest() == digest
for path,digest in data['preservedSvgHashes'].items():
    assert sha256((ROOT/path).read_bytes()).hexdigest()==digest
files = []
for item in selected:
    with Image.open(ROOT/item['path']) as native:
        native.load()
        expected, _ = normalize_world_prop(native)
    for folder,extension,size in [('art-source/webtoon','png',(384,512)),('art-source/webtoon','webp',(384,512)),('public/assets/webtoon','webp',(96,128))]:
        path = ROOT/folder/f'{item["key"]}.{extension}'
        with Image.open(path) as image:
            image.load()
            assert image.mode == 'RGBA' and image.size == size
            if folder.startswith('art-source'): assert image.tobytes() == expected.tobytes()
            alpha = image.getchannel('A')
            assert alpha.getextrema() == (0,255)
            bounds = alpha.point(lambda n:255 if n>16 else 0).getbbox()
            assert bounds and 0 < bounds[0] < bounds[2] < size[0] and 0 < bounds[1] < bounds[3] < size[1]
            files.append({'path':path.relative_to(ROOT).as_posix(),'size':list(size),'bounds':list(bounds),
                'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()})
(ROOT/'docs/validation/world-props.json').write_text(json.dumps({'date':datetime.now(timezone.utc).isoformat(),
    'pass':True,'status':'ART_DRAFT','method':'native SHA256; exact RGBA normalized PNG/lossless WebP; runtime decode and alpha >16 bounds; preserved SVG hashes; final visual approval separate','files':files},indent=2)+'\n',encoding='utf-8')
print(f'PASS: {len(files)} world prop files; native and legacy SVG hashes preserved')
