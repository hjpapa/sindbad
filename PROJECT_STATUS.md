# PROJECT_STATUS.md

<!-- S26_BATS_STATUS_START -->
## 최신 실제 상태 · 2026-10-08 · S26 박쥐5마리·제한 비행

**기능 구현·선택 E2E6조건 통과 / 단위125개 통과 / ART_DRAFT.** S26의 산적3명을 동굴 박쥐5마리로 연결했다. 기존 `S26.enemy.1~3` 보상·진행 ID를 유지하고 `.4/.5`만 추가했다. S09 둥지 작업을 포함한 기존 로컬 변경은 보존했다. 이번 작업 커밋·푸시·배포 없음.

- 각 박쥐는 원래 배치 중심 기준 가로±90px/세로±50px(가운데±40px), 4초 주기의 제한 경로를 비행한다. 플레이어를 2차원 거리170px 안에서 감지하면 현재 위치를 고정하고 1200ms 예고(편안함1.3배)→500ms 돌진 왕복→1100ms 빈틈. 예고 시 목표를 자기 구역 안으로 제한해 고정하고, 구역 밖까지 추적하지 않는다. 경고 원·이동 선과 기존 행동4셀/몸통 좌표를 사용한다. 불꽃·일반 무기 판정은 기존대로이며 이동 도형과 무관한 투사체는 만들지 않는다. 피격 밀치기로 경로를 벗어나지 않도록 이 비행 적에는 기존 수평 밀치기 트윈을 적용하지 않는다.
- 저주 해제 시 기존 동물 정화 연출과 XP6/금화3를 한 번 지급한다. 보상 ID가 저장된 박쥐는 재개 시 생성하지 않는다. 옛 산적 보상3개가 있는 저장은 이를 그대로 인정하여 남은 새2마리만 생성한다. 목표·아이템·스키마를 바꾸지 않았고, 적을 모두 정화하지 않아도 기존 물길 장치·G07·항구 플래그·S27 출구가 작동한다. 가운데 박쥐는 y320~400에서만 움직여 x1560의 체크포인트 바닥(y546)을 공격하지 못한다.
- S08 기존 박쥐4마리의 배치/HP/AI·안전 퍼즐 구간은 유지했다. 새 경로는 `flightPath`가 있는 S26에만 적용한다. 새 아트 생성/원본 수정 없음; 기존 `bat-actions`와 시트 누락 시 자체 SVG 복구를 재사용했다. 기존 소스·런타임 미디어639파일 및 의존성/lockfile SHA 보존. 최종 웹툰 아트 승인은 ART_DRAFT.
- 최종 정적6명령 순서 **타입→린트→단위125개/28파일→콘텐츠36구간·24장면·7무기/보물·8하트→빌드51모듈→용량 3,095,942/8,000,000B 모두 exit0**. `docs/validation/s26-bats-final-checks.json`, 6로그. 마지막 검사 파일의 증거 저장 방식 보완 후 타입/린트도 재통과(`s26-bats-final-typecheck.txt`, `s26-bats-final-lint.txt`). 기존 Phaser500KB청크 경고 유지. 콘텐츠 통과는 등록·획득·도달성 그래프 검사이며 설계서 전체 일치 판정이 아니다.
- 최종 E2E **6/6통과·exit0·3.1분**, skipped/flaky0. `npm run test:e2e -- tests/e2e/s26-bats.spec.ts tests/e2e/mobile-abilities.spec.ts tests/e2e/bat-actions.spec.ts --grep 'S26|phone bat four actions|tablet bat missing-sheet' --reporter=list,json,html`. 신규 S26 폰 정상/태블릿 시트 누락·연출 줄이기2조건: 실제 순찰 좌표 샘플의 경로 이탈0·일시정지·목표 고정·회피·접촉 피해14·터치 공격·동물 정화·XP6/금화3 한번·체크포인트 안전 대기/회복 재개·정화 적 재등장0·G07·indiaArrival·S27 진행 통과. 옛 보상3개 저장1조건은 새2마리만 생성·보상 보존·전투 생략 출구 통과. 기존 폰 모바일 보물/다리1조건과 S08 정상 폰/시트 누락 태블릿2조건도 통과했다. 명시적 저장/장비 픽스처이며 새 게임 전체 완주로 취급하지 않는다.
- 실제 결과는 `docs/validation/s26-bats-e2e-final.json`, `s26-bats-e2e-final-output.txt`, `s26-bats-final-report/`. 최종 화면33장은 `docs/screenshots/s26-bats/final/`: 신규17장은 `s26-bats/`, 기존 S08 16장은 `m6-bat/`. 대표 `s26-bats/phone-warning.png`, `phone-released.png`, `tablet-safe-checkpoint.png`, `tablet-resume.png`, `tablet-golden-heart.png`, `legacy-rewards.png`. 모든 PNG 크기·바이트·SHA는 `s26-bats-final-screenshots.json`, 화면별 실제 관측은 같은 이름의 JSON에 보존했다.
- 개발 중 첫 E2E 2통과·1실패: 폰 검사에서 고정 왼쪽 지점으로 도망치다가 실제 고정 예고 원을 가로질러 피해를 받았다. 위로 바로 피하도록 **검사만** 보완. 두 번째도2통과·1실패: 폰은 통과했고 태블릿은 관측 JSON 재쓰기의 Windows 파일 접근 오류로 실패하여 화면별 새 JSON 파일로 보완했다. 게임 타이밍/판정 변경 없이 최종6조건 통과. 실패 PNG/문맥·검사 소스·원래 로그/JSON은 그대로 보존했으며 `s26-bats-development.json`에 연결했다.
- 검증 전후 실제1008파일 SHA256 일치(`s26-bats-final-runtime-hashes.json`), 이전 S09 작업을 포함한 범위 외 코드/자산 변경 없음. 고정 용량 보고서는 이번 실행본 `s26-bats-art-budget.json`을 보존하고 기존 바이트로 복구했다. 전체 인터페이스 netstat 5174/5175/9323 LISTENING 없음. 최종 diff 결과는 `s26-bats-final-diff-check.txt`, 종합 기록은 `s26-bats-finish.json`.

**남은 문제/미검증:** S26 전체를 설계 완료로 처리하지 않는다. 현재 기존 수영 맵이며, 뗏목 준비/탑승·낮은 천장·갈림길·G07 수중 옆동굴의 독립 지형은 미구현이다. S08 박쥐 제한 비행과 S32 저주 구체4개도 기존 미완료. 이번 변경 후 전체87개 E2E·새 게임36구간 재완주는 미검증(변경 범위6조건으로 회귀). 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·스피커·최종 아트 승인은 미검증(Windows Edge 자동 입력과 터치 버튼 검증).

**다음 한 작업:** S26 뗏목 준비·낮은 천장·두 물길 장치를 실제 지형에 연결하고 G07 옆동굴의 안전한 복귀 동선을 구현·검증한다.
<!-- S26_BATS_STATUS_END -->

<!-- S09_NEST_STATUS_START -->
## 최신 실제 상태 · 2026-10-08 · S09 둥지 선택 보석·깃털 연습

**기능 구현·선택 E2E8조건 통과 / 단위123개 통과 / ART_DRAFT.** 이전 누적 박쥐·정령·로크새 아트와 S09 핵·활공 작업을 `016093a`로 커밋하고 보조 스크립트 끝 공백 정리 `d12b0af`와 함께 `hjpapa/sindbad`의 `origin/main`에 푸시했다. 원격 SHA `d12b0af9f263efc96adca28217e9793ca24ddb1e`를 확인했다. 이후 아래 둥지 작업은 **로컬 변경이며 아직 커밋·푸시하지 않았다**. 공개 배포를 실행하거나 확인하지 않았다.

- S09 보물 위에 첫 발판(2440,416,180×24), 오른쪽 위 발판(2780,344,180×24)을 추가했다. 바닥에서 첫 발판까지192px는 기본 점프의 약136px 높이보다 높아 이단 점프가 필요하다. 발판 사이160px 간격에서 점프 유지 활공을 연습한다. 아래0~3000 연속 바닥과 기존 보스·보물·출구·체크포인트 ID는 유지했다. 떨어지면 안전한 바닥으로 돌아오며, 보석 없이 S10 진행 가능.
- 첫 발판의 `S09.featherPractice`는 이단 점프·활공·해제·안전 복귀 안내 대화다. `S09.nestGem`은 동료 대화 완료 `S09.reward`와 T03를 모두 요구하는 선택 보석이며 금화25를 기존 원자적 보상으로 한 번 지급한다. `S09.nestGem.reward`가 자동 저장 화이트리스트에 등록되며, 저장/재방문/재상호작용 시 추가0이다. 새 스키마·필수 아이템·필수 관문은 없다.
- 도달성 검사는 T03 표시가 있는 선택 발판만 이단 점프의 보수적 높이210px/간격260px로 검사한다. T03를 주는 보상과 필수 상호작용은 기본 점프 경로로 따로 검사해, 새 능력을 받기 전 위 발판을 강요하는 오류를 거부한다. 모든36구간의 기존 도달성 검사도 통과했다. 태그는 정적 도달성 조건이며 런타임의 실제 이단 점프는 기존 T03 보유 검사로 제한한다.
- 초기 3조건 E2E 통과 뒤 화면 검수에서 보석으로 재사용한 별 장치가 나침반처럼 보여, 자체 도형 SVG `public/assets/draft/nestGem.svg`(96×128, 투명)를 작성해 등록했다. 새 최종 웹툰 아트로 취급하지 않는다. 그림 생성 도구 실행 없음; 기존 원화·런타임638파일 바이트 보존. 보석은 최종 웹툰 교체 미완료다.
- 최종 정적 순서 **타입→린트→단위123개/27파일→콘텐츠36구간/24장면/7무기·7보물/8하트→빌드50모듈→용량 3,093,349/8,000,000B 모두 exit0**. `docs/validation/s09-nest-final-checks.json`과 6로그. 기존 Phaser500KB청크 경고 유지. 최초 일반 샌드박스 빌드는 Vite realpath EPERM으로 실패했으며 `s09-nest-build.txt`에 보존; 승인된 호스트 실행과 최종 빌드는 통과했다. 콘텐츠 통과는 등록·획득·도달성 그래프 검사이지 설계서 전체 일치 판정이 아니다.
- 최종 `npm run test:e2e -- tests/e2e/nest-practice.spec.ts tests/e2e/roc-mechanics.spec.ts tests/e2e/m3-opening.spec.ts --reporter=list,json,html` **8/8통과·exit0·6.4분**, skipped/flaky0. 신규 폰/태블릿 2조건은 실제 로크새 핵3회와 T03 대화 이후 이단 점프·첫 발판 착지·안내 대화·활공·보석25·새로고침·정상 재등반·중복0·안전 복귀를 확인했다. 태블릿은 CDP touchStart/touchCancel로 점프 유지/해제. 별도1조건은 보석을 건너뛴 S10 진입. 기존 S09 전투/활공/사망 재개/옛 저장4조건과 S09~S12 연속1조건도 통과. 모든 조건은 명시적 S09 저장 픽스처이며 새 게임 전체 완주로 취급하지 않는다.
- `docs/validation/s09-nest-e2e-final.json`, `s09-nest-e2e-final-output.txt`, `s09-nest-e2e-final-report/`에 실제 결과를 보존. 최종 화면44장은 `docs/screenshots/s09-nest/final/`(신규16 + 기존 회귀28); 대표 `s09-nest/phone-upper-nest.png`, `tablet-glide-crossing.png`, `phone-gem-collected.png`, `tablet-checkpoint-resume.png`, `tablet-safe-floor-return.png`. 크기·바이트·SHA는 `s09-nest-final-screenshots.json`. 첫 실행3통과/1.9분과 나침반 모양 교체 전16화면은 `s09-nest-e2e-first.json`, `docs/screenshots/s09-nest/first/`에 별도 보존했다.
- 검증 전후1005개 실제 소스·원본·런타임·빌드·검사 SHA256 일치(`s09-nest-final-runtime-hashes.json`). 의존성/lockfile과 이전 미디어638파일 보존. 고정 용량 보고서는 이번 실행본을 `s09-nest-art-budget.json`에 보존한 뒤 이전 바이트 복구. netstat 전체 인터페이스 5174/5175/9323 LISTENING 없음. 최종 diff·마무리 결과는 `s09-nest-final-diff-check.txt`, `s09-nest-finish.json` 참조.

**남은 문제/미검증:** 이번 변경 후 전체84개 E2E 및 새 게임36구간 재완주는 미검증(변경 범위의8조건으로 회귀; 이전 버전36구간 완주와 구별). 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·스피커는 미검증(Windows Edge 자동 키 입력/터치 이벤트). S26 동굴 박쥐5마리·제한 비행 경로와 S32 저주 구체4개 등 기존 설계 차이는 미완료. 새 보석 SVG와 기존 로크새 보석 색·전용 활공 자세 등 최종 아트 승인은 ART_DRAFT.

**다음 한 작업:** S26 동굴 적을 설계의 박쥐5마리로 연결하고 제한 비행 경로·기존 저장 호환성과 실제 플레이를 검증한다.
<!-- S09_NEST_STATUS_END -->

<!-- S09_MECHANICS_STATUS_START -->
## 최신 실제 상태 · 2026-10-08 · S09 저주 핵·3패턴 / T03 활공

**기능 구현 / 선택 회귀12조건 11통과·1실패, 해당 검사 보완 후 재통과 / 단위121개 통과 / ART_DRAFT.** S09의 일반 HP보스·봉인 채널을 로크새1마리의 목걸이 핵3회 타격으로 바꿨다. 부리 찍기·날개 바람·표시 지점 급강하가 순서대로 나오고 착지 빈틈에 T02가 핵을 드러낸다. 한 착지에 한 핵만 깨지며 무기 피해량·불꽃 지속 피해로 세 핵을 한꺼번에 없앨 수 없다. T03 없이 기본 무기로 승리할 수 있다.

- 기존 `S09.enemy.3`, `S09.quest.1~3`, 보물·출구·체크포인트 ID를 유지한다. 첫 두 핵은 전용 증명 ID로 저장하고 마지막 핵·보스 XP6/금화3·안전 체크포인트를 한 번에 저장한다. 옛 봉인만 완료한 저장은 새 핵 타격으로 계산하지 않는다. 퇴역한 두 적의 저장 ID는 명시적으로 허용하며, 옛 보스 선행 승리는 핵 완료 조건만 복구해 보물 앞 막힘을 방지한다. 추가 XP/금화/T03 자동 지급 없음.
- T03 보유 후 지상 공중에서 ↑/K 또는 터치 점프 유지 시 낙하 상한180px/s. 상승·수중·지정 비행에 적용하지 않으며 버튼 해제·터치 취소 시 정상 낙하로 돌아온다. 이단 점프·착지 리셋·42×84 신체 판정 유지. 새 아트 생성/기존 이미지 수정 없음; 기존 `roc-actions`와 `hero-action`을 재사용하고 핵/예고는 런타임 도형이다.
- 실제 정적7명령 통과: 타입→린트→단위121개/26파일→콘텐츠→빌드50모듈→아트 감사178파일→용량 3,091,479/8,000,000B. 기존 Phaser500KB 청크 경고 유지. `docs/validation/s09-mechanics-release3-checks.json`, 해당7로그. 콘텐츠 통과는 등록/획득 그래프 검사이며 설계서 전체 일치 판정이 아니다.
- 실제 선택 E2E **12조건 11통과·1실패·exit1·23.6분**, skipped/flaky0: 새 게임36구간, 기존 로크새 폰/태블릿×정상/시트 누락4조건, 신규 S09전투·활공 폰/태블릿·부분 핵 사망/재개·수정구슬 없음/옛 승리4조건, 기존 단순 조작·모바일 보물 통과. S09~S12 연속 검사는 장면 로딩 완료 전에 전투를 시작해 실패했다. 해당 검사에 실제 플레이어/보스 준비 대기만 추가한 뒤 **1조건 재검사 통과·exit0·1.5분**. 게임·자산·빌드는 그대로다. `npm run test:e2e --` 뒤6검사 파일, 재검사는 `tests/e2e/m3-opening.spec.ts`만 지정했다. 보완 후 전체12조건 및 전체81개 E2E 재실행은 **미검증**: 변경 범위의 선택 검사와 새 게임 전체 항로를 검증했다. `s09-mechanics-e2e-release2-final.json`, `s09-mechanics-e2e-release2-final-output.txt`, `s09-mechanics-release2-final-report/`, `s09-mechanics-regression-repair.json`, `s09-mechanics-regression-repair-output.txt`에 실제 결과를 보존한다. 보완 후 타입/린트도 통과했다.
- 저장 주입 없는 새 게임36구간 정상 키 입력 완주(807초), 보물/무기 각7·엔딩·S16/S32뒤 새로고침·S01재방문·오류[] 확인. 별도의 S09 조건은 명시적 단계/장비 픽스처이며 실기기 검증이 아니다. 완주 결과는 `s09-mechanics-regression-reports/complete-journey.json`이다.
- 최종 **102스크린샷**: `docs/screenshots/s09-mechanics/release2-final/`. 대표 `s09-mechanics/phone-core-open.png`, `phone-glide-held.png`, `tablet-glide-release.png`, `save-retry-death-checkpoint.png`, `guards-legacy-alliance.png`; 기존 아트4조건은 `m6-roc/`, 캠페인7장은 `journey/`. 실측 크기·바이트·SHA는 `s09-mechanics-final-screenshots.json`이다. 화면과 관측 JSON을 함께 기록했으며 짧은 상태의 PNG와 관측 시각이 다를 수 있다.
- 개발 중 실제 실패도 보존했다. 날개 바람의 너무 이른 피해와 저장 ID 미등록은 런타임을 수정했다. 하트 XP를 포함한 기대값·대화가 열리기 전 확인·갱신 시각 비교는 검사를 보완했다. 옛 보스 선행 승리 막힘을 정적 검토에서 발견해 첫 완주 실행을 S11에서 중단하고 보완 후 다시 검증했다. 원래 로그/실패 PNG/문맥/검사 소스와 `s09-mechanics-development.json` 참조. 마지막 M3 실패 화면/문맥은 `docs/screenshots/s09-mechanics/primary-test-results/m3-opening-S09-S12-continu-2fe28-d-R03-with-save-safe-bosses/`, 보완 전 소스는 `s09-mechanics-before-m3-repair.test.ts.txt`에 보존했다. 중단본을 전체 통과로 취급하지 않는다.
- 기본 실행 및 검사 보완 실행 각각 전후1001파일 SHA256 일치; 두 실행 사이에는 `tests/e2e/m3-opening.spec.ts`만 바뀌었다. 이전 자산638개·의존성/lockfile 보존. 범위 외 코드 변경 없음. 기존 고정 보고서의 이번 실행본은 별도 폴더에 보존하고 원본 바이트를 복구했다. `s09-mechanics-release2-final-runtime-hashes.json`, `s09-mechanics-regression-repair-runtime-hashes.json`, `s09-mechanics-repair-code-diff.json`, `s09-mechanics-regression-repair-preservation.json`, `s09-mechanics-regression-reports.json`. 서버 종료·최종 diff 결과는 별도 마무리 기록을 참조한다.

**남은 문제/미검증:** S09 승리 후 둥지 위 선택 보석과 별도 연습 동선은 미구현. S26동굴 박쥐5마리/S32저주 구체4개/박쥐 제한 비행 경로도 기존 미완료다. 실기기 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·스피커·최종 아트 승인 미검증(Windows Edge 자동 입력/터치 이벤트 검증). 로크새 보석 색 연속성 및 전용 활공 자세는 ART_DRAFT 검수 대상이다. 이번 작업 커밋·푸시·배포 없음.

마무리 확인: 문서 갱신 후 런타임1001파일 해시 일치, 기존 고정 보고서3개 원본 바이트 복구 확인. `git diff --check` exit0. netstat의 전체 인터페이스에서 5174/5175/9323 LISTENING 없음. 실제 기록은 `docs/validation/s09-mechanics-finish.json`, `s09-mechanics-final-diff-check.txt`, `s09-mechanics-stopped-servers.json`에 보존했다.

**다음 한 작업:** S09 승리 후 T03를 쓰는 둥지 상단 선택 보석과 안전한 이단 점프·활공 연습 동선 구현 및 저장/재방문 검증.
<!-- S09_MECHANICS_STATUS_END -->

<!-- M6_ROC_STATUS_START -->
## 최신 실제 상태 · 2026-10-07 · M6 로크새 행동6프레임

**로크새 구현·4조건 검증 완료 / 전체77개 E2E 76통과·1실패(66.9분), 검사 보완 후 정령4조건 통과 / ART_DRAFT.** 내장 imagegen으로 자체 hero/roc 원화만 참조한 대기·예고·공격·평온한 저주 해제·비행 날개 위/아래6셀을 만들었다. 도구 원본1536×1024와 전체 프롬프트/SHA를 보존하고, 전체512셀을448로 축소·32px 여백에 넣은 동일 RGBA PNG/무손실 WebP928,470B를 저장했다. 런타임768×512/256셀103,480B는 최적화 스크립트로 생성했다. 원본 삭제 없음.

- JSON의 발/몸통/안장 좌표를 연결했다. 날개로 가려진 안장2셀은 투영 좌표임을 명시한다. S09 보스의 기존 타깃/HP/대기 높이/경고 발 위치를 유지하고 S10·S33 비행의 탑승자 발을 안장에 고정한다. 기존 날개 공격 피해22/활성80~200ms/420ms 재사용·플레이어 물리42×84·적/보상/저장 ID 유지. 누락은 기존 로크새 원화로 복구한다.
- ART_DRAFT 검수 항목: 비행 공격은 보스의 셀2를 공용하므로 목 보석이 보라색이다. 평온한 비행의 청록 보석과 색 연속성을 최종 아트에서 보완해야 한다.
- 최종 정적8명령 순서 통과: 최적화→이미지 감사178파일→타입→린트→단위117개/25파일→콘텐츠→빌드48모듈→첫 화면3,085,916/8,000,000B. 기존 Phaser 큰 청크 경고 유지. `docs/validation/m6-roc-release2-checks.json`, `m6-roc-release2-check-{1..8}.txt`.
- 최초 단위116통과/1실패는 기존 S09 행동 시트 없음 기대값으로 수정 후117통과. 새 E2E 최초4실패는 저주 해제 문구의 기대값, 두 번째4실패는 이동 직후 물리/그림 좌표 비교, 세 번째2통과/2실패는 이단 점프의 짧은 상승 구간을 느린 poll이 놓친 검사였다. 기존 문구·멈춘 뒤 좌표 비교·프레임별 관측으로 검사만 보완했다. `m6-roc-development.json`, 각 실행 JSON/로그/검사 원본과 `docs/screenshots/m6-roc/{first,second,third}-target-failure/`에 실패 증거를 보존했다.
- 로크새 전용 폰/태블릿×정상/의도적 누락4조건 모두통과/exit0/5.4분. 실제 봉인3개·보스5상태·반전·일시정지·터치공격·동물해제·XP6/금화3 한번·T03 조기 지급 차단/대화 중 저장/새로고침·이단 점프·비행4/5/2와 반전안장·동승자·피해22·물리42×84·체크포인트 재개·캐시 해제 확인. stage/레벨/아이템 픽스처이며 새 게임 완주와 구별. `m6-roc-recheck3.json`,66화면 `docs/screenshots/m6-roc/recheck3/m6-roc/`. 최종 검사 보완 뒤 타입/린트 재통과.
- 전체 `npm run test:e2e -- --reporter=list,json,html` exit1, **76통과·정령1실패/66.9분**, 건너뜀/재시도0. 새 게임 실제 입력36구간 완주와 새 로크새4조건은 통과. S06 정령 터치 공격이 빗나가 HP31이 유지된 검사였고, 현재 적 위치를 다시 읽고 접근/방향을 맞추도록 **검사1파일만 보완**했다. 게임/자산/빌드 변경 없음. 관련 정령4조건 재실행 **exit0/모두통과/9.0분**. 보완 후 전체77개 재실행은 미검증: 게임 바이트가 같고 관련4조건을 모두 재검사하여 전체 실행을 반복하지 않았다. 전체 통과로 바꾸어 기록하지 않는다. `m6-roc-e2e-final.json`, `m6-roc-regression-repair.json`, 양쪽 로그/HTML 보고서와 `m6-roc-full-regression-failures.json`에 실제 결과 보존.
- 전체 전후997파일 SHA256 일치, 보완4조건 전후도997파일 일치. 두 검증본의 차이는 `tests/e2e/spirit-actions.spec.ts` 하나뿐(`m6-roc-regression-repair-code-diff.json`). 기존 미디어575개와 백업402개 확인. 기존 아트 연결4파일·감사/최적화2파일·단위 기대값1파일·정령 검사 접근1파일 외 이전 코드 보존. 이전 고정 JSON35개를 바이트 복구하고 이번 실행본을 `m6-roc-regression-reports/`에 보존했다. `m6-roc-final-runtime-hashes.json`, `m6-roc-regression-repair-runtime-hashes.json`, `m6-roc-final-integrity.json`.
- 최종 로크새66+터치6=**72스크린샷** 보존. `docs/screenshots/m6-roc/final/m6-roc/`의 폰/태블릿·정상/누락 S09 봉인/공격/해제/보물/재개/이단점프와 S10/S33 프레임/반전/날개 공격/재개, `docs/screenshots/m6-roc/mobile/`. 대표 `phone-normal-S09-telegraph.png`, `tablet-normal-S09-defeated.png`, `phone-normal-S33-attack.png`. 실제 크기/바이트/SHA는 `m6-roc-final-screenshots.json`. 짧은 공격은 관측 JSON과 원화 프레임도 함께 확인했다. 자체 서버 종료 및 최종 diff 검사 확인.
- dev와 CDP 실제 터치 검사 exit0. 폰844×390/태블릿1180×820 이동257/252px·밀기 반전·첫 해골 처치·선장 대화·오류[] 확인. 동시 이동·점프는 모두dx0/dy−110px로 가로 판정 보류. `m6-roc-mobile.json`, 화면 `docs/screenshots/m6-roc/mobile/`.

**남은 구현:** S09 설계의 저주 핵3회 피격/공격3패턴은 현재 일반 HP보스+채널 봉인3개와 다르며 미구현이다. T03 별도 지상 활공도 코드에서 확인되지 않아 미구현으로 기록한다(이단 점프/지정 비행과 구별). S26박쥐5마리/S32저주 구체4개/박쥐 제한 비행 경로도 기존 미완료. 콘텐츠 그래프 통과는 설계서 전체 일치 검증이 아니다.

**미검증:** 실기기 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·실제스피커·최종사용자아트승인. ART_DRAFT 유지, 이번 작업 커밋/푸시/배포 없음. **다음 한 작업: S09 설계 정합성 구현 — 저주 핵3회·고유 공격3패턴과 T03 지상 활공을 실제 플레이에 연결하고 저장·재시도를 검증한다.**
<!-- M6_ROC_STATUS_END -->

<!-- M6_SPIRIT_STATUS_START -->
## 최신 실제 상태 · 2026-10-06 · M6 정령 행동4프레임

**구현·정령4조건 검증 완료 / 전체73개 E2E 69통과·4실패(69.7분), 테스트 보완 뒤 관련5개 재검사 통과 / ART_DRAFT.** 내장 imagegen 후보1의 공격 효과가 중앙 세로 셀 경계 x626/627을 넘어 반려하고 원본/전체 프롬프트/도구 경로/SHA를 보존했다. 더 작고 효과를 제한한 후보2의1254×1254 RGBA/2×2 전체627px 셀을512px로 균일 축소·4×1 재배열해2048×512 PNG + 동일RGBA 무손실 WebP259,304B를 만들었다. SIZES/runtimeSize 등록→최적화 런타임1024×256/4셀256px WebP34,476B. 외곽/중앙alpha>16 비어 있음·글자/상처/피 없음·안전한 빛/연기 마무리 확인. 원본 삭제 없음.

