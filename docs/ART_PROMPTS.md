# 장별 일러스트 제작 기록

## M6 세이렌 행동 4프레임 · 2026-10-04 · ART_DRAFT

기능 검사: 단위111개·정적8명령·세이렌4조건 통과, 새 게임36구간818초 완주. 전체64통과/1파도 검사 실패와 이동 도우미 보완 후 해당1통과를 구별한다. 주요45화면·보완3화면 및 실제 경로/해시는 `docs/validation/m6-siren-{final-screenshots,postcheck}.json`이다. 원화 생성·브라우저 기능 통과를 최종 사용자 아트 승인으로 취급하지 않는다.

OpenAI **내장 imagegen**으로 후보2장을 생성했다. 프로젝트 자체 `siren-webtoon.webp`의 인물·의상·조개 리라와 `hero-webtoon.webp`의 웹툰 외곽선·셀 음영을 참조했다. 긴 남색 머리, 금색 조개 머리 장식, 청록/금색 코트, 몸을 가리는 흰 튜닉·바지, 샌들을 유지했다. 외부 작품·작가 참조 없음. 인물은 인간형 바다 음악가다.

순서는 **대기·노래 예고·음파 공격·평온한 저주 해제**다. 오른쪽을 향한 전신, 동일 인물·규모, 실제 RGBA 투명 배경, 글자·음표 기호·격자·배경·피·상처 없음으로 지시했다. 첫 후보는 공격 파동이 중앙 세로 경계를 넘어 반려하고 원본을 보존했다. 두 번째는 인물과 효과를 셀 중앙에 작게 배치하고 넓은 투명 여백을 명시해 다시 생성했다. 실제 치수는 두 장 모두1254×1254/2×2이며 선택2번의 중앙/외곽 경계는 가시 알파>16 기준 모두 비었다. 글자 없음과 안전한 해제 자세는 육안 확인이다.

전체 실제 프롬프트·참조·도구 원본 경로·선택/반려 이유는 `art-source/webtoon/generated/siren-m6/siren-actions-{01,02}.json`에 있다. 동명 PNG는 도구 결과와 바이트 동일 보존한다. `scripts/pack-siren-actions.py`는 전체627px 셀을512px로 균일 축소하여4×1 재배열하고 **2048×512 PNG + 동일 RGBA 무손실 WebP(441,120B)**를 만든다. 자르기/덧칠은 하지 않았다. 런타임은 최적화 스크립트가 만든 **1024×256 WebP(49,312B)**다.

실측 가시 기준선은512px 셀에서 **461/461/448/450**, 대기 가시 높이312다. `siren-actions.json`을 게임 JSON으로 동일 복사하고 기준선·기존 바닥 오프셋58로 발 위치를 맞춘다. S02에서만 새 시트를 로드하며 누락 시 기존 세이렌 원화로 복구한다. 검증 실제 결과는 `PROJECT_STATUS.md`에 기록한다. 실기기·최종 사용자 아트 승인은 미검증이며 **ART_DRAFT**를 유지한다.

## M6 비행 고리·돌풍·낙하 파편 · 2026-10-04 · ART_DRAFT

OpenAI **내장 imagegen**으로 3종을 개별 생성했다. 프로젝트 자체 `hero-webtoon.webp`는 외곽선·셀 음영·청록/금색·왼쪽 위 조명만 참조하고 인물은 그리지 않았다. 실제 원본은 각각 **1086×1448 RGBA**이며 원래 생성 경로와 `art-source/webtoon/generated/flight-m6/{key}-01.png`에 바이트 동일 보존했다. 외부 작품·작가를 참조하지 않았다. 글자·잘림·피/상처 없음은 육안 확인, 투명 경계는 alpha>16 검사다. 최종 사용자 아트 승인은 미검증으로 **ART_DRAFT**다.

| 키 | 생성 지시 요지 |
|---|---|
| prop-flight-ring | 금색·청록색 세로 타원 바람 고리. 두꺼운 선명한 테두리와 작은 바람 곡선, 가운데는 완전히 비운 투명 공간. 받침·플랫폼 없음. |
| prop-gust-cloud | 둥근 청록/크림 돌풍 구름과 오른쪽 짧은 바람 곡선 3개, 작은 금빛 장식. 얼굴·비·배경 없음. |
| prop-falling-debris | 청록 음영이 있는 사암 탑 블록 1개와 작은 파편 2개. 날카로운 가시·해골·몸·문자 없음. |

공통 지시: `illustration-story`, 어린이용 오리지널 횡스크롤 비행 소품, 하나의 중앙 오브젝트, 3:4 세로 캔버스, 실제 RGBA 투명 배경과 바깥 여백, 글자·숫자·로고·서명·워터마크·격자·잘림 금지. 요청 여백은8%였으나 실제 가시 경계는 각각 다르므로 측정값을 기록한다. 고리 원본 가시 경계는[77,35,1011,1392], 구름은[55,336,1037,1113], 파편은[200,207,992,1209]다.

전체 실제 프롬프트·참조·네이티브 경로·SHA256·선택은 개별 `generated/flight-m6/{key}-01.json` 및 `world-props.sources.json`에 있다. 전체 캔버스만 비례 축소해 **384×512 PNG + 동일 RGBA 무손실 WebP**를 만들고 최적화 스크립트로 **96×128 WebP** 런타임을 출력했다. 자르거나 다시 칠하지 않았다. 변환·경계는 `world-props.measurements.json`이다.

실제 원화/런타임 감사와 브라우저 연결 검증은 통과했다. 고리의 기존 등불 텍스처 우선 문제를 단위 검사로 찾아 수정했고 최종 단위107개·E2E57개·새 게임36구간843초 완주를 통과했다. 실제 최종 화면41장과 해시는 `docs/validation/m6-flight-final-screenshots.json`, 원시 전체 보고서는 `m6-flight-e2e-final.json`이다. 실기기·어린이 조작성·최종 사용자 아트 승인은 미검증이며 **ART_DRAFT**를 유지한다.

## M6 상호작용 소품 25종 · 2026-10-04 · ART_DRAFT

OpenAI **내장 imagegen**과 프로젝트 자체 `hero-webtoon.webp` 화풍 참조로 아래 25종을 별도 생성했다. 생성 PNG를 원래 경로와 `art-source/webtoon/generated/props-m6/{key}-01.png`에 바이트 동일 보존했다. 실제 치수는 24장 **1086×1448**, 황금 하트 1장 **1087×1447**이다. 원본을 다시 그리거나 잘라내지 않고 전체 캔버스를 비례 축소·투명 여백으로 **384×512 PNG + 동일 RGBA 무손실 WebP**에 넣었다. 런타임은 최적화 스크립트가 만드는 **96×128 WebP**다. 생성 완료를 최종 아트 승인으로 취급하지 않으며 **ART_DRAFT**를 유지한다.

공통 프롬프트 앞부분:
> Create ONE original world interaction sprite for a bright child-friendly Korean adventure webtoon game. Attached project hero is STYLE reference ONLY: confident navy ink outlines, warm teal/gold palette, clean 2-3 flat cel shade levels, top-left lighting. Do not draw the hero. PORTRAIT 3:4 canvas requested 768x1024, true transparent RGBA background. Subject:

