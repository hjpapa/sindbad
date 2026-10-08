from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,shutil,subprocess,re
from PIL import Image

root=Path.cwd();folder=root/'docs/validation';load=lambda p:json.loads(p.read_text(encoding='utf-8'))
def dump(p,data):p.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
checks=load(folder/'s26-bats-final-checks.json');assert len(checks)==6 and all(r['exitCode']==0 for r in checks)
stats=load(folder/'s26-bats-e2e-final.json')['stats'];assert stats['expected']==6 and stats['unexpected']==stats['skipped']==stats['flaky']==0,stats
freeze=load(folder/'s26-bats-final-runtime-hashes.json');assert freeze['unchanged'] and freeze['files']==1008
old=load(folder/'s09-nest-final-runtime-hashes.json')['before'];current=freeze['before']
allowed={'src/content/maps.ts','src/content/finalStages.ts','src/content/validate.ts','src/game/stage.ts','src/core/batFlight.ts','tests/unit/bat-actions.test.ts','tests/unit/bat-flight.test.ts','tests/e2e/s26-bats.spec.ts'}
changes=sorted(p for p in old.keys()|current.keys() if old.get(p)!=current.get(p));unexpected=[p for p in changes if p not in allowed and not p.startswith('dist/')];assert not unexpected,unexpected
media={p:h for p,h in old.items() if p.startswith(('art-source/','public/'))};assert len(media)==639
assert all(sha256((root/p).read_bytes()).hexdigest()==h for p,h in media.items())
assert all(current[p]==old[p] for p in ('package.json','package-lock.json'))
inventory=[]
for p in sorted((root/'docs/screenshots/s26-bats/final').rglob('*.png')):
    with Image.open(p) as image:size=list(image.size);image.verify()
    inventory.append({'path':p.relative_to(root).as_posix(),'size':size,'bytes':p.stat().st_size,'sha256':sha256(p.read_bytes()).hexdigest()})
