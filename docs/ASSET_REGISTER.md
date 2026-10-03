# 자산 등록 · ART_DRAFT

## A6 무기7종 · 2026-10-03 · ART_DRAFT

출처: OpenAI **내장 imagegen**, 프로젝트 자체 hero-webtoon의 선/음영과 기존 자체 SVG7종의 형태/색만 참조. 특정 작품·작가·외부 이미지 없음. 본 프로젝트에서 사용·수정 가능, 최종 사용자 아트 승인 전 **ART_DRAFT**다.

| 게임 키 | 무손실 원본 | 런타임 | 원본 → 런타임 크기 |
|---|---|---|---|
| weapon-W01 | art-source/weapons/W01.webp | public/assets/weapons/W01.webp | 640×256 → 160×64 |
| weapon-W02 | art-source/weapons/W02.webp | public/assets/weapons/W02.webp | 640×256 → 160×64 |
| weapon-W03 | art-source/weapons/W03.webp | public/assets/weapons/W03.webp | 640×256 → 160×64 |
| weapon-W04 | art-source/weapons/W04.webp | public/assets/weapons/W04.webp | 640×256 → 160×64 |
| weapon-W05 | art-source/weapons/W05.webp | public/assets/weapons/W05.webp | 320×640 → 80×160 |
| weapon-W06 | art-source/weapons/W06.webp | public/assets/weapons/W06.webp | 640×256 → 160×64 |
| weapon-W07 | art-source/weapons/W07.webp | public/assets/weapons/W07.webp | 640×256 → 160×64 |

- 생성 원본 PNG8개: `art-source/weapons/generated/W01-01.png,W02-01.png,W02-02.png,W03-01.png,W04-01.png,W05-01.png,W06-01.png,W07-01.png`. 실제 가로1983×793/활887×1774, 선택7/미선택1, 모두 원본과 바이트 동일 보존.
- 완전한 그림의 균일 축소/위치 조정 PNG7개: `art-source/weapons/W01~W07.png`. 해당 PNG와 무손실 WebP의 RGBA 동일. 실제 손잡이 좌표와 변환은 `weapons.measurements.json`, 전체 프롬프트·선택·해시는 `weapons.sources.json`.
- 참고 렌더7개: `art-source/weapons/references/W01~W07.png`, 기존 SVG를4배로 렌더했다. 최종 아트로 대체 사용하지 않는다.
- 기존 `public/assets/weapons/W01~W07.svg`는 수정·삭제하지 않는다. `weapon-fallback-W01~W07` 키로 파일 누락 시 기존 벡터 대체물을 제공한다. HUD·장비·터치 아이콘도 같은 SVG로 복구한다.
- `optimize-webtoon.py`의 `SIZES`/`assets.manifest.ts`의 `runtimeSize` 등록. 새 런타임7종 총 **24,518바이트**. 최초 장면에서 기존처럼7무기를 준비하며 예산 계산에 새 WebP와 SVG 대체물 모두 포함한다.
- `docs/validation/weapons.json`:14개 실제 디코딩·크기·투명 경계·손잡이 불투명 픽셀·무손실 RGBA·8생성 원본/7SVG 해시 감사. 이는 사용자 최종 시각 승인이나 실기기 조작성 판정과 구별한다.

## A5 장소별 지형 · 2026-10-03 · ART_DRAFT

아래 각 스타일은 `art-source/terrain/terrain-{스타일}-{fill,top}.webp` 무손실 원본 → `public/assets/terrain/terrain-{스타일}-{fill,top}.webp` 축소 런타임이다. 스타일17개×2파일=**34개 원본/34개 런타임**, 채움 **512×512 → 128×128**, 윗면 **512×136 → 128×34**, 불투명 재질이다. 출처는 OpenAI 내장 imagegen, 프로젝트 자체 hero-webtoon의 선·셀 음영만 참조했다. 특정 작품·작가·외부 이미지 참조 없음. 본 프로젝트에서 사용·수정, 최종 승인 전 **ART_DRAFT**를 유지한다.

