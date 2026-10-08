from pathlib import Path
from datetime import datetime,timezone
from hashlib import sha256
import json,shutil
from PIL import Image

root=Path.cwd();folder=root/'docs/validation';screens=root/'docs/screenshots/s09-mechanics/release2-final'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
dump=lambda p,d:p.write_bytes((json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
checks=load(folder/'s09-mechanics-release3-checks.json');assert len(checks)==7 and all(r['exitCode']==0 for r in checks)
stats=load(folder/'s09-mechanics-e2e-release2-final.json')['stats'];assert stats['expected']==11 and stats['unexpected']==1 and stats['skipped']==0 and stats['flaky']==0,stats
repair=load(folder/'s09-mechanics-regression-repair.json')['stats'];assert repair['expected']==1 and repair['unexpected']==0 and repair['skipped']==0 and repair['flaky']==0,repair
freeze=load(folder/'s09-mechanics-release2-final-runtime-hashes.json');assert freeze['unchanged'] and freeze['files']==1001
repairFreeze=load(folder/'s09-mechanics-regression-repair-runtime-hashes.json');assert repairFreeze['unchanged'] and repairFreeze['files']==1001
assert load(folder/'s09-mechanics-repair-code-diff.json')['changes']==['tests/e2e/m3-opening.spec.ts']
preserve=load(folder/'s09-mechanics-release2-final-preservation.json');assert preserve['unexpectedChanges']==[]
journey=load(folder/'complete-journey.json');assert len(journey['stages'])==36 and journey['errors']==[]
budget=load(folder/'art-budget.json');assert budget['pass']

journeyScreens=screens/'journey';journeyScreens.mkdir(exist_ok=True)
nativeJourney=list((root/'docs/screenshots/s09-mechanics/primary-test-results').glob('complete-journey-*/*.png'));assert len(nativeJourney)==7,len(nativeJourney)
for p in nativeJourney:
    dest=journeyScreens/p.name;assert not dest.exists(),dest;shutil.copy2(p,dest)
inventory=[]
for p in sorted(screens.rglob('*.png')):
    with Image.open(p) as image:size=list(image.size);image.verify()
    inventory.append({'path':p.relative_to(root).as_posix(),'size':size,'bytes':p.stat().st_size,'sha256':sha256(p.read_bytes()).hexdigest()})
dump(folder/'s09-mechanics-final-screenshots.json',inventory)

archive=folder/'s09-mechanics-regression-reports';archive.mkdir(exist_ok=True);reports=[]
for old in (folder/'s09-mechanics-before/validation-reports').glob('*.json'):
    if old.name not in {'illustrations.json','art-budget.json','complete-journey.json'}:continue
    current=folder/old.name
    if current.read_bytes()!=old.read_bytes():
        dest=archive/old.name;assert not dest.exists(),dest;shutil.copy2(current,dest)
        reports.append({'currentRun':dest.relative_to(root).as_posix(),'sha256':sha256(dest.read_bytes()).hexdigest(),'restored':current.relative_to(root).as_posix()})
        current.write_bytes(old.read_bytes())
dump(folder/'s09-mechanics-regression-reports.json',reports)

minutes=round(stats['duration']/60000,1);repairMinutes=round(repair['duration']/60000,1);journeySeconds=journey['stages'][-1]['elapsedSeconds'];count=len(inventory)
entry=f'''<!-- S09_MECHANICS_STATUS_START -->
## 최신 실제 상태 · 2026-10-08 · S09 저주 핵·3패턴 / T03 활공

**기능 구현 / 선택 회귀12조건 11통과·1실패, 해당 검사 보완 후 재통과 / 단위121개 통과 / ART_DRAFT.** S09의 일반 HP보스·봉인 채널을 로크새1마리의 목걸이 핵3회 타격으로 바꿨다. 부리 찍기·날개 바람·표시 지점 급강하가 순서대로 나오고 착지 빈틈에 T02가 핵을 드러낸다. 한 착지에 한 핵만 깨지며 무기 피해량·불꽃 지속 피해로 세 핵을 한꺼번에 없앨 수 없다. T03 없이 기본 무기로 승리할 수 있다.

- 기존 `S09.enemy.3`, `S09.quest.1~3`, 보물·출구·체크포인트 ID를 유지한다. 첫 두 핵은 전용 증명 ID로 저장하고 마지막 핵·보스 XP6/금화3·안전 체크포인트를 한 번에 저장한다. 옛 봉인만 완료한 저장은 새 핵 타격으로 계산하지 않는다. 퇴역한 두 적의 저장 ID는 명시적으로 허용하며, 옛 보스 선행 승리는 핵 완료 조건만 복구해 보물 앞 막힘을 방지한다. 추가 XP/금화/T03 자동 지급 없음.
- T03 보유 후 지상 공중에서 ↑/K 또는 터치 점프 유지 시 낙하 상한180px/s. 상승·수중·지정 비행에 적용하지 않으며 버튼 해제·터치 취소 시 정상 낙하로 돌아온다. 이단 점프·착지 리셋·42×84 신체 판정 유지. 새 아트 생성/기존 이미지 수정 없음; 기존 `roc-actions`와 `hero-action`을 재사용하고 핵/예고는 런타임 도형이다.
- 실제 정적7명령 통과: 타입→린트→단위121개/26파일→콘텐츠→빌드50모듈→아트 감사178파일→용량 {budget['totalBytes']:,}/8,000,000B. 기존 Phaser500KB 청크 경고 유지. `docs/validation/s09-mechanics-release3-checks.json`, 해당7로그. 콘텐츠 통과는 등록/획득 그래프 검사이며 설계서 전체 일치 판정이 아니다.
- 실제 선택 E2E **12조건 11통과·1실패·exit1·{minutes}분**, skipped/flaky0: 새 게임36구간, 기존 로크새 폰/태블릿×정상/시트 누락4조건, 신규 S09전투·활공 폰/태블릿·부분 핵 사망/재개·수정구슬 없음/옛 승리4조건, 기존 단순 조작·모바일 보물 통과. S09~S12 연속 검사는 장면 로딩 완료 전에 전투를 시작해 실패했다. 해당 검사에 실제 플레이어/보스 준비 대기만 추가한 뒤 **1조건 재검사 통과·exit0·{repairMinutes}분**. 게임·자산·빌드는 그대로다. `npm run test:e2e --` 뒤6검사 파일, 재검사는 `tests/e2e/m3-opening.spec.ts`만 지정했다. 보완 후 전체12조건 및 전체81개 E2E 재실행은 **미검증**: 변경 범위의 선택 검사와 새 게임 전체 항로를 검증했다. `s09-mechanics-e2e-release2-final.json`, `s09-mechanics-e2e-release2-final-output.txt`, `s09-mechanics-release2-final-report/`, `s09-mechanics-regression-repair.json`, `s09-mechanics-regression-repair-output.txt`에 실제 결과를 보존한다. 보완 후 타입/린트도 통과했다.
- 저장 주입 없는 새 게임36구간 정상 키 입력 완주({journeySeconds}초), 보물/무기 각7·엔딩·S16/S32뒤 새로고침·S01재방문·오류[] 확인. 별도의 S09 조건은 명시적 단계/장비 픽스처이며 실기기 검증이 아니다. 완주 결과는 `s09-mechanics-regression-reports/complete-journey.json`이다.
- 최종 **{count}스크린샷**: `docs/screenshots/s09-mechanics/release2-final/`. 대표 `s09-mechanics/phone-core-open.png`, `phone-glide-held.png`, `tablet-glide-release.png`, `save-retry-death-checkpoint.png`, `guards-legacy-alliance.png`; 기존 아트4조건은 `m6-roc/`, 캠페인7장은 `journey/`. 실측 크기·바이트·SHA는 `s09-mechanics-final-screenshots.json`이다. 화면과 관측 JSON을 함께 기록했으며 짧은 상태의 PNG와 관측 시각이 다를 수 있다.
- 개발 중 실제 실패도 보존했다. 날개 바람의 너무 이른 피해와 저장 ID 미등록은 런타임을 수정했다. 하트 XP를 포함한 기대값·대화가 열리기 전 확인·갱신 시각 비교는 검사를 보완했다. 옛 보스 선행 승리 막힘을 정적 검토에서 발견해 첫 완주 실행을 S11에서 중단하고 보완 후 다시 검증했다. 원래 로그/실패 PNG/문맥/검사 소스와 `s09-mechanics-development.json` 참조. 마지막 M3 실패 화면/문맥은 `docs/screenshots/s09-mechanics/primary-test-results/m3-opening-S09-S12-continu-2fe28-d-R03-with-save-safe-bosses/`, 보완 전 소스는 `s09-mechanics-before-m3-repair.test.ts.txt`에 보존했다. 중단본을 전체 통과로 취급하지 않는다.
- 기본 실행 및 검사 보완 실행 각각 전후1001파일 SHA256 일치; 두 실행 사이에는 `tests/e2e/m3-opening.spec.ts`만 바뀌었다. 이전 자산638개·의존성/lockfile 보존. 범위 외 코드 변경 없음. 기존 고정 보고서의 이번 실행본은 별도 폴더에 보존하고 원본 바이트를 복구했다. `s09-mechanics-release2-final-runtime-hashes.json`, `s09-mechanics-regression-repair-runtime-hashes.json`, `s09-mechanics-repair-code-diff.json`, `s09-mechanics-regression-repair-preservation.json`, `s09-mechanics-regression-reports.json`. 서버 종료·최종 diff 결과는 별도 마무리 기록을 참조한다.

**남은 문제/미검증:** S09 승리 후 둥지 위 선택 보석과 별도 연습 동선은 미구현. S26동굴 박쥐5마리/S32저주 구체4개/박쥐 제한 비행 경로도 기존 미완료다. 실기기 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·스피커·최종 아트 승인 미검증(Windows Edge 자동 입력/터치 이벤트 검증). 로크새 보석 색 연속성 및 전용 활공 자세는 ART_DRAFT 검수 대상이다. 이번 작업 커밋·푸시·배포 없음.

**다음 한 작업:** S09 승리 후 T03를 쓰는 둥지 상단 선택 보석과 안전한 이단 점프·활공 연습 동선 구현 및 저장/재방문 검증.
<!-- S09_MECHANICS_STATUS_END -->
'''
status=root/'PROJECT_STATUS.md';text=status.read_text(encoding='utf-8');assert 'S09_MECHANICS_STATUS_START' not in text
status.write_bytes(text.replace('# PROJECT_STATUS.md\n','# PROJECT_STATUS.md\n\n'+entry,1).encode('utf-8'))
play=root/'docs/PLAYTEST_LOG.md';text=play.read_text(encoding='utf-8');head,tail=text.split('\n',1)
play.write_bytes((head+'\n\n## 2026-10-08 · S09 핵3회·3패턴 / T03 활공\n\n'+
    f'선택 E2E12조건 11통과·1실패({minutes}분). S09~S12 검사 시작 시 실제 플레이어/보스 준비 대기가 빠져 실패했고, 검사만 보완 후 해당1조건 재통과({repairMinutes}분). 게임·자산·빌드는 변경하지 않았다. 새 게임36구간 정상 입력 완주({journeySeconds}초), 단계 픽스처의 실제 전투/회피/핵 저장·사망 재개·옛 승리·점프 유지/해제·태블릿 CDP터치 취소를 구분해 검증했다. 단위121개와 타입/린트/콘텐츠/빌드/아트 감사/용량 통과. 보완 후 타입/린트 통과. 보완 후 전체12조건 및 전체81개 E2E·실기기/어린이/성능은 미검증.\n\n'+
    f'실제 화면{count}장은 `docs/screenshots/s09-mechanics/release2-final/`, 전체 경로/크기/SHA는 `docs/validation/s09-mechanics-final-screenshots.json`. 실패/중단과 수정 내역은 `s09-mechanics-development.json` 및 원본 로그/화면에 보존했다. ART_DRAFT 유지, 배포 없음.\n\n'+tail).encode('utf-8'))
for name in ('ART_PROMPTS.md','ASSET_REGISTER.md'):
    path=root/'docs'/name;text=path.read_text(encoding='utf-8');head,tail=text.split('\n',1)
    note='\n\n## 2026-10-08 · S09 기능 연결 갱신 · ART_DRAFT\n\n기존 `roc-actions` 6셀과 `hero-action`을 재사용했다. 이번 작업은 새 이미지 생성/프롬프트 실행/원본 수정 없이 S09 목걸이 핵3회·3공격 패턴과 T03 점프 유지 활공을 연결한 것이다. 핵 표시와 공격 예고는 런타임 도형이며, 전용 활공 자세와 로크새 보석 색 연속성은 최종 아트 검수 대상으로 남는다. 실제 소스·런타임 자산638개 SHA 보존 확인 및 검사 결과는 `PROJECT_STATUS.md`의 2026-10-08기록을 따른다.\n\n'
    path.write_bytes((head+note+tail).encode('utf-8'))
dump(folder/'s09-mechanics-finish.json',{'date':datetime.now(timezone.utc).isoformat(),'primaryE2e':stats,'repairE2e':repair,'screenshots':count,'restoredReports':len(reports),'budget':budget['totalBytes'],'artStatus':'ART_DRAFT','commitPushDeploy':False})
print(json.dumps({'primaryPass':11,'primaryFail':1,'repairPass':1,'screenshots':count,'restoredReports':len(reports),'done':True}))
