"""Normalize complete generated material canvases and encode lossless originals.

Native candidates remain byte-identical PNGs. Fill canvases scale uniformly;
top canvases normalize to the contracted flat 512x136 material-strip geometry.
No repainting, edge blending, silhouette cutting or generated seam fixes.
"""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'art-source/terrain'
data = json.loads((source / 'terrain.sources.json').read_text(encoding='utf-8'))
assert len(data['selected']) == 34
for candidate in data['candidates']:
    original = (source / candidate['file']).read_bytes()
    assert sha256(original).hexdigest() == candidate['sha256']
    if Path(candidate['source']).exists():
        assert Path(candidate['source']).read_bytes() == original
for key, filename in data['selected'].items():
    native = Image.open(source/filename).convert('RGBA')
    assert native.getchannel('A').getextrema() == (255, 255), (key, 'opaque terrain required')
    size = (512, 512 if key.endswith('-fill') else 136)
    image = native.resize(size, Image.Resampling.LANCZOS)
    image.save(source/f'{key}.png')
    out = source/f'{key}.webp'
    image.save(out, 'WEBP', lossless=True, quality=100, method=4, exact=True)
    decoded = Image.open(out).convert('RGBA')
    assert decoded.size == size and image.tobytes() == decoded.tobytes()
    print(f'{key}: native{native.size} -> {size}, lossless visible RGBA identical')
print('PASS: 34 lossless originals, every native candidate preserved.')
