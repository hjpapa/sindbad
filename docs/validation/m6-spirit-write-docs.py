# -*- coding: utf-8 -*-
from pathlib import Path
import json
root=Path('.');f=root/'art-source/webtoon';meta=json.loads((f/'spirit-actions.json').read_text(encoding='utf-8'))
original=(f/'spirit-actions.webp').stat().st_size;runtime=(root/'public/assets/webtoon/spirit-actions.webp').stat().st_size
section=f'''## M6 정령 행동4프레임 · 2026-10-06 · ART_DRAFT

OpenAI **내장 imagegen** 사용. 자체 `hero-webtoon.webp`는 선명한 외곽선·셀 음영·청록/금색·왼쪽 위 조명만 참조했다. `public/assets/draft/spirit.svg`의 청록 물방울/불꽃 몸과 금색 에너지 코어를 글로 설명했다. 오른쪽을 보는 작은 정령의 대기·몸을 뒤로 접고 옆 불꽃을 올리는 예고·앞으로 손을 내미는 접촉 공격·감은 눈과 빛/연기로 돌아가는 마무리4셀이다. 인간 유령/신격이 아닌 자체 원소 생명체이며 무기·상처·피·글자·로고·격자는 넣지 않았다. 외부 작품/작가 참조 없음.

후보1번의 공격 금색 효과가 중앙 세로 경계 x626/627을 넘어 반려했다. 원본 PNG와 전체 프롬프트/도구 경로/SHA JSON을 삭제 없이 보존했다. 효과를 없애고 전체 그림을 작게 넣도록 수정한 후보2번은1254×1254 RGBA/2×2/627px 셀이다. alpha>16 외곽·중앙 경계가 모두 비었으며 글자 없음/안전한 마무리를 육안 확인했다. `art-source/webtoon/generated/spirit-m6/spirit-actions-{{01,02}}.png`, 동명 JSON이 실제 네이티브와 생성 지시다.

`scripts/pack-spirit-actions.py`로 각 전체627px 셀만512px로 균일 축소·4×1 재배열했다.2048×512 PNG + 동일 RGBA 무손실 WebP **{original:,}B**. SIZES/runtimeSize 등록과 최적화로1024×256/256px4셀 WebP **{runtime:,}B**. 실루엣 자르기/덧칠 없음.

512px 실측 baseline453/441/375/392, 불투명 몸 중심(314,355)/(265,334)/(301,288)/(268,284), 대기 가시 높이313. `spirit-actions.json`을 게임 JSON으로 바이트 동일 복사한다. 좌우 원점도 반전해 기존 논리 타깃에 중심을 맞춘다. 대기 가시 높이약116px(원래SVG y9..120+3.5px 외곽선), 타깃96×128·바닥 경고 오프셋64·위치/HP/AI/보상 ID 유지. 떠 있는 정령의 꼬리를 바닥에 강제 고정하지 않는다. S06의 기존 주황 색조와 예고 색조도 유지한다.

실제 S03 3·S06 5·S07 4·S32 3=15마리 연결. 마무리 프레임3은 마법 적의 빛/연기이며 기존300ms 유지 뒤520ms 소멸을 쓴다(연출 줄이기는 소멸0ms). S06 완료 적의 재등장 생략, 다른 맵의 재등장/중복 보상 방지, 기존 정령 SVG 누락 복구 유지. **S32 설계는 잔여 저주 구체4개이나 현재 구현3마리**라 콘텐츠 불일치를 별도 미완료로 남긴다. S26박쥐5마리/박쥐 제한 비행 경로도 미구현. 최종 검사/실패/화면/미검증은 PROJECT_STATUS.md에 실제 결과로 기록하며 ART_DRAFT 유지.

'''
for name in ('ART_PROMPTS','ASSET_REGISTER'):
    path=root/f'docs/{name}.md';text=path.read_text(encoding='utf-8');assert '## M6 정령 행동4프레임' not in text
    title,rest=text.split('\n',1)
    extra=''
    if name=='ASSET_REGISTER':
        extra='''| 실제 경로 | 규격/역할 | 출처·이용 조건 |
|---|---|---|
| `art-source/webtoon/spirit-actions.png`, `.webp` | 2048×512 무손실 원화 | 프로젝트 자체 디자인, 내장 imagegen. 프로젝트 사용/수정 가능, 최종 아트 승인 전 ART_DRAFT. |
| `public/assets/webtoon/spirit-actions.webp` | 1024×256 런타임 시트 | optimize-webtoon.py로 생성, 위 원화와 동일 이용 조건. |
| `art-source/webtoon/spirit-actions.json` → `src/content/spirit-actions.generated.json` | 실측 메타데이터 동일 복사 | 바이트 동일. 안정 타깃/보상/저장 유지. |
| `art-source/webtoon/generated/spirit-m6/spirit-actions-{01,02}.png`, 동명 `.json` | 반려1/선택2의 네이티브1254×1254와 전체 생성 기록 | 도구 원본 보존, 동일 프로젝트 생성 조건. |
| `public/assets/draft/spirit.svg` | 기존 누락 복구 | 자체 SVG 원본 바이트 동일 보존, 기존 조건 유지. |

'''
    path.write_bytes((title+'\n\n'+section+extra+rest.lstrip('\n')).encode('utf-8'))
path=root/'PROJECT_STATUS.md';text=path.read_text(encoding='utf-8');title,rest=text.split('\n',1)
block=f'''<!-- M6_SPIRIT_STATUS_START -->
## 최신 실제 상태 · 2026-10-06 · M6 정령 행동4프레임

**구현 / 검증 진행 중 / ART_DRAFT.** 내장 imagegen 후보1의 셀 넘침을 반려·보존하고 후보2를 선택했다. 전체627px 셀 균일 축소·재배열로2048×512 PNG/동일RGBA 무손실 WebP{original:,}B와 최적화 런타임1024×256 WebP{runtime:,}B를 만들었다. baseline453/441/375/392, 중심(314,355)/(265,334)/(301,288)/(268,284)을 기록했다. S03/S06/S07/S32 실제15정령에 연결, 기존 타깃96×128·경고64·HP/타이밍/보상/저장ID와 SVG복구 유지. 마무리는 빛/연기이며 최종 아트 승인과 별도다.

백업363파일·기존미디어570개 보존. 현재 정적검사와 추가 브라우저 검사 진행 중이며 완료되지 않은 검사를 통과로 처리하지 않는다. 실제 검증/화면을 이 블록에 갱신한다. 이전 박쥐 검증 기록은 아래 보존했다.

**남은 문제:** S32설계 저주구체4개/현재정령3마리, S26박쥐5마리 미반영, 박쥐 제한 비행 경로 미구현. 등록/획득 그래프 검사 통과가 전체 콘텐츠 설계 일치 판정은 아니다.

**미검증:** 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·스피커 믹스·최종 사용자 아트 승인. 로컬 작업, 커밋/푸시/배포 없음.

**다음 한 작업:** 현재 정령의 정적8검사→CDP터치→전체E2E·보존 검사를 끝내고 실제 결과를 기록한다.
<!-- M6_SPIRIT_STATUS_END -->

'''
path.write_bytes((title+'\n\n'+block+rest.lstrip('\n')).encode('utf-8'))
print(json.dumps({'sourceBytes':original,'runtimeBytes':runtime,'nativeCandidates':2}))
