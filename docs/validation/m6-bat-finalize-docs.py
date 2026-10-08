# -*- coding: utf-8 -*-
from pathlib import Path
import json
root=Path('.');v=root/'docs/validation'
post=json.loads((v/'m6-bat-postcheck.json').read_text(encoding='utf-8'));stats=post['fullStats']
assert stats['expected']==69 and not any(stats[k] for k in ('unexpected','skipped','flaky'))
minutes=round(stats['duration']/60000,1);seconds=post['campaign'][-1]['elapsedSeconds'];count=post['screenshots']
frozen=post['frozenFiles'];archive=json.loads((v/'m6-bat-regression-reports.json').read_text(encoding='utf-8'))
extra=f'''- **전체69개 E2E 통과/exit0/{minutes}분**, 실패·flaky·skipped 각0. `docs/validation/m6-bat-e2e-final.json`, `m6-bat-e2e-final-output.txt`, `m6-bat-final-report/index.html`. 새 박쥐4조건·기존 적40자세·무기·지형·효과·터치·소품·저장/사망·불씨/파도·엔딩을 포함한다.
- **저장 주입 없는 새 게임36스테이지 정상 키 입력 완주{seconds}초.** 무기/보물 각7·엔딩·S01재방문·S16/S32완료 뒤 새로고침 보상 ID 유지·오류[]를 확인했다(`m6-bat-complete-journey.json`). 자동 완주 시간을 어린이 플레이 시간이나 모든 콘텐츠 설계 일치 검증으로 취급하지 않는다.
- **보존/실행 일치:** 전체 실행 전후{frozen}파일 전부 동일, 백업333개·기존 미디어566개·기존 src36개·네이티브1장의 도구 원본 일치를 최종 재확인했다(`m6-bat-final-runtime-hashes.json`, `m6-bat-preservation.json`, `m6-bat-postcheck.json`). 고정 이름에 쓰인 이번 회귀 보고서{len(archive['reports'])}개는 `m6-bat-regression-reports/`에 바이트 동일 보존하고 이전 원본 보고서를 복구했다. 원본 삭제 없음.

**실제 화면:** 주요{count}장은 `docs/screenshots/m6-bat/final/m6-bat/`에 있다. 박쥐32장(2뷰포트×2모드×8상태/맥락), 터치6장, 캠페인7장이다. 예: `phone-normal-attack.png`, `tablet-normal-defeated.png`, `tablet-normal-safe-puzzle.png`, `phone-fallback-checkpoint-resume.png`. 해제 캡처에는 기존 공격 연출/주인공이 일부 겹치며 JSON 프레임3 관찰과 보존 원화도 함께 확인했다. 경로·디코딩 크기·SHA·복사13개 일치는 `m6-bat-final-screenshots.json`이다.

'''
p=root/'PROJECT_STATUS.md';text=p.read_text(encoding='utf-8')
start=text.index('<!-- M6_BAT_STATUS_START -->');end=text.index('<!-- M6_BAT_STATUS_END -->',start)
block=text[start:end]
block=block.replace('전체69개 E2E 실행 중',f'전체69개 E2E 통과/{minutes}분')
block=block.replace('전체 결과와 실행 후 일치는 **아직 검사 중**이며 통과로 처리하지 않는다.','전체 결과와 실행 후 일치는 아래 최종 기록처럼 확인했다.')
block=block.replace('**미검증:**',extra+'**미검증:**',1)
block=block.replace('현재 전체69개 회귀가 끝나면 실제 결과·화면 경로·해시를 갱신한다.','자체 개발/테스트 서버 종료와 최종 diff 검사는 `m6-bat-stopped-servers.json`, `m6-bat-final-diff-check.txt`에 기록했다.')
p.write_bytes((text[:start]+block+text[end:]).encode('utf-8'))
play=f'''## M6 박쥐 행동4셀 후 실제 회귀 · 2026-10-06

Windows Edge 정적8명령·단위113개/23파일·신규 박쥐4조건 통과. 폰844×390/태블릿1180×820×원화/의도적 시트 누락에서 대기·예고·접촉 피해·회복·양방향 중심·일시정지·실제 터치 공격·동물 저주 해제·XP6/금화3 한 번 지급·재등장 후 추가0·T02 없는 안전 쉼터 자동 저장/재개·S01 캐시 해제를 확인했다. 명시적 구간/레벨/보물 픽스처이며 새 게임 검사와 구별한다. 태블릿은 연출 줄이기. JSON은 `docs/validation/m6-bat-{{phone,tablet}}-{{normal,fallback}}.json`이다.

전체 E2E **69개/exit0/{minutes}분**, 실패·flaky·skipped 각0. 별도 저장 주입 없는 정상 입력 새 게임36스테이지는{seconds}초이며7무기/보물·엔딩·S01재방문·S16/S32저장 보상 유지·오류[] 확인. `m6-bat-e2e-final.json`, `m6-bat-complete-journey.json`. 초기 한 번 처치/쉼터 목표/로더 요청 수 테스트 가정 실패를 게임 규칙 변경 없이 보완한 과정과 원시 증거는 PROJECT_STATUS에 구별해 기록했다.

CDP 실제 터치 양쪽 이동+252px·밀기 반전·동시 이동/점프dx7px/dy−110px·첫 해골 처치·선장 대화·오류[], exit0. 최종{count}화면·13바이트 동일 복사·실행 전후{frozen}파일 동일·기존 미디어566개/백업333개 보존을 확인했다. 화면 `docs/screenshots/m6-bat/final/m6-bat/`, 해시 `m6-bat-final-screenshots.json`. S26은 현재 산적3마리로 설계의 박쥐5마리가 없고, S08박쥐는 기존 고정 높이 수평 접근 AI다. 전체 경로 통과를 설계서 모든 콘텐츠 일치로 취급하지 않는다. 실기기/iOS/어린이 조작성/장시간 FPS·발열/실제 스피커/최종 아트 승인은 **미검증**, ART_DRAFT 유지, 이번 로컬 작업 커밋·푸시·배포 없음.

'''
p=root/'docs/PLAYTEST_LOG.md';text=p.read_text(encoding='utf-8');title,rest=text.split('\n',1)
assert '## M6 박쥐 행동4셀' not in text;p.write_bytes((title+'\n\n'+play+rest.lstrip('\n')).encode('utf-8'))
for path in ('docs/ART_PROMPTS.md','docs/ASSET_REGISTER.md'):
    p=root/path;text=p.read_text(encoding='utf-8');needle='## M6 박쥐 행동'
    at=text.index('\n\n',text.index(needle))+2
    result=f'실제 최종 검사: 정적8명령·단위113개·박쥐4조건·전체69개 E2E({minutes}분) 통과, 새 게임36구간{seconds}초/7무기·보물/엔딩/오류[]. 주요{count}화면·실행 전후{frozen}파일 동일·기존 미디어566개 보존. 실제 로그/초기 테스트 실패·보완/남은 콘텐츠/미검증은 PROJECT_STATUS와 `docs/validation/m6-bat-postcheck.json`에 기록했다. 기능 통과와 최종 사용자 아트 승인을 구별한다.\n\n'
    p.write_bytes((text[:at]+result+text[at:]).encode('utf-8'))
print(json.dumps({'passed':69,'minutes':minutes,'campaignSeconds':seconds,'screens':count,'frozen':frozen,'restoredReports':len(archive['reports'])}))
