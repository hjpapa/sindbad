"""Decode real terrain originals/runtime, check provenance, geometry and shadow."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
from PIL import Image, ImageStat, ImageChops

root = Path(__file__).resolve().parents[1]
source = root/'art-source/terrain'
runtime = root/'public/assets/terrain'
data = json.loads((source/'terrain.sources.json').read_text(encoding='utf-8'))
assert len(data['materials']) == 17 and len(data['selected']) == 34
for candidate in data['candidates']:
    assert sha256((source/candidate['file']).read_bytes()).hexdigest() == candidate['sha256']
files = []
for folder, scale in ((source, 4), (runtime, 1)):
    paths = sorted(folder.glob('*.webp'))
    assert len(paths) == 34
    for path in paths:
        key = path.stem
        assert key in data['selected']
        image = Image.open(path).convert('RGBA')
        part = key.rsplit('-',1)[1]
        assert image.size == (128*scale,(128 if part=='fill' else 34)*scale)
        assert image.getchannel('A').getextrema() == (255,255), key
        if scale == 4:
            expected = Image.open(source/data['selected'][key]).convert('RGBA').resize(image.size,Image.Resampling.LANCZOS)
            assert image.tobytes() == expected.tobytes(), (key, 'lossless source mismatch')
        rgb = image.convert('RGB')
        horizontal = ImageStat.Stat(ImageChops.difference(rgb.crop((0,0,1,rgb.height)),rgb.crop((rgb.width-1,0,rgb.width,rgb.height)))).mean
        vertical = ImageStat.Stat(ImageChops.difference(rgb.crop((0,0,rgb.width,1)),rgb.crop((0,rgb.height-1,rgb.width,rgb.height)))).mean
        row = {'path':path.relative_to(root).as_posix(),'width':image.width,'height':image.height,'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest(),'role':'original' if scale==4 else 'runtime','artStatus':'ART_DRAFT','horizontalMeanRgbDifference':sum(horizontal)/3,'verticalMeanRgbDifference':sum(vertical)/3}
        if part == 'top':
            light = image.convert('L')
            bottom = ImageStat.Stat(light.crop((0,28*scale,128*scale,34*scale))).mean[0]
            above = ImageStat.Stat(light.crop((0,22*scale,128*scale,28*scale))).mean[0]
            assert bottom < above*.9, (key,'bottom6 shadow missing',bottom,above)
            row.update({'bottom6Luminance':bottom,'above6Luminance':above})
        files.append(row)
report={'date':datetime.now(timezone.utc).isoformat(),'pass':True,'method':'decode 68 real files; lossless originals match whole native-canvas normalization; original hashes and dimensions; bottom6px shadow darker than above6; edge differences recorded as visual-QA aids, not exact pixel-periodicity claims','nativeCandidates':len(data['candidates']),'files':files}
(root/'docs/validation/terrain.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS: 34 original + 34 runtime terrain tiles; preserved native hashes, lossless pixels, sizes/opacity and bottom6 shadow.')