512px baseline453/441/375/392·불투명 중심(314,355)/(265,334)/(301,288)/(268,284)·대기 높이313을 JSON으로 실측 기록하고 게임 JSON으로 바이트 동일 복사했다. 좌우 원점도 반전한다. 대기 가시 높이약116px·기존 타깃96×128·바닥 경고64·위치/HP/타이밍/접촉 피해/보상/저장ID·S06기존0xffaa65색조 유지. 꼬리는 공중 정령이므로 바닥에 강제 고정하지 않는다. S03 3·S06 5·S07 4·S32 3=실제15마리에 연결, 누락은 기존 자체 SVG 복구. 마법 적의 프레임3·“빛으로 돌아갔어요”·기존300ms 유지 뒤520ms 소멸(연출 줄이기0ms)을 쓴다.

- **정적8명령 순서 통과:** 최적화→이미지 감사→typecheck→lint→단위115개/24파일→validate:content→build→용량. `docs/validation/m6-spirit-release-checks.json`, `m6-spirit-release-check-{1..8}.txt`. 실제 원화88+런타임88=176파일·정령 네이티브/무손실RGBA/경계/실측JSON 감사 통과. 기존 지형·무기·효과·아이콘·소품도 감사했다.
- **콘텐츠 검사36스테이지·아이장면24·7무기/보물·8하트 통과는 등록/획득 그래프 검사이며 전체 설계 일치 판정이 아니다.** S32설계 잔여 저주구체4개/실제정령3마리, S26설계박쥐5마리/현재산적3마리, 박쥐의 제한 비행 경로는 별도 미구현. 이번 작업에서 개수/AI를 바꾸지 않았다.
- **빌드46모듈 통과:** JS220.06KB/CSS16.93KB/Phaser1,481.77KB, 기존500KB청크 경고 유지. 첫 화면3,083,504/8,000,000B 통과. HTTP/실기기 성능 검사로 취급하지 않는다.
- **정령 전용 검사 두 번째 실행3통과·1실패, 해당1조건 보완 재실행통과/exit0/2.6분.** 이어진 아래 전체73개 실행에서 새4조건도 전부 통과했다. 폰844×390/태블릿1180×820×원화/의도적 시트 누락, 각 조건에서S03/S06/S07/S32를 검사했다.15마리 텍스처/초기좌표 계약·대기/예고/공격/회복/빛 마무리·좌우 중심·일시정지·실제 터치 공격·XP6/금화3한 번 지급·새로고침/재등장추가0·S06진정적 재등장 생략/1마리 진정만으로T01조기지급 안 됨·S07첫 파도/보호/보물·설정된쉼터x/착지 재개·S01캐시 해제를 확인했다. 명시적 stage/레벨/아이템 픽스처이며 새게임 완주와 구별한다. 태블릿 연출 줄이기, S03 HP관측은 기존 번개도 포함하여 접촉 피해만의 측정으로 취급하지 않는다. `m6-spirit-recheck.json`, `m6-spirit-recheck2.json`과 각각의raw출력. 최종128화면은 `docs/screenshots/m6-spirit/final/m6-spirit/`.
- **최초 추가검사4실패 후 테스트만 보완.** 3개는 S06덩굴 근처의 ‘살펴보기’를 공격으로 가정한 오류,1개는 S03기존 무적/번개가 겹칠 수 있는데 첫 회복 때 피해를 고정 기대한 오류였다. 실제 공격버튼 상태를 기다려 터치하고, 필요하면 후속 실제 공격 주기의HP변화를 관측하도록 바꿨다. 최초소스·raw로그/JSON·실패9파일/해시는 `m6-spirit-first-test.ts.txt`, `m6-spirit-target*`, `docs/screenshots/m6-spirit/first-target-failure/`에 보존했다. `m6-spirit-development.json`. 전투/입력/피해/저장 규칙을 이 보완 때문에 바꾸지 않았다.
- 두 번째1실패는 태블릿S32에서 주인공이 접근 중인 정령을 관성으로 조금 지나쳐 오른쪽을 보는데 테스트가 왼쪽을 고정 기대한 문제였다. 접근 뒤 실제 정령x를 다시 읽고 두 번째 이동으로 간격을 맞춰 보완했다. 기존게임좌표/속도/AI/반전규칙은 유지했다. 두 번째소스와 실패3파일/해시는 `m6-spirit-second-test.ts.txt`, `docs/screenshots/m6-spirit/second-target-failure/`에 보존했다. 세 번째소스는 `m6-spirit-third-test.ts.txt`다. 별도3통과+보완1통과를 단일4통과로 기록하지 않는다.
- **CDP 실제 터치 스모크 exit0**, 정적 최종 검사 뒤 dev서버에서 다시 실행했다. 폰/태블릿 이동+252px/+252px·밀기 반전·첫해골처치·선장대화·오류[]; 동시 이동/점프는 폰dx0/dy-110, 태블릿dx7/dy-110px다. 가로0이면 그 조건은 판정 보류하며 점프 성공만 기록한다. `m6-spirit-mobile-final.json`, `m6-spirit-mobile-final-output.txt`,6화면 `docs/screenshots/m6-spirit/mobile-final/`. 초기실행은 `m6-spirit-mobile.json`/`mobile/`에 별도 보존했다. 뷰포트/실제 CDP터치이며 실기기 결과로 취급하지 않는다.
- **전체73개 단일 E2E 실행 69통과·4실패/exit1/69.7분**, flaky/skipped각0. 신규 정령4조건은 모두 통과했다. 산호 수호자1개는 회복 중 공격을 방패 차단으로 고정 기대해HP32→20으로 실패했고, 세이렌 폰정상/폰누락/태블릿정상3개는 촬영 후 이미 사라진 음파를 읽어1개 대신0개를 관측했다. 태블릿누락은 통과. 실제 실패로그/수정전테스트/화면4장·문맥4파일은 `m6-spirit-full-regression-failures.json`, `m6-spirit-full-before-{m2,siren-actions}.ts.txt`, `docs/screenshots/m6-spirit/full-regression-failures/`에 보존했다. 전체결과 `m6-spirit-e2e-final.json`, `m6-spirit-e2e-final-output.txt`, `m6-spirit-final-report/index.html`.
- **테스트2파일만 보완 후 관련5개 재검사 통과/exit0/3.5분**, flaky/skipped0. 수호자는 실제 정면/착지와 새 예고를 기다려 방패 차단·뒤이은 회복 피해를 검증한다. 세이렌은 읽기 전용 동일 시뮬레이션 스냅샷에서 적 상태와 짧게 살아 있는 투사체를 함께 관측하고 촬영한다. 파동1개/속도−230·음표3개/속도−190와vy−140/−55/35, 보상/무기/새로고침/누락복구 조건 유지. 산호 관문 보물 차단도 유지. 게임규칙·HP·시간·판정 변경 없음. 전체실행과 재검사 사이984파일 중 E2E2개만 변경, 나머지982개(실제게임/빌드/원화/런타임 포함)동일; 재검사 전후984개 동일. `m6-spirit-regression-repair-summary.json`, `m6-spirit-regression-repair.json`, `m6-spirit-regression-repair-output.txt`, 별도34화면/SHA `m6-spirit-regression-repair-screenshots.json`, `docs/screenshots/m6-spirit/regression-repair/`. 타입/린트/단위115개 추가 재검사도통과(`m6-spirit-repair-checks.json`). **보완 후 전체73개 단일 실행은 재실행하지 않았으며 전체73통과라고 기록하지 않는다.**
- **저장 주입 없는 새게임36스테이지 정상키입력 완주812초.** 무기/보물각7·엔딩·S01재방문·S16/S32완료 뒤 새로고침 보상ID 유지·오류[] 확인(`m6-spirit-complete-journey.json`). 자동 시간을 어린이 플레이 시간으로 취급하지 않는다.
- **보존/실행 일치:** 전체실행 전후 실제 소스/런타임/빌드/원화/스크립트/테스트984파일 모두동일. 백업363개·기존미디어570개·기존src37개·네이티브후보2의 도구원본 일치 재확인. 고정이름 이번회귀 보고서35개는 `m6-spirit-regression-reports/`에 바이트 동일 보존하고 이전보고서 원본을 복구했다. `m6-spirit-final-runtime-hashes.json`, `m6-spirit-preservation.json`, `m6-spirit-postcheck.json`. 원본 삭제 없음.

**실제 화면:** 주요141장은 `docs/screenshots/m6-spirit/final/m6-spirit/`에 있다. 정령128장(2뷰포트×2모드×4맵×8상태/맥락), 터치6장, 캠페인7장. 예: `phone-normal-S06-telegraph.png`, `tablet-normal-S32-defeated.png`, `phone-fallback-S07-resume.png`. 빛 마무리 캡처에는 주인공/무기/기존정화 효과가 일부 겹치므로 JSON프레임3관측과 보존 원화도 함께 확인했다. 실제크기/SHA/복사 일치는 `m6-spirit-final-screenshots.json`.

**미검증:** 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·실제스피커믹스·최종사용자아트승인. Windows Edge 뷰포트/실제CDP터치만 가능했다. 동시 이동·점프의 가로0조건은 판정 보류. **ART_DRAFT 유지**, 로컬작업으로 이번 커밋/푸시/배포 없음. 자체서버 종료/TCP확인 및 최종diff 검사는 `m6-spirit-stopped-servers.json`, `m6-spirit-final-diff-check.txt`다.

**다음 한 작업:** M6 로크새 행동 프레임. 기존 원화/보스저주해제·비행날개공격을 기준으로 남은 자세를 제작하고 안정ID·봉인·T03·비행입력·저장·누락복구를 검증한다. S32/S26콘텐츠 불일치·박쥐비행경로·실기기검수는 별도 미완료다.
<!-- M6_SPIRIT_STATUS_END -->

<!-- M6_BAT_STATUS_START -->
## 최신 실제 상태 · 2026-10-06 · M6 박쥐 행동4프레임

**구현·추가4조건 검증 완료 / 전체69개 E2E 통과/53.3분 / ART_DRAFT.** 내장 imagegen으로 자체 보라 박쥐 디자인과 `hero-webtoon.webp` 화풍을 사용해 대기·공격 예고·공격·평온한 저주 해제4셀을 제작했다. 선택1번1254×1254/2×2의 전체627px 셀을 균일 축소·재배열하여2048×512 PNG와 동일 RGBA 무손실 WebP264,444B로 저장했다. 런타임1024×256/4셀256px WebP31,056B는 최적화 스크립트로 생성했다. alpha>16 외곽/중앙 경계 비어 있음·글자/잘림/피/상처 없음 확인. 모든 원본 보존.

512px 기준 baseline429/448/365/363·몸통 중심(327,384)/(280,412)/(347,280)/(272,288)·대기 높이233을 JSON으로 기록하고 바이트 동일 게임 JSON으로 복사했다. 좌우 원점을 반전해 몸통을 기존 타깃에 맞춘다. 가시 대기 높이약84px·기존 타깃96×128·바닥 경고 오프셋64·적/보상/저장 ID를 유지한다. 날개 가시 폭은 SVG보다 넓다. 실제 S08 박쥐4마리만 연결하고, 안전 구역에서 그림도 대기로 복귀한다. 누락은 보존 SVG로 복구한다.

- 정적8명령 순서 통과: 최적화→이미지 감사→typecheck→lint→단위113개/23파일→validate:content→build→용량 검사. `docs/validation/m6-bat-release-checks.json`, `m6-bat-release-check-{1..8}.txt`. 마지막 테스트 보완 후 타입/린트도 다시 통과(`m6-bat-{typecheck,lint}-release2.txt`).
- 실제 원화87+런타임87=174파일 감사 통과. 콘텐츠 검사는36스테이지·아이 장면24·7무기/보물·8하트의 등록/획득 그래프 검사이며 **설계서 전체 콘텐츠 일치 검증이 아니다**. 실제 S26은 산적3마리여서 설계의 동굴 박쥐5마리는 미반영이다. S08도 현재 고정 높이 수평 접근 AI이며 설계의 제한 비행 경로는 별도 미구현이다. 이번 아트 연결에서 적 종류·개수·AI를 바꾸지 않았다.
- 빌드45모듈, JS219.12KB/CSS16.93KB/Phaser1,481.77KB, 기존500KB 청크 경고 유지. 첫 화면3,082,569/8,000,000B 통과; HTTP/실기기 성능 검사로 취급하지 않는다.
- 추가4개 E2E 통과/exit0/2.4분: 폰844×390/태블릿1180×820×원화/의도적 시트 누락. 대기·예고·접촉 공격·회복·해제·좌우 몸통 중심·일시정지·실제 터치 공격·XP6/금화3 한 번 지급·재등장 후 추가0·퍼즐 안전 구역 HP 유지/대기 프레임·T02 없는 쉼터 저장/새로고침·S01 캐시 해제. 명시적 S08시작/레벨/보물 픽스처이며 새 게임 완주와 구별한다. 태블릿은 연출 줄이기. `m6-bat-recheck3.json`, `m6-bat-recheck3-output.txt`,32화면 `docs/screenshots/m6-bat/recheck3/m6-bat/`.
- CDP 실제 터치 스모크 exit0: 폰/태블릿 이동+252px·밀기 반전·동시 이동/점프dx7px/dy−110px·첫 해골 처치·선장 대화·오류[]. `m6-bat-mobile.json`,6화면 `docs/screenshots/m6-bat/mobile/`. 실기기 결과로 취급하지 않는다.
- 첫 추가검사4실패는 테스트의 한 번 처치 가정으로, 실제 두 번 공격을 쓰게 수정했다. 두 번째는 체크포인트를 일반 완료 목표처럼 기다려1실패 후 중단한 실행이다(나머지 전체 결과 없음). 쉼터의 착지/근접 자동 저장을 직접 확인하도록 바꿨다. 세 번째2통과/2실패는 실제 SVG 복구 성공 후 Phaser의 재시도를3회로 가정한 요청 수 검사였다. 실패 로그·소스·스크린샷/문맥은 `m6-bat-{target,recheck,recheck2}-output.txt`, `m6-bat-{first,second,third}-test.ts.txt`, `docs/screenshots/m6-bat/{first,second,third}-target-failure/`에 삭제 없이 보존했다. 게임 피해/체크포인트/로더 규칙은 유지했다.
- 보존 사전 검사: 백업333파일·기존 미디어566개·기존 src36개·도구와 같은 네이티브1장 SHA 확인(`m6-bat-current-preservation.json`). 최종 전체 검사 전 실제 소스/런타임/빌드/원화/테스트970파일 해시를 고정했다(`m6-bat-final-runtime-hashes.json`). 전체 결과와 실행 후 일치는 아래 최종 기록처럼 확인했다.

- **전체69개 E2E 통과/exit0/53.3분**, 실패·flaky·skipped 각0. `docs/validation/m6-bat-e2e-final.json`, `m6-bat-e2e-final-output.txt`, `m6-bat-final-report/index.html`. 새 박쥐4조건·기존 적40자세·무기·지형·효과·터치·소품·저장/사망·불씨/파도·엔딩을 포함한다.
- **저장 주입 없는 새 게임36스테이지 정상 키 입력 완주815초.** 무기/보물 각7·엔딩·S01재방문·S16/S32완료 뒤 새로고침 보상 ID 유지·오류[]를 확인했다(`m6-bat-complete-journey.json`). 자동 완주 시간을 어린이 플레이 시간이나 모든 콘텐츠 설계 일치 검증으로 취급하지 않는다.
- **보존/실행 일치:** 전체 실행 전후970파일 전부 동일, 백업333개·기존 미디어566개·기존 src36개·네이티브1장의 도구 원본 일치를 최종 재확인했다(`m6-bat-final-runtime-hashes.json`, `m6-bat-preservation.json`, `m6-bat-postcheck.json`). 고정 이름에 쓰인 이번 회귀 보고서35개는 `m6-bat-regression-reports/`에 바이트 동일 보존하고 이전 원본 보고서를 복구했다. 원본 삭제 없음.

**실제 화면:** 주요45장은 `docs/screenshots/m6-bat/final/m6-bat/`에 있다. 박쥐32장(2뷰포트×2모드×8상태/맥락), 터치6장, 캠페인7장이다. 예: `phone-normal-attack.png`, `tablet-normal-defeated.png`, `tablet-normal-safe-puzzle.png`, `phone-fallback-checkpoint-resume.png`. 해제 캡처에는 기존 공격 연출/주인공이 일부 겹치며 JSON 프레임3 관찰과 보존 원화도 함께 확인했다. 경로·디코딩 크기·SHA·복사13개 일치는 `m6-bat-final-screenshots.json`이다.

**최종 출처 날짜 보완:** 전체69개 실행 뒤 자산 목록의 박쥐 출처가 이전 공통 날짜2026-10-01~04를 상속한 것을 발견했다. 박쥐만 실제 생성일2026-10-06로 분리했고 다른 자산의 출처 문구를 유지했다. 원래 검사한 manifest를 사본으로 보존하고 **출처 문자열 한 곳만 바뀐 것**을 확인했다. 변경 파일은 그 manifest와 재빌드된 dist3파일뿐이다. 타입·린트·단위113개/23파일·콘텐츠 포함 build·용량 검사를 다시 통과했다. 최종 JS219.16KB, 첫 화면3,082,605/8,000,000B다. 전체69개 E2E는 출처 표기 보완 전 실행이며 이후 전체E2E를 반복하지 않았다. 실제 차이/해시는 `m6-bat-provenance-postcheck.json`, 로그는 `m6-bat-provenance-{typecheck,lint,test,build,budget-output}.txt`다. 원화·런타임 이미지·전투/좌표/보상/저장 코드·테스트는 전체 실행 때와 바이트 동일하다.

**미검증:** 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간 FPS/발열·실제 스피커 믹스·최종 사용자 아트 승인. Windows Edge 뷰포트/실제 CDP터치만 가능했다. **ART_DRAFT 유지**, 이번 로컬 작업은 커밋·푸시·배포 없음. 자체 개발/테스트 서버 종료와 최종 diff 검사는 `m6-bat-stopped-servers.json`, `m6-bat-final-diff-check.txt`에 기록했다.

**다음 한 작업:** M6 정령 행동4프레임. 기존 실제 정령에 대기·예고·공격·빛/연기로 진정되는 자세를 연결하고 안정 ID·타이밍·피해·불씨/파도·저장·누락 복구를 검증한다. 로크새의 남은 동작·S26 콘텐츠 불일치·박쥐 비행 경로·실기기 검수는 별도 미완료다.
<!-- M6_BAT_STATUS_END -->

<!-- M6_SIREN_STATUS_START -->
## 최신 실제 상태 · 2026-10-04 · M6 세이렌 행동 4프레임

**구현·추가 브라우저 검증 완료 / 전체64통과·1실패 후 해당1개 보완 통과 / ART_DRAFT.** 내장 imagegen으로 자체 세이렌 인물·신밧드 화풍을 참조해 대기·노래 예고·음파 공격·저주 해제4셀을 제작했다. 첫 후보의 공격 파동이 셀 경계를 넘어 반려하고 삭제 없이 보존했다. 선택2번은1254×1254/2×2이며 전체 셀을 균일 축소·재배열해2048×512 PNG + 동일 RGBA 무손실 WebP441,120B를 저장했다. 런타임은1024×256/4셀256px WebP49,312B다. 가시 알파>16의 중앙/외곽 경계와 글자 없음·안전한 해제 자세를 확인했다.

실측 JSON의512px 기준선461/461/448/450·대기 높이312를 게임 JSON으로 동일 복사하여 기존 바닥 오프셋58·몸128px에 맞춘다. S02 보스에만 연결하고 다른 맵에서 해제하며 누락은 보존 세이렌 원화로 복구한다. 조개 종3개 방벽·단일 파동/음표3개 발사·기존 피해/타이밍·저주 해제·보상/오브젝트/저장 ID를 유지했다. 이전 파일308개 백업과 기존 미디어561개 해시를 기록했다.

- **정적8명령 순서대로 통과:** 최적화→이미지 감사→typecheck→lint→test→validate:content→build→용량 검사. `docs/validation/m6-siren-release-checks.json`, `m6-siren-release-check-{1..8}.txt`.
- **단위111개/22파일 통과**, 콘텐츠36스테이지·24아이 장면·7무기·7보물·8하트 검증 통과. 실제 웹툰 원화86+런타임86=172파일 및 기존 지형·무기·효과·아이콘·소품·연을 감사했다. 새 시트 네이티브SHA/동일 RGBA/JSON·측정 기준선·경계 검사 통과.
- **빌드 통과:**44모듈, JS218.25KB/CSS16.93KB/Phaser1,481.77KB. 기존500KB청크 경고 유지. 첫 화면3,081,692/8,000,000B 통과; HTTP/실기기 성능 검사로 취급하지 않는다.
- **추가4개 E2E 통과/exit0/3.2분:** 폰844×390/태블릿1180×820 × 원화/의도적 시트 누락. 방벽 피해 차단·실제 세 번째 종 공격·대기/예고/공격/회복/평온한 해제·양방향 기준선·일시정지·파동230/음표190의 두 패턴·실제 터치 공격·해제 때 투사체 제거·보스 XP50/금화3 한 번 지급·W02 실제 상자 획득·저장 재개/중복 방지·S01 캐시 해제를 확인했다. 명시적 S02보스 체크포인트/레벨/종2개 완료 픽스처 사용이며 새 게임 완주와 구별한다. 태블릿은 연출 줄이기를 사용했다. `m6-siren-recheck.json`, `m6-siren-recheck-output.txt`, 화면 `docs/screenshots/m6-siren/recheck/m6-siren/`.
- 최초 추가 검사4개 실패는 테스트의 상자 보상 ID에서 기존 `.reward` 접미사를 빠뜨린 문제였다. 게임/ID를 바꾸지 않고 검사만 바로잡았다. 실패 로그 `m6-siren-target.json`, 원시 화면/문맥 `docs/screenshots/m6-siren/first-target-failure/`, 최초 검사 소스 `m6-siren-first-test.ts.txt`를 보존했다.
- **CDP 실제 터치 스모크 exit0:** 폰/태블릿 모두 이동+252px·밀기 반전·점프−110px·첫 해골 처치·선장 대화·오류[]. 동시 이동/점프의 가로값은 둘 다0px여서 그 항목의 판정은 보류했다. `m6-siren-mobile.json`, `m6-siren-mobile-output.txt`,6화면 `docs/screenshots/m6-siren/mobile/`. 실기기 결과로 취급하지 않는다.
- **전체65개 E2E 실제 결과64통과·1실패/52.1분/exit1.** `m6-siren-e2e-final-output.txt`, `m6-siren-e2e-final.json`, `m6-siren-final-report/index.html`. 세이렌4검사·기존 적40자세·무기·지형·효과·터치·소품·저장/사망/엔딩 검사는 통과했다. 실패는 `flame-waves`의 S07 파도 목표 완료를10초 기다리다 시간 초과한 건이다. 실패 화면/문맥은 `docs/screenshots/m6-siren/full-first-failure/flame-waves/`에 보존했다. 이동 중 불필요한 반복 점프·착지 대기로2.2초 파도 예고를 놓칠 가능성이 있었으나, 최초 실행의 프레임별 원인은 확정하지 않았다.
- **해당 검사만 보완해1개 통과/2.3분/exit0.** 기존 캠페인의 `useJourney`로 움직이는 갑판에 접근하고 실제 밧줄 E를 재시도하게 바꿨다. 게임/파도 규칙·기존 보물/무기/목표/보상/동굴 저장 검증은 유지했다. `m6-siren-wave-repair.json`, `m6-siren-wave-repair-output.txt`, `m6-siren-wave-repair-report/index.html`. 타입·린트·단위111개도 재통과했다. 전체64통과+1실패와 보완1통과는 별도 실행이며 **전체65개 단일 실행 통과라고 쓰지 않는다.**
- **저장 주입 없는 새 게임36스테이지 정상 입력 완주818초.** 무기/보물 각7·엔딩·S01재방문·S16/S32새로고침 보상 ID 유지·콘솔/HTTP 오류[]를 확인했다(`m6-siren-complete-journey.json`). 실패한 별도 검사와 같은 S07도 캠페인에서는 통과했다. 자동 완주 시간을 어린이 플레이 시간으로 취급하지 않는다.
- **보존/실행 일치:** 전체·보완 실행 전후 각각958파일 동일이며 두 실행 사이 차이는 `tests/e2e/flame-waves.spec.ts` 하나다. 게임 소스/런타임/빌드/원화는 동일하다(`m6-siren-{final,wave-repair}-runtime-hashes.json`, `m6-siren-postcheck.json`). 백업308개·기존 미디어561개·기존 src35개·네이티브 후보2 PNG의 도구 원본 일치가 확인됐다(`m6-siren-preservation.json`). 고정 이름에 쓰인 이번 회귀 결과35개는 새 폴더로 바이트 동일 보존하고 이전 보고서 원본을 복구했다(`m6-siren-regression-reports.json`). 삭제한 원본은 없다.

**실제 화면:** 주요45장은 `docs/screenshots/m6-siren/final/m6-siren/`에 있다. 세이렌32장(2뷰포트×2모드×8상태/맥락), 터치6장, 캠페인7장이다. 예: `phone-normal-attack.png`, `tablet-normal-defeated.png`; 평온한 해제 캡처에는 기존 대화창이 일부 겹친다. 경로·디코딩 크기·SHA·원본복사13개 일치는 `m6-siren-final-screenshots.json`에 기록했다. 보완3화면은 `docs/screenshots/m6-siren/wave-repair/`, 실제 경로/해시는 `m6-siren-postcheck.json`이다.

**미검증:** 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간 FPS/발열·실제 스피커 믹스·최종 사용자 아트 승인. Windows Edge/실제 CDP터치만 가능했다. **ART_DRAFT 유지**, 배포 없음. 이번4셀을 M6 전체/최종 아트 완료로 취급하지 않는다.

자체 서버/로그 모니터는 종료했다. Node TCP검사에서5174/5175 ECONNREFUSED 확인(`m6-siren-stopped-servers.json`), 최종 `git diff --check` exit0(`m6-siren-final-diff-check.txt`). Ctrl+C exit1은 정리 결과다.

**Git · 2026-10-04 후속 요청 완료:** 이전 완료 작업 `9727657`과 세이렌 작업 `789d416`(`feat: add siren action sprites and verify boss rewards`)을 기존 `https://github.com/hjpapa/sindbad.git` main에 푸시했다. 실제 결과 `91f0b0c..789d416 main -> main`, exit0이다. 이전 자동 승인 거부는 대상/내용 안내 후 사용자의 재요청으로 해소됐다. 세이렌 커밋173파일/약60.1MB에는 자체 원화·런타임·코드·문서·선별한 검증 증거99파일(약55.5MB)을 포함했다. 반복 캡처·HTML·백업은 로컬에 보존했고 이전 보고서 원본은 유지했다. 비밀 파일명 후보·100MB이상 파일·검증 뒤 소스 변경은 없었다. 실행 중 Git 프로세스가 없는 오래된 빈 index.lock을 사본 보존 후 정리했다. 실제 Git 기록은 `docs/validation/m6-siren-git-update.json`이다. **배포 없음**, 다음 작업은 박쥐 행동4프레임이다.

**다음 한 작업:** M6 박쥐 행동4프레임. 기존 자체 디자인으로 대기·공격 예고·공격·저주 해제 자세를 제작하고 비행 AI·안정 보상·저장·누락 복구를 유지해 연결·검증한다. 정령·로크새 행동과 실기기 검수는 별도 미완료다.
<!-- M6_SIREN_STATUS_END -->

<!-- M6_KITE_STATUS_START -->
## 최신 실제 상태 · 2026-10-04 · M6 공중 연 행동 4프레임

