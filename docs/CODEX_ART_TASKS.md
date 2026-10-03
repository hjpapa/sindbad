# Codex 아트 작업 지시서 · 2026-10-03

이 문서는 Claude가 모바일 UI/UX·무기 연출·장면 정리 작업을 끝낸 뒤, **이미지 생성이 필요한 최종 아트**를 Codex에게 넘기기 위한 지시서다. Claude 세션에는 이미지 생성 도구가 없어서 웹툰 품질의 래스터 원화(공격·피격 프레임, 표정, 새 NPC)는 만들지 못했다. 코드로 만들 수 있는 부분(무기 SVG, 지형 텍스처, 앱 아이콘, 이미지 경량화)은 이미 반영했다.

맨 아래 **6절**에 Codex에 그대로 붙여 넣을 지시문이 있다.

---

## 1. 지금 들어가 있는 것 (2026-10-03 기준)

| 영역 | 현재 상태 | 파일 |
|---|---|---|
| 주인공 | 서 있는 원화 1장 + 달리기 6프레임. **공격·피격·점프 전용 프레임 없음.** 점프는 달리기 3·4번 프레임을 빌려 씀 | `art-source/webtoon/hero-webtoon.webp`, `hero-run.webp` |
| 무기 7종 | 손에 드는 자체 SVG. 공격할 때만 손에 나타나 휘두름 | `public/assets/weapons/W01~W07.svg`, `scripts/make-weapon-art.mjs`, `src/game/weapons.ts` |
| 적 | 6종이 한 장씩만 있는 정지 아틀라스(뱀·호랑이·돌 거인·용·해적·해골). 예고·공격은 색조·돌진 트윈과 바닥 경고 타원으로 대신함 | `enemy-atlas.webp` |
| S01·S03 선장, S04 선원 | **임시로 `villager-webtoon`(하미드)을 사용 중.** 예전에는 주인공 원화를 재사용해서 화면에 신밧드가 두 명이었음 | `src/content/maps.ts` |
| S10 바람 안내자 | 임시로 로크새 원화 사용 | `src/content/finalStages.ts` |
| 지형 | 장소별 절차 생성 텍스처 17종(나무 부두, 갑판, 산호, 현무암, 수정, 구름, 마을 돌, 정글 흙 등) | `src/game/terrain.ts` |
| 대화 초상 | 인물마다 기본 표정 1장. 표정 변화 없음 | `art-source/webtoon/*-webtoon.webp` |
| 투사체·효과 | Phaser 원 + 글자(≋, ♪), 별·원 입자 | `src/game/stage.ts`의 `projectile()`, `hitPop()` |
| 터치 버튼 아이콘 | 이모지(💬 ✋ ⛵ ✦ 🪶)와 무기 SVG | `src/game/touch.ts` |
| 앱 아이콘 | 주인공 원화로 만든 192/512/180px PNG | `public/icons/`, `scripts/make-app-icons.py` |

### 원본과 런타임 파일 구조 (중요)

- **원본(무손실)**: `art-source/webtoon/*.webp`. 배포되지 않는다(`.vercelignore`).
- **런타임(휴대폰이 받는 파일)**: `public/assets/webtoon/*.webp`. `python scripts/optimize-webtoon.py`가 원본을 줄이고 손실 WebP로 만든다. 34.6MB → 2.7MB.
- 원화를 추가·교체하면 반드시 **원본을 `art-source/webtoon/`에 두고** 최적화 스크립트를 다시 돌린다. `public/assets/webtoon/`을 직접 고치지 않는다.
- 런타임 크기와 시트 프레임 크기는 `src/content/assets.manifest.ts`의 `runtimeSize`와 `scripts/optimize-webtoon.py`의 `SIZES`에 **둘 다** 적는다.

---

## 2. 모든 아트에 공통으로 적용하는 기술 계약

