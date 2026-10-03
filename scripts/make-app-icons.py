"""Home-screen icons built from the hero illustration (art-source/webtoon).

    python scripts/make-app-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

SOURCE = Path('art-source/webtoon/hero-webtoon.webp')
OUT = Path('public/icons')


def icon(size: int) -> Image.Image:
    canvas = Image.new('RGBA', (size, size), (16, 45, 59, 255))
    draw = ImageDraw.Draw(canvas)
    # Warm sea-and-sun disc behind the hero, kept inside the maskable safe zone.
    pad = size * 0.1
    draw.ellipse((pad, pad, size - pad, size - pad), fill=(52, 103, 121, 255))
    draw.ellipse((size * 0.58, size * 0.14, size * 0.82, size * 0.38), fill=(241, 209, 135, 255))
    hero = Image.open(SOURCE).convert('RGBA')
    # Head and shoulders: the top 45% of the full-body art.
    box = hero.getbbox() or (0, 0, *hero.size)
    crop = hero.crop((box[0], box[1], box[2], box[1] + int((box[3] - box[1]) * 0.45)))
    scale = size * 0.78 / crop.height
    crop = crop.resize((max(1, int(crop.width * scale)), max(1, int(crop.height * scale))), Image.LANCZOS)
    canvas.alpha_composite(crop, (int((size - crop.width) / 2), int(size - crop.height - size * 0.06)))
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, size in (('icon-192.png', 192), ('icon-512.png', 512), ('apple-touch-icon.png', 180)):
        icon(size).convert('RGB').save(OUT / name, optimize=True)
        print(name, size)


if __name__ == '__main__':
    main()
