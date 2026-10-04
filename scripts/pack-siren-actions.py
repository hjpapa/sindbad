"""Uniformly resize whole generated cells, then encode exact lossless WebP."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];F=ROOT/'art-source/webtoon'
native=F/'generated/siren-m6/siren-actions-02.png';im=Image.open(native).convert('RGBA')
assert im.width==im.height and im.width%2==0;side=im.width//2
a=im.getchannel('A').point(lambda a:255 if a>16 else 0)
for edge in (0,side-1,side,im.width-1):
    assert not a.crop((edge,0,edge+1,im.height)).getbbox(),('vertical',edge)
    assert not a.crop((0,edge,im.width,edge+1)).getbbox(),('horizontal',edge)
sheet=Image.new('RGBA',(2048,512));frames=[]
for i,pose in enumerate(('idle','telegraph','attack','defeated')):
    cell=im.crop((i%2*side,i//2*side,(i%2+1)*side,(i//2+1)*side)).resize((512,512),Image.LANCZOS)
    bounds=cell.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
    assert bounds and 0<bounds[0]<bounds[2]<512 and 0<bounds[1]<bounds[3]<512
    sheet.paste(cell,(i*512,0));frames.append({'pose':pose,'frame':i,'bounds':list(bounds),'baseline':bounds[3]-1})
sheet.save(F/'siren-actions.png');sheet.save(F/'siren-actions.webp','WEBP',lossless=True,quality=100,method=4,exact=True)
assert Image.open(F/'siren-actions.webp').convert('RGBA').tobytes()==sheet.tobytes()
meta={'key':'siren','texture':'siren-actions','cellSize':512,'columns':4,'rows':1,'idleHeight':frames[0]['bounds'][3]-frames[0]['bounds'][1],
      'frames':frames,'source':native.relative_to(ROOT).as_posix(),'sourceSha256':sha256(native.read_bytes()).hexdigest(),
      'method':'Complete native square cells uniformly resized to512 and repacked4x1. Alpha>16 bounds/baseline. No repaint or silhouette crop. Exact lossless WebP.','artStatus':'ART_DRAFT'}
(F/'siren-actions.json').write_bytes((json.dumps(meta,indent=2)+'\n').encode('utf-8'))
print(json.dumps(meta))
