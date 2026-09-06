// One-time/explicit catalog update from the authoritative design, never a map generator.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const spec = readFileSync('SINBAD_GAME_SPEC.md', 'utf8');
const cards = [...spec.matchAll(/### (S\d{2})\. (.+)\r?\n([\s\S]*?)(?=\r?\n### S|\r?\n## 제|\r?\n# 10\.)/g)];
const refs = ['1','2','3','','4','5','6','7','8','8','','9','10','11','','12','13','13','14','15a','15b','16','','17','18','','19','19','','','14','20','','21','22','23'];
const items = { W01:1,W02:2,W03:6,W04:11,W05:16,W06:25,W07:30,T01:6,T02:8,T03:9,T04:16,T05:25,T06:28,T07:29,R01:1,R02:3,R03:12,R04:15,R05:18,R06:22,R07:32,G01:4,G02:5,G03:11,G04:15,G05:18,G06:22,G07:26,G08:29 };
const extraFlags = {5:['bubbleBlessing'],7:['genieCave'],10:['flightJournal'],13:['upgradeShop'],14:['mayorArrested'],17:['crewRescued','captainKey'],19:['shadowDefeated'],24:['moonBridgeKey'],26:['indiaArrival'],27:['templePermission'],31:['kuuraSealed'],32:['arianaRescued'],33:['kingdomReturn'],34:['festivalUnlocked'],35:['wedding'],36:['ending']};
const catalog=cards.map(([,_id,title,body],i)=>{
 const n=i+1;
 const field=(name)=>body.match(new RegExp('\\*\\*'+name+'\\*\\*: (.+)'))?.[1]??'';
 const entry=field('유형').split('**선행 보유**: ')[1]??'';
 return {id:_id,title,chapter:n<=5?1:n<=10?2:n<=15?3:n<=19?4:n<=25?5:n<=29?6:7,childSceneRefs:refs[i]?[refs[i]]:[],status:n<=3?'implemented':'planned',artStatus:n<=3?'draft':'missing',nextStageId:n===36?null:`S${String(n+1).padStart(2,'0')}`,entryItems:entry.match(/[WT]\d{2}/g)??[],entryFlags:entry.includes('bubbleBlessing')?['bubbleBlessing']:[],rewardId:`${_id}.firstClear`,clearXp:40+4*i,mandatoryItems:Object.entries(items).filter(([id,s])=>s===n&&!id.startsWith('G')&&id!=='R01').map(([id])=>id),optionalItems:Object.entries(items).filter(([id,s])=>s===n&&(id.startsWith('G')||id==='R01')).map(([id])=>id),rewardFlags:extraFlags[n]??[],flow:field('플레이 흐름'),clearDescription:field('완료 조건'),rewardDescription:field('필수 보상·진행'),optionalDescription:field('선택 보물·탐험'),safety:field('체크포인트·막힘 방지')};
});
if(catalog.length!==36)throw Error('Expected 36 stage cards');
mkdirSync('src/content',{recursive:true});
writeFileSync('src/content/campaign.json',JSON.stringify(catalog,null,2)+'\n');
