from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json, shutil, subprocess, re
from PIL import Image

root=Path.cwd(); folder=root/'docs/validation'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
def dump(p,data):p.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
checks=load(folder/'s26-river-final-final-checks.json')
assert len(checks)==6 and all(c['exitCode']==0 for c in checks)
stats=load(folder/'s26-river-e2e-final.json')['stats']
assert stats['expected']==8 and stats['unexpected']==3 and stats['skipped']==stats['flaky']==0,stats
repair=load(folder/'s26-river-e2e-repair.json')['stats']
assert repair['expected']==4 and repair['unexpected']==repair['skipped']==repair['flaky']==0,repair
freeze=load(folder/'s26-river-final-runtime-hashes.json');assert freeze['unchanged'] and freeze['files']==1011
repairFreeze=load(folder/'s26-river-repair-runtime-hashes.json');assert repairFreeze['unchanged'] and repairFreeze['files']==1011
routeChanges=sorted(p for p in freeze['before'].keys()|repairFreeze['before'].keys() if freeze['before'].get(p)!=repairFreeze['before'].get(p))
assert routeChanges==['tests/e2e/journey-bot.ts','tests/e2e/s26-bats.spec.ts'],routeChanges
before=load(folder/'s26-bats-final-runtime-hashes.json')['before'];after=repairFreeze['before']
allowed={'src/content/maps.ts','src/content/finalStages.ts','src/content/reachability.ts','src/game/stage.ts','src/core/river.ts','tests/unit/river.test.ts','tests/e2e/s26-river.spec.ts','tests/e2e/s26-bats.spec.ts','tests/e2e/mobile-abilities.spec.ts','tests/e2e/journey-bot.ts'}
changed=sorted(p for p in before.keys()|after.keys() if before.get(p)!=after.get(p))
unexpected=[p for p in changed if p not in allowed and not p.startswith('dist/')];assert not unexpected,unexpected
media={p:h for p,h in before.items() if p.startswith(('art-source/','public/'))};assert len(media)==639
assert all(sha256((root/p).read_bytes()).hexdigest()==h for p,h in media.items())
assert all(before[p]==after[p] for p in ('package.json','package-lock.json'))
screens=root/'docs/screenshots/s26-river/verified';assert not screens.exists()
shutil.copytree(root/'docs/screenshots/s26-river/repair',screens)
for relative in ('s26-bats/legacy-rewards.png','s26-river/legacy-optional-skip.png','s26-river/legacy-unprepared-return.png'):
    p=root/'docs/screenshots/s26-river/final'/relative
    destination=screens/relative;destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,destination)
    observed=p.with_suffix('.json')
    if observed.exists():shutil.copy2(observed,destination.with_suffix('.json'))
bridge=list((root/'docs/screenshots/s26-river/final-test-results').rglob('S25-physical-bridge.png'));assert len(bridge)==1,bridge
(screens/'regression').mkdir();shutil.copy2(bridge[0],screens/'regression/S25-physical-bridge.png')
inventory=[]
for p in sorted(screens.rglob('*.png')):
    with Image.open(p) as im:size=list(im.size);im.verify()
    inventory.append({'path':p.relative_to(root).as_posix(),'size':size,'bytes':p.stat().st_size,'sha256':sha256(p.read_bytes()).hexdigest()})
assert len(inventory)==42,len(inventory)
dump(folder/'s26-river-final-screenshots.json',inventory)
budget=load(folder/'art-budget.json');assert budget['pass']
shutil.copy2(folder/'art-budget.json',folder/'s26-river-final-art-budget.json')
(folder/'art-budget.json').write_bytes((folder/'s26-river-budget-before.json').read_bytes())
development=[]
reasons={
 'first':'Ceiling assertion used the wrong sprite/body offset; legacy route exposed retained swimming drag and the new rock shelf path.',
 'second':'Actual bugs: bridge touch action lost priority near a bat; dragY=1800 cancelled gravity after leaving water.',
 'third':'Legacy bridge route passed. First-device bridge at raft height kept the passenger behind; moved the river bridge below the raft.',
 'fourth':'Boarding input was too short after entering water. Legacy return did collect the real authored heart, which the assertion had omitted.',
 'fifth':'Legacy unprepared return passed. A static cave shelf supported the feet instead of the moving raft; explicitly carry the passenger once.',
 'sixth':'All raft/cave/bonus actions passed; the test stopped inside the bonus ledge and could not descend. Move beyond the ledge before returning.'}
for name,reason in reasons.items():
    development.append({'run':name,'stats':load(folder/f's26-river-e2e-{name}.json')['stats'],'reason':reason,'screenshots':f'docs/screenshots/s26-river/{name}/','failures':f'docs/screenshots/s26-river/{name}-failure/'})
