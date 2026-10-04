"""Verify generated kite sheet provenance, empty seams and measured centres."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
data=(ROOT/'art-source/webtoon/kite-actions.json').read_bytes()
assert data==(ROOT/'src/content/kite-actions.generated.json').read_bytes()
meta=json.loads(data)
native=ROOT/meta['source']; assert sha256(native.read_bytes()).hexdigest()==meta['sourceSha256']
im=Image.open(native).convert('RGBA'); assert im.size==(1254,1254)
alpha=im.getchannel('A').point(lambda a:255 if a>16 else 0)
for edge in (0,626,627,1253):
    assert not alpha.crop((edge,0,edge+1,1254)).getbbox()
    assert not alpha.crop((0,edge,1254,edge+1)).getbbox()
assert [f['pose'] for f in meta['frames']]==['idle','telegraph','attack','defeated']
source=Image.open(ROOT/'art-source/webtoon/kite-actions.webp').convert('RGBA')
assert source.size==(2048,512)
assert source.tobytes()==Image.open(ROOT/'art-source/webtoon/kite-actions.png').convert('RGBA').tobytes()
runtime=Image.open(ROOT/'public/assets/webtoon/kite-actions.webp').convert('RGBA');assert runtime.size==(1024,256)
for sheet,cell in ((source,512),(runtime,256)):
    visible=sheet.getchannel('A').point(lambda a:255 if a>16 else 0)
    for i,frame in enumerate(meta['frames']):
        bounds=visible.crop((i*cell,0,(i+1)*cell,cell)).getbbox()
        assert bounds and 0<bounds[0]<bounds[2]<cell and 0<bounds[1]<bounds[3]<cell
        if cell==512:
            assert list(bounds)==frame['bounds']
            assert frame['baseline']==bounds[3]-1
            x,y=frame['centre'];assert sheet.getpixel((i*cell+x,y))[3]>16
assert meta['idleHeight']==meta['frames'][0]['bounds'][3]-meta['frames'][0]['bounds'][1]
print('PASS: kite 4 frames; preserved native, exact lossless source, runtime, transparent seams and measured flight centres; ART_DRAFT')