공통 프롬프트 뒷부분:
>  Front-facing readable silhouette at only 65x87 game pixels. Entire object centered, occupies roughly x=10%-90%, y=14%-86%, with fully transparent padding on every side. Keep the complete silhouette and all parts inside canvas. No scene, floor, cast shadow, circular backing, characters, hands, extra objects, labels, letters, numbers, logos, signature, watermark, blood, wounds or scary faces. Original project design only. Use clean limited broad color shapes rather than tiny decorative detail.

아래 subject를 두 공통 부분 사이에 넣었다. 전체 실제 프롬프트·참조·네이티브 경로·SHA256·선택·치수·투명 경계는 `art-source/webtoon/world-props.sources.json` 및 개별 `generated/props-m6/{key}-01.json`, 변환과 원화 경계는 `world-props.measurements.json`에 기록했다. 글자·잘림은 생성 결과 육안, 투명 경계·무손실 픽셀·기존 SVG 해시는 감사 스크립트로 검사한다. 게임 검증 상태는 `PROJECT_STATUS.md`에 별도로 기록한다.

| 키 | 실제 subject |
|---|---|
| prop-shell | A fan-shaped ivory clam shell with coral-pink ribs and a small teal striker bead attached at its bottom. Closed front silhouette, no animal face. It is a musical shell switch, not a pearl treasure. |
| prop-bell | A golden brass ship departure bell, front view, small suspension loop at top, broad flared lip and visible clapper at bottom. No support pole. |
| prop-golden | A friendly heart SYMBOL made of polished warm gold, two rounded lobes and a pointed bottom, thick navy outline, cream highlight and three small contained gleam marks. Clearly distinct from a coral-red healing heart. No anatomy. |
| prop-key | A large golden coral gate key, diagonally from upper left to lower right, circular bow handle, solid shaft and two broad teeth. Clearly readable key silhouette. |
| prop-lifevest | One orange and warm-gold sleeveless life jacket, two buoyant front panels with a teal belt and simple navy buckle. Empty jacket, no body, face, arms or text. |
| prop-rescue-rope | One neatly coiled thick cream maritime rescue rope with a short tied tail. Broad simple loop shape, visible twist shading, no hands or anchor. |
| prop-lifering | One round orange and cream life ring with four broad cream sections and a dark teal center opening. Small integral rope attachments, no ocean or people. |
| prop-lightning-rod | One safe fantasy lightning protection device: upright teal-metal mast, horizontal upper crossbar, sturdy small flat base, central golden lightning bolt emblem. Not an electrical hazard, no lightning arcs outside object. |
| prop-damaged-mast | One short wooden ship mast with a slightly bent spar, thick rope bindings and one mild structural crack, warm honey wood and teal metal fittings. No people, splinters flying or dangerous damage. |
| prop-coral-gate | One small upright arch gate in coral-pink stone, navy opening with two teal bars and a centered gold diamond lock. Whole arch and footings inside canvas. |
| prop-vine | One upright intertwined green vine with four broad friendly rounded leaves, forming a loose S shape. Thick readable stems, no thorns or flowers. |
| prop-torch | One upright short wooden torch, cloth wrapping at top and a contained warm orange flame with cream inner core. Entire flame and handle inside canvas, no sparks outside. |
| prop-furnace | One friendly squat stone fantasy furnace, navy-purple body, wide rectangular fire opening, gold-bronze upper rim and small warm orange contained inner flame. No chimney smoke. |
| prop-wave-rope | One upright hanging cream maritime rope with a large loop knot at its lower end, clear three horizontal twist bands. Entire rope and loop inside canvas. |
| prop-mirror | One upright hexagonal pale-blue crystal mirror with a lavender-and-gold frame and one simple UP ARROW symbol engraved in cream at its center. Arrow only, no letters or numbers. Preserve clear arrow direction for rotation puzzle. |
| prop-journal | One closed upright cream-and-brown travel journal, navy binding, blank cover, small teal bookmark ribbon. Simple raised bands rather than writing, no letters or readable marks. |
| prop-star-map | One unfolded upright cream and lavender travel map with two fold lines, a large golden five-point star and a simple teal triangle route. Symbols only, no labels, letters, coordinates or numbers. |
| prop-lantern | One upright friendly teal and brass lantern with a small loop handle, warm gold glass panes and a cream inner flame. Short broad foot, no light rays or glow outside silhouette. |
| prop-star-device | One upright small fantasy compass puzzle device on a gold pedestal: navy circular dial inside lavender rim, large four-point gold compass star with teal center gem. No letters, numerals or tick labels. |
| prop-cargo | One sturdy honey-brown wooden delivery crate with diagonal reinforcing planks and broad brass bands, simple gold diamond plate without text. Subtle top and right side, no tools or contents outside. |
| prop-gift | One teal square reward gift box with gold ribbon, coral-red bow on top, thick navy outline. No letters, tags or additional gifts. |
| prop-treasure-altar | One small friendly fantasy treasure pedestal with navy stone stepped base, gold trim and a large teal diamond-shaped crystal floating immediately above it. Simple cream center glow contained inside crystal, no deity or person. |
| prop-moon-rock | One small faceted lavender moon rock with broad cream fracture seams and a small gold four-point sparkle engraved on its face. Stable whole rock, no fragments flying, no face. |
| prop-lotus-shrine | One peaceful original decorative lotus pedestal: a large rounded pink lotus blossom on a low gold stone base, tiny teal center. Pure floral decoration, no person, deity or religious figure. |
| prop-ending | One celebratory gold bell on a short upright gold stand, coral clapper, cream engraved wave band. Three small gold gleams stay within canvas. No people, letters or confetti outside. |

## M6 소품 · 2026-10-04 · 보물 상자·회복 하트 · ART_DRAFT

OpenAI **내장 imagegen**으로 소품마다 투명 PNG를 별도 생성했다. 프로젝트 자체 `hero-webtoon.webp`를 화풍 참조로 사용했다. 남색 외곽선, 따뜻한 목재·금색/산호 빨강, 왼쪽 위 빛, 작은 표시에서도 읽히는 셀 음영과 큰 실루엣을 지시했다. 글자·로고·서명·외부 작품·캐릭터·피·상처를 넣지 않았으며 육안으로 잘림과 글자 없음, 실제 RGBA 경계를 확인했다. 사용자 최종 아트 승인 전 **ART_DRAFT**다.

| 키 | 생성 지시 요지 | 원본 보존 경로 |
|---|---|---|
| `prop-chest` | 닫힌 꿀빛 나무 보물 상자, 둥근 뚜껑, 금색 띠 2개와 중앙 열쇠구멍, 정면에서 윗면·오른쪽 면이 살짝 보이게, 상자 밖 소품·바닥 없음 | `art-source/webtoon/generated/props/prop-chest-01.png` |
| `prop-heart` | 해부학 표현 없는 친근한 산호색 하트 기호 1개, 둥근 두 윗부분과 아래 끝, 남색 테두리·왼쪽 위 아이보리 하이라이트, 하트 밖 장식 없음 | `art-source/webtoon/generated/props/prop-heart-01.png` |

