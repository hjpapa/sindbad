# 자산 등록 · ART_DRAFT

## 2026-10-08 · S09 기능 연결 갱신 · ART_DRAFT

기존 `roc-actions` 6셀과 `hero-action`을 재사용했다. 이번 작업은 새 이미지 생성/프롬프트 실행/원본 수정 없이 S09 목걸이 핵3회·3공격 패턴과 T03 점프 유지 활공을 연결한 것이다. 핵 표시와 공격 예고는 런타임 도형이며, 전용 활공 자세와 로크새 보석 색 연속성은 최종 아트 검수 대상으로 남는다. 실제 소스·런타임 자산638개 SHA 보존 확인 및 검사 결과는 `PROJECT_STATUS.md`의 2026-10-08기록을 따른다.


## M6 로크새 행동6프레임 · 2026-10-07 · ART_DRAFT

검수 항목: 비행 공격도 보스 셀2를 공용해 목 보석이 보라색이다. 평온한 비행의 청록 보석과 색 연속성은 최종 아트 보완 대상이다.

OpenAI 내장 imagegen. 자체 `hero-webtoon.webp`의 외곽선·셀 음영·청록/금색·왼쪽 위 조명과 `roc-webtoon.webp`의 청록/아이보리 깃털·금색 끝·갈색 안장만 참조했다. 오른쪽을 보는 대기·날개를 올리고 웅크린 예고·앞/아래로 날개를 휘두르는 공격·목 보석이 청록색으로 맑아진 평온한 저주 해제·비행 날개 위·비행 날개 아래의 3×2 시트다. 탑승자·무기·글자·로고·격자·피·상처·외부 작품/작가 참조 없음. 전체 지시는 `art-source/webtoon/generated/roc-m6/roc-actions-01.json`, 도구 원본은 동명 PNG에 보존했다.

실제 네이티브1536×1024 RGBA/512px6셀. alpha>16의 외곽/중앙 경계는 비어 있으며 글자·셀 침범 없음 육안 확인. 날개 끝이 경계에 가까운 셀의 여백을 확보하기 위해 `scripts/pack-roc-actions.py`가 전체512셀을448로 균일 축소하고32px 안쪽에 배치한다. 실루엣 자르기·덧칠·원본 삭제 없음.1536×1024 PNG와 동일 RGBA 무손실 WebP **928,470B**. 최적화 스크립트와 두 크기 등록으로768×512/256px6셀 런타임 WebP **103,480B**.

512px 기준 발/발톱 baseline439/439/343/411/385/299, 몸통 중심(325,312)/(330,360)/(294,321)/(330,286)/(325,303)/(325,286), 안장(294,245)/(277,298)/(224,240)/(294,213)/(300,268)/(258,203). 예고·날개 위 자세의 안장 중심은 날개에 가려져 보이는 안장 테두리로 투영한 좌표이며, 완전히 노출된 좌석 실측과 구별한다. 대기 가시 높이322·날개 위 기준 폭400. JSON을 게임 JSON으로 바이트 동일 복사한다. 비행 중 발 baseline은 날개/꼬리 최하단과 구별한다.

S09 보스는 기존 타깃 위치/HP·논리 폭220·대기 가시 높이145·발 오프셋50.75 유지. 공격 자세는 접힌 발을 바닥에 고정하면 날개가 지형 아래로 들어가므로 몸통 중심과 대기 기준선의 차이로 원점을 맞춘다. 실제 상태 대기/예고/공격/회복/해제에0/1/2/0/3을 사용하며 동물의 평온한 해제900ms 후 기존520ms 소멸(연출 줄이기는 소멸0ms)이다. 보상 지급 시점은 그대로다. 누락은 보존 `roc-webtoon.webp`로 복구한다.

S10·S33은4/5를160ms 간격으로 고르고 연출 줄이기는4로 고정한다. 기존 날개 공격0~280ms에는2. 공격 피해22/활성80~200ms/재사용420ms·플레이어 물리42×84·입력·적/보상/저장 ID는 그대로다. 표시 크기307.2 정사각에서 JSON 안장 좌표를 주인공의 기존 발 위치(x±36,y+10)에 맞추고 왼쪽 원점을 반전하여 프레임별로 탑승자가 안장에서 벗어나지 않는다. S33 동승자(x±3,y+10) 유지. 기존 정적 원화/NPC를 삭제하지 않고 사용하며 비행 종료 시 시트 캐시 해제.

**S09 설계의 저주 핵3회 피격과 고유 공격3패턴은 아직 미구현**이다. 현재는 순차 채널 봉인3개·일반 HP보스·모두 완료 후 T03 선물이다. T03 설명의 별도 지상 활공도 실제 로직이 없어 미구현이며 이단 점프/지정 비행과 구별한다. 이번 작업은 행동 아트 연결이며 설계서 전체 보스 구현 완료로 취급하지 않는다. S26 박쥐5마리/S32 저주 구체4개/박쥐 제한 비행 경로·실기기·최종 사용자 아트 승인도 별도 미완료. 실제 검사 결과는 PROJECT_STATUS.md에 기록하며 ART_DRAFT 유지.