assert len(inventory)==33,len(inventory)
dump(folder/'s26-bats-final-screenshots.json',inventory)
budget=load(folder/'art-budget.json');assert budget['pass'];copy=folder/'s26-bats-art-budget.json';assert not copy.exists();shutil.copy2(folder/'art-budget.json',copy)
(folder/'art-budget.json').write_bytes((folder/'s26-bats-before/art-budget.json').read_bytes())
minutes=round(stats['duration']/60000,1)
listeners=[line for line in subprocess.check_output(['netstat','-ano'],text=True).splitlines() if re.search(r':(?:5174|5175|9323)\s',line) and 'LISTENING' in line];assert not listeners,listeners
result={'date':datetime.now(timezone.utc).isoformat(),'checks':checks,'e2e':stats,'runtimeFilesUnchanged':1008,'previousMediaUnchanged':639,'intentionalChanges':changes,'unexpectedChanges':unexpected,'dependenciesUnchanged':True,'screenshots':len(inventory),'budgetBytes':budget['totalBytes'],'budgetReportRestored':True,'listeners5174_5175_9323':listeners,'artStatus':'ART_DRAFT','commitPushDeploy':False}
dump(folder/'s26-bats-finish.json',result)
development={'first':load(folder/'s26-bats-e2e-first.json')['stats'],'firstReason':'Phone horizontal escape crossed the actual locked warning marker. Changed only the test to swim up immediately, before the screenshot. Tablet and legacy conditions passed.','recheck':load(folder/'s26-bats-e2e-recheck.json')['stats'],'recheckReason':'Phone and legacy passed; tablet failed while overwriting its evidence JSON (Windows UNKNOWN open). Changed only the test to immutable per-shot JSON files.','gameTimingChangedAfterFirst':False,'final':stats,'failureEvidence':['docs/screenshots/s26-bats/first-failure/','docs/screenshots/s26-bats/recheck-failure/'],'sourceCopies':['docs/validation/s26-bats-first-test.ts.txt','docs/validation/s26-bats-second-test.ts.txt']}
dump(folder/'s26-bats-development.json',development)
entry=f'''<!-- S26_BATS_STATUS_START -->
## 최신 실제 상태 · 2026-10-08 · S26 박쥐5마리·제한 비행

**기능 구현·선택 E2E6조건 통과 / 단위125개 통과 / ART_DRAFT.** S26의 산적3명을 동굴 박쥐5마리로 연결했다. 기존 `S26.enemy.1~3` 보상·진행 ID를 유지하고 `.4/.5`만 추가했다. S09 둥지 작업을 포함한 기존 로컬 변경은 보존했다. 이번 작업 커밋·푸시·배포 없음.

- 각 박쥐는 원래 배치 중심 기준 가로±90px/세로±50px(가운데±40px), 4초 주기의 제한 경로를 비행한다. 플레이어를 2차원 거리170px 안에서 감지하면 현재 위치를 고정하고 1200ms 예고(편안함1.3배)→500ms 돌진 왕복→1100ms 빈틈. 예고 시 목표를 자기 구역 안으로 제한해 고정하고, 구역 밖까지 추적하지 않는다. 경고 원·이동 선과 기존 행동4셀/몸통 좌표를 사용한다. 불꽃·일반 무기 판정은 기존대로이며 이동 도형과 무관한 투사체는 만들지 않는다. 피격 밀치기로 경로를 벗어나지 않도록 이 비행 적에는 기존 수평 밀치기 트윈을 적용하지 않는다.
- 저주 해제 시 기존 동물 정화 연출과 XP6/금화3를 한 번 지급한다. 보상 ID가 저장된 박쥐는 재개 시 생성하지 않는다. 옛 산적 보상3개가 있는 저장은 이를 그대로 인정하여 남은 새2마리만 생성한다. 목표·아이템·스키마를 바꾸지 않았고, 적을 모두 정화하지 않아도 기존 물길 장치·G07·항구 플래그·S27 출구가 작동한다. 가운데 박쥐는 y320~400에서만 움직여 x1560의 체크포인트 바닥(y546)을 공격하지 못한다.
- S08 기존 박쥐4마리의 배치/HP/AI·안전 퍼즐 구간은 유지했다. 새 경로는 `flightPath`가 있는 S26에만 적용한다. 새 아트 생성/원본 수정 없음; 기존 `bat-actions`와 시트 누락 시 자체 SVG 복구를 재사용했다. 기존 소스·런타임 미디어639파일 및 의존성/lockfile SHA 보존. 최종 웹툰 아트 승인은 ART_DRAFT.
- 최종 정적6명령 순서 **타입→린트→단위125개/28파일→콘텐츠36구간·24장면·7무기/보물·8하트→빌드51모듈→용량 {budget['totalBytes']:,}/8,000,000B 모두 exit0**. `docs/validation/s26-bats-final-checks.json`, 6로그. 마지막 검사 파일의 증거 저장 방식 보완 후 타입/린트도 재통과(`s26-bats-final-typecheck.txt`, `s26-bats-final-lint.txt`). 기존 Phaser500KB청크 경고 유지. 콘텐츠 통과는 등록·획득·도달성 그래프 검사이며 설계서 전체 일치 판정이 아니다.
- 최종 E2E **6/6통과·exit0·{minutes}분**, skipped/flaky0. `npm run test:e2e -- tests/e2e/s26-bats.spec.ts tests/e2e/mobile-abilities.spec.ts tests/e2e/bat-actions.spec.ts --grep 'S26|phone bat four actions|tablet bat missing-sheet' --reporter=list,json,html`. 신규 S26 폰 정상/태블릿 시트 누락·연출 줄이기2조건: 실제 순찰 좌표 샘플의 경로 이탈0·일시정지·목표 고정·회피·접촉 피해14·터치 공격·동물 정화·XP6/금화3 한번·체크포인트 안전 대기/회복 재개·정화 적 재등장0·G07·indiaArrival·S27 진행 통과. 옛 보상3개 저장1조건은 새2마리만 생성·보상 보존·전투 생략 출구 통과. 기존 폰 모바일 보물/다리1조건과 S08 정상 폰/시트 누락 태블릿2조건도 통과했다. 명시적 저장/장비 픽스처이며 새 게임 전체 완주로 취급하지 않는다.
- 실제 결과는 `docs/validation/s26-bats-e2e-final.json`, `s26-bats-e2e-final-output.txt`, `s26-bats-final-report/`. 최종 화면33장은 `docs/screenshots/s26-bats/final/`: 신규17장은 `s26-bats/`, 기존 S08 16장은 `m6-bat/`. 대표 `s26-bats/phone-warning.png`, `phone-released.png`, `tablet-safe-checkpoint.png`, `tablet-resume.png`, `tablet-golden-heart.png`, `legacy-rewards.png`. 모든 PNG 크기·바이트·SHA는 `s26-bats-final-screenshots.json`, 화면별 실제 관측은 같은 이름의 JSON에 보존했다.
- 개발 중 첫 E2E 2통과·1실패: 폰 검사에서 고정 왼쪽 지점으로 도망치다가 실제 고정 예고 원을 가로질러 피해를 받았다. 위로 바로 피하도록 **검사만** 보완. 두 번째도2통과·1실패: 폰은 통과했고 태블릿은 관측 JSON 재쓰기의 Windows 파일 접근 오류로 실패하여 화면별 새 JSON 파일로 보완했다. 게임 타이밍/판정 변경 없이 최종6조건 통과. 실패 PNG/문맥·검사 소스·원래 로그/JSON은 그대로 보존했으며 `s26-bats-development.json`에 연결했다.
- 검증 전후 실제1008파일 SHA256 일치(`s26-bats-final-runtime-hashes.json`), 이전 S09 작업을 포함한 범위 외 코드/자산 변경 없음. 고정 용량 보고서는 이번 실행본 `s26-bats-art-budget.json`을 보존하고 기존 바이트로 복구했다. 전체 인터페이스 netstat 5174/5175/9323 LISTENING 없음. 최종 diff 결과는 `s26-bats-final-diff-check.txt`, 종합 기록은 `s26-bats-finish.json`.

**남은 문제/미검증:** S26 전체를 설계 완료로 처리하지 않는다. 현재 기존 수영 맵이며, 뗏목 준비/탑승·낮은 천장·갈림길·G07 수중 옆동굴의 독립 지형은 미구현이다. S08 박쥐 제한 비행과 S32 저주 구체4개도 기존 미완료. 이번 변경 후 전체87개 E2E·새 게임36구간 재완주는 미검증(변경 범위6조건으로 회귀). 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·스피커·최종 아트 승인은 미검증(Windows Edge 자동 입력과 터치 버튼 검증).

**다음 한 작업:** S26 뗏목 준비·낮은 천장·두 물길 장치를 실제 지형에 연결하고 G07 옆동굴의 안전한 복귀 동선을 구현·검증한다.
<!-- S26_BATS_STATUS_END -->
'''
status=root/'PROJECT_STATUS.md';text=status.read_text(encoding='utf-8');assert 'S26_BATS_STATUS_START' not in text
status.write_bytes(text.replace('# PROJECT_STATUS.md\n','# PROJECT_STATUS.md\n\n'+entry,1).encode('utf-8'))
for name in ('ART_PROMPTS.md','ASSET_REGISTER.md'):
    p=root/'docs'/name;text=p.read_text(encoding='utf-8');head,tail=text.split('\n',1)
    note='\n\n## 2026-10-08 · S26 박쥐 연결 · ART_DRAFT\n\n기존 `art-source/webtoon/bat-actions.{png,webp,json}`와 `public/assets/webtoon/bat-actions.webp`를 S26 박쥐5마리에 추가 연결했다. 네 행동 셀·측정 몸통 좌표와 누락 시 기존 자체 bat.svg를 재사용한다. 이미지 생성 도구/프롬프트 실행/원본 수정 없음. S08 4마리의 기존 연결과 소스·런타임 미디어639파일 바이트 보존. 기존 이용 조건과 ART_DRAFT 유지. 실제 정상/누락 화면은 `docs/screenshots/s26-bats/final/s26-bats/`, 검사 결과와 잔여 설계 차이는 PROJECT_STATUS.md의 2026-10-08 기록 참조.\n\n'
    p.write_bytes((head+note+tail).encode('utf-8'))