요청은 768×1024이고 실제 생성 PNG는 둘 다 **1086×1448 RGBA**다. 생성 원본을 바이트 동일 보존하고 전체 3:4 캔버스를 균일 축소해 `art-source/webtoon/prop-{chest,heart}.{png,webp}` **384×512** PNG/동일 RGBA 무손실 WebP를 만들었다. 잘라내기·재채색·배경 추출 없음. `scripts/pack-world-props.py`로 재현하며 프롬프트 전문·기본 생성 경로·SHA256·참조·실제 치수는 `world-props.sources.json`, 원화 경계·실제 표시 크기는 `world-props.measurements.json`에 있다.

`scripts/optimize-webtoon.py`의 SIZES와 매니페스트 runtimeSize는 **96×128**이다. 기존 월드 소품의 캔버스와 표시 사각형을 유지했다(상자 65.28×87.04, 일반 하트 34.56×46.08, 큰 하트 48×64). HUD 하트는 별도 UI이며 이번 두 파일은 월드 획득 소품이다. 런타임은 상자 **3,872바이트**, 하트 **2,882바이트**로 최적화 스크립트가 출력한다. 기존 `public/assets/draft/{chest,heart}.svg`도 그대로 보존했다. 원화/런타임 검사 결과는 `docs/validation/world-props.json`에 기록한다. 최종 전체 E2E **49개/exit0**, 신규 36스테이지 완주 **815초**, 최종 PNG 24장·실제 경로/해시는 `docs/validation/m6-props-final-screenshots.json`에 있다. 기능 검증과 아트 승인을 구별하며 ART_DRAFT를 유지한다.

## A8 · 2026-10-04 · 터치 UI 아이콘 9종 · ART_DRAFT

OpenAI **내장 imagegen**으로 아이콘마다 별도 투명 PNG를 생성했다. 프로젝트 자체 `hero-webtoon.webp`를 화풍 참조로만 사용했다. 굵은 남색 외곽선·셀 음영·청록/금색/아이보리, 왼쪽 위 빛, 작은 버튼 안에서도 구별되는 큰 실루엣, 글자/레이블/로고/서명/피/상처 없는 투명 RGBA가 공통 지시다. 버튼 배경이나 격자를 이미지에 넣지 않았다. 외부 작품·작가 참조 없음.

| 키 | 실제 생성 지시 요지 |
|---|---|
| `ui-jump` | 단순한 아이보리 부츠와 위쪽을 향한 청록 화살표 하나. 첫 후보의 아래쪽 화살표가 모호해 장식·다른 화살표 없이 재생성. |
| `ui-talk` | 아이보리 말풍선, 굵은 청록 테두리, 금색 점 3개. 문자 없음. |
| `ui-inspect` | 손가락을 편 친근한 갈색 항해 장갑과 작은 금빛 반짝임. |
| `ui-depart` | 오른쪽으로 향한 청록 돛배, 아이보리 돛, 금색 깃발, 짧은 물결. |
| `ui-wing` | 청록·아이보리 로크 날개와 날개 공격을 나타내는 금색 궤적. |
| `ui-flame` | 큰 주황/호박색 불꽃, 아이보리 중심, 청록 파동. |
| `ui-bridge` | 라벤더·청록 아치 다리, 두 지지대, 금빛 반짝임. |
| `ui-shield` | 청록 방패와 아이보리/금색 연꽃 문양. |
| `ui-dawn` | 청록 수평선 위 떠오르는 금색 해, 굵은 빛살 5개, 작은 라벤더 반짝임. |

전체 실제 프롬프트·도구 원본 경로·참조·선택·SHA256은 `art-source/webtoon/touch-icons.sources.json`에 있다. 실제 도구 반환 크기는 모두 **1254×1254**다. 생성 PNG **10개(선택 9/미선택 1)**를 `art-source/webtoon/generated/touch/{key}-01.png`와 `ui-jump-02.png`에 도구 원본과 바이트 동일 보존했다. 첫 점프 후보와 도구 원본을 삭제하지 않았다. 선택 9개는 글자 없이 가시 알파 >16의 바깥 경계가 비었음을 확인했다.

`scripts/pack-touch-icons.py`는 정사각 **캔버스 전체**를 균일하게 512×512로 축소해 `{key}.png`와 동일 RGBA 무손실 `{key}.webp`를 만든다. 실루엣을 자르거나 다시 칠하거나 알파를 추출하지 않는다. 원화 경계·크기·선택 후보는 `touch-icons.measurements.json`이다. `optimize-webtoon.py`의 `SIZES`와 매니페스트 `runtimeSize`에 128×128을 등록했고 A8은 문서 규격대로 **`public/assets/webtoon/{key}.png`**로 출력한다. 런타임 9개 합계 **182,840바이트**.

`touch.ts`의 점프·문맥 행동·보물 선택에 연결했다. 선택 스킬 ID `flamePulse/moonBridge/lotusShield/dawnWave`로 그림을 고르고, 무기 그림은 기존 표시를 유지한다. UI 그림은 회전하지 않으며 버튼의 한국어 캡션·접근성 이름·행동 ID·포인터 캡처를 유지한다. 그림 누락은 기존 기호로 복구하고 같은 능력의 HUD 갱신에서는 이미지 노드를 유지한다. 생성/원화/런타임 감사는 통과했으며 실제 브라우저 검증과 미검증 결과는 `PROJECT_STATUS.md`에 별도 기록한다. 최종 사용자 아트 승인은 미완료이므로 ART_DRAFT를 유지한다.

실제 최종 검증: 원화/런타임 감사·단위103개·전체 E2E46개 통과, 새 게임 S01~S36 완주829초, 무기/보물 각7종·엔딩/재개/재방문 확인. 실제 버튼27장·72px 표시 비교2장·모바일6장·완주7장의 최종 모음은 `docs/screenshots/art-a8/final/art-a8/`이다. 원시 경로와 바이트 동일 복사 해시는 `a8-final-screenshots.json`에 있다. 첫 타입/터치 검사 실패, Windows 기존 화면 저장 실패와 중단 실행은 `a8-development.json`에 보존했다. 실기기·어린이 이해도·최종 사용자 승인은 미검증이며 ART_DRAFT 유지.

## A6 · 2026-10-03 · 무기7종 · ART_DRAFT

OpenAI **내장 imagegen**으로 무기별 한 장씩 생성했다. 프로젝트 자체 `art-source/webtoon/hero-webtoon.webp`는 선명한 잉크 선·2~3단계 셀 음영·금속/가죽 재질의 화풍 참조, `art-source/weapons/references/W01~W07.png`는 기존 자체 SVG를 그대로 렌더한 형태/색 참조다. 외부 작품·작가·이미지는 참조하지 않았다. 투명 RGBA, 한 무기만, 글자·손·인물·피·상처·바닥 그림자 없음, 칼날/창끝은 오른쪽이다.