| 실제 경로 | 규격/역할 | 출처·이용 조건 |
|---|---|---|
| `art-source/webtoon/roc-actions.png`, `.webp` | 1536×1024 원화, 동일 RGBA 무손실 WebP | 내장 imagegen, 자체 프로젝트 디자인. 프로젝트 사용/수정 가능. ART_DRAFT. |
| `public/assets/webtoon/roc-actions.webp` | 768×512 런타임 시트 | 최적화 스크립트 생성, 위와 동일 조건. |
| `art-source/webtoon/roc-actions.json` → `src/content/roc-actions.generated.json` | 발/몸통/안장 좌표, 게임 JSON 동일 복사 | 투영 좌석2개 명시. ART_DRAFT, 최종 승인 전. |
| `art-source/webtoon/generated/roc-m6/roc-actions-01.png`, 동명 `.json` | 네이티브1536×1024와 전체 생성 기록/SHA | 도구 원본 보존, 자체 hero/roc만 참조. |
| 기존 `art-source/webtoon/roc-webtoon.webp`, `public/assets/webtoon/roc-webtoon.webp` | 시트 누락 복구와 NPC 원화 | 기존 원본/출처/조건 보존. |

## M6 정령 행동4프레임 · 2026-10-06 · ART_DRAFT

최종 실제 검증: 정적8명령·단위115개·정령4조건 통과. 전체73개 E2E(69.7분)는69통과·4실패, 테스트2파일 보완 후 관련5개 재검사통과. 전체73개 단일재실행은 하지 않음. 실제 주요141화면/SHA는 `docs/validation/m6-spirit-final-screenshots.json`, 보완34화면/상세는 `m6-spirit-regression-repair-summary.json`, 상세범위/실패/미검증은 `PROJECT_STATUS.md`. 기능검증과 최종아트승인은 별도이며 ART_DRAFT 유지.

OpenAI **내장 imagegen** 사용. 자체 `hero-webtoon.webp`는 선명한 외곽선·셀 음영·청록/금색·왼쪽 위 조명만 참조했다. `public/assets/draft/spirit.svg`의 청록 물방울/불꽃 몸과 금색 에너지 코어를 글로 설명했다. 오른쪽을 보는 작은 정령의 대기·몸을 뒤로 접고 옆 불꽃을 올리는 예고·앞으로 손을 내미는 접촉 공격·감은 눈과 빛/연기로 돌아가는 마무리4셀이다. 인간 유령/신격이 아닌 자체 원소 생명체이며 무기·상처·피·글자·로고·격자는 넣지 않았다. 외부 작품/작가 참조 없음.

후보1번의 공격 금색 효과가 중앙 세로 경계 x626/627을 넘어 반려했다. 원본 PNG와 전체 프롬프트/도구 경로/SHA JSON을 삭제 없이 보존했다. 효과를 없애고 전체 그림을 작게 넣도록 수정한 후보2번은1254×1254 RGBA/2×2/627px 셀이다. alpha>16 외곽·중앙 경계가 모두 비었으며 글자 없음/안전한 마무리를 육안 확인했다. `art-source/webtoon/generated/spirit-m6/spirit-actions-{01,02}.png`, 동명 JSON이 실제 네이티브와 생성 지시다.

`scripts/pack-spirit-actions.py`로 각 전체627px 셀만512px로 균일 축소·4×1 재배열했다.2048×512 PNG + 동일 RGBA 무손실 WebP **259,304B**. SIZES/runtimeSize 등록과 최적화로1024×256/256px4셀 WebP **34,476B**. 실루엣 자르기/덧칠 없음.

512px 실측 baseline453/441/375/392, 불투명 몸 중심(314,355)/(265,334)/(301,288)/(268,284), 대기 가시 높이313. `spirit-actions.json`을 게임 JSON으로 바이트 동일 복사한다. 좌우 원점도 반전해 기존 논리 타깃에 중심을 맞춘다. 대기 가시 높이약116px(원래SVG y9..120+3.5px 외곽선), 타깃96×128·바닥 경고 오프셋64·위치/HP/AI/보상 ID 유지. 떠 있는 정령의 꼬리를 바닥에 강제 고정하지 않는다. S06의 기존 0xffaa65 색조와 예고 색조도 유지한다.

실제 S03 3·S06 5·S07 4·S32 3=15마리 연결. 마무리 프레임3은 마법 적의 빛/연기이며 기존300ms 유지 뒤520ms 소멸을 쓴다(연출 줄이기는 소멸0ms). S06 완료 적의 재등장 생략, 다른 맵의 재등장/중복 보상 방지, 기존 정령 SVG 누락 복구 유지. **S32 설계는 잔여 저주 구체4개이나 현재 구현3마리**라 콘텐츠 불일치를 별도 미완료로 남긴다. S26박쥐5마리/박쥐 제한 비행 경로도 미구현. 최종 검사/실패/화면/미검증은 PROJECT_STATUS.md에 실제 결과로 기록하며 ART_DRAFT 유지.

