import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
async function fly(page:Page,axis:'x'|'y',target:number){
  const deadline=Date.now()+20000;
  while(Date.now()<deadline){
    const value=(await read(page)).player[axis];
    if(Math.abs(value-target)<15)break;
    const key=axis==='x'?(value<target?'ArrowRight':'ArrowLeft'):(value<target?'ArrowDown':'ArrowUp');
    await page.keyboard.down(key);await page.waitForTimeout(50);await page.keyboard.up(key);
  }
  expect(Math.abs((await read(page)).player[axis]-target)).toBeLessThan(25);
}
test('flight rings collect through movement once, persist, and never gate landing',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const save=freshSave();save.checkpoint={stageId:'S10',checkpointId:'start'};
  save.clearedStageIds=Array.from({length:9},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
  save.treasures=['T01','T02','T03'];save.flags=['bubbleBlessing','genieCave'];
  await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(save)});
  await page.goto('/');await page.getByRole('button',{name:'이어하기 · S10'}).click();
  await expect.poll(async()=>!!(await read(page)).player).toBe(true);
  expect((await read(page)).enemies).toHaveLength(6);
  expect((await read(page)).flightHazards).toHaveLength(3);
  await fly(page,'y',360);await fly(page,'x',700);
  expect((await read(page)).save.completedObjectiveIds).toContain('S10.quest.1');
  const coins=(await read(page)).save.coins;
  await fly(page,'x',550);await fly(page,'x',700);expect((await read(page)).save.coins).toBe(coins);
  await fly(page,'y',300);await fly(page,'x',835);
  for(let hit=0;hit<3;hit++){await page.keyboard.press('Space');await page.waitForTimeout(480);}
  await expect.poll(async()=>((await read(page)).enemies.find((enemy:{id:string})=>enemy.id==='S10.enemy.1')?.state)).toBe('defeated');
  await expect.poll(async()=>((await read(page)).enemies.find((enemy:{id:string})=>enemy.id==='S10.enemy.1')?.visible)).toBe(false);
  await page.screenshot({path:'docs/screenshots/flight-rings.png'});
  await page.reload();await page.getByRole('button',{name:'이어하기 · S10'}).click();
  await expect.poll(async()=>!!(await read(page)).player).toBe(true);
  expect((await read(page)).save.completedObjectiveIds).toContain('S10.quest.1');
  await page.keyboard.down('ArrowUp');await page.waitForTimeout(2300);await page.keyboard.up('ArrowUp');
  expect((await read(page)).player.y).toBeGreaterThanOrEqual(115);
  await fly(page,'x',2480);await fly(page,'y',545);await page.keyboard.press('Space');
  await expect(page.getByTestId('dialogue-text')).toBeVisible();
  expect((await read(page)).save.flags).toContain('flightJournal');
  expect((await read(page)).save.completedObjectiveIds).not.toContain('S10.quest.2');
  expect((await read(page)).save.checkpoint.checkpointId).toBe('middle');
  expect(errors).toEqual([]);
});

test('S33 return flight has five moving debris routes and does not require combat',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const save=freshSave();save.checkpoint={stageId:'S33',checkpointId:'start'};
  save.clearedStageIds=Array.from({length:32},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
  save.treasures=['T01','T02','T03','T04','T05','T06','T07'];
  await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(save)});
  await page.goto('/');await page.getByRole('button',{name:'이어하기 · S33'}).click();
  await expect.poll(async()=>!!(await read(page)).player).toBe(true);
  expect((await read(page)).enemies).toHaveLength(5);
  expect((await read(page)).flightHazards.map((hazard:{kind:string})=>hazard.kind)).toEqual(Array(5).fill('debris'));
  const firstY=(await read(page)).flightHazards[0].y;await page.waitForTimeout(500);
  expect((await read(page)).flightHazards[0].y).not.toBe(firstY);
  await fly(page,'y',535);await fly(page,'x',2480);await page.keyboard.press('Space');
  await expect(page.getByTestId('dialogue-text')).toBeVisible();
  expect((await read(page)).save.flags).toContain('kingdomReturn');
  expect((await read(page)).save.completedObjectiveIds.some((id:string)=>id.startsWith('S33.enemy.'))).toBe(false);
  expect(errors).toEqual([]);
});
