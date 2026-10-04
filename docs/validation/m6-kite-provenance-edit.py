from pathlib import Path
p=Path(__file__).resolve().parents[2]/'src/content/assets.manifest.ts'
s=p.read_text(encoding='utf-8');old="source:'2026-10-01~03 OpenAI built-in imagegen";assert s.count(old)==1
p.write_bytes(s.replace(old,"source:'2026-10-01~04 OpenAI built-in imagegen").encode('utf-8'))