| ID | 제작 내용 | 원본 / 런타임 | 원본 손잡이 회전 중심 |
|---|---|---|---|
| W01 | 여행자의 은빛 곡도·금빛 타원 가드·가죽 손잡이 | 640×256 / 160×64 | 83.2,128 |
| W02 | 청록 바람 부메랑·낮은 V자·금빛 중앙 손잡이 | 640×256 / 160×64 | 320,128 |
| W03 | 불꽃 곡도·붙어 있는 불꽃3개 | 640×256 / 160×64 | 83.2,128 |
| W04 | 폭풍의 창·목재 자루·푸른 창끝·짧은 리본 | 640×256 / 160×64 | 160,128 |
| W05 | 파도의 활·청록 곡선·왼쪽 시위·가죽 손잡이 | 320×640 / 80×160 | 144,320 |
| W06 | 달빛 방망이·둥근 보라 머리·초승달 | 640×256 / 160×64 | 51.2,128 |
| W07 | 새벽의 검·직선 진주빛 칼날·태양 가드 | 640×256 / 160×64 | 96,128 |

실제 전체 프롬프트·도구 원본 경로·참조·선택/미선택·해시·생성 크기는 `art-source/weapons/weapons.sources.json`이다. 도구 반환 크기는 가로 **1983×793**, 활 **887×1774**다. 부메랑 첫 후보는 V자 높이가 커서 중앙 회전점을 맞추면 날개가 너무 작아졌다. 낮고 넓은 V자로 한 번 다시 생성했다. 생성 PNG **8개(선택7/미선택1)**를 `art-source/weapons/generated/`에 바이트 그대로 보존했다.

`pack-weapons.py`는 실제 가죽/금속 손잡이의 원본 픽셀 좌표를 측정한 뒤 **균일 축소와 평행 이동만** 적용한다. 모든 알파>0의 범위가 캔버스 안에 들어오며, 투명 빈 여백만 캔버스 밖으로 갈 수 있다. 덧칠·색상 키 추출·실루엣 자르기·비율 늘이기는 하지 않는다. 원본 PNG와 무손실 WebP의 RGBA가 동일하다. 측정값·변환·경계·보존 SVG 해시는 `weapons.measurements.json`이다. 부메랑/활의 기존 SVG 손잡이 그림은 코드 중심에서 벗어나 있었으므로 새 원화의 실제 손잡이를 기존 `originX`에 맞췄다.

정규화 PNG/WebP7종은 `art-source/weapons/W01~W07.{png,webp}`, 런타임은 최적화 스크립트가 만드는 `public/assets/weapons/W01~W07.webp`다. 기존 SVG7종은 보존하고 파일 누락 시 대체물로 사용한다. 손 위치는 A1 JSON, 표시 크기·회전·공격 시각·판정은 기존 코드다. 기능 검사와 최종 아트 승인을 구별하며 **ART_DRAFT 유지**, 공개 배포 없음.

## A5 · 2026-10-03 · 장소별 지형17스타일 / 34타일 · ART_DRAFT

OpenAI **내장 imagegen**으로 17개 스타일의 채움/윗면을 각각 별도 생성했다. 입력 `art-source/webtoon/hero-webtoon.webp`는 선명한 외곽선·2~3단계 셀 음영·왼쪽 위 재질 조명만을 위한 프로젝트 자체 화풍 참조다. 인물·무기·기존 작품/작가·로고·글자는 그리지 않는다. 지형은 불투명한 재질 텍스처이며 인물처럼 투명 여백을 두지 않는다. 채움은 낮은 대비의 정면 재질, 윗면은 평평한 경계와 아래 그림자 띠를 지시했다. 원래17개 스타일 키·팔레트·발판 크기를 유지한다.

| 스타일 | 채움 / 윗면 재질 |
|---|---|
| dock | 꿀빛 부두 목재 / 밝은 나무 윗면 |
| deck | 어두운 풍화 갑판 목재 / 따뜻한 갈색 윗면 |
| reef | 청록색 해식 석회암·작은 산호 입자 / 바다 거품빛 돌 |
| coral | 보랏빛 청색 산호 암석 / 분홍 산호빛 돌 |
| whale | 청회색 바다에 닳은 돌 / 옅은 청록 돌 |
| basalt | 짙은 자회색 현무암·절제한 호박색 광맥 / 주황빛 돌 |
| crystal | 남보라 수정 암석·각진 광물 면 / 연보라 돌 |
| cloud | 청백색 둥근 구름 재질 / 상아색 구름 |
| village | 황토색 마을 돌벽 / 이끼색 석재 |
| warehouse | 오래된 갈색 창고 목재 / 황금 갈색 나무 |
| sand | 금빛 압축 사암 / 크림색 사암 |
| shadow | 검보라 성벽 석재 / 연보라 석재 |
| jungle | 짙은 갈색 정글 흙·돌 입자 / 녹색 잔디 띠 |
| temple | 황토색 신전 돌·비종교 기하 문양 / 밝은 황금 석재 |
| garden | 부드러운 갈색 정원 흙·작은 자갈 / 연녹색 잔디·작은 분홍 꽃잎 |
| tower | 짙은 청회색 탑 돌벽 / 밝은 청회색 돌 |
| kingdom | 따뜻한 상아색 왕궁 석재 / 황금 상아색 돌 |

**실제 프롬프트41개·참조·원본 경로/크기/SHA256·선택34/미선택7**은 `art-source/terrain/terrain.sources.json`에 있다. 생성 PNG41개는 `art-source/terrain/generated/`에 도구 반환 파일과 바이트 동일하게 보존했다. 부두 윗면 첫 후보는 띠 밖의 번짐/여백 때문에, 현무암·수정·마을·정글·정원·왕국 채움 첫 후보는 윗면/잔디/테두리 띠가 반복되기 때문에 다시 생성했다. 미선택 원본도 삭제하지 않았다.

도구 반환 채움은 **1254×1254**, 선택한 윗면은 **1935×812~2048×768의 실제 크기**이며 요청 크기로 반환됐다고 기록하지 않는다. `pack-terrain.py`는 완전한 불투명 캔버스를 채움 **512×512**, 윗면 **512×136**으로 정규화하고 무손실 WebP를 인코딩한다. 채움은 균등 축소, 윗면은 가로 재질 띠 규격으로 상하 비율도 맞춘다. 덧칠·이음새 블렌딩·실루엣 잘라내기는 하지 않는다. PNG 입력/무손실 WebP의 RGBA가 완전히 동일함을 검사했다. `optimize-webtoon.py`의 SIZES와 매니페스트 runtimeSize는 각각 **128×128/128×34**다. 윗면 아래6px는 바로 위6px보다 어두운 연속 그림자 띠를 검사한다.

채움3×3/윗면3회 반복 진단과 런타임 반복 화면을 육안 확인했다. `docs/validation/terrain.json`의 경계 RGB 차이는 질감·석재 줄눈도 포함하는 검수 보조값이며, 반대쪽 경계 픽셀이 수학적으로 같다는 판정은 아니다. 실제 맵/이동 발판/파일 누락 검증은 PROJECT_STATUS.md에 별도로 기록한다. 기존 절차 생성 지형을 실제 대체물로 유지하고 **ART_DRAFT**와 최종 사용자 승인/실기기 검수를 구별한다.