dump(folder/'s26-river-development.json',{'initialUnit':'127 passed, 1 failed: fresh save start reward omitted from expectation; corrected to preserve that existing reward. Final 129 passed.','e2e':development,'interrupted':load(folder/'s26-river-interrupted.json'),'primary':stats,'primaryFailures':'Two old bat tests tried to leave the underwater side cave through its solid right wall. The tablet raft test stopped upward input about 6px below the west floor step. Only the journey route and the bat test return waypoint changed.','repair':repair,'routeChanges':routeChanges,'fullSelectedRerun':False})
listeners=[l for l in subprocess.check_output(['netstat','-ano'],text=True).splitlines() if re.search(r':(?:5174|5175|9323)\s',l) and 'LISTENING' in l];assert not listeners,listeners
result={'date':datetime.now(timezone.utc).isoformat(),'pushedCommit':'7045f6e6eef33696c8122245b528d8c365939965','newWorkCommitted':False,'checks':checks,'e2ePrimary':stats,'e2eRepair':repair,'fullSelectedRerun':False,'routeChanges':routeChanges,'runtimeFilesUnchangedPerRun':1011,'previousMediaUnchanged':639,'dependenciesUnchanged':True,'changed':changed,'unexpected':unexpected,'screenshots':len(inventory),'budgetBytes':budget['totalBytes'],'budgetReportRestored':True,'listeners':listeners,'artStatus':'ART_DRAFT','deployment':False}
dump(folder/'s26-river-finish.json',result)
minutes=round(stats['duration']/60000,1)
repairMinutes=round(repair['duration']/60000,1)
entry=f'''<!-- S26_RIVER_STATUS_START -->
## 최신 실제 상태 · 2026-10-08 · S26 뗏목·암굴·안전 복귀

**기능 구현 / 단위129개 통과·선택 E2E11조건은8통과3실패 후 관련4조건 재통과 / ART_DRAFT.** 이전 S09 둥지·S26 박쥐 작업과 최종 검증 증거175파일을 `7045f6e`로 커밋하고 `origin/main`에 푸시했다. 원격 SHA `7045f6e6eef33696c8122245b528d8c365939965` 일치를 확인했다. 아래 새 뗏목 작업은 로컬 변경이며 아직 커밋·푸시하지 않았다. 배포 없음.

- 나무 운반 → 작업장 배달 → 밧줄1초 묶기로 뗏목을 준비한다. 운반 중 재개하면 배달되지 않은 나무는 원래 위치로 돌아온다. 배달/밧줄 완료는 기존 원자적 보상 저장 경로로 각각 한 번 기록하며 새 금화·XP를 지급하지 않는다. 기존 `S26.quest.1~3`, `.reward`, `.golden`, 적5마리·보상 ID와 저장 스키마를 유지했다.
- 폭260px/상단512px의 물리 뗏목은 100px/s의 정해진 경로를 이동한다. 승객이 없으면 기다리며, 미완료 물길 장치 앞1000/1640에서 멈춘다. 두 장치 완료 뒤2480까지 이동한다. 점프로 탑승, ↓로 내려 수영, 입구/쉼터/도착지 행동으로 부를 수 있다. 고정 선반과 발을 함께 받쳐도 승객을 한 번만 운반한다. 일시정지 때 이동/시뮬레이션이 멈춘다.
- 실제 충돌 천장3개와 장치에 연결된 물길 문2개를 배치했다. 첫 장치는 기존 T05 방울 다리/MP12를 유지하며, 다리를 뗏목 아래560px에 만들어 승객이 남지 않도록 했다. S25의512px 다리와 실물 건너기 규칙은 그대로다. 강의 x480~2660, 수면 아래에서만 진주 자유 수영을 적용하고, 육지/뗏목/수면 위에서는 중력과 수직 감속을 복원한다. 수면에서 ↑ 유지로 올라올 수 있다. 산소·음식·시간 고갈 관문 없음.
- G07은 깊은 수중 옆동굴(바닥704px, 지붕512px)로 옮겼다. 왼쪽120px 입구로 들어가 같은 물길로 복귀할 수 있다. 오른쪽 벽은 막다른 길이며 주 항로는 지붕 위로 연결된다. 별도의 위쪽 금화방은25금화를 한 번 지급하는 선택 갈림길이다. G07/금화방/박쥐 정화는 출구 필수 조건이 아니다. 별 지도 안내와 실제 ← 방향 장치, indiaArrival/S27 진행을 연결했다. 콘텐츠 검사에 동굴 입구 폭·신체 여유·수중 보물 배치를 추가해 좁거나 낮아진 변형을 거부한다.
- 옛 첫 물길/뒤 진행은 뗏목 준비의 증거로 파생하며 새 보상을 만들지 않는다. 첫 장치 없이 중간 쉼터에 저장한 옛 파일은 뒤쪽 문을 지나 나무 준비 장소로 돌아갈 수 있다. 왼쪽으로 복귀하면 문은 다시 정상 잠금으로 돌아간다. 체크포인트·G07·금화의 재개/중복0, 옛 진행·보상 보존을 검증했다.
- 최종 정적 순서 **타입 → 린트 → 단위129개/29파일 → 콘텐츠36구간·24장면·7무기/보물·8하트 → 빌드52모듈 → 첫 화면 {budget['totalBytes']:,}/8,000,000B 모두 exit0**. 기존 Phaser500KB청크 경고 유지. `docs/validation/s26-river-final-final-checks.json`과6로그. 콘텐츠 통과는 그래프·안전 지형 조건 검사이며 설계서/전체 플레이 완성 판정이 아니다.
- 선택 `npm run test:e2e -- tests/e2e/s26-river.spec.ts tests/e2e/s26-bats.spec.ts tests/e2e/mobile-abilities.spec.ts tests/e2e/story-devices.spec.ts --grep 'S26|S16 protected|carried wood|S25 bridge' --reporter=list,json,html`은 **8통과3실패·exit1·{minutes}분**, skipped/flaky0. 기존 박쥐2조건은 G07 뒤 오른쪽 막힌 벽을 향하는 검사 경로에서 실패했고, 새 태블릿 동선은 서쪽 바닥 턱보다 약6px 낮게 상승 입력을 멈췄다. **게임 변경 없이** 공통 이동 검사와 박쥐 검사2파일만 보완한 뒤 `npm run test:e2e -- tests/e2e/s26-river.spec.ts tests/e2e/s26-bats.spec.ts --grep 'five bounded bats|prepares and rides raft' --reporter=list,json,html`은 **4/4통과·exit0·{repairMinutes}분**, skipped/flaky0. 수정 후 전체11조건을 다시 실행하지 않았다. 타입/린트 재검사도 exit0(`s26-river-repair-typecheck.txt`, `s26-river-repair-lint.txt`).
- 통과 관측은 새 폰/태블릿(연출 줄이기)2조건의 운반 중 재개·준비·실제 탑승/동승 이동·일시정지·낮은 천장 충돌·터치 장치·문2개·수영·체크포인트 회복·G07 동굴 왕복·재탑승·선택 금화방 착지/보상·S27다. 옛 첫 장치 저장의 선택 경로 생략과 미준비 중간 저장의 역방향 복귀2조건, 기존 박쥐 정상/의도적 시트 누락2조건·옛 적 보상1조건, 모바일 조작1조건, S16 보호/수영·S25 운반·S25 실물 다리3조건도 각각 통과 기록이 있다. 명시적 스테이지·장비 저장 픽스처와 정상 키/터치 입력이며 새 게임36구간 완주가 아니다.
- 최초 결과 `docs/validation/s26-river-e2e-final.json`, `s26-river-e2e-final-output.txt`, `s26-river-final-report/`; 재검증은 `s26-river-e2e-repair.json`, `s26-river-e2e-repair-output.txt`, `s26-river-repair-report/`. 통과 실행에서 모은 PNG42장은 `docs/screenshots/s26-river/verified/`: 새 동선24장 `s26-river/`, 박쥐17장 `s26-bats/`, S25실물 다리1장 `regression/S25-physical-bridge.png`. 대표 `s26-river/phone-ride.png`, `tablet-water-gates-open.png`, `phone-golden-side-cave.png`, `tablet-cave-return.png`, `tablet-bonus-dead-end.png`, `legacy-unprepared-return.png`. 모든 크기·바이트·SHA는 `s26-river-final-screenshots.json`, 새 동선/박쥐 화면별 관측은 함께 보존한 JSON이다. 실패 원본은 `final/`, `final-test-results/`에 그대로 보존했다.
- 개발 중 실제 실패6회와 중단한11조건 실행(2통과4실패, 나머지5미실행), 단위 기대값 실패를 보존했다. 수영 감속/터치 우선순위/다리 높이/고정 선반 동승·마지막 별 장치 좌표는 게임을 수정했고, 신체 좌표 기대값/수면까지 점프 유지/하트 수집 기대값/발판 밖으로 하강·동굴 복귀는 검사를 보완했다. 원래 로그/JSON·실패 PNG/문맥·검사 사본은 `s26-river-development.json` 참조. 최초/재검사 각각 전후1011파일 SHA 일치(`s26-river-final-runtime-hashes.json`, `s26-river-repair-runtime-hashes.json`); 두 실행 사이 차이는 검사2파일뿐이다. 기존 미디어639파일 및 의존성/lockfile 보존. 이번 용량 보고서는 별도 보존 후 기존 바이트 복구. 5174/5175/9323 LISTENING 없음. 종합 `s26-river-finish.json`, diff `s26-river-final-diff-check.txt`.

**남은 문제/미검증:** 뗏목/천장/동굴은 기능 구현이며 최종 원화 승인은 ART_DRAFT. 뗏목은 자체 런타임 Graphics260×40 도형, 지형/NPC/박쥐는 기존 실재 아트 재사용으로 새 이미지 생성·원본 변경 없음. 폰844×390 도착지/옆동굴 화면에서 안내 문구 일부 겹침을 확인했으며 표시 밀도 개선은 남았다. 기존 S08 박쥐 제한 비행, S32 저주 구체4개 등 설계 차이는 미완료. 이번 변경 후 전체91개 E2E·저장 주입 없는 새 게임36구간 재완주는 미검증(변경 범위11조건을 실행하고 실패 관련4조건 재검사). 검사 경로 보완 후11조건 전체 재실행은 미검증(게임·빌드·에셋은 바이트 동일하며 바뀐 경로를 쓰는4조건 재통과). 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·실제 스피커·최종 아트 승인은 미검증(Windows Edge 자동 입력).

**다음 한 작업:** S32의 저주 구체4개를 실제 플레이에 연결하고, 아리아나 협력 퍼즐·기존 저장·구출 보상이 유지되는지 검증한다.
<!-- S26_RIVER_STATUS_END -->
'''
p=root/'PROJECT_STATUS.md';text=p.read_text(encoding='utf-8');assert 'S26_RIVER_STATUS_START' not in text
p.write_bytes(text.replace('# PROJECT_STATUS.md\n','# PROJECT_STATUS.md\n\n'+entry,1).encode('utf-8'))
for name in ('ART_PROMPTS.md','ASSET_REGISTER.md'):
    p=root/'docs'/name;text=p.read_text(encoding='utf-8');head,tail=text.split('\n',1)
    note='\n\n## 2026-10-08 · S26 뗏목·동굴 동선 · ART_DRAFT\n\n`src/game/stage.ts`의 `createRiver`가 자체 Graphics로260×40 통나무·밧줄 도형 텍스처를 만든다(프로젝트 자체 제작, 사용·수정 가능). 별도 이미지 파일/AI 프롬프트 실행 없음. 기존 지형·선원·박쥐·금화·황금 하트 아트를 재사용하며 소스/런타임 미디어639파일 바이트를 보존했다. 최종 웹툰 뗏목/지형 승인 미완료, 기존 이용 조건과 ART_DRAFT 유지. 통과 실행의 실제 화면은 `docs/screenshots/s26-river/verified/`, 최초8통과3실패와 관련4조건 재통과 상세·남은 문제는 PROJECT_STATUS.md의 S26 뗏목 기록 참조.\n\n'
    p.write_bytes((head+note+tail).encode('utf-8'))
