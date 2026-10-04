from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def replace(file,old,new):
    path=ROOT/file; data=path.read_text(encoding='utf-8');assert data.count(old)==1,(file,old)
    path.write_bytes(data.replace(old,new).encode('utf-8'))
replace('src/game/stage.ts',"...(maps[id].spawns.some(spawn=>spawn.actionArt)?['enemy-actions']:[])","...maps[id].spawns.flatMap(spawn=>spawn.actionArt?[enemyActionTexture(spawn.actionArt)]:[])")
replace('src/content/assets.manifest.ts',"'enemy-atlas','enemy-actions','whale-webtoon'","'enemy-atlas','enemy-actions','kite-actions','whale-webtoon'")
replace('src/content/finalStages.ts',"kind:'kite' as const,hp:","kind:'kite' as const,actionArt:'kite' as const,hp:")
replace('scripts/audit-webtoon.py','len(files) == 168','len(files) == 170')
replace('scripts/audit-webtoon.py','Expected 84 originals + 84 runtime copies','Expected 85 originals + 85 runtime copies')
