"""Preserve native PNGs; uniformly resample complete cells with clear gutters."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'art-source/webtoon'


def normalize(original, columns, rows):
    assert original.width % columns == original.height % rows == 0
    width, height = original.width // columns, original.height // rows
    assert width == height, 'native cells must be square'
    visible = original.getchannel('A').point(lambda alpha: 255 if alpha > 16 else 0)
    sheet = Image.new('RGBA', (columns * 512, rows * 512))
    bounds = []
    for index in range(columns * rows):
        x, y = index % columns, index // columns
        box = (x * width, y * height, (x + 1) * width, (y + 1) * height)
        native_bounds = visible.crop(box).getbbox()
        assert native_bounds and 0 < native_bounds[0] < native_bounds[2] < width
        assert 0 < native_bounds[1] < native_bounds[3] < height
        cell = original.crop(box).resize((480, 480), Image.Resampling.LANCZOS)
        sheet.paste(cell, (x * 512 + 16, y * 512 + 16))
        bounds.append({'native': list(native_bounds), 'source': list(cell.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox())})
    return sheet, bounds


def main():
    sources = json.loads((SOURCE / 'effects.sources.json').read_text(encoding='utf-8'))
    measurements = []
    for candidate in sources['candidates']:
        path = ROOT / candidate['path']
        assert sha256(path.read_bytes()).hexdigest() == candidate['sha256']
        if not candidate['selected']:
            continue
        with Image.open(path) as native:
            assert list(native.size) == candidate['nativeSize']
            sheet, bounds = normalize(native.convert('RGBA'), candidate['columns'], candidate['rows'])
        key = candidate['key']
        sheet.save(SOURCE / f'{key}.png')
        target = SOURCE / f'{key}.webp'
        sheet.save(target, 'WEBP', lossless=True, quality=100, method=4, exact=True)
        with Image.open(target) as decoded:
            assert decoded.convert('RGBA').tobytes() == sheet.tobytes()
        measurements.append({'key': key, 'nativeSize': candidate['nativeSize'], 'sourceSize': list(sheet.size),
            'columns': candidate['columns'], 'rows': candidate['rows'], 'frames': candidate['frames'],
            'sourceFrame': 512, 'runtimeFrame': candidate['runtimeFrame'], 'innerFrame': 480, 'padding': 16,
            'nativeSha256': candidate['sha256'], 'bounds': bounds})
        print(f'{key}: {sheet.size}, {candidate["frames"]} complete cells; lossless RGBA identical')
    assert len(measurements) == 7
    (SOURCE / 'effects.measurements.json').write_text(json.dumps(measurements, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