p=root/'docs/PLAYTEST_LOG.md';text=p.read_text(encoding='utf-8');head,tail=text.split('\n',1)
p.write_bytes((head+f'\n\n## 2026-10-08 · S26 뗏목·암굴 왕복\n\n단위129개 통과. 선택 E2E11조건은8통과3실패({minutes}분), 게임 변경 없이 검사2파일의 복귀 경로를 보완한 뒤 관련 폰/태블릿4조건 재통과({repairMinutes}분). skipped/flaky0. 폰/태블릿 새 동선2·옛 저장2·박쥐 정상/누락/옛 보상3·모바일 조작1·S16수영/S25운반/실물다리3조건에 각각 통과 기록이 있다. 실제 나무/밧줄 준비, 동승·하차·재탑승, 문2개, 천장 충돌, G07/금화방 왕복·보상 한번, 안전 체크포인트 재개, indiaArrival/S27를 확인했다. 통과 실행 PNG42장 `docs/screenshots/s26-river/verified/`, 원래 실패 로그와 최초/재검사 결과는 `docs/validation/s26-river-development.json`, `s26-river-e2e-final.json`, `s26-river-e2e-repair.json`. 폰844×390 안내 일부 겹침은 남은 문제다. 보완 후 전체11조건 재실행·전체91개/새 게임36구간 재완주·실기기·어린이·장시간 성능은 미검증. ART_DRAFT·새 작업 로컬 변경·배포 없음. 이전 완료 작업은7045f6e로 푸시했다.\n\n'+tail).encode('utf-8'))
print(json.dumps({'done':True,'e2ePrimary':stats,'e2eRepair':repair,'screenshots':len(inventory),'budgetBytes':budget['totalBytes']}))
