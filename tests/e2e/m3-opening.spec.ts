import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';

const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
async function move(page:Page,x:number){
 const end=Date.now()+22000;
 for(;;){const state=await read(page);if(state.player&&Math.abs(state.player.x-x)<18)break;if(Date.now()>end)throw Error(`cannot reach ${x}: ${JSON.stringify(state)}`);if(!state.player){await page.waitForTimeout(50);continue;}const key=state.player.x<x?'d':'a';await page.keyboard.up(key==='d'?'a':'d');await page.keyboard.down(key);await page.waitForTimeout(55);}await page.keyboard.up('a');await page.keyboard.up('d');
}
async function objective(page:Page,x:number,id:string){await move(page,x);for(let attempt=0;attempt<4;attempt++){await page.keyboard.press('e');await page.waitForTimeout(160);if((await read(page)).save.completedObjectiveIds.includes(id))return;}throw Error(`objective ${id} did not activate`);}
async function fight(page:Page,id:string){
 for(let hit=0;hit<45;hit++){
  const state=await read(page);if(state.save.completedObjectiveIds.includes(id))return;
  const enemy=state.enemies.find((candidate:{id:string})=>candidate.id===id);if(!enemy)break;
  const dx=enemy.x-state.player.x;if(Math.abs(dx)>68)await move(page,enemy.x+(dx>0?-55:55));
  await page.keyboard.press('j');await page.waitForTimeout(430);
 }
 await expect.poll(async()=>(await read(page)).save.completedObjectiveIds.includes(id)).toBe(true);
}
async function gift(page:Page,stage:string,x=2480){await objective(page,x,`${stage}.reward`);await expect(page.getByTestId('dialogue-text')).toBeVisible();await page.getByRole('button',{name:'전체 생략'}).click();}
async function exitToNext(page:Page,x=2840){await move(page,x);await page.keyboard.press('e');await page.waitForTimeout(150);await page.keyboard.press('e');await page.getByRole('button',{name:'다음 스테이지'}).click();}

test('S09-S12 continuous route grants flight, W04 and R03 with save-safe bosses',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const save=freshSave();save.checkpoint={stageId:'S09',checkpointId:'start'};save.clearedStageIds=Array.from({length:8},(_,i)=>`S${String(i+1).padStart(2,'0')}`);save.weapons=['W01','W02','W03'];save.equippedWeapon='W03';save.treasures=['T01','T02'];save.relics=['R01','R02'];save.flags=['bubbleBlessing','genieCave'];save.equippedSkill='flamePulse';save.totalXp=420;
 await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(save)});await page.goto('/');await page.getByRole('button',{name:'이어하기 · S09'}).click();

 for(const [i,x] of [983,1445,1908].entries())await objective(page,x,`S09.quest.${i+1}`);await fight(page,'S09.enemy.3');await gift(page,'S09');expect((await read(page)).save.treasures).toContain('T03');await exitToNext(page);await expect.poll(async()=>(await read(page)).stage).toBe('S10');
 const y=(await read(page)).player.y;await page.keyboard.down('ArrowUp');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');expect((await read(page)).player.y).toBeLessThan(y-25);await page.keyboard.down('s');await page.waitForTimeout(520);await page.keyboard.up('s');await gift(page,'S10');expect((await read(page)).save.flags).toContain('flightJournal');await exitToNext(page);await expect.poll(async()=>(await read(page)).stage).toBe('S11');
 for(const [i,x] of [890,1260,1630,2000].entries())await objective(page,x,`S11.quest.${i+1}`);await fight(page,'S11.enemy.3');await gift(page,'S11');expect((await read(page)).save.weapons).toContain('W04');await exitToNext(page);await expect.poll(async()=>(await read(page)).stage).toBe('S12');
 for(const [i,x] of [983,1445,1908].entries())await objective(page,x,`S12.quest.${i+1}`);await fight(page,'S12.enemy.3');await gift(page,'S12');expect((await read(page)).save.relics).toContain('R03');await page.reload();await page.getByRole('button',{name:'이어하기 · S12'}).click();expect((await read(page)).save.relics).toContain('R03');expect(errors).toEqual([]);
});
