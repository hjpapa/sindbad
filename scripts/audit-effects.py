"""Verify real effect files, complete cell boundaries and native provenance."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import importlib.util
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'art-source/webtoon'
spec = importlib.util.spec_from_file_location('effect_packing', ROOT / 'scripts/pack-effects.py')
packing = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packing)
sources = json.loads((source / 'effects.sources.json').read_text(encoding='utf-8'))
measurements = json.loads((source / 'effects.measurements.json').read_text(encoding='utf-8'))
assert len(measurements) == 7
files = []
for candidate in sources['candidates']:
    native_path = ROOT / candidate['path']
    assert sha256(native_path.read_bytes()).hexdigest() == candidate['sha256']
    if not candidate['selected']:
        continue
    measurement = next(m for m in measurements if m['key'] == candidate['key'])
    with Image.open(native_path) as native:
        normalized, bounds = packing.normalize(native.convert('RGBA'), candidate['columns'], candidate['rows'])
    assert bounds == measurement['bounds']
    assert normalized.tobytes() == Image.open(source / f'{candidate["key"]}.png').convert('RGBA').tobytes()
    for role, cell in [('original',512), ('runtime',candidate['runtimeFrame'])]:
        path = source / f'{candidate["key"]}.webp' if role == 'original' else ROOT / f'public/assets/webtoon/{candidate["key"]}.webp'
        with Image.open(path) as image:
            image.load()
            assert image.mode == 'RGBA'
            assert image.size == (candidate['columns'] * cell, candidate['rows'] * cell)
            assert image.getchannel('A').getextrema()[0] == 0
            if role == 'original':
                assert image.tobytes() == normalized.tobytes()
            visible = image.getchannel('A').point(lambda a: 255 if a > 16 else 0)
            frames = []
            for index in range(candidate['frames']):
                x, y = index % candidate['columns'], index // candidate['columns']
                bounds = visible.crop((x * cell,y * cell,(x + 1) * cell,(y + 1) * cell)).getbbox()
                assert bounds and 0 < bounds[0] < bounds[2] < cell and 0 < bounds[1] < bounds[3] < cell, (path,index,bounds)
                frames.append(list(bounds))
            files.append({'path':path.relative_to(ROOT).as_posix(),'role':role,'size':list(image.size),
                'cell':cell,'frames':frames,'bytes':path.stat().st_size,'sha256':sha256(path.read_bytes()).hexdigest()})
report = {'date':datetime.now(timezone.utc).isoformat(),'pass':True,'artStatus':'ART_DRAFT',
    'method':'7 native PNG hashes; uniform complete-cell normalization; exact source lossless RGBA; 14 real WebP decodes; 34 visible frame boundaries per role (alpha >16); visual approval separate',
    'files':files}
(ROOT / 'docs/validation/effects.json').write_text(json.dumps(report,indent=2) + '\n',encoding='utf-8')
print('PASS: 7 native PNG preserved, 7 lossless originals + 7 runtime sheets, 34 complete frames each.')
