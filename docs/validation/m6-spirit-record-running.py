# -*- coding: utf-8 -*-
from pathlib import Path
import json
p=Path('PROJECT_STATUS.md');text=p.read_text(encoding='utf-8');start=text.index('<!-- M6_SPIRIT_STATUS_START -->');end=text.index('<!-- M6_SPIRIT_STATUS_END -->')+len('<!-- M6_SPIRIT_STATUS_END -->')
block='''<!-- M6_SPIRIT_STATUS_START -->
## 최신 실제 상태 · 2026-10-06 · M6 정령 행동4프레임

**구현 / 정적115단위 통과·전용검사 보완 완료 / 전체73개 E2E 실행 중 / ART_DRAFT.** 내장 imagegen 후보1의 공격 효과가 중앙 셀 경계를 넘어 반려·보존했고, 후보2의1254×1254 RGBA 전체627px 셀을512px로 균일 축소·4×1 재배열했다.2048×512 PNG + 동일RGBA 무손실 WebP259,304B, 최적화 런타임1024×256 WebP34,476B. baseline453/441/375/392·중심(314,355)/(265,334)/(301,288)/(268,284) 기록. 기존타깃96×128·경고64·위치/HP/AI/피해/타이밍/보상/저장ID·S06주황색조를 유지하며 S03/S06/S07/S32 실제15정령에 연결했다. 마무리는 마법 적의 빛/연기·기존300ms유지/520ms소멸이며 누락은 보존SVG복구.

- 정적8명령 순서 모두통과: 최적화→이미지감사176파일→타입→린트→단위115개/24파일→콘텐츠36/24/7/7/8→빌드46모듈→용량3,083,504/8,000,000B. JS220.06KB/CSS16.93KB/Phaser1,481.77KB, 기존청크경고 유지. `m6-spirit-release-checks.json`, `m6-spirit-release-check-{1..8}.txt`.
- 정령 전용4조건 첫실행4실패, 두 번째3통과/1실패, 해당 태블릿정상1조건보완재실행통과/2.6분. 실패는 살펴보기 버튼의 공격 가정3개·S03첫주기HP고정기대1개·태블릿S32관성접근 뒤 왼쪽고정기대1개였다. 실제 공격 버튼을 기다리고 기존 무적/번개를 구분해 관측하고 정령 현재x를 다시 읽어 접근을 맞췄다. 게임규칙은 유지. 실제동작/반전/일시정지/터치/보상한번/재등장추가0/S06진정적재등장생략·T01조기지급차단/S07첫파도/쉼터x·착지재개/캐시해제 확인. stage/레벨/아이템픽스처이며 새게임완주와 구별. `m6-spirit-{target,recheck,recheck2}.json`, `m6-spirit-development.json`, 실패원본 `docs/screenshots/m6-spirit/{first,second}-target-failure/` 보존.
- 최종정적검사 뒤 dev/CDP 실제터치 재실행exit0. 폰/태블릿 이동+252px·밀기반전·첫해골처치·선장대화·오류[]. 동시이동+점프 폰dx0/dy−110(가로판정보류), 태블릿dx7/dy−110px. `m6-spirit-mobile-final.json`, 화면 `docs/screenshots/m6-spirit/mobile-final/`. 초기실행도 별도보존.
- 백업363파일·기존미디어570개·기존src37개·도구와동일 네이티브후보2장 보존 확인. 전체실행 전 실제 소스/런타임/빌드/원화/스크립트/테스트984개 해시를 고정했다(`m6-spirit-final-runtime-hashes.json`). **현재 전체73검사 실행 중으로 결과·실행후해시 일치는 미완료**. 로그 `m6-spirit-e2e-final-output.txt`.

**남은 문제:** S32설계저주구체4개/현재정령3마리, S26박쥐5마리 미반영/현재산적3, 박쥐제한비행경로 미구현. 콘텐츠검사는등록/획득그래프이며전체설계일치판정이아니다.

**미검증:** 실제폰/태블릿·iOS Safari·어린이조작성·장시간FPS/발열·실제스피커·최종사용자아트승인. ART_DRAFT유지, 로컬작업·커밋/푸시/배포없음.

**다음 한 작업:** 진행중73E2E와최종보존/화면확인을끝내고실제결과기록. 그뒤M6로크새행동프레임.
<!-- M6_SPIRIT_STATUS_END -->'''
p.write_bytes((text[:start]+block+text[end:]).encode('utf-8'));print('Recorded actual running verification; no incomplete checks marked passed.')