최종 검증은 단위94개·E2E39개·새 게임36스테이지 무주입 완주를 통과했다. 정상 A5 화면52장과 실패 기록은 `docs/screenshots/art-a5/`에, 현재 스타일 두 파일만 로드하는 관찰과6개 움직이는 갑판의 정렬은 `terrain-art.json`, `a5-moving-platforms.json`에 있다. 실제 휴대폰/iOS와 최종 사용자 아트 승인은 미검증이며 이유는 PROJECT_STATUS.md에 기록했다.

## A4 · 2026-10-03 · NPC 표정 9명 / 27셀 · ART_DRAFT

OpenAI **내장 imagegen**으로 나이라·세이렌·라흐·지니 하질·아리아나·왕·미라·바루·선장의 기본/기쁨/걱정 초상을 제작했다. 인물별 기존 `{key}-webtoon.webp`는 얼굴·연령·의상 참조, 자체 `hero-webtoon.webp`는 웹툰 선·셀 음영 참조다. 외부 작품·작가·게임은 참조하지 않았다. 상반신·오른쪽 3/4 방향·같은 구도와 크기·투명 RGBA·글자/로고/워터마크/피/상처 없음이 공통 지시다. 왼쪽은 침착한 기본, 가운데는 웃는 눈과 따뜻한 기쁨, 오른쪽은 안쪽 눈썹을 올린 온화한 걱정/놀람이다. 얼굴은 작은 대화창에서도 읽히도록 크게 만들었다.

| 키 | 기존 원화와 맞춘 얼굴·의상 |
|---|---|
| `naira` | 성인, 긴 남청 머리, 산호·진주 장식, 지느러미 귀 장식, 청록 목걸이, 크림/산호색 드레이프 |
| `siren` | 성인, 남청 머리, 금빛 조개·청록 보석, 남색/금색/크림 로브. 악기가 경계를 넘은 첫 후보 뒤 상반신 초상에서 악기를 제외 |
| `rah` | 성인 불꽃 수호자, 짙은 곱슬머리, 금테 조끼·크림 셔츠, 붉은 어깨 천, 청록 목걸이, 몸 가까이 든 작은 등불 |
| `genie` | 성인 지니 하질, 청색 피부, 남청 터번·금 장식, 짧은 수염, 금 자수 조끼·크림 소매·남청 스카프 |
| `ariana` | 성인 지도 제작자, 묶은 갈색 머리·청록 리본·금빛 별 핀, 짧은 남청 금테 망토, 크림 여행복·갈색 허리 벨트 |
| `king` | 온화한 노인, 회백 머리·수염, 청색 보석 금관, 남청 금색 왕복·크림 중앙 의상 |
| `mira` | 성인 항구 안내인, 흰 꽃과 금 고리가 있는 땋은 머리, 주황·청록 사리/크림 블라우스, 금 장신구·청록 목걸이 |
| `baru` | 창작 도깨비 여행자, 주황 피부·한 뿔·흰 머리·뾰족 귀, 청록 금 구름 자수 옷·남청 스카프. 종교 인물과 구별 |
| `captain` | 회색 곱슬머리·수염/콧수염, 남청 금테 삼각모·코트, 크림 셔츠·갈색 대각선 어깨 끈 |

**모든 실제 영어 프롬프트·참조 대상·도구 반환 파일명·선택 목록**은 `art-source/webtoon/npc-faces.sources.json`에 기록했다. 도구의 12개 생성 PNG(선택 9, 미선택 3)를 `generated/faces/`에 바이트 그대로 보존했다. 나이라·세이렌·아리아나 첫 후보는 옷/악기가 셀 경계를 넘어서 여백을 늘려 다시 생성했다. 원본을 삭제하지 않았다. 선택한 도구 결과는 실제 **1774×887**이며, 요청한 1536×768로 반환됐다고 기록하지 않는다.

`scripts/pack-npc-faces.py`는 원본의 같은 간격 세 셀에서 가시 알파 >16의 경계가 비었음을 확인한 다음 완전한 셀을 균일 축소하고 투명 여백을 더한다. 실루엣 잘라내기·그림 덧칠·늘여 찌그러뜨리기 없이 **1536×768, 512×768 셀**의 `{key}-faces.png`를 만든다. 원본의 보이지 않을 정도인 알파 매트도 보존했다. 실제 셀 경계·원본 크기·SHA256은 `npc-faces.measurements.json`이다. `encode-webtoon.py`의 무손실 WebP는 보이는 RGBA/알파 동일성을 검사했다. `optimize-webtoon.py`가 **768×384, 256×384 셀**의 런타임 WebP를 만들며 원본/런타임 모두 감사에서 빈 가시 경계를 검사한다.

대사 데이터에 선택적 `[기쁨]`/`[걱정]` 접두 태그를 붙이고, 원래 문구·대화/보상/아이템 ID를 유지했다. DOM에 출력하기 전에 태그를 제거하며 실제 화자를 먼저 선택한다. 무태그 줄은 기본 셀, 신밧드는 기존 전신 초상, 일지/비슈누 환영은 실제 기존 대체 그림을 유지한다. 표정 파일은 해당 대화에서만 요청하고, 로딩 실패는 같은 인물의 기존 초상으로 돌아간다. S20의 이름 있는 미라 NPC는 기존 미라 전신으로 맞췄다. 보상 알림은 대화창 아래에 놓아 문장을 가리지 않도록 했다. 실제 검증/화면은 PROJECT_STATUS.md와 `docs/validation/npc-faces*.json`에 기록한다. 최종 아트 승인과 실기기 검수 전이므로 **ART_DRAFT**다.

## A3 · 2026-10-03 · 적 행동 10종 / 40포즈 · ART_DRAFT

OpenAI 내장 imagegen으로 프로젝트 자체 `hero-webtoon.webp`, `enemy-atlas.webp`, `kuura-webtoon.webp`의 화풍과 캐릭터를 참조했다. 외부 작품·작가·게임은 참조하지 않았다. 선명한 웹툰 외곽선·셀 음영·청록/남색/금색·왼쪽 위 빛, 오른쪽 방향, 투명 RGBA, 글자·서명·워터마크·피·상처 없음이 공통 지시다.

종류별 2×2 네 포즈(대기 / 공격 예고 / 공격 / 평화로운 패배)를 생성했다. 해골은 짧은 곡도와 청록 빛, 산적은 두건/짧은 칼, 경비병은 투구/방패/몽둥이, 해적 선장은 붉은 깃 삼각모/짧은 곡도다. 인간 마지막 셀은 무기를 넣고 빈손을 드는 항복이다. 뱀은 머리 후퇴→작은 마법 숨결, 호랑이는 웅크리기→짧은 도약, 용은 볼 부풀리기→작은 청록 숨결, 게는 집게 올리기→집게 닫기를 표현한다. 동물 마지막 셀은 저주 표식이 사라지고 편안해진 표정과 작은 금빛 정화 반짝임이다. 돌 거인은 주먹 들기→내려치기, 쿠우라는 구체 들기→마법 발사를 표현하며 마지막 셀은 온전한 몸의 가장자리부터 빛이 되는 마법 표현이다.

