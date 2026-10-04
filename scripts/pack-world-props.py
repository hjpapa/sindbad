"""Normalize complete generated 3:4 canvases; preserve alpha, never crop/paint."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
from world_prop_pixels import normalize_world_prop

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art-source/webtoon'
data = json.loads((SOURCE / 'world-props.sources.json').read_text(encoding='utf-8'))
measurements = []
for item in data['candidates']:
    path = ROOT / item['path']
    assert sha256(path.read_bytes()).hexdigest() == item['sha256']
    with Image.open(path) as native:
        native.load()
        if not item['selected']: continue
        image, transform = normalize_world_prop(native)
    target = SOURCE / item['key']
    image.save(target.with_suffix('.png'), 'PNG', optimize=True)
    image.save(target.with_suffix('.webp'), 'WEBP', lossless=True, quality=100, method=4, exact=True)
    with Image.open(target.with_suffix('.webp')) as encoded:
        assert encoded.mode == 'RGBA' and encoded.tobytes() == image.tobytes()
    measurements.append({'key':item['key'],'nativeSize':item['nativeSize'],'sourceSize':[384,512],
        'runtimeSize':[96,128],'sourceBounds':list(image.getchannel('A').point(lambda n:255 if n>16 else 0).getbbox()),
        'method':'uniform whole-canvas contain with transparent padding; generated alpha preserved; no crop/repainting',
        'transform':transform,
        'displaySize':{'normal':[34.56,46.08],'large':[48,64]} if item['key']=='prop-heart' else
            [129.6,172.8] if item['key']=='prop-flight-ring' else
            {'base':[91.2,121.6],'pulseFactor':[0.96,1.04]} if item['key']=='prop-gust-cloud' else
            {'base':[67.2,89.6],'pulseFactor':[0.96,1.04]} if item['key']=='prop-falling-debris' else [65.28,87.04]})
(SOURCE/'world-props.measurements.json').write_text(json.dumps(measurements,indent=2)+'\n',encoding='utf-8')
print(f'PASS: {len(measurements)} exact lossless RGBA world props; native hashes preserved')
