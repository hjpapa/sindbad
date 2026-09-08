# 자산 등록 · ART_DRAFT

2026-09-06. 최종 승인 아트 없음. 외부 이미지·음악·기존 작품 표현을 다운로드하거나 복제하지 않았습니다.

| 실제 파일 | 크기 | 용도 | 출처·이용 조건 | 상태 |
|---|---|---|---|---|
| public/assets/draft/player.svg | 96×128 | 신밧드·선장 간이 전신/초상 | 자체 작성 SVG. 프로젝트 내 사용·수정 가능 | draft |
| public/assets/draft/playerRun.svg | 96×128 | 달리기 간이 교대 프레임 | 동일 | draft |
| public/assets/draft/skeleton.svg | 96×128 | 검사·궁수·대장 간이 전신 | 동일 | draft |
| public/assets/draft/siren.svg | 96×128 | 세이렌 | 동일 | draft |
| public/assets/draft/crab.svg | 96×128 | 유령 게 | 동일 | draft |
| public/assets/draft/spirit.svg | 96×128 | 폭풍 정령 | 동일 | draft |
| public/assets/draft/chest.svg | 96×128 | 상자 | 동일 | draft |
| public/assets/draft/heart.svg | 96×128 | 회복 하트 | 동일 | draft |
| public/assets/draft/shell.svg | 96×128 | 조개 종·부메랑 대체 스프라이트 | 동일 | draft |
| public/assets/draft/rod.svg | 96×128 | 피뢰 장치·돛대 표식 | 동일 | draft |
| public/assets/draft/bell.svg | 96×128 | 출항 종·등대·쉼터·구명 표식 대체 | 동일 | draft |
| src/game/stage.ts | 논리 화면 1280×720 | 배·항구·암초·폭풍 배경/발판, 로딩 실패 fallback | 자체 작성 Phaser Graphics | draft |
| src/game/audio.ts | 합성 음향 | 점프·공격·피격·하트·보물·번개 예고 | 자체 사인파 합성. 외부 음원 없음 | draft |

SVG 생성 원본: `scripts/make-draft-art.mjs`. 실행 시 위 실제 파일만 생성합니다. 웹 실행 중 외부 URL을 호출하지 않습니다. 매니페스트는 `src/content/assets.manifest.ts`에 있습니다.

향후: 명세 4장의 192×256 플레이어 프레임, 적별 예고/공격/회복 애니메이션, NPC 4표정, 독립적인 선장·궁수·대장·출구 아트, 부메랑 실루엣, 웹툰 셀 음영·배경음·사운드 믹싱 작업이 필요합니다. 현재 단순 프레임과 재사용 표식은 기능 확인용이며 최종 웹툰 아트 완료로 간주하지 않습니다.

## 2026-09-08 · 3D 아트 프리뷰

사용자 요청에 따라 3D 방향으로 변경했다. 아래 모델은 모두 프로젝트에서 직접 작성한 절차형 메시이며 외부 모델·이미지·텍스처를 가져오지 않았다. 프로젝트 내 사용·수정 가능, 최종 승인 전 draft 상태다.

| 원본 | 실제 출력 | 용도 / 상태 |
|---|---|---|
| src/game/models3d.ts | 구·상자·원뿔 등의 메시를 조합한 신밧드, NPC, 해골, 대장, 세이렌, 게, 정령, 보물상자, 하트, 조개, 장치 | 전신·수집물, draft |
| src/game/world3d.ts | 테마별 입체 발판·수면·집·배·암초·돛대, 조명, 발밑 그림자 | S01~S03 월드, draft |
| src/game/portrait3d.ts | 동일 모델의 560×620 투명 렌더를 메모리 이미지로 생성 | 제목·NPC 초상, draft |

별도 glTF나 완성 모델 파일이 존재하는 것처럼 기록하지 않는다. Three.js 및 addon은 MIT 라이선스 라이브러리이며 npm lockfile에 0.180.0으로 고정했다. 기존 SVG는 WebGL 초기화 실패 시 대체 표시와 일부 전투 효과에 사용한다.

- public/favicon.svg: 자체 제작 돛단배 브라우저 아이콘(64×64), 프로젝트 내 사용·수정 가능, draft. index.html에서 실제 경로를 지정한다.
