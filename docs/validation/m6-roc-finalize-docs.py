# -*- coding: utf-8 -*-
from pathlib import Path
from hashlib import sha256
from PIL import Image
import json
root=Path('.');v=root/'docs/validation'
full=json.loads((v/'m6-roc-e2e-final.json').read_text(encoding='utf-8'))
stats=full['stats'];assert stats['expected']==76 and stats['unexpected']==1 and stats['skipped']==stats['flaky']==0
repair=json.loads((v/'m6-roc-regression-repair.json').read_text(encoding='utf-8'))['stats']
assert repair['expected']==4 and repair['unexpected']==repair['skipped']==repair['flaky']==0
frozen=json.loads((v/'m6-roc-final-runtime-hashes.json').read_text(encoding='utf-8'));assert frozen['unchanged']
integrity=json.loads((v/'m6-roc-final-integrity.json').read_text(encoding='utf-8'))
screens=[]
for folder in ('docs/screenshots/m6-roc/final/m6-roc','docs/screenshots/m6-roc/mobile'):
    for p in sorted((root/folder).glob('*.png')):
        with Image.open(p) as im:width,height=im.size
        screens.append({'path':p.as_posix(),'width':width,'height':height,'bytes':p.stat().st_size,'sha256':sha256(p.read_bytes()).hexdigest()})
assert len(screens)==72,len(screens)
for p in (root/'docs/screenshots/m6-roc/final/m6-roc').glob('*.json'):
    assert json.loads(p.read_text(encoding='utf-8'))['errors']==[]
