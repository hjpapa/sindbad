from pathlib import Path
from hashlib import sha256
import json
from PIL import Image
rows=[]
for n in ('01','02'):
    path=Path(f'art-source/webtoon/generated/spirit-m6/spirit-actions-{n}.png');im=Image.open(path).convert('RGBA');a=im.getchannel('A').point(lambda v:255 if v>16 else 0)
    edges=[{'edge':edge,'vertical':a.crop((edge,0,edge+1,1254)).getbbox(),'horizontal':a.crop((0,edge,1254,edge+1)).getbbox()} for edge in (0,626,627,1253)]
    rows.append({'path':str(path),'size':im.size,'sha256':sha256(path.read_bytes()).hexdigest(),'edges':edges,'selected':n=='02','visualReview':'No writing, child-safe original wisp. First attack effect crosses central seam; selected second complete sprites are contained.'})
assert any(edge['vertical'] for edge in rows[0]['edges'])
assert all(not edge['vertical'] and not edge['horizontal'] for edge in rows[1]['edges'])
Path('docs/validation/m6-spirit-native-boundaries.json').write_bytes((json.dumps(rows,indent=2)+'\n').encode('utf-8'))
print('Rejected first boundary crossing confirmed; selected second transparent boundaries confirmed.')
