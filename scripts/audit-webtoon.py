"""Record the dimensions and hashes of the committed illustrations: the lossless
originals (art-source/webtoon) and the runtime copies the game downloads
(public/assets/webtoon, made by scripts/optimize-webtoon.py)."""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
files = []
for path in sorted([*(root / 'art-source' / 'webtoon').glob('*.webp'), *(root / 'public' / 'assets' / 'webtoon').glob('*.webp'), *(root / 'public' / 'assets' / 'webtoon').glob('ui-*.png')]):
    with Image.open(path) as illustration:
        illustration.load()
        files.append({
            'path': path.relative_to(root).as_posix(),
            'width': illustration.width,
            'height': illustration.height,
            'bytes': path.stat().st_size,
            'mode': illustration.mode,
            'sha256': sha256(path.read_bytes()).hexdigest(),
            'role': 'original' if 'art-source' in path.parts else 'runtime',
            'artStatus': 'ART_DRAFT',
        })
assert len(files) == 170, f'Expected 85 originals + 85 runtime copies, got {len(files)}'
face_measurements = json.loads((root / 'art-source/webtoon/npc-faces.measurements.json').read_text(encoding='utf-8'))
assert len(face_measurements) == 9
for measurement in face_measurements:
    for role, size, cell_width in [('art-source', (1536, 768), 512), ('public/assets', (768, 384), 256)]:
        with Image.open(root / f'{role}/webtoon/{measurement["key"]}-faces.webp') as face_sheet:
            assert face_sheet.size == size and face_sheet.mode == 'RGBA'
            assert face_sheet.getchannel('A').getextrema()[0] == 0
            visible = face_sheet.getchannel('A').point(lambda alpha: 255 if alpha > 16 else 0)
            for index in range(3):
                box = visible.crop((index * cell_width, 0, (index + 1) * cell_width, size[1])).getbbox()
                assert box and 0 < box[0] < box[2] < cell_width and 0 < box[1] < box[3] < size[1], (measurement['key'], role, index, box)
                if role == 'art-source':
                    assert list(box) == measurement['bounds'][index]
enemy_data = (root / 'art-source/webtoon/enemy-actions.json').read_bytes()
assert enemy_data == (root / 'src/content/enemy-actions.generated.json').read_bytes()
enemy_atlas = json.loads(enemy_data)
assert len(enemy_atlas['rows']) == 10 and enemy_atlas['columns'] == 4
with Image.open(root / 'art-source/webtoon/enemy-actions.webp') as sheet:
    assert sheet.size == (2048, 5120) and sheet.mode == 'RGBA'
    visible = sheet.getchannel('A').point(lambda value: 255 if value > 16 else 0)
    for edge in range(0, 2048, 512):
        for boundary in (edge, edge + 511):
            assert visible.crop((boundary, 0, boundary + 1, 5120)).getbbox() is None
    for edge in range(0, 5120, 512):
        for boundary in (edge, edge + 511):
            assert visible.crop((0, boundary, 2048, boundary + 1)).getbbox() is None
    for index, row in enumerate(enemy_atlas['rows']):
        assert row['row'] == index and 0 < row['idleHeight'] < 512
        for pose, baseline in enumerate(row['baseline']):
            assert 0 <= baseline < 512
            cell = visible.crop((pose * 512, index * 512, (pose + 1) * 512, (index + 1) * 512))
            assert list(cell.getbbox()) == row['bounds'][pose]
with Image.open(root / 'public/assets/webtoon/enemy-actions.webp') as runtime_sheet:
    assert runtime_sheet.size == (1024, 2560) and runtime_sheet.mode == 'RGBA'
    visible = runtime_sheet.getchannel('A').point(lambda value: 255 if value > 16 else 0)
    for edge in range(0, 1024, 256):
        for boundary in (edge, edge + 255):
            assert visible.crop((boundary, 0, boundary + 1, 2560)).getbbox() is None
    for edge in range(0, 2560, 256):
        for boundary in (edge, edge + 255):
            assert visible.crop((0, boundary, 1024, boundary + 1)).getbbox() is None
cells = json.loads((root / 'art-source/webtoon/hero-action.json').read_text(encoding='utf-8'))
assert cells == json.loads((root / 'src/content/hero-action.generated.json').read_text(encoding='utf-8'))
assert len(cells) == 9
with Image.open(root / 'art-source/webtoon/hero-action.webp') as sheet:
    assert sheet.size == (1536, 1536) and sheet.mode == 'RGBA'
    # Ignore imperceptible alpha <=16 from the generated transparent matte;
    # visible limbs/fabric must never touch any cell boundary.
    visible = sheet.getchannel('A').point(lambda value: 255 if value > 16 else 0)
    for boundary in (0, 511, 512, 1023, 1024, 1535):
        assert visible.crop((boundary, 0, boundary + 1, 1536)).getbbox() is None
        assert visible.crop((0, boundary, 1536, boundary + 1)).getbbox() is None
    for index, cell in enumerate(cells):
        assert 0 <= cell['baseline'] < 512
        x, y = cell['hand']
        assert 0 <= x < 512 and 0 <= y < 512
        assert sheet.getpixel((index % 3 * 512 + x, index // 3 * 512 + y))[3] > 16
for key in ('captain-webtoon', 'sailor-webtoon'):
    with Image.open(root / f'art-source/webtoon/{key}.webp') as portrait:
        assert portrait.size == (1024, 1536) and portrait.mode == 'RGBA'
        assert portrait.getchannel('A').getextrema()[0] == 0
output = root / 'docs' / 'validation' / 'illustrations.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({
    'date': datetime.now(timezone.utc).isoformat(),
    'method': 'decode real WebP illustrations and A8 PNG runtime icons with Pillow, record dimensions and SHA256; not animation or visual approval',
    'files': files,
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'PASS: decoded {len(files)} real illustrations; {sum(item["bytes"] for item in files):,} bytes.')

# Terrain has a separate source folder and rectangular cap contract.
import subprocess
import sys
subprocess.run([sys.executable,str(root/'scripts/audit-terrain.py')],check=True)
subprocess.run([sys.executable,str(root/'scripts/audit-weapons.py')],check=True)
subprocess.run([sys.executable,str(root/'scripts/audit-effects.py')],check=True)
subprocess.run([sys.executable,str(root/'scripts/audit-touch-icons.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/audit-world-props.py')],check=True)
subprocess.run([sys.executable,str(root/'scripts/audit-kite-actions.py')],check=True)
