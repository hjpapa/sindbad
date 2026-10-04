"""Verify originals, pre-task backups and the unchanged 27 prior world props."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/validation/m6-flight-before'
rows=json.loads((OUT/'files.json').read_text(encoding='utf-8'))
for item in rows: assert sha256((OUT/item['path']).read_bytes()).hexdigest()==item['sha256']
changed_sources={'src/content/worldProps.ts','src/content/assets.manifest.ts','src/game/stage.ts'}
protected=[item for item in rows if item['path'].startswith('src/') and item['path'] not in changed_sources]
for item in protected:assert sha256((ROOT/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']
old=json.loads((OUT/'docs/validation/world-props.json').read_text(encoding='utf-8'))
for item in old['files']: assert sha256((ROOT/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']
sources=json.loads((ROOT/'art-source/webtoon/world-props.sources.json').read_text(encoding='utf-8'))
new=[item for item in sources['candidates'] if '/flight-m6/' in item['path']]
assert len(new)==3
for item in new:
    copied=ROOT/item['path'];assert Path(item['nativePath']).read_bytes()==copied.read_bytes()
    assert sha256(copied.read_bytes()).hexdigest()==item['sha256']
    assert sha256((ROOT/f'public/assets/draft/{item["legacy"]}.svg').read_bytes()).hexdigest()==sources['preservedSvgHashes'][f'public/assets/draft/{item["legacy"]}.svg']
for folder in ('art-source/webtoon','public/assets/webtoon'):
    with Image.open(ROOT/folder/'prop-flight-ring.webp') as image:
        assert image.getpixel((image.width//2,image.height//2))[3]==0,'Ring center must be transparent'
report={'date':datetime.now(timezone.utc).isoformat(),'pass':True,'backupFiles':len(rows),'unchangedOtherSources':len(protected),'previousPropFiles':len(old['files']),'nativePngs':len(new),'ringCenterAlpha':0,'method':'SHA256 preserved pre-task files; every prior src file except three intended art/observation edits unchanged; 27 prior source PNG/WebP/runtime triples unchanged; three native PNG byte equality; legacy SVG SHA256; source/runtime transparent ring center'}
(ROOT/'docs/validation/m6-flight-preservation.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf-8'))
print(json.dumps(report))
