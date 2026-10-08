# -*- coding: utf-8 -*-
"""Keep failed full-suite evidence before a targeted Playwright run cleans it."""
from pathlib import Path
from hashlib import sha256
import json
import shutil

ROOT = Path(__file__).resolve().parents[2]
V = ROOT / 'docs/validation'
report = json.loads((V / 'm6-spirit-e2e-final.json').read_text(encoding='utf-8'))
out = ROOT / 'docs/screenshots/m6-spirit/full-regression-failures'
out.mkdir(parents=True, exist_ok=True)
failures = []

def visit(suites):
    for suite in suites:
        for spec in suite.get('specs', []):
            for test in spec['tests']:
                for result in test['results']:
                    if result['status'] in ('passed', 'skipped'):
                        continue
                    files = []
                    for attachment in result.get('attachments', []):
                        if not attachment.get('path'):
                            continue
                        source = Path(attachment['path'])
                        if not source.is_absolute():
                            source = ROOT / source
                        for item in source.parent.iterdir():
                            if not item.is_file():
                                continue
                            target = out / source.parent.name / item.name
                            target.parent.mkdir(exist_ok=True)
                            shutil.copyfile(item, target)
                            assert target.read_bytes() == item.read_bytes()
                            files.append({'source': item.relative_to(ROOT).as_posix(),
                                          'preserved': target.relative_to(ROOT).as_posix(),
                                          'sha256': sha256(item.read_bytes()).hexdigest()})
                    failures.append({'title': spec['title'], 'file': spec['file'],
                                     'status': result['status'], 'errors': result.get('errors', []),
                                     'files': files})
        visit(suite.get('suites', []))

visit(report['suites'])
sources = []
for name in ('m2', 'siren-actions'):
    source = ROOT / f'tests/e2e/{name}.spec.ts'
    target = V / f'm6-spirit-full-before-{name}.ts.txt'
    assert not target.exists()
    shutil.copyfile(source, target)
    sources.append({'source': source.relative_to(ROOT).as_posix(),
                    'preserved': target.relative_to(ROOT).as_posix(),
                    'sha256': sha256(source.read_bytes()).hexdigest()})
data = {'stats': report['stats'], 'failures': failures, 'testSources': sources}
(V / 'm6-spirit-full-regression-failures.json').write_bytes(
    (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
print(json.dumps(data, ensure_ascii=True, indent=2))