원본 PNG 18개(선택 10, 미선택 8)는 `art-source/webtoon/generated/enemy-actions/`와 도구 원본 보관소에 그대로 남겼다. 셀 경계에 닿거나 넘는 후보는 내장 도구로 여백과 배치를 다시 생성했다. 선택 파일의 실제 크기는 모두 1254×1254, 셀 627px다. `scripts/pack-enemy-actions.py`가 알파 >16의 가시 경계가 비었음을 먼저 확인하고, 완전한 네 정사각 셀을 512px로 균등 축소해 네 열로 재배열한다. 그림을 다시 칠하거나 실루엣을 잘라내지 않는다. `enemy-actions.png`는 2048×5120(4열×10행), `encode-webtoon.py`의 무손실 WebP는 보이는 RGBA·알파 동일성을 검사했다. `optimize-webtoon.py`는 1024×2560(256px 셀) 런타임 파일과 `src/content/enemy-actions.generated.json` 바이트 복사본을 만든다.

행 0~9는 `skeleton, bandit, guard, pirate, snake, tiger, dragon, crab, stone, kuura` 순서다. **선택 원본 파일명·반려 목록**은 `art-source/webtoon/enemy-actions.sources.json`, 각 행의 선택 원본 경로·40셀 발 기준선·가시 경계·대기 높이는 `art-source/webtoon/enemy-actions.json`에 실제 값으로 기록했다. 발 기준선은 가시 알파 경계의 바닥 y다. 표시 크기는 대기 가시 높이로 맞춰 투명 여백 때문에 몸이 작아지지 않도록 한다. 발은 생성 위치 아래의 고정 지면 윗면에 맞춰 바닥에 묻히지 않게 했다. 회복 상태는 대기 셀을 사용하고 전투 시간과 판정 중심은 기존 코드를 유지한다.

최종 애니메이션·실기기·사용자 승인 전이므로 ART_DRAFT다. 실제 브라우저 검사 결과는 PROJECT_STATUS.md에 기록한다. 세이렌·로크새·박쥐·정령·공중 연은 이번 10종 아틀라스에 포함되지 않으며 기존 표시를 유지한다.

## A1·A2 · 2026-10-03 · ART_DRAFT

OpenAI **내장 imagegen**으로 제작했다. `art-source/webtoon/hero-webtoon.webp`는 프로젝트 자체 캐릭터·화풍 참조다. 선명한 외곽선, 셀 음영, 따뜻한 청록·금색, 왼쪽 위 빛을 유지하고, 다른 작품·작가·게임 이미지나 문구는 참조하지 않았다. 전신은 오른쪽을 향하며 배경은 RGBA 투명, 글자·서명·워터마크·피·상처가 없다.

| 파일 | 생성 지시·크기·적용 |
|---|---|
| `art-source/webtoon/hero-action.webp` | 3×3, 512px 셀, 1536×1536. 순서: 숨쉬기 A/B, 상승 점프, 낙하, 상처 없는 움찔, 뒤로 당긴 공격 준비, 앞으로 뻗는 공격, 팔을 낮춘 마무리, 기쁨. 동일한 곱슬머리·남색 금테 조끼·아이보리 옷·붉은 허리 천·청록 목걸이·부츠. 무기를 들지 않는 닫힌 주먹, 빈 칼집. 셀마다 전신을 넣고 투명 여백으로 경계를 지킨다. |
| `art-source/webtoon/captain-webtoon.webp` | 1024×1536. 친근한 중년 선장, 회색 수염·콧수염, 남색 금테 코트, 삼각모, 손에 든 망원경. 신밧드와 구별되는 얼굴·실루엣. S01/S03 전신과 `captain`/`storm` 대화 초상. |
| `art-source/webtoon/sailor-webtoon.webp` | 1024×1536. 친근한 성인 선원, 아이보리·남색 줄무늬 셔츠, 청록 두건, 양손의 밧줄 꾸러미, 부츠. S04 전신과 `whale` 대화 초상. |

선택한 원본 PNG: 액션 `exec-e8b885b0-b323-45bf-acd5-ff7e4eb6f572.png`, 선장 `exec-62cf1992-3f52-4090-a928-407518833714.png`, 선원 `exec-8485e165-8cee-463d-aaa7-7a5ff89b3f2e.png`. 내장 생성 도구의 원본 보관소와 `art-source/webtoon/generated/`에 모든 8개 생성 결과를 보존했다. 초기 액션 후보 5개는 경계·여백·크기 문제로 선택하지 않았고, 셀 경계를 넘는 결과는 다시 생성했다. 생성 이미지에 글자는 없었다.

선택한 액션 PNG는 도구가 **1254×1254**(418px 셀)로 반환했다. `hero-action.png`도 이 크기로 그대로 보존했다. `scripts/encode-webtoon.py`에서 시트 전체를 1536×1536으로 Lanczos 정규화한 뒤 무손실 WebP로 저장했다. 셀을 자르거나 다시 칠하지 않았고, 두 NPC는 원래 1024×1536 그대로 무손실 인코딩했다. 인코딩 입력과 디코딩 WebP의 보이는 RGBA·알파 동일성을 검사했다. 런타임은 `optimize-webtoon.py`로 액션 768×768(셀 256px), NPC 각각 512×768로 생성했다.

`hero-action.json`은 정규화된 **512px 셀 좌표**다. 발 기준선은 `[492,492,414,459,499,490,462,465,474]`, 손은 각 셀의 무기를 장착할 주먹 중심을 육안 측정했다. 최적화 스크립트가 `src/content/hero-action.generated.json`에 원본 좌표를 그대로 복사한다. 원화 폴더를 업로드에서 제외해도 이 생성본은 앱에 포함되며 감사에서 두 JSON의 동일성을 검사한다. 진단용 64px 격자 이미지는 `docs/screenshots/art-a1-a2-measurement.png`이며 게임 원화에 격자나 글자를 넣지 않았다. 감사 스크립트는 눈에 보이는 알파(>16)의 셀 경계와 손 좌표의 실제 픽셀을 검사한다. 최종 애니메이션·실기기 승인 전이므로 ART_DRAFT를 유지한다.

> 2026-10-03: 아래 무손실 원본은 `art-source/webtoon/`으로 옮겼다. 게임이 받는 파일은 `scripts/optimize-webtoon.py`가 만든 축소 손실 WebP(`public/assets/webtoon/`)다. 다음 원화 요청은 `docs/CODEX_ART_TASKS.md`를 따른다.

제작: 2026-10-01~02, OpenAI 내장 imagegen. 생성 후 실제 PNG 원본을 저장소로 복사했다. 외부 작품·작가·기존 게임 이미지는 참조하지 않았다. 아래는 생성 지시의 핵심 내용이며 실제 사용 파일은 assets.manifest.ts에 등록되어 있다. 최종 아트 승인과 실기기 검수 전이므로 ART_DRAFT다.

공통 방향: 오리지널 2D 웹툰 모험 게임, 선명한 외곽선과 셀 음영, 따뜻한 청록·금색 팔레트, 읽기 쉬운 실루엣. 배경은 가로 1536×1024, UI 글자·로고·플레이어를 넣지 않고 하단 플레이 영역을 비운다. 캐릭터는 세로 1024×1536, 투명 배경의 전신. 피·절단·상처 표현 없음. 생성 원본 PNG는 imagegen 원본 보관소에 유지하고, 저장소에는 보이는 RGBA의 동일성을 검사한 무손실 WebP를 넣었다. 아래 .png는 생성 원본명이며 실제 런타임 파일의 확장자는 .webp다.