| 스타일 / 실제 파일 키 (두 폴더에 존재) | 적용 재질 |
|---|---|
| terrain-dock-fill / terrain-dock-top | 부두 목재 |
| terrain-deck-fill / terrain-deck-top | 선박 갑판 |
| terrain-reef-fill / terrain-reef-top | 암초 돌 |
| terrain-coral-fill / terrain-coral-top | 산호 암석 |
| terrain-whale-fill / terrain-whale-top | 고래섬 돌 |
| terrain-basalt-fill / terrain-basalt-top | 현무암 |
| terrain-crystal-fill / terrain-crystal-top | 수정 암석 |
| terrain-cloud-fill / terrain-cloud-top | 구름 |
| terrain-village-fill / terrain-village-top | 마을 석재 |
| terrain-warehouse-fill / terrain-warehouse-top | 창고 목재 |
| terrain-sand-fill / terrain-sand-top | 모래 사암 |
| terrain-shadow-fill / terrain-shadow-top | 그림자 성벽 |
| terrain-jungle-fill / terrain-jungle-top | 정글 흙·잔디 |
| terrain-temple-fill / terrain-temple-top | 신전 돌 |
| terrain-garden-fill / terrain-garden-top | 정원 흙·잔디 |
| terrain-tower-fill / terrain-tower-top | 탑 석재 |
| terrain-kingdom-fill / terrain-kingdom-top | 왕궁 석재 |

원본 생성 PNG41개(선택34/미선택7)는 `art-source/terrain/generated/`에 바이트 그대로 남겼다. 전체 프롬프트·선택·실제 원본 크기와 해시는 `terrain.sources.json`이다. 같은 폴더의 정규화된34개 PNG는 무손실 인코딩 입력이며 배포 로드 대상이 아니다. 정규화/인코딩/축소는 `pack-terrain.py` → `optimize-webtoon.py`, 디코딩·원본 동일성·크기·불투명도·윗면 그림자는 `audit-terrain.py`와 `docs/validation/terrain.json`이다. `audit-webtoon.py`도 지형 감사를 이어 실행한다.

`assets.manifest.ts`가34개 파일·runtimeSize·출처·상태를 등록하며 현재 맵의 스타일 두 파일만 Phaser에 로드한다. 이전 스타일은 제거하고, 누락은 기존 `terrain.ts` Graphics 재질로 보완한다. 이미 로드한 한쪽은 누락 보완 때 덮어쓰지 않는다. 지형의 물리 발판·ID·보상·저장 데이터는 유지한다. 반복 화면/실제 맵/회귀 검증은 PROJECT_STATUS.md에 기록한다. A6~A8은 별도 미완료이며 아래는 이전 작업 기록이다.

실제 최종 보고서 `docs/validation/a5-e2e-full.json`은39개 통과, `terrain.json`은68개 실파일 감사다. `a5-moving-platforms.json`은6개 이동 갑판의6시점×2화면 관찰이며, `docs/screenshots/art-a5/`의52장에 실제 적용/누락 복구/완주/반복 진단을 보존했다. 기능/모사 검증 완료와 **ART_DRAFT** 상태를 별도로 유지한다. 공개 배포는 하지 않았다.

## A4 NPC 표정 초상 · 2026-10-03 · ART_DRAFT

아래 각 파일은 `art-source/webtoon/`의 무손실 원본 → `public/assets/webtoon/`의 축소 손실 런타임이다. 모두 3열×1행, 원본 **1536×768(셀512×768)** → 런타임 **768×384(셀256×384)**, 투명 RGBA, 순서 기본/기쁨/걱정이다. 출처는 OpenAI 내장 imagegen, 기존 프로젝트 인물·`hero-webtoon` 참조이며 특정 작품·작가 참조 없음. 본 프로젝트에서 사용·수정, 최종 승인 전 **ART_DRAFT**를 유지한다.

| 새 파일명 (두 폴더에 존재) | 용도 |
|---|---|
| `naira-faces.webp` | 나이라·공기방울·구출·해저 궁전 대화 |
| `siren-faces.webp` | 세이렌 도움 요청과 실제 저주 해제 뒤 대화 |
| `rah-faces.webp` | 라흐·불씨/무기 안내 |
| `genie-faces.webp` | 지니 하질의 수정 동굴·일곱 보물 관문 대화 |
| `ariana-faces.webp` | 환영·봉인 협동·귀환·약속/도서관 대화 |
| `king-faces.webp` | 귀환 기록·축제·왕의 축복 |
| `mira-faces.webp` | 밀림 안내·시장·신전 소개의 미라 대사 |
| `baru-faces.webp` | 도깨비불·달빛 다리·보물 대화 |
| `captain-faces.webp` | 항구/폭풍 선장 대화 |