1. **화풍**: `hero-webtoon.webp`를 화풍 참조로 쓴다. 선명한 외곽선, 셀 음영, 따뜻한 청록·금색 팔레트, 왼쪽 위에서 오는 빛. 오리지널 디자인만 쓰고 기존 작품·작가·게임 이미지를 참조하거나 흉내 내지 않는다.
2. **배경**: 인물·적·소품은 완전 투명 배경 RGBA. 글자·로고·서명·워터마크를 넣지 않는다.
3. **방향**: 모든 인물과 적은 **오른쪽을 본다**. 왼쪽은 게임이 뒤집어서 그린다.
4. **스프라이트 시트**: 정사각 셀 격자(예: 3열×2행, 3열×3행), 원본 셀 512px. 셀 경계를 넘는 팔·무기·효과가 없어야 한다. 런타임에서는 셀 256px로 줄어든다.
5. **발 기준선**: 셀마다 발바닥 y좌표(512px 기준)를 기록한다. 달리기 시트는 `[498,498,498,474,469,470]`이다(`stage.ts`의 `baseline`). 새 시트도 같은 형식의 배열을 JSON으로 남긴다.
6. **어린이 안전**: 피·상처·절단·고문 표현, 겁주는 클로즈업, 신을 희화화하는 표현을 넣지 않는다. 인간 적은 항복 자세, 동물은 저주가 풀리는 반짝임, 마법 적은 빛·연기로 사라지는 표현을 쓴다.
7. **정직한 기록**: 새 파일마다 `docs/ART_PROMPTS.md`에 생성 지시 요지·원본 파일명·크기를, `docs/ASSET_REGISTER.md`에 경로·출처·이용 조건을 적는다. 검수 전에는 계속 `ART_DRAFT`로 표시한다. 없는 파일을 등록하거나 완성 아트라고 쓰지 않는다.
8. **ID 유지**: 맵 오브젝트·보상·아이템 ID는 바꾸지 않는다. 텍스처 키만 바꾼다.

---

## 3. 작업 목록 (우선순위 순)

### A1. 신밧드 액션 시트 `hero-action` · P0

손에 든 무기는 게임이 SVG로 따로 그리므로 **무기 없이 주먹을 쥔 손**으로 그린다. 허리의 칼집은 공격 프레임에서 비어 있어도 된다.

- 원본: `art-source/webtoon/hero-action.webp`, 1536×1536, 3열×3행, 셀 512px, 투명 배경.
- 셀 순서: 0 숨쉬기 A · 1 숨쉬기 B · 2 점프 상승 · 3 낙하 · 4 피격(움찔하는 자세, 상처 없음) · 5 공격 준비(팔을 뒤로) · 6 공격(앞으로 휘두름) · 7 공격 마무리 · 8 기뻐하는 자세(보물 획득).
- 함께 낼 파일: `art-source/webtoon/hero-action.json`. 셀마다 `{ "baseline": 발 y, "hand": [x, y] }`, 512px 셀 기준이다.
- 코드 연결:
  1. `assets.manifest.ts`에 `'hero-action': { width: 768, height: 768, frame: 256 }`을 추가한다.
  2. `optimize-webtoon.py`의 `SIZES`에 `(768, 768)`을 추가한다.
  3. `stage.ts`의 `sceneAssets()`에서 비행 맵이 아닐 때 `hero-action`을 로드한다.
  4. `update()`의 `heroArt` 프레임 선택에서 서 있기·공중·피격·공격일 때 `hero-action` 셀을 쓰고, 달리기는 `hero-run`을 유지한다. 공격 셀은 `attackAge` 기준으로 0~80ms는 5, 80~200ms는 6, 이후는 7을 쓴다.
  5. `drawWeapon()`의 손 위치(`handX`, `handY`)를 JSON의 `hand` 값으로 바꾼다. 512px 셀 좌표를 표시 크기(144px)로 환산한다.
- 완료 기준: 7종 무기 모두 손에서 자연스럽게 휘둘리고, 왼쪽을 볼 때도 손과 무기가 맞는다(휴대폰·태블릿 스크린샷 비교).

### A2. 친근한 선장 NPC `captain-webtoon` · P0

- 중년의 선장. 주인공과 확실히 구분되도록 회색 수염, 남색 선장 코트, 삼각모, 망원경을 넣는다. 1024×1536 원본, 전신, 투명 배경.
- 선원(S04)은 `sailor-webtoon`으로 따로 그리면 더 좋다. 줄무늬 셔츠, 두건, 밧줄 꾸러미.
- 코드 연결:
  - `src/content/maps.ts`: `S01.captainTalk`, `S03.captainTalk`의 `texture`를 `captain-webtoon`으로, `S04.sailor`를 `sailor-webtoon`으로 바꾼다.
  - `src/main.ts`의 `portraitPath()`에서 `'captain','storm'`은 `captain-webtoon`, `'whale'`은 `sailor-webtoon`을 쓰게 한다.
  - `assets.manifest.ts`의 인물 목록에 두 키를 추가한다(런타임 512×768).
- S10 `바람 안내자`(현재 로크새 원화)도 어린 로크새 원화가 생기면 교체한다.

### A3. 적 행동 프레임 `enemy-actions` · P1

