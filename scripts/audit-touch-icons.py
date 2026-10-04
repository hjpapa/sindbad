"""Audit nine original PNG/lossless WebP pairs and the actual 128px DOM PNGs."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art-source/webtoon'
data = json.loads((SOURCE / 'touch-icons.sources.json').read_text(encoding='utf-8'))
selected = [item for item in data['candidates'] if item['selected']]
assert len(selected) == 9
for item in data['candidates']:
    assert sha256((ROOT / item['path']).read_bytes()).hexdigest() == item['sha256']
files = []
for item in selected:
    with Image.open(ROOT / item['path']) as native:
        native.load()
        expected = native.resize((512,512), Image.Resampling.LANCZOS)
    for extension in ('png','webp'):
        with Image.open(SOURCE / f'{item["key"]}.{extension}') as source:
            source.load()
            assert source.mode == 'RGBA' and source.size == (512,512)
            assert source.tobytes() == expected.tobytes()
    runtime = expected.resize((128,128), Image.Resampling.LANCZOS)
    for folder,extension,size in [('art-source/webtoon','png',512),('art-source/webtoon','webp',512),('public/assets/webtoon','png',128)]:
        path = ROOT / folder / f'{item["key"]}.{extension}'
        with Image.open(path) as image:
            image.load()
            assert image.mode == 'RGBA' and image.size == (size,size)
            if size == 128: assert image.tobytes() == runtime.tobytes()
            alpha = image.getchannel('A')
            assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 240
            bounds = alpha.point(lambda n: 255 if n > 16 else 0).getbbox()
            assert bounds and 0 < bounds[0] < bounds[2] < size and 0 < bounds[1] < bounds[3] < size
            files.append({'path':path.relative_to(ROOT).as_posix(),'size':[size,size],'format':image.format,
                'bounds':list(bounds),'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()})
out = ROOT / 'docs/validation/touch-icons.json'
out.write_text(json.dumps({'date':datetime.now(timezone.utc).isoformat(),'pass':True,'artStatus':'ART_DRAFT',
    'method':'native PNG hashes; exact whole-canvas normalization and lossless RGBA; 27 original/runtime decodes; transparent visible bounds (alpha >16); visual approval separate',
    'nativeCount':len(data['candidates']),'selectedCount':len(selected),'files':files},indent=2)+'\n',encoding='utf-8')
print(f'PASS: {len(files)} icon files; {len(data["candidates"])} native hashes; 9 actual 128px PNGs')
