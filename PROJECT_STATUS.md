# PROJECT_STATUS.md

## 현재 실제 상태

- 작업 날짜: 2026-09-08 / 빌드 0.1.0 + 3D 디자인 개정 / 기준 명세 1.0 + 사용자 아트 방향 변경.
- 이번 범위 M0 + M1 기능 구현 및 검증 완료. S01~S03을 실제 조작으로 연속 완주했다.
- 전체 목표는 36스테이지, 아이 장면 24개, 무기 7종, 핵심 보물 7개 그대로 유지한다.
- 실제 맵은 S01~S03만 존재한다. S04~S36은 `planned`이며 지도에서 개발 중으로 잠겨 있다. 빈 맵이나 복사 맵을 완료로 세지 않는다.
- 코드의 콘텐츠 등록 상태는 S01~S03 `implemented`, 플레이 검증은 아래 표와 docs/PLAYTEST_LOG.md에서 별도 관리한다.
- 사용자 요청에 따라 실제 3D 모델을 사용하는 2.5D 화면으로 변경했다. 자체 제작 절차형 메시·초상·배경은 ART_DRAFT이며 최종 아트 승인 전이다. 기본 조작은 횡스크롤이다.
- 기존 문서만 있던 폴더에서 시작했다. 이후 사용자의 GitHub/Vercel 배포 요청에 따라 Git 저장소를 초기화하고 아래 공개 배포를 수행했다. 게임 로그인·DB·외부 AI API는 없다.

## 진행표

| 단계 | 범위 | 기능 | 아트 | 실제 검증 |
|---|---|---|---|---|
| M0 | 프로젝트·콘텐츠·저장 기반 | 완료 | 간이 자산 등록 | 타입·린트·단위·콘텐츠·빌드·제목 화면 통과 |
| M1 | S01~S03 | 완료 | ART_DRAFT | 새 게임 연속 완주 + 복귀/저장/터치 E2E 통과 |
| M2 | S04~S10 | planned, 구현 미착수 | missing | 미실행 |
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
- public/assets/draft 및 assets.manifest.ts: 실제 존재하는 자체 작성 SVG 11개. 누락 시 생성 텍스처 fallback.

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

- 아트 방향은 2026-09-08 사용자 요청으로 3D 피규어 스타일로 변경했다. 전신·지형·초상은 입체 모델이며 달리기/검 공격에 기본 관절 애니메이션을 사용한다. 전용 무기별 포즈·피격/회피/패배 애니메이션 및 배경 음악은 아직 다듬어야 한다.
- S04 이후 플레이, T01~T07 실제 능력, 수중/비행/마법 다리 등은 M2 이후 범위로 미구현·미검증이다. 황금 하트는 단위 픽스처만 검사했고 실제 G01 위치는 S04로 유지했다.
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

M2의 첫 구간 S04~S05를 구현한다. 움직이는 고래 등에서 선원 구명 장비를 모으고, 산호 감옥에서 나이라를 구출해 bubbleBlessing을 확정 지급한다. G01/G02 선택 경로와 저장·재시도 중복 방지를 검증하되 자유 수영 T04는 S16에 유지한다.

## 2026-09-08 · 실제 3D 모델 / UI 개정

- 범위: S01~S03의 2.5D 렌더링과 메뉴 디자인. 36단계 등록 상태, 보상 ID, 저장 스키마, 기존 진행 조건 유지. 자유 3D 이동·카메라 회전은 미구현.
- Three.js 0.180.0 + 타입 고정, 절차형 모델·테마별 입체 지형·양방향 조명·발밑 그림자·관절 이동/공격·동일 모델 초상을 구현했다. Phaser 물리와 3D 렌더의 카메라/화면 크기를 동기화한다.
- 제목·HUD·대화·가방·설정·터치 버튼은 크림/민트와 둥근 패널로 변경했다. NPC·적·수집물 모델은 자체 제작이며 최종 승인 전 ART_DRAFT다.
- 정적 지형을 재질별 병합하고 해상도 배율은 최대 1.5로 제한한다. 재시작 때 메시·렌더러·WebGL 컨텍스트·ResizeObserver를 해제한다.
- 3D 초기화 실패 시 기존 Phaser 그래픽으로 플레이한다. 3D 컨텍스트를 잃으면 자동 정지 및 체크포인트 재시작 안내를 표시한다.

