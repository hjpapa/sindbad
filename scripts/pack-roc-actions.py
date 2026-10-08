"""Inset whole native cells, keeping the generated original untouched."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];F=ROOT/'art-source/webtoon'
native=F/'generated/roc-m6/roc-actions-01.png';im=Image.open(native).convert('RGBA')
assert im.size==(1536,1024)
a=im.getchannel('A').point(lambda v:255 if v>16 else 0)
for x in (0,511,512,1023,1024,1535): assert not a.crop((x,0,x+1,1024)).getbbox()
for y in (0,511,512,1023): assert not a.crop((0,y,1536,y+1)).getbbox()
# Manually measured native-cell landmarks. Raised wings obscure the seat in
# poses 1 and 4: their seat points are projected from the visible saddle rim.
centres=[(335,320),(340,375),(300,330),(340,290),(335,310),(335,290)]
seats=[(300,243),(280,304),(220,238),(300,207),(306,270),(258,195)]
feet=[465,465,355,433,403,305]
sheet=Image.new('RGBA',im.size);frames=[]
project=lambda v:round(32+v*448/512)
for i,pose in enumerate(('idle','telegraph','attack','defeated','fly-up','fly-down')):
    cell=Image.new('RGBA',(512,512))
    cell.paste(im.crop((i%3*512,i//3*512,(i%3+1)*512,(i//3+1)*512)).resize((448,448),Image.Resampling.LANCZOS),(32,32))
    bounds=cell.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox()
    centre=list(map(project,centres[i]));seat=list(map(project,seats[i]))
    assert bounds and cell.getpixel(tuple(centre))[3]>16 and cell.getpixel(tuple(seat))[3]>16
    assert 16<bounds[0]<bounds[2]<496 and 16<bounds[1]<bounds[3]<496
    sheet.paste(cell,(i%3*512,i//3*512))
    frames.append({'frame':i,'pose':pose,'bounds':list(bounds),'baseline':project(feet[i]),'centre':centre,'seat':seat,'seatProjected':i in (1,4)})
sheet.save(F/'roc-actions.png');sheet.save(F/'roc-actions.webp','WEBP',lossless=True,quality=100,method=4,exact=True)
assert Image.open(F/'roc-actions.webp').convert('RGBA').tobytes()==sheet.tobytes()
meta={'key':'roc','texture':'roc-actions','cellSize':512,'columns':3,'rows':2,
      'idleHeight':frames[0]['bounds'][3]-frames[0]['bounds'][1],
      'flightReferenceWidth':frames[4]['bounds'][2]-frames[4]['bounds'][0],
      'bossVisibleHeight':145,'bossBodyWidth':220,'bossFootOffset':50.75,
      'frames':frames,'source':native.relative_to(ROOT).as_posix(),'sourceSha256':sha256(native.read_bytes()).hexdigest(),
      'method':'Entire native 512px cells uniformly resized448 and inset32. Exact lossless RGBA; alpha>16 bounds. Torso centres, lowest visible toe baselines and saddle seats measured manually; raised-wing seats projected from visible saddle rim. Baseline is toe height, not the lower wing/tail bound in flight. No repaint or silhouette crop. Boss legacy target/145px resting height/50.75px foot offset and 220px logical width preserved. Flight rider feet anchor the seat through frame changes and mirroring.',
      'artStatus':'ART_DRAFT'}
(F/'roc-actions.json').write_bytes((json.dumps(meta,indent=2)+'\n').encode('utf-8'))
p=F/'generated/roc-m6/roc-actions-01.json';data=json.loads(p.read_text(encoding='utf-8'))
data.update(status='selected; visible outer/central seams transparent, no text; ART_DRAFT',nativeSize=list(im.size),sha256=meta['sourceSha256'])
p.write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'));print(json.dumps(meta))