- 적 종류마다 **대기 · 공격 예고 · 공격 · 쓰러진 뒤** 4셀. 예고 셀은 실루엣만 봐도 "곧 공격한다"는 것을 알 수 있어야 한다(무기를 높이 들기, 몸을 웅크리기).
- 대상과 쓰러진 뒤 자세:
  - 해적 해골(S01 해골·궁수·대장 공용): 빛으로 사라지기 직전 자세.
  - 산적·경비병·해적 선장: 무기를 내려놓고 손을 드는 **항복** 자세.
  - 뱀·호랑이·용·게: 저주 표식이 사라지며 편안해진 자세.
  - 돌 거인·쿠우라 분신: 빛으로 흩어지기 직전 자세.
- 원본: 4열 × 종류 수 행, 셀 512px.
- 코드 연결:
  - `stage.ts`의 적 생성부에서 `enemy-atlas` 프레임 번호 대신 `enemy-actions`의 행 번호를 쓴다.
  - `updateEnemies()`의 `idle/telegraph/attack/recover` 상태에 맞춰 `setFrame(row*4 + 셀)`을 호출한다.
  - `defeatEffect()`에서 항복·저주 해제 셀을 보여 준 뒤 기존 트윈을 실행한다.

### A4. NPC 표정 초상 · P1

- 나이라·세이렌·라흐·지니·아리아나·왕·미라·바루·선장에게 **기본 · 기쁨 · 걱정/놀람** 3장씩 그린다. 기존 원화와 같은 의상과 같은 구도(상반신 이상)로 그린다.
- 파일명: `{인물}-faces.webp`, 3열×1행, 셀 512×768.
- 데이터 계약: 대사 줄 앞에 `[기쁨]`, `[걱정]` 태그를 선택적으로 붙인다(예: `'[기쁨]고마워요, 신밧드!'`). `main.ts`의 `host.dialogue()`에서 태그를 떼어 표정 셀을 고르고, 태그가 없으면 기본 셀을 쓴다. 대사 텍스트 테스트(`dialogue-text`)가 태그를 보지 않게 화면에는 태그를 빼고 출력한다.

### A5. 장소별 지형 타일 · P1

- 현재 `src/game/terrain.ts`가 코드로 그리는 17종 스타일 키를 그대로 쓴다: `dock, deck, reef, coral, whale, basalt, crystal, cloud, village, warehouse, sand, shadow, jungle, temple, garden, tower, kingdom`.
- 스타일마다 두 장:
  - 채움 `terrain-{key}-fill`: 128×128, 상하좌우 이음매 없는 반복.
  - 윗면 `terrain-{key}-top`: 128×34, 좌우 이음매 없음. 아래 6px는 그림자 띠.
- 원본은 4배(512×512, 512×136)로 그리고 런타임은 128px로 줄인다. 폴더는 `art-source/terrain/` → `public/assets/terrain/`.
- 코드 연결: `stage.ts`의 `preload()`에서 해당 맵 스타일의 두 파일을 같은 키로 로드한다. `ensureTerrainTextures()`는 텍스처가 이미 있으면 그리지 않으므로 그대로 둬도 된다.

### A6. 무기 최종 아트 · P2

- 현재 SVG 7종(`public/assets/weapons/W01~W07.svg`)과 **같은 캔버스 비율과 같은 손잡이 위치**로 그린다.
  - W05(활)를 뺀 무기: 160×64 비율, 원본 640×256.
  - W05: 80×160 비율, 원본 320×640.
- 손잡이 회전 중심은 `src/game/weapons.ts`의 `originX` 값과 맞춘다. 칼날은 오른쪽을 향한다.
- 무기 설명(`src/content/items.ts`)과 맞춘다: 여행자의 곡도, 바람 부메랑, 불꽃 곡도, 폭풍의 창, 파도의 활, 달빛 방망이, 새벽의 검.
- 교체해도 `weaponLooks`의 `width/height`가 같으면 코드 수정이 필요 없다.

### A7. 투사체·효과 · P2

- 세이렌 음파(≋), 음표(♪), 연의 바람탄, 쿠우라 마법구: 각 64×64, 4프레임 반복.
- 타격 불꽃, 정화 빛, 항복 깃발 반짝임: 각 128×128, 6프레임.
- 코드 연결: `stage.ts`의 `projectile()`이 지금 만드는 `Arc` + `Text` 대신 스프라이트 애니메이션을 쓴다. 판정 반경은 바꾸지 않는다.

### A8. 터치 UI 아이콘 · P2