| 실제 경로 | 규격/역할 | 출처·이용 조건 |
|---|---|---|
| `art-source/webtoon/spirit-actions.png`, `.webp` | 2048×512 무손실 원화 | 프로젝트 자체 디자인, 내장 imagegen. 프로젝트 사용/수정 가능, 최종 아트 승인 전 ART_DRAFT. |
| `public/assets/webtoon/spirit-actions.webp` | 1024×256 런타임 시트 | optimize-webtoon.py로 생성, 위 원화와 동일 이용 조건. |
| `art-source/webtoon/spirit-actions.json` → `src/content/spirit-actions.generated.json` | 실측 메타데이터 동일 복사 | 바이트 동일. 안정 타깃/보상/저장 유지. |
| `art-source/webtoon/generated/spirit-m6/spirit-actions-{01,02}.png`, 동명 `.json` | 반려1/선택2의 네이티브1254×1254와 전체 생성 기록 | 도구 원본 보존, 동일 프로젝트 생성 조건. |
| `public/assets/draft/spirit.svg` | 기존 누락 복구 | 자체 SVG 원본 바이트 동일 보존, 기존 조건 유지. |

## M6 박쥐 행동 시트 · 2026-10-06 · ART_DRAFT

전체69검사 뒤 박쥐 자산의 출처 날짜만 실제 생성일로 분리하고 타입/린트/단위113개/콘텐츠·빌드/용량을 재검사했다. 현재 코드와 전체 실행 사이의 정확한 차이는 `docs/validation/m6-bat-provenance-postcheck.json`이며 이후 전체E2E 재실행은 하지 않았다.

실제 최종 검사: 정적8명령·단위113개·박쥐4조건·전체69개 E2E(53.3분) 통과, 새 게임36구간815초/7무기·보물/엔딩/오류[]. 주요45화면·실행 전후970파일 동일·기존 미디어566개 보존. 실제 로그/초기 테스트 실패·보완/남은 콘텐츠/미검증은 PROJECT_STATUS와 `docs/validation/m6-bat-postcheck.json`에 기록했다. 기능 통과와 최종 사용자 아트 승인을 구별한다.

| 실제 키 / 경로 | 규격 / 역할 | 출처·조건 |
|---|---|---|
| `bat-actions` · `art-source/webtoon/bat-actions.png`, `.webp` | 2048×512/4셀512px, 동일 RGBA 무손실 WebP264,444B | 자체 박쥐 디자인·신밧드 화풍 참조, OpenAI 내장 imagegen. 프로젝트 사용·수정용 생성 자산, 외부 작품/작가 참조 없음. 최종 승인 전 ART_DRAFT. |
| `public/assets/webtoon/bat-actions.webp` | 1024×256/4셀256px, 31,056B | SIZES/runtimeSize 등록→`optimize-webtoon.py`. 실제 S08 박쥐4마리만 사용. |
| `art-source/webtoon/bat-actions.json` → `src/content/bat-actions.generated.json` | baseline429/448/365/363, 불투명 몸통 중심(327,384)/(280,412)/(347,280)/(272,288) | 원본 메타데이터 바이트 동일 복사. 대기 높이233→가시84px, 기존타깃96×128·경고오프셋64 유지. |
| `art-source/webtoon/generated/bat-m6/bat-actions-01.png`, `.json` | 선택 네이티브1254×1254/2×2, 전체 실제 프롬프트·도구 경로·SHA | 도구 원본 바이트 동일 보존. 전체 셀 균일 축소·재배열만 수행. 글자/셀 넘침 없음, 원본 삭제 없음. |
| `public/assets/draft/bat.svg` | 기존 자체 디자인/누락 복구 | 바이트 동일 보존. 기존 SVG 이용 조건 유지. |

`scripts/audit-bat-actions.py`가 네이티브SHA·동일 RGBA·runtime 규격·투명 경계·기준선/몸통 중심을 검사한다. 별도 시트 연결은 기존 고정 높이 수평 접근·접촉 피해·저주 해제·안정 ID·한 번 보상·저장·퍼즐 안전 구역을 유지한다. S26의 설계상 박쥐5마리는 현재 코드에 없으며 이번 연결 범위가 아니다. 기능 검증과 최종 아트 승인을 구별한다. 실제 명령 결과·화면·실패/미검증은 `PROJECT_STATUS.md` 및 `docs/validation/m6-bat-*.json`에 기록한다.

## M6 세이렌 행동 시트 · 2026-10-04 · ART_DRAFT

