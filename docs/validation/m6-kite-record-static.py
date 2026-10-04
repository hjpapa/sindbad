from pathlib import Path
import json,shutil
ROOT=Path(__file__).resolve().parents[2]
for original,target in [('art-budget.json','m6-kite-art-budget.json'),('illustrations.json','m6-kite-illustrations.json')]:
    shutil.copyfile(ROOT/'docs/validation'/original,ROOT/'docs/validation'/target)
raw=ROOT/'docs/validation/m6-kite-mobile-output.txt'
if raw.exists():
    data=json.loads(raw.read_text(encoding='utf-8-sig'))
    (ROOT/'docs/validation/m6-kite-mobile.json').write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
meta=json.loads((ROOT/'art-source/webtoon/kite-actions.json').read_text(encoding='utf-8'))
print(json.dumps({'runtimeBytes':(ROOT/'public/assets/webtoon/kite-actions.webp').stat().st_size,'sourceBytes':(ROOT/'art-source/webtoon/kite-actions.webp').stat().st_size,'centres':[f['centre'] for f in meta['frames']],
 'budget':json.loads((ROOT/'docs/validation/art-budget.json').read_text())['totalBytes']}))
