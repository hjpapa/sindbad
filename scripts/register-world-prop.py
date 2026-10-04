"""Copy a built-in imagegen native PNG intact and register its actual pixels."""
from pathlib import Path
from hashlib import sha256
import json, shutil, sys
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'art-source/webtoon'
item=json.loads((ROOT/sys.argv[1]).read_text(encoding='utf-8'))
native=Path(item['nativePath']); target=ROOT/item['path']
assert not target.exists(), 'Preserve existing candidates; use another filename'
target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(native,target)
item['sha256']=sha256(target.read_bytes()).hexdigest()
item['status']='generated'
assert native.read_bytes()==target.read_bytes()
with Image.open(target) as image:
    image.load();assert image.mode=='RGBA'
    item['nativeSize']=list(image.size)
    bounds=image.getchannel('A').point(lambda n:255 if n>16 else 0).getbbox()
    item['alphaBounds']=list(bounds) if bounds else None
    item['selected']=bool(bounds and 0.70<image.width/image.height<0.80 and 0<bounds[0]<bounds[2]<image.width and 0<bounds[1]<bounds[3]<image.height)
data=json.loads((SOURCE/'world-props.sources.json').read_text(encoding='utf-8'))
data['candidates'].append(item)
folder='story' if item['legacy'] in ['lantern','starDevice','cargo','treasureAltar','moonRock','lotusShrine'] else 'draft'
legacy=f'public/assets/{folder}/{item["legacy"]}.svg'
data.setdefault('preservedSvgHashes',{})[legacy]=sha256((ROOT/legacy).read_bytes()).hexdigest()
(SOURCE/'world-props.sources.json').write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'key':item['key'],'size':item['nativeSize'],'bounds':item['alphaBounds'],'selected':item['selected']}))
