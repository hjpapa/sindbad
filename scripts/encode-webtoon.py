"""Encode generated originals as lossless WebP; never repaint or crop artwork."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public' / 'assets' / 'webtoon'
for source in sorted(root.glob('*.png')):
    original = Image.open(source).convert('RGBA')
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
