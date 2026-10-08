# -*- coding: utf-8 -*-
from pathlib import Path
p=Path('src/content/assets.manifest.ts');s=p.read_text(encoding='utf-8')
old="source:'2026-10-01~04 OpenAI built-in imagegen · docs/ART_PROMPTS.md · 원본 art-source/webtoon (무손실)'"
assert s.count(old)==1
s=s.replace(old,"source:`${key==='bat-actions'?'2026-10-06':'2026-10-01~04'} OpenAI built-in imagegen · docs/ART_PROMPTS.md · 원본 art-source/webtoon (무손실)`")
p.write_bytes(s.encode('utf-8'))
