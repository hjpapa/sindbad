"""Pack complete approved imagegen cells, without repainting or cutting silhouettes.

Raw candidates remain byte-for-byte originals. Equal thirds are checked for
visible empty seams before extraction. Uniform resize plus transparent padding
normalizes the tool's 1774x887 output into 1536x768 (512x768 cells).
"""
import json
from hashlib import sha256
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'art-source/webtoon'
selection = json.loads((source / 'npc-faces.sources.json').read_text(encoding='utf-8'))
measurements = []
for candidate in selection['candidates']:
    data = (source / candidate['file']).read_bytes()
    assert sha256(data).hexdigest() == candidate['sha256']
    # Reproducible from the repo on another machine; when the tool's local
    # archive exists, also prove the preserved copy is byte-for-byte identical.
    if Path(candidate['source']).exists():
        assert Path(candidate['source']).read_bytes() == data
for key, filename in selection['selected'].items():
    with Image.open(source / filename) as image:
        image = image.convert('RGBA')
        edges = [round(image.width * index / 3) for index in range(4)]
        visible = image.getchannel('A').point(lambda alpha: 255 if alpha > 16 else 0)
        for edge in edges:
            for boundary in (edge - 1, edge):
                if 0 <= boundary < image.width:
                    assert visible.crop((boundary, 0, boundary + 1, image.height)).getbbox() is None, (key, 'boundary', boundary)
        for y in (0, image.height - 1):
            assert visible.crop((0, y, image.width, y + 1)).getbbox() is None, (key, 'y', y)
        scale = min(480 / max(edges[i + 1] - edges[i] for i in range(3)), 720 / image.height)
        sheet = Image.new('RGBA', (1536, 768))
        bounds = []
        for index in range(3):
            cell = image.crop((edges[index], 0, edges[index + 1], image.height))
            cell = cell.resize((round(cell.width * scale), round(cell.height * scale)), Image.Resampling.LANCZOS)
            x, y = (512 - cell.width) // 2, (768 - cell.height) // 2
            sheet.paste(cell, (512 * index + x, y))
            box = sheet.getchannel('A').point(lambda alpha: 255 if alpha > 16 else 0).crop((512 * index, 0, 512 * (index + 1), 768)).getbbox()
            assert box and 0 < box[0] < box[2] < 512 and 0 < box[1] < box[3] < 768
            bounds.append(box)
        sheet.save(source / f'{key}-faces.png')
        measurements.append({'key': key, 'source': filename, 'sourceSize': list(image.size), 'sourceSha256': sha256((source / filename).read_bytes()).hexdigest(), 'bounds': bounds})
(source / 'npc-faces.measurements.json').write_text(json.dumps(measurements, indent=2) + '\n', encoding='utf-8')
print('PASS: 9 sheets / 27 complete portraits, blank visible native seams; uniformly packed 1536x768 RGBA.')