각 `{key}-faces.png`는 완전한 셀을 균일 축소·배열한 인코딩 입력이며 런타임 로드 대상이 아니다. `art-source/webtoon/generated/faces/*.png` 12개는 도구 원본의 바이트 복사본(선택9/미선택3)으로 삭제하지 않았다. `npc-faces.sources.json`은 모든 실제 프롬프트·생성 경로·선택 목록, `npc-faces.measurements.json`은 선택 원본 크기/해시·27셀 가시 경계다. 인코딩/축소 과정은 `pack-npc-faces.py` → `encode-webtoon.py` → `optimize-webtoon.py`다.

원본38종+런타임38종 총76개를 `audit-webtoon.py`에서 디코딩하고 해시/크기를 기록한다. 기존 전신·정지 초상·일지/신전 SVG와 A1~A3 자산은 그대로 보존했다. `assets.manifest.ts`에 9개 키/런타임 크기/출처/이용 조건을 등록했다. 표정 시트는 DOM 대화에서 필요한 한 파일만 요청한다. A4 기능 검사와 최종 아트 승인은 구별하며, A5~A8은 미완료다. 아래 절은 이전 시점의 기록이다.

## A3 적 행동 아틀라스 · 2026-10-03 · ART_DRAFT

| 실제 경로 | 크기 / 용도 | 출처·이용 조건·상태 |
|---|---|---|
| `art-source/webtoon/enemy-actions.webp` → `public/assets/webtoon/enemy-actions.webp` | 2048×5120 → 1024×2560, 4열×10행 / 40포즈 | OpenAI 내장 imagegen, 프로젝트 자체 화풍·캐릭터 참조. 프로젝트 내 사용·수정, 특정 작품·작가 참조 없음. ART_DRAFT. |
| `art-source/webtoon/enemy-actions.png` | 2048×5120, 선택한 완전한 셀의 재배열 PNG | `pack-enemy-actions.py`가 정사각 셀을 축소·배열. 인코딩 입력, 런타임 로드 대상 아님. |
| `art-source/webtoon/enemy-actions.json` → `src/content/enemy-actions.generated.json` | 10종 행·40포즈 발 기준선·가시 경계·대기 높이 | 실제 생성 픽셀 측정 데이터, 바이트 그대로 복사. 게임 표시 원점/크기의 기준. |
| `art-source/webtoon/enemy-actions.sources.json`, `generated/enemy-actions/*.png` | 선택 10개·미선택 8개, 각각 1254×1254 | 생성 원본 모두 보존. 선택 목록·재생성 이력은 ART_PROMPTS.md와 sources JSON. |

원본 WebP 29종과 런타임 29종, 총 58개를 디코딩·해시 기록한다. 적용 종류는 해골·산적·경비병·해적 선장·뱀·호랑이·용·게·돌 거인·쿠우라다. 기존 `enemy-atlas.webp`와 개별 정지 원화는 삭제하지 않았다. 적/보상/아이템 ID와 저장 형식은 유지한다. A3 아틀라스 외 생물·NPC 및 A4~A8의 최종 제작/승인은 별도 미완료다.

## A1·A2 전용 원화 · 2026-10-03

