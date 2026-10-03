"""Build the runtime WebP files that phones download.

The lossless originals stay untouched in art-source/webtoon/. Each runtime copy
is resized to what the 1280x720 canvas and the dialogue portrait can actually
show, then saved as lossy WebP. Run from the repository root:

    python scripts/optimize-webtoon.py
"""
from pathlib import Path
from PIL import Image

SOURCE = Path('art-source/webtoon')
TARGET = Path('public/assets/webtoon')
TERRAIN_SOURCE = Path('art-source/terrain')
TERRAIN_TARGET = Path('public/assets/terrain')
WEAPON_SOURCE = Path('art-source/weapons')
WEAPON_TARGET = Path('public/assets/weapons')
# Longest-edge-preserving target sizes. Portraits are shown at most ~330 game px
# tall and 200 CSS px in dialogue, so 512x768 still covers 2x-density screens.
SIZES = {
    **{f'weapon-W0{n}': (80,160) if n==5 else (160,64) for n in range(1,8)},
    'hero-run': (768, 512),       # 3x2 sheet, 256 px frames
    'hero-action': (768, 768),    # 3x3 sheet, 256 px frames
    'captain-webtoon': (512, 768),
    'sailor-webtoon': (512, 768),
    'enemy-atlas': (768, 512),    # 3x2 sheet, 256 px frames
    'enemy-actions': (1024, 2560),  # 4x10 sheet, 256 px frames
    'roc-webtoon': (768, 512),
    'whale-webtoon': (1536, 1024),  # stretched across the whole S04 island
    'crab-webtoon': (512, 512),
    'elephant-webtoon': (512, 512),
    'naira-faces': (768, 384),
    'siren-faces': (768, 384),
    'rah-faces': (768, 384),
    'genie-faces': (768, 384),
    'ariana-faces': (768, 384),
    'king-faces': (768, 384),
    'mira-faces': (768, 384),
    'baru-faces': (768, 384),
    'captain-faces': (768, 384),
}
PORTRAIT = (512, 768)
BACKGROUND = (1536, 1024)
TERRAIN_KEYS = ('dock', 'deck', 'reef', 'coral', 'whale', 'basalt', 'crystal', 'cloud', 'village', 'warehouse', 'sand', 'shadow', 'jungle', 'temple', 'garden', 'tower', 'kingdom')
SIZES.update({f'terrain-{key}-{part}': (128, 128 if part == 'fill' else 34)
              for key in TERRAIN_KEYS for part in ('fill', 'top')})


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    # Keep the measurements in the build even when art-source/ is excluded from
    # the uploaded source. The original JSON remains the single editing source.
    for key in ('hero-action', 'enemy-actions'):
        measurements = SOURCE / f'{key}.json'
        compiled_measurements = Path(f'src/content/{key}.generated.json')
        data = measurements.read_bytes()
        if not compiled_measurements.exists() or compiled_measurements.read_bytes() != data:
            compiled_measurements.parent.mkdir(parents=True, exist_ok=True)
            compiled_measurements.write_bytes(data)
    before = after = 0
    for source in sorted(SOURCE.glob('*.webp')):
        key = source.stem
        size = BACKGROUND if key.startswith('chapter-') else SIZES.get(key, PORTRAIT)
        image = Image.open(source)
        image.load()
        if image.size != size:
            image = image.resize(size, Image.LANCZOS)
        out = TARGET / source.name
        quality = 80 if key.startswith('chapter-') else 86
        image.save(out, 'WEBP', quality=quality, alpha_quality=90, method=6)
        before += source.stat().st_size
        after += out.stat().st_size
        print(f'{source.name}: {source.stat().st_size // 1024} KiB -> {out.stat().st_size // 1024} KiB {image.size}')
    print(f'total {before // 1024} KiB -> {after // 1024} KiB')
    TERRAIN_TARGET.mkdir(parents=True, exist_ok=True)
    terrain_bytes = 0
    for key in TERRAIN_KEYS:
        for part in ('fill', 'top'):
            name = f'terrain-{key}-{part}'
            source = TERRAIN_SOURCE / f'{name}.webp'
            with Image.open(source) as original:
                assert original.size == (512, 512 if part == 'fill' else 136)
                image = original.resize(SIZES[name], Image.Resampling.LANCZOS)
                out = TERRAIN_TARGET / source.name
                image.save(out, 'WEBP', quality=86, method=6)
                terrain_bytes += out.stat().st_size
    print(f'terrain: 34 runtime tiles / {terrain_bytes:,} bytes')
    WEAPON_TARGET.mkdir(parents=True,exist_ok=True)
    weapon_bytes=0
    for n in range(1,8):
        key=f'W0{n}'
        with Image.open(WEAPON_SOURCE/f'{key}.webp') as original:
            assert original.size==((320,640) if n==5 else (640,256))
            image=original.resize(SIZES[f'weapon-{key}'],Image.Resampling.LANCZOS)
            out=WEAPON_TARGET/f'{key}.webp'
            image.save(out,'WEBP',quality=90,method=6)
            weapon_bytes+=out.stat().st_size
    print(f'weapons: 7 runtime sprites / {weapon_bytes:,} bytes')


if __name__ == '__main__':
    main()
