import type {MapDef, ObjectDef, Platform, Spawn} from './maps';
import {storyDevices,storyLedges} from './storyDesign';

interface Blueprint {
  id:string; visual:NonNullable<MapDef['visual']>; mode?:MapDef['mode']; title:string;
  steps:string[]; rewards?:string[]; flags?:string[]; optional?:string;
  boss?:string; npc:string; intro:string[]; outro:string[];
}

export const finalBlueprints:Blueprint[]=[
 {id:'S09',visual:'sky',title:'로크새 둥지',steps:['둥지 봉인 ①','둥지 봉인 ②','둥지 봉인 ③'],rewards:['T03'],boss:'저주받은 로크새',npc:'어린 로크',intro:['몸이 아니라 검은 저주의 핵을 깨뜨려 주세요.','세 봉인을 풀면 로크새의 마음이 돌아올 거예요.'],outro:['하늘 깃털 T03이 바람을 기억했어요.','공중에서 ↑ 점프를 한 번 더 누르면 이단 점프를 할 수 있어요.']},
 {id:'S10',visual:'sky',mode:'flight',title:'구름 고리',steps:['구름 고리 ①','구름 고리 ②','구름 고리 ③'],flags:['flightJournal'],npc:'바람 안내자',intro:['신밧드: 좋아, 이번에는 네가 선장이야!','↑로 상승, ↓로 하강해요. 선택 고리를 통과하면 금화를 얻고, 오른쪽 착륙장으로 가면 돼요.','공중 연은 피하거나 Space 날개 공격으로 저주를 풀 수 있어요.'],outro:['첫 비행 기록을 항해 일지에 남겼어요.','구름 위에서 찾은 길은 다음 귀환 항로가 되었어요.']},
 {id:'S11',visual:'volcano',title:'화산 능선',steps:['반사석 ①','반사석 ②','반사석 ③','상승 기류'],rewards:['W04'],optional:'G03',boss:'용암 수호자',npc:'불꽃 광부',intro:['반사석 세 개로 용암빛을 돌려 주세요.','상승 기류를 타면 수호자의 저주 핵에 닿을 수 있어요.'],outro:['태양 활 W04가 깨어났어요. 멀리 있는 표적을 안전하게 맞힐 수 있어요.']},
 {id:'S12',visual:'volcano',title:'독 안개의 용',steps:['독 분출구 ①','독 분출구 ②','바람 정화 장치'],rewards:['R03'],boss:'독 안개의 용',npc:'산길 약초사',intro:['분출구를 닫아 독 안개부터 걷어 주세요.','용도 저주에 사로잡혔어요. 빛으로 돌려보내요.'],outro:['독을 줄이는 바람 부적 R03을 얻었어요.']},
 {id:'S13',visual:'village',mode:'peace',title:'집으로',steps:['목재 꾸러미 ①','목재 꾸러미 ②','목재 꾸러미 ③','하미드와 인사','마진과 인사'],flags:['upgradeShop'],npc:'어머니',intro:['긴 항해 뒤에는 집을 돌보는 시간도 필요하단다.','목재를 모아 침상을 고치고 친구들과 인사하렴.'],outro:['집의 침상과 무기 강화 상점이 열렸어요. 체력과 마력이 모두 회복됐어요.']},
 {id:'S14',visual:'village',title:'거짓 누명',steps:['증거 ① 장부','증거 ② 인장','증거 ③ 편지','감옥 열쇠'],flags:['mayorArrested'],boss:'부패한 경비대장',npc:'시장 주민',intro:['사라진 시장의 누명을 벗길 증거가 필요해요.','경비병은 쓰러지면 항복하고 더 싸우지 않아요.'],outro:['증거가 공개되고 시장이 풀려났어요.']},
 {id:'S15',visual:'warehouse',title:'거인의 창고',steps:['선원 구출 ①','도르래 ①','선원 구출 ②','도르래 ②'],rewards:['R04'],optional:'G04',npc:'창고지기',intro:['거인은 배경에서 상자를 옮길 뿐이에요.','두 선원을 구하고 도르래로 출구를 여세요.'],outro:['무거운 충격을 줄이는 거인 가죽 조각 R04를 얻었어요.']},
 {id:'S16',visual:'ocean',mode:'swim',title:'진주의 궁전',steps:['조개 문양 ①','조개 문양 ②','조개 문양 ③','수영 훈련 고리'],rewards:['W05','T04'],boss:'진주 수호령',npc:'나이라',intro:['공기방울이 궁전 입구까지 안전하게 데려왔어요.','조개 문양을 순서대로 밝히면 진주가 자유 수영을 가르쳐 줄 거예요.'],outro:['바다의 진주 T04와 산호 삼지창 W05를 얻었어요.','물속에서 위아래로 자유롭게 헤엄칠 수 있어요.']},
 {id:'S17',visual:'ocean',mode:'swim',title:'침몰선 감옥',steps:['포로 구출 ①','포로 구출 ②','포로 구출 ③','선장실 열쇠'],flags:['crewRescued','captainKey'],npc:'갇힌 선원',intro:['침몰선 안의 세 선원을 먼저 구해요.','선장실 열쇠는 마지막 철창 뒤에 있어요.'],outro:['선원들과 선장실 열쇠를 모두 확보했어요.']},
 {id:'S18',visual:'pirate',title:'해적선의 밤',steps:['돛대 밧줄','화약고 봉인','선장실 문'],rewards:['R05'],optional:'G05',boss:'해적 선장',npc:'항복한 해적',intro:['화약고를 봉인해 모두를 안전하게 해요.','선장은 패배하면 항복할 거예요.'],outro:['해적 선장이 항복하고 항해 나침반 R05를 건넸어요.']},
 {id:'S19',visual:'shadow',title:'그림자 계단',steps:['진짜 계단 표식 ①','진짜 계단 표식 ②','진짜 계단 표식 ③'],flags:['shadowDefeated'],boss:'신밧드의 그림자',npc:'수정구슬의 목소리',intro:['가짜 계단은 수정구슬 앞에서 흐려져요.','내 그림자는 공격 예고와 회피까지 따라 해요.'],outro:['그림자가 빛과 연기로 사라졌어요.']},
 {id:'S20',visual:'jungle',title:'밀림 야영지',steps:['덩굴 길 ①','길 표식 ①','길 표식 ②','길 표식 ③','안전 야영지'],npc:'탐험가 미라',intro:['덩굴을 태우고 길 표식 세 개를 남겨요.','마지막 야영지는 다음 원정의 안전 지점이에요.'],outro:['밀림의 안전한 길이 지도에 기록됐어요.']},
 {id:'S21',visual:'jungle',title:'뱀의 신전',steps:['돌기둥 ①','돌기둥 ②','돌기둥 ③'],boss:'저주받은 큰뱀',npc:'신전 기록관',intro:['세 돌기둥을 바로 세우면 저주의 근원이 보여요.','뱀을 해치지 말고 검은 마법만 끊어 주세요.'],outro:['큰뱀이 저주에서 풀려 숲으로 돌아갔어요.']},
 {id:'S22',visual:'jungle',title:'호랑이 계곡',steps:['바위 북 ①','바위 북 ②','달빛 표식'],rewards:['R06'],optional:'G06',boss:'저주받은 호랑이',npc:'숲 지킴이',intro:['바위 북의 박자로 호랑이를 진정시켜요.','공격 예고 뒤 드러나는 저주 표식을 노리세요.'],outro:['호랑이가 숲으로 돌아가고 달빛 발톱 R06을 남겼어요.']},
 {id:'S23',visual:'temple',title:'느려진 시간',steps:['시간 종 ①','시간 종 ②','시간 종 ③'],npc:'시간의 기록자',intro:['저주가 움직임을 느리게 만들고 있어요.','세 종을 울리면 정상 시간이 돌아와요.'],outro:['멈춰 있던 신전의 시간이 다시 흐르기 시작했어요.']},
 {id:'S24',visual:'temple',title:'달의 문',steps:['달 스위치 ①','달 스위치 ②'],flags:['moonBridgeKey'],boss:'달빛 석상',npc:'문지기 조각상',intro:['두 스위치를 함께 밝히면 석상의 저주 핵이 열려요.','석상은 부서지지 않고 원래 자리로 돌아갈 거예요.'],outro:['달다리 열쇠가 빛나기 시작했어요.']},
 {id:'S25',visual:'temple',title:'달빛 다리',steps:['도깨비불 ①','도깨비불 ②','도깨비불 ③','달다리 시험'],rewards:['W06','T05'],npc:'달빛 정령',intro:['세 도깨비불을 제자리로 안내해 주세요.','달빛 연꽃은 12초 동안 다리를 만들고, 다리 위에 서면 시간이 유지돼요.'],outro:['달빛 연꽃 T05와 달의 망치 W06을 얻었어요.']},
 {id:'S26',visual:'ocean',mode:'swim',title:'인도로 가는 물길',steps:['달빛 다리 시험','물길 장치 ②','항구 표식'],flags:['indiaArrival'],optional:'G07',npc:'뗏목 사공',intro:['진주의 힘으로 뗏목 주변 물길 장치를 고쳐요.','연꽃 다리가 빠른 길도 만들어 줄 거예요.'],outro:['인도의 항구에 무사히 도착했어요.']},
 {id:'S27',visual:'village',title:'미라의 시장',steps:['상자 운반 ①','상자 운반 ②','상자 운반 ③','미라의 추천서'],flags:['templePermission'],npc:'미라',intro:['시장 사람들의 상자를 옮겨 주세요.','밖의 도적은 항복시키고 신전 추천서를 받을 수 있어요.'],outro:['미라가 신전 출입 추천서를 써 주었어요.']},
 {id:'S28',visual:'garden',mode:'peace',title:'연꽃 정원',steps:['균형 추 ①','균형 추 ②','균형 추 ③'],rewards:['T06'],npc:'정원 관리인',intro:['이곳에는 싸움이 없어요.','세 균형 장치를 맞추면 연꽃 방패가 피어날 거예요.'],outro:['연꽃 방패 T06을 얻었어요. R로 잠시 피해를 막을 수 있어요.']},
 {id:'S29',visual:'jungle',title:'코끼리 구조',steps:['함정 해제 ①','함정 해제 ②','함정 해제 ③','함정 해제 ④','아기 코끼리 구조'],rewards:['T07'],optional:'G08',npc:'어미 코끼리',intro:['네 개의 함정을 차례로 풀어 주세요.','동물은 공격하지 않고 저주 장치만 없애요.'],outro:['새벽 별 T07이 구조의 빛에 응답했어요.']},
 {id:'S30',visual:'tower',title:'일곱 보물의 방',steps:['보물 받침 ①','보물 받침 ②','보물 받침 ③','보물 받침 ④','보물 받침 ⑤','보물 받침 ⑥','보물 받침 ⑦'],rewards:['W07'],npc:'별의 기록자',intro:['일곱 보물을 받침에 비춰 길을 여세요.','보물은 바치는 것이 아니니 모두 그대로 간직해요.'],outro:['일곱 빛이 합쳐져 별빛 쌍검 W07을 만들었어요.']},
 {id:'S31',visual:'tower',title:'쿠우라의 봉인',steps:['탑의 봉인 ①','탑의 봉인 ②','아리아나의 결계'],flags:['kuuraSealed'],boss:'마법사 쿠우라',npc:'아리아나의 목소리',intro:['두 봉인을 풀면 쿠우라의 저주 핵이 드러나요.','일곱 보물의 빛으로 검은 마법을 봉인해요.'],outro:['쿠우라의 마법이 봉인되고 탑에 아침빛이 들어왔어요.']},
 {id:'S32',visual:'tower',title:'별의 감옥',steps:['별자리 ①','별자리 ②','별자리 ③','아리아나 구출'],rewards:['R07'],flags:['arianaRescued'],npc:'아리아나',intro:['별자리 세 개를 함께 맞춰 주세요.','마지막 문은 두 사람의 빛이 만나야 열려요.'],outro:['아리아나를 구하고 별의 약속 R07을 얻었어요.']},
 {id:'S33',visual:'sky',mode:'flight',title:'왕국으로',steps:['귀환 고리 ①','귀환 고리 ②','귀환 고리 ③'],flags:['kingdomReturn'],npc:'아리아나와 로크새',intro:['아리아나: 내가 그린 지도에 없던 길이네요.','신밧드: 그럼 함께 새로 그리면 되겠네요.','↑로 상승, ↓로 하강해요. 낙하 파편의 빈 길을 찾고, 고리는 놓쳐도 괜찮아요.'],outro:['아리아나가 새 귀환 항로를 지도에 그렸어요.','왕국의 등대가 보이기 시작했어요.']},
 {id:'S34',visual:'kingdom',mode:'peace',title:'왕에게 보내는 편지',steps:['항해 지도 정리','일곱 보물 기록','왕에게 편지 전달'],flags:['festivalUnlocked'],npc:'왕',intro:['모험의 지도와 보물 기록을 정리해 주세요.','완성한 편지를 왕에게 전달하면 축제가 열려요.'],outro:['왕국의 귀환 축제가 열렸어요.']},
 {id:'S35',visual:'kingdom',mode:'peace',title:'약속의 축제',steps:['등불 준비','음악 준비','항해 깃발 준비'],flags:['wedding'],npc:'아리아나',intro:['세 가지 축제 준비를 친구들과 마쳐요.','모두가 기다린 약속의 날이에요.'],outro:['신밧드와 아리아나가 바다 앞에서 약속을 나눴어요.']},
 {id:'S36',visual:'kingdom',mode:'peace',title:'새 항해의 아침',steps:['도서관 전시 ①','도서관 전시 ②','항구 전시 ③','새 항해의 종'],flags:['ending'],npc:'이야기꾼',intro:['완성한 항해 기록을 도서관과 항구에서 돌아봐요.','마지막 종을 울려도 모든 스테이지를 다시 방문할 수 있어요.'],outro:['일곱 보물과 바다의 약속. 새로운 항해가 시작됩니다.']},
];