실제 검사: 정적8명령·단위111개·세이렌4검사 통과. 전체64통과·1실패(S07파도 목표 대기 시간 초과) 뒤 검사 이동/실제 E 입력만 보완해 해당1개 통과했다. 단일 전체65통과로 취급하지 않는다. 저장 주입 없는 새 게임36구간818초/무기·보물7종/엔딩/오류[] 확인. 전체·보완958파일 각각 동일, 사이 차이는 파도 검사 하나이며 게임/런타임/빌드는 동일하다. 주요45장+보완3장·기존 미디어561개·네이티브2장·백업308개 보존은 `m6-siren-postcheck.json`과 `PROJECT_STATUS.md`에 있다.

| 실제 키 / 파일 | 규격 / 역할 | 출처·조건 |
|---|---|---|
| `siren-actions` · `art-source/webtoon/siren-actions.png`, `.webp` | 2048×512/4셀512px, 동일 RGBA 무손실 WebP441,120B | 프로젝트 자체 세이렌 인물·신밧드 화풍 참조, OpenAI 내장 imagegen. 프로젝트 사용·수정용 생성 자산, 외부 작품/작가 참조 없음. 최종 승인 전 ART_DRAFT. |
| `public/assets/webtoon/siren-actions.webp` | 1024×256/4셀256px,49,312B | `optimize-webtoon.py` SIZES·manifest runtimeSize에서 생성. S02 세이렌 보스만 사용. |
| `art-source/webtoon/siren-actions.json` → `src/content/siren-actions.generated.json` | 가시 경계·baseline461/461/448/450·대기 높이312 | 원본 메타데이터를 바이트 동일 복사. 기존 타깃 좌표3770/552·몸128px·바닥 오프셋58·ID·AI·보상은 유지. |
| `art-source/webtoon/generated/siren-m6/siren-actions-02.png`, `.json` | 선택 네이티브1254×1254/2×2, 전체 실제 프롬프트·도구 경로 | 도구 원본을 바이트 동일 보존, 중앙/외곽 경계 비어 있음. 전체 셀 균일 축소·재배열만 수행. |
| `art-source/webtoon/generated/siren-m6/siren-actions-01.png`, `.json` | 반려 네이티브1254×1254, 프롬프트·이유 | 공격 파동이 셀 경계를 넘음. 사용하지 않고 원본 보존. |
| `art-source/webtoon/siren-webtoon.webp`, `public/assets/webtoon/siren-webtoon.webp` | 기존 인물 원화·런타임 | 누락 복구 및 기존 NPC/대화용. 바이트 동일 보존. 기존 표정 시트·10행 적 행동 시트도 유지. |

`scripts/audit-siren-actions.py`가 네이티브SHA·무손실 RGBA·런타임 규격·투명 경계·실측 기준선 계약을 검사한다. 새 시트 연결은 조개 종3개의 방벽·두 음파 패턴·저주 해제·안정 보상/저장 ID를 유지한다. 실제 검사/화면 경로는 `PROJECT_STATUS.md`와 `docs/validation/m6-siren-*.json`에 기록한다. 기능 검증과 최종 아트 승인을 구별한다.

## M6 공중 연 행동 시트 · 2026-10-04 · ART_DRAFT

실제 결과: 정적8명령·단위109개·연4검사 통과, 새 게임36스테이지833초/무기·보물7종/엔딩/오류[]. 전체 E2E60통과·1기록 쓰기 실패 → 결과 저장 경로 수정 후 무기2검사 통과(별도 실행). 기존미디어556파일과 보존281파일 확인, 두 실행의944파일 각각 동일이며 사이 차이는 무기 테스트의 결과 경로뿐이다. 최종69화면+보완42화면과 실제 로그·미검증은 `PROJECT_STATUS.md`, `docs/validation/m6-kite-postcheck.json`에 기록했다. 전체61개의 단일 실행 통과·실기기 승인으로 취급하지 않는다.

| 키 / 경로 | 원화 / 런타임 | 사용 / 출처 / 조건 |
|---|---|---|
| `kite-actions` · `art-source/webtoon/kite-actions.png`, `.webp` · `public/assets/webtoon/kite-actions.webp` | 2048×512/4셀512px PNG + 동일 RGBA 무손실 WebP(249,586B) →1024×256/4셀256px WebP(33,784B) | S10 공중 해적 연6/S33 그림자 연5. 프로젝트 `hero-webtoon.webp` 화풍·보존 자체 `draft/kite.svg` 디자인·내장 imagegen. 프로젝트용 원본, 특정 작품/작가·외부 이미지 참조 없음. 최종 아트/실기기 승인 전 ART_DRAFT. |
| `art-source/webtoon/kite-actions.json` → `src/content/kite-actions.generated.json` | 순서 대기/예고/공격/빛으로 정화. 셀 가시 경계/baseline/중심 `(286,291),(262,319),(321,253),(255,236)` | 실측 중심을 좌우 원점에 사용. 비행 타깃/기존96×128몸 기준·ID·AI·바람탄/날개 공격·보상은 유지. |
| `art-source/webtoon/generated/kite-m6/kite-actions-02.png`, `.json` | 선택 네이티브1254×1254/2×2/627px 셀. 원본 PNG + 전체 실제 프롬프트 | 도구 원본과 바이트 동일 보존. 전체 셀 균일 축소·4×1 재배열만 수행. 가시 알파>16의 외곽/중앙 경계 비어 있음. |
| `art-source/webtoon/generated/kite-m6/kite-actions-01-rejected.png`, `.json` | 반려 네이티브1254×1254 + 실제 프롬프트/이유 | 공격 바람이 세로 중앙 셀 경계를 넘어 사용하지 않음. 원본 삭제 없음. |
| `public/assets/draft/kite.svg` | 기존 자체SVG96×128, 바이트 동일 보존 | 새 시트 누락 시 복구. SVG 및 기존10행 `enemy-actions` 시트/측정은 변경 없음. |