- 점프, 대화, 살펴보기, 출발, 날개 공격, 보물 능력 4종(불꽃·다리·방패·새벽): 128×128 PNG, 투명 배경, 굵은 외곽선. 72px 버튼 안에서도 알아볼 수 있어야 한다.
- `src/game/touch.ts`의 `contextIcon`과 `setSkill()`의 이모지를 `<img>`로 바꾼다.

---

## 4. 하지 말 것

- `public/assets/webtoon/`의 런타임 파일을 직접 편집하지 않는다. 항상 `art-source` → `optimize-webtoon.py` 순서로 만든다.
- 휴대폰 첫 화면에 받는 파일(배경 1장 + 주인공 2장 + 적 아틀라스 + JS/CSS)이 8MB를 넘으면 안 된다(`npx tsx scripts/check-art-budget.ts`). 원본을 런타임에 그대로 넣지 않는다.
- 보상·오브젝트 ID, 저장 형식, 터치 버튼의 `data-action` 값과 `aria-label`(`터치 행동`, `가방과 지도`, `일시정지`)을 바꾸지 않는다. E2E가 이 값들을 쓴다.
- 공개 배포·기존 배포 교체는 사용자 요청 없이 하지 않는다.

---

## 5. 검증 순서

```text
python scripts/optimize-webtoon.py
python scripts/audit-webtoon.py
npm run typecheck
npm run lint
npm run test
npm run validate:content
npm run build
npx tsx scripts/check-art-budget.ts
npm run dev   (다른 창)
node scripts/mobile-check.mjs        # 휴대폰 844×390 + 태블릿 1180×820, 실제 터치 이벤트
npm run test:e2e
```

`scripts/mobile-check.mjs`는 `docs/screenshots/mobile-*.png`에 휴대폰·태블릿 화면을 저장하고 다음을 JSON으로 출력한다.

- 보이는 버튼 목록
- 이동·손가락 밀기·이동+점프 동시 입력 결과
- 첫 해골 처치 여부
- 선장 앞에서 행동 버튼이 "대화"로 바뀌는지와 첫 대사
- 콘솔 오류

새 원화를 넣으면 이 스크린샷과 이전 스크린샷을 나란히 비교해 크기·기준선·방향을 확인한다.

---

## 6. Codex에 붙여 넣을 지시문

```text
AGENTS.md, PROJECT_STATUS.md, docs/CODEX_ART_TASKS.md를 먼저 끝까지 읽어라.
이번 작업은 docs/CODEX_ART_TASKS.md의 A1(신밧드 액션 시트)과 A2(선장·선원 NPC)다.

1. hero-webtoon.webp를 화풍 참조로, 내장 이미지 생성으로 다음을 만든다.
   - hero-action: 3×3, 셀 512px, 투명 배경, 오른쪽을 보고 무기 없이 주먹 쥔 손.
     셀 순서: 숨쉬기A, 숨쉬기B, 점프 상승, 낙하, 피격(상처 없음), 공격 준비, 공격, 공격 마무리, 기쁨.
   - captain-webtoon(1024×1536): 회색 수염, 남색 코트, 삼각모, 망원경을 든 친근한 선장.
   - sailor-webtoon(1024×1536): 줄무늬 셔츠, 두건, 밧줄 꾸러미를 든 선원.
   셀 경계를 넘거나 글자가 들어간 결과는 다시 생성한다. 원본은 삭제하지 않는다.
2. 원본을 art-source/webtoon/에 무손실 WebP로 저장한다(scripts/encode-webtoon.py 방식).
   hero-action.json에 셀별 baseline과 hand 좌표(512px 기준)를 측정해 기록한다.
3. optimize-webtoon.py의 SIZES와 assets.manifest.ts의 runtimeSize에 새 키를 등록하고
   스크립트를 실행해 public/assets/webtoon/에 런타임 파일을 만든다.
4. 코드 연결은 문서 A1·A2의 "코드 연결" 단계를 그대로 따른다. 손 위치는 JSON 값을 쓴다.
5. 5절 검증 순서를 모두 실행하고, 실제 결과(통과/실패, 스크린샷 경로)를 PROJECT_STATUS.md에 적는다.
   docs/ART_PROMPTS.md와 docs/ASSET_REGISTER.md에 새 파일을 기록하고 ART_DRAFT를 유지한다.
6. 실행하지 못한 검사는 "미검증"과 이유를 적는다. 배포는 하지 않는다.
```

A3~A8은 한 번에 하나씩, 같은 형식으로 지시한다. 예: "이번 작업은 A5 지형 타일이다. 5절 검증을 모두 실행하라."