**구현·브라우저 검증 완료 / 최종 아트는 ART_DRAFT.** 자체 `hero-webtoon.webp` 화풍과 보존 `draft/kite.svg` 디자인으로 내장 imagegen 후보2개를 만들었다. 첫 후보는 공격 바람이 셀 경계를 넘어 반려하고 PNG/전체 프롬프트를 삭제 없이 보존했다. 선택2번은1254×1254/2×2/627px 셀이며 전체 셀만 균일 축소·4×1 재배열하여 **2048×512 PNG + 동일 RGBA 무손실 WebP(249,586B)**로 저장했다. 런타임은 **1024×256/256px 셀4개,33,784B**다. 가시 알파>16의 셀 외곽/중앙 경계는 모두 비고 글자가 없다.

순서는 대기·공격 예고·공격·빛으로 정화다. `kite-actions.json`의 가시 경계/baseline·측정 중심 `(286,291),(262,319),(321,253),(255,236)`을 게임으로 바이트 동일 복사했다. 프레임별 중심과 Phaser 좌우 반전 원점을 맞춰 기존 비행 타깃 좌표를 유지한다. 정지 시 실루엣 높이128월드px, 비행 몸 기준96×128, AI의 떠다니기·거리·예고/발사/회복 시간·바람탄·날개 공격·보상/저장 ID는 유지한다. 별도 `kite-actions` 시트를 S10 연6개/S33 연5개에 연결하고 현재 맵에서만 로드한다. S01 복귀 때 해제하며 파일 누락은 보존SVG로 복구한다. 기존10행 `enemy-actions`와 다른 자산은 유지했다. 최적화 SIZES·manifest runtimeSize·패킹/감사 스크립트·읽기 전용 원점/캐시 관찰·단위/브라우저 검사를 추가했다.

### 실제 검사 결과

- **문서5절 정적8명령 순서대로 모두 통과:** 최적화 → 실제 이미지 감사 → typecheck → lint → test → validate:content → build → 용량 검사. `docs/validation/m6-kite-release-checks.json`, `m6-kite-release-check-{1..8}.txt`.
- **단위109개/21파일 통과.** 콘텐츠36스테이지·24아이 장면·7무기·7보물·8하트 검증 통과. 새 연4프레임 중심/회복 자세/비행2맵11연·마법 정화 규칙을 검사했다. 웹툰 **원화85 + 런타임85 =170파일**을 실제 디코딩했다. 기존34지형·7무기·효과·터치 아이콘·30소품 감사와 신규 연 네이티브SHA/동일 RGBA/런타임·경계·중심 검사가 통과했다.
- **빌드 통과:**43모듈, JS217.57KB/CSS16.93KB/Phaser1,481.77KB. 기존500KB청크 경고는 남았다. 첫 화면 **3,081,013 / 8,000,000B**로 통과했다(`m6-kite-art-budget.json`). HTTP/실기기 성능 측정으로 취급하지 않는다.
- **새 연4검사 통과:** 휴대폰844×390/태블릿1180×820 × 원화/의도적 시트 누락. 각 S10/S33 대기/예고/공격/회복/정화·좌우 원점·바람탄·일시정지·실제 터치 공격·재시도/저장/안정 보상 중복 방지·S33 연출 줄이기·S01 캐시 해제를 확인했다. 단독 수정 재검사(`m6-kite-recheck2.json`)와 전체 실행에서 모두 통과했다. 명시적 스테이지/보물/레벨 픽스처 사용을 기록하며 새 게임 완주와 구별한다. 네 최종 `m6-kite-{phone,tablet}-{normal,fallback}.json`의 오류는 모두[]이다.
- **전체 E2E 실제 결과:60통과/1실패,50.1분,exit1.** `m6-kite-e2e-final.json`, `m6-kite-e2e-final-output.txt`, `m6-kite-final-report/index.html`. 실패한 무기 원화 검사의28표시/손좌표/방향/아이콘·콘솔 검사는 모두 통과했으나, 마지막 기존 `docs/validation/a6-weapon-art.json` 쓰기에서 Windows `UNKNOWN open`이 발생했다. 열린 파일 충돌 가능성은 있지만 OS 원인은 확정하지 않았다. 실패 PNG/문맥은 `docs/screenshots/m6-kite/full-first-failure/`에 보존했다. 전체 실행을61개 모두 통과했다고 쓰지 않는다.
- **기록 경로 수정 후 해당 무기2검사 통과,exit0:** 원화/누락 검사의 JSON 목적지만 이번 증거 폴더로 바꾸어 이전 파일을 유지했다. 기존 무기/손/방향/콘솔·누락 복구/보상 검증은 바꾸지 않았다. `m6-kite-record-fix.json`, `m6-kite-record-fix-output.txt`, `m6-kite-record-fix-report/index.html`; 실제 결과 JSON/42화면은 `docs/screenshots/m6-kite/record-fix/art-a6/`. 이후 typecheck/lint·단위109개도 통과했다. **전체60통과+1기록 실패와 보완2통과는 서로 다른 실행**이다.
- **새 게임36스테이지 정상 조작 완주,833초:** 저장/진행 주입 없이 시작, S16/S32 재개 때 보상 ID 동일, 무기7/보물7/엔딩/S01재방문·콘솔 오류[] 확인. `m6-kite-complete-journey.json`. 새 연의 S10·S33도 실제 진행해 완료했다.
- **CDP 실제 터치 스모크2회,exit0:** `npm run dev`로5175서버를 열고 `node scripts/mobile-check.mjs`를 폰/태블릿에서 실행했다. 이동+257/+252px, 손가락 밀기 반전, 점프−110px, 첫 해골 처치·선장 대화·콘솔 오류[]를 기록했다. 동시 이동/점프의 가로 이동은1회차 폰+7/태블릿0,2회차 양쪽0으로 나타나 **해당 원래 수치의 판정은 보류**했다. `m6-kite-mobile{,2}-output.txt`, `m6-kite-mobile{,2}.json`과12장 보존. 별도 실제 터치 진단4조건은 양쪽 모두 열린 공간+57px/이동·밀기 후+37.1667px, 높이−110px·vx300/vy−265·오류[]이다(`m6-kite-touch-diagnostic.json`,8장). 게임/입력 코드는 수정하지 않았다. 전체 터치 아이콘/실제 행동 회귀 검사도 통과했다. 실기기 결과로 취급하지 않는다.
- **보존/실행 일치:** 작업 전281파일 백업, 기존38소스/아틀라스/SVG와 **기존 미디어556파일** 바이트 동일. 네이티브 후보2 PNG도 도구 원본과 동일하며 비행 맵 변경은 기존11연에 actionArt를 추가한 것뿐이다(`m6-kite-preservation.json`). 전체 실행 전후944파일 동일; 기록 경로 수정 뒤 재검사 전후944파일 동일. 두 실행 사이 차이는 **tests/e2e/weapon-art.spec.ts 하나**이며 게임 소스/런타임/원화/빌드는 동일하다(`m6-kite-final-runtime-hashes.json`, `m6-kite-record-fix-runtime-hashes.json`, `m6-kite-postcheck.json`).

### 실제 화면과 남은 문제

최종 주요 화면 **69장**은 `docs/screenshots/m6-kite/final/m6-kite/`에 있다. 새 연48장(2화면×2모드×2맵×6장), 모바일 스모크6장, 보조 터치8장, 새 게임 경로7장이다. 경로/크기/SHA/원본복사21개 일치는 `m6-kite-final-screenshots.json`에 기록했다. 예: `phone-normal-S10-attack.png`, `tablet-normal-S33-defeated.png`, `campaign-S33-route.png`. 기록 경로 재검사 화면42장은 별도 보존했다. 최초 JSON import 시작 오류·첫 연 재검사4통과/2실패(기존 정화 확대를 고정 크기로 잘못 검사)도 로그·실패 화면/맥락을 유지했다. Python 후처리의 Windows 기본 CP949 읽기 오류는 UTF-8 명시로 수정했다(`m6-kite-development.json`).

**미검증:** 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간 FPS/발열·실제 스피커 믹스·최종 사용자 아트 승인. Windows Edge 뷰포트/실제 CDP터치만 가능했다. 동시 입력의 원래 스모크0px 수치는 통과로 꾸미지 않았으며 보조 조건 결과를 구별했다. 이번4프레임 완료를 M6 전체/최종 아트 완료로 취급하지 않는다. **ART_DRAFT 유지**, 커밋·푸시·배포 없음. 자체 서버/모니터 종료와 Node TCP검사에서5174/5175 ECONNREFUSED를 확인했다. Ctrl+C exit1은 정리 결과다.

**다음 한 작업: M6 세이렌(S02)의 행동4프레임.** 기존 자체 원화로 대기·노래 공격 예고·음파 공격·저주 해제 동작을 제작하고, 조개 종3개의 방벽·두 발사 패턴·보스 보상/저장·연출 줄이기·누락 복구를 유지해 연결·검증한다. 박쥐·정령·로크새의 남은 동작과 실기기 검수도 별도 미완료다.
<!-- M6_KITE_STATUS_END -->

<!-- M6_FLIGHT_STATUS_START -->
## 최신 실제 상태 · 2026-10-04 · M6 비행 고리·돌풍·낙하 파편

### 구현 범위

**비행 소품 구현·브라우저 검증 완료 / 최종 아트는 ART_DRAFT.** 내장 imagegen으로 `prop-flight-ring`, `prop-gust-cloud`, `prop-falling-debris`를 개별 제작했다. 화풍 참조는 프로젝트 자체 `hero-webtoon.webp`뿐이다. 네이티브 PNG3장(각1086×1448)을 원래 생성 경로와 `art-source/webtoon/generated/flight-m6/`에 바이트 동일 보존했다. 전체 캔버스 비례 축소로384×512 PNG와 동일 RGBA 무손실 WebP를 만들고 SIZES/runtimeSize 등록·최적화로96×128 런타임을 출력했다. 합계 **17,644바이트**. 글자·잘림·피/상처 없음은 육안, 투명 바깥 경계와 고리 중심알파0은 실제 픽셀 검사다. 원본을 자르거나 다시 칠하지 않았다.

현재 맵의 고리·장애물만 로드하고, 다른 맵 이동 시 캐시를 제거하며 누락은 보존 SVG로 복구한다. 고리129.6×172.8·통과 타원 반경65/80, 구름 기본91.2×121.6·반경62/70, 파편 기본67.2×89.6·반경48, 기존 상하 움직임·맥동·회전·기본피해8·안정 ID·저장·조작·손 JSON은 유지했다. 단위 검사가 기존 `lantern` 텍스처를 먼저 선택하던 실제 연결 문제를 찾아 `flightRing` 플래그를 우선하도록 수정했다. 읽기 전용 장애물 관찰에 텍스처·표시 크기·반경·회전·scale을 추가했다. 그3개 아트/관찰 소스 외 기존 src35파일은 바이트 동일하다.

### 실제 검사 결과

문서§5의 정적8명령→개발 서버→모바일→최종 전체E2E를 실행했다. 실제 종료 코드·시간·출력은 `docs/validation/m6-flight-final-checks.json`, `m6-flight-final-check-{1~8}.txt`다. 추가 검사 보완 후 타입/린트도 다시 exit0이다(`m6-flight-{typecheck,lint}-release.txt`).

