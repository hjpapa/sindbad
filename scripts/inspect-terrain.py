"""Diagnostic contact sheets and repeat measurements; never modify source art."""
from pathlib import Path
import json
import sys
from PIL import Image, ImageDraw, ImageStat, ImageChops

root = Path(__file__).resolve().parents[1]
source = root / 'art-source/terrain'
data = json.loads((source / 'terrain.sources.json').read_text(encoding='utf-8-sig'))
keys = list(data['materials'])
out = root / 'docs/screenshots/art-a5'
out.mkdir(parents=True, exist_ok=True)
rows = []
runtime = '--runtime' in sys.argv
for page in range(3):
    canvas = Image.new('RGB', (1200, 1050), '#e8e5dc')
    draw = ImageDraw.Draw(canvas)
    for index, key in enumerate(keys[page*6:page*6+6]):
        x, y = index % 3 * 400, index // 3 * 525
        draw.text((x+10, y+5), key, fill='#152f3b')
        for kind in ('fill', 'top'):
            c = next(c for c in reversed(data['candidates']) if c['key']==key and c['kind']==kind and not c['status'].startswith('rejected'))
            native = Image.open(root/f'public/assets/terrain/terrain-{key}-{kind}.webp' if runtime else source/c['file']).convert('RGBA')
            tile = native.resize((128, 128 if kind=='fill' else 34), Image.Resampling.LANCZOS)
            for gy in range(3 if kind=='fill' else 1):
                for gx in range(3):
                    canvas.paste(tile, (x+8+128*gx, y+30+128*gy if kind=='fill' else y+425), tile)
            rgb = tile.convert('RGB')
            horizontal = ImageStat.Stat(ImageChops.difference(rgb.crop((0,0,1,rgb.height)),rgb.crop((rgb.width-1,0,rgb.width,rgb.height)))).mean
            vertical = ImageStat.Stat(ImageChops.difference(rgb.crop((0,0,rgb.width,1)),rgb.crop((0,rgb.height-1,rgb.width,rgb.height)))).mean
            rows.append({'key':key,'kind':kind,'file':c['file'],'nativeSize':native.size,'nativeAlphaRange':native.getchannel('A').getextrema(),'horizontalMeanRgbDifference':sum(horizontal)/3,'verticalMeanRgbDifference':sum(vertical)/3})
            if kind=='top':
                luminance=tile.convert('L')
                draw.text((x+10,y+474), 'bottom6: %.1f / above6: %.1f' % (ImageStat.Stat(luminance.crop((0,28,128,34))).mean[0],ImageStat.Stat(luminance.crop((0,22,128,28))).mean[0]), fill='#152f3b')
    canvas.save(out/f'terrain-repeat-{"runtime" if runtime else "candidates"}-{page+1}.png')
(root/f'docs/validation/a5-terrain-{"runtime-repeat" if runtime else "candidates"}.json').write_text(json.dumps(rows,indent=2)+'\n',encoding='utf-8')
for row in rows:
    print(row['key'],row['kind'],row['nativeSize'],row['nativeAlphaRange'],'edge mean x/y',round(row['horizontalMeanRgbDifference'],2),round(row['verticalMeanRgbDifference'],2))
