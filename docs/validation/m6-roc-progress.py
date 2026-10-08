from pathlib import Path
from datetime import datetime,timezone
import json,re
v=Path('docs/validation');log=v/'m6-roc-e2e-final-output.txt'
text=log.read_text(encoding='utf-8',errors='replace') if log.exists() else ''
rows=re.findall(r'^\s+(ok|x)\s+(\d+)\s+(.+)',text,re.M)
screens=list(Path('docs/screenshots/m6-roc/final').rglob('*.png'))
journey=re.findall(r'JOURNEY S\d+ cleared; \d+/36',text)
print(json.dumps({'date':datetime.now(timezone.utc).isoformat(),'finished':len(rows),
    'passed':sum(row[0]=='ok' for row in rows),'failed':sum(row[0]=='x' for row in rows),
    'latest':rows[-1][2].split(' \u203a ')[0] if rows else None,'screens':len(screens),
    'lastScreenshot':max(screens,key=lambda p:p.stat().st_mtime).name if screens else None,
    'journey':journey[-1] if journey else None}))