| 명령·검사 | 실제 결과 |
|---|---|
| `python scripts/optimize-webtoon.py` | 통과 · 웹툰84종 / 지형34종 / 무기7종 |
| `python scripts/audit-webtoon.py` | 통과 · 웹툰168파일 및 소품90파일, 기존 지형·무기·효과·아이콘 감사 |
| `npm run typecheck` | 통과 · 최종 검사 보완 후 재통과 |
| `npm run lint` | 통과 · 최종 검사 보완 후 재통과 |
| `npm run test` | 통과 · **20파일107개** |
| `npm run validate:content` | 통과 · 36스테이지·아이 장면24·무기/보물 각7·황금 하트8 |
| `npm run build` | 통과 · 기존 Phaser500KB 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · **3,080,083 / 8,000,000바이트**, raw JS/CSS+S01 아트; HTTP/실기기 성능 제외 |
| `npm run dev -- --port 5175 --strictPort` | 자체 서버 실행·모바일 검사 후 종료 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175 docs/screenshots/m6-flight/mobile` | **exit0** · 실제 Edge CDP 터치, 폰/태블릿 오류0 |
| 새 비행 아트 추가 검사 | **4개 재통과** · 정상/누락×폰/태블릿, 최종 전체 실행에서도4개 통과 |
| `npm run test:e2e -- --reporter=list,json,html` | **exit0 · 57개 통과 · 52.4분**, 실패/flaky/skipped 각0 |
| 실행 전후 SHA256 | **930파일 전부 동일**, `m6-flight-final-runtime-hashes.json` |
| 보존 검사 | **259보존파일·이전27소품81파일·네이티브3장·SVG·고리 중심알파0 통과**, `m6-flight-preservation.json` |
| `git diff --check` | **exit0** · 최종 문서 포함, `m6-flight-diff-check.txt` |

최종 실행 환경은 `SINBAD_EVIDENCE_ROOT=docs/screenshots/m6-flight/final`, `PLAYWRIGHT_JSON_OUTPUT_NAME=docs/validation/m6-flight-e2e-final.json`, `PLAYWRIGHT_HTML_OUTPUT_DIR=docs/validation/m6-flight-final-report`, `PLAYWRIGHT_HTML_OPEN=never`다. 원시 JSON·콘솔은 `m6-flight-e2e-final.json`·`m6-flight-e2e-final-output.txt`, HTML은 `m6-flight-final-report/index.html`이다.

- 새4개 검사는 명시한 구간·보물·기지급 보상 저장 픽스처와 실제 키보드/메뉴 입력을 쓴다. 일반 공중 연은 재등장해 전투가 활성 상태이며, 순간 이동·보상 직접 호출·전투 끄기를 쓰지 않는다. S10/S33 첫 고리 수집·숨김, S10 금화0→25·재통과 추가0·새로고침 동일, 중간 체크포인트·보상/목표 재개, 일시정지, 고리8개/돌풍3개/파편5개의 실제 크기·반경·움직임/회전, S10→S33→S01→S10 캐시 전환과3파일 누락 SVG 복구를 통과했다. `m6-flight-{phone,tablet}-{normal,fallback}.json`에 실제 관찰/화면/요청이 있다. 돌풍 접근 후 HP100→91.6은 활성 적이 함께 있는 관찰이므로 돌풍 단독 피해량 실측으로 취급하지 않는다.
- 기존 비행2개도 최종 재통과했다. 실제 고리·금화·날개 전투·상단 경계·착륙 일지·저장, S33 움직이는 파편5개와 선택 고리/전투를 생략한 착륙을 확인했다. 소품 정상/전체 누락 검사는 신규3종까지 **17개 실제 맵·30소품**으로 확장해 통과했다. 맵 시작 캡처가 모든 화면 밖 소품을 보여 주는 것은 아니다.
- 별도 **새 게임·저장 주입 없는** 정상 키 입력으로 S01~S36을 **843초**에 완주했다. 일곱 무기/보물·엔딩, S16/S32 새로고침 보상 ID 유지, 엔딩 뒤 S01 재방문, 실행/HTTP 오류0을 확인했다. 원시 결과 바이트 동일 보존본은 `m6-flight-complete-journey.json`이며 자동 완주 시간을 어린이 플레이 시간으로 취급하지 않는다.
- 모바일은 폰844×390/태블릿1180×820에서 이동272/262px, 방향 반전, 동시 이동·점프(dx46/72,dy−114/−121), 첫 해골 처치·선장 첫 대화·오류0을 확인했다. `m6-flight-mobile-output.txt`, `m6-flight-mobile.json`에 실제 값이 있다. 비행 아트4개는 두 뷰포트의 키보드 검사이고 모바일 스모크는 S01 실제 CDP 터치 검사다.
- 첫 단위106통과/1실패는 위의 실제 고리 표시 연결을 고쳐107재통과했다. 첫 대상E2E2통과/4실패는 테스트가 실제 중간 체크포인트보다 앞인1400px에서 저장을 기대한 탓이다. 맵 위치+60으로 검사만 고쳐4재통과했다. 최종 화면에서 진입 카드가 사라지도록 대기를 추가한 뒤 타입/린트·전체57개를 다시 통과했다. 실패 원시 JSON·4화면/컨텍스트는 `m6-flight-target.json`, `docs/screenshots/m6-flight/first-target-failure/`에 보존했다. 디렉터리/패치/읽기 경로 초기 오류도 `m6-flight-development.json`에 남겼다.

### 실제 화면·남은 문제·다음 한 작업

최종 비행 증거 **41장**은 `docs/screenshots/m6-flight/final/m6-flight/`에 있다. 정상/누락×폰/태블릿28장(`{phone,tablet}-{normal,fallback}-{S10-ring-approach,S10-ring-collected,S10-gust-contact,S33-ring-approach,S33-ring,S33-debris,S10-revisit}.png`), 모바일6장(`mobile-{phone,tablet}-{start,swing,dialogue}.png`), 이번 신규 캠페인7장(`campaign-S{05,10,15,19,25,29,36}-route.png`)이다. 복사13장은 실제 원시 캡처와 바이트 동일하다. 디코딩 치수·원시/보존 경로·SHA256은 `m6-flight-final-screenshots.json`에 있다. 최종 실제 폰/태블릿 장면을 육안 확인했다. 이전 화면·보고서는 `m6-flight-before/` 등에 보존한다.

**미검증:** 실기기 폰/태블릿·iOS Safari·어린이 조작성·장시간 발열/FPS·실제 스피커 믹스·최종 사용자 아트 승인. Windows Edge 뷰포트/터치 모사만 실행했다. 이번3종 완료를 M6 전체·최종 아트 완료로 취급하지 않는다. **ART_DRAFT 유지**, 커밋·푸시·배포하지 않았다. 자체 서버/로그 모니터는 종료했으며 Ctrl+C exit1은 정리 결과다. Node TCP 검사에서5174/5175 모두ECONNREFUSED를 확인했다. Get-NetTCPConnection 접근 거부·Python 접속10035는 종료 판정에 쓰지 않았다.

**다음 한 작업: M6 공중 연(kite)의 행동 프레임.** 대기·공격 예고·공격·빛으로 저주가 풀리는4셀을 제작하고 S10/S33의 기존 공중 AI·투사체·날개 공격·안정 ID·누락 복구를 유지해 연결·검증한다. 세이렌·박쥐·정령·로크새의 남은 동작과 실기기 검수도 별도 미완료다.
<!-- M6_FLIGHT_STATUS_END -->

<!-- M6_INTERACT_STATUS_START -->
## 최신 실제 상태 · 2026-10-04 · M6 상호작용 소품 25종

### 구현 범위

**소품 구현·브라우저 검증 완료 / 최종 아트는 ART_DRAFT.** 조개 종·출항 종·황금 하트·열쇠·구조 장비 3종·피뢰 장치·위기 돛대·산호문·덩굴·횃불·화로·파도 밧줄·거울·항해일지·별 지도·등불·별 장치·화물·선물·보물 받침·월석·연꽃·엔딩 종을 내장 imagegen과 자체 `hero-webtoon.webp` 화풍 참조로 제작했다. 원본 25장을 원래 생성 경로와 `generated/props-m6/`에 바이트 동일 보존했다. 실제 원본 24장은1086×1448, 황금 하트는1087×1447이다. 전체 캔버스 비례 축소·투명 여백으로 원화 **384×512 PNG + 동일 RGBA 무손실 WebP**를 만들고, 최적화 스크립트로 **96×128 WebP** 런타임을 만들었다. 신규 런타임 합계 **126,782바이트**다. 1픽셀 비율 차이를 자르거나 다시 칠하지 않았다.

`worldProps.ts`에서 오브젝트 ID에 따라 출항 종·장비 3종·피뢰 장치/위기 돛대를 구별한다. 실제 해당 맵의 그림만 로드하고, 파일 누락은 보존 SVG로 복구한다. 기존 표시 크기(일반65.28×87.04, NPC 역할96×128 등)·보상/오브젝트 ID·저장·손 JSON·무기·물리·조작을 유지했다. 읽기 전용 `propArt.objects` 관찰을 추가했다. 전체 프롬프트·네이티브 경로·참조·선택·SHA256·실제 경계는 `world-props.sources.json`, 변환은 `world-props.measurements.json`, 출처·이용 조건·25개 파일 목록은 ART_PROMPTS/ASSET_REGISTER에 기록했다. README도 실제 적용 범위로 갱신했다.

### 실제 검사 결과

§5의 최종 검사 순서를 모두 실행했다. 명령별 exit code·출력은 `docs/validation/m6-interact-checks.json`, `m6-interact-check-{1~8}.txt`에 있다.

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-world-props.py` | 통과 · 기존2+신규25, 동일 RGBA 무손실 원화·네이티브 해시 |
| `python scripts/optimize-webtoon.py` | 통과 · 웹툰81종 / 지형34종 / 무기7종 |
| `python scripts/audit-webtoon.py` | 통과 · 웹툰162파일, 지형·무기·효과·아이콘 및 소품81파일 |
| `npm run typecheck` | 통과 · 마지막 검사 출력 경로 보완 후 재통과 |
| `npm run lint` | 통과 · 마지막 검사 출력 경로 보완 후 재통과 |
| `npm run test` | 통과 · **20파일106개** |
| `npm run validate:content` | 통과 · 36스테이지 / 아이 장면24 / 무기·보물 각7 / 황금 하트8 |
| `npm run build` | 통과 · 기존 Phaser500KB 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · **3,079,538 / 8,000,000바이트**, HTTP 오버헤드·실기기 성능 제외 |
| `npm run dev -- --port 5175 --strictPort` | 자체 서버 실행·모바일 검사 후 종료 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175 docs/screenshots/m6-interact/mobile` | **exit0** · 실제 Edge CDP 터치 폰/태블릿, 오류0 |
| 추가 상호작용 소품 E2E | **4개 재통과** · 정상/전체 누락 맵 검사, 정상/누락 장비·황금 하트 |
| `npm run test:e2e -- --reporter=list,json,html` | **exit0 · 53개 통과 · 47.4분**, 실패·재시도 성공(flaky)·건너뜀 각0 |
| 실행 전후 SHA256 | **911파일 전부 동일** · `m6-interact-final-runtime-hashes.json` |
| 보존본·기존 상자/하트 해시 | **252파일·네이티브27장·기존 원화/런타임6파일 통과**, `m6-interact-preservation.json` |
| `git diff --check` | **exit0** · 문서 정리 후 통과, CRLF 안내만 있음 |

전체 실행 환경은 `SINBAD_EVIDENCE_ROOT=docs/screenshots/m6-interact/final`, `PLAYWRIGHT_JSON_OUTPUT_NAME=docs/validation/m6-interact-e2e-final.json`, `PLAYWRIGHT_HTML_OUTPUT_DIR=docs/validation/m6-interact-final-report`, `PLAYWRIGHT_HTML_OPEN=never`다. 원시 JSON·콘솔 로그는 `m6-interact-e2e-final.json`·`m6-interact-e2e-final-output.txt`, HTML은 `m6-interact-final-report/index.html`에 있다. 실행 중 게임·에셋·빌드·검사911파일을 변경하지 않았다.

- 15개 실제 맵의 저장 픽스처로 신규25종의 로딩·크기·현재 맵 캐시와 전체 파일 누락 시 SVG 복구를 검사했다. 실제 연결과 화면 밖 오브젝트 정보는 관찰로 확인했으며, 시작 화면 캡처가 모든 소품을 화면에 보여 줬다는 의미는 아니다. `m6-interact-map-{normal,fallback}.json`에 오브젝트 ID·텍스처·표시 크기·화면 경로가 있다.
- S04에서는 실제 이동·상호작용으로 장비3종을 모으고 G01을 획득했다. 정상·누락 양쪽에서 최대HP100→110, 실제 HP68.8→110, XP+15, 재시작 후 추가XP0, 새로고침 보상 ID 유지가 통과했다(`m6-interact-rescue-{normal,fallback}.json`). 완료된 G01은 테스트 도우미가 다시 활성화하지 않는다. 실제 재입력의 황금 하트 중복 방지는 기존 M2 G02 검사에서도 통과했다. 픽스처 검사를 신규 캠페인으로 취급하지 않는다.
- 기존 상자·하트 정상/누락/재방문3개도 전체 실행에서 재통과했다. 메달 상자·일반/큰 하트 최초XP+2/+5·재시작 저장 유지·실제 HP94→100 회복, S01→S13→S01 캐시 전환을 확인했다(`m6-interact-chest-{play,fallback}.json`). 큰 하트의 정확한 +60 회복량을 이 캡처로 별도 실측했다고 주장하지 않는다.
- 별도 **새 게임·저장 주입 없는** 정상 키 입력으로 **S01~S36을1,000초**에 완주했다. 무기·보물 각7종·엔딩, S16/S32 새로고침 후 보상 ID 유지, 엔딩 뒤 S01 재방문, 실행/HTTP 오류0을 확인했다. 이번 원시 결과를 바이트 동일 보존한 `m6-interact-complete-journey.json`과 PLAYTEST_LOG에 기록했다.
- 모바일은 폰844×390/태블릿1180×820에서 각각252px 이동·방향 반전·첫 해골 처치·선장 대화·오류0을 확인했다. 되돌아가기226/236px. 상자 앞 점프 캡처는dx=0,dy=-110이므로 해당 캡처를 전진 동시 입력 성공으로 주장하지 않는다. 원시 출력·구조화 결과는 `m6-interact-mobile-output.txt`·`m6-interact-mobile.json`이다.
- 첫 유닛 검사105통과/1실패(S13 등불 가정), 첫 추가E2E2통과/1실패(NPC 소품 크기 가정)를 고쳐 재통과했다. `m6-interact-development.json`, `m6-interact-target.json`, `docs/screenshots/m6-interact/first-failure/`에 실패 화면·이유를 보존했다. 최초 아트 디렉터리 생성·패치 형식·읽기 경로 오류와 황금 하트의 1픽셀 원본 비율 차이 처리도 기록했다.

### 실제 화면·남은 문제·다음 한 작업

최종 증거 PNG **74장**은 `docs/screenshots/m6-interact/final/m6-interact/`(63장)과 `final/m6-props/`(11장)에 있다. 구성은 정상/누락 맵 시작30장, 장비·황금 하트8장, 모바일6장, 이번 신규 캠페인7장, 기존 실제 조작 화면12장, 상자·하트11장이다. 기존 실제 조작 화면에는 `play-S01-boss-cleared.png`, `play-S02-boomerang.png`, `play-S03-storm-crystal.png`, `play-S08-mirrors.png` 등이 있다. 복사25장은 원시 캡처와 바이트 동일하다. 실제 생성 경로·복사 경로·PNG 디코딩 치수·SHA256은 `m6-interact-final-screenshots.json`에 있다. 개발 재검사 화면은 `docs/screenshots/m6-interact/recheck/`, 모바일 원본은 `mobile/`, 이번 완주 원본은 `test-results/complete-journey-new-game--139b0-ntrols-and-no-injected-save/`다.

**미검증:** 실기기 폰/태블릿·iOS Safari(Windows Edge 모사만 실행), 어린이 플레이, 장시간 발열/FPS·실제 스피커 믹스, 사용자 최종 아트 승인. 앱 안 브라우저 연결은 privileged native bridge 사용 불가로 실행하지 못해 로컬 Edge를 사용했다. 이번25종 완료를 M6 전체·최종 아트 승인으로 처리하지 않는다. **ART_DRAFT 유지**, 커밋·푸시·배포하지 않았다. 자체 서버는 모두 종료했다. 개발 서버의 Ctrl+C 종료exit1은 검사 실패가 아닌 정리 결과다.

**다음 한 작업: M6 비행 고리·돌풍·낙하 파편의 남은 SVG 아트 교체.** 실제 `flightRing`·`stormCloud`·`debris` 표시 크기와 충돌 반경·움직임을 유지하고 S10/S33 실제 비행·누락 복구로 검증한다.
<!-- M6_INTERACT_STATUS_END -->

<!-- M6_PROPS_STATUS_START -->
## 최신 실제 상태 · 2026-10-04 · M6 보물 상자·회복 하트 웹툰 소품

### 구현 범위

- **소품 기능 구현·브라우저 검증 완료 / 최종 아트는 ART_DRAFT**. 내장 imagegen과 자체 `hero-webtoon.webp` 화풍 참조로 닫힌 목재·금색 보물 상자와 산호색 회복 하트를 제작했다. 실제 생성 PNG는 각 **1086×1448 RGBA**, 2장 모두 원래 생성 경로와 저장소 `generated/props/`에 바이트 동일 보존했다. 글자·잘림·피/상처 없음은 육안, 실제 투명 경계·원본 해시는 스크립트로 검사했다.
- 전체 캔버스를 균일 축소해 원화 **384×512 PNG + 동일 RGBA 무손실 WebP**를 저장했다. `SIZES`·`runtimeSize`에 `prop-chest`/`prop-heart` **96×128**을 등록했고 최적화 스크립트가 런타임을 출력한다. 상자 **3,872바이트**, 하트 **2,882바이트**, 합계 **6,754바이트**다. 프롬프트·실제 생성 경로·참조·해시·원화 경계는 `world-props.sources.json`, `world-props.measurements.json`에 있다. 출처·이용 조건은 `docs/ART_PROMPTS.md`, `docs/ASSET_REGISTER.md`에 기록했다.
- 현재 맵에 있는 기본 상자와 하트만 로드하고, 장면 이동 때 불필요한 소품 캐시를 제거한다. 원래 `chest`/`heart` SVG와 별도 이야기 소품 텍스처를 유지했다. 표시 사각형은 상자 65.28×87.04, 일반/큰 하트 34.56×46.08 / 48×64다. 회복량·획득 거리·상자/하트 보상 ID·저장 형식·무기·손 JSON·물리·의존성은 변경하지 않았다.
- 첫 누락 복구 검사에서 공통 대체 처리로 하트·상자가 사람 모양으로 생성되는 문제가 확인됐다. `prop-`는 그 처리를 건너뛰어 실제 보존 SVG로 복구하게 수정했다. 실패 화면과 원시 결과를 삭제하지 않았다. 검증용 읽기 전용 `propArt` 관찰과 실제 키 입력 E2E를 추가했다. 이전 아이콘·무기·초상 캡처의 조건식 경로도 새 증거 폴더 옵션을 따르도록 보완했다.

### 실제 검사 결과

§5 명령은 아래 순서대로 다시 실행했고 최종 추가 검사 후 typecheck·lint를 재실행했다. 명령별 exit code·출력은 `docs/validation/m6-props-checks.json`, `m6-props-check-{1~8}.txt`에 있다.

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-world-props.py` | 통과 · 생성 원본 해시·무손실 RGBA 동일 |
| `python scripts/optimize-webtoon.py` | 통과 · 웹툰 56종 / 지형 34종 / 무기 7종 |
| `python scripts/audit-webtoon.py` | 통과 · 웹툰 112파일; 지형·무기·효과·터치 아이콘 및 추가 소품 6파일 디코딩/경계/원화 검사 |
| `npm run typecheck` | 통과 · 마지막 검사 추가 후 재실행 |
| `npm run lint` | 통과 · 마지막 검사 추가 후 재실행 |
| `npm run test` | 통과 · **20파일, 104개** |
| `npm run validate:content` | 통과 · 36스테이지 / 아이 장면 24개 / 무기·보물 각 7종 / 황금 하트 8개 |
| `npm run build` | 통과 · 기존 Phaser 500KB 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · **3,072,519 / 8,000,000바이트**, S01 소품·아이콘 포함; 실기기 성능/HTTP 오버헤드 제외 |
| `npm run dev -- --port 5175 --strictPort` | 자체 서버 실행 후 모바일 검사 완료, 서버 종료 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175 docs/screenshots/m6-props/mobile` | **exit0** · 폰/태블릿 실제 CDP 터치, 오류 0 |
| 추가 소품 E2E 재검사 / 맵 재방문 검사 | **2개 통과 / 1개 통과** · `m6-props-recheck.json`, `m6-props-cache.json` |
| `npm run test:e2e -- --reporter=list,json,html` | **exit0 · 49개 통과 · 41.7분**, 실패·재시도 성공(flaky)·건너뜀 각 0 |
| 실행 전후 SHA256 | **755파일 전부 동일** · `m6-props-final-runtime-hashes.json` |
| `git diff --check` | 파일 끝 빈 줄을 고친 뒤 통과 · CRLF 안내만 있음 |

전체 실행에는 `$env:SINBAD_EVIDENCE_ROOT='docs/screenshots/m6-props/final'`, `$env:PLAYWRIGHT_JSON_OUTPUT_NAME='docs/validation/m6-props-e2e-final.json'`, `$env:PLAYWRIGHT_HTML_OUTPUT_DIR='docs/validation/m6-props-final-report'`, `$env:PLAYWRIGHT_HTML_OPEN='never'`를 지정했다. 원시 JSON은 `m6-props-e2e-final.json`, HTML은 `m6-props-final-report/index.html`이다. 실행 중 코드·에셋·빌드·검사 755파일이 모두 동일했고, 실행 후 `audit-webtoon.py`의 파일 끝 빈 줄만 제거해 아트 감사와 diff 검사를 재통과했다. 게임·원본·런타임에는 후속 변경이 없다(`m6-props-final-postcheck.json`).

- 추가 소품 검사는 명시한 S01 체크포인트·보상 픽스처로 폰 844×390 / 태블릿 1180×820에서 실제 이동·상호작용·피격·획득·일시정지 재시작·새로고침을 실행했다. 그림 크기, 상자 메달 획득, 최대 HP에서 일반 XP +2 / 큰 XP +5, 재시작 중복 XP 0, 저장 보상 ID 유지, 실제 피격 후 회복이 통과했다. 누락 요청을 의도적으로 차단한 경우 보존 SVG로 같은 조작을 통과했다. 아트 픽스처 검사를 새 게임 캠페인 완주로 취급하지 않는다.
- S01→S13→S01 지도 버튼을 실제로 눌러 소품이 없는 구간의 캐시 해제와 재방문 시 재로드를 확인했다. 유닛 검사는 별도 `cargo` 이야기 텍스처 유지·조건부 로딩·파일 누락 키 복구를 검사했다.
- 별도 **새 게임·저장 주입 없는** 정상 키 입력 검사에서 S01~S36을 **815초**에 완주했다. 무기 7종·보물 7개·엔딩, S16/S32 새로고침 재개 시 보상 ID 유지, 엔딩 뒤 S01 재방문을 확인했다. 실행/HTTP 오류는 0이다. `m6-props-complete-journey.json`은 이번 완주 원시 결과를 바이트 동일 보존한 파일이다. 아트 픽스처와 실제 신규 캠페인을 구별한다.
- 첫 추가 실행은 **정상 1개 통과 / 누락 1개 실패**였다(`m6-props-target.json`, `m6-props-first-failure/`). 위의 공통 대체 처리를 고친 뒤 2개 재통과했다. 이전 정상 증거도 `m6-props-first-play.json`로 보존했다. 기존 소스·화면·보고서 **226개** 보존본 SHA256이 모두 동일하다(`m6-props-backup-verification.json`).
- 모바일 검사에서 양쪽 252px 이동·드래그 방향 반전·첫 해골 처치·선장 대화·오류 0을 확인했다. 되돌아가기 위치는 폰 234 / 태블릿 221px다. 상자 앞 점프 `dx=0, dy=-110`이므로 그 캡처를 전진 동시 입력 성공으로 주장하지 않는다. 원시 출력과 관찰 한계는 `m6-props-mobile-output.txt`, `m6-props-mobile.json`에 있다.
- 최종 전체 실행에서도 소품 정상·누락·재방문 3개를 재통과했다. 일반/큰 하트 표시 크기와 최대 HP에서 첫 XP +2/+5, 상자 획득/저장/중복 방지를 확인했다. 실제 피격 후 회복은 정상·누락 모두 **HP 94→100**으로 최대 HP에 제한됐다(`m6-props-play.json`, `m6-props-fallback.json`). 이 브라우저 결과만으로 큰 하트의 정확한 +60 회복량까지 별도 실측했다고 주장하지 않는다.

### 실제 스크린샷·남은 문제·다음 한 작업

- 최종 PNG 모음 **24장**은 `docs/screenshots/m6-props/final/m6-props/`에 있다. 정상 폰/태블릿 6장 `{phone,tablet}-{chest,normal-heart,large-heart}.png`, 누락 3장 `phone-fallback-{chest,normal-heart,large-heart}.png`, 실제 회복 2장 `{fallback-,}actual-healing.png`, 모바일 6장 `mobile-{phone,tablet}-{start,swing,dialogue}.png`, 이번 새 게임 완주 7장 `campaign-{S05,S10,S15,S19,S25,S29,S36}-route.png`다. 실제 생성 경로·최종 경로·PNG 디코딩/치수·SHA256은 `m6-props-final-screenshots.json`에 있다. 모바일·완주 모음은 실제 캡처의 바이트 동일 복사본이다.
- 재검사 화면은 `docs/screenshots/m6-props/recheck/m6-props/`, 모바일 원 캡처는 `docs/screenshots/m6-props/mobile/`, 이번 새 게임 완주 원 캡처는 `test-results/complete-journey-new-game--139b0-ntrols-and-no-injected-save/`다. 첫 복사 시 이전 경로를 가정해 FileNotFoundError가 났으나 실제 `info.outputPath()` 캡처 위치를 확인해 7장 모두 보존했다. 검사 실패나 캡처 누락으로 처리하지 않는다.
- **미검증:** 실기기 폰/태블릿·iOS Safari(Windows Edge 에뮬레이션만 실행), 어린이 플레이, 장시간 발열/FPS·실제 스피커 믹스, 사용자 최종 아트 승인. 계속 **ART_DRAFT**다. 이번 소품 2종 완료를 M6 전체/최종 아트 승인으로 취급하지 않는다. 커밋·푸시·배포는 하지 않았다.
- **다음 한 작업: M6 S02 조개 종·S01 출항 종 웹툰 소품 교체.** 실제 사용되는 캔버스·상호작용·보상 ID를 유지해 제작·연결·검증한다.
<!-- M6_PROPS_STATUS_END -->

<!-- A8_STATUS_START -->
## 최신 실제 상태 · 2026-10-04 · Codex A8 터치 UI 아이콘

### 구현 범위

- **기능 구현·브라우저 검증 완료 / 최종 아트는 ART_DRAFT**. 내장 imagegen으로 점프·대화·살펴보기·출발·날개 공격·불꽃·다리·방패·새벽 9종을 제작했다. 자체 `hero-webtoon.webp`를 화풍 참조로 사용했다. 첫 점프 후보의 아래쪽 화살표가 모호해 재생성했으며 생성 PNG **10개(선택 9/미선택 1)**를 바이트 동일 보존했다. 글자·로고·피/상처 없음과 투명 바깥 경계를 확인했다.
- 실제 생성 원본은 1254×1254다. 캔버스 전체를 균일 축소해 `art-source/webtoon/ui-*.png`와 동일 RGBA 무손실 WebP를 **512×512**로 저장했다. `SIZES`·`runtimeSize` 등록 후 최적화 스크립트가 문서 A8 규격인 **128×128 투명 PNG** 9개를 `public/assets/webtoon/`에 출력한다. 합계 **182,840바이트**. 전체 프롬프트·선택·해시는 `touch-icons.sources.json`, 변환·경계는 `touch-icons.measurements.json`에 있다. 기존 원본과 미선택 후보를 삭제하지 않았다.
- `touch.ts`의 점프·문맥 행동·`setSkill()`을 실제 `<img>`로 연결했다. 보물 ID `flamePulse/moonBridge/lotusShield/dawnWave`로 아이콘을 고른다. 버튼의 행동 ID·접근성 이름·포인터 처리를 유지하며 그림은 회전하지 않는다. 누락 시 기존 기호로 복구하고 같은 능력의 HUD 갱신에서는 이미지 노드를 유지한다. 무기 그림·손 JSON·판정·보상/저장 ID·엔진·의존성은 유지했다.
- 출처·이용 조건·파일은 `docs/ART_PROMPTS.md`, `docs/ASSET_REGISTER.md`에 기록했다. 검증 경로를 선택할 수 있는 `art-evidence.ts`와 모바일 출력 폴더 옵션을 추가했다. 기존 적 화면 덮어쓰기에서 발생한 Windows 파일 오류는 새 실행 폴더로 분리해 재검증했다. 그림 표시 전용 72px 비교 화면을 실제 게임 조작 성공으로 취급하지 않는다.

### 실제 검사 결과

§5 순서를 실행했으며 검사 타입·관찰 시점·캡처 경로 보완 후 typecheck·lint와 전체 E2E를 다시 실행했다. 원시 결과·실패 이력·관찰 한계는 `docs/validation/a8-checks.json`, `a8-development.json`에 있다.

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-touch-icons.py` | 통과 · 생성 PNG 10개 해시, 선택 9개 원화 PNG/WebP 동일 RGBA |
| `python scripts/optimize-webtoon.py` | 통과 · 웹툰 54종(아이콘 PNG 9개 포함) / 지형 34종 / 무기 7종 |
| `python scripts/audit-webtoon.py` | 통과 · 웹툰 108 / 지형 68 / 무기 14파일; 추가 효과 14 / 아이콘 27개 실제 디코딩·경계·동일 RGBA 검사 |
| `npm run typecheck` | 통과 · 최종 검사 관찰/출력 경로 보완 후 재실행 |
| `npm run lint` | 통과 · 최종 검사 관찰/출력 경로 보완 후 재실행 |
| `npm run test` | 통과 · **19파일, 103개** |
| `npm run validate:content` | 통과 · 36스테이지 / 아이 장면 24개 / 무기·보물 각 7종 / 황금 하트 8개 |
| `npm run build` | 통과 · 기존 Phaser 500KB 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · 첫 화면 **3,064,495 / 8,000,000바이트**; 보수적으로 아이콘 9개 포함, HTTP 오버헤드·실기기 성능 제외 |
| `npm run dev -- --host 127.0.0.1 --port 5175 --strictPort` | 자체 서버 실행 후 모바일 검사 완료, 서버 종료 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175 docs/screenshots/art-a8` | **exit0** · 폰 844×390 / 태블릿 1180×820 실제 터치, 아래 관찰 한계 포함 |
| `npm run test:e2e -- --reporter=list,json,html` | **exit0 · 46개 통과 · 41.9분**; 실패·재시도 성공(flaky)·건너뜀 각 0 |
| `git diff --check` | 통과 · CRLF 안내만 있음 |
| 실행 전후 SHA256 | **실제 738파일 전부 동일** · `a8-final-2-runtime-hashes.json` |

최종 전체 실행에는 PowerShell에서 `$env:SINBAD_EVIDENCE_ROOT='docs/screenshots/art-a8/final'`, `$env:PLAYWRIGHT_JSON_OUTPUT_NAME='docs/validation/a8-e2e-final.json'`, `$env:PLAYWRIGHT_HTML_OPEN='never'`를 지정했다. 일부 조건식 버튼/무기 캡처는 기존 경로를 사용하며 실제 경로는 원시 보고서에 남긴다. A8 최종 모음은 그 경로의 파일을 바이트 동일 복사한 것이며 이전 증거를 삭제하지 않았다.

- 추가 A8 검사는 명시한 구간·장비 저장 데이터를 준비해 **실제 CDP 터치와 메뉴 탭**으로 검사한다. 폰/태블릿 정상 아이콘 9개와 128px 디코딩·회전 없음·버튼 안 표시·접근성 이름, 이미지 중앙 터치, 능력 4종 MP 소비와 선택/보상 재개, 선장 대화, S26 다리 사용/재개, S01 출발→S02, 날개 공격 피해 **22**가 통과했다. 최종 동시 이동·점프는 폰 `dx=27, dy=-77.25`, 태블릿 `dx=32, dy=-83.75`다. 이미지 노드를 유지하며 누락한 아이콘 9개는 기호로 복구해 같은 실제 행동을 통과했다. 정상 실행 오류와 의도한 PNG 요청 차단을 구별했다. `a8-touch-icons.json`, `a8-touch-fallback.json`에 있다.
- 별도 **새 게임·저장 주입 없는** 완주 E2E가 S01~S36을 정상 키 입력으로 완료했다. S36까지 **829초**, 무기 7종·보물 7개·엔딩, S16/S32 재개 시 보상 ID 동일, 엔딩 뒤 S01 재방문을 확인했다. 브라우저 실행·HTTP 오류는 **0**이다. `a8-complete-journey.json`은 이번 원시 결과의 바이트 동일 보존본이다.
- 모바일 스크립트는 양쪽 오른쪽 **252px** 이동·드래그 방향 반전·첫 해골 처치·선장 대화·오류 0을 기록했다. 되돌아가기 위치는 폰 228 / 태블릿 221px다. 상자 앞 점프는 양쪽 `dx=0, dy=-110`이므로 **그 캡처를 전진 동시 입력 성공으로 주장하지 않는다**. 별도 A8 실제 터치 검사에서 위의 전진/상승을 확인했다. `a8-mobile-second-output.txt`, `a8-mobile.json`, `a8-mobile-screenshots.json`을 보존했다.
- 첫 typecheck는 추가 검사의 HTML 이미지 타입 오류로 실패해 검사만 고쳤다. 첫 모바일 실행은 기존 `mobile-phone-swing.png` 저장 중 Windows `UNKNOWN` 오류로 실패했다. 새 출력 폴더에서 재실행해 exit0을 확인했다. 첫 아이콘 추가 검사 2개는 터치 후 450ms 합성 클릭 보호에 걸렸고, 두 번째 2개는 검사에서 적 반대로 방향을 바꾼 날개 공격으로 실패했다. 대기·실제 방향 입력을 고쳐 세 번째 추가 2개가 통과했다. 세 원시 JSON과 실패 화면을 보존했다.
- 첫 전체 실행은 **14개 통과·1개 실패 뒤 중단**, 31개 미완료였다. 완성 원시 전체 JSON은 생성되지 않았으며 `a8-first-full-interrupted.json`에 이 한계를 기록했다. 화면·코드로 상태 대기와 다음 읽기의 시점 차이를 **추정**해 같은 순간의 스냅샷을 반환하도록 검사만 보완했다. 이어진 적 추가 검사는 **1개 통과·1개 실패**였고 실제 오류는 기존 `tablet-bandit-defeated.png` 저장 중 Windows `UNKNOWN`이었다(`a8-enemy-target.json`). 첫 전체 실패의 세부 원인은 확정하지 않는다. 새 경로 적용 스크립트의 Python `newline` 인자 오류를 UTF-8 바이트 쓰기로 수정했고 적용 전 추가 실행은 결과 없이 중단했다. 이후 새 폴더의 적 추가 **2개 재통과**, 최종 전체 **46개 재통과**를 확인했다. 실패·중단 기록과 화면을 삭제하지 않았다.
- 기존 화면·보고서·수정 대상 소스 **476개**를 `docs/screenshots/art-a8-before/`, `docs/validation/a8-before/`에 보존하고 모두 해시를 재확인했다. 추가 검증 경로 변경 전 소스 8개도 별도 보존·재확인했다. 생성 원본 10개 해시도 동일하다. `a8-backup-verification.json`에 있다. 최종 원시 전체 보고서는 `a8-e2e-final.json`, HTML은 `a8-final-full-report/index.html`이다.

### 최종 스크린샷

`docs/screenshots/art-a8/final/art-a8/`의 최종 PNG 모음은 **42장**이다(실제 버튼 27 + 표시 전용 비교 2 + 모바일 6 + 이번 새 게임 완주 7). 원시 경로·모음 경로·SHA256은 `docs/validation/a8-final-screenshots.json`에 있다.

- 폰/태블릿 9종: `{phone,tablet}-ui-{jump,talk,inspect,depart,wing,flame,bridge,shield,dawn}.png`.
- 72px 표시 비교: `phone-72px-icons.png`, `tablet-72px-icons.png`.
- 누락 복구: `phone-fallback-ui-{jump,talk,inspect,depart,wing,flame,bridge,shield,dawn}.png`.
- 모바일: `mobile-{phone,tablet}-{start,swing,dialogue}.png`.
- 새 게임 완주: `campaign-S05-route.png`, `campaign-S10-route.png`, `campaign-S15-route.png`, `campaign-S19-route.png`, `campaign-S25-route.png`, `campaign-S29-route.png`, `campaign-S36-route.png`.
- 실패/중단 증거: `docs/screenshots/art-a8/first-target-failed/`, `second-target-failed/`, `first-full-interrupted/failure/`, `enemy-target-failed/`. 적 재검증의 새 화면은 `enemy-recheck-final/art-a3/`, 전체 회귀의 새 화면은 `final/art-a3/` 등이다.

### 남은 문제·미검증·다음 한 작업

- **미검증:** 실기기 폰/태블릿·iOS Safari(Windows Edge의 뷰포트/터치 에뮬레이션만 실행), 어린이 조작성·아이콘 이해도(실제 어린이 플레이 없음), 장시간 발열/FPS·실제 스피커 믹스(별도 실기 측정 없음), 사용자 최종 아트 승인(승인 전이므로 ART_DRAFT 유지).
- A1~A8 코드 연결·브라우저 검증 완료를 M6 전체 또는 최종 아트 승인 완료로 취급하지 않는다. 보물 상자·회복 하트 등 실제 장면의 간이 벡터 소품이 남아 있다. 이번 작업에서 **커밋·푸시·배포는 하지 않았다**.
- **다음 한 작업: M6 보물 상자·회복 하트 웹툰 소품 교체.** 기존 `chest`/`heart`의 실제 사용 크기·보상/회복 ID와 동작을 유지해 제작·연결·검증한다.
<!-- A8_STATUS_END -->

<!-- A7_STATUS_START -->
## 최신 실제 상태 · 2026-10-04 · Codex A7 투사체·효과

### 구현 범위

- **기능 구현·브라우저 검증 완료 / 최종 아트는 ART_DRAFT**. 내장 imagegen으로 투사체 4종과 효과 3종, 총 34프레임을 생성·연결했다. 프로젝트 자체 `hero-webtoon.webp`를 화풍 참조로 사용했고 생성 PNG 7개와 기존 원본을 보존했다. 셀 경계·글자·피/상처를 확인했다. 프롬프트·출처·이용 조건은 `docs/ART_PROMPTS.md`, `docs/ASSET_REGISTER.md`에 기록했다.
- 생성 원본은 투사체 1254×1254 / 효과 1536×1024다. 완전한 정사각 셀을 균일 축소하고 투명 여백을 더해 `art-source/webtoon/`에 1024×1024(2×2) / 1536×1024(3×2) PNG와 동일 RGBA 무손실 WebP를 만들었다. 런타임은 128×128(셀 64) / 384×256(셀 128), 7개 합계 **93,582바이트**다. 프롬프트·생성 해시·변환·경계는 `effects.sources.json`, `effects.measurements.json`에 있다.
- `SIZES`·`runtimeSize`·매니페스트와 현재 구간 로드를 연결했다. 투사체를 Sprite로 표시하되 기존 판정(가로 34px, 세로 42/48px), 피해 14, 발사 속도·패턴·4초 수명·보상/저장 ID를 유지했다. 게임 시계로 4프레임을 반복하고 타격·정화·항복은 6프레임 후 제거한다. 일시정지는 시계를 멈추며 연출 줄이기는 투사체를 0셀에 고정하고 새 효과를 생략한다. 누락 시 기존 원/문자·별/빛 입자로 복구한다. 효과 풀은 24개로 제한하고 장면 종료 때 비운다.

### 실제 검사 결과

§5 순서를 실행했으며, 최종 검사 관찰 보완 후 typecheck·lint·전체 E2E를 다시 실행했다. 명령별 실제 결과와 한계는 `docs/validation/a7-checks.json`에 있다.

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-effects.py` | 통과 · 생성 PNG 7개 SHA256 보존, 무손실 원화 RGBA 동일 |
| `python scripts/optimize-webtoon.py` | 통과 · 웹툰 45종 / 지형 34종 / 무기 7종, A7 런타임 93,582바이트 |
| `python scripts/audit-webtoon.py` | 통과 · 웹툰 90 / 지형 68 / 무기 14파일; 추가 효과 14개 디코딩·역할별 34셀 경계·생성/원화 검사 |
| `npm run typecheck` | 통과 · 최종 E2E 관찰 보완 뒤 재실행 |
| `npm run lint` | 통과 · 최종 E2E 관찰 보완 뒤 재실행 |
| `npm run test` | 통과 · 18파일, 101개 |
| `npm run validate:content` | 통과 · 36스테이지 / 아이 장면 24개 / 무기·보물 각 7종 / 황금 하트 8개 |
| `npm run build` | 통과 · 기존 Phaser 500KB 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · 첫 화면 **2,880,137 / 8,000,000바이트**; HTTP 오버헤드·실기기 성능 측정 제외 |
| `npm run dev -- --host 127.0.0.1 --port 5175` | 자체 Vite 서버 실행 후 모바일 검증 완료, 서버 종료 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175` | exit0 · 폰 844×390 / 태블릿 1180×820 실제 터치, 아래 관찰 한계 포함 |
| `npm run test:e2e -- --reporter=list,json,html` | **exit0 · 44개 통과 · 38.4분**; 실패·재시도 성공(flaky)·건너뜀 각 0 |
| `git diff --check` | 통과 · CRLF 변환 안내만 있음 |
| 실행 전후 SHA256 | **실제 684파일 전부 동일** · `a7-final-runtime-hashes.json` |

- 추가 A7 E2E는 준비한 구간·장비·S02 조개 저장 데이터로 실제 조작을 검사한다. 폰/태블릿의 4종 투사체 반복·속도·수명·좌우/조준, 정지·연출 줄이기·보스 처치 후 재개, 6프레임 타격/정화/항복과 제거, 의도적으로 누락한 7개 시트의 기존 표현·피해·보상 재개가 통과했다. 정상 실행 오류와 의도한 HTTP 차단을 구별했다. 보고서는 `a7-projectiles.json`, `a7-effects.json`, `a7-effects-fallback.json`이다.
- 별도 **새 게임·저장 데이터 주입 없는** 완주 E2E가 S01~S36을 정상 키 입력으로 모두 통과했다. 36개 구간 완료까지 **805초**, 무기 7종·보물 7개·엔딩, S16/S32 재개 시 보상 ID 동일, 엔딩 뒤 S01 재방문을 확인했다. 브라우저 실행·HTTP 오류는 0이다. 실제 결과는 `a7-complete-journey.json`이다.
- 모바일 스크립트에서 양쪽 모두 오른쪽 252px 이동·드래그 방향 반전·첫 해골 처치·선장 대화가 확인됐다. 되돌아가기 226/223px, 상자 앞 점프 `dy=-110`이었다. **달리며 점프의 `dx=0`이므로 해당 캡처를 전진 동시 입력 성공으로 주장하지 않는다.** 별도 전체 E2E의 터치 입력 조합 검사는 통과했다. 원래 출력 `a7-mobile-output.txt`, 파싱 결과 `a7-mobile.json`, 캡처 해시 `a7-mobile-screenshots.json`을 보존했다.
- 첫 추가 E2E는 3개 통과했다(`a7-first-target.json`). 첫 전체 실행은 8개 통과·투사체 관찰 1개 실패 뒤 중단했고 35개 미완료였다. 완성된 원시 전체 JSON은 생성되지 않았다(`a7-first-full-interrupted.json`). 실패 화면과 코드로 쿠우라 이동 후 발사를 관찰하는 시점 문제를 **추정**했다. 실제 위치와 새 공격 예고를 기다리도록 **검사만** 보완한 뒤 추가 3개 재통과(`a7-second-target.json`), 최종 전체 44개 재통과를 확인했다. 첫 실행의 실패 화면·보고서·684파일 동일 해시는 삭제하지 않았다.
- 기존 화면·보고서 **380개**를 `docs/screenshots/art-a7-before/`, `docs/validation/a7-before/`에 바이트 동일 보존했고 마무리 때 해시를 재확인했다. 최초/보완 추가 검사와 중단 전체 실행의 캡처도 별도 하위 폴더에 보존했다. 최종 원시 전체 보고서는 `docs/validation/a7-e2e-full.json`, HTML은 `docs/validation/a7-final-full-report/index.html`이다.

### 최종 스크린샷

`docs/screenshots/art-a7/`의 최종 루트 PNG는 **36장**이다(아트/모바일 29장 + 이번 완주 7장). 경로·실제 SHA256은 `docs/validation/a7-final-screenshots.json`에 있다.

- 폰/태블릿 투사체: `phone-projectile-siren-wave.png`, `tablet-projectile-siren-wave-right.png`, `phone-projectile-siren-note.png`, `tablet-projectile-kite-wind.png`, `tablet-projectile-kuura-orb.png`.
- 처치 효과: `phone-S01-skeleton-defeat.png`, `phone-S04-crab-defeat.png`, `phone-S11-bandit-defeat.png` 및 대응 `tablet-*.png`.
- 누락 복구·연출 줄이기: `phone-S02-missing-sheets.png`, `phone-S31-missing-sheets.png`, `phone-S11-fallback-defeat.png`, `phone-reduced-projectile-siren-wave.png`, `tablet-reduced-projectile-siren-wave.png`.
- 이번 새 게임 완주: `campaign-S05-route.png`, `campaign-S10-route.png`, `campaign-S15-route.png`, `campaign-S19-route.png`, `campaign-S25-route.png`, `campaign-S29-route.png`, `campaign-S36-route.png`. 원시 캡처를 바이트 동일 복사했으며 `a7-campaign-screenshots.json`에 출처·해시를 기록했다.
- 모바일: `mobile-phone-start.png`, `mobile-phone-swing.png`, `mobile-phone-dialogue.png`, `mobile-tablet-start.png`, `mobile-tablet-swing.png`, `mobile-tablet-dialogue.png`.
- 첫 전체 실패 증거: `first-full-interrupted/failure/test-failed-1.png`, `first-full-interrupted/failure/error-context.md`.

### 남은 문제·미검증·다음 한 작업

- **미검증:** 실기기 폰/태블릿·iOS Safari(Windows Edge의 뷰포트/터치 에뮬레이션만 실행), 어린이 조작성(실제 어린이 플레이 없음), 장시간 발열/FPS·실제 스피커 믹스(별도 실기기 측정 없음), 사용자 최종 아트/애니메이션 승인(승인 전이므로 ART_DRAFT 유지).
- A7의 기능·브라우저 검사 완료를 최종 아트 승인으로 취급하지 않는다. 기존 간이 UI 아이콘 등 남은 아트도 유지한다. 이번 작업에서 커밋·푸시·배포는 하지 않았다.
- **다음 한 작업: A8 터치 UI 아이콘.** 점프·대화·살펴보기·출발·날개 공격·보물 능력 4종을 제작하고 기존 접근성 이름·행동 ID와 실제 터치 동작을 유지해 연결·검증한다.
<!-- A7_STATUS_END -->

## Git 동기화 · 2026-10-03 · 사용자 요청 커밋·푸시

- 사용자 요청으로 누적 모바일 개선과 A1~A6 코드·런타임·생성 원본·검증 보고서/스크린샷을 `99728a39e767bd7fa4cbdf09d1ee2211f8b6a298` (`feat: polish mobile controls and integrate webtoon art A1-A6`)에 커밋했다. 1,166파일 변경이며 기존 사용자 변경과 아트 원본을 보존했다.
- `git fetch origin`에서 기준 `0b2c715`가 로컬과 일치함을 확인하고, `git push origin main`이 종료 코드0으로 `0b2c715..99728a3 main -> main`을 완료했다. 강제 푸시는 하지 않았다.
- 커밋 전후 검증 당시 실제438파일의 SHA256이 모두 동일했다. 이번 Git 작업에서 게임 코드를 바꾸거나 전체 검사를 다시 실행하지 않았다. A6에서 실제 실행한 단위96개·E2E41개 통과/36스테이지 완주 기록을 유지한다. `git diff --cached --check`도 통과했다.
- Python 캐시는 Git에서 제외했다. 기존7개 무기 SVG의 측정 해시가 Windows 체크아웃에서도 유지되도록 해당 경로의 LF 규칙을 추가했고, 실제 Git 인덱스7개 해시가 측정값과 동일함을 확인했다. 검사 JSON 끝의 불필요한 빈 줄만 정리했으며 관찰 데이터는 유지했다.
- **ART_DRAFT 유지**. 실기기/iOS/어린이 조작성/최종 아트 승인은 여전히 미검증이며 다음 한 작업은 A7 투사체·효과다. 별도 배포 명령은 실행하지 않았다. 원격 연결에 의한 자동 배포의 실행 여부와 결과는 **미검증**(이번 요청은 Git 동기화이며 배포 상태 조회/검증은 실행하지 않음)이다.

## 최신 실제 상태 · 2026-10-03 · Codex A6 무기7종

### 구현 범위

- 작업 지침3문서 전체와 명세의 웹툰·전투·무기·검수 규칙을 확인해 다음 작업 A6를 진행했다. 기존 사용자 변경·Phaser 3.90.0·의존성/lockfile·저장 형식·W01~W07 ID·손 JSON·판정·공격 시간·표시 크기/회전 규칙을 유지했다. 커밋·push·배포 없음.
- 내장 imagegen과 프로젝트 자체 hero-webtoon/기존 SVG 참조로 여행자의 곡도·바람 부메랑·불꽃 곡도·폭풍의 창·파도의 활·달빛 방망이·새벽의 검7종을 생성했다. 실제 가로 원본1983×793/활887×1774이며 생성8개(선택7/미선택1)를 바이트 동일 보존했다. 부메랑의 높이가 큰 첫 V자 후보는 낮고 넓은 형태로 다시 생성했다. 원본 이미지와 기존 SVG7개를 삭제하지 않았다.
- `pack-weapons.py`가 완전한 생성 알파를 보존하며 균일 축소·위치 조정만 적용해 원본640×256/활320×640의 PNG와 동일 RGBA 무손실 WebP7개를 만든다. 실제 원본 손잡이 측정·코드 회전 중심·변환·경계·SVG 해시는 `art-source/weapons/weapons.measurements.json`, 전체 프롬프트/참조/선택/크기/생성 해시는 `weapons.sources.json`이다. 덧칠·알파 추출·실루엣 자르기·비율 늘이기는 하지 않았다.
- `SIZES`/`runtimeSize`에 같은 게임 키를 등록해160×64/활80×160 런타임7종24,518바이트를 만든다. Phaser의 손 장착/교체 표시와 HUD·장비·터치 아이콘이 새 WebP를 사용한다. 파일 누락 시 기존 SVG로 복구하며 양쪽 무기 파일이 없으면 무기 그림만 숨기고 실제 공격은 유지한다. A1의 JSON 손 좌표·`weaponLooks`·휘두르기·기존 화살/부메랑 투사체는 유지한다.
- `docs/ART_PROMPTS.md`/`docs/ASSET_REGISTER.md`에 실제 출처·파일·크기·프롬프트·손잡이/변환을 기록했다. **ART_DRAFT 유지**. 기능 구현/브라우저 검증과 사용자 최종 아트 승인은 구별한다.

### 실제 검사 결과

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-weapons.py` | 통과 · 7무손실 RGBA 동일, 생성8개 바이트 보존 |
| `python scripts/optimize-webtoon.py` | 통과 · 기존 웹툰38종/4014KiB·지형34종/71,178바이트·무기7종/24,518바이트 |
| `python scripts/audit-webtoon.py` | 통과 · 기존76일러스트·68지형 파일, 새14무기 파일·투명 경계·불투명 손잡이·8생성/7SVG 해시 |
| `npm run typecheck` | 통과 · 최종 검사 보완 뒤 |
| `npm run lint` | 통과 · 최종 검사 보완 뒤 |
| `npm run test` | 통과 · 17파일96개, 파일 누락 복구·7측정 회전 중심/크기 등록 포함 |
| `npm run validate:content` | 통과 · 36스테이지·24장면·7무기·7보물·8황금 하트 |
| `npm run build` | 통과 · 기존 Phaser500KB 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · 2,803,857 / 8,000,000바이트(2.80MB), WebP7개/SVG 대체물 포함 |
| `npm run dev -- --port 5175 --strictPort` | 실행 통과 · 소유한 로컬 서버, E2E는별도5174 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175` | 통과(exit0) · 최종폰/태블릿 우측252/257px·방향 전환·점프dy−110·첫 해골·선장 첫 대사·오류0 |
| `node scripts/check-action-art.mjs http://127.0.0.1:5175 A6` | 통과(exit0) · 7무기×좌우×2터치 화면·JSON 손 위치·6행동/6NPC초상·열린 공간 동시 터치dx+52/dy−105.58·오류0 |
| `npm run test:e2e -- tests/e2e/weapon-art.spec.ts` | 통과(exit0) · 최종2개/2.1분, 실제7이미지 요청·28좌우 포즈/아이콘·7파일 차단/14SVG포즈·전투 보상·저장 재개 |
| `npm run test:e2e` | 통과(exit0) · 최종41개/37.06분, 실패·불안정·건너뜀0. 새 게임36스테이지 무주입 완주820초 포함 |
| `python scripts/snapshot-art-validation.py finish a6` | 통과 · 전체 실행 전후 실제438파일 SHA256 모두 동일 |
| `git diff --check` | 통과 · 최종 문서 포함, 의존성/lockfile 변경 없음 |

