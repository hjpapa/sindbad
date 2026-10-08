from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,shutil,subprocess,re
from PIL import Image

root=Path.cwd();folder=root/'docs/validation';screens=root/'docs/screenshots/s09-nest/final'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
def dump(p,data):p.write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
checks=load(folder/'s09-nest-final-checks.json');assert len(checks)==6 and all(r['exitCode']==0 for r in checks)
stats=load(folder/'s09-nest-e2e-final.json')['stats'];assert stats['expected']==8 and stats['unexpected']==stats['skipped']==stats['flaky']==0,stats
freeze=load(folder/'s09-nest-final-runtime-hashes.json');assert freeze['unchanged'] and freeze['files']==1005
old=load(folder/'s09-mechanics-regression-repair-runtime-hashes.json')['before']
media={p:h for p,h in old.items() if p.startswith(('art-source/','public/'))}
assert len(media)==638
assert all(sha256((root/p).read_bytes()).hexdigest()==h for p,h in media.items())
assert all(sha256((root/p).read_bytes()).hexdigest()==old[p] for p in ('package.json','package-lock.json'))
inventory=[]
for p in sorted(screens.rglob('*.png')):
    with Image.open(p) as image:size=list(image.size);image.verify()
    inventory.append({'path':p.relative_to(root).as_posix(),'size':size,'bytes':p.stat().st_size,'sha256':sha256(p.read_bytes()).hexdigest()})