`scripts/pack-kite-actions.py`는 덧칠/실루엣 크롭 없이 전체 셀을 재배열·무손실 인코딩하며, `optimize-webtoon.py`의 SIZES와 manifest runtimeSize가 런타임을 만든다. `scripts/audit-kite-actions.py`가 네이티브SHA256·동일 RGBA·소스/런타임 경계·메타데이터/중심을 검사한다. 새 시트는 비행2맵에서만 로드하고 S01에서 해제한다. JSON은 원본에서 게임 빌드로 바이트 동일 복사된다. 이번 파일을 추가한 전체 웹툰은 **원화85 + 런타임85 =170파일**이며 최종 아트 상태는 모두 ART_DRAFT다. 전체 실제 검사 결과/스크린샷은 PROJECT_STATUS 및 `docs/validation/m6-kite-*.json`에 기록한다.

## M6 비행 소품 3종 · 2026-10-04 · ART_DRAFT

출처: OpenAI **내장 imagegen**, 프로젝트 자체 `hero-webtoon.webp` 화풍 참조만 사용. 외부 작품·작가 참조 없음. 본 프로젝트 사용·수정용 생성 자산. 최종 사용자 아트 승인 전 **ART_DRAFT**다. 기존 SVG와 생성 네이티브 PNG를 삭제하지 않았다.

| 새 키 | 보존 SVG | 적용 | 런타임 바이트 |
|---|---|---|---:|
| prop-flight-ring | public/assets/draft/flightRing.svg | S10 고리3개·S33 고리5개 | 8,458 |
| prop-gust-cloud | public/assets/draft/stormCloud.svg | S10 돌풍3개 | 4,912 |
| prop-falling-debris | public/assets/draft/debris.svg | S33 낙하 파편5개 | 4,274 |

각 키의 실제 파일은 `art-source/webtoon/generated/flight-m6/{key}-01.png`(1086×1448 네이티브)·동명 JSON(전체 실제 프롬프트/원래 경로/해시), `art-source/webtoon/{key}.png`와 `{key}.webp`(384×512, 동일 RGBA 무손실), `public/assets/webtoon/{key}.webp`(96×128 런타임)이다. 합계 **17,644바이트**. 원본은 원래 `.codex/generated_images/01a10013-499c-7b11-9c12-3ae8826e542a/`에도 보존하며 실제 파일명은 JSON에 있다.

고리 표시129.6×172.8·통과 타원 반경65/80, 구름 기본91.2×121.6·기존반경62/70, 파편 기본67.2×89.6·기존반경48을 유지한다. 구름·파편은 기존0.96~1.04배 맥동·상하 이동/회전을 그대로 쓴다. 고리 플래그가 기존 `lantern` 이야기 텍스처보다 우선하도록 표시 선택을 바로잡았다. 오브젝트/보상/저장 ID와 물리·피해·조작·손 좌표는 변경하지 않았다. 필요한 맵만 로드하고 누락 시 보존 SVG로 복구한다.

기능/브라우저 검증: 단위107개·전체E2E57개 통과(실패/flaky/skipped0), 새 게임36구간843초 완주·오류0. 최종 비행 화면41장은 `docs/screenshots/m6-flight/final/m6-flight/`, 경로/치수/SHA256은 `docs/validation/m6-flight-final-screenshots.json`, 전체 실제 보고서는 `m6-flight-e2e-final.json`이다. 정상/누락×폰/태블릿4개에서 실제 크기·움직임·첫 고리 금화 중복 방지·저장·캐시/재방문·SVG 복구를 확인했다. 기능 통과를 최종 아트·실기기 승인으로 취급하지 않는다.

## M6 상호작용 소품 25종 · 2026-10-04 · ART_DRAFT

출처: OpenAI **내장 imagegen**, 프로젝트 자체 `hero-webtoon.webp` 참조. 외부 작품·작가 참조 없음. 본 프로젝트 사용·수정용 생성 자산이며 최종 아트 승인 전 **ART_DRAFT**다. 원래 생성 PNG, 저장소 네이티브 복사본, 기존 SVG를 모두 보존했다.