| 실제 실행 명령 | 결과 |
|---|---|
| npm run typecheck | 통과. 중간 테스트 함수의 this 타입 누락을 수정하고 재검사 |
| npm run lint | 통과 |
| npm run test | 37개 통과 |
| npm run validate:content | 통과. 기존 콘텐츠와 절차형 자산 원본 존재 확인 |
| npm run build | 최종 통과, 6.37초 |
| npm run test:e2e | 전체 13개 통과, Edge headless 2.6분 |
| node scripts/inspect-game.mjs -3d-final | 최종 제목 버튼 배치·S01 3D 화면 촬영 및 육안 확인 |

전체 E2E는 S01→S02→S03 정상 입력 완주·NPC·보상·레벨업·무기 교체·보스·저장/재개·터치·사망 복구 등 기존 8개와 3D 반복 재시작/저장 재개/844×390 캔버스 정렬·S02/S03 테마·실제 WebGL 컨텍스트 손실/복구·3D 미지원 대체 플레이 5개다. 정상 캠페인 pageerror/HTTP 실패 0개. 의도적 그래픽·파일·저장 실패 검사는 별도다. 전체 검사 후 제목 버튼을 2열로 정리하고 빌드 및 브라우저 화면을 추가 확인했다.

최종 화면 증거: docs/screenshots/title-3d-final.png, harbor-3d-final.png, 3d-mobile.png, 3d-S02.png, 3d-S03.png. Windows가 기존 harbor.png 쓰기를 한 번 거부해 별도 파일명으로 재실행하여 성공했다.

번들: 앱 96.72kB / gzip 34.61kB, Three 479.14kB / gzip 120.19kB, Phaser 1,481.77kB / gzip 339.84kB. Phaser 큰 청크 경고는 남는다. S01 시작점 한 스냅샷은 102 draw calls / 57,062 triangles / 프레임 약 16.63ms였다. 장시간 60fps·저사양/실제 모바일 성능 검증을 대신하지 않는다.

남은 한계: 실제 모바일/Safari/Firefox·장시간 GPU 메모리는 미검증. 모바일 모사에서 조작·화면 정렬은 확인했으나 맵 내부 라벨과 하단 힌트는 작거나 터치 영역에 가까워 추가 가독성 검수가 필요하다. 무기별 전용 모델/포즈, 피격·회피·승리 연출, 장식 다양성과 아트 최종 승인은 후속 작업이다. 다음 게임플레이 작업은 기존 M2 S04~S05이며 이번 3D 방향을 이어 적용한다.

### 3D 버전 운영 배포 및 실제 공개 주소 검사

- 3D 구현 커밋 `d949d3c`, 아이콘 수정 커밋 `5ad3c93`. GitHub hjpapa/sindbad main으로 반영했다.
- Vercel production `dpl_EC3h7LkL5p1YL5cL6rJhemQjqBCG` READY, https://sindbad-orcin.vercel.app 에 연결됨.
- `node scripts/verify-deployment.mjs https://sindbad-orcin.vercel.app` 최종 통과: HTTP 200, 3D 캔버스 표시, 새 게임·이동/점프/공격 입력·체크포인트 저장·새로고침·이어하기, 개발 테스트 훅 없음. console error/pageerror/HTTP 400+ 모두 0개.
- 첫 공개 검사에서 favicon.ico 404를 실제 확인해 자체 SVG 아이콘을 추가했다. 수정 후 빌드(5.42초) 및 공개 브라우저 재검사 통과. 공개 화면 증거는 production-title.png / production-play.png / production-resume.png.
- 공개 주소의 전체 S01~S03 재완주는 이번에도 별도 미검증이며, 같은 게임 코드의 로컬 전체 E2E 13개 통과와 구별한다.