assert len(inventory)==44,len(inventory)
dump(folder/'s09-nest-final-screenshots.json',inventory)
budget=load(folder/'art-budget.json');assert budget['pass']
copy=folder/'s09-nest-art-budget.json';assert not copy.exists();shutil.copy2(folder/'art-budget.json',copy)
(folder/'art-budget.json').write_bytes((folder/'s09-nest-before/art-budget.json').read_bytes())
listeners=[line for line in subprocess.check_output(['netstat','-ano'],text=True).splitlines() if re.search(r':(?:5174|5175|9323)\s',line) and 'LISTENING' in line]
assert not listeners,listeners
date=datetime.now(timezone.utc).isoformat();minutes=round(stats['duration']/60000,1)
dump(folder/'s09-nest-finish.json',{'date':date,'checks':checks,'e2e':stats,'runtimeFilesUnchanged':1005,'previousMediaUnchanged':638,'newAsset':'public/assets/draft/nestGem.svg','artStatus':'ART_DRAFT','screenshots':len(inventory),'budgetBytes':budget['totalBytes'],'listeners5174_5175_9323':listeners,'budgetReportRestored':True,'previousWorkPushed':'d12b0af9f263efc96adca28217e9793ca24ddb1e','thisWorkCommittedOrPushed':False})
entry=f'''<!-- S09_NEST_STATUS_START -->
## 최신 실제 상태 · 2026-10-08 · S09 둥지 선택 보석·깃털 연습

**기능 구현·선택 E2E8조건 통과 / 단위123개 통과 / ART_DRAFT.** 이전 누적 박쥐·정령·로크새 아트와 S09 핵·활공 작업을 `016093a`로 커밋하고 보조 스크립트 끝 공백 정리 `d12b0af`와 함께 `hjpapa/sindbad`의 `origin/main`에 푸시했다. 원격 SHA `d12b0af9f263efc96adca28217e9793ca24ddb1e`를 확인했다. 이후 아래 둥지 작업은 **로컬 변경이며 아직 커밋·푸시하지 않았다**. 공개 배포를 실행하거나 확인하지 않았다.

- S09 보물 위에 첫 발판(2440,416,180×24), 오른쪽 위 발판(2780,344,180×24)을 추가했다. 바닥에서 첫 발판까지192px는 기본 점프의 약136px 높이보다 높아 이단 점프가 필요하다. 발판 사이160px 간격에서 점프 유지 활공을 연습한다. 아래0~3000 연속 바닥과 기존 보스·보물·출구·체크포인트 ID는 유지했다. 떨어지면 안전한 바닥으로 돌아오며, 보석 없이 S10 진행 가능.
- 첫 발판의 `S09.featherPractice`는 이단 점프·활공·해제·안전 복귀 안내 대화다. `S09.nestGem`은 동료 대화 완료 `S09.reward`와 T03를 모두 요구하는 선택 보석이며 금화25를 기존 원자적 보상으로 한 번 지급한다. `S09.nestGem.reward`가 자동 저장 화이트리스트에 등록되며, 저장/재방문/재상호작용 시 추가0이다. 새 스키마·필수 아이템·필수 관문은 없다.
- 도달성 검사는 T03 표시가 있는 선택 발판만 이단 점프의 보수적 높이210px/간격260px로 검사한다. T03를 주는 보상과 필수 상호작용은 기본 점프 경로로 따로 검사해, 새 능력을 받기 전 위 발판을 강요하는 오류를 거부한다. 모든36구간의 기존 도달성 검사도 통과했다. 태그는 정적 도달성 조건이며 런타임의 실제 이단 점프는 기존 T03 보유 검사로 제한한다.
- 초기 3조건 E2E 통과 뒤 화면 검수에서 보석으로 재사용한 별 장치가 나침반처럼 보여, 자체 도형 SVG `public/assets/draft/nestGem.svg`(96×128, 투명)를 작성해 등록했다. 새 최종 웹툰 아트로 취급하지 않는다. 그림 생성 도구 실행 없음; 기존 원화·런타임638파일 바이트 보존. 보석은 최종 웹툰 교체 미완료다.
- 최종 정적 순서 **타입→린트→단위123개/27파일→콘텐츠36구간/24장면/7무기·7보물/8하트→빌드50모듈→용량 {budget['totalBytes']:,}/8,000,000B 모두 exit0**. `docs/validation/s09-nest-final-checks.json`과 6로그. 기존 Phaser500KB청크 경고 유지. 최초 일반 샌드박스 빌드는 Vite realpath EPERM으로 실패했으며 `s09-nest-build.txt`에 보존; 승인된 호스트 실행과 최종 빌드는 통과했다. 콘텐츠 통과는 등록·획득·도달성 그래프 검사이지 설계서 전체 일치 판정이 아니다.
- 최종 `npm run test:e2e -- tests/e2e/nest-practice.spec.ts tests/e2e/roc-mechanics.spec.ts tests/e2e/m3-opening.spec.ts --reporter=list,json,html` **8/8통과·exit0·{minutes}분**, skipped/flaky0. 신규 폰/태블릿 2조건은 실제 로크새 핵3회와 T03 대화 이후 이단 점프·첫 발판 착지·안내 대화·활공·보석25·새로고침·정상 재등반·중복0·안전 복귀를 확인했다. 태블릿은 CDP touchStart/touchCancel로 점프 유지/해제. 별도1조건은 보석을 건너뛴 S10 진입. 기존 S09 전투/활공/사망 재개/옛 저장4조건과 S09~S12 연속1조건도 통과. 모든 조건은 명시적 S09 저장 픽스처이며 새 게임 전체 완주로 취급하지 않는다.
- `docs/validation/s09-nest-e2e-final.json`, `s09-nest-e2e-final-output.txt`, `s09-nest-e2e-final-report/`에 실제 결과를 보존. 최종 화면44장은 `docs/screenshots/s09-nest/final/`(신규16 + 기존 회귀28); 대표 `s09-nest/phone-upper-nest.png`, `tablet-glide-crossing.png`, `phone-gem-collected.png`, `tablet-checkpoint-resume.png`, `tablet-safe-floor-return.png`. 크기·바이트·SHA는 `s09-nest-final-screenshots.json`. 첫 실행3통과/1.9분과 나침반 모양 교체 전16화면은 `s09-nest-e2e-first.json`, `docs/screenshots/s09-nest/first/`에 별도 보존했다.
- 검증 전후1005개 실제 소스·원본·런타임·빌드·검사 SHA256 일치(`s09-nest-final-runtime-hashes.json`). 의존성/lockfile과 이전 미디어638파일 보존. 고정 용량 보고서는 이번 실행본을 `s09-nest-art-budget.json`에 보존한 뒤 이전 바이트 복구. netstat 전체 인터페이스 5174/5175/9323 LISTENING 없음. 최종 diff·마무리 결과는 `s09-nest-final-diff-check.txt`, `s09-nest-finish.json` 참조.

**남은 문제/미검증:** 이번 변경 후 전체84개 E2E 및 새 게임36구간 재완주는 미검증(변경 범위의8조건으로 회귀; 이전 버전36구간 완주와 구별). 실제 폰/태블릿·iOS Safari·어린이 조작성·장시간FPS/발열·스피커는 미검증(Windows Edge 자동 키 입력/터치 이벤트). S26 동굴 박쥐5마리·제한 비행 경로와 S32 저주 구체4개 등 기존 설계 차이는 미완료. 새 보석 SVG와 기존 로크새 보석 색·전용 활공 자세 등 최종 아트 승인은 ART_DRAFT.

**다음 한 작업:** S26 동굴 적을 설계의 박쥐5마리로 연결하고 제한 비행 경로·기존 저장 호환성과 실제 플레이를 검증한다.
<!-- S09_NEST_STATUS_END -->
'''
status=root/'PROJECT_STATUS.md';text=status.read_text(encoding='utf-8');assert 'S09_NEST_STATUS_START' not in text
status.write_bytes(text.replace('# PROJECT_STATUS.md\n','# PROJECT_STATUS.md\n\n'+entry,1).encode('utf-8'))
play=root/'docs/PLAYTEST_LOG.md';text=play.read_text(encoding='utf-8');head,tail=text.split('\n',1)
play.write_bytes((head+f'\n\n## 2026-10-08 · S09 둥지 보석·깃털 연습\n\n최종 선택 E2E8/8통과({minutes}분): 신규 폰/태블릿 실제 보스 승리 뒤 이단 점프·활공·보석 획득·새로고침·재방문 중복0·안전 복귀2조건, 보석 건너뛰기1조건, 기존 전투·활공4조건, S09~S12연속1조건. 명시적 저장 픽스처이며 새 게임 완주와 구별한다. 단위123개 및 타입·린트·콘텐츠·빌드·용량 통과. 44화면과 실제 관측은 `docs/screenshots/s09-nest/final/`, 검사 결과는 `docs/validation/s09-nest-e2e-final.json`. 전체84개/36구간 재완주·실기기·어린이·성능은 미검증. ART_DRAFT·이번 동선은 로컬 변경.\n\n'+tail).encode('utf-8'))
for name in ('ART_PROMPTS.md','ASSET_REGISTER.md'):
    path=root/'docs'/name;text=path.read_text(encoding='utf-8');head,tail=text.split('\n',1)
    note='\n\n## 2026-10-08 · S09 둥지 선택 보석 · ART_DRAFT\n\n`public/assets/draft/nestGem.svg`: 96×128 투명 배경의 청록 보석과 작은 빛, 자체 작성 SVG 도형. 소스와 런타임은 동일 파일이며 `assets.manifest.ts`의 nestGem으로 등록했다. 외부 이미지·이미지 생성 도구·프롬프트 실행 없음. 프로젝트 사용·수정 가능. 최종 웹툰 교체는 미완료이며 간이 에셋 ART_DRAFT다. 기존 나침반 모양 별 장치 재사용은 화면 검수 뒤 이 보석으로 교체했고 첫 검증 화면도 보존했다. 첫 발판 안내에는 기존 prop-journal, 지형에는 기존 cloud 타일을 쓴다. 이전 원화/런타임638파일 바이트 보존. 최종 실제 폰/태블릿 화면은 `docs/screenshots/s09-nest/final/s09-nest/`, 검증·잔여 사항은 PROJECT_STATUS.md의 같은 날짜 기록 참조.\n\n'
    path.write_bytes((head+note+tail).encode('utf-8'))
print(json.dumps({'e2ePass':8,'screenshots':len(inventory),'mediaPreserved':638,'budget':budget['totalBytes'],'done':True}))
result=load(folder/'s09-nest-finish.json');gem=root/'public/assets/draft/nestGem.svg'
result.update(newAssetBytes=gem.stat().st_size,newAssetSha256=sha256(gem.read_bytes()).hexdigest())
dump(folder/'s09-nest-finish.json',result)