각 키의 파일: `art-source/webtoon/generated/props-m6/{key}-01.png`(네이티브)·동명 JSON(전체 프롬프트/경로/해시), `art-source/webtoon/{key}.png`와 `{key}.webp`(384×512, 동일 RGBA·무손실), `public/assets/webtoon/{key}.webp`(96×128 런타임). 25개 런타임 합계 **126,782바이트**다. 원본 24장은 1086×1448, `prop-golden`만 1087×1447이며 전체 캔버스 비례 축소와 투명 여백으로 규격화했다.

일반 소품 표시 사각형은 65.28×87.04다. 기존 NPC 역할 소품은 96×128, 체크포인트는 40.32×53.76 등 기존 kind별 크기를 유지한다. 맵별 실제 크기는 `m6-interact-map-{normal,fallback}.json` 검사가 기록한다. 보상·오브젝트·저장 ID와 손 JSON·무기·물리·조작 이름을 변경하지 않았다.

| 새 키 | 보존 SVG 텍스처 | 적용 대상 | 런타임 바이트 |
|---|---|---|---:|
| prop-shell | shell | 해당 텍스처의 실제 맵 소품 | 4,178 |
| prop-bell | bell | S01.exit | 4,720 |
| prop-golden | golden | 해당 텍스처의 실제 맵 소품 | 4,352 |
| prop-key | key | 해당 텍스처의 실제 맵 소품 | 5,058 |
| prop-lifevest | gear | S04.gear.1 | 5,362 |
| prop-rescue-rope | gear | S04.gear.2 | 5,718 |
| prop-lifering | gear | S04.gear.3 | 4,938 |
| prop-lightning-rod | rod | S03.rod.1, S03.rod.2 | 4,998 |
| prop-damaged-mast | rod | S03.crisis | 6,400 |
| prop-coral-gate | gate | 해당 텍스처의 실제 맵 소품 | 4,658 |
| prop-vine | vine | 해당 텍스처의 실제 맵 소품 | 5,654 |
| prop-torch | torch | 해당 텍스처의 실제 맵 소품 | 3,486 |
| prop-furnace | furnace | 해당 텍스처의 실제 맵 소품 | 5,106 |
| prop-wave-rope | rope | 해당 텍스처의 실제 맵 소품 | 4,114 |
| prop-mirror | mirror | 해당 텍스처의 실제 맵 소품 | 5,254 |
| prop-journal | journal | 해당 텍스처의 실제 맵 소품 | 3,838 |
| prop-star-map | starMap | 해당 텍스처의 실제 맵 소품 | 5,720 |
| prop-lantern | lantern | 해당 텍스처의 실제 맵 소품 | 4,664 |
| prop-star-device | starDevice | 해당 텍스처의 실제 맵 소품 | 5,944 |
| prop-cargo | cargo | 해당 텍스처의 실제 맵 소품 | 4,222 |
| prop-gift | gift | 해당 텍스처의 실제 맵 소품 | 5,280 |
| prop-treasure-altar | treasureAltar | 해당 텍스처의 실제 맵 소품 | 5,360 |
| prop-moon-rock | moonRock | 해당 텍스처의 실제 맵 소품 | 3,982 |
| prop-lotus-shrine | lotusShrine | 해당 텍스처의 실제 맵 소품 | 5,696 |
| prop-ending | ending | 해당 텍스처의 실제 맵 소품 | 8,080 |

실제 원본 해시·선택·기존 SVG 해시: `art-source/webtoon/world-props.sources.json`. 측정: `world-props.measurements.json`. 연결: `src/content/worldProps.ts`, `assets.manifest.ts`, `src/game/stage.ts`. 생성 파이프라인: `pack-world-props.py` → `optimize-webtoon.py`; 재현 가능한 감사: `audit-world-props.py`. 검사 결과·화면·미검증 사유는 `PROJECT_STATUS.md`에 별도 기록한다.

## M6 보물 상자·회복 하트 · 2026-10-04 · ART_DRAFT

출처: OpenAI **내장 imagegen**, 프로젝트 자체 `hero-webtoon.webp`를 화풍 참조로 사용. 외부 작품·작가 참조 없음. 본 프로젝트에서 사용·수정하는 생성 자산이며 사용자 최종 아트 승인·실기기 검수 전 **ART_DRAFT**다. 원본과 기존 SVG는 삭제하지 않았다.

| 키·용도 | 원화 PNG/무손실 WebP | 실제 런타임 |
|---|---|---|
| `prop-chest` · 기본 보물 상자 | `art-source/webtoon/prop-chest.{png,webp}` · 384×512 | `public/assets/webtoon/prop-chest.webp` · 96×128 · 3,872바이트 |
| `prop-heart` · 일반/큰 회복 하트 | `art-source/webtoon/prop-heart.{png,webp}` · 384×512 | `public/assets/webtoon/prop-heart.webp` · 96×128 · 2,882바이트 |

