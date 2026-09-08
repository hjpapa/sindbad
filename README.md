# 신밧드: 일곱 보물과 바다의 약속

한국어 횡스크롤 액션 어드벤처의 첫 구현입니다. 이번 범위는 M0 + M1, 실제 맵은 S01~S03입니다. 전체 36개 스테이지는 설계 데이터로 등록되어 있으며 S04~S36은 개발 중으로 잠겨 있습니다. 최종 웹툰 아트가 아닌 `ART_DRAFT` 버전입니다.

## 실행

```sh
npm ci
npm run dev
```

브라우저에서 http://127.0.0.1:5173 을 엽니다. 설치 후 게임 플레이에는 계정·API 키가 필요하지 않습니다.

## 공개 플레이와 배포

- 게임: https://sindbad-orcin.vercel.app
- 소스: https://github.com/hjpapa/sindbad
- 사용자 요청에 따라 Vercel `docsusil-hjpapa/sindbad`에 운영 배포했습니다. GitHub `main`을 연결했으며 후속 push는 Vercel에서 자동 빌드합니다.
- 공개 주소 검증: `node scripts/verify-deployment.mjs https://sindbad-orcin.vercel.app`
- 저장은 브라우저·사이트 주소별로 분리됩니다. 로컬에서 진행한 기록은 JSON 내보내기/가져오기로 공개 사이트에 옮길 수 있습니다.

## 조작

| 행동 | 키 |
|---|---|
| 이동 | A / D, ← / → |
| 점프 | Space / K / W / ↑ |
| 공격 | J, 650ms 안에 이어 누르면 곡도 3타 콤보 |
| 회피 | L / Shift |
| 대화·상자·장치·출구 | E |
| 무기 교체 | Q 또는 보유한 무기 번호 1~7 |
| 가방·항해 지도 | M |
| 일시정지 | Esc |

하단 터치 버튼도 같은 입력 경로를 사용합니다. 터치 방향+점프+공격 동시 입력을 지원합니다. 게임 영역을 클릭하면 키보드 포커스가 돌아옵니다. 메뉴는 Tab으로 이동할 수 있습니다.

S01: 선장 대화, 해골 대장 격파, 출항 종. 상자 두 개 위 메달은 선택 보물입니다.
S02: 조개 종 세 개를 **J로 공격**, 세이렌의 저주 해제, 필수 보물함, 등대. Q로 부메랑을 바꾸어 던집니다.
S03: 피뢰 장치 두 개, 폭풍 수정, 돛대 위기, 구명 밧줄. ⚡ 예고 구역에서 벗어나세요.

## 저장

`sinbad.sevenTreasures.v1.slot1`과 `.backup` 키로 같은 사이트·브라우저의 localStorage에 저장합니다. 현재 HP나 임의 위치는 저장하지 않으며, 이어할 때 안전 체크포인트에서 완전 회복합니다. 보상·보스 승리·장치·무기·유물·XP는 유지됩니다. 같은 적이나 하트의 XP는 한 번만 받습니다.

메뉴의 JSON 내보내기/가져오기로 파일 보관이 가능합니다. 가져오기는 256KiB 이내의 허용된 데이터만 읽으며 버전·수치·ID·중복을 검사합니다. 깨진 저장이나 미래 버전은 자동 덮어쓰지 않습니다. 다른 창에서 저장이 변경되면 자동 저장을 멈춥니다. 브라우저 데이터 삭제 또는 비공개 모드에서는 기록이 유지되지 않을 수 있습니다.

## 검사

```sh
npm run typecheck
npm run lint
npm run test
npm run validate:content
npm run build
npm run test:e2e
```

E2E 기본 브라우저는 설치된 Microsoft Edge (`msedge`)입니다. 없는 환경은 `playwright.config.ts`의 `channel`을 제거하고 `npx playwright install chromium`으로 테스트용 Chromium을 설치할 수 있습니다. E2E는 별도의 임시 브라우저 저장소를 사용하고 실제 키보드/터치 입력을 보냅니다. 개발 빌드의 `window.__SINBAD_TEST__`는 읽기 전용 스냅샷이며 순간 이동이나 보상 지급 함수가 없습니다. 프로덕션 빌드에서는 제거됩니다.

## 실제 환경과 고정 버전

- Windows 빌드 10.0.26200 (Windows 11 계열), Node 24.16.0, npm 11.13.0.
- Phaser **3.90.0**, TypeScript **5.9.2**, Vite **7.1.5**, Vitest **3.2.4**, Playwright **1.55.1**, ESLint **9.35.0**. 정확한 전이 의존성은 `package-lock.json` 참조.
- Vite의 Node 요구사항은 20.19+/22.12+입니다. [Vite 공식 문서](https://vite.dev/guide/)
- Playwright의 현재 공식 지원 목록에는 Node 24와 Windows 11이 포함됩니다. [Playwright 공식 문서](https://playwright.dev/docs/intro)
- Phaser 최신 문서가 4.x API를 가리킬 수 있으므로 설치된 3.90.0의 타입과 소스를 기준으로 구현했습니다. [Phaser 3.90.0 릴리스](https://github.com/phaserjs/phaser/releases/tag/v3.90.0)
- 최초 설치 시 ESLint 9.35.0 지원 종료 경고가 있었습니다. 이 작업에서는 고정 버전으로 검사했으며 향후 도구 버전 갱신이 필요합니다.

## 구조

- `src/content/campaign.json`: 36개 단계의 ID, 아이 장면, 선행 능력, 필수/선택 보상, 진행 설명. 설계서에서 명시적으로 등록한 데이터입니다.
- `src/content/maps.ts`: S01~S03의 실제 지형·적·장치·하트·안전 체크포인트.
- `src/core/`: 순수 성장·보상·전투 쿨다운·저장 스키마.
- `src/game/`: Phaser 월드, 공통 입력, 자체 합성 효과음.
- `src/main.ts`: DOM 메뉴·대화·가방·저장 UI와 게임 연결.
- `scripts/register-campaign.mjs`: 명세서 변경 후 명시적으로 실행하는 목록 재등록 도구. **맵을 생성하거나 미구현 단계를 완료 처리하지 않습니다.**
- `scripts/make-draft-art.mjs`: 로컬 간이 SVG 자산 원본 생성기.

실제 검증 결과와 남은 범위는 `PROJECT_STATUS.md`, `docs/PLAYTEST_LOG.md`를 확인하세요. T01~T07의 능력 실행은 M2 이후이며 S05의 공기방울과 S16의 자유 수영은 별도 조건으로 등록했습니다.
