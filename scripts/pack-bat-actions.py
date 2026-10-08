"""Repack whole generated cells; preserve native and exact lossless RGBA."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];F=ROOT/'art-source/webtoon'
native=F/'generated/bat-m6/bat-actions-01.png';im=Image.open(native).convert('RGBA')
assert im.size==(1254,1254);side=627
a=im.getchannel('A').point(lambda a:255 if a>16 else 0)
for edge in (0,626,627,1253):
    assert not a.crop((edge,0,edge+1,1254)).getbbox()
    assert not a.crop((0,edge,1254,edge+1)).getbbox()
# Manually measured opaque torso centres in each complete native cell.
# Keep the existing target at the torso through the up/down wing sweep.
centres=[(400,470),(970-627,505),(425,970-627),(960-627,980-627)]
sheet=Image.new('RGBA',(2048,512));frames=[]
for i,pose in enumerate(('idle','telegraph','attack','defeated')):
    cell=im.crop((i%2*side,i//2*side,(i%2+1)*side,(i//2+1)*side)).resize((512,512),Image.LANCZOS)
    bounds=cell.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
    assert bounds and 0<bounds[0]<bounds[2]<512 and 0<bounds[1]<bounds[3]<512
    centre=[round(v*512/side) for v in centres[i]];assert cell.getpixel(tuple(centre))[3]>16
    sheet.paste(cell,(i*512,0));frames.append({'pose':pose,'frame':i,'bounds':list(bounds),'baseline':bounds[3]-1,'centre':centre})
sheet.save(F/'bat-actions.png');sheet.save(F/'bat-actions.webp','WEBP',lossless=True,quality=100,method=4,exact=True)
assert Image.open(F/'bat-actions.webp').convert('RGBA').tobytes()==sheet.tobytes()
meta={'key':'bat','texture':'bat-actions','cellSize':512,'columns':4,'rows':1,'idleHeight':frames[0]['bounds'][3]-frames[0]['bounds'][1],
      'legacyCanvasWidth':96,'legacyCanvasHeight':128,'restingVisibleHeight':84,'legacyGroundIndicatorOffset':64,
      'frames':frames,'source':native.relative_to(ROOT).as_posix(),'sourceSha256':sha256(native.read_bytes()).hexdigest(),
      'method':'Full627px cells uniformly resized512 and repacked4x1; exact lossless RGBA. Alpha>16 bounds; torso centres measured manually. Resting visible height84 follows original bat SVG outer y12..95 approximately. Legacy target/body/ground indicator preserved. No repaint or silhouette crop.','artStatus':'ART_DRAFT'}
(F/'bat-actions.json').write_bytes((json.dumps(meta,indent=2)+'\n').encode('utf-8'))
p=F/'generated/bat-m6/bat-actions-01.json';data=json.loads(p.read_text(encoding='utf-8'));data.update(status='selected; transparent outer/central seams and no text; ART_DRAFT',nativeSize=list(im.size),sha256=meta['sourceSha256']);p.write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print(json.dumps(meta))
