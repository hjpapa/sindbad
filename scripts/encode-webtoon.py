"""Encode generated originals as lossless WebP; never repaint or crop artwork.

Originals live in art-source/webtoon/. The smaller files the game downloads are
made from them by scripts/optimize-webtoon.py."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'art-source' / 'webtoon'
# The built-in generator returned a 1254px square. Preserve that PNG verbatim;
# normalize the whole sheet (no cropping/repainting) to the requested 512px cells
# before lossless encoding. All other originals keep their native dimensions.
CANONICAL_SIZES = {'hero-action': (1536, 1536)}
for source in sorted(root.glob('*.png')):
    original = Image.open(source).convert('RGBA')
    size = CANONICAL_SIZES.get(source.stem)
    if size and original.size != size:
        assert original.width == original.height and original.width % 3 == 0
        original = original.resize(size, Image.LANCZOS)
        print(f'{source.name}: canonical sheet {size}; native PNG preserved', flush=True)
    target = source.with_suffix('.webp')
    if target.exists() and target.stat().st_size > 0 and target.stat().st_mtime >= source.stat().st_mtime:
        continue
    original.save(target, 'WEBP', lossless=True, quality=100, method=4, exact=True)
    decoded = Image.open(target).convert('RGBA')
    assert original.size == decoded.size
    assert original.getchannel('A').tobytes() == decoded.getchannel('A').tobytes()
    # Some encoders clear invisible RGB where alpha=0; visible pixels must match exactly.
    assert all(a == b or a[3] == b[3] == 0 for a, b in zip(original.getdata(), decoded.getdata()))
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size} bytes; visible RGBA identical', flush=True)