| 파일 (public/assets/webtoon/) | 제작 지시·실제 용도 |
|---|---|
| chapter-1.png | 항구·배·암초와 폭풍의 바다, 항해를 시작하는 아라비아풍 도시. 1장 S01~S05 |
| chapter-2.png | 불꽃 동굴·보라 수정 동굴·거대한 새의 둥지가 이어지는 환상 섬. 2장 S06~S10 |
| chapter-3.png | 보석 협곡·열대숲·따뜻한 마을·창고와 부엌의 항해 풍경. 3장 S11~S15 |
| chapter-4.png | 수면의 해적선, 수중 진주 궁전, 보랏빛 검은 탑을 함께 담은 바다. 4장 S16~S19 |
| chapter-5.png | 깊은 정글, 돌기둥, 저주를 푸는 문양과 달빛 다리. 5장 S20~S25 |
| chapter-6.png | 별빛 동굴, 인도풍 항구·연꽃 정원·평화로운 신전, 코끼리가 있는 강변. 6장 S26~S29 |
| chapter-7.png | 보랏빛 탑에서 햇빛 밝은 왕국·축제·도서관으로 이어지는 귀환 풍경. 7장 S30~S36 |
| hero-webtoon.png | 성인 항해사 신밧드. 청록 조끼·붉은 허리띠·흰 바지·부츠·터번과 칼집. 주인공과 제목/엔딩 초상 |
| ariana-webtoon.png | 성인 지도 제작자 아리아나. 남색과 청록 망토·지도 가방·별 장식. 구조 후 동행·귀환 비행·엔딩 |
| kuura-webtoon.png | 그림자 마법사 쿠우라. 보랏빛 망토와 마법 빛, 무섭지만 잔혹하지 않은 적. S19 분신과 S31 최종전 |

추가 인물: 나이라(진주·청록 꼬리·공기방울), 미라(사프란/청록 의상·과일·추천서), 바루(한 뿔·방울·달 지팡이), 왕(남색/금색 왕복·편지), 하미드(목재·작업복), 지니 하질(청록 빛·수정구슬). 모두 신밧드 원화를 화풍 참조로 사용하고 기존 작품을 참조하지 않았다. `naira-webtoon`, `mira-webtoon`, `baru-webtoon`, `king-webtoon`, `villager-webtoon`, `genie-webtoon`의 실제 .webp 파일에 해당한다.

로크새는 청록·아이보리 깃털과 가죽 안장, 아기 코끼리는 푸른 회색 피부·큰 귀와 다친 곳 없는 표정으로 별도 제작했다. `roc-webtoon.webp`는 1536×1024, `elephant-webtoon.webp`는 1024×1024다.

`whale-webtoon.webp`(1536×1024)는 오른쪽을 향한 친근한 푸른 회색 거대 고래로, S04의 섬처럼 보이는 등 아래에 배치했다. `chef-webtoon.webp`(1024×1536)는 크림색 요리사 모자·청록 조끼·나무 국자를 든 코믹한 거인으로, S15 부엌에 표시한다. 고래 원본은 `exec-20918f27-6855-4e08-8e6c-b0f17bd572e7.png`, 거인 원본은 `exec-73fb8578-01b6-4f7f-a4f6-1df43503b939.png`이며 imagegen 원본 보관소에 남아 있다. 두 원본 모두 무손실 변환 후 보이는 RGBA 동일성을 검사했다.

주인공 24프레임 시험 생성은 셀 경계를 넘어가는 포즈가 있어 게임 자산에서 제외했다. `hero-run.webp`는 1536×1024, 3열×2행의 512×512 프레임 6개다. 오른쪽 달리기 접지/하강/통과를 반복하며 프레임별 발 기준 y=498,498,498,474,469,470을 맞춰 실제 적용했다. 명세 전체 공격·피격·표정 프레임을 완료했다고 주장하지 않는다.

`enemy-atlas.webp`는 같은 3×2 그리드에 뱀·호랑이·돌 거인·독 용·해적 선장·마법 해골을 배치했다. 프레임 0~5, 전투 판정과 별개인 표시 크기를 사용한다. 후속 공격 포즈·시트 경계와 프레임 정렬의 최종 검수는 남아 있다.

`public/assets/story/*.svg` 18개는 `scripts/make-story-art.mjs`로 직접 작성했다. 운반 상자·방향 장치·정화 등불·보물 제단·코끼리·뱀·호랑이·용·돌 거인·마을 주민·미라·왕·바루·카딘·연꽃 신전·화살·부메랑·금 간 달빛 바위의 고유 실루엣을 사용한다. 입자·정화 고리·방패·달빛 다리·공격 호는 Phaser Graphics와 트윈으로 직접 그린다. 음악/효과음은 Web Audio 합성이다.

AI 생성 원본은 본 프로젝트를 위해 만든 자산이다. 서비스 약관과 관할권에 따른 권리 차이는 별도 출시 검토 대상이며, 이 기록은 타 작품의 라이선스를 부여한다는 뜻이 아니다. 런타임에서 AI 서비스를 호출하지 않는다.

초반 인물 추가(2026-10-02): `siren-webtoon.webp`는 청록/남색 옷과 금빛 하프를 든 성인 세이렌, `rah-webtoon.webp`는 호박빛 갑옷·붉은 망토·불씨 등불을 든 창작 불꽃 수호자, `crab-webtoon.webp`는 둥근 집게와 저주 표식이 있는 붉은 암초 게다. 신밧드 원화의 화풍을 참조한 내장 imagegen 생성이며, 실제 크기는 각각 1024×1536, 1024×1536, 1280×1280이다. 원본은 `exec-40b1ed89-b5ab-434b-af3d-68b09787be36.png`, `exec-b0863fa2-ce51-47de-bd6f-479abb1e12db.png`, `exec-47ef5d8c-f903-4a66-aabf-6cc01f9ae9be.png`이고 원본을 삭제하지 않았다. 프레임·투명 영역을 육안 확인했고 무손실 WebP 변환 뒤 보이는 RGBA 동일성을 검사했다.

## A7 · 2026-10-04 · 투사체·효과7종 / 34프레임 · ART_DRAFT

OpenAI **내장 imagegen**으로 개별 시트7개를 생성했다. 프로젝트 자체 `hero-webtoon.webp`는 화풍 참조로만 사용했다. 선명한 외곽선·셀 음영·왼쪽 위 빛·청록/금색/보라 팔레트, 실제 투명 RGBA, 글자/레이블/로고/격자/서명/피/상처 없음, 완전한 셀과 투명 여백이 공통 지시다. 음표는 문자 출력이 아닌 그림 소품이다. 외부 작품·작가를 참조하지 않았다.