생성 PNG 2장은 **1086×1448 RGBA**이며 `art-source/webtoon/generated/props/prop-{chest,heart}-01.png`에 바이트 동일 보존했다. `world-props.sources.json`에 프롬프트 전문·실제 생성 경로·해시·참조·기존 SVG 해시, `world-props.measurements.json`에 원화 경계·표시 크기를 기록했다. `scripts/pack-world-props.py` → `optimize-webtoon.py` → `audit-world-props.py`로 재현·검사한다. 원화 PNG/무손실 WebP는 동일 RGBA다.

`worldProps.ts`·`stage.ts`는 현재 맵의 기본 상자와 하트만 필요에 따라 로드한다. `cargo` 등 별도 이야기 텍스처는 유지하고 누락 시 `public/assets/draft/chest.svg`, `heart.svg`를 사용한다. 상자 표시 65.28×87.04, 일반/큰 하트 34.56×46.08 / 48×64를 유지했다. 회복량·획득 거리·보상 ID·저장 형식은 변경하지 않았다. 첫 누락 검사의 사람 모양 대체 문제를 수정했으며 실제 검사·실패 이력은 `PROJECT_STATUS.md`, `docs/validation/m6-props-*.json`에 기록한다. 최종 전체 E2E **49개/exit0**, 단위 **104개**, 신규 36스테이지 완주 **815초**가 통과했다. 최종 PNG 24장은 `docs/screenshots/m6-props/final/m6-props/`, 디코딩·실제 경로·해시는 `m6-props-final-screenshots.json`에 있다. 전체 M6/최종 아트 승인과 구별하며 ART_DRAFT를 유지한다.

## A8 터치 UI 아이콘 · 2026-10-04 · ART_DRAFT

출처: OpenAI **내장 imagegen**, 프로젝트 자체 `hero-webtoon.webp`의 선·셀 음영만 참조. 외부 작품·작가 참조 없음. 본 프로젝트에서 사용·수정하는 생성 자산이며 최종 사용자 아트 승인·실기기 검수 전 ART_DRAFT다.

| 원화 PNG/무손실 WebP (`art-source/webtoon/`) | 실제 런타임 PNG (`public/assets/webtoon/`) | 용도 |
|---|---|---|
| `ui-jump.{png,webp}` | `ui-jump.png` | 점프/위로 · 부츠와 위쪽 화살표 |
| `ui-talk.{png,webp}` | `ui-talk.png` | 대화 · 말풍선 |
| `ui-inspect.{png,webp}` | `ui-inspect.png` | 살펴보기 · 펼친 손 |
| `ui-depart.{png,webp}` | `ui-depart.png` | 출발 · 돛배 |
| `ui-wing.{png,webp}` | `ui-wing.png` | 비행 중 날개 공격 |
| `ui-flame.{png,webp}` | `ui-flame.png` | 영원의 불씨 능력 |
| `ui-bridge.{png,webp}` | `ui-bridge.png` | 도깨비의 방울 능력 |
| `ui-shield.{png,webp}` | `ui-shield.png` | 균형의 연꽃 능력 |
| `ui-dawn.{png,webp}` | `ui-dawn.png` | 새벽의 나침반 능력 |

원화는 모두 **512×512**, 실제 런타임은 **128×128 투명 PNG**이며 합계 **182,840바이트**다. 생성 원본은 모두1254×1254, `art-source/webtoon/generated/touch/{key}-01.png` 9개와 `ui-jump-02.png` 1개를 바이트 동일 보존했다. 첫 점프 후보는 아래쪽 화살표가 함께 생겨 방향이 모호했고 두 번째 단순한 위쪽 화살표를 선택했다. 미선택 원본을 삭제하지 않았다.

실제 프롬프트·도구 경로·참조·선택·해시는 `touch-icons.sources.json`, 균일한 전체 캔버스 변환·원화 경계는 `touch-icons.measurements.json`이다. 재현 경로는 `pack-touch-icons.py` → `optimize-webtoon.py` → `audit-webtoon.py`/`audit-touch-icons.py`다. 원화 PNG/WebP와 런타임 PNG **27개**의 실제 디코딩·동일 RGBA·투명 경계, 생성 PNG 10개 해시 검사를 통과했다. 등록 경로·runtimeSize는 매니페스트와 일치한다. 실제 터치 검증과 최종 아트 승인을 구별하고 결과·미검증은 `PROJECT_STATUS.md`에 기록한다.

