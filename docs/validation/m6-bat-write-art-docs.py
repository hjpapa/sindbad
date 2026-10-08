# -*- coding: utf-8 -*-
from pathlib import Path
import json
root=Path('.');f=root/'art-source/webtoon';meta=json.loads((f/'bat-actions.json').read_text(encoding='utf-8'))
original=(f/'bat-actions.webp').stat().st_size;runtime=(root/'public/assets/webtoon/bat-actions.webp').stat().st_size
prompt=f'''## M6 박쥐 행동4프레임 · 2026-10-06 · ART_DRAFT

OpenAI **내장 imagegen**으로 대기·날개를 높이 든 공격 예고·날개를 내려 휘두르는 공격·평온한 저주 해제4셀을 생성했다. 프로젝트 자체 `hero-webtoon.webp`는 외곽선·셀 음영·왼쪽 위 조명만 참조했다. 자체 `public/assets/draft/bat.svg`의 보라색 날개·삼각 귀·작은 몸 디자인을 글로 설명했다. 외부 작품/작가 참조 없음. 오른쪽을 보는 친근한 연보라 박쥐, 둥근 눈·작은 발·닫힌 입, 해제 때 감은 눈·작은 따뜻한 반짝임을 지시했다. 피·상처·겁주는 이빨·글자·격자·배경은 넣지 않았다.

선택1번은 실제1254×1254 RGBA/2×2/627px 셀이다. 중앙과 외곽 경계는 alpha>16 기준 전부 비었으며 글자 없음·안전한 해제 자세는 육안 확인했다. 프롬프트의 중앙45% 크기 지시보다 실제 날개는 넓지만 셀 안에 완전히 들어 있다. 전체 프롬프트·참조·도구 원본 경로·SHA·선택 기록은 `art-source/webtoon/generated/bat-m6/bat-actions-01.json`, 도구와 바이트 동일 원본은 동명 PNG다. 원본 삭제 없음.

`scripts/pack-bat-actions.py`는 각 **전체627px 셀**을512px로 균일 축소해4×1 재배열한다. 실루엣 자르기/덧칠 없이2048×512 PNG + 동일 RGBA 무손실 WebP **{original:,}B**를 만들었다. SIZES/runtimeSize 등록 후 최적화로1024×256/4셀256px WebP **{runtime:,}B**를 생성했다.

512px 기준 가시 baseline429/448/365/363, 몸통 중심(327,384)/(280,412)/(347,280)/(272,288), 대기 가시 높이233이다. 중심은 불투명 몸통에서 수동 측정했고 좌우 반전 시 원점도 반전한다. 메타데이터를 게임 JSON으로 바이트 동일 복사했다. 기존96×128 타깃·바닥 경고 오프셋64와 약84px 대기 가시 높이를 유지한다. 날개 폭은 기존 SVG보다 넓다. 비행체이므로 기준선을 바닥에 고정하지 않고 몸통 중심을 게임 타깃에 맞춘다.

실제 S08 박쥐4마리만 연결한다. 기존 고정 높이의 수평 접근 AI·접촉 피해·타이밍·보상/저장 ID·퍼즐 안전 구역을 유지하고, 안전 구역에서는 그림도 대기 자세로 복귀시킨다. 시트 누락은 보존 SVG로 복구한다. S26은 현재 산적3마리로 구현되어 설계서의 박쥐5마리는 별도 미완료 콘텐츠다. 제한 사인/고정 비행 경로도 이번 아트 작업에서 새로 구현하지 않았다. 최종 실제 검사/화면·미검증은 `PROJECT_STATUS.md`에 기록하며 **ART_DRAFT**를 유지한다.

'''
register=f'''## M6 박쥐 행동 시트 · 2026-10-06 · ART_DRAFT

| 실제 키 / 경로 | 규격 / 역할 | 출처·조건 |
|---|---|---|
| `bat-actions` · `art-source/webtoon/bat-actions.png`, `.webp` | 2048×512/4셀512px, 동일 RGBA 무손실 WebP{original:,}B | 자체 박쥐 디자인·신밧드 화풍 참조, OpenAI 내장 imagegen. 프로젝트 사용·수정용 생성 자산, 외부 작품/작가 참조 없음. 최종 승인 전 ART_DRAFT. |
| `public/assets/webtoon/bat-actions.webp` | 1024×256/4셀256px, {runtime:,}B | SIZES/runtimeSize 등록→`optimize-webtoon.py`. 실제 S08 박쥐4마리만 사용. |
| `art-source/webtoon/bat-actions.json` → `src/content/bat-actions.generated.json` | baseline429/448/365/363, 불투명 몸통 중심(327,384)/(280,412)/(347,280)/(272,288) | 원본 메타데이터 바이트 동일 복사. 대기 높이233→가시84px, 기존타깃96×128·경고오프셋64 유지. |
| `art-source/webtoon/generated/bat-m6/bat-actions-01.png`, `.json` | 선택 네이티브1254×1254/2×2, 전체 실제 프롬프트·도구 경로·SHA | 도구 원본 바이트 동일 보존. 전체 셀 균일 축소·재배열만 수행. 글자/셀 넘침 없음, 원본 삭제 없음. |
| `public/assets/draft/bat.svg` | 기존 자체 디자인/누락 복구 | 바이트 동일 보존. 기존 SVG 이용 조건 유지. |

`scripts/audit-bat-actions.py`가 네이티브SHA·동일 RGBA·runtime 규격·투명 경계·기준선/몸통 중심을 검사한다. 별도 시트 연결은 기존 고정 높이 수평 접근·접촉 피해·저주 해제·안정 ID·한 번 보상·저장·퍼즐 안전 구역을 유지한다. S26의 설계상 박쥐5마리는 현재 코드에 없으며 이번 연결 범위가 아니다. 기능 검증과 최종 아트 승인을 구별한다. 실제 명령 결과·화면·실패/미검증은 `PROJECT_STATUS.md` 및 `docs/validation/m6-bat-*.json`에 기록한다.

'''
for path,section in ((root/'docs/ART_PROMPTS.md',prompt),(root/'docs/ASSET_REGISTER.md',register)):
    text=path.read_text(encoding='utf-8');assert '## M6 박쥐 행동' not in text
    title,rest=text.split('\n',1);path.write_bytes((title+'\n\n'+section+rest.lstrip('\n')).encode('utf-8'))
print(json.dumps({'sourceBytes':original,'runtimeBytes':runtime,'meta':meta}))
