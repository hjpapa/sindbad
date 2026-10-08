from pathlib import Path
import json,re
p=Path('docs/validation/m6-spirit-e2e-final-output.txt');text=p.read_text(encoding='utf-8',errors='replace') if p.exists() else ''
cases=re.findall(r'^\s+(ok|x)\s+(\d+)\s+(.+)$',text,re.M)
journey=re.findall(r'JOURNEY (S\d+) cleared; (\d+)/36',text)
data={'completed':len(cases),'passed':sum(row[0]=='ok' for row in cases),'failed':sum(row[0]=='x' for row in cases),'last':cases[-1][2] if cases else 'starting','journey':journey[-1] if journey else None}
print(json.dumps(data))