실제 최종 검증: 단위103개·전체 E2E46개 통과, 새 게임36구간·무기/보물 각7종·엔딩·재개·재방문 확인. 738개 실제 소스/런타임/빌드/검사/원본 파일이 전체 실행 전후 동일했다. 생성10개와 이전 증거476개, 추가 검증 소스8개의 보존 해시를 재확인했다. 최종42장 모음은 `docs/screenshots/art-a8/final/art-a8/`, 원시 보고서는 `docs/validation/a8-e2e-final.json`, 실제 출처 경로/해시는 `a8-final-screenshots.json`이다. 실패/중단 이력은 `a8-development.json`에 기록했고 원본을 삭제하지 않았다. 실기기·어린이 이해도·최종 사용자 아트 승인은 미검증이므로 ART_DRAFT 유지.

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

## A7 투사체·효과 · 2026-10-04 · ART_DRAFT

출처: OpenAI 내장 imagegen, 프로젝트 자체 hero-webtoon 화풍 참조. 본 프로젝트에서 사용·수정하는 생성 원본이며 외부 작품/작가 참조와 핫링크가 없다. 최종 아트/애니메이션 승인은 미완료다.

| 원본 PNG/무손실 WebP (`art-source/webtoon/`) | 런타임 WebP (`public/assets/webtoon/`) | 크기/프레임/용도 |
|---|---|---|
| `projectile-siren-wave.{png,webp}` | `projectile-siren-wave.webp` | 원본1024×1024·4프레임 / 런타임128×128·셀64; 오른쪽으로 열린 청록 음파 곡선과 진주 중심. 네 단계 잔물결 반복. |
| `projectile-siren-note.{png,webp}` | `projectile-siren-note.webp` | 원본1024×1024·4프레임 / 런타임128×128·셀64; 보라색 8분음표 모양 소품과 금빛 반짝임. 네 단계 빛 띠 반복; 글자 레이블 없음. |
| `projectile-kite-wind.{png,webp}` | `projectile-kite-wind.webp` | 원본1024×1024·4프레임 / 런타임128×128·셀64; 오른쪽으로 날아가는 민트 소용돌이·왼쪽 짧은 바람 꼬리. 네 단계 회전 반복. |
| `projectile-kuura-orb.{png,webp}` | `projectile-kuura-orb.webp` | 원본1024×1024·4프레임 / 런타임128×128·셀64; 보라 수정 마법구·라벤더 궤도 띠. 네 단계 맥동 반복, 공포/종교 표식 없음. |
| `effect-hit-spark.{png,webp}` | `effect-hit-spark.webp` | 원본1536×1024·6프레임 / 런타임384×256·셀128; 작은 별빛→확장→금색/아이보리 타격 불꽃→흩어짐→작은 반짝임→소멸의6단계. 피/상처 없음. |
| `effect-purify-light.{png,webp}` | `effect-purify-light.webp` | 원본1536×1024·6프레임 / 런타임384×256·셀128; 진주 빛→민트 리본→열린 정화 고리→별빛 분산→상승/소멸의6단계. 동물과 마법 적의 평화로운 전환. |
| `effect-surrender-flag.{png,webp}` | `effect-surrender-flag.webp` | 원본1536×1024·6프레임 / 런타임384×256·셀128; 접힌 흰 깃발→펼침→금빛 반짝임→잔잔한 천→희미해짐의6단계. 문양 없는 깃발과 짧은 나무 기둥, 사람/무기 없음. |

생성 원본7개: `art-source/webtoon/generated/effects/{projectile-siren-wave,projectile-siren-note,projectile-kite-wind,projectile-kuura-orb,effect-hit-spark,effect-purify-light,effect-surrender-flag}-01.png`. 모두 도구 반환 PNG의 바이트/SHA256과 동일하다. 실제 프롬프트/도구 경로/참조/선택은 `effects.sources.json`, 네/여섯 셀의 원본 경계·내부480px 경계·16px 여백 변환은 `effects.measurements.json`에 있다. 생성 크기는 투사체1254×1254, 효과1536×1024이고 원화 WebP는512px 셀의 손실 없는 정규화본이다.

재현 경로: `pack-effects.py` → `optimize-webtoon.py` → `audit-webtoon.py`/`audit-effects.py`. 원본/런타임14개 실제 디코딩·34셀 가시 경계와 완전한 RGBA 인코딩을 검사한다. 원본을 런타임으로 직접 배포하지 않는다. 등록 키·frame·runtimeSize는 매니페스트와 일치하며 모든7개는 `draft`다. 런타임 합계93,582바이트. 최종 사용자 승인·실기기 검수는 별도 미검증이다.

실제 연결·검증 완료: 단위 101개·전체 E2E 44개 통과, 정상 키 입력 새 게임 36스테이지 완주·보상 저장 재개 확인. `docs/validation/effects.json`, `a7-checks.json`, `a7-e2e-full.json`과 최종 캡처 36장의 `a7-final-screenshots.json`에 근거를 보존했다. 생성 원본과 기존 자산을 삭제하지 않았고 실행 전후 실제 684파일 해시가 동일하다. 기능 검증과 최종 아트 승인을 구별해 ART_DRAFT를 유지한다. 커밋·푸시·배포 없음.