초기 빌드는 추가 검사에서 전투 도우미의 인수를3개 전달해 타입 오류가 났고, 첫 추가 E2E는 JSON import attribute가 빠져 실행되지 않았다. 검사만 수정했다. 다음 추가2개는 통과했지만, 긴 무기 끝이 화면 밖으로 잘리는 비교 구도를 개선하려 실제 조작으로 부두 안쪽에서 검사하도록 옮겼다. 이때 원거리 검사 중 첫 해골을 이미 쓰러뜨려 추가 전투에서 같은 보상의 XP를 다시 기대한 검사1개가 실패했다(1통과/1실패). 아직 살아 있는 적을 선택해 실제 처치·새 보상·저장 재개를 검사하도록 보완한 뒤 최종2개를 다시 실행해 모두 통과했다. 게임 보상·전투 코드는 바꾸지 않았다. `a6-{first,second,third}-target.json`, 실패 화면/컨텍스트 `docs/screenshots/art-a6/first-target-failure/`를 보존했다.

### 화면 기록 / 기능 완료 / 최종 아트 / 미검증

- `docs/screenshots/art-a6/{phone,tablet}-W01~W07-{right,left}.png`: 실제 키 입력28포즈. 기존 손 JSON과 좌표 오차<0.0001px, 마지막 회전 각도·실제 요청·장비 아이콘 확인. 검사에는 7무기 저장 픽스처와 움직임 줄이기 설정을 쓰며 캠페인 완주와 구별한다.
- `docs/screenshots/art-a6/phone-fallback-W01~W07-{right,left}.png`: WebP7개를 의도적으로 차단한14포즈. 기존 SVG로 아이콘과 장착 복구, 실제 적 처치·XP·보상·새로고침 동일성 확인. 의도한 요청 중단은 일반 콘솔 오류 없음 판정과 구별한다.
- `docs/validation/a6-weapon-art.json`, `a6-weapon-fallback.json`, `a6-target-passed.json`: 최종 실제 관찰/추가 검사 보고서. `weapons.json`:14실제 파일 감사/해시.
- `docs/screenshots/art-a6/touch/`와 `docs/validation/a6-touch.json`: 실제 CDP 터치46장과 관찰값을 검사 원본 경로에서 바이트 동일 복사했고 해시·원래 경로도 보존했다. 두 화면 각각 별도 열린 공간 dx+52/dy−105.58 성공이다.
- `docs/validation/a6-mobile.json`: 최종 터치 스모크 출력. 상자 옆 이동+점프는폰dx0/태블릿dx7, dy−110이므로 동시 이동 성공으로 기록하지 않는다. 앞선 스모크의 dx28/29 관찰은 `a6-first-mobile.json`에 별도 보존했다. 최종6화면은 `art-a6/mobile-{phone,tablet}-{start,swing,dialogue}.png`다.
- 기존 모바일/액션 화면·공통 A5 보고서는 `docs/screenshots/art-a6-before/`/`docs/validation/a6-before/`에 보존했다. A5 고유 전체 보고서/원본은 유지한다.
- `docs/validation/a6-e2e-full.json`, `a6-final-full-report/`: 최종 전체41개 통과, 실패/불안정/건너뜀0의 실제 JSON/HTML 보고서를 보존했다. 기존 전투·능력·표정·지형·하트·레벨·저장·사망·씬 전환과 새7무기/누락 복구를 최종 코드로 재검증했다.
- `docs/validation/complete-journey.json`: 새 게임부터 실제 키 입력·저장/장비 주입 없이36스테이지를820초에 완주했다. S16/S32 뒤 새로고침·보상 동일성, 일곱 무기/보물·36클리어·엔딩·자유 탐험 후 S01 재방문, 예외/HTTP 오류0 확인이다. JSON의 저장 스냅샷은 S01 재방문 전 S36 상태이며 재방문은 실제 지도 입력과 S01 입장 검사로 확인했다.
- `docs/screenshots/art-a6/campaign-S{05,10,15,19,25,29,36}-route.png`: 이번 새 게임 무주입 완주7장. 원래 test-results 경로와 바이트 동일 해시는 `docs/validation/a6-campaign-screenshots.json`에 있다. A6 정상 화면은 좌우28+누락14+모바일6+터치46+완주7=**101장**이며 실패 화면은 별도 하위 폴더다. 과거 공통 모바일3종의 사본은 `art-a6-before/extra-copies/`에 분리 보존했다.
- `docs/validation/a6-runtime-hashes.json`: 전체 실행 전후 게임/에셋/빌드/스크립트/검사/새원본438파일의 SHA256이 모두 동일했다. 검증 중 게임·에셋·검사 파일을 수정하지 않았다. 문서/보고서/캡처는 검사 산출물이며 이 해시 목록과 구별한다.
- `docs/validation/a6-checks.json`: 실제 명령 종료/검사 수·예산·미검증 요약. 공통 A3/A4/A5 화면·보고서는 이번 전체 회귀 결과로 갱신됐고 각 작업의 기존 고유 보고서/원본은 보존한다. 소유한5175 개발 서버는 검증 후 종료했다.
- A6 무기 아트 제작·기능 연결·모사 브라우저·전체 회귀 검증을 완료했다. **ART_DRAFT 유지**하며 사용자 최종 아트 승인과 실기기 검수를 완료로 처리하지 않는다.
- **미검증**: 실제 휴대폰·태블릿 하드웨어, iOS Safari, 어린이 손 크기/조작성, 발열·장시간 FPS·실제 스피커, 최종 사용자 아트 승인. 이 환경에는 실기기가 없어 Edge의 화면/터치 모사를 사용했다. A7/A8은 미완료다. 배포하지 않았다.

### 다음 한 작업

- `docs/CODEX_ART_TASKS.md`의 A7 투사체·효과를 제작·연결·검증한다. 현재 판정 반경·피해·공격 시각·저장 ID를 유지하며 별도 다음 작업으로 진행한다.

아래는 이전 작업 기록이며 최신 판정은 위 절을 우선한다.

## 최신 실제 상태 · 2026-10-03 · Codex A5 장소별 지형 타일

### 구현 범위

- `AGENTS.md`, 이 문서와 `docs/CODEX_ART_TASKS.md` 전체 및 명세의 관련 지형·웹툰 규칙을 확인해 다음 작업 A5를 진행했다. 기존 사용자 변경·Phaser 3.90.0·의존성/lockfile·저장 형식·발판 판정·오브젝트/보상/아이템 ID를 유지했다. 커밋·push·배포는 하지 않았다.
- 내장 imagegen으로 기존17개 스타일 `dock, deck, reef, coral, whale, basalt, crystal, cloud, village, warehouse, sand, shadow, jungle, temple, garden, tower, kingdom`의 채움/윗면 **34타일**을 만들었다. 프로젝트 자체 `hero-webtoon`의 외곽선·셀 음영만 참조했다. 불투명 재질이며 인물·글자·로고·외부 작품은 없다.
- 생성 PNG41개(선택34/미선택7)를 `art-source/terrain/generated/`에 도구 원본과 바이트 동일하게 보존했다. 부두 윗면의 띠 밖 여백/번짐과6종 채움의 반복되는 윗면/테두리 때문에 다시 생성했다. 원본을 삭제하지 않았다. 실제 전체 프롬프트·참조·선택·원본 크기/SHA256은 `terrain.sources.json`이다.
- 도구 반환 채움은1254×1254이고 윗면은1935×812~2048×768이다. `pack-terrain.py`는 전체 불투명 캔버스를 **512×512/512×136**으로 정규화하고 같은 RGBA의 무손실 WebP를 만든다. 채움은 균등 축소, 윗면은 가로 재질 띠 규격으로 세로 비율도 맞췄다. 덧칠·이음새 블렌딩·그림 잘라내기는 하지 않았다. 원본과 정규화 PNG34개를 보존했다.
- `SIZES`와 매니페스트 `runtimeSize`에34개 키·크기·출처·ART_DRAFT를 등록했다. 최적화 스크립트가 `public/assets/terrain/`에 **128×128/128×34** 런타임을 만든다. 윗면 아래6px의 어두운 그림자 띠와34개 파일 디코딩을 검사했다. 총 런타임 크기는71,178바이트다.
- 현재 맵의 두 재질만 로드하고 이전 스타일은 제거한다. 기존 Graphics 대체물을 유지하며 파일 한쪽만 없을 때 정상 파일을 덮어쓰지 않고 빠진 쪽만 생성한다. 물리 발판·윗면의 위치/크기·이동 발판 동기화는 유지했다. 개발용 읽기 전용 스냅샷에 원본 TileSprite 패턴·크기/위치·요청 이미지 관찰값을 추가했다.

### 실제 검사 결과

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-terrain.py` | 통과 · 34원본 무손실 RGBA 동일, 생성41개 원본 해시 보존 |
| `python scripts/optimize-webtoon.py` | 통과 · 기존 웹툰38종/4014KiB, 지형34종/71,178바이트 |
| `python scripts/audit-webtoon.py` | 통과 · 기존76개 일러스트와 지형 원본/런타임68개, 크기·불투명도·무손실 원본·윗면 그림자 |
| `npm run typecheck` | 통과 · 최종 코드/추가 검사 포함 |
| `npm run lint` | 통과 · 최종 코드/추가 검사 포함 |
| `npm run test` | 통과 · 16파일94개, 36맵/17스타일 등록·파일 한쪽 누락 보완 포함 |
| `npm run validate:content` | 통과 · 36스테이지·24장면·7무기·7보물·8황금 하트 |
| `npm run build` | 통과 · 기존 Phaser 500KB 초과 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · 2,778,303 / 8,000,000바이트(2.78MB), 시작 지형 두 파일 포함 |
| `npm run dev -- --port 5175 --strictPort` | 실행 통과 · 기존5173 보존, E2E 별도5174 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175` | 통과(exit0) · 두 화면 CDP 터치, 우측 이동 각252px·방향 전환·점프dy−110·첫 해골 처치·선장 대화·콘솔 오류0 |
| `npx playwright test tests/e2e/terrain-art.spec.ts` | 통과(exit0) · 추가4개/2.1분, 두 화면17종 순회·발판 정렬·이동/점프·34실제 요청·3종 누락 시 전투/저장 재개 |
| `npm run test:e2e` | 통과(exit0) · 최종39개/34.58분, 실패·불안정·건너뜀0. 새 게임36스테이지 무주입 완주13.5분 포함 |
| `npx tsx scripts/check-terrain-motion.ts http://127.0.0.1:5175` | 통과(exit0) · 두 화면 S07의6개 이동 갑판을6시점씩 관찰, 실제 가로/세로 변위>2px, 채움/윗면 정렬 오차 최대0.705/0.526px |
| `git diff --check` | 통과 · 최종 문서 포함, 의존성/lockfile 변경 없음 |

초기 추가 검사는 세 번 각각3통과/1실패였다. Phaser의 실제 `blob:` 이미지 주소를 파일 주소로 기대했고, TileSprite의 내부 렌더 캔버스 대신 원본 패턴을 관찰해야 했으며, 전체 스테이지 픽스처에 실제 입장 플래그가 빠져 있었다. 파일 요청/디코딩 관찰·원본 패턴 관찰·실제 캠페인 보상 플래그를 사용하도록 검사와 읽기 전용 관찰을 보완한 뒤4개를 통과했다. 게임 해금·물리·보상 코드를 바꾸지 않았다. 실패 보고서는 `docs/validation/a5-{first,second,third}-target.json`, 화면은 `docs/screenshots/art-a5/{first,second,third}-target-failure/`에 보존했다.

첫 전체 실행의 초반 S01~S03 검사는 S02 조개 종 앞에서 실패했다. 검사에서 공격 직전에 방향키를 놓아 정지 상태 자동 조준이 근처 게를 향해 방향을 바꾸는 기존 동작을 확인했다. 방향키를 공격 입력 처리 프레임까지 유지하는 정상 조작으로 검사만 보완했다. 실패 화면/컨텍스트는 `docs/screenshots/art-a5/first-full-failure/`, 중단 기록은 `docs/validation/a5-first-full-interrupted.json`이다. 최초 실행은 전체가 끝나기 전에 중단했으므로 완주/최종 통과 개수를 주장하지 않는다. 보완 뒤 S01~S03 입력 검사1개를1.5분에 통과했고 `a5-input-regression.json`에 실제 보고서를 보존했다. 그 뒤 최종 전체39개를 처음부터 다시 실행해 모두 통과했다.

### 화면 기록 / 기능 완료 / 최종 아트

- `docs/screenshots/art-a5/terrain-repeat-{candidates,runtime}-{1,2,3}.png`: 채움3×3/윗면3회 반복 진단6장. 최종 런타임3장과 실제 부두·정원·신전 화면을 육안 확인했다. 경계 RGB 차이는 줄눈/질감도 포함하는 검수 보조값이며 수학적 픽셀 주기성 판정과 구별한다.
- `docs/screenshots/art-a5/{phone,tablet}-S{01,02,03,04,05,06,08,09,11,12,13,15,16,23,28,30,34}-*.png`:17스타일×2화면의 실제 지도 순회34장. 최종 `terrain-art.json`은 모든 파일 요청·현재 텍스처2개·발판 위치/크기·윗면 정렬·오류0의 실제 관찰이다. 저장/아이템 해금 픽스처를 명시하며 새 게임 무주입 완주와 구별한다.
- `docs/screenshots/art-a5/{phone,tablet}-S07-moving-deck.png`, `docs/validation/a5-moving-platforms.json`: 별도 S07 검사2장. 앞선6스테이지/장비/적 보상 픽스처와 실제 이어하기·키보드 조작으로6개 갑판의 실제 XY 움직임과 채움/윗면 정렬을6시점씩 확인했다. 물리 프레임 처리 순서에3px 허용치를 명시했고 실제 최대 오차는 휴대폰0.705/태블릿0.526px다. 판정 위치·크기는 바꾸지 않았다.
- `docs/screenshots/art-a5/phone-missing-{fill,top,both}.png`, `docs/validation/terrain-fallback-{fill,top,both}.json`: 요청을 의도적으로 중단해 기존 재질 대체물로 전투·처치 보상·경험치·새로고침 재개를 확인했다. 예외0, 요청 중단은 의도한 조건이다.
- `docs/validation/a5-target-passed.json`, `terrain.json`, `a5-terrain-runtime-repeat.json`: 실제 추가4개 통과 보고서·68개 지형 파일 감사·반복 진단. 추가4개를 최종 전체 실행에서도 모두 통과했다.
- `docs/validation/a5-e2e-full.json`, `a5-final-full-report/`: 실제 최종 Playwright 보고서39개 통과, 실패/불안정/건너뜀0. 기존 적 행동·NPC 표정·보상·저장·전투·이동·능력·씬 전환도 최종 지형을 적용한 상태로 재검증했다. 공통 `art-a3/`, `art-a4/` 화면과 보고서는 최신 실행으로 갱신됐다.
- `docs/validation/complete-journey.json`: 최종 코드의 새 게임에서 실제 키보드 입력·저장 주입 없이36스테이지를806초에 완주했다. S16/S32 뒤 새로고침 재개·일곱 무기/보물·36클리어·엔딩·자유 탐험 후 S01 재방문, 예외/HTTP 오류0을 확인했다.
- `docs/screenshots/art-a5/campaign-S{05,10,15,19,25,29,36}-route.png`: 최종 무주입 완주7장. 원래 test-results 경로와 바이트 동일 보존 해시는 `docs/validation/a5-campaign-screenshots.json`이다. A5 폴더의 정상 화면은 반복6+스타일34+누락3+이동 갑판2+완주7=52장이고 실패 화면은 별도 하위 폴더에 있다.
- `docs/validation/a5-runtime-hashes.json`: 최종 전체 실행 전후 게임 소스/런타임/빌드247개와 검사 파일35개(합계282)의 바이트 해시가 모두 같았다. 검증 중 게임과 검사 파일을 수정하지 않았다. 새 이동 갑판 관찰 스크립트는 별도의 검증 도구이며 게임 소스/판정을 수정하지 않는다.
- 이전 모바일6장과 A4 공통 보고서는 `docs/screenshots/art-a5-before/`, `docs/validation/a5-before/`에 보존했다. 출처/이용 조건/원본 크기는 `docs/ART_PROMPTS.md`, `docs/ASSET_REGISTER.md`에 기록했다.
- `docs/validation/a5-mobile.json`은 최종 실제 터치 출력이다. 이동+점프 샘플은 상자 옆에서dx0/dy−110이므로 동시 이동 성공으로 기록하지 않는다. `docs/screenshots/mobile-{phone,tablet}-{start,swing,dialogue}.png`의 최종6장과 이전6장을 보존했다.
- A5 기능 구현·모사 브라우저 검증·전체 회귀 검증을 완료했다. **ART_DRAFT 유지**. **미검증**: 실제 휴대폰·태블릿 하드웨어, iOS Safari, 아이의 손 크기/조작성, 발열·장시간 FPS·실제 스피커. 이 환경에서는 실기기에 접근할 수 없어 Edge/CDP 터치·뷰포트 모사를 사용했다. 최종 사용자 아트 승인도 미완료다. A6~A8은 별도 미완료이며 공개 배포는 하지 않았다.

### 다음 한 작업

- `docs/CODEX_ART_TASKS.md`의 A6 무기7종 최종 아트를 제작·연결·검증한다. 현재 무기별 캔버스 비율·손잡이 회전 중심·W01~W07 ID·판정·공격 시간을 유지한다.

아래는 이전 작업 기록이며 최신 판정은 위 절을 우선한다.

## 최신 실제 상태 · 2026-10-03 · Codex A4 NPC 표정 초상

### 구현 범위

