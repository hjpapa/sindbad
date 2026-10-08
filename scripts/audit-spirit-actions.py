from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];F=ROOT/'art-source/webtoon'
data=(F/'spirit-actions.json').read_bytes();assert data==(ROOT/'src/content/spirit-actions.generated.json').read_bytes()
meta=json.loads(data);native=ROOT/meta['source'];assert sha256(native.read_bytes()).hexdigest()==meta['sourceSha256']
im=Image.open(native).convert('RGBA');assert im.size==(1254,1254)
a=im.getchannel('A').point(lambda a:255 if a>16 else 0)
for edge in (0,626,627,1253):
    assert not a.crop((edge,0,edge+1,1254)).getbbox()
    assert not a.crop((0,edge,1254,edge+1)).getbbox()
source=Image.open(F/'spirit-actions.webp').convert('RGBA');assert source.size==(2048,512)
assert source.tobytes()==Image.open(F/'spirit-actions.png').convert('RGBA').tobytes()
runtime=Image.open(ROOT/'public/assets/webtoon/spirit-actions.webp').convert('RGBA');assert runtime.size==(1024,256)
assert [f['pose'] for f in meta['frames']]==['idle','telegraph','attack','defeated']
for sheet,side in ((source,512),(runtime,256)):
    a=sheet.getchannel('A').point(lambda a:255 if a>16 else 0)
    for i,frame in enumerate(meta['frames']):
        bounds=a.crop((i*side,0,(i+1)*side,side)).getbbox()
        assert bounds and 0<bounds[0]<bounds[2]<side and 0<bounds[1]<bounds[3]<side
        if side==512:
            assert list(bounds)==frame['bounds'] and frame['baseline']==bounds[3]-1
            assert sheet.getpixel((i*side+frame['centre'][0],frame['centre'][1]))[3]>16
assert meta['idleHeight']==313
assert (meta['legacyCanvasWidth'],meta['legacyCanvasHeight'],meta['restingVisibleHeight'],meta['legacyGroundIndicatorOffset'])==(96,128,116,64)
print('PASS: spirit4 native/lossless/runtime, transparent seams, measured opaque torso anchors and baselines; ART_DRAFT')

