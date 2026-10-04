"""Repack complete generated cells; no repainting, silhouette cropping or retouching."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/'art-source/webtoon'
native=FOLDER/'generated/kite-m6/kite-actions-02.png'
im=Image.open(native).convert('RGBA')
assert im.width==im.height and im.width%2==0
side=im.width//2
alpha=im.getchannel('A').point(lambda a:255 if a>16 else 0)
for edge in (0,side-1,side,im.width-1):
    assert not alpha.crop((edge,0,edge+1,im.height)).getbbox(),('vertical seam',edge)
    assert not alpha.crop((0,edge,im.width,edge+1)).getbbox(),('horizontal seam',edge)
# Manually measured gold spar intersection + 30 native px down the sail.
# This is the flight target centre, not the bottom of the dangling ribbon.
native_centres=[(350,356),(948-627,391),(393,907-627+30),(939-627,886-627+30)]
assert side==627,'Measure centres again for a different native candidate'
sheet=Image.new('RGBA',(2048,512)); rows=[]
for pose,name in enumerate(('idle','telegraph','attack','defeated')):
    cell=im.crop((pose%2*side,pose//2*side,(pose%2+1)*side,(pose//2+1)*side)).resize((512,512),Image.LANCZOS)
    bounds=cell.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
    assert bounds and 0<bounds[0]<bounds[2]<512 and 0<bounds[1]<bounds[3]<512
    centre=[round(value*512/side) for value in native_centres[pose]]
    assert cell.getpixel(tuple(centre))[3]>16,(name,centre)
    sheet.paste(cell,(pose*512,0));rows.append({'pose':name,'frame':pose,'bounds':list(bounds),'baseline':bounds[3]-1,'centre':centre})
sheet.save(FOLDER/'kite-actions.png')
sheet.save(FOLDER/'kite-actions.webp','WEBP',lossless=True,quality=100,method=4,exact=True)
assert Image.open(FOLDER/'kite-actions.webp').convert('RGBA').tobytes()==sheet.tobytes()
data={'key':'kite','texture':'kite-actions','cellSize':512,'columns':4,'rows':1,'idleHeight':rows[0]['bounds'][3]-rows[0]['bounds'][1],
      'flightBodyWidth':96,'flightBodyHeight':128,'frames':rows,'artStatus':'ART_DRAFT',
      'source':native.relative_to(ROOT).as_posix(),'sourceSha256':sha256(native.read_bytes()).hexdigest(),
      'method':'Each complete native 627px cell uniformly resized to 512px; repacked 4x1; exact lossless WebP. Centre manually measured at sail spar + flight target offset; alpha bounds measured >16.'}
(FOLDER/'kite-actions.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
print(json.dumps({'nativeSize':im.size,'size':sheet.size,'frames':rows,'idleHeight':data['idleHeight']}))