// Keep stable quest/reward IDs while restoring the original story identities.
const storyCorrections:Record<string,Partial<Blueprint>>={
 S11:{visual:'shadow',title:'다이아몬드 골짜기',npc:'골짜기의 탐험가',boss:'수정 수호령',intro:['다이아몬드 골짜기의 세 반사석을 표시된 방향으로 돌려 주세요.','상승 기류를 안정시키고 수정 수호령의 저주 핵을 빛으로 돌려보내요.'],steps:['반사석 ①','반사석 ②','반사석 ③','안전 상승 기류'],outro:['폭풍의 창 W04를 찾았어요. 긴 사거리로 저주를 밀어낼 수 있어요.']},
 S12:{visual:'jungle',title:'포이즌 드래곤의 습지',boss:'포이즌 드래곤',outro:['해독의 잎 R03을 얻었어요. 독으로부터 모험가를 지켜 줘요.']},
 S13:{title:'두 친구의 집',npc:'하미드와 마진',intro:['하미드: 오늘은 여기서 쉬어 가게. 나무를 지붕 아래로 옮겨 줄 수 있겠나?','마진: 따뜻한 식사를 준비할게. 행동으로 나무를 들고 빛나는 위치에 내려놓아 줘.']},
 S14:{title:'거짓 촌장의 비밀 창고',npc:'경비대장',boss:undefined,steps:['빼돌린 물품 장부','검은 표식','감금 열쇠와 주민 구출','경비대에 증거 전달'],outro:['경비대가 증거를 확인하고 거짓 촌장을 정식으로 체포했어요.','구한 주민이 거인의 섬 항로를 알려 주었어요.']},
 S15:{intro:['거인 요리사의 국자 증기는 1.2초 동안 위치를 예고해요. 옆으로 피하거나 점프하세요.','선원 두 명을 구하고 도르래 두 개를 움직여 탈출 뗏목을 내려요.'],title:'거인의 부엌',outro:['선원들이 뗏목으로 탈출했어요. 거인의 장화 R04를 얻었어요.']},
 S16:{boss:undefined,npc:'나이라',outro:['나이라: 이번에는 제가 당신의 모험을 도울 차례예요.','심해의 진주 T04와 파도의 활 W05를 얻었어요. 이제 위아래로 자유 수영을 연습하세요.']},
 S18:{boss:'해적 선장 카딘',outro:['카딘: 보물보다 부하들이 먼저다. 그만 싸우겠어.','해적의 보물 지도 R05를 받았어요. 검은 탑의 항로가 표시되어 있어요.']},
 S19:{intro:['수정구슬로 진짜 계단 표식을 찾으세요.','쿠우라의 분신이 길을 막고 있어요. 예고된 마법을 피해 빛으로 봉인해요.'],boss:'쿠우라의 그림자 분신',outro:['쿠우라의 분신: 그림자 하나를 이겼을 뿐이다!','신밧드: 그렇다면 이제 진짜 길을 찾겠어. 분신 승리는 저장되었고, 최종 쿠우라는 S31에 있어요.']},
 S22:{outro:['호랑이의 검은 저주 띠가 빛으로 풀렸어요. 숲의 휘장 R06을 얻었어요.']},
 S23:{title:'바다 노인의 저주',npc:'수정구슬의 목소리',intro:['신밧드: 무거워졌지만 길은 남아 있어. 저 종소리를 이어 보자.','맑은 종 세 개를 울리면 어깨에 붙은 마법 그림자와 느려짐이 풀려요.']},
 S24:{boss:'외눈 돌 괴물'},
 S25:{npc:'도깨비 바루',outro:['바루: 길이 없으면 만들면 되지! 대신 약속은 꼭 지켜.','도깨비의 방울 T05와 달빛 방망이 W06을 얻었어요. 마지막 다리를 밝혀 보세요.']},
 S28:{npc:'비슈누의 평온한 환영',intro:['미라: 이곳에서는 비슈누를 세상의 질서를 지키는 신으로 믿어요.','연꽃·소라·원형 문양의 표시된 방향을 맞추세요. 이곳에는 전투가 없어요.'],outro:['환영: 힘을 모으되, 지킬 대상을 잊지 말아라.','이 대사는 게임의 창작 이야기예요. 균형의 연꽃 T06의 보호막을 얻었어요.']},
 S30:{npc:'지니 하질',outro:['보물은 빛나는 물건이 아니라, 네가 배운 방법들이기도 하지.','새벽의 검 W07을 얻었어요. 일곱 보물은 소모되지 않고 그대로 남아 있어요.']},
 S32:{intro:['아리아나: 안쪽의 문양은 내가 맞출게요. 바깥의 별을 →, ←, ↓ 순서로 연결해 줘요!','신밧드: 좋아요. 이번 길은 함께 여는 거예요.'],outro:['두 사람의 빛으로 마지막 봉인을 열었어요. 아리아나가 함께 발코니로 나왔어요.','우정의 매듭 R07은 동행 구간에서 20초마다 체력을 10 회복해요.']},
 S35:{intro:['귀환 뒤 시간이 흐르고, 두 성인은 스스로 함께할 미래를 선택했어요.','친구들과 초대장·음악·등불을 준비해요.'],outro:['신밧드: 다음 모험도 당신과 함께하고 싶어요.','아리아나: 나도 같은 마음이에요.','왕: 두 사람의 약속을 축복하노라.','두 사람은 왕의 축복 속에 결혼하고 항해 도서관을 함께 열었어요.']},
 S36:{outro:['아리아나: 이번 지도에는 우리가 도운 친구들도 표시해요.','신밧드: 가장 값진 보물은 함께 돌아온 이야기였군요.','일곱 보물과 바다의 약속. 새로운 항해가 시작됩니다.']},
};
for(const blueprint of finalBlueprints)Object.assign(blueprint,storyCorrections[blueprint.id]);

