# -*- coding: utf-8 -*-
from pathlib import Path
import json
root=Path('.');folder=root/'art-source/webtoon'
meta=json.loads((folder/'roc-actions.json').read_text(encoding='utf-8'))
original=(folder/'roc-actions.webp').stat().st_size;runtime=(root/'public/assets/webtoon/roc-actions.webp').stat().st_size
section=f'''## M6 로크새 행동6프레임 · 2026-10-07 · ART_DRAFT

OpenAI 내장 imagegen. 자체 `hero-webtoon.webp`의 외곽선·셀 음영·청록/금색·왼쪽 위 조명과 `roc-webtoon.webp`의 청록/아이보리 깃털·금색 끝·갈색 안장만 참조했다. 오른쪽을 보는 대기·날개를 올리고 웅크린 예고·앞/아래로 날개를 휘두르는 공격·목 보석이 청록색으로 맑아진 평온한 저주 해제·비행 날개 위·비행 날개 아래의 3×2 시트다. 탑승자·무기·글자·로고·격자·피·상처·외부 작품/작가 참조 없음. 전체 지시는 `art-source/webtoon/generated/roc-m6/roc-actions-01.json`, 도구 원본은 동명 PNG에 보존했다.

실제 네이티브1536×1024 RGBA/512px6셀. alpha>16의 외곽/중앙 경계는 비어 있으며 글자·셀 침범 없음 육안 확인. 날개 끝이 경계에 가까운 셀의 여백을 확보하기 위해 `scripts/pack-roc-actions.py`가 전체512셀을448로 균일 축소하고32px 안쪽에 배치한다. 실루엣 자르기·덧칠·원본 삭제 없음.1536×1024 PNG와 동일 RGBA 무손실 WebP **{original:,}B**. 최적화 스크립트와 두 크기 등록으로768×512/256px6셀 런타임 WebP **{runtime:,}B**.

512px 기준 발/발톱 baseline439/439/343/411/385/299, 몸통 중심(325,312)/(330,360)/(294,321)/(330,286)/(325,303)/(325,286), 안장(294,245)/(277,298)/(224,240)/(294,213)/(300,268)/(258,203). 예고·날개 위 자세의 안장 중심은 날개에 가려져 보이는 안장 테두리로 투영한 좌표이며, 완전히 노출된 좌석 실측과 구별한다. 대기 가시 높이322·날개 위 기준 폭400. JSON을 게임 JSON으로 바이트 동일 복사한다. 비행 중 발 baseline은 날개/꼬리 최하단과 구별한다.

S09 보스는 기존 타깃 위치/HP·논리 폭220·대기 가시 높이145·발 오프셋50.75 유지. 공격 자세는 접힌 발을 바닥에 고정하면 날개가 지형 아래로 들어가므로 몸통 중심과 대기 기준선의 차이로 원점을 맞춘다. 실제 상태 대기/예고/공격/회복/해제에0/1/2/0/3을 사용하며 동물의 평온한 해제900ms 후 기존520ms 소멸(연출 줄이기는 소멸0ms)이다. 보상 지급 시점은 그대로다. 누락은 보존 `roc-webtoon.webp`로 복구한다.

S10·S33은4/5를160ms 간격으로 고르고 연출 줄이기는4로 고정한다. 기존 날개 공격0~280ms에는2. 공격 피해22/활성80~200ms/재사용420ms·플레이어 물리42×84·입력·적/보상/저장 ID는 그대로다. 표시 크기307.2 정사각에서 JSON 안장 좌표를 주인공의 기존 발 위치(x±36,y+10)에 맞추고 왼쪽 원점을 반전하여 프레임별로 탑승자가 안장에서 벗어나지 않는다. S33 동승자(x±3,y+10) 유지. 기존 정적 원화/NPC를 삭제하지 않고 사용하며 비행 종료 시 시트 캐시 해제.

**S09 설계의 저주 핵3회 피격과 고유 공격3패턴은 아직 미구현**이다. 현재는 순차 채널 봉인3개·일반 HP보스·모두 완료 후 T03 선물이다. 이번 작업은 행동 아트 연결이며 설계서 전체 보스 구현 완료로 취급하지 않는다. S26 박쥐5마리/S32 저주 구체4개/박쥐 제한 비행 경로·실기기·최종 사용자 아트 승인도 별도 미완료. 실제 검사 결과는 PROJECT_STATUS.md에 기록하며 ART_DRAFT 유지.

'''
for name in ('ART_PROMPTS','ASSET_REGISTER'):
    p=root/f'docs/{name}.md';text=p.read_text(encoding='utf-8');assert '## M6 로크새 행동6프레임' not in text
    title,rest=text.split('\n',1);extra=''
    if name=='ASSET_REGISTER':
        extra='''| 실제 경로 | 규격/역할 | 출처·이용 조건 |
|---|---|---|
| `art-source/webtoon/roc-actions.png`, `.webp` | 1536×1024 원화, 동일 RGBA 무손실 WebP | 내장 imagegen, 자체 프로젝트 디자인. 프로젝트 사용/수정 가능. ART_DRAFT. |
| `public/assets/webtoon/roc-actions.webp` | 768×512 런타임 시트 | 최적화 스크립트 생성, 위와 동일 조건. |
| `art-source/webtoon/roc-actions.json` → `src/content/roc-actions.generated.json` | 발/몸통/안장 좌표, 게임 JSON 동일 복사 | 투영 좌석2개 명시. ART_DRAFT, 최종 승인 전. |
| `art-source/webtoon/generated/roc-m6/roc-actions-01.png`, 동명 `.json` | 네이티브1536×1024와 전체 생성 기록/SHA | 도구 원본 보존, 자체 hero/roc만 참조. |
| 기존 `art-source/webtoon/roc-webtoon.webp`, `public/assets/webtoon/roc-webtoon.webp` | 시트 누락 복구와 NPC 원화 | 기존 원본/출처/조건 보존. |

'''
    p.write_bytes((title+'\n\n'+section+extra+rest.lstrip('\n')).encode('utf-8'))
print(json.dumps({'sourceBytes':original,'runtimeBytes':runtime,'nativeCandidates':1}))
