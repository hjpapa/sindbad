# 자산 등록 · ART_DRAFT

## 장별 웹툰 아트 적용 · 2026-10-02

실제 배포 파일은 `src/content/assets.manifest.ts`가 관리한다. 이번 원화 25종은 OpenAI 내장 imagegen으로 본 프로젝트를 위해 생성했다. 제작 지시는 `docs/ART_PROMPTS.md`에 기록했으며 특정 작품·작가·기존 게임 이미지는 사용하지 않았다. 원본은 Codex의 generated_images에 보관했고 저장소에는 보이는 RGBA 동일성을 검사한 무손실 WebP를 넣었다. 실행 중 외부 AI 서비스는 호출하지 않는다. 프로젝트에서 사용·수정하는 원본이며 최종 아트 승인 전이다.

| 실제 파일 (`public/assets/webtoon/`) | 크기 | 적용 |
|---|---|---|
| chapter-1.webp | 1536×1024 | S01~S05 항구·바다 |
| chapter-2.webp | 1536×1024 | S06~S10 불꽃·수정·로크 둥지 |
| chapter-3.webp | 1536×1024 | S11~S15 보석 골짜기·마을·부엌 |
| chapter-4.webp | 1536×1024 | S16~S19 해저 궁전·해적선·검은 탑 |
| chapter-5.webp | 1536×1024 | S20~S25 정글·달의 신전 |
| chapter-6.webp | 1536×1024 | S26~S29 인도 항구·연꽃 정원 |
| chapter-7.webp | 1536×1024 | S30~S36 최종 탑·왕궁·축제·귀환 |
| hero-webtoon.webp, ariana-webtoon.webp, kuura-webtoon.webp | 각각 1024×1536 | 주인공·동행/엔딩·분신/최종 보스 |
| naira-webtoon.webp, mira-webtoon.webp, baru-webtoon.webp | 각각 1024×1536 | 나이라·미라·바루 NPC |
| king-webtoon.webp, villager-webtoon.webp, genie-webtoon.webp | 각각 1024×1536 | 왕·하미드/주민·지니 하질 NPC |
| siren-webtoon.webp, rah-webtoon.webp | 각각 1024×1536 | S02 세이렌·S06 불꽃 수호자 NPC/대화 |
| crab-webtoon.webp | 1280×1280 | 초기 암초·고래 섬·산호 구간의 저주 게 |
| chef-webtoon.webp | 1024×1536 | S15 거인 요리사·국자 예고 |
| roc-webtoon.webp | 1536×1024 | S09 로크새·S10/S33 탑승 |
| whale-webtoon.webp | 1536×1024 | S04 고래 섬 |
| elephant-webtoon.webp | 1024×1024 | S29 아기 코끼리 구조 |
| hero-run.webp | 1536×1024, 512×512 6셀 | 신밧드 달리기·셀별 발 접지 정렬 |
| enemy-atlas.webp | 1536×1024, 512×512 6셀 | 뱀·호랑이·돌 거인·용·해적·해골 |

`public/assets/story/`의 `cargo.svg`, `starDevice.svg`, `lantern.svg`, `treasureAltar.svg`, `elephant.svg`, `snake.svg`, `tiger.svg`, `dragon.svg`, `stoneGiant.svg`, `villager.svg`, `mira.svg`, `king.svg`, `baru.svg`, `pirateCaptain.svg`, `lotusShrine.svg`, `arrow.svg`, `boomerang.svg`, `moonRock.svg`는 모두 96×128 직접 작성 SVG다. `scripts/make-story-art.mjs`로 재생성할 수 있고 외부 자산 이용 조건이 없다.

정화 고리·운반 배달 위치·일곱 보물 효과·달빛 충돌 다리·방패·무기별 공격 호·보스 빛 입자는 Phaser Graphics/트윈으로 직접 작성했다. 음악·효과음은 자체 Web Audio 합성이다. 현재 장의 배경과 필요한 인물/시트만 로드하며 이전 장의 불필요한 이미지 텍스처를 제거한다. S01 최초 요청 파일과 JS/CSS 합계는 `docs/validation/art-budget.json`에 기록한다. 이는 실제 네트워크·기기 FPS 측정이 아니다.

아트 상태는 전부 **ART_DRAFT**다. 다중 프레임 공격·피격·NPC 표정·로크 날갯짓의 전체 제작, 적 시트 경계와 모바일 스케일의 최종 검수는 남아 있다. 반려한 24프레임 주인공 시트는 셀 경계 문제가 있어 게임 파일에 포함하지 않았다.

