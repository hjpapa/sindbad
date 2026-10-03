"""Pack approved imagegen quadrants into the A3 atlas; never repaint artwork.

Generation PNGs remain verbatim. Blank-seam checks run before separating the
four complete cells. Each square cell is resized uniformly to 512px, then put
in idle/telegraph/attack/defeat order in a four-column, ten-row atlas.
"""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'art-source/webtoon'
selection = json.loads((source / 'enemy-actions.sources.json').read_text(encoding='utf-8'))
atlas = Image.new('RGBA', (2048, 5120))
rows = []
for row, (key, filename) in enumerate(selection['selected'].items()):
    with Image.open(source / filename) as image:
        image = image.convert('RGBA')
        assert image.width == image.height and image.width % 2 == 0
        edge = image.width // 2
        visible = image.getchannel('A').point(lambda alpha: 255 if alpha > 16 else 0)
        for boundary in (0, edge - 1, edge, image.width - 1):
            assert visible.crop((boundary, 0, boundary + 1, image.height)).getbbox() is None, (key, 'x', boundary)
            assert visible.crop((0, boundary, image.width, boundary + 1)).getbbox() is None, (key, 'y', boundary)
        bounds = []
        for pose in range(4):
            x, y = pose % 2 * edge, pose // 2 * edge
            cell = image.crop((x, y, x + edge, y + edge)).resize((512, 512), Image.Resampling.LANCZOS)
            box = cell.getchannel('A').point(lambda alpha: 255 if alpha > 16 else 0).getbbox()
            assert box and box[0] > 0 and box[1] > 0 and box[2] < 512 and box[3] < 512, (key, pose, box)
            atlas.paste(cell, (pose * 512, row * 512))
            bounds.append(list(box))
        rows.append({'key': key, 'row': row, 'baseline': [box[3] - 1 for box in bounds],
                     'idleHeight': bounds[0][3] - bounds[0][1], 'bounds': bounds, 'source': filename})
atlas.save(source / 'enemy-actions.png')
(source / 'enemy-actions.json').write_text(json.dumps({'columns': 4, 'cellSize': 512, 'rows': rows}, indent=2) + '\n', encoding='utf-8')
print('PASS: 10 approved sheets, 40 complete poses, blank visible seams; packed 2048x5120 RGBA.')
