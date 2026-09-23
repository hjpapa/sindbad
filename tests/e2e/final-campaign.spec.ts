import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';

const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
async function walk(page:Page,x:number){
 const end=Date.now()+22000;
 for(;;){
  const state=await read(page);if(state.player&&Math.abs(state.player.x-x)<14)break;
  if(Date.now()>end)throw Error(`cannot reach ${x}: ${JSON.stringify(state)}`);
  if(!state.player){await page.waitForTimeout(50);continue;}
  const key=state.player.x<x?'d':'a';await page.keyboard.up(key==='d'?'a':'d');await page.keyboard.down(key);
  await page.waitForTimeout(55);
 }
 await page.keyboard.up('a');await page.keyboard.up('d');
 await expect.poll(async()=>!!(await read(page)).player?.grounded).toBe(true);
}
async function use(page:Page,x:number){await walk(page,x);await page.keyboard.press('e');await page.waitForTimeout(120);}
async function objective(page:Page,x:number,id:string){
 await walk(page,x);
 for(let attempt=0;attempt<4;attempt++){
  await page.keyboard.press('e');await page.waitForTimeout(160);
  if((await read(page)).save.completedObjectiveIds.includes(id))return;
 }
 throw Error(`objective ${id} did not activate: ${JSON.stringify(await read(page))}`);
}
async function load(page:Page,stageId:string,clearedCount:number){
 const save=freshSave();save.checkpoint={stageId,checkpointId:'start'};save.clearedStageIds=Array.from({length:clearedCount},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
 save.weapons=['W01','W02','W03','W04','W05','W06','W07'];save.treasures=['T01','T02','T03','T04','T05','T06','T07'];save.relics=['R01','R02','R03','R04','R05','R06'];save.flags=['bubbleBlessing','genieCave','flightJournal','upgradeShop','mayorArrested','crewRescued','captainKey','shadowDefeated','moonBridgeKey','indiaArrival','templePermission','kuuraSealed','arianaRescued','kingdomReturn','festivalUnlocked','wedding'];
 await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(save)});await page.goto('/');await page.getByRole('button',{name:`이어하기 · ${stageId}`}).click();
}

test('S28 peaceful balance grants lotus shield and persists',async({page})=>{
 await load(page,'S28',27);expect((await read(page)).enemies).toHaveLength(0);
 for(const [i,x] of [983,1445,1908].entries())await objective(page,x,`S28.quest.${i+1}`);
 await objective(page,2480,'S28.reward');await expect(page.getByTestId('dialogue-text')).toContainText('연꽃 방패');expect((await read(page)).save.treasures).toContain('T06');expect((await read(page)).save.equippedSkill).toBe('lotusShield');await page.getByRole('button',{name:'전체 생략'}).click();
 const hp=(await read(page)).player.hp;await page.keyboard.press('r');await page.waitForTimeout(100);expect((await read(page)).player.hp).toBe(hp);await page.reload();await page.getByRole('button',{name:'이어하기 · S28'}).click();expect((await read(page)).save.treasures).toContain('T06');
 await page.getByRole('button',{name:'가방과 지도'}).click();await expect(page.getByRole('button',{name:/영원의 불씨/})).toBeVisible();await expect(page.getByRole('button',{name:/균형의 연꽃/})).toBeVisible();await page.getByRole('button',{name:/영원의 불씨/}).click();expect((await read(page)).save.equippedSkill).toBe('flamePulse');await page.getByRole('button',{name:/균형의 연꽃/}).click();expect((await read(page)).save.equippedSkill).toBe('lotusShield');await page.getByRole('button',{name:'현재 모험으로'}).click();await expect(page.getByRole('button',{name:'터치 행동'})).toBeVisible();const mp=(await read(page)).mp;await page.keyboard.press('r');await expect.poll(async()=>(await read(page)).mp).toBe(mp-15);
});

test('S36 museum route reaches ending and remains revisit-able',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await load(page,'S36',35);
 for(const [i,x] of [890,1260,1630,2000].entries())await objective(page,x,`S36.quest.${i+1}`);
 await objective(page,2480,'S36.reward');await expect(page.getByTestId('dialogue-text')).toContainText('새로운 항해');await page.getByRole('button',{name:'전체 생략'}).click();await use(page,2840);await page.keyboard.press('e');
 await expect(page.getByRole('heading',{name:/함께 여는 새로운 항해/})).toBeVisible();expect((await read(page)).save.flags).toContain('ending');expect((await read(page)).save.clearedStageIds).toContain('S36');await page.screenshot({path:info.outputPath('S36-ending.png')});expect(errors).toEqual([]);
});

test('S09-S36 all boot as browser-playable scenes without console errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
 await page.goto('/');
 for(let n=9;n<=36;n++){
  const stageId=`S${String(n).padStart(2,'0')}`;
  const save=freshSave();save.checkpoint={stageId,checkpointId:'start'};save.clearedStageIds=Array.from({length:n-1},(_,i)=>`S${String(i+1).padStart(2,'0')}`);save.weapons=['W01','W02','W03','W04','W05','W06','W07'];save.treasures=['T01','T02','T03','T04','T05','T06','T07'];save.flags=['bubbleBlessing','genieCave','flightJournal','upgradeShop','mayorArrested','crewRescued','captainKey','shadowDefeated','moonBridgeKey','indiaArrival','templePermission','kuuraSealed','arianaRescued','kingdomReturn','festivalUnlocked','wedding'];
  await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(save)});await page.reload();await page.getByRole('button',{name:`이어하기 · ${stageId}`}).click();await expect.poll(async()=>(await read(page)).stage).toBe(stageId);
 }
 expect(errors).toEqual([]);
});
