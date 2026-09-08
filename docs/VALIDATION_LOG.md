# 실제 검사 로그 · 2026-09-06 · 0.1.0

최종 실행 환경: Windows 10.0.26200, Node 24.16.0, npm 11.13.0.

```text
npm run typecheck — PASS (tsc --noEmit)
npm run lint — PASS (eslint src scripts tests)
npm run test
✓ tests/unit/recovery.test.ts (5 tests)
✓ tests/unit/core.test.ts (32 tests)
Test Files 2 passed (2)
Tests 37 passed (37)
Duration 944ms

npm run validate:content
PASS: 36 stages, 24 child scenes, 7 weapons, 7 treasures, 8 golden hearts; acquisition graph, S16 protection, rewards, maps and assets. S01–S03 implemented; S04–S36 planned.

> sinbad-seven-treasures@0.1.0 build
> npm run typecheck && npm run validate:content && vite build


> sinbad-seven-treasures@0.1.0 typecheck
> tsc --noEmit


> sinbad-seven-treasures@0.1.0 validate:content
> tsx scripts/validate-content.ts

PASS: 36 stages, 24 child scenes, 7 weapons, 7 treasures, 8 golden hearts; acquisition graph, S16 protection, rewards, maps and assets. S01–S03 implemented; S04–S36 planned.
vite v7.1.5 building for production...
transforming...
✓ 20 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.74 kB │ gzip:   0.47 kB
dist/assets/index-DwqfseVz.css      6.63 kB │ gzip:   2.39 kB
dist/assets/index-CODJrQoC.js      80.85 kB │ gzip:  28.02 kB
dist/assets/phaser-Czz4FBZH.js  1,481.77 kB │ gzip: 339.84 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 5.22s
```

최종 E2E 명령: `npm run test:e2e` (exit 0). 실제 입력 테스트이며 각 복귀 픽스처와 새 게임 완주 시나리오는 분리되어 있습니다.

```text
ok 1 tests\e2e\adventure.spec.ts:83:1 › new game → S01 → S02 → S03 with real keyboard inputs and checkpoint reload (1.4m)
  ok 2 tests\e2e\adventure.spec.ts:194:1 › pause freezes world; export/import and real touch pointer combination (8.5s)
  ok 3 tests\e2e\adventure.spec.ts:264:1 › missing sprite fallback loads; corrupt and future saves stay untouched (1.2s)
  ok 4 tests\e2e\fall.spec.ts:4:1 › fall recovery resets physics onto a safe platform instead of inside the floor (4.2s)
  ok 5 tests\e2e\safety.spec.ts:5:1 › actual damage and heart recovery (6.4s)
  ok 6 tests\e2e\safety.spec.ts:37:1 › natural lightning death restores checkpoint and retains rewards; immunity on restart (28.9s)
  ok 7 tests\e2e\safety.spec.ts:82:1 › boss victory reload keeps exit open without duplicating XP (4.0s)
  ok 8 tests\e2e\safety.spec.ts:115:1 › storage denied warns but movement and export work (1.7s)

  8 passed (2.4m)

To open last HTML report run:

  npx playwright show-report
```

HTML 리포트: `playwright-report/index.html`. 스크린샷 보관: `docs/screenshots/`. 이전 실패·수정 이력은 PLAYTEST_LOG.md 참조.

남은 경고: Phaser 단일 청크 1.48MB(압축 339.84kB)로 Vite의 500kB 청크 경고가 발생합니다. 빌드는 성공했습니다. 장시간 FPS/메모리 측정은 하지 않았습니다.

환경 조회 중 npm registry 메타데이터와 선택적 formatter 설치는 EACCES로 실패했습니다. 게임의 고정 의존성 설치·lockfile 작성과 모든 필수 검사는 성공했습니다. 별도 formatter는 추가하지 않았습니다.

## 2026-09-08 3D 개정 회귀

최종 타입·린트·단위 37개·콘텐츠·빌드 통과. 전체 Edge E2E 13개, 2.6분 통과. 3D 전용 5개는 실제 렌더, 재시작과 저장 복귀, 모바일 정렬, 테마별 로드, WebGL 손실 복구, 미지원 대체 경로를 검사한다. 제목 버튼 2열 배치 후 별도 화면 검사도 통과했다. Windows 스크린샷 쓰기 오류는 -3d-final 파일명으로 재실행하여 해결했다. 앱 내 브라우저는 권한 브리지 오류, agent-browser CLI는 미설치 상태여서 기존 Playwright/Edge 자동 입력 경로를 사용했다. 실기 손 플레이는 미검증.
