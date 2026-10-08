from pathlib import Path
from datetime import datetime,timezone
import json

folder=Path('docs/validation');rows=[]
attempts=[
    ('first','No tests selected: the anchored grep matched the whole Playwright title, not its short test title.'),
    ('target','One failure: wind damage began before a normal jump could clear the body. Preserved first-failure screenshots.'),
    ('recheck','One failure: observed jump ascent but early wind damage. Delayed wind active damage to 40%-75% of its attack.'),
    ('recheck2','One failure: total XP included 7 XP from route hearts. Changed the test to compare boss reward delta, not total XP.'),
    ('recheck3','Interrupted after the first phone failure revealed unregistered core proof IDs in parseSave. Tablet had not completed. Added only the two authored IDs and two retired S09 enemy IDs to the strict whitelist.'),
    ('recheck4','2 passed, 2 failed: phone/tablet combat and glide passed; death and old victory tests read before the E input had opened the dialogue. Wait for actual dialogue visibility before checking T03.'),
]
for name,reason in attempts:
    path=folder/f's09-mechanics-{name}.json';stats=None
    if path.exists():stats=json.loads(path.read_text(encoding='utf-8')).get('stats')
    rows.append({'run':name,'report':path.as_posix() if path.exists() else None,'stats':stats,
        'log':f'docs/validation/s09-mechanics-{name}-output.txt','reason':reason})
data={'date':datetime.now(timezone.utc).isoformat(),'attempts':rows,
    'initialTypeError':'TS2556 in the new tuple-loop test; fixed by destructuring typed arguments.',
    'initialPermissionErrors':['Vitest dependency realpath EPERM: reran successfully with approved normal host permissions.','Snapshot path resolution WinError 5: reran successfully with approved normal host permissions.'],
    'runtimeFixes':['Wind damage starts after jump reaction clearance.','Explicit new core proof and retired enemy save IDs.'],
    'testCorrections':['XP delta includes no route-heart rewards.','Wait for dialogue before acquisition checks.'],
    'sourceCopies':'docs/validation/s09-mechanics-{first,second,third,fourth,fifth}-test.ts.txt',
    'failureScreenshots':'docs/screenshots/s09-mechanics/{first,second,third,fourth,fifth}-failure/'}
(folder/'s09-mechanics-development.json').write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(json.dumps({'attempts':len(rows),'complete':True}))
