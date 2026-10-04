"""Preserve native PNGs; uniformly resize whole square canvases, never repaint."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art-source/webtoon'
data = json.loads((SOURCE / 'touch-icons.sources.json').read_text(encoding='utf-8'))
selected = [item for item in data['candidates'] if item['selected']]
assert len(selected) == 9 and len({item['key'] for item in selected}) == 9
for item in data['candidates']:
    assert sha256((ROOT / item['path']).read_bytes()).hexdigest() == item['sha256']
measurements = []
for item in selected:
    with Image.open(ROOT / item['path']) as native:
        native.load()
        assert native.mode == 'RGBA' and native.width == native.height
        alpha = native.getchannel('A')
        visible = alpha.point(lambda n: 255 if n > 16 else 0).getbbox()
        assert visible and 0 < visible[0] < visible[2] < native.width and 0 < visible[1] < visible[3] < native.height
        image = native.resize((512, 512), Image.Resampling.LANCZOS)
    path = SOURCE / item['key']
    image.save(path.with_suffix('.png'), 'PNG', optimize=True)
    image.save(path.with_suffix('.webp'), 'WEBP', lossless=True, quality=100, method=4, exact=True)
    with Image.open(path.with_suffix('.webp')) as encoded:
        assert encoded.mode == 'RGBA' and encoded.tobytes() == image.tobytes()
    measurements.append({'key': item['key'], 'candidate': item['path'], 'nativeSize': item['nativeSize'],
        'sourceSize': [512,512], 'runtimeSize': [128,128],
        'sourceBounds': list(image.getchannel('A').point(lambda n: 255 if n > 16 else 0).getbbox()),
        'method': 'uniform whole-canvas resize; generated alpha preserved; no cropping or repainting'})
(SOURCE / 'touch-icons.measurements.json').write_text(json.dumps(measurements, indent=2)+'\n', encoding='utf-8')
print(f'PASS: {len(selected)} exact lossless RGBA icons; {len(data["candidates"])} native PNG hashes preserved')
