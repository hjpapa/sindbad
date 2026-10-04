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
