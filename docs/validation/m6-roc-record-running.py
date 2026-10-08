# -*- coding: utf-8 -*-
from pathlib import Path
p=Path('PROJECT_STATUS.md');s=p.read_text(encoding='utf-8')
s=s.replace('**구현 후 브라우저 검증 진행 중 / ART_DRAFT.**','**구현·전용4조건 검증 완료 / 전체77개 회귀 실행 중 / ART_DRAFT.**',1)
old='- 최초 단위 검사116통과/1실패는 기존 S09 행동 시트 없음 기대값이었다. 새 시트와 동물 해제를 기대하도록 갱신 후117통과. 최초 새 E2E4실패는 실제 저주 해제 문구와 다른 기대값이었다. 원본 로그/검사 소스/실패 화면 보존. 현재 재검사 좌표 비교 실패 분석 중이며 전체77개 E2E는 아직 실행 전이다. 완료/통과로 취급하지 않는다.'
new='''- 최초 단위116통과/1실패는 기존 S09 행동 시트 없음 기대값으로 수정 후117통과. 새 E2E 최초4실패는 저주 해제 문구의 기대값, 두 번째4실패는 이동 직후 물리/그림 좌표 비교, 세 번째2통과/2실패는 이단 점프의 짧은 상승 구간을 느린 poll이 놓친 검사였다. 기존 문구·멈춘 뒤 좌표 비교·프레임별 관측으로 검사만 보완했다. `m6-roc-development.json`, 각 실행 JSON/로그/검사 원본과 `docs/screenshots/m6-roc/{first,second,third}-target-failure/`에 실패 증거를 보존했다.
- 로크새 전용 폰/태블릿×정상/의도적 누락4조건 모두통과/exit0/5.4분. 실제 봉인3개·보스5상태·반전·일시정지·터치공격·동물해제·XP6/금화3 한번·T03 조기 지급 차단/대화 중 저장/새로고침·이단 점프·비행4/5/2와 반전안장·동승자·피해22·물리42×84·체크포인트 재개·캐시 해제 확인. stage/레벨/아이템 픽스처이며 새 게임 완주와 구별. `m6-roc-recheck3.json`,66화면 `docs/screenshots/m6-roc/recheck3/m6-roc/`. 최종 검사 보완 뒤 타입/린트 재통과.
- 전체 실행 전 실제 소스/자산/빌드/원화/스크립트/테스트997파일을 고정했다(`m6-roc-final-runtime-hashes.json`). **현재 전체77개 실행 중이며 결과와 실행 후 해시 일치는 미완료**. 로그 `m6-roc-e2e-final-output.txt`.'''
assert old in s;s=s.replace(old,new,1);p.write_bytes(s.encode('utf-8'))