(v/'m6-roc-final-screenshots.json').write_bytes((json.dumps(screens,indent=2)+'\n').encode('utf-8'))
minutes=stats['duration']/60000
p=root/'PROJECT_STATUS.md';text=p.read_text(encoding='utf-8');a,b='<!-- M6_ROC_STATUS_START -->','<!-- M6_ROC_STATUS_END -->'
start=text.index(a);end=text.index(b)+len(b)
section=text[start:end]
section=section.replace('**구현·로크새4조건 검증 완료 / 전체77개 중76통과·1실패, 정령 검사 보완 후 관련4조건 재검증 중 / ART_DRAFT.**',f'**로크새 구현·4조건 검증 완료 / 전체77개 E2E 76통과·1실패({minutes:.1f}분), 검사 보완 후 정령4조건 통과 / ART_DRAFT.**')
old=next(line for line in section.splitlines() if line.startswith('- 전체 실행 전 실제 소스/자산/빌드/원화/스크립트/테스트997파일'))
new=f'''- 전체 `npm run test:e2e -- --reporter=list,json,html` exit1, **76통과·정령1실패/{minutes:.1f}분**, 건너뜀/재시도0. 새 게임 실제 입력36구간 완주와 새 로크새4조건은 통과. S06 정령 터치 공격이 빗나가 HP31이 유지된 검사였고, 현재 적 위치를 다시 읽고 접근/방향을 맞추도록 **검사1파일만 보완**했다. 게임/자산/빌드 변경 없음. 관련 정령4조건 재실행 **exit0/모두통과/{repair['duration']/60000:.1f}분**. 보완 후 전체77개 재실행은 미검증: 게임 바이트가 같고 관련4조건을 모두 재검사하여 전체 실행을 반복하지 않았다. 전체 통과로 바꾸어 기록하지 않는다. `m6-roc-e2e-final.json`, `m6-roc-regression-repair.json`, 양쪽 로그/HTML 보고서와 `m6-roc-full-regression-failures.json`에 실제 결과 보존.
- 전체 전후997파일 SHA256 일치, 보완4조건 전후도997파일 일치. 두 검증본의 차이는 `tests/e2e/spirit-actions.spec.ts` 하나뿐(`m6-roc-regression-repair-code-diff.json`). 기존 미디어575개와 백업402개 확인. 기존 아트 연결4파일·감사/최적화2파일·단위 기대값1파일·정령 검사 접근1파일 외 이전 코드 보존. 이전 고정 JSON{integrity['historicalReportsRestored']}개를 바이트 복구하고 이번 실행본을 `m6-roc-regression-reports/`에 보존했다. `m6-roc-final-runtime-hashes.json`, `m6-roc-regression-repair-runtime-hashes.json`, `m6-roc-final-integrity.json`.
- 최종 로크새66+터치6=**72스크린샷** 보존. `docs/screenshots/m6-roc/final/m6-roc/`의 폰/태블릿·정상/누락 S09 봉인/공격/해제/보물/재개/이단점프와 S10/S33 프레임/반전/날개 공격/재개, `docs/screenshots/m6-roc/mobile/`. 대표 `phone-normal-S09-telegraph.png`, `tablet-normal-S09-defeated.png`, `phone-normal-S33-attack.png`. 실제 크기/바이트/SHA는 `m6-roc-final-screenshots.json`. 짧은 공격은 관측 JSON과 원화 프레임도 함께 확인했다. 자체 서버 종료 및 최종 diff 검사 확인.'''
assert old in section;section=section.replace(old,new)
section=section.replace('현재 다음 한 작업은 로크새 E2E 수정·전체 회귀 완료다.','**다음 한 작업: S09 설계 정합성 구현 — 저주 핵3회·고유 공격3패턴과 T03 지상 활공을 실제 플레이에 연결하고 저장·재시도를 검증한다.**')
p.write_bytes((text[:start]+section+text[end:]).encode('utf-8'))
p=root/'docs/PLAYTEST_LOG.md';text=p.read_text(encoding='utf-8');title,rest=text.split('\n',1)
entry=f'''## 2026-10-07 · M6 로크새 행동6프레임

로컬 Windows/Node24.16.0/Python3.9.7/Edge headless. 내장 imagegen 네이티브3×2/1536×1024 보존→전체 셀448+32px 투명 여백→무손실928,470B/런타임103,480B. S09 보스4자세/회복과 S10·S33 날개4/5/공격2, JSON 안장 좌표/반전 원점, 누락 원화 복구 연결. 기존 전투 피해/활성/재사용·물리/ID/저장 유지. 동물 평온 해제900ms 후 기존 소멸은 아트 표시 변경이다. ART_DRAFT.

정적8명령 순서 모두통과, 단위117/25파일·178실제 이미지·36/24/7/7/8 콘텐츠 그래프·빌드48모듈·첫 화면3,085,916/8,000,000B. 콘텐츠 그래프는 설계 전체 일치 검사가 아니다. 검사만 보완한 마지막 타입/린트도 통과. 기존 Phaser 큰 청크 경고 유지.

전용4조건5.4분 모두통과. 명시적 stage/레벨/보물 픽스처; 실제 키/터치 입력으로 봉인·보스/무적 주기·해제·XP6/금화3 한번·T03 조기 차단/대화 중 저장/새로고침·이단점프·비행22피해/42×84 물리·안장/동승자·일시정지·중간 재개·캐시 해제를 확인했다. 전체77개 **{minutes:.1f}분/exit1/76통과·정령1실패**. 새 게임36구간 완주/로크새4조건은 통과. S06에서 공격이 빗나가 HP31이 유지된 정령 검사는 현재 적 위치/방향을 다시 읽도록 검사1파일만 보완, 관련4조건 재검사 **{repair['duration']/60000:.1f}분/exit0/모두통과**. 게임/자산/빌드 변경 없음. 전체 전후와 보완검사 전후 각각997해시는 동일하며 두 검증본은 검사1파일만 다르다. 보완 뒤 전체77재실행은 미검증(동일 게임 바이트와 관련4조건 재검사로 전체 반복 생략); 전체통과로 기록하지 않는다. 원본575미디어·402백업·이전 고정 JSON{integrity['historicalReportsRestored']}개 보존.

최초 단위1실패(구 S09 시트 없음 기대값), 새 E2E4실패(기존 문구 불일치)→4실패(이동 직후 물리/그림 비교 시점)→2통과/2실패(상승 속도 구간을 coarse poll이 놓침)→4통과. 검사만 수정했고 모든 실패 로그/화면/원래 검사 소스를 보존했다. 증거 `docs/validation/m6-roc-development.json`, `docs/screenshots/m6-roc/{{first,second,third}}-target-failure/`.

CDP 실제 터치 exit0/오류[]: 폰257px·태블릿252px 이동, 밀기 반전, 첫 해골 처치, 선장 대화. 동시 이동·점프 양쪽dx0/dy−110px로 가로 판정 보류. 최종 로크새66+모바일6=72화면은 `docs/screenshots/m6-roc/final/m6-roc/`, `docs/screenshots/m6-roc/mobile/`, SHA목록 `docs/validation/m6-roc-final-screenshots.json`. 전체 결과 `docs/validation/m6-roc-e2e-final.json`, 코드 고정 `m6-roc-final-runtime-hashes.json`, 보존/서버 종료 `m6-roc-final-integrity.json`.

**미구현:** S09 핵3회/고유3패턴·T03 별도 지상 활공, S26박쥐5/S32구체4/박쥐 제한 비행 경로. **미검증:** 실기기·iOS·어린이 난이도·장시간FPS/발열·스피커·사용자 최종 아트 승인. 이번 커밋/푸시/배포 없음. 다음 한 작업은 S09 설계 정합성이다.

'''
assert '## 2026-10-07 · M6 로크새 행동6프레임' not in text
p.write_bytes((title+'\n\n'+entry+rest.lstrip('\n')).encode('utf-8'))
print(json.dumps({'fullPassed':stats['expected'],'minutes':minutes,'primaryScreens':len(screens)}))
