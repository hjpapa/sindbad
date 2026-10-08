# -*- coding: utf-8 -*-
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2];V=ROOT/'docs/validation'
def read(name):return json.loads((V/name).read_text(encoding='utf-8'))
full=read('m6-spirit-e2e-final.json');post=read('m6-spirit-postcheck.json');target=read('m6-spirit-recheck2.json')
assert full['stats']['unexpected']==4 and full['stats']['expected']==69 and full['stats']['skipped']==0 and full['stats']['flaky']==0
repair=read('m6-spirit-regression-repair-summary.json');repairStats=repair['targeted']['stats']
assert repairStats['expected']==5 and repairStats['unexpected']==0 and repair['changesAfterFull']==['tests/e2e/m2.spec.ts','tests/e2e/siren-actions.spec.ts']
repairDuration=repairStats['duration']/60000
assert target['stats']['expected']==1 and target['stats']['unexpected']==0
assert read('m6-spirit-recheck.json')['stats']['expected']==3
frozen=read('m6-spirit-final-runtime-hashes.json');assert frozen['unchanged']
checks=read('m6-spirit-release-checks.json');assert len(checks)==8 and all(c['exitCode']==0 for c in checks)
mobile=read('m6-spirit-mobile-final.json');assert all(not d['errors'] for d in mobile.values())
journey=read('m6-spirit-complete-journey.json');duration=full['stats']['duration']/60000;targetDuration=target['stats']['duration']/60000
preservation=read('m6-spirit-preservation.json');reports=read('m6-spirit-regression-reports.json');shots=read('m6-spirit-final-screenshots.json')
block=f'''<!-- M6_SPIRIT_STATUS_START -->
## 최신 실제 상태 · 2026-10-06 · M6 정령 행동4프레임

**구현·정령4조건 검증 완료 / 전체73개 E2E 69통과·4실패({duration:.1f}분), 테스트 보완 뒤 관련5개 재검사 통과 / ART_DRAFT.** 내장 imagegen 후보1의 공격 효과가 중앙 세로 셀 경계 x626/627을 넘어 반려하고 원본/전체 프롬프트/도구 경로/SHA를 보존했다. 더 작고 효과를 제한한 후보2의1254×1254 RGBA/2×2 전체627px 셀을512px로 균일 축소·4×1 재배열해2048×512 PNG + 동일RGBA 무손실 WebP259,304B를 만들었다. SIZES/runtimeSize 등록→최적화 런타임1024×256/4셀256px WebP34,476B. 외곽/중앙alpha>16 비어 있음·글자/상처/피 없음·안전한 빛/연기 마무리 확인. 원본 삭제 없음.

512px baseline453/441/375/392·불투명 중심(314,355)/(265,334)/(301,288)/(268,284)·대기 높이313을 JSON으로 실측 기록하고 게임 JSON으로 바이트 동일 복사했다. 좌우 원점도 반전한다. 대기 가시 높이약116px·기존 타깃96×128·바닥 경고64·위치/HP/타이밍/접촉 피해/보상/저장ID·S06기존0xffaa65색조 유지. 꼬리는 공중 정령이므로 바닥에 강제 고정하지 않는다. S03 3·S06 5·S07 4·S32 3=실제15마리에 연결, 누락은 기존 자체 SVG 복구. 마법 적의 프레임3·“빛으로 돌아갔어요”·기존300ms 유지 뒤520ms 소멸(연출 줄이기0ms)을 쓴다.

- **정적8명령 순서 통과:** 최적화→이미지 감사→typecheck→lint→단위115개/24파일→validate:content→build→용량. `docs/validation/m6-spirit-release-checks.json`, `m6-spirit-release-check-{{1..8}}.txt`. 실제 원화88+런타임88=176파일·정령 네이티브/무손실RGBA/경계/실측JSON 감사 통과. 기존 지형·무기·효과·아이콘·소품도 감사했다.
- **콘텐츠 검사36스테이지·아이장면24·7무기/보물·8하트 통과는 등록/획득 그래프 검사이며 전체 설계 일치 판정이 아니다.** S32설계 잔여 저주구체4개/실제정령3마리, S26설계박쥐5마리/현재산적3마리, 박쥐의 제한 비행 경로는 별도 미구현. 이번 작업에서 개수/AI를 바꾸지 않았다.
- **빌드46모듈 통과:** JS220.06KB/CSS16.93KB/Phaser1,481.77KB, 기존500KB청크 경고 유지. 첫 화면{post['budgetBytes']:,}/8,000,000B 통과. HTTP/실기기 성능 검사로 취급하지 않는다.
- **정령 전용 검사 두 번째 실행3통과·1실패, 해당1조건 보완 재실행통과/exit0/{targetDuration:.1f}분.** 이어진 아래 전체73개 실행에서 새4조건도 전부 통과했다. 폰844×390/태블릿1180×820×원화/의도적 시트 누락, 각 조건에서S03/S06/S07/S32를 검사했다.15마리 텍스처/초기좌표 계약·대기/예고/공격/회복/빛 마무리·좌우 중심·일시정지·실제 터치 공격·XP6/금화3한 번 지급·새로고침/재등장추가0·S06진정적 재등장 생략/1마리 진정만으로T01조기지급 안 됨·S07첫 파도/보호/보물·설정된쉼터x/착지 재개·S01캐시 해제를 확인했다. 명시적 stage/레벨/아이템 픽스처이며 새게임 완주와 구별한다. 태블릿 연출 줄이기, S03 HP관측은 기존 번개도 포함하여 접촉 피해만의 측정으로 취급하지 않는다. `m6-spirit-recheck.json`, `m6-spirit-recheck2.json`과 각각의raw출력. 최종128화면은 `docs/screenshots/m6-spirit/final/m6-spirit/`.
- **최초 추가검사4실패 후 테스트만 보완.** 3개는 S06덩굴 근처의 ‘살펴보기’를 공격으로 가정한 오류,1개는 S03기존 무적/번개가 겹칠 수 있는데 첫 회복 때 피해를 고정 기대한 오류였다. 실제 공격버튼 상태를 기다려 터치하고, 필요하면 후속 실제 공격 주기의HP변화를 관측하도록 바꿨다. 최초소스·raw로그/JSON·실패9파일/해시는 `m6-spirit-first-test.ts.txt`, `m6-spirit-target*`, `docs/screenshots/m6-spirit/first-target-failure/`에 보존했다. `m6-spirit-development.json`. 전투/입력/피해/저장 규칙을 이 보완 때문에 바꾸지 않았다.
- 두 번째1실패는 태블릿S32에서 주인공이 접근 중인 정령을 관성으로 조금 지나쳐 오른쪽을 보는데 테스트가 왼쪽을 고정 기대한 문제였다. 접근 뒤 실제 정령x를 다시 읽고 두 번째 이동으로 간격을 맞춰 보완했다. 기존게임좌표/속도/AI/반전규칙은 유지했다. 두 번째소스와 실패3파일/해시는 `m6-spirit-second-test.ts.txt`, `docs/screenshots/m6-spirit/second-target-failure/`에 보존했다. 세 번째소스는 `m6-spirit-third-test.ts.txt`다. 별도3통과+보완1통과를 단일4통과로 기록하지 않는다.
- **CDP 실제 터치 스모크 exit0**, 정적 최종 검사 뒤 dev서버에서 다시 실행했다. 폰/태블릿 이동{mobile['phone']['walkRight']:+}px/{mobile['tablet']['walkRight']:+}px·밀기 반전·첫해골처치·선장대화·오류[]; 동시 이동/점프는 폰dx{mobile['phone']['runJump']['dx']}/dy{mobile['phone']['runJump']['dy']}, 태블릿dx{mobile['tablet']['runJump']['dx']}/dy{mobile['tablet']['runJump']['dy']}px다. 가로0이면 그 조건은 판정 보류하며 점프 성공만 기록한다. `m6-spirit-mobile-final.json`, `m6-spirit-mobile-final-output.txt`,6화면 `docs/screenshots/m6-spirit/mobile-final/`. 초기실행은 `m6-spirit-mobile.json`/`mobile/`에 별도 보존했다. 뷰포트/실제 CDP터치이며 실기기 결과로 취급하지 않는다.
- **전체73개 단일 E2E 실행 69통과·4실패/exit1/{duration:.1f}분**, flaky/skipped각0. 신규 정령4조건은 모두 통과했다. 산호 수호자1개는 회복 중 공격을 방패 차단으로 고정 기대해HP32→20으로 실패했고, 세이렌 폰정상/폰누락/태블릿정상3개는 촬영 후 이미 사라진 음파를 읽어1개 대신0개를 관측했다. 태블릿누락은 통과. 실제 실패로그/수정전테스트/화면4장·문맥4파일은 `m6-spirit-full-regression-failures.json`, `m6-spirit-full-before-{{m2,siren-actions}}.ts.txt`, `docs/screenshots/m6-spirit/full-regression-failures/`에 보존했다. 전체결과 `m6-spirit-e2e-final.json`, `m6-spirit-e2e-final-output.txt`, `m6-spirit-final-report/index.html`.
- **테스트2파일만 보완 후 관련5개 재검사 통과/exit0/{repairDuration:.1f}분**, flaky/skipped0. 수호자는 실제 정면/착지와 새 예고를 기다려 방패 차단·뒤이은 회복 피해를 검증한다. 세이렌은 읽기 전용 동일 시뮬레이션 스냅샷에서 적 상태와 짧게 살아 있는 투사체를 함께 관측하고 촬영한다. 파동1개/속도−230·음표3개/속도−190와vy−140/−55/35, 보상/무기/새로고침/누락복구 조건 유지. 산호 관문 보물 차단도 유지. 게임규칙·HP·시간·판정 변경 없음. 전체실행과 재검사 사이984파일 중 E2E2개만 변경, 나머지982개(실제게임/빌드/원화/런타임 포함)동일; 재검사 전후984개 동일. `m6-spirit-regression-repair-summary.json`, `m6-spirit-regression-repair.json`, `m6-spirit-regression-repair-output.txt`, 별도34화면/SHA `m6-spirit-regression-repair-screenshots.json`, `docs/screenshots/m6-spirit/regression-repair/`. 타입/린트/단위115개 추가 재검사도통과(`m6-spirit-repair-checks.json`). **보완 후 전체73개 단일 실행은 재실행하지 않았으며 전체73통과라고 기록하지 않는다.**
- **저장 주입 없는 새게임36스테이지 정상키입력 완주{journey['stages'][-1]['elapsedSeconds']}초.** 무기/보물각7·엔딩·S01재방문·S16/S32완료 뒤 새로고침 보상ID 유지·오류[] 확인(`m6-spirit-complete-journey.json`). 자동 시간을 어린이 플레이 시간으로 취급하지 않는다.
- **보존/실행 일치:** 전체실행 전후 실제 소스/런타임/빌드/원화/스크립트/테스트{frozen['files']}파일 모두동일. 백업{preservation['backups']}개·기존미디어{preservation['unchangedMedia']}개·기존src{preservation['unchangedOldSource']}개·네이티브후보2의 도구원본 일치 재확인. 고정이름 이번회귀 보고서{len(reports['reports'])}개는 `m6-spirit-regression-reports/`에 바이트 동일 보존하고 이전보고서 원본을 복구했다. `m6-spirit-final-runtime-hashes.json`, `m6-spirit-preservation.json`, `m6-spirit-postcheck.json`. 원본 삭제 없음.

**실제 화면:** 주요{shots['count']}장은 `docs/screenshots/m6-spirit/final/m6-spirit/`에 있다. 정령128장(2뷰포트×2모드×4맵×8상태/맥락), 터치6장, 캠페인7장. 예: `phone-normal-S06-telegraph.png`, `tablet-normal-S32-defeated.png`, `phone-fallback-S07-resume.png`. 빛 마무리 캡처에는 주인공/무기/기존정화 효과가 일부 겹치므로 JSON프레임3관측과 보존 원화도 함께 확인했다. 실제크기/SHA/복사 일치는 `m6-spirit-final-screenshots.json`.

**미검증:** 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·실제스피커믹스·최종사용자아트승인. Windows Edge 뷰포트/실제CDP터치만 가능했다. 동시 이동·점프의 가로0조건은 판정 보류. **ART_DRAFT 유지**, 로컬작업으로 이번 커밋/푸시/배포 없음. 자체서버 종료/TCP확인 및 최종diff 검사는 `m6-spirit-stopped-servers.json`, `m6-spirit-final-diff-check.txt`다.

**다음 한 작업:** M6 로크새 행동 프레임. 기존 원화/보스저주해제·비행날개공격을 기준으로 남은 자세를 제작하고 안정ID·봉인·T03·비행입력·저장·누락복구를 검증한다. S32/S26콘텐츠 불일치·박쥐비행경로·실기기검수는 별도 미완료다.
<!-- M6_SPIRIT_STATUS_END -->'''
path=ROOT/'PROJECT_STATUS.md';text=path.read_text(encoding='utf-8');start=text.index('<!-- M6_SPIRIT_STATUS_START -->');end=text.index('<!-- M6_SPIRIT_STATUS_END -->')+len('<!-- M6_SPIRIT_STATUS_END -->');path.write_bytes((text[:start]+block+text[end:]).encode('utf-8'))
section=f'''## M6 정령 실제 검증 · 2026-10-06 · ART_DRAFT

정적8명령·단위115개·정령4조건 통과. 전체73개 단일E2E({duration:.1f}분)는69통과·4실패(exit1). 수호자 공격시점과 세이렌 촬영후 투사체 관측 테스트2파일만 보완해 관련5개를 재검사하여 모두통과(exit0/{repairDuration:.1f}분)했다. 정확한 방패/회복 피해·투사체개수/속도·저장/보상 검증은 유지했다. 보완 후 전체73개 단일 실행은 재실행하지 않았다. 폰844×390/태블릿1180×820, Windows Edge headless의 실제 입력과CDP터치 사용. S03/S06/S07/S32실제15정령의 동작·반전·빛마무리·중복보상·S06재등장생략/보물조기차단·S07파도·쉼터재개·누락SVG복구 검증. stage/레벨/아이템 픽스처와 새게임36완주({journey['stages'][-1]['elapsedSeconds']}초)는 별도검사다. 전체실행 전후{frozen['files']}파일 해시동일, 이후 변경은 E2E2파일뿐이며982파일의 게임/빌드/아트동일; 재검사 전후984동일. 기존미디어570개·백업363개·이전보고서 보존 확인.

화면 `docs/screenshots/m6-spirit/final/m6-spirit/`{shots['count']}장, 결과 `docs/validation/m6-spirit-e2e-final.json`, `m6-spirit-recheck.json`, `m6-spirit-mobile-final.json`, `m6-spirit-final-screenshots.json`, `m6-spirit-postcheck.json`. 전체실패4화면은 `full-regression-failures/`, 보완재검사34화면은 `regression-repair/`, 상세는 `m6-spirit-regression-repair-summary.json`. 최초추가4실패와 테스트 보완/실패원본은 `m6-spirit-development.json`과 `first-target-failure/`에 기록했다. S03피해관측에는 번개가 포함된다. CDP폰 동시이동+점프의 가로0조건은 판정보류; 실제폰/태블릿·Safari·어린이조작성·장시간성능·스피커·최종아트승인은미검증. S32설계4구체/실제3정령, S26박쥐/제한비행콘텐츠도미완료. 배포없음, ART_DRAFT유지.

'''
path=ROOT/'docs/PLAYTEST_LOG.md';text=path.read_text(encoding='utf-8');title,rest=text.split('\n',1);assert '## M6 정령 실제 검증' not in text;path.write_bytes((title+'\n\n'+section+rest.lstrip('\n')).encode('utf-8'))
for name in ('ART_PROMPTS','ASSET_REGISTER'):
    path=ROOT/f'docs/{name}.md';text=path.read_text(encoding='utf-8');marker='## M6 정령 행동4프레임 · 2026-10-06 · ART_DRAFT\n';note=f'\n최종 실제 검증: 정적8명령·단위115개·정령4조건 통과. 전체73개 E2E({duration:.1f}분)는69통과·4실패, 테스트2파일 보완 후 관련5개 재검사통과. 전체73개 단일재실행은 하지 않음. 실제 주요{shots["count"]}화면/SHA는 `docs/validation/m6-spirit-final-screenshots.json`, 보완34화면/상세는 `m6-spirit-regression-repair-summary.json`, 상세범위/실패/미검증은 `PROJECT_STATUS.md`. 기능검증과 최종아트승인은 별도이며 ART_DRAFT 유지.\n';assert marker in text;path.write_bytes(text.replace(marker,marker+note,1).encode('utf-8'))
print(json.dumps({'full':full['stats'],'screenshots':shots['count'],'budget':post['budgetBytes']}))