- `AGENTS.md`, 이 문서와 `docs/CODEX_ART_TASKS.md` 전체 및 명세의 인물·웹툰·대화 규칙을 확인하고 다음 작업 A4를 진행했다. 사용자 변경·Phaser 3.90.0·의존성/lockfile·저장 형식·대화/오브젝트/보상/아이템 ID를 유지했다. 커밋·push·배포는 하지 않았다.
- 내장 imagegen으로 나이라·세이렌·라흐·지니 하질·아리아나·왕·미라·바루·선장의 기본/기쁨/걱정 초상 **9종·27셀**을 제작했다. 인물별 기존 원화는 얼굴/의상, 프로젝트 자체 `hero-webtoon`은 화풍 참조다. 상반신·오른쪽 3/4 방향·투명 RGBA·글자/로고/피/상처 없음이며 외부 작품은 참조하지 않았다.
- 실제 생성 결과는 1774×887이다. 처음 나이라·세이렌·아리아나 후보가 옷/악기로 셀 경계를 넘어 다시 생성했다. 선택9/미선택3 PNG를 `art-source/webtoon/generated/faces/`에 도구 원본과 바이트 동일하게 보존했다. 모든 실제 프롬프트·참조·선택·원본 크기/해시는 `npc-faces.sources.json`에 있다. 원본은 삭제하지 않았다.
- `pack-npc-faces.py`는 가시 알파 >16의 원본 셀 경계가 비었음을 먼저 확인하고, 완전한 세 셀을 균일 축소·투명 여백으로 배열한다. 실루엣을 자르거나 그림을 덧칠하지 않는다. 무손실 `{key}-faces.webp` 9개는 **1536×768, 셀512×768**이며 `encode-webtoon.py`에서 보이는 RGBA/알파 동일성을 확인했다. 최적화/매니페스트에 키를 등록해 **768×384, 셀256×384** 런타임을 만들었다. 측정 경계는 `npc-faces.measurements.json`이다.
- 기존 문구를 유지한 채 대사 데이터에 선택적 `[기쁨]`/`[걱정]` 접두 태그를 붙인다. `dialogueArt.ts`가 태그를 먼저 제거한 뒤 실제 화자와 셀을 선택한다. 무태그 줄은 기본 표정으로 돌아가며 `dialogue-text`에 태그가 나타나지 않는다. 신밧드·일지·비슈누 환영은 기존 그림을 유지하고, 같은 대화 안의 아리아나/왕/신밧드도 각자의 초상을 표시한다. 침몰 대화의 세 화자도 구분했다.
- DOM의 2:3 초상창이 필요한 한 시트만 요청·클리핑하고, 파일 누락은 같은 인물의 기존 초상으로 돌아간다. 표정 시트를 Phaser에 일괄 사전 로드하지 않는다. 대화 다음/전체 생략·정지/재개·보상 흐름은 유지했다. S20의 미라 NPC 전신은 미라 원화로 맞췄고, 보상 알림이 대사를 가리던 실제 화면 문제를 대화창 아래 배치로 보완했다.

### 실제 검사 결과

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-npc-faces.py` | 통과 · 9시트/27개 완전한 셀, 원본 복사 해시·빈 가시 경계·균일 축소 검사 |
| `python scripts/encode-webtoon.py` | 통과 · 9종 무손실 인코딩, 보이는 RGBA/알파 동일 |
| `python scripts/optimize-webtoon.py` | 통과 · 런타임38종, 합계4014KiB |
| `python scripts/audit-webtoon.py` | 통과 · 원본/런타임76개 디코딩, 54,642,164바이트, 27개 원본/런타임 셀 경계·크기/알파/측정값 검사 |
| `npm run typecheck` | 통과 · 최종 코드/추가 검사 포함 |
| `npm run lint` | 통과 · 최종 코드/추가 검사 포함 |
| `npm run test` | 통과 · 15파일89개, 태그 제거·화자 전환·기본 복귀·9종 실제 대사3표정·S20 인물 일치 포함 |
| `npm run validate:content` | 통과 · 36스테이지·24장면·7무기·7보물·8황금 하트 |
| `npm run build` | 통과 · 기존 Phaser 500KB 초과 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · 최종 2,773,116 / 8,000,000바이트 (2.77MB), 선장 첫 대화 시트도 포함 |
| `npm run dev -- --port 5175 --strictPort` | 실행 통과 · 기존 5173 보존, E2E 별도5174 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175` | 통과(exit0) · 최종 전환 보완 뒤 CDP 터치 두 화면, 우측 이동257/252px·방향 전환·점프dy−110·첫 해골 처치·선장 대화·콘솔 오류0 |
| `node scripts/check-action-art.mjs http://127.0.0.1:5175` | 통과(exit0) · 7무기×좌우×2터치화면·JSON 손 위치·행동·선장/선원 초상·콘솔/HTTP 오류0. 알림/S20 화면 보완 전 실행 |
| `npm run test:e2e -- tests/e2e/npc-faces.spec.ts` | 통과(exit0) · 최종 추가3개, 2.2분. 두 화면 27표정·대체 초상·실제 씬 전환6회/480프레임 관찰(로딩30샘플). 최종 전체 실행에서도3개 통과, 로딩29샘플 |
| `npm run test:e2e` | 통과(exit0) · 최종35개/31.70분, 실패·불안정·건너뜀0. 첫 실행33통과/1실패의 관찰 훅 문제를 보완 후 전체 재실행 |
| `git diff --check` | 통과 · 최종 문서 포함 |

초기 추가 E2E는 대화가 열리기 전에 보상 상태를 읽어서 한 번 실패했다. 실제 대화 표시를 기다린 뒤 비교하도록 검사 절차를 보완했다. 다음 실행은 구조 오브젝트 ID `S05.rescue`를 보상 ID로 잘못 기대해 실패했고, 실제 기존 ID `S05.rescue.reward`로 검사만 바로잡았다. 그 뒤 추가2개가 통과했다. 게임의 보상/저장 코드는 바꾸지 않았다. 추가 검사는 스테이지·아이템 저장 픽스처와 실제 메뉴/키보드/선물/보스 조작이며, 캠페인 무주입 완주와 구별한다.

첫 전체 실행은 33통과/1실패였다. S31→S32에서 개발용 읽기 전용 `snapshot()`이 이전 씬의 해제된 적 텍스처 높이를 읽어 `sourceSize` 예외를 냈다. 씬이 활성화되고 플레이어 물리가 준비되기 전에는 로딩 스냅샷을 반환하도록 보완했으며, 완주 검사는 다음 스테이지의 정확한 ID를 기다리게 했다. 새 회귀 검사는 실제 지도 버튼으로 S31/S32 등을 6번 전환하며 480프레임을 관찰해 통과했다. 실패 보고서/화면은 `docs/validation/a4-e2e-first-full.json`, `a4-first-full-report/`, `docs/screenshots/art-a4/first-full-failure/`에 보존했다. `docs/validation/a4-transition.json`은 보완 뒤의 실제 결과다.

최종 터치 스모크의 실제 출력은 `docs/validation/a4-mobile.json`이다. 이동+점프 샘플은 상자 옆에서 dx0/dy−110이어서 동시 이동 성공으로 기록하지 않는다. 앞선 7무기 아트 검사의 별도 열린 공간 동시 터치는 `docs/validation/action-art.json`에 실제 값이 있다. 이전 A3 모바일 화면과 A1·A2/초기 A4 화면·보상 검증 기록은 `docs/screenshots/art-a4-before/`, `docs/validation/a4-before/`에 보존했다.

### 화면 기록 / 기능 완료 / 최종 아트

- `docs/screenshots/mobile-{phone,tablet}-{start,swing,dialogue}.png`: 최종 화면 보완 뒤 실제 터치6장.
- `docs/screenshots/art-a4/{phone,tablet}-*.png`: 최종 실제 대화76장(두 화면의 세 표정·화자 전환), 별도 누락 복구1장. 대화창·초상·대사·버튼이 화면 안에 있고 태그가 출력되지 않음을 확인했다.
- `docs/screenshots/art-a4/phone-captain-fallback.png`: 요청을 의도적으로 중단해 같은 선장 원화로 대화·전체 생략·목표 저장을 유지한 화면.
- `docs/validation/npc-faces.json`, `npc-faces-fallback.json`: 최종 대사/화자/표정/실제 이미지 크기·클리핑·보상·저장 재개·오류 관찰. 정상 대화 오류0, 누락 검사는 의도한 선장 시트 요청 중단을 기록한다.
- `docs/validation/a4-e2e-full.json`, `a4-final-full-report/`: 실제 최종 Playwright 보고서35개 통과, 실패/불안정/건너뜀0. `a4-transition.json`은 최종 전체 실행에서 관찰한6전환/480프레임/로딩29샘플의 오류 없는 결과다.
- `docs/validation/complete-journey.json`: 최종 코드로 새 게임에서 실제 키보드 입력·저장 주입 없이36스테이지를800초에 완주했다. S16/S32 뒤 새로고침의 보상 동일성, 무기7/보물7/36클리어/엔딩, 자유 탐험 후 S01 재방문을 확인했다. 콘솔 예외/HTTP 오류0.
- `docs/screenshots/art-a4/campaign-S{05,10,15,19,25,29,36}-route.png`: 최종 무주입 완주의 실제 화면7장. 원래 test-results 경로와 보존 해시는 `docs/validation/a4-campaign-screenshots.json`이다. 최종 A4 폴더의 화면은 대화76+누락1+완주7=84장이고, 첫 실패 화면은 별도 하위 폴더에 보존했다.
- `docs/validation/a4-runtime-hashes.json`: 전체 실행 전후 게임 소스/런타임/빌드75파일의 바이트 해시가 모두 일치했다. 검증 도중 게임을 수정하지 않았음을 기록했다. 생성 원본 PNG12개도 sources JSON 해시와 일치한다.
- A4 기능 구현과 모사 브라우저 검증을 완료했다. **ART_DRAFT 유지**. 인물 상반신은 기존 원화와 맞췄지만 사용자 최종 아트 승인·실기기 검수와 구별한다. A5~A8은 미완료다.
- **미검증**: 실제 휴대폰·태블릿 하드웨어, iOS Safari, 아이의 손 크기/조작성, 발열·장시간 FPS·실제 스피커. 이 환경에서 실기기에 접근할 수 없어 Edge의 터치/뷰포트 모사를 사용했다. 최종 아트 사용자 승인도 미완료다.

### 다음 한 작업

- `docs/CODEX_ART_TASKS.md`의 A5 장소별 지형 타일17스타일을 제작·연결·검증한다. 현재 `terrain.ts` 스타일 키와 코드 대체 렌더링을 유지하며 별도 다음 작업으로 진행한다.

아래는 이전 작업 기록이며 최신 판정은 위 절을 우선한다.

## 최신 실제 상태 · 2026-10-03 · Codex A3 적 행동 10종

### 구현 범위

- 중단했던 A3를 이어 진행했다. `AGENTS.md`, 이 문서와 `docs/CODEX_ART_TASKS.md` 전체 및 명세의 관련 전투·아트 규칙을 확인했다. 기존 사용자 변경·Phaser 3.90.0·의존성·lockfile·저장 형식·오브젝트/보상/아이템 ID를 유지했다. 커밋·push·배포는 하지 않았다.
- 내장 imagegen으로 해골·산적·경비병·해적 선장·뱀·호랑이·용·게·돌 거인·쿠우라의 대기/공격 예고/공격/평화로운 패배 40셀을 제작했다. 프로젝트 자체 `hero-webtoon`, `enemy-atlas`, `kuura-webtoon`을 참조했다. 오른쪽 방향·투명 RGBA·글자/피/상처 없음. 경계를 넘거나 최종 축소 때 경계에 닿는 후보는 다시 생성했다.
- 선택 10개와 미선택 8개 PNG는 `art-source/webtoon/generated/enemy-actions/`에 원본 그대로 보존했다. 도구 원본 18개와 SHA256 바이트 동일성을 확인했다. 선택 목록은 `enemy-actions.sources.json`이다. 실제 도구 반환 크기는 1254×1254(2×2, 셀 627px)이며 `pack-enemy-actions.py`가 완전한 정사각 셀을 512px로 균등 축소·재배열했다. 그림을 다시 칠하거나 실루엣을 잘라내지 않았다.
- `art-source/webtoon/enemy-actions.webp`는 2048×5120, 4열×10행 무손실 원본이다. `enemy-actions.json`에 실제 가시 알파 경계와 40개 기준선·대기 높이를 측정했다. 런타임은 1024×2560, 셀 256px, 428,836바이트다. 최적화가 생성 JSON을 `src/content/enemy-actions.generated.json`에 바이트 그대로 복사하고 감사에서 동일성을 검사한다.
- `maps.ts`의 선택적 `actionArt`로 기존 적 ID와 전투 종류를 유지하며 행을 연결했다. `updateEnemies()`에서 대기/예고/공격/회복을 0/1/2/0셀로 표시하고, 처치 때 3셀을 보여 준다. 전투 시계·타격 창·판정 중심은 유지했다. 투명 여백 대신 대기 가시 높이로 몸 크기를 맞추고, 각 셀 JSON 기준선과 고정 지면 윗면으로 발을 정렬했다. HP 막대·그림자·타격 숫자는 몸 크기를 기준으로 표시한다.
- 인간은 무기를 내려놓고 두 손을 든 항복 자세로 남는다. 동물은 편안해진 정화 셀을 900ms 보여 준 뒤 기존 빛 트윈, 마법 적은 소멸 직전 셀을 300ms 보여 준 뒤 빛 트윈을 실행한다. 움직임 줄이기에서도 셀을 먼저 보여 준다. S01 궁수·대장도 해골이므로 기존 인간 분류를 마법으로 바로잡았다. 에셋 요청 실패 때 실제 존재하는 SVG/정지 원화로 플레이를 유지한다.

### 실제 검사 결과

| 명령 | 실제 결과 |
|---|---|
| `python scripts/pack-enemy-actions.py` | 통과 · 10종, 40개 완전한 셀, 가시 알파 경계 비어 있음 |
| `python scripts/encode-webtoon.py` | 통과 · 새 아틀라스 무손실 인코딩, 보이는 RGBA/알파 동일 |
| `python scripts/optimize-webtoon.py` | 통과 · 29종 런타임, 합계 3392KiB |
| `python scripts/audit-webtoon.py` | 통과 · 원본/런타임 58개 디코딩, 원본/축소 런타임의 가시 셀 경계·크기·JSON 복사·측정값 검사 |
| `npm run typecheck` | 통과 |
| `npm run lint` | 통과 |
| `npm run test` | 통과 · 14파일 84개, 40프레임 기준선 불변·마법/인간/동물 분류 검사 포함 |
| `npm run validate:content` | 통과 · 36스테이지·24장면·7무기·7보물·8황금 하트 |
| `npm run build` | 통과 · 기존 Phaser 500KB 초과 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · 2,711,231 / 8,000,000바이트 (2.71MB), 최종 빌드 기준 |
| `npm run dev -- --port 5175 --strictPort` | 실행 통과 · 기존 5173 서버 보존, E2E는 별도 5174 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175` | 통과(exit0) · 두 화면 CDP 터치, 우측 이동 각257px, 밀어 방향 전환, 점프 dy −110px, 첫 해골 처치, 선장 대화, 콘솔 오류0 |
| `npm run test:e2e -- tests/e2e/enemy-actions.spec.ts` | 통과 · 추가 2개, 3.7분. 발의 지면 정렬 보정 전 실행이며 같은 2개를 최종 코드의 아래 전체 실행에서 재통과 |
| `npm run test:e2e` | 통과(exit0) · 전체 32개, 29.7분 · 새 게임 S01~S36 무주입 완주 13.4분 포함, 실패/flaky/skipped 0 |
| `git diff --check` | 통과 |

모바일 스모크의 이동+점프 샘플은 상자 옆에서 dx=0, dy=−110이었다. 이동+점프 동시 성공으로 기록하지 않는다. 실제 출력은 `docs/validation/a3-mobile.json`이며 두 화면에서 첫 해골 처치와 실제 선장 대사를 확인했다.

초기 추가 E2E는 Node의 JSON import attribute 누락으로 실행되지 않았다. 이를 수정한 뒤 S01 상자 위의 유효 위치가 검사 이동 도우미의 y 허용 범위를 벗어나 한 번 실패했다. 실제 조작 경로의 접근 높이를 보완하고 추가 2개를 재실행해 통과했다. 첫 패킹에서도 해적 셀의 부츠가 축소 후 경계에 닿아 새 PNG를 생성한 뒤 통과했다. 실패 후보와 원본은 삭제하지 않았다.

최종 전체 실행의 실제 Playwright 보고서는 `docs/validation/a3-e2e-full.json`에 보존했다(32/32, flaky/skipped 0). 추가 아트 검사는 10종×2화면의 실제 대기/예고/공격/회복/패배 프레임과 좌우 전환, 항복/정화/빛 소멸, 보상·경험치의 저장 재개를 통과했고 120개 화면·관찰값·콘솔/HTTP 오류0을 `docs/validation/enemy-art.json`에 기록했다. 아틀라스 요청을 의도적으로 중단한 별도 검사도 SVG로 실제 전투를 유지하고 해골을 빛으로 처리했다.

별도의 새 게임 완주는 저장/장비 주입 없이 정상 키보드 입력으로 S01~S36, S16/S32 뒤 새로고침·이어하기, 일곱 무기·일곱 보물·엔딩·S01 자유 탐험 재방문을 통과했다. 실제 저장·36단계별 시간·오류0은 `docs/validation/complete-journey.json`이다. 검사 중 게임 코드/에셋을 수정하지 않았고 주요 A3 런타임 5개가 전체 실행 시작 전 파일이며 끝난 뒤 바이트 동일함을 `docs/validation/a3-runtime-hashes.json`으로 확인했다. 이전 완주/발 정렬 전 추가 보고서는 `docs/validation/a3-before/`에 보존했다.

### 화면 기록 / 기능 완료 / 최종 아트

- `docs/screenshots/mobile-{phone,tablet}-{start,swing,dialogue}.png`: 최종 발 정렬 후 실제 터치 6개 화면.
- `docs/screenshots/art-a3-before/mobile-*.png`: 발 정렬 전 화면 보존.
- `docs/screenshots/art-a3/{phone,tablet}-{skeleton,bandit,guard,pirate,snake,tiger,dragon,crab,stone,kuura}-{idle,telegraph,attack,recover,defeated,right}.png`: 최종 전체 실행의 120개 비교 화면. 전후 모바일 화면과 게·쿠우라·호랑이·경비병·해적 선장 대표 화면을 열어 기준선·크기·방향·항복 자세를 육안 확인했다.
- `docs/screenshots/art-a3/campaign-S{05,10,15,19,25,29,36}-route.png`: 새 게임 완주의 실제 7장 화면. `test-results`에서 보존 경로로 복사했고 원래/보존 경로는 `docs/validation/a3-campaign-screenshots.json`이다.
- 추가 검사는 스테이지/장비 저장 픽스처와 실제 키보드 조작으로 네 포즈·회복·좌우·패배·보상 저장 재개를 확인한다. 캠페인 완주와 구별하며 읽기 전용 관찰만 사용한다. 원화 출처·이용 조건은 `docs/ART_PROMPTS.md`, `docs/ASSET_REGISTER.md`에 기록했다.
- A3 기능은 구현했고 위 범위의 자동·실제 입력 브라우저 검증을 통과했다. **ART_DRAFT 유지**. 세이렌·로크새·박쥐·정령·공중 연은 이번 10종 아틀라스에 포함되지 않아 기존 표시를 유지한다. A4~A8과 최종 아트 승인은 미완료다.
- **미검증**: 실제 휴대폰·태블릿 하드웨어, iOS Safari, 아이의 손 크기·조작성, 발열·장시간 FPS·실제 스피커. 실기기에 접근할 수 없어 Edge 터치/뷰포트 모사로 검사했다. 사용자 최종 아트 승인도 미완료다. 경계 검사는 가시 알파 >16 기준이며 생성 매트의 미세 알파는 원본에 보존했다.

### 다음 한 작업

- `docs/CODEX_ART_TASKS.md`의 A4 NPC 기본/기쁨/걱정 표정 초상을 제작·연결한다.

아래는 이전 작업 기록이며 최신 판정은 위 절을 우선한다. 공통 화면/검증 파일은 후속 검사로 갱신될 수 있고 A1·A2 전체 결과는 `docs/validation/a1-a2-e2e-full.json`에 보존되어 있다.

## 최신 실제 상태 · 2026-10-03 · Codex A1 신밧드 액션 / A2 선장·선원

### 구현 범위
- `AGENTS.md`, 이 상태 문서, `docs/CODEX_ART_TASKS.md` 전체와 명세의 구조·0/14/15장 및 관련 아트·초반 스테이지를 읽고 기존 사용자 변경을 유지했다. Phaser 3.90.0·의존성·lockfile·저장 형식·오브젝트/보상 ID는 그대로다. 커밋·push·배포는 수행하지 않았다.
- 내장 imagegen과 자체 `hero-webtoon.webp` 참조로 `hero-action`, `captain-webtoon`, `sailor-webtoon`을 제작했다. 경계/여백/크기 문제가 있던 액션 후보는 다시 생성했다. 선택/미선택 PNG 8개는 `art-source/webtoon/generated/`와 도구 원본 보관소에 보존했다. 액션의 도구 반환 크기는 1254×1254이며 PNG는 그대로 남겼다. `encode-webtoon.py`에서 전체 시트를 1536×1536(512px 셀)으로 정규화하고 무손실 인코딩했다. NPC 원본은 각각 1024×1536이다. 잘라내기·다시 칠하기 없이 인코딩 입력과 디코딩 WebP의 보이는 RGBA·알파 동일성을 검사했다.
- `hero-action.json`에 9셀의 발 기준선·무기를 장착할 주먹 중심을 512px 좌표로 측정했다. `heroArt.ts`가 JSON을 직접 사용한다. 표시 144px에서 `x = 중심 + 방향 × (hand.x − 256) × 144/512`, `y = 발 기준 위치 + (hand.y − baseline) × 144/512`로 환산한다. 무기 회전 중심에 별도 reach/lift를 더하지 않아 손에서 떨어지지 않는다.
- 원본 폴더가 업로드에서 제외될 때 좌표 import가 빠지지 않도록 최적화 스크립트가 `src/content/hero-action.generated.json`을 만든다. 원본 JSON의 바이트를 그대로 복사하고 감사에서 동일성을 검사한다. 생성본 연결 전후 프로덕션 JS/CSS SHA256은 모두 동일하다. 좌표 수정의 기준은 계속 `art-source/webtoon/hero-action.json`이다.
- 비행 맵 외에는 액션 시트를 로드한다. 숨쉬기 0/1, 상승 2, 낙하 3, 피격 4, 공격 5→6→7(0~80 / 80~200 / 200ms 이후), 신규 보물·장비·유물 획득 기쁨 8을 연결했다. 달리기는 `hero-run`, 비행 탑승은 기존 원화다. 공격 중 캐릭터와 무기는 같은 방향으로 표시되고 물리·공격 판정은 기존 코드다. 스테이지 재시작 때 피격/기쁨 시간을 초기화한다.
- S01·S03 선장 전신 및 `captain`/`storm` 초상은 전용 선장, S04 전신·`whale` 초상은 전용 선원이다. 기존 라벨이 새 NPC 얼굴을 가리는 것을 화면에서 발견해 해당 두 원화의 라벨만 머리 위로 올렸다.
- `optimize-webtoon.py`와 매니페스트에 액션 768×768(256px 셀), 두 NPC 각각 512×768을 등록했다. 첫 다운로드 예산 계산에도 새 시트·선장을 포함했다. 원화 출처·크기·이용 조건은 `ART_PROMPTS.md`/`ASSET_REGISTER.md`, 디코딩·해시는 `docs/validation/illustrations.json`이다.

### 실제 검사 결과
| 명령 | 실제 결과 |
|---|---|
| `python scripts/encode-webtoon.py` | 통과 · 3종 무손실 인코딩, 보이는 RGBA/알파 동일 |
| `python scripts/optimize-webtoon.py` | 통과 · 원본 28종 → 런타임 28종, 총 런타임 2973KiB |
| `python scripts/audit-webtoon.py` | 통과 · 원본/런타임 56개 디코딩, 새 원화 크기·투명 알파·눈에 보이는 셀 경계·손 픽셀 검사 |
| `npm run typecheck` | 통과 |
| `npm run lint` | 통과 · 추가 검사 스크립트도 포함 |
| `npm run test` | 통과 · 13파일 82개, 공격 시간 경계·JSON 손 좌우 환산 2개 추가 |
| `npm run validate:content` | 통과 · 36스테이지·24장면·7무기·7보물·8황금 하트 |
| `npm run build` | 통과 · 기존 Phaser 500KB 초과 청크 경고 유지 |
| `npx tsx scripts/check-art-budget.ts` | 통과 · 2,438,616바이트 / 8,000,000 (2.44MB) |
| `npm run dev -- --port 5175 --strictPort` | 실행 통과 · 기존 5173 서버를 건드리지 않고 분리. E2E 서버는 5174 |
| `node scripts/mobile-check.mjs http://127.0.0.1:5175` | 통과(exit0) · 844×390/1180×820 CDP 터치, 우측 이동 각252px, 손가락 방향 전환, 점프 dy −110px, 첫 해골 처치, 돌아와 선장 첫 대사, 콘솔 오류0 |
| `node scripts/check-action-art.mjs http://127.0.0.1:5175` | 통과(exit0) · 7종×좌우×2화면 실제 터치 공격/무기 교체, 손 좌표 오차<0.01px, NPC 초상6개, 행동6종×2화면, 콘솔/HTTP 오류0 |
| `npm run test:e2e` | 통과(exit0) · 전체 30개, 26.0분 · 새 게임 S01~S36 무주입 완주 13.3분 포함 |
| `npm run test:e2e -- tests/e2e/adventure.spec.ts` | 통과(exit0) · 최종 JSON 생성본 import로 S01~S03/체크포인트·터치·누락 에셋 3개 재검사, 1.6분 |
| `git diff --check` | 통과 |

기존 모바일 스모크의 이동+점프 측정 위치는 상자 옆이어서 두 화면에서 dx=0, dy=−110을 출력했다. 이 결과를 이동+점프 동시 성공으로 바꾸어 기록하지 않는다. 추가 아트 검사에서는 시작 부두의 열린 공간에서 동시 CDP 터치를 별도로 확인했다: 최종 재검사에서 휴대폰 dx +87px / dy −127.75px, 태블릿 dx +47px / dy −100.75px. 실제 관찰·좌표·46개 화면 경로는 `docs/validation/action-art.json`에 기록했다.

추가 아트 검사는 7무기 보유·S01/S03/S04 저장 픽스처로 원화를 검사하는 것이며 캠페인 완주가 아니다. 실제 입력으로 7종×좌우×두 화면의 무기 손 좌표와 초상을 확인한다. 숨쉬기·점프·낙하·자연 번개 피격·실제 S01 메달 획득 기쁨도 캡처한다. 원화 검사 훅은 읽기 전용이다. 중간 검사에서 짧은 무기 표시 구간 관찰 timeout 1회가 있었고 스크린샷 전에 무기 교체 아이콘이 사라지도록 기다리는 절차를 보완했다. 첫 E2E 실행은 9개 통과 후 NPC 얼굴 가림 수정 때문에 중단했고, 최종 코드로 전체를 다시 실행했다.

전체 실행은 S16/S32 뒤 새로고침·이어하기, 7보물·7무기·엔딩과 S01 재방문까지 정상 입력으로 검증했다. 실제 완주 저장·단계별 시간·오류0은 `docs/validation/complete-journey.json`에 있다. 전체 E2E 후 좌표 import 경로만 생성본으로 정리하고 최적화·감사·타입·린트·82개 단위·콘텐츠·빌드를 재통과했다. 빌드된 게임 JS/CSS 바이트가 동일한 것을 확인했고, 새 import 경로의 S01~S03 3개 E2E(1.6분)와 7종 무기 아트 검사도 다시 통과했다. 전체 30개를 경로 정리 뒤 또 실행한 결과로 쓰지 않는다. 전체 실행의 실제 Playwright 보고서는 `docs/validation/a1-a2-e2e-full.json`(30/30, flaky/skipped 0)에 보존했으며 마지막 HTML 보고서는 추가 3개 재검사 결과다.

