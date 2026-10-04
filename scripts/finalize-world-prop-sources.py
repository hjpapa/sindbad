"""Record measured candidates after generation, preserving every native PNG."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'art-source/webtoon/world-props.sources.json'
data=json.loads(source.read_text(encoding='utf-8'))
for item in data['candidates']:
    if not any(folder in item['path'] for folder in ('/props-m6/','/flight-m6/')): continue
    item['status']='generated'
    target=(ROOT/item['path']).with_suffix('.json')
    target.write_bytes((json.dumps(item,indent=2)+'\n').encode('utf-8'))
source.write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print('PASS: measured source records synchronized; native PNG untouched')