| 실제 경로 | 원본 / 런타임 크기 | 출처·이용 조건·용도 | 상태 |
|---|---|---|---|
| `art-source/webtoon/hero-action.webp` → `public/assets/webtoon/hero-action.webp` | 1536×1536 / 768×768, 3×3 정사각 셀 | OpenAI 내장 imagegen, 자체 `hero-webtoon` 참조. 프로젝트용 AI 생성 자산, 프로젝트 내 사용·수정. 특정 작품·작가 참조 없음. 신밧드 숨쉬기·공중·피격·공격·보물 기쁨. | ART_DRAFT |
| `art-source/webtoon/hero-action.json` → `src/content/hero-action.generated.json` | 9개 `{baseline, hand}` / 512px 좌표 | 정규화 시트에서 직접 측정한 프로젝트 데이터. 원본 JSON을 최적화 스크립트가 바이트 그대로 복사하고, `heroArt.ts`가 생성본을 import한다. 원화 폴더가 업로드에서 제외되어도 좌표는 빌드에 포함된다. | ART_DRAFT |
| `art-source/webtoon/captain-webtoon.webp` → `public/assets/webtoon/captain-webtoon.webp` | 1024×1536 / 512×768 | 같은 내장 생성·참조·이용 조건. S01/S03 선장 전신 및 `captain`/`storm` 초상. 기존 NPC·보상 ID 유지. | ART_DRAFT |
| `art-source/webtoon/sailor-webtoon.webp` → `public/assets/webtoon/sailor-webtoon.webp` | 1024×1536 / 512×768 | 같은 내장 생성·참조·이용 조건. S04 선원 전신 및 `whale` 초상. 기존 NPC·보상 ID 유지. | ART_DRAFT |
| `art-source/webtoon/hero-action.png`, `captain-webtoon.png`, `sailor-webtoon.png`, `generated/*.png` | 액션 생성본 1254×1254 / NPC 1024×1536 | 선택·미선택 생성 PNG를 모두 보존. 액션 전체 크기 정규화 후 무손실 인코딩, NPC 무손실 인코딩. 런타임 로드·배포 대상 아님. 생성 파일명과 지시는 `ART_PROMPTS.md`. | ART_DRAFT |

원화는 28종이며 원본/런타임 56개를 `scripts/audit-webtoon.py`로 디코딩한다. S01·S03·S04의 임시 하미드 원화는 전용 선장·선원으로 교체했다. S10 안내자의 로크새 임시 사용과 A3~A8은 기존 상태다. 최종 출시 아트 승인·실기기 검수는 남아 있다.

## 모바일 최적화·무기·지형 · 2026-10-03

- **원본/런타임 분리**: 무손실 원화 25종을 `public/assets/webtoon/`에서 `art-source/webtoon/`으로 그대로 옮겼다(`git mv`, 픽셀 변경 없음). 게임은 `scripts/optimize-webtoon.py`가 만든 손실 WebP를 받는다. 인물은 512×768, 달리기·적 시트는 768×512(셀 256px), 로크새 768×512, 게·코끼리 512×512로 줄였고 배경·고래는 1536×1024를 유지했다. 합계는 34.6MB에서 2.7MB가 됐다. `art-source/`는 `.vercelignore`로 배포에서 뺐다. `scripts/audit-webtoon.py`는 원본 25개와 런타임 25개를 모두 디코딩해 `docs/validation/illustrations.json`에 기록한다.
- **무기 7종 SVG**: `public/assets/weapons/W01.svg`~`W07.svg`. 곡도·부메랑·불꽃 곡도·폭풍의 창·파도의 활·달빛 방망이·새벽의 검. `scripts/make-weapon-art.mjs`로 직접 작성한 자체 디자인이며 외부 자산이 없다. 게임에서는 공격할 때 손에 들고 휘두르고, 터치 버튼·HUD·가방에서는 아이콘으로 쓴다. 회전 중심과 표시 크기는 `src/game/weapons.ts`에 있다.
- **지형 텍스처**: `src/game/terrain.ts`가 Phaser Graphics로 실행 중에 그린다(나무 부두·갑판·산호·현무암·수정·구름·마을 돌·정글 흙 등 17종). 이미지 파일은 없다. 잠긴 문의 빛 기둥(`barrier-*`)도 같은 방식이다.
- **앱 아이콘**: `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`. `scripts/make-app-icons.py`가 `art-source/webtoon/hero-webtoon.webp`의 상반신을 잘라 만든다. 홈 화면 설치용 `public/manifest.webmanifest`가 참조한다.
- **임시 대체(ART_DRAFT)**: S01·S03 선장과 S04 선원은 `villager-webtoon`을, S10 바람 안내자는 `roc-webtoon`을 임시로 쓴다. 전용 원화 요청은 `docs/CODEX_ART_TASKS.md`의 A2에 있다.
- 남은 최종 아트(공격·피격 프레임, 적 행동 프레임, 표정, 지형·무기 최종화, 효과, UI 아이콘)는 `docs/CODEX_ART_TASKS.md`에 계약과 함께 정리했다.

아래 표의 경로 `public/assets/webtoon/`은 2026-10-03부터 원본 기준으로는 `art-source/webtoon/`이다. 표의 크기는 원본 크기다.

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
