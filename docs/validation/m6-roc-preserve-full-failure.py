from pathlib import Path
from hashlib import sha256
import json,shutil
root=Path('.');v=root/'docs/validation'
data=json.loads((v/'m6-roc-e2e-final.json').read_text(encoding='utf-8'));failures=[]
digest=lambda p:sha256(p.read_bytes()).hexdigest()
def preserve(p):
    out=root/'docs/screenshots/m6-roc/full-regression-failure'/p.parent.name/p.name
    out.parent.mkdir(parents=True,exist_ok=True)
    if out.exists():assert digest(out)==digest(p)
    else:shutil.copyfile(p,out)
    return {'path':out.as_posix(),'sha256':digest(out)}
def walk(suite):
    for spec in suite.get('specs',[]):
        for test in spec['tests']:
            for result in test['results']:
                if result['status']!='failed':continue
                files={}
                for attachment in result.get('attachments',[]):
                    if 'path' not in attachment:continue
                    p=Path(attachment['path']);row=preserve(p);files[row['path']]=row
                    context=p.parent/'error-context.md'
                    if context.exists():row=preserve(context);files[row['path']]=row
                failures.append({'title':spec['title'],'error':result.get('error'),'files':list(files.values())})
    for child in suite.get('suites',[]):walk(child)
walk(data)
(v/'m6-roc-full-regression-failures.json').write_bytes((json.dumps({'stats':data['stats'],'failures':failures},indent=2)+'\n').encode('utf-8'))
p=root/'tests/e2e/spirit-actions.spec.ts';out=v/'m6-roc-before-spirit-repair.test.ts.txt'
assert not out.exists();shutil.copyfile(p,out)
print(json.dumps({'stats':data['stats'],'failures':failures}))
