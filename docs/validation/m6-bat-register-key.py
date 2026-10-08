from pathlib import Path
p=Path('src/content/assets.manifest.ts')
data=p.read_text(encoding='utf-8')
old="'enemy-actions','kite-actions','siren-actions','whale-webtoon'"
assert data.count(old)==1
p.write_bytes(data.replace(old,"'enemy-actions','kite-actions','siren-actions','bat-actions','whale-webtoon'").encode('utf-8'))
