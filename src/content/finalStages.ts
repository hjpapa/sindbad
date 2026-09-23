import type {MapDef, ObjectDef, Platform, Spawn} from './maps';

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
 const needs=b.mode==='flight'?[]:[stepObjects.at(-1)!.id];
 const flightEnemyCount=b.id==='S10'?6:b.id==='S33'?5:0;
 const spawns:Spawn[]=flightEnemyCount
  ? Array.from({length:flightEnemyCount},(_,i)=>({id:`${b.id}.enemy.${i+1}`,x:900+i*((width-1450)/(flightEnemyCount-1)),y:[300,440,220,370,250,420][i],kind:'kite' as const,hp:26+Math.floor(index/5)}))
  : b.mode==='peace'?[]:[0,1,2].map(i=>({id:`${b.id}.enemy.${i+1}`,x:800+i*(width-1500)/2,y:550,kind:i===2&&b.boss?'boss':b.visual==='jungle'?'beast':'bandit',hp:i===2&&b.boss?150:40+index}));
 if(b.boss)needs.push(spawns.at(-1)!.id);
 const gift:ObjectDef={id:`${b.id}.reward`,x:width-520,y:550,kind:'gift',label:`${b.rewards?.join(' · ')||'항해 기록'} · E`,needs,rewards:b.rewards,rewardFlags:b.flags,dialogue:`${b.id}.outro`};
 const objects:ObjectDef[]=[{id:`${b.id}.intro`,x:230,y:550,kind:'npc',label:`${b.npc} · E`,dialogue:`${b.id}.intro`},...stepObjects];
 if(b.optional)objects.push({id:`${b.id}.golden`,x:Math.round(width*.62),y:470,kind:'golden',label:`숨은 황금 하트 ${b.optional} · E`,reward:b.optional,needs:[stepObjects[Math.min(1,stepObjects.length-1)].id]});
 objects.push(gift,{id:`${b.id}.exit`,x:width-160,y:550,kind:b.id==='S36'?'ending':'exit',label:b.id==='S36'?'새 항해의 종 · E':'다음 항해 · E',needs:[gift.id]});
 // Later story stages use an uninterrupted route so young players cannot be
 // trapped by the side of a decorative ledge. Visual depth lives in the
 // parallax background; handcrafted jump routes remain in S01-S08.
 const platforms:Platform[]=[ground(0,width)];
 const flightHazards=b.id==='S10'?
  [{id:'S10.gust.1',x:1150,y:455,radius:62,kind:'gust' as const},{id:'S10.gust.2',x:1680,y:300,radius:70,kind:'gust' as const},{id:'S10.gust.3',x:2210,y:170,radius:62,kind:'gust' as const}]:
  b.id==='S33'?[{id:'S33.debris.1',x:850,y:190,radius:48,kind:'debris' as const},{id:'S33.debris.2',x:1250,y:390,radius:48,kind:'debris' as const},{id:'S33.debris.3',x:1650,y:230,radius:48,kind:'debris' as const},{id:'S33.debris.4',x:2050,y:430,radius:48,kind:'debris' as const},{id:'S33.debris.5',x:2450,y:280,radius:48,kind:'debris' as const}]:undefined;
 return {id:b.id,width,theme:'adventure',visual:b.visual,mode:b.mode??'ground',peaceful:b.mode==='peace',objective:b.mode==='flight'?'↑ 상승 · ↓ 하강 → 오른쪽 착륙장 (고리·공중 적은 선택)':`${b.steps.join(' → ')}${b.boss?` → ${b.boss}`:''}`,platforms,spawns,objects,hearts:b.mode==='peace'?[]:[{id:`${b.id}.heart.1`,x:Math.round(width*.45),y:550},{id:`${b.id}.heart.2`,x:Math.round(width*.76),y:550,large:true}],checkpoints:[{id:'start',x:120,y:548},{id:'middle',x:Math.round(width*.52),y:548}],flightHazards};
};

export const finalMaps=Object.fromEntries(finalBlueprints.map((b,i)=>[b.id,makeMap(b,i)])) as Record<string,MapDef>;
export const finalDialogues=Object.fromEntries(finalBlueprints.flatMap(b=>[[`${b.id}.intro`,{name:b.npc,lines:b.intro}],[`${b.id}.outro`,{name:b.id==='S36'?'신밧드와 친구들':b.npc,lines:b.outro}]]));
