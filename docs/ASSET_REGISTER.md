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

## M2 첫 구간 자산 — 2026-09-08

`public/assets/draft/guardian.svg`, `naira.svg`, `gear.svg`, `key.svg`, `gate.svg`, `golden.svg`를 추가했다. 모두 96×128 SVG이며 원본 생성기는 `scripts/make-m2-art.mjs`이다. 자체 작성 간이 벡터로 프로젝트에서 사용·수정 가능하고 외부 이미지/모델/음악을 복제하지 않았다. 상태는 모두 draft다. 고래 등·바다·산호 동굴은 `src/game/stage.ts`의 Phaser 도형 배경이며 최종 웹툰 아트 승인은 아직 없다.

## S06~S07 자산 — 2026-09-08

public/assets/draft/rah.svg, torch.svg, furnace.svg, vine.svg, rope.svg: 각 96×128, scripts/make-flame-art.mjs에서 생성한 자체 벡터. 프로젝트에서 사용·수정 가능하며 외부 자산 없음. 총 SVG 22개 모두 ART_DRAFT. 불꽃 동굴, 파도·동굴 배경, 파동은 src/game/stage.ts의 자체 Phaser Graphics다. 최종 웹툰 아트/애니메이션은 미완료다.