p=root/'docs/PLAYTEST_LOG.md';text=p.read_text(encoding='utf-8');head,tail=text.split('\n',1)
p.write_bytes((head+f'\n\n## 2026-10-08 · S26 제한 비행 박쥐5마리\n\n선택 E2E6/6통과({minutes}분): 신규 폰 정상/태블릿 누락·연출 줄이기2조건, 옛 보상 저장1조건, 기존 S26 모바일 능력1조건, S08 정상 폰/누락 태블릿2조건. 순찰 경계·목표 고정·회피·피해14·터치 정화·보상 한번·체크포인트 재개·G07·S27를 확인했다. 단위125개 및 타입·린트·콘텐츠·빌드·용량 통과. 33화면은 `docs/screenshots/s26-bats/final/`, 실제 실패2회와 검사 보완은 `docs/validation/s26-bats-development.json`. 전체87개/새 게임36구간·실기기·어린이·성능은 미검증. 기존 수영 맵의 뗏목/천장/옆동굴 지형은 별도 미완료. ART_DRAFT·로컬 변경·배포 없음.\n\n'+tail).encode('utf-8'))
print(json.dumps({'e2ePass':6,'screenshots':len(inventory),'mediaPreserved':len(media),'budget':budget['totalBytes'],'done':True}))