스크린샷:
- `docs/screenshots/mobile-phone-start.png`, `mobile-phone-swing.png`, `mobile-phone-dialogue.png` 및 `mobile-tablet-*.png` — 최종 라벨 조정 후 실제 터치 스모크.
- `docs/screenshots/art-a1-a2-before/mobile-*.png` — 작업 시작 당시 이전 화면 보존, 전후 크기·방향 비교.
- `docs/screenshots/art-a1-a2/{phone,tablet}-W01~W07-{right,left}.png` — 28개 무기 비교 화면.
- `docs/screenshots/art-a1-a2/{phone,tablet}-{S01,S03,S04}-dialogue.png` — 새 초상 6개.
- `docs/screenshots/art-a1-a2/{phone,tablet}-{idle-a,idle-b,jump,fall,hurt,joy}.png` — 실제 행동 프레임.
- `docs/screenshots/art-a1-a2-measurement.png` — 원화 좌표 측정용 격자 진단, 게임 에셋에는 글자·격자가 없음.
- `docs/screenshots/art-a1-a2/phone-weapon-comparison.png`, `tablet-weapon-comparison.png` — 28개 화면을 잘라 나란히 둔 비교표. 원본 스크린샷은 그대로 보존했다.

### 기능 완료 / 최종 아트 / 미검증
- A1·A2 기능 연결은 구현했고 위 범위의 자동·브라우저 검증을 통과했다. 아트는 **ART_DRAFT 유지**이며 출시/최종 애니메이션 승인과 구별한다. 나머지 적 행동·NPC 표정·지형·무기 최종 원화·효과·아이콘(A3~A8)은 이번 범위가 아니다.
- **미검증**: 실제 휴대폰·태블릿 하드웨어와 iOS Safari, 어린이 손 크기·조작성, 발열·장시간 FPS, 실제 스피커 음량. 이 환경에서 실기기에 접근할 수 없어 Edge의 터치/뷰포트 모사로 검증했다. 최종 아트 사용자 승인도 미완료다.
- 생성 시트에는 보이지 않을 정도의 알파 ≤16 매트 픽셀이 일부 있다. 원본을 훼손하지 않고 보존했으며 눈에 보이는 실루엣은 셀 경계를 넘지 않는다. 감사의 경계 판정 임계값도 문서화했다.

### 다음 한 작업
- `docs/CODEX_ART_TASKS.md`의 A3 적 행동 시트를 제작·연결하고 예고/공격/항복·저주 해제·빛 소멸을 검증한다.

아래는 이전 작업 기록이며 최신 판정은 위 절을 우선한다.

## 최신 실제 상태 · 2026-10-03 · 모바일·태블릿 UI/UX, 무기 연출, 장면 정리 (Claude)

### 구현 범위
- **터치 조작 재설계** (`src/game/touch.ts`, `src/mobile.css`): 왼손은 ◀ ▶ 방향 패드다. 손가락을 떼지 않고 밀어도 방향이 바뀌고, 수영·비행에서는 4방향 패드가 된다. 오른손은 큰 행동 버튼과 ▲ 점프, 보물 능력(✦), 무기 바꾸기(다음 무기 아이콘)다. 행동 버튼은 무기 아이콘·💬 대화·✋ 살펴보기·⛵ 출발로 바뀐다. 휴대폰 가로·세로와 태블릿 크기를 따로 배치했고 세로 화면에서 버튼이 겹치지 않는 것을 확인했다. `data-action`과 `aria-label` 값은 유지했다.
- **행동 버튼 규칙** (`stage.ts` `actionAttacks`): 손이 닿는 대상이 없거나 맞혀야 하는 표적(조개·금 간 바위)이면 공격한다. 바로 옆의 적이 공격을 예고하거나 공격 중일 때, 또는 이미 대화한 친구 앞에서 적이 가까울 때도 공격한다(같은 힌트 대화가 계속 다시 열리는 문제 해결). 이야기 장치·선물·출구·구조·밧줄은 항상 상호작용이 먼저이고, 비행 구간은 이 규칙을 쓰지 않는다. 설정에 "공격할 때 가까운 적 쪽으로 돌아보기"(기존에 쓰이지 않던 `aimAssist`)를 연결했다.
- **터치 문구**: `src/game/controlText.ts`가 휴대폰에서 "E/J/Q/Space/R"을 "행동/무기 버튼/능력"으로 바꾼다. 맵 라벨, 알림, 대사, HUD에 모두 적용된다. 모든 맵 라벨·대사에 키 이름이 남지 않는지 단위 테스트로 검사한다. S01 선장 튜토리얼의 "Space로 뛰어 보렴"(실제로는 ↑가 점프)도 고쳤다.
- **무기 연출**: 7종 무기 SVG(`public/assets/weapons/`)를 공격할 때 손에 들고 휘두른다(`src/game/weapons.ts`): 곡도·검은 베기 궤적, 창은 찌르기, 방망이는 내려치기, 활은 당기기, 부메랑은 던지기. 이 밖에 공격 때 몸 내밀기, 피격 때 뒤로 밀림·붉은 깜빡임·화면 흔들림, 맞힌 적의 흰 섬광·피해 숫자·별 입자·부드러운 넉백을 더했다. 무기를 바꾸면 머리 위에 아이콘이 뜬다.
- **장면 정리**:
  - 장 배경을 3:2 비율로 바로잡았다(16:9로 늘어나 있었다). 카메라를 따라 천천히 움직이게 해 바닥만 미끄러지던 느낌을 없앴다.
  - 갈색 상자 발판을 장소별 지형 텍스처 17종으로 바꿨다(`src/game/terrain.ts`).
  - 주인공·적에 그림자를 넣고, 적 체력은 "24 / 24" 글자 대신 막대로 보여 준다.
  - 디버그 상자 같던 공격 예고를 바닥 경고 타원으로, 잠긴 문을 흐르는 빛 기둥으로 바꿨다. 적은 공격할 때 앞으로 돌진한다.
  - 점프 중에는 달리기 시트의 공중 프레임을 쓴다.
  - 라벨은 가까운 것만 보이고 서로 겹치면 우선순위(적 경고 → 가까운 물체)에 따라 숨는다.
  - 인물 원화는 원래 비율로 표시한다(NPC 3:4, 보스 압축 해소).
- **휴대폰 UI**:
  - HUD를 정리했다: 하트 체력 막대, 마력 막대, 아이콘 버튼, 지원 기기의 전체 화면(⛶)과 가로 고정.
  - 대화창을 화면 아래 말풍선으로 바꿨다. 아무 곳이나 눌러 넘기고, 게임 장면이 뒤에 보인다.
  - 진행 막대가 있는 로딩 화면, 세로 화면 회전 안내, 홈 화면 설치(manifest·아이콘)를 추가했다.
  - 확대·텍스트 선택·길게 누르기 메뉴를 막았다. 휴대폰에서는 게임 안 글씨를 1.1~1.45배로 키운다.
- **휴대폰 다운로드 경량화**: 원화 원본을 `art-source/webtoon/`(무손실, 배포 제외)으로 옮기고 런타임 축소본을 만들었다(`scripts/optimize-webtoon.py`). 원화 합계는 34.6MB → 2.7MB, 첫 화면 다운로드는 7.60MB → 2.25MB(`check-art-budget`)다.

### 이번에 찾아 고친 버그
1. **S01 되돌아가기 막힘**: 높이 144px 상자(최대 점프 136px) 오른쪽에서는 왼쪽으로 돌아갈 수 없었다. 선장과 대화하지 않고 지나가면 출구 조건(`S01.captainTalk`)을 채울 수 없었다. 상자를 112px로 낮추고 메달 위치를 맞췄다. 바닥 위 블록이 벽이 되는 경우를 `reachability.ts`의 `wallIssues`로 검사한다(36개 맵 중 S01만 해당). 단위 테스트를 추가했다.
2. **터치로 대화를 열면 첫 대사가 넘어감**: 행동 버튼을 누른 손가락의 click이 새로 열린 말풍선에 떨어졌다. 컨트롤 터치 직후 450ms 동안의 click을 막았다. 휴대폰·태블릿 모두 첫 대사가 보이는 것을 실제 터치로 확인했다.
3. **NPC가 주인공과 같은 그림**: S01·S03 선장, S04 선원, S10 안내자가 주인공 원화로 그려져 신밧드가 두 명이었다. 지금은 임시 대체 원화를 쓴다(ART_DRAFT, 전용 원화는 Codex A2).
4. **NPC 옆에서 반격 불가**: 단일 행동 버튼이 대화를 우선해서 생긴 문제다. 이미 대화한 NPC 앞에서는 같은 대화만 다시 열렸다. 위의 행동 버튼 규칙으로 고쳤다. 첫 규칙은 "빈틈" 상태의 연까지 위협으로 보아 S10 선물 앞에서 공격이 나갔다. 전체 E2E에서 이를 발견해 예고·공격 상태만 위협으로 보게 좁혔다.
6. **E2E 경쟁 조건**: S07 파도 테스트가 4번 중 1번 실패했다. 출렁이는 갑판이 높고 부두에 가까운 순간에는 주인공이 물에 빠지지 않고 걸어서 건넌다(충돌 허용 오차 4px). 게임 문제가 아니라 테스트가 갑판 위상을 기다리지 않은 탓이다. 틈이 넓고 낮을 때 걷도록 바꾸고 5회 반복 통과를 확인했다.
5. **키보드 전용 안내**: 휴대폰에서도 "E 대화", "J로 이 조개를 쳐 보세요"처럼 키 이름이 나왔다. 위의 터치 문구로 고쳤다.

### 실제 검사 결과 (2026-10-03)
- `npm run typecheck` 통과 · `npm run lint` 통과 · `npm run test` 12개 파일 80개 통과 · `npm run validate:content` PASS · `npm run build` 통과 · `npx tsx scripts/check-art-budget.ts` 2.25MB/8MB PASS · `python scripts/audit-webtoon.py` 50개 디코딩 PASS.
- 대상 E2E 9개 통과(adventure 3, controls-ui, mobile-abilities, safety 4).
- 전체 E2E (`npm run test:e2e`, Edge, 30개):
  - 1차: 28 통과, 2 실패(26.5분). flight-rings 실패는 첫 행동 버튼 규칙 탓이어서 규칙을 고쳤다. 파도 테스트 실패는 테스트 쪽 경쟁 조건이어서 테스트를 고쳤다.
  - 수정 뒤 2차: 29 통과, 1 실패(25.8분). 새 게임 S01~S36 전체 완주(complete-journey)는 두 번 모두 통과했다.
  - 2차에서 실패한 `flame-waves.spec.ts` "S06 furnaces … S07 waves"는 단독 3회 반복에서 3/3 통과했다. 실패 화면은 S07 첫 부두와 출렁이는 갑판 사이(폭 76~124px, 높이차 0~24px)에서 주인공이 물에 세 번 빠진 모습이다. 테스트의 walk 도우미가 위치와 관계없이 430ms마다 점프해서 생기는 간헐적 실패로 판단한다(같은 구간의 다른 테스트에서도 같은 원인을 확인하고 고쳤다).
  - headless Edge 1280×720에서 S01은 60fps였다. 이 테스트 도우미를 "가장자리에서만 점프"로 바꾸는 일은 남은 작업이다.
- `node scripts/mobile-check.mjs`(Edge headless, `hasTouch/isMobile`, CDP 실제 터치): 휴대폰 844×390과 태블릿 1180×820에서 다음을 확인했다. 콘솔 오류는 0이다.
  - 오른쪽 이동 약 250px
  - 손가락 밀기로 방향 전환
  - 이동+점프 동시 입력(별도 디버그에서 dx +67, dy −118)
  - 첫 해골 처치
  - 선장 앞에서 행동 버튼이 "대화"로 바뀌고 첫 대사 표시

  스크린샷: `docs/screenshots/mobile-phone-*.png`, `mobile-tablet-*.png`.
- 세로 360×740에서 버튼 8개가 겹치지 않는 것을 확인했다. S02·S04·S05·S06·S08·S10·S11·S16·S25·S31을 휴대폰 화면으로 촬영해 라벨 겹침·무기 아이콘 크기·배너 겹침을 고쳤다.
- 미검증: 실제 휴대폰·태블릿 실기기(손 크기·FPS·발열·소리)와 iOS Safari 동작은 확인하지 않았다(전체 화면 API가 iPhone에서 제한되므로 홈 화면 설치를 안내한다). 앱 내 브라우저 창은 화면에 그려지지 않을 때 게임 시계가 멈춰서 정밀 확인은 headless Playwright로 했다.

### 기능 완료와 최종 아트 완료의 구분
- 기능: 모바일 조작·무기 연출·장면 정리는 구현과 자동 검증까지 끝났다. 실기기 검수는 남았다.
- 아트: 여전히 ART_DRAFT다. 주인공 공격·피격 프레임, 적 행동 프레임, NPC 표정, 선장·선원 전용 원화, 지형 타일·무기·효과·UI 아이콘 최종화가 남았다. 이미지 생성이 필요해 Claude 세션에서는 하지 않았다. 계약과 Codex 지시문은 `docs/CODEX_ART_TASKS.md`에 있다.

### 다음 한 작업
- `docs/CODEX_ART_TASKS.md` 6절 지시문으로 A1(신밧드 액션 시트)과 A2(선장·선원)를 제작하고, 실제 휴대폰에서 S01~S03을 직접 플레이해 버튼 크기와 손가락 위치를 조정한다.

아래는 이전 작업 기록이며 최신 판정은 위 절을 우선한다.


## 최신 실제 상태 · 2026-10-02 · 후기 기믹과 웹툰 아트

- Git·공개 배포: 게임 변경은 `d66e08594de1626cccb1862680c28b8c26877174`로 커밋해 `hjpapa/sindbad`의 `origin/main`에 푸시했다. Vercel 생산 배포 `dpl_76oR4MFgL4JvQc3TJGcP4wTzjoUQ`는 같은 SHA로 READY다. https://sindbad-orcin.vercel.app 에서 Edge의 실제 입력으로 새 모험·저장·새로고침·이어하기·새 원화 로드·개발 훅 부재를 확인했고 콘솔/HTTP 오류는 0개, 검사 명령 exit0이었다. 증거는 docs/validation/production-smoke.json과 docs/screenshots/production-play.png, production-resume.png다. 공개 주소의 36구간 재완주는 하지 않았으며 전체 완주 결과는 동일 코드의 로컬 E2E다.
- Git·공개 배포: 게임 변경은 `d66e08594de1626cccb1862680c28b8c26877174`로 커밋해 `hjpapa/sindbad`의 `origin/main`에 푸시했다. Vercel 생산 배포 `dpl_76oR4MFgL4JvQc3TJGcP4wTzjoUQ`는 같은 SHA로 READY다. https://sindbad-orcin.vercel.app 에서 Edge의 실제 입력으로 새 모험·저장·새로고침·이어하기·새 원화 로드·개발 훅 부재를 확인했고 콘솔/HTTP 오류는 0개, 검사 명령 exit0이었다. 증거는 docs/validation/production-smoke.json과 docs/screenshots/production-play.png, production-resume.png다. 공개 주소의 36구간 재완주는 하지 않았으며 전체 완주 결과는 동일 코드의 로컬 E2E다.
- 기존 저장·보상 ID를 유지하면서 S09~S36의 방향 장치, 운반/배달, 가까이 머무르는 정화, 일곱 보물 시련, 편지·전시·축제를 실제 상호작용으로 추가했다. 선택 상단 발판은 위쪽만 충돌하며 주 경로는 막히지 않는다.
- S16은 보호된 비전투 입구에서 장치 세 개를 완료한 뒤 T04/W05를 받고 자유 수영을 연습한다. S25는 도깨비불 세 개를 안내한 뒤 T05/W06을 받고 실제 달빛 충돌 다리를 만든다. S30은 T01~T07을 각각 검사하고 소모하지 않는다.
- S19는 쿠우라의 분신, S31은 기본 HP900(편안 모드 765)의 본체와 세 단계 마법 패턴이다. 본체 보호막은 두 봉인석 정화로 열린다. 인간 카딘은 항복하고, 저주 동물은 저주 해제, 마법 적은 빛으로 돌아간다. S32 협력 별자리·아리아나 동행, S35 성인 두 사람의 자발적 결혼·왕의 축복, S36 전시·크레딧·자유 탐험을 연결했다.
- R03 독 지속 4→2초, R04 물건 이동 속도 50% 증가, R05 미개봉 선택 보물 방향, R06 식물 피해 20% 감소, R07 동행 회복을 실제 플레이에 연결했다. W04 긴 창, W05 화살, W06 넉백·타격 효과·선택 바위 파괴, W07 보호막 관통을 구별한다.
- 장별 배경 7종, 신밧드·아리아나·쿠우라·세이렌·불꽃 수호자·게·나이라·미라·바루·왕·하미드·지니·로크새·고래·거인 요리사·코끼리의 웹툰 원화, 주인공 달리기 6프레임과 적 6종 시트를 제작했다. 실제 WebP는 25종, 모두 디코딩해 크기·SHA256을 기록했다. 운반물·장치·등불·제단·무기 등 자체 SVG 18개와 정화·공격·보물 입자를 추가했다. 현재 장의 이미지만 로드하고 불필요한 이전 장 텍스처를 정리한다. 출처는 docs/ART_PROMPTS.md와 docs/ASSET_REGISTER.md.
- S04 고래 섬, S15 거인 요리사와 1.2초 국자 증기 예고, S10/S33 등 위 탑승 위치를 보완했다. 후기 장의 중간 쉼터와 필수 선물 보상은 함께 저장된다. S25 연습은 E 조사만으로 완료되지 않고 실제 달빛 다리 위의 오른쪽 빛까지 올라가야 완료된다.
- 실제 검사(현재): typecheck, lint, 단위 76개, validate:content, build 통과. S16 획득/수영/저장, S25 운반 중 재접속, S31 보호막/전투/보상 저장 검사가 통과했다. 마지막 S25 물리 다리 통과·12.5초 서 있기·중간 쉼터 재개와 S15 주방 완주 추가 2개는 exit0 통과했다. 첫 진입 원화+JS/CSS 파일 크기 합계 7.60MB/8MB는 PASS이며 실제 기기 성능 측정은 아니다.
- 최종 전체 검사: `npm run test:e2e`의 30개가 26.0분에 전부 통과하고 exit0으로 정상 종료했다. 최종 코드의 새 게임 S01~S36·7보물·7무기·엔딩 저장·S01 재방문은 정상 키 입력만으로 13.6분에 통과했다. S16/S32 이후 새로고침·이어하기도 확인했고 이 경로의 콘솔·HTTP 오류는 없었다. 실제 저장/단계별 시간은 docs/validation/complete-journey.json, 명령 결과는 docs/VALIDATION_LOG.md와 docs/validation/checks.json이다.
- ART_DRAFT 유지: 웹툰 원화와 달리기는 적용했지만 명세의 전체 공격/피격/표정 프레임 및 최종 승인, 실기기 조작성·장시간 성능·실제 스피커 청취 검수는 미완료/미검증이다. 기능 완주와 출시 아트 승인, 실제 어린이 난이도 검수를 같은 완료로 처리하지 않는다.
- 다음 한 작업: M6의 신밧드·적 공격/피격과 NPC 표정 프레임을 제작·정렬하고 실제 휴대폰에서 조작성·FPS·음량을 검수한다. 기능 완주와 최종 아트/출시 검수 완료를 구별한다.

아래는 이전 작업 기록이며 최신 판정은 위 절을 우선한다.

## 최신 실제 상태 · 2026-09-24

### 후속 맵 점검 · 공중 적·장애물과 귀환 이야기

- S10에 공중 연 6마리, 돌풍 3개를 추가했다. 연은 2D 거리로 플레이어를 추적하고 바람탄을 예고한 뒤 발사하며, Space는 장착 무기와 분리된 로크 날개 공격으로 작동한다. 피하거나 쓰러뜨릴 수 있고, 전부 잡지 않아도 착륙할 수 있다.
- S33에 공중 연 5마리, 움직이는 낙하 파편 5개, 아리아나 동승 SVG를 추가했다. 파편과 돌풍은 어린 플레이어가 위·아래로 우회할 공간을 남기고, 맞으면 낮은 피해와 밀어내기만 적용한다. 고리 선택 도전은 필수 진행과 분리됐다.
- 비행 중 무기 교체·보물 능력 버튼을 잠시 숨기고 HUD를 `로크의 날개 · Space 공격`으로 바꿨다. 중간 위치 자동 체크포인트와 장애물 진행 안내를 추가했다. S33 대사는 아리아나의 지도와 신밧드의 응답으로 장면 연결을 보강했다.
- 실제 검사: typecheck, lint, 단위 68개, validate:content, build 통과. 전체 E2E 23개가 exit 0으로 통과했다. S07 낙하 테스트는 기존 820px 복귀 창에서 프레임 관찰이 놓칠 수 있어 1020px로 넓혔고, 해당 시나리오 3회 반복도 모두 통과했다. 전체 실행에서 S04~S05 황금 하트와 S07 파도·낙하·저장 복원을 확인했다.
- 앱 내 브라우저 연결은 browser-use 런타임의 신뢰된 네이티브 브리지 부재로 미검증이다. Edge 기반 Playwright에서 실제 키 입력·공격·피격·저장·모바일 레이아웃을 검증했고 `docs/screenshots/flight-rings.png`를 남겼다.
- `kite.svg`, `stormCloud.svg`, `debris.svg`, `ariana.svg`는 직접 작성한 ART_DRAFT다. 최종 다중 프레임 애니메이션과 실기기 음량·성능, 후기 맵 전체의 고유 기믹은 아직 미완료다. 전체 완성도 90% 달성으로 표시하지 않는다.
- 다음 한 작업: 남은 후기 맵의 반복 지면 구조를 장면별 상호작용으로 줄이고, 각 장면의 고유 기믹을 추가 검증한다.
- Git 반영: 새 에셋·E2E 파일을 포함한 변경 27개를 `e3624e7` (`feat: add guided flight stages and polish campaign`)으로 커밋하고 `origin/main`에 푸시했다.

### 후속 맵 점검 · 선택 비행 고리와 탑승 표현

- S10의 지면 조사 표식을 고도 210~390의 선택 고리 3개로, S33은 선택 고리 5개로 변경했다. 이동으로 통과하면 자동 수집되며 S10 금화는 한 번만 지급한다. 기존 고리 ID는 유지했다. 고리를 놓쳐도 착륙장 기록과 다음 구간 진행이 가능하다.
- 비행/수영의 상단 이동 한계를 추가하고 콘텐츠 검사도 공중 목표의 실제 이동 범위를 검사한다. 로크새 탑승 SVG와 날갯짓 변형, 금빛 고리 SVG를 자체 제작했다. 상승/하강 안내를 표시한다.
- 실제 검사: typecheck, lint, 단위 67개, validate:content, build 모두 통과. 관련 E2E 5개(음향·간편 조작·비행 고리·S09~S12 연속 진행·모바일 S26 능력)가 exit 0으로 통과했다. 로크새 추가 후 비행 E2E도 재실행하여 exit 0 통과. 실제 키 입력으로 고리 수집·중복 보상 방지·저장 복원·상단 경계·선택 고리 생략 후 기록 획득을 확인했다. 스크린샷은 docs/screenshots/flight-rings.png에 저장했다.
- 미검증/미완료: 이번 전체 E2E 재실행 없음, S33 직접 완주 미검증. 로크새 전용 공격·공중 해적/낙하 장애물·후기 고유 기믹·최종 애니메이션은 미완료다. 전체 완성 또는 최종 아트 완료로 판단하지 않는다. 변경은 로컬이며 이번에는 커밋/배포하지 않았다.
- 다음 한 작업: S10/S33의 공중 적과 안전한 장애물 경로를 구현하고 두 구간의 실제 입력 완주를 검증한다.

### 후속 품질 점검 · 항해 음악과 재생 수명 관리

- 이전 목표 턴은 모바일 조작 코드를 바꾸고 실제 입력 검증을 추가한 진전이었다. 현재 코드 재점검 후, 지속음뿐이던 배경음을 자체 선율 32개와 저음 반주가 있는 92 BPM 항해 음악으로 교체했다. 효과음의 음높이 변화와 재생 종료 후 오디오 노드 정리를 추가했다.
- 메뉴·대화·창 이탈은 음악 예약과 재생을 정지하고, 모험 복귀 때 재개한다. 음량 0에서는 예약 타이머도 정지하며 반복 재개가 타이머를 중복 생성하지 않는 단위 검사를 추가했다. 외부 음원은 사용하지 않는다.
- 검사: 타입·린트·단위 66개·콘텐츠·빌드 통과. Edge 실제 AudioContext를 관찰하는 음향 E2E에서 시작/메뉴 정지/재개/음소거와 pageerror 0을 확인했다. 음향·간편 조작·모바일 능력 E2E 3개 모두 ok 출력 후 러너가 종료되지 않아 중단했다. 명령 exit 0은 미확인이다. Vite를 Node로 직접 실행해도 동일해 설정 변경은 원복했다.
- 청취 품질, 실기기 음량 균형, 후기 맵별 고유 기믹과 이야기 연출은 미완료다. 전체 목표를 완료 처리하지 않는다. 이번과 이전 모바일 보완은 로컬 변경이며 아직 배포하지 않았다.
- 다음 한 작업은 후기 맵 고유 기믹 구현과 터치 완주 검증이다.

### 후속 품질 점검 · 모바일 필수 조작 복구

- 이전 개선 작업은 코드·검증·배포를 변경한 실제 진전이었다. 이번 현재 코드 점검에서는 네 버튼 단순화로 하강/보물 능력이 빠진 것을 확인했다. 비행·수영에서만 하강, 선택 보물이 있을 때만 능력 버튼을 표시하도록 수정했다. 세로 화면에서 가방 접근도 복원했다.
- S26 다리 앞의 행동은 T05 소유와 MP 12를 검사해 필요한 보물을 바로 사용한다. 선택 능력은 바꾸지 않으며, 완료한 보상을 재지급하거나 MP를 중복 차감하지 않는다. S09의 오래된 Space 이단 점프 안내도 ↑로 정정했다.
- 실제 검사: 타입·린트·단위 63개·콘텐츠·빌드 통과. `npm run test:e2e -- tests/e2e/mobile-abilities.spec.ts tests/e2e/controls-ui.spec.ts`에서 2개 시나리오가 각각 ok로 출력됐다. 360×740에서 포인터로 상승/하강·능력 사용·S26 다리·저장 복원을 검증했다. 두 결과 이후 러너가 종료되지 않아 중단했으므로 해당 명령 exit 0은 미확인이다. 전체 19개 회귀 결과는 아래 이전 작업 기록이며 이번에는 재실행하지 않았다.
- 이번 변경은 로컬이며 아직 커밋·배포하지 않았다. 완성도 90% 달성은 미입증이다. 후기 맵의 반복 구조, 최종 캐릭터 애니메이션, 이야기 연출, 음악 구성, 실제 어린이/휴대폰 검증은 남아 있다.
- 다음 한 작업: 후기 맵을 평지 반복에서 각 장면의 실제 기믹이 있는 구조로 개선하되, 문맥 행동과 터치 입력만으로 필수 경로를 완주하는 검사를 추가한다.

