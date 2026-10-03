"""Uniform resampling/translation only; keep native RGBA and complete alpha."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT/'art-source/weapons'
PIVOTS = {'W01':.13,'W02':.5,'W03':.13,'W04':.25,'W05':.45,'W06':.08,'W07':.15}

def normalize(image, grip, size, pivot):
    left, top, right, bottom = image.getchannel('A').getbbox()
    visible = image.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()
    assert visible[0]>0 and visible[1]>0 and visible[2]<image.width and visible[3]<image.height
    gx, gy = grip
    px, py = pivot
    margin = 8
    scale = min((px-margin)/(gx-left),(size[0]-margin-px)/(right-gx),
                (py-margin)/(gy-top),(size[1]-margin-py)/(bottom-gy))
    assert 0<scale<1
    offset = [px-gx*scale,py-gy*scale]
    # Empty margins may fall outside; every generated alpha pixel fits inside.
    image = image.transform(size,Image.Transform.AFFINE,
        (1/scale,0,-offset[0]/scale,0,1/scale,-offset[1]/scale),Image.Resampling.BICUBIC)
    assert image.getpixel((round(px),round(py)))[3]>=200
    bounds = image.getchannel('A').getbbox()
    assert bounds[0]>=6 and bounds[1]>=6 and bounds[2]<=size[0]-6 and bounds[3]<=size[1]-6
    return image, {'scale':scale,'offset':offset,'allAlphaBounds':bounds,
        'visibleBounds':image.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox()}

def main():
    path = SOURCE/'weapons.sources.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    measurements = {}
    for candidate in data['candidates']:
        raw = ROOT/candidate['path']
        assert raw.read_bytes()==Path(candidate['nativePath']).read_bytes()
        image = Image.open(raw).convert('RGBA')
        candidate.update(nativeSize=list(image.size),sha256=sha256(raw.read_bytes()).hexdigest())
        if not candidate['selected']:
            continue
        key = candidate['id']
        size = (320,640) if key=='W05' else (640,256)
        pivot = [size[0]*PIVOTS[key],size[1]*.5]
        image, transform = normalize(image,candidate['measuredGrip'],size,pivot)
        image.save(SOURCE/f'{key}.png')
        out = SOURCE/f'{key}.webp'
        image.save(out,'WEBP',lossless=True,quality=100,method=4,exact=True)
        decoded = Image.open(out).convert('RGBA')
        assert image.tobytes()==decoded.tobytes()
        measurements[key] = {'native':candidate['path'],'size':size,'grip':pivot,
            'originX':PIVOTS[key],'originY':.5,**transform,
            'svgSha256':sha256((ROOT/f'public/assets/weapons/{key}.svg').read_bytes()).hexdigest()}
        print(f'{key}: {candidate["nativeSize"]} -> {size}; grip {pivot}; lossless RGBA identical')
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (SOURCE/'weapons.measurements.json').write_text(json.dumps(measurements,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':
    main()