## 비행 자산 개선 · 2026-09-23

`public/assets/draft/flightRing.svg`, `public/assets/draft/roc.svg`는 직접 작성한 96×128 SVG 원본이다. 금빛 테두리·빛 번짐·방향 표식의 고리와 깃털·안장·부리를 갖춘 로크새를 추가했다. 프로젝트에서 사용·수정 가능하며 외부 이미지나 기존 작품을 복제하지 않았다. 로크새 날갯짓은 런타임 크기 변형이고 다중 프레임 애니메이션은 아니므로 ART_DRAFT를 유지한다.

`kite.svg`, `stormCloud.svg`, `debris.svg`, `ariana.svg`도 직접 작성한 96×128 SVG다. 연의 천 재질과 꼬리, 번개 돌풍, 낙하 성벽 파편, 아리아나의 망토와 표정을 각각 표현했다. S10/S33의 공중 적·장애물·동승자에 사용하며 외부 이미지·모델·음원을 사용하지 않았다. 공중 적의 피격은 빛 입자와 투명도 감소로 사라지고, 최종 프레임 애니메이션 승인은 남아 있어 ART_DRAFT다.

## 후속 음향 개선

`src/game/audio.ts`의 지속음 3개를 자체 작성한 32박자 단위 선율과 4개 저음 진행으로 교체했다. 92 BPM의 8분음표 단위로 triangle 선율과 sine 반주를 예약하며, 외부 음원·샘플·음악을 사용하지 않는다. 각 음에는 발음/감쇠 곡선이 있고 종료 후 노드 연결을 해제한다. 메뉴·대화·창 이탈 때 예약과 음악 노드를 정지하고, 모험 복귀 때 단일 타이머로 재개한다. 효과음도 상승/하강 음높이 변화를 추가했다. 실제 스피커의 음량 균형 청취 검수는 아직 미완료다.

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

## S08 간이 자산 — 2026-09-23

public/assets/draft/genie.svg, mirror.svg, bat.svg, starMap.svg, journal.svg를 추가했다. 각 96×128 SVG이며 scripts/make-crystal-art.mjs에서 재생성 가능하다. 자체 작성 벡터로 프로젝트에서 사용·수정 가능하며 외부 이미지/음원 복제 없음. 수정 동굴 배경/빛 연결/비밀 반짝임은 src/game/stage.ts의 자체 Phaser Graphics다. 총 SVG 27개 모두 ART_DRAFT이며 최종 웹툰 아트 승인과 애니메이션은 미완료다.

## S09~S36 캠페인 벡터 세트 — 2026-09-23

`bandit.svg`, `beast.svg`, `boss.svg`, `quest.svg`, `gift.svg`, `bridge.svg`, `ending.svg`를 추가했다. 각 96×128 자체 작성 SVG이며 프로젝트 안에서 사용·수정 가능하다. 12개 지역 팔레트의 하늘·화산·마을·창고·바다·해적선·그림자·밀림·신전·정원·탑·왕국 배경은 `src/game/stage.ts`의 Phaser Graphics로 그린다. 전체 34개 SVG와 모든 런타임 배경은 외부 URL이나 타 작품 자산을 사용하지 않는다. 전 구간 기능 표시에는 사용 가능하지만, 다중 프레임 웹툰 캐릭터 애니메이션과 최종 아트 승인은 미완료이므로 상태는 ART_DRAFT다.

## 2026-09-23 · 핵심 아트 품질 개선

`scripts/make-polished-art.mjs`가 `player`, `playerRun`, `bandit`, `beast`, `boss`, `quest`, `gift`, `bridge`, `ending` 9개 SVG를 재생성한다. 그라데이션, 굵은 외곽선, 얼굴·의상 세부, 바닥 그림자를 추가한 프로젝트 자체 벡터이며 외부 자산은 없다. Phaser 배경에는 원경/중경 시차, 안개층과 발판의 측면·상단·그림자를 추가했다. 기능 자산 품질은 높였지만 표정·공격·피격의 다중 프레임 최종 승인은 남아 있어 전체 상태는 `ART_DRAFT`다. 배경음은 외부 파일이 아닌 Web Audio 오실레이터 3개의 낮은 음량 합성 패드이며 설정에서 끌 수 있다.