- S01~S36의 36개 ID가 모두 `implemented`로 등록되어 있고, 각 스테이지에 서로 다른 목표·대화·보상·배경 테마·출구가 있는 플레이 맵이 존재한다. S13/S28/S34~S36은 전투 없는 구간이며 나머지는 항복/저주 해제/빛 소멸 규칙을 따른다.
- M0~M5의 기능 구현 범위를 완료했다. T03 이단 점프·지정 비행, T04 자유 수영, T05 12초 달빛 다리, T06 연꽃 방패, T07 새벽 파동과 W04~W07을 실제 입력에 연결했다. 7무기·7보물·7유물·8황금 하트·캠페인 플래그는 멱등 저장된다.
- S09~S36은 `src/content/finalStages.ts`의 개별 청사진과 `src/content/maps.ts`의 기존 S01~S08을 합쳐 구성한다. 콘텐츠 검사는 36개 플레이 맵, 선행 능력 획득 순서, 필수 보상 구현, 대화/자산/체크포인트 참조를 검사한다.
- 자체 제작 SVG 34개와 12개 지역 팔레트 기반 Phaser 배경을 사용한다. 플레이어·후기 적 3종·퀘스트/선물/다리/엔딩 9개 핵심 SVG를 그라데이션·외곽선·그림자 스타일로 다시 제작했고, 다층 원경·발판 음영·스테이지 등장 카드를 추가했다. 외부 이미지·음원은 없다. 몬스터는 빛 입자로 사라지고 사람 적은 항복한다. 최종 다중 프레임 웹툰 애니메이션 승인은 남아 있어 `ART_DRAFT`를 유지한다.
- 점프 물리(중력 1500, 초속도 -640)에 맞춘 안전 상승 120px/간격 170px 도달성 검사를 36맵 전체에 추가했다. S03 돛대에 중간 발판을 넣었고, S09~S36의 장식 충돌체는 어린 사용자가 옆면에 막히지 않도록 제거해 연속 지면과 비충돌 배경으로 정리했다.
- 조작은 키보드 `← →`, `↑/W` 점프, `Space` 문맥 행동으로 단순화했다. J/E/K/R/Q 등 기존 보조키는 유지한다. 모바일은 `← → ↑ 행동` 네 버튼, safe-area 여백, 낮은 화면 전용 HUD로 정리했다. Web Audio 합성 배경음과 기존 효과음에 각각 음량 설정을 연결했다.
- 2026-09-23 최신 로컬 검사: typecheck 통과, lint 통과, 단위 63개 통과, 콘텐츠 검사 통과, production build 통과. 수정 완료 뒤 `npm run test:e2e` 전체 19개가 8.5분에 exit 0으로 통과했다. 새 간편 조작·몬스터 소멸·844×390 UI 검사, S01~S12 실제 진행, S28 능력 저장, S36 엔딩, S09~S36 렌더를 포함한다.
- 앱 내 브라우저에서 로컬 게임을 직접 열어 844×390 가로 화면, 네 버튼 조작, 스테이지 카드 소멸, 빈 HUD 표식 제거를 육안 확인했다. 실제 휴대폰/태블릿 기기, Safari/Firefox, 어린이 사용자 난이도·3~7분 분량, 장시간 FPS/메모리, 최종 아트 승인은 아직 미검증이다.
- 아래 항목은 개발 과정의 과거 상태 기록이며 최신 판정에는 이 절을 우선한다.

## 이전 상태 기록 (S08 완료 시점)

- 작업 날짜: 2026-09-23 / 빌드 0.1.0 + M2 S04~S08 / 기준 명세 1.0.
- M0 + M1 완료에 이어 M2 S04~S08을 구현했다. M2 전체(S04~S10)는 진행 중이다.
- 전체 목표는 36스테이지, 아이 장면 24개, 무기 7종, 핵심 보물 7개 그대로 유지한다.
- 실제 맵은 S01~S08만 존재한다. S09~S36은 `planned`이며 지도에서 개발 중으로 잠겨 있다. 빈 맵이나 복사 맵을 완료로 세지 않는다.
- 코드의 콘텐츠 등록 상태는 S01~S08 `implemented`, 플레이 검증은 아래 표와 docs/PLAYTEST_LOG.md에서 별도 관리한다.
- 최종 아트 승인 없음. 자체 제작 SVG·Phaser 배경·합성 효과음은 모두 ART_DRAFT다.
- 기존 문서만 있던 폴더에서 시작했다. 이후 사용자의 GitHub/Vercel 배포 요청에 따라 Git 저장소를 초기화하고 아래 공개 배포를 수행했다. 게임 로그인·DB·외부 AI API는 없다.

## 진행표

| 단계 | 범위 | 기능 | 아트 | 실제 검증 |
|---|---|---|---|---|
| M0 | 프로젝트·콘텐츠·저장 기반 | 완료 | 간이 자산 등록 | 타입·린트·단위·콘텐츠·빌드·제목 화면 통과 |
| M1 | S01~S03 | 완료 | ART_DRAFT | 새 게임 연속 완주 + 복귀/저장/터치 E2E 통과 |
| M2 | S04~S10 | S04~S08 구현, S09~S10 planned | S04~S08 ART_DRAFT | 아래 현재 검사 기록 참조 |
| M3 | S11~S19 | planned, 구현 미착수 | missing | 미실행 |
| M4 | S20~S29 | planned, 구현 미착수 | missing | 미실행 |
| M5 | S30~S36 | planned, 구현 미착수 | missing | 미실행 |
| M6 | 최종 웹툰 아트·기기 검수 | 미착수 | 최종 승인 없음 | 미실행 |

## 구현한 기능과 파일

- Phaser 3.90.0, TypeScript 5.9.2 strict, Vite 7.1.5. Node 24.16.0 / npm 11.13.0 / Windows 빌드 26200. npm lockfile 유지.
- src/content/campaign.json, stageIndex.ts: 36개 ID·연결·24개 아이 장면·필수/선택 보상·선행 무기/보물/플래그·완료 설명. 7무기·7보물·8황금 하트 등록. S05 bubbleBlessing과 S16 T04를 구분.
- src/content/maps.ts: S01 항구 상자 탐험·해골 4/궁수/대장·출항 종, S02 암초 틈·조개 종 3개·세이렌·부메랑 상자·등대, S03 갑판·피뢰 장치 2개·정령 3·번개·폭풍 수정·돛대 위기·밧줄.
- src/game/stage.ts: 이동/가속/점프/입력 버퍼/코요테/회피, 실제 충돌체 42×84, 공격 예고·빈틈·3타 콤보, 공격당 중복 방지, 부메랑 왕복/복귀, 안전 발판 낙하 복귀.
- src/core/: 하트 회복, totalXp 파생 레벨, 레벨업 완전 회복, 멱등 보상, W01/W02 장착·쿨다운, R01 줍기 반경 96px, R02 번개 피해 25% 감소, 저장 검증/백업/실패 대응.
- src/main.ts: DOM 제목·HUD·NPC 대화/전체 생략·가방/지도·일시정지·설정·이어하기·JSON 내보내기/가져오기. 창 이탈 자동 정지. 다중 탭 저장 충돌 안내.
- src/game/input.ts: 키보드와 터치 공통 경로, 멀티 포인터, cancel/leave/blur 해제.
- public/assets/draft 및 assets.manifest.ts: 실제 존재하는 자체 작성 SVG 27개. 누락 시 생성 텍스처 fallback.

## 최초 M0/M1 검사 기록 (2026-09-06)

| 명령 | 최종 결과 |
|---|---|
| npm run typecheck | 통과 |
| npm run lint | 통과 |
| npm run test | 2개 파일, 37개 테스트 통과 |
| npm run validate:content | 36단계·24장면·7무기·7보물·8하트, 획득 순서/참조/필수 발판/체크포인트/파일 통과 |
| npm run build | 통과, Vite 빌드 5.22초. Phaser 큰 청크 경고는 남음 |
| npm run test:e2e | 설치된 Edge, 8개 통과 (전체 2.4분) |

브라우저 통과 시나리오: 새 게임→S01→S02→S03 정상 키 입력 완주(약 1.4분 자동 플레이), 대화 정상 진행/생략, 메달·하트·레벨업·W02 교체/왕복, 보스 승리, 중간 새로고침, S04 잠김, 일시정지, 내보내기/가져오기, 844×390 터치 동시 입력, 누락 파일 fallback, 미래 저장 보존, 실제 피격/하트 회복, 낙하 복귀, 자연 번개 사망/완전 회복/보물 유지, 보스 저장 복구, 저장 차단 시 플레이/내보내기.

정상 캠페인 검사의 pageerror와 HTTP 400+ 응답은 0개였다. 일부 별도 실패 조건 테스트는 의도적으로 파일 로드/저장을 차단했다. 로그는 docs/VALIDATION_LOG.md, HTML 결과는 playwright-report/index.html, 영구 보관 스크린샷은 docs/screenshots/에 있다.

## 남은 제한·미검증

- 아트는 최종 한국 웹툰 아트가 아니다. 간이 전신/2프레임 이동, 재사용 표식과 초상이다. 배경 음악도 미구현이다.
- S09 이후 플레이, T03~T07 실제 능력, 자유 수영/비행/마법 다리는 미구현이다. S04 G01/S05 G02는 실제 획득 가능하며 공기방울 호흡 보호만 구현했다.
- 앱 내 수동 브라우저 연결은 권한 브리지 문제, 별도 UI Edge 연결은 사용 불가였다. 대신 설치된 Edge headless에서 실제 입력을 자동 수행하고 스크린샷을 육안 확인했다. 수동 손 플레이·실제 휴대폰/태블릿·Safari/Firefox는 미검증이다.
- 모바일 모사에서 터치 동작은 확인했으나 캔버스 내부 글씨가 작다. 최종 모바일 가독성·세로 화면·실기 접근성 검수는 M6에 필요하다.
- 60fps/장시간 메모리/기기 성능과 어린이 대상 난이도·3~7분 분량·45~100초 보스 목표는 미검증이다. 자동화 완주 시간은 목표 플레이 시간 측정으로 대체하지 않는다.
- Phaser 청크 약 1.48MB(압축 339.84kB), ESLint 고정 버전 지원 종료 설치 경고. 빌드/검사는 성공했지만 추후 도구 갱신·번들/아트 최적화가 필요하다.

## GitHub 및 Vercel 배포 — 2026-09-06

- 저장소: https://github.com/hjpapa/sindbad (`main`). 기존 원격이 비어 있음을 확인한 뒤 초기 구현 커밋 `6db826d`를 push했다.
- 운영 URL: https://sindbad-orcin.vercel.app
- Vercel 팀/프로젝트: `docsusil-hjpapa/sindbad`, GitHub 저장소 연결 완료.
- 최초 배포 `dpl_5V9Z7mE7s8bFqGtmj2W6G2keWeA6`: production READY. Vercel에서 `npm ci`, 타입 검사, 콘텐츠 검사, Vite 빌드 성공.
- 배포 준비 중 로컬 `npm run build` 재실행 통과(4.86초). 게임 코드 변경이 없어 기존 단위 37개/E2E 8개 결과를 유지하며 이번 배포 단계에서 전체 테스트를 재실행하지 않았다.
- 공개 운영 URL에서 Edge headless 검증 통과: HTTP 200, 새 모험 S01, 캔버스 표시, 이동/점프/공격 키 입력, 체크포인트 저장→새로고침→이어하기. pageerror/HTTP 400+ 0개, 프로덕션 테스트 훅 없음. 공개 배포 S01~S03 전체 완주는 별도 미검증(로컬 E2E 완주 결과는 위 참조).
- 증거: `scripts/verify-deployment.mjs`, `docs/screenshots/production-play.png`, `production-resume.png`. 스크린샷은 육안 확인했다.
- `.vercel`, `.env*`, 의존성/빌드 산출물 및 원본 중복 ZIP은 Git에서 제외했다.
- 설치 로그의 보안 경고를 확인했다. `npm audit --omit=dev`: 취약점 0개. 전체 audit: 개발 의존성 Vite high 1개, Vitest critical 1개, exit 1. 정적 배포에는 해당 개발 서버를 실행하지 않는다. 후속 도구 갱신에서 Vite 7.3.6/Vitest 3.2.7 이상과 회귀 검증 필요.

## 다음 한 작업

다음은 S09 로크새의 둥지다. 보스의 저주 해제, T03 확정 획득, 이단 점프·활공을 구현하고 이후 S10 지정 비행으로 M2를 마무리한다. 현재 S09~S10은 planned다.

## 2026-09-08 · 사용자 요청으로 이전 2D 버전 복구

- 복구 기준: 3D 변경 전 운영 버전 `c17f9ce`. 3D 모델·입체 렌더러·크림/민트 UI와 관련 의존성/테스트/아트 방향 변경을 되돌렸다.
- Git 이력을 삭제하거나 강제 push하지 않고 3개 변경 커밋을 역적용했다. 3D 실험 코드는 과거 커밋에서 확인할 수 있다.
- src, package.json, package-lock.json, vite.config.ts, index.html은 기준 커밋과 차이가 없음을 확인했다. 저장 데이터/스키마를 변경하거나 초기화하지 않았다.
- 최초 npm ci는 실행 중 개발 서버의 esbuild 파일 잠금으로 실패했다. 해당 서버 종료 후 npm ci --offline 재실행 성공. 이후 검사는 별도로 다시 실행했다.
- 다음 작업은 기존 2D 아트 방향을 유지한 M2 S04~S05이다. S04~S36은 계속 planned로 남는다.
- 복구 후 실제 재검사: typecheck / lint / 단위 37개 / 콘텐츠 / build 모두 통과. 전체 Edge E2E 8개 통과(2.6분). 빌드 JS/CSS 해시는 3D 변경 전과 동일하다. Phaser 큰 청크 경고는 기존과 같다.
- 공개 복구 완료: 사용자 추가 승인 후 복구 커밋 1d134b1을 GitHub main에 push했다. Vercel production dpl_GcxK8bxG8ygT6GfUp4TSmW9PNdDu가 READY이며 https://sindbad-orcin.vercel.app 에 이전 2D 버전이 연결됐다. 이전 자동 승인 거부는 추가 승인 후 해소됐다.
- 공개 사이트 재검증 통과: HTTP 200, 이전 2D 화면 육안 확인, 새 게임·이동/점프/공격 입력·저장·새로고침·이어하기. pageerror/관측 HTTP 400+ 0개, 개발 훅 없음. 실행 명령은 node scripts/verify-deployment.mjs https://sindbad-orcin.vercel.app. 이번 공개 반영 단계에서는 앞선 복구 검사의 단위 37개/E2E 8개를 재실행하지 않았다.

## 2026-09-08 · M2 첫 구간 S04~S05 (로컬 구현)

### 실제 구현

- S03 완료 화면의 다음 항로를 S04로 연결했다. 기존 M1 저장에서도 지도에서 S04를 선택할 수 있다. 최종 구현 구간 S05 뒤 S06~S36은 잠긴 planned 상태다.
- S04: 서로 다른 구간의 구명 장비 3개, 고래 등/바다 배경, 껍질 게 4, 2.4초 경고 후 최대 48px 오르내리는 실제 물리 발판, 구조 보트 출구, 바위 아치 선택 G01. 고래는 공격 대상이 아니며 탈출 시간 초과 즉사가 없다. 움직이는 발판에서는 안전 체크포인트를 기록하지 않는다.
- S05: 산호 수호병 5(정면 방패/공격 뒤 빈틈), 산호 열쇠, 왕관 장식 상자, 실제 충돌로 막힌 산호문, 나이라 구출, 구출 후 선택 G02, 산호 수역 및 출구. 왕관 없이 문을 열거나 넘어갈 수 없고 구출 전에는 G02를 지급하지 않는다.
- 구출 처리는 보상 ID/구출 목표/bubbleBlessing/안전 체크포인트를 한 저장 상태로 확정한 뒤 대화를 시작한다. 대화 전체 생략·대화 도중 새로고침·재대화에도 중복 지급되지 않는다.
- G01/G02는 기존 안정 ID S04.golden.G01 / S05.golden.G02를 사용한다. 최대 체력 +10, XP 15, 획득 시 완전 회복, 재획득 방지 및 가방 표시를 구현했다.
- 공기방울은 S05 실제 수역에서 호흡을 보호하고 캐릭터 주위에 표시된다. 아직 S07/S16 맵이나 자유 수영은 구현하지 않았다. T04는 S16 등록 그대로이며 이번 구출 보상에 포함되지 않는다.
- 원본 자체 SVG 6개와 고래/산호 Phaser 배경 추가. 현재 총 SVG 17개, 모두 ART_DRAFT. 기존 2D 디자인을 유지한다.
- 콘텐츠 검사에 움직이는 발판 범위/경로 양 끝 높이, 정지 지형의 체크포인트, 실제 플래그 보상, 목표 선행조건 순환, 수역 범위를 추가했다.

### 검사 범위 및 남은 작업

- 새 단위 테스트: 구출의 원자적 저장, 황금 하트 중복 방지/저장 복원, 공기방울과 T04 구분, 움직이는 발판 범위, 방패 앞/뒤/빈틈.
- 브라우저: 기존 M1 저장에서 S04~S05 완주, G01/G02, 이동 발판, 체크포인트 재개, 구출 대화 도중 새로고침, 실제 수역에서 11초 이상 보호, 열쇠/왕관 없는 상자·문 차단, 방패 방어/빈틈. 기존 캠페인 테스트는 S03 완료 후 S04 진입까지 확장했다.
- 중간 자동 플레이에서 로딩 중 player를 읽거나 점프 중 조사 키를 눌러 장비를 놓치는 테스트 실패가 있었다. 로딩 대기 및 착지·거리 확인을 추가한 뒤 전체 10개 E2E가 통과했다.
- M2 전체 완료 아님: S06~S10/T01~T03/W03는 아직 planned. 다음 한 작업은 S06~S07이다. 최종 아트·실제 모바일 기기·Safari/Firefox·긴 시간 성능·어린이 난이도 검수는 미검증이다.
- 이번 변경은 로컬 작업이며 공개 사이트에는 아직 배포하지 않았다. 현재 공개 주소는 이전 M1 2D 복구 버전이다.

### 최종 실제 검사 결과

| 명령 | 2026-09-08 결과 |
|---|---|
| npm run typecheck | 통과 |
| npm run lint | 통과 |
| npm run test | 43개 통과 |
| npm run validate:content | 통과 · S01~S05 implemented, S06~S36 planned |
| npm run build | 통과 · 5.98초, 기존 Phaser 큰 청크 경고 유지 |
| npm run test:e2e | 설치된 Edge headless · 전체 10개 통과, 3.6분 |

S04~S05 정상 진행 검사에서 pageerror/HTTP 400+는 0개였다. 스크린샷 S04-moving-whale.png, S05-bubble-golden.png, M2-part-one.png를 docs/screenshots에 보관하고 육안 확인했다. 수동 플레이·실제 모바일 기기·공개 배포 검사는 이번에 실행하지 않았다.

## 2026-09-08 · S04~S05 커밋/푸시와 S06~S07 구현

### 저장소 반영

- 사용자 요청으로 이전 S04~S05 작업을 9ef4816 (Implement M2 whale and coral stages S04-S05)으로 커밋하고 origin/main에 push 성공했다.
- main에 연결된 Vercel 자동 배포의 완료 여부/공개 S04~S05 플레이는 이번 작업에서 별도 확인하지 않았다.
- 아래 S06~S07은 후속 로컬 변경이다. 이번에 push한 9ef4816에는 포함되지 않는다.

### 실제 구현 범위

- S06: 주변 횃불에서 받는 불씨 3개와 화로 3개, 검으로 진정시키는 정령 5명, 라흐 대화. T01/W03/선택 스킬/체크포인트를 대화 시작 전에 한 보상으로 저장한다. 기존 안정 ID S06.reward.flameTreasure를 사용하며 저장 허용 목록도 같은 보상 생성 함수를 참조한다.
- T01: 전방 파동 R/터치 불꽃, W01 성장 피해 ×1.5, 15MP, 4초 재사용. 스킬 사용 2초 후 초당 5MP 회복. 일시정지 중 월드·쿨다운·회복이 함께 멈춘다. 기존 스킬 선택이 있으면 자동 변경하지 않는다.
- W03: 14 기본 피해/460ms 간격, 명중 후 3초 동안 초당 2의 불꽃 지속 피해. 재명중 시 중첩 없이 지속 시간만 갱신한다. Q/숫자/가방 교체와 연결했다.
- S06 필수 연습 문양과 입구 덩굴은 T01 보유 후 E 무료 점화. 입구 덩굴 뒤 선택 금화함은 한 번만 지급한다. 초기 화로에 T01을 요구하지 않는다.
- S07: 고정 경로를 왕복하는 물리 갑판 3개, 유목 발판 장애물, 물 정령 4명, 파도 3구간. 2.2초 예고 후 밧줄 E로 버티거나 높이 점프한다. 실패는 기본 10 피해 후 복귀하며 다시 시도 가능하다. 물에 빠져도 기본 10 피해 후 가까운 갑판으로 돌아간다.
- 세 번째 파도 뒤 마지막 갑판이 3초간 32px 내려가고 공기방울 보호 수역으로 연결된다. 닻 조사 시 genieCave와 안전 체크포인트를 대화 전에 저장한다. 침몰 자체에 사망 판정은 없다.
- S01~S07 실제 맵, S08~S36 planned 유지. M2 전체 완료가 아니다. 새로운 최종 아트는 없으며 자체 SVG 5개 추가로 총 22개 ART_DRAFT다.

### 실제 검사와 제한

- typecheck, lint, 단위 49개, 콘텐츠 검사, build 통과. 빌드 5.94초, 기존 Phaser 큰 청크 경고 유지.
- S06~S07 연속 정상 키 입력/보물 대화 도중 새로고침/덩굴/동굴 재개, 불꽃 MP·일시정지·지속 피해의 개별 E2E 2개 통과(2.2분). 파도 실패·재도전·실제 낙하 복귀 개별 검사 1개 통과(16.6초).
- 초기 단위 검사에서 새 보상 ID 허용 목록 누락을 수정했다. 초기 브라우저 실행은 개발 파일 변경에 따른 자동 재로딩과 이미 약해진 적 선택으로 실패했으며, 실행 중 런타임 변경을 중단하고 지속 피해 검사의 적을 분리해 재실행했다.
- 전체 회귀 E2E는 아래 최종 기록처럼 13개 통과했다. 앱 내 브라우저는 privileged native pipe bridge is not available / browser-client is not trusted 오류로 연결 불가. 설치된 Edge headless의 실제 입력 자동화와 스크린샷 확인으로 검증했다.
- 실제 손 플레이, 어린이 난이도/목표 소요 시간, Safari/Firefox/실제 휴대폰, 장시간 성능, 최종 아트/배경 음악은 미검증이다. S08~S10과 T02~T03은 다음 구현 범위다.

### S06~S07 최종 회귀 결과

npm run test:e2e: 설치된 Edge headless 전체 13개 통과(5.9분). 기존 S01~S03 새 게임 완주/저장/터치, S04~S05 이어하기, S06~S07 연속 진행/첫 보물 저장 복원, MP·일시정지·지속 피해, 파도 실패/낙하, 기존 사망/보스/저장 차단 회귀가 모두 통과했다. 정상 S06~S07 시나리오의 pageerror/HTTP 400+는 0개였다. 마지막 테스트 보완 후 typecheck/lint도 다시 통과했다.

스크린샷: docs/screenshots/S06-first-flame.png, S07-boat.png, S07-cave-resume.png, S07-wave-warning.png. S06 화면과 S07 갑판/물속 재개 화면을 육안 확인했다. 위 검사 완료 당시 S06~S07은 로컬 변경이었다. 다음 한 작업은 S08 지니 동굴의 수정 퍼즐과 T02 확정 획득이다.

### S06~S07 저장소 반영 요청

사용자 요청에 따라 검증된 S06~S07 코드·자산·테스트·문서를 main 커밋/푸시 대상으로 확정했다. 게임 코드 변경 없이 기존 단위 49개/E2E 13개와 타입·린트·콘텐츠·빌드 통과 결과를 유지하며, 이번 커밋 단계에서는 전체 검사를 재실행하지 않았다. git diff --check 통과. Vercel 자동 배포 완료와 공개 사이트 플레이는 별도 미검증이다.


## 2026-09-23 · S08 지니의 수정 동굴

### 구현 범위

- 기존 2D 디자인과 Phaser 3.90.0/TypeScript/Vite를 유지했다. Node 24.16.0, npm 11.13.0 확인. 의존성과 lockfile 변경 없음.
- S07 완료 + T01 보유 후 S08로 이어진다. 수정 박쥐 4마리, 높이가 다른 진입 발판, 안전한 퍼즐 쉼터, 거울 3개, 실제 충돌로 닫힌 별빛 문, 지니, 환영 문, 선택 항해 일지와 출구를 배치했다.
- 퍼즐 구역에서는 적의 전투와 피해가 멈춘다. 거울은 E로 4방향 회전하고 벽화의 숫자/화살표를 따라 빛을 연결한다. 구슬 없이 풀 수 있고 HUD에 초기화 버튼이 있다. 미완성 배치는 재접속하면 초기화되며, 연결 완료는 영구 저장된다. 초기화로 이미 열린 문이나 보물을 잃지 않는다.
- T02와 gift 체크포인트를 S08.reward.truthOrb 보상으로 대화 전에 저장한다. 대화 생략/새로고침/재대화에도 한 번만 지급하며 기존 T01 액티브 선택을 유지한다.
- T02가 있으면 가까운 숨은 벽에 반짝임이 나타난다. E로 아리아나의 환영을 해제하고 별 지도 단서를 확인해야 출구가 열린다. 선택 항해 일지 S08.journal은 한 번만 기록하며 가방에서 다시 읽을 수 있다. 이 탐색에는 MP가 들지 않는다.
- 실제 맵 S01~S08, S09~S36 planned. M2 전체는 아직 미완료. 새 SVG 5개 포함 총 27개 모두 ART_DRAFT이며 출처/이용 조건을 ASSET_REGISTER.md에 기록했다.

### 검사와 미검증

- 타입/린트/단위 54개/콘텐츠 검사/빌드 통과. 최신 빌드 5.01초, 앱 JS 111.22kB(gzip 37.62kB). 기존 Phaser 청크 경고 유지.
- S08 단독 Edge 자동 플레이 통과(47.8초, 실행 전체 51.9초). 초기화·문 통과 차단·T02 없는 퍼즐·완성 퍼즐 재개·보물 대화 중 새로고침·환영 해제·일지 중복 방지/읽기를 확인했다.
- 첫 실행에서 새로고침 중 검사 스냅샷이 아직 없는 mapDef를 읽는 오류가 있었다. 초기화 전 접근을 보호한 뒤 재실행 통과했다. 거울 SVG의 화살표도 표시 방향과 맞췄다.
- 전체 회귀 결과는 아래 최종 기록의 14개 통과다. 앱 내 브라우저 연결은 privileged native pipe bridge is not available / browser-client is not trusted 오류로 실패하여, 설치된 Edge headless의 실제 키 입력으로 검증했다.
- 수동 손 플레이·실제 휴대폰·S08 모바일 배치·Safari/Firefox·어린이 난이도/소요 시간·장시간 성능·최종 아트는 미검증이다. S01부터 S08까지 새 저장 하나로 연속 완주한 단일 검사는 아니며, 기존 구간 회귀와 S07 저장에서 S08로 이어가는 검사를 분리했다.
- 이번 S08 변경은 로컬 작업이다. 커밋/푸시/공개 배포는 하지 않았다. 다음 한 작업은 S09 로크새의 둥지: 저주 해제 보스, T03 획득, 이단 점프·활공이다.

### S08 최종 실제 결과

- 전체 npm run test:e2e: 설치된 Edge headless 14개 통과(6.8분). 기존 S01~S07 회귀와 S08 정상 키 입력 완주/저장 복원을 포함한다.
- 스크린샷 확인 후 S08 쉼터·일지·거울 안내문 겹침과 빈 보스 표시를 정리했다. 해당 표시 변경 후 typecheck/lint/build 재통과, S08 E2E 재통과(1개, 52.1초). 최신 빌드 5.16초, 앱 JS 111.32kB(gzip 37.66kB). 단위 54개 통과 결과는 앞선 전체 코드 검사 기록이며 표시 변경 후 단위 테스트는 반복하지 않았다.
- S08 정상 진행의 pageerror/관측 HTTP 400+는 0개. docs/screenshots/S08-mirrors.png, S08-hidden-journal.png를 보관했으며 화면을 육안 확인했다.
- git diff --check 통과. 최신 playwright-report/index.html은 마지막 S08 단독 재검사 결과이며, 전체 14개 실행 결과는 이 로그에 기록했다.
- 현재 S01~S08 구현, S09~S36 planned. 최종 아트와 실기기 검수는 미완료. 이번 S08 작업은 커밋/푸시하지 않은 로컬 변경이다. 다음은 S09 로크새의 둥지다.