const ground=(x:number,w:number,y=608):Platform=>({x,y,w,h:112,requiredGround:true});
const makeMap=(b:Blueprint,index:number):MapDef=>{
 const width=Math.max(3000,1900+b.steps.length*270);
 const stepGap=(width-1150)/(b.steps.length+1);
 const stepObjects:ObjectDef[]=b.steps.map((label,i)=>({id:`${b.id}.quest.${i+1}`,x:520+stepGap*(i+1),y:550,kind:b.id==='S26'&&i===0?'bridge':'quest',label:`${label} · E`,needs:i?[`${b.id}.quest.${i}`]:undefined}));
 if(b.mode==='flight'){
   if(b.id==='S33')for(let i=4;i<=5;i++)stepObjects.push({id:`${b.id}.quest.${i}`,x:0,y:0,kind:'quest',label:`귀환 고리 ${i}`});
   stepObjects.forEach((ring,i)=>{
     ring.x=700+i*(1500/(stepObjects.length-1));
     ring.y=[360,210,390,240,360][i];
     ring.flightRing=true;ring.needs=undefined;
     ring.label=`선택 고리 ${i+1}/${stepObjects.length}`;
     if(b.id==='S10')ring.reward='coins';
   });
 }
 stepObjects.forEach((object,i)=>{object.mechanic=storyDevices[b.id]?.[i];if(object.mechanic?.type==='treasure')object.requiresItems=[object.mechanic.item];});
 if(b.id==='S26')stepObjects[0].mechanic=undefined;
 if(b.id==='S30')stepObjects.forEach((object,i)=>{object.requiresItems=[`T0${i+1}`];});
 if(b.id==='S25')stepObjects[3].requiresItems=['T05'];
 if(b.id==='S16')stepObjects[3].requiresItems=['T04'];
 const needs=b.mode==='flight'?[]:[stepObjects.at(-1)!.id];
 if(b.id==='S16')needs.splice(0,needs.length,stepObjects[2].id);
 if(b.id==='S25')needs.splice(0,needs.length,stepObjects[2].id);
 const flightEnemyCount=b.id==='S10'?6:b.id==='S33'?5:0;
 const spawns:Spawn[]=flightEnemyCount
  ? Array.from({length:flightEnemyCount},(_,i)=>({id:`${b.id}.enemy.${i+1}`,x:900+i*((width-1450)/(flightEnemyCount-1)),y:[300,440,220,370,250,420][i],kind:'kite' as const,hp:26+Math.floor(index/5)}))
  : b.mode==='peace'?[]:[0,1,2].map(i=>({id:`${b.id}.enemy.${i+1}`,x:800+i*(width-1500)/2,y:550,kind:i===2&&b.boss?'boss':b.visual==='jungle'?'beast':'bandit',hp:i===2&&b.boss?150:40+index}));
 if(b.id==='S16')spawns.splice(0); // Protected palace, no boss before swimming.
 if(b.boss&&spawns.length)needs.push(spawns.at(-1)!.id);
 const bossTextures:Record<string,string>={S09:'roc',S12:'dragon',S18:'pirateCaptain',S19:'kuura-webtoon',S21:'snake',S22:'tiger',S24:'stoneGiant',S31:'kuura-webtoon'};
 for(const spawn of spawns)if(spawn.kind==='boss'){spawn.name=b.boss;spawn.texture=bossTextures[b.id];}
 if(b.id==='S32')spawns.forEach(spawn=>{spawn.kind='spirit';spawn.texture='spirit';});
 const bossFrames:Record<string,number>={S12:3,S18:4,S21:0,S22:1,S24:2};
 for(const spawn of spawns)if(spawn.kind==='boss'&&b.id in bossFrames){spawn.texture='enemy-atlas';spawn.frame=bossFrames[b.id];}
 if(b.id==='S31')spawns.at(-1)!.hp=900;
 const gift:ObjectDef={id:`${b.id}.reward`,x:width-520,y:550,kind:'gift',label:`${b.rewards?.join(' · ')||'항해 기록'} · E`,needs,rewards:b.rewards,rewardFlags:b.flags,dialogue:`${b.id}.outro`};
 if(b.id==='S16'||b.id==='S25'){gift.x=stepObjects[2].x+140;stepObjects[3].needs=[gift.id];}
 const objects:ObjectDef[]=[{id:`${b.id}.intro`,x:230,y:550,kind:'npc',label:`${b.npc} · E`,dialogue:`${b.id}.intro`},...stepObjects];
 if(b.optional)objects.push({id:`${b.id}.golden`,x:Math.round(width*.62),y:470,kind:'golden',label:`숨은 황금 하트 ${b.optional} · E`,reward:b.optional,needs:[stepObjects[Math.min(1,stepObjects.length-1)].id]});
 const npcTextures:Record<string,string>={S09:'roc',S10:'roc',S11:'villager-webtoon',S12:'villager-webtoon',S13:'villager-webtoon',S14:'villager-webtoon',S15:'villager-webtoon',S16:'naira-webtoon',S17:'villager-webtoon',S18:'pirateCaptain',S19:'starMap',S20:'mira-webtoon',S21:'snake',S22:'tiger',S23:'starMap',S24:'stoneGiant',S25:'baru-webtoon',S26:'naira-webtoon',S27:'mira-webtoon',S28:'lotusShrine',S29:'elephant',S30:'genie-webtoon',S31:'starMap',S32:'ariana-webtoon',S34:'king-webtoon',S35:'ariana-webtoon',S36:'ariana-webtoon'};
 objects[0].texture=npcTextures[b.id];
 for(const object of stepObjects)object.texture=object.mechanic?.type==='carry'?'cargo':object.mechanic?.type==='rotate'?'starDevice':object.mechanic?.type==='memory'?'journal':object.mechanic?.type==='treasure'?'treasureAltar':'lantern';
 if(b.id==='S29'){stepObjects.at(-1)!.texture='elephant-webtoon';objects[0].texture='elephant-webtoon';}
 objects.push(gift,{id:`${b.id}.exit`,x:width-160,y:550,kind:b.id==='S36'?'ending':'exit',label:b.id==='S36'?'새 항해의 종 · E':'다음 항해 · E',needs:[gift.id,...(b.id==='S16'||b.id==='S25'?[stepObjects[3].id]:[])]});
 if(b.id==='S35')gift.texture='king-webtoon';
 if(b.id==='S25')objects.push({id:'S25.moonRock',x:width-270,y:550,kind:'chest',texture:'moonRock',breakWeapon:'W06',label:'금 간 달빛 바위 · 방망이 공격',reward:'coins'});
 if(b.mode!=='flight')objects.push({id:`${b.id}.cp.middle`,kind:'checkpoint',x:Math.round(width*.52),y:550,label:'안전 쉼터'});
 // Later story stages use an uninterrupted route so young players cannot be
 // trapped by the side of a decorative ledge. Visual depth lives in the
 // parallax background; handcrafted jump routes remain in S01-S08.
 const platforms:Platform[]=[ground(0,width),...(storyLedges[b.id]??[]).map(([x,y,w])=>({x,y,w,h:24,oneWay:true}))];
 const flightHazards=b.id==='S10'?
  [{id:'S10.gust.1',x:1150,y:455,radius:62,kind:'gust' as const},{id:'S10.gust.2',x:1680,y:300,radius:70,kind:'gust' as const},{id:'S10.gust.3',x:2210,y:170,radius:62,kind:'gust' as const}]:
  b.id==='S33'?[{id:'S33.debris.1',x:850,y:190,radius:48,kind:'debris' as const},{id:'S33.debris.2',x:1250,y:390,radius:48,kind:'debris' as const},{id:'S33.debris.3',x:1650,y:230,radius:48,kind:'debris' as const},{id:'S33.debris.4',x:2050,y:430,radius:48,kind:'debris' as const},{id:'S33.debris.5',x:2450,y:280,radius:48,kind:'debris' as const}]:undefined;
 if(b.id==='S16')stepObjects[3].y=350;
 return {id:b.id,width,theme:'adventure',visual:b.visual,mode:b.mode??'ground',peaceful:b.mode==='peace'||b.id==='S16',objective:b.mode==='flight'?'↑ 상승 · ↓ 하강 → 오른쪽 착륙장 (고리·공중 적은 선택)':`${b.steps.join(' → ')}${b.boss?` → ${b.boss}`:''}`,platforms,spawns,objects,hearts:b.mode==='peace'?[]:[{id:`${b.id}.heart.1`,x:Math.round(width*.45),y:550},{id:`${b.id}.heart.2`,x:Math.round(width*.76),y:550,large:true}],checkpoints:[{id:'start',x:120,y:548},{id:'middle',x:Math.round(width*.52),y:548}],flightHazards};
};

export const finalMaps=Object.fromEntries(finalBlueprints.map((b,i)=>[b.id,makeMap(b,i)])) as Record<string,MapDef>;
export const finalDialogues=Object.fromEntries(finalBlueprints.flatMap(b=>[[`${b.id}.intro`,{name:b.npc,lines:b.intro}],[`${b.id}.outro`,{name:b.id==='S36'?'신밧드와 친구들':b.npc,lines:b.outro}]]));
finalMaps.S12.plantHazards=finalMaps.S12.objects.filter(object=>['S12.quest.1','S12.quest.2'].includes(object.id)).map(object=>({x:object.x-80,w:160,kind:'poison',clearedBy:object.id}));
for(const id of ['S20','S21','S22','S29'])finalMaps[id].plantHazards=[{x:1350,w:160,kind:'vine'}];
