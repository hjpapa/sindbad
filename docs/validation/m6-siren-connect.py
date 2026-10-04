from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2]
p=ROOT/'src/content/assets.manifest.ts';s=p.read_text(encoding='utf-8');old="'enemy-actions','kite-actions','whale-webtoon'";assert s.count(old)==1
p.write_bytes(s.replace(old,"'enemy-actions','kite-actions','siren-actions','whale-webtoon'").encode('utf-8'))
p=ROOT/'art-source/webtoon/generated/siren-m6/siren-actions-01.json';r=json.loads(p.read_text(encoding='utf-8'))
r['status']='rejected; attack sound ripple crosses vertical native cell seam x626..627, y724..822; PNG/prompt preserved'
p.write_bytes((json.dumps(r,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
