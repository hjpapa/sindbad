from pathlib import Path
p=Path(__file__).resolve().parents[2]/'src/game/stage.ts'
s=p.read_text(encoding='utf-8');old='flipX:e.sprite.flipX, originY:e.sprite.originY';assert s.count(old)==1
p.write_bytes(s.replace(old,'flipX:e.sprite.flipX, originX:e.sprite.originX, originY:e.sprite.originY').encode('utf-8'))
