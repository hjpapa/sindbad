# -*- coding: utf-8 -*-
from pathlib import Path
from hashlib import sha256
import json
root=Path('.');v=root/'docs/validation'
full=json.loads((v/'m6-bat-final-runtime-hashes.json').read_text(encoding='utf-8'))
tested=(v/'m6-bat-tested-manifest.ts.txt').read_bytes()
assert sha256(tested).hexdigest()==full['before']['src/content/assets.manifest.ts']
old="source:'2026-10-01~04 OpenAI built-in imagegen · docs/ART_PROMPTS.md · 원본 art-source/webtoon (무손실)'"
new="source:`${key==='bat-actions'?'2026-10-06':'2026-10-01~04'} OpenAI built-in imagegen · docs/ART_PROMPTS.md · 원본 art-source/webtoon (무손실)`"
assert (root/'src/content/assets.manifest.ts').read_text(encoding='utf-8')==tested.decode('utf-8').replace(old,new)
after={p.relative_to(root).as_posix():sha256(p.read_bytes()).hexdigest() for folder in ('src','public','dist','scripts','tests','art-source') for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts}
for path in ('package.json','package-lock.json','index.html','vite.config.ts','playwright.config.ts','tsconfig.json'):
    after[path]=sha256((root/path).read_bytes()).hexdigest()
changes=sorted(p for p in full['before'].keys()|after.keys() if full['before'].get(p)!=after.get(p))
assert changes and all(p=='src/content/assets.manifest.ts' or p.startswith('dist/') for p in changes),changes
budget=json.loads((v/'m6-bat-provenance-art-budget.json').read_text(encoding='utf-8'));assert budget['pass']
data={'reason':'New bat entry inherited the old shared 2026-10-01~04 source date. Only bat source text now uses actual generation date 2026-10-06; every older asset keeps its original source text.',
    'testedManifest':'docs/validation/m6-bat-tested-manifest.ts.txt','fullE2eStats':json.loads((v/'m6-bat-e2e-final.json').read_text(encoding='utf-8'))['stats'],
    'exactMetadataOnlySourceDiffVerified':True,'changesAfterFullRun':changes,'currentHashes':after,
    'checksAfterMetadataFix':['typecheck exit0','lint exit0','unit113/23files exit0','build (includes typecheck/content) exit0','art budget exit0'],
    'currentBudgetBytes':budget['totalBytes'],'fullE2eRepeatedAfterMetadataFix':False,'artStatus':'ART_DRAFT'}
(v/'m6-bat-provenance-postcheck.json').write_bytes((json.dumps(data,indent=2)+'\n').encode('utf-8'))
post=json.loads((v/'m6-bat-postcheck.json').read_text(encoding='utf-8'));post['provenanceCorrection']={'report':'docs/validation/m6-bat-provenance-postcheck.json','metadataOnly':True,'currentBudgetBytes':budget['totalBytes'],'fullE2eRepeated':False}
(v/'m6-bat-postcheck.json').write_bytes((json.dumps(post,indent=2)+'\n').encode('utf-8'))
note=f'''**최종 출처 날짜 보완:** 전체69개 실행 뒤 자산 목록의 박쥐 출처가 이전 공통 날짜2026-10-01~04를 상속한 것을 발견했다. 박쥐만 실제 생성일2026-10-06로 분리했고 다른 자산의 출처 문구를 유지했다. 원래 검사한 manifest를 사본으로 보존하고 **출처 문자열 한 곳만 바뀐 것**을 확인했다. 변경 파일은 그 manifest와 재빌드된 dist3파일뿐이다. 타입·린트·단위113개/23파일·콘텐츠 포함 build·용량 검사를 다시 통과했다. 최종 JS219.16KB, 첫 화면{budget['totalBytes']:,}/8,000,000B다. 전체69개 E2E는 출처 표기 보완 전 실행이며 이후 전체E2E를 반복하지 않았다. 실제 차이/해시는 `m6-bat-provenance-postcheck.json`, 로그는 `m6-bat-provenance-{{typecheck,lint,test,build,budget-output}}.txt`다. 원화·런타임 이미지·전투/좌표/보상/저장 코드·테스트는 전체 실행 때와 바이트 동일하다.

'''
p=root/'PROJECT_STATUS.md';text=p.read_text(encoding='utf-8');start=text.index('<!-- M6_BAT_STATUS_START -->');end=text.index('<!-- M6_BAT_STATUS_END -->')
block=text[start:end];block=block.replace('**미검증:**',note+'**미검증:**',1);p.write_bytes((text[:start]+block+text[end:]).encode('utf-8'))
for path in ('docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md','docs/PLAYTEST_LOG.md'):
    p=root/path;text=p.read_text(encoding='utf-8');at=text.index('\n\n',text.index('## M6 박쥐'))+2
    short='전체69검사 뒤 박쥐 자산의 출처 날짜만 실제 생성일로 분리하고 타입/린트/단위113개/콘텐츠·빌드/용량을 재검사했다. 현재 코드와 전체 실행 사이의 정확한 차이는 `docs/validation/m6-bat-provenance-postcheck.json`이며 이후 전체E2E 재실행은 하지 않았다.\n\n'
    p.write_bytes((text[:at]+short+text[at:]).encode('utf-8'))
print(json.dumps({'changes':changes,'budget':budget['totalBytes'],'fullPassed':data['fullE2eStats']['expected']}))