| 원본 파일 (`art-source/webtoon/`) | 핵심 생성 지시 | 원본 → 런타임 |
|---|---|---|
| `projectile-siren-wave.webp` | 오른쪽으로 열린 청록 음파 곡선과 진주 중심. 네 단계 잔물결 반복. | 1024×1024 / 2×2 →128×128 / 셀64 |
| `projectile-siren-note.webp` | 보라색 8분음표 모양 소품과 금빛 반짝임. 네 단계 빛 띠 반복; 글자 레이블 없음. | 1024×1024 / 2×2 →128×128 / 셀64 |
| `projectile-kite-wind.webp` | 오른쪽으로 날아가는 민트 소용돌이·왼쪽 짧은 바람 꼬리. 네 단계 회전 반복. | 1024×1024 / 2×2 →128×128 / 셀64 |
| `projectile-kuura-orb.webp` | 보라 수정 마법구·라벤더 궤도 띠. 네 단계 맥동 반복, 공포/종교 표식 없음. | 1024×1024 / 2×2 →128×128 / 셀64 |
| `effect-hit-spark.webp` | 작은 별빛→확장→금색/아이보리 타격 불꽃→흩어짐→작은 반짝임→소멸의6단계. 피/상처 없음. | 1536×1024 / 3×2 →384×256 / 셀128 |
| `effect-purify-light.webp` | 진주 빛→민트 리본→열린 정화 고리→별빛 분산→상승/소멸의6단계. 동물과 마법 적의 평화로운 전환. | 1536×1024 / 3×2 →384×256 / 셀128 |
| `effect-surrender-flag.webp` | 접힌 흰 깃발→펼침→금빛 반짝임→잔잔한 천→희미해짐의6단계. 문양 없는 깃발과 짧은 나무 기둥, 사람/무기 없음. | 1536×1024 / 3×2 →384×256 / 셀128 |

전체 실제 프롬프트·도구 원본 경로·선택 목록·크기/SHA256은 `art-source/webtoon/effects.sources.json`이다. 생성 PNG7개는 `art-source/webtoon/generated/effects/{key}-01.png`에 도구 원본과 바이트 동일 보존했다. 투사체 생성 크기는1254×1254(627px 셀), 효과는1536×1024(512px 셀)다. 선택7개이며 모두 가시 알파>16의 셀 경계가 비었다. 반려/재생성은 없었다.

`scripts/pack-effects.py`는 **완전한 정사각 셀 전체**를 균일하게480×480으로 축소해512px 셀에16px 투명 여백으로 배열하고, PNG와 동일 RGBA 무손실 WebP를 만든다. 그림을 덧칠하거나 실루엣을 잘라내지 않고 생성 알파를 보존한다. 측정 JSON의 `bounds.source`는 내부480px의 좌표이며512px 셀 좌표는 각각+16px이다. `optimize-webtoon.py`가 등록된 SIZES로 런타임을 만들며 총93,582바이트다.

`stage.ts`의 Sprite 애니메이션은 정지 가능한 게임 시계로4프레임을100ms씩 반복하고, 타격6프레임은180ms, 정화/항복6프레임은650ms에 끝난다. 연출 줄이기는 투사체를0셀에 고정하고 새 타격/정화/항복 효과를 생략한다. 판정·피해·발사 속도·패턴·4초 수명·보상/저장 ID는 유지한다. 파일 누락 시 기존 원/문자/별/빛 입자로 복구하며 현재 맵에 필요한 투사체만 로드한다. 궁수의 기존 음표 모양도 새 음표 시트로 표시하며 플레이어 화살/부메랑과 보물 파동은 이번 A7에서 교체하지 않았다. 실제 검증과 미검증은 PROJECT_STATUS.md에 별도 기록한다.

최종 검증: 단위 101개·전체 E2E 44개 통과, 새 게임 36스테이지 완주와 무기/보물 각 7종·엔딩·저장 재개 확인. 실행 전후 실제 684파일의 해시가 동일하다. `docs/validation/a7-checks.json`, `a7-e2e-full.json`, `a7-final-screenshots.json`에 실제 결과와 캡처 36장의 경로·해시를 기록했다. 첫 중단 실행의 실패도 보존했으며 실기기·iOS·사용자 최종 아트 승인은 미검증이다. ART_DRAFT 유지, 배포 없음.
# 2026-10-04 · M6 공중 연 네 행동 · ART_DRAFT

실제 검증: 정적8명령·단위109개·새 연4검사 통과, 새 게임36스테이지833초 완주(7무기/7보물/엔딩/오류[]). 전체 E2E는60통과/1기록 쓰기 실패이며, 무기 검사의 마지막 기존JSON `UNKNOWN open`을 증거 폴더 저장으로 수정한 뒤 해당2검사 통과했다. 전체61개가 한 실행에서 모두 통과했다고 기록하지 않는다. 주요69화면 및 재검사42화면, 두 실행 각각944파일 해시 동일·실행 사이 게임/빌드/자산 동일은 PROJECT_STATUS/`m6-kite-postcheck.json`에 기록했다. 실기기와 최종 사용자 아트 승인 미검증, ART_DRAFT, 배포 없음.

내장 **OpenAI imagegen**으로 `hero-webtoon.webp`의 선과 부드러운 셀 음영을 참조하고, 자체 `public/assets/draft/kite.svg`의 주황/연어색 마름모 돛·금색 살대·표정·청록색 꼬리 리본 디자인을 유지했다. 참조 이미지는 화풍 전용이며 특정 작품/작가/외부 이미지·문구를 참조하지 않았다. 대기→공격 예고→오른쪽 바람탄 공격→온전한 연이 웃으며 빛으로 풀리는 순서다. 사람/동물·무기·상처·글자·워터마크 없이 투명2×2와 빈 셀 경계를 요구했다.

전체 실제 프롬프트는 `art-source/webtoon/generated/kite-m6/kite-actions-01-rejected.json`, `kite-actions-02.json`에 저장했다. 첫 후보의 공격 바람이1254px 원본의 세로 중앙 경계를 넘어 반려했다. 두 번째 프롬프트는 모든 꼬리/바람까지 셀 중앙60% 안에 넣고20% 투명 여백을 요구했다. 선택2번은1254×1254이며 바깥/중앙 가시 알파>16 경계가 모두 비고 글자가 없다. 두 후보 PNG는 도구 생성 경로와 `generated/kite-m6/`에 삭제 없이 바이트 동일 보존했다. 검사·측정·시각 확인은 최종 사용자 아트 승인과 구별한다.

`scripts/pack-kite-actions.py`가 **완전한627px 셀 전체**를512px로 균일 축소해4×1으로 재배열한다. 덧칠·실루엣 크롭 없이2048×512 PNG와 동일 RGBA 무손실 WebP를 저장했다. `kite-actions.json`은 실제 가시 경계/baseline과 수동 측정한 살대 중심+비행 타깃 오프셋을 담으며,512px 셀 기준 중심은 **(286,291), (262,319), (321,253), (255,236)**이다. 이 JSON을 게임에 복사하고 좌우 반전 시 X원점을 보정하여 기존 비행 타깃 위치를 유지한다. 정지 자세의 전체 가시 높이를128월드px로 맞춘다. 별도 `kite-actions` 시트는 S10/S33에서만 로드한다. 런타임1024×256/4셀256px, **33,784바이트**. 파일 누락 시 원래SVG를 쓴다. AI·바람탄 속도/타이밍·날개 공격·안정 보상 ID·일시정지·연출 줄이기는 기존 규칙을 유지하며 **ART_DRAFT**다.
