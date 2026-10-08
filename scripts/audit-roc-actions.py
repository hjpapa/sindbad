from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
root=Path(__file__).resolve().parents[1];folder=root/'art-source/webtoon'
data=(folder/'roc-actions.json').read_bytes()
assert data==(root/'src/content/roc-actions.generated.json').read_bytes()
meta=json.loads(data);native=root/meta['source']
assert sha256(native.read_bytes()).hexdigest()==meta['sourceSha256']
source=Image.open(folder/'roc-actions.webp').convert('RGBA')
assert source.tobytes()==Image.open(folder/'roc-actions.png').convert('RGBA').tobytes()
runtime=Image.open(root/'public/assets/webtoon/roc-actions.webp').convert('RGBA')
assert [f['pose'] for f in meta['frames']]==['idle','telegraph','attack','defeated','fly-up','fly-down']
for sheet,side in ((source,512),(runtime,256),(Image.open(native).convert('RGBA'),512)):
    assert sheet.size==(side*3,side*2)
    a=sheet.getchannel('A').point(lambda v:255 if v>16 else 0)
    for i,frame in enumerate(meta['frames']):
        bounds=a.crop((i%3*side,i//3*side,(i%3+1)*side,(i//3+1)*side)).getbbox()
        assert bounds and 0<bounds[0]<bounds[2]<side and 0<bounds[1]<bounds[3]<side
        if sheet is source:
            assert list(bounds)==frame['bounds']
            assert bounds[1]<=frame['baseline']<bounds[3]
            for key in ('centre','seat'):
                x,y=frame[key];assert sheet.getpixel((i%3*side+x,i//3*side+y))[3]>16
assert (meta['bossVisibleHeight'],meta['bossBodyWidth'],meta['bossFootOffset'])==(145,220,50.75)
assert meta['artStatus']=='ART_DRAFT'
print('PASS: roc6 native/lossless/runtime; transparent visible seams, measured toes/torso/saddle, projected raised-wing seats; ART_DRAFT')
