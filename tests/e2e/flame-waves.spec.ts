import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
const read=(p:Page)=>p.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
async function walk(p:Page,x:number){const end=Date.now()+30000;let jump=0;for(;;){const s=await read(p);if(!s.player){await p.waitForTimeout(50);continue;}if(Math.abs(s.player.x-x)<12)break;if(Date.now()>end)throw Error(`walk ${x}: ${JSON.stringify(s.player)}`);const key=s.player.x<x?'d':'a';await p.keyboard.up(key==='d'?'a':'d');await p.keyboard.down(key);if(Date.now()-jump>430){await p.keyboard.press('Space');jump=Date.now();}await p.waitForTimeout(60);}await p.keyboard.up('a');await p.keyboard.up('d');await p.waitForTimeout(450);}
async function use(p:Page,x:number){await walk(p,x);await expect.poll(async()=>!!(await read(p)).player?.grounded).toBe(true);await p.keyboard.press('e');await p.waitForTimeout(100);}
async function seed(p:Page,stage='S06',treasure=false){const s=freshSave();s.clearedStageIds=['S01','S02','S03','S04','S05'];if(stage==='S07')s.clearedStageIds.push('S06');s.checkpoint={stageId:stage,checkpointId:'start'};s.weapons.push('W02');s.flags=['bubbleBlessing'];s.totalXp=260;if(treasure){s.treasures=['T01'];s.weapons.push('W03');s.equippedSkill='flamePulse';}await p.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(s)});await p.goto('/');await p.getByRole('button',{name:`이어하기 · ${stage}`}).click();await expect.poll(async()=>(await read(p)).stage).toBe(stage);}
async function defeat(p:Page,id:string){for(let i=0;i<12;i++){const e=(await read(p)).enemies.find((e:{id:string})=>e.id===id);if(!e||e.hp===0)return;await walk(p,e.x-65);await p.keyboard.down('d');await p.waitForTimeout(25);await p.keyboard.up('d');await p.keyboard.press('j');await p.waitForTimeout(450);}throw Error('Could not calm '+id);}
test('S06 furnaces and first treasure → S07 waves, blessing and cave save',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});await seed(page);
 await use(page,350);expect((await read(page)).save.completedObjectiveIds).not.toContain('S06.vine');
 for(const x of [600,720,1460,1580,2360,2480])await use(page,x);
 expect((await read(page)).save.treasures).toEqual([]);
 for(let i=1;i<=5;i++)await defeat(page,`S06.enemy.spirit.${i}`);
 await use(page,3300);await expect(page.getByTestId('dialogue-text')).toBeVisible();let s=await read(page);expect(s.save.treasures).toContain('T01');expect(s.save.weapons).toContain('W03');
 await page.reload();await page.getByRole('button',{name:'이어하기 · S06'}).click();await expect.poll(async()=>(await read(page)).save.checkpoint.checkpointId).toBe('gift');
 await use(page,3300);await page.getByRole('button',{name:'전체 생략'}).click();await use(page,3540);await page.keyboard.press('r');await page.waitForTimeout(100);await page.screenshot({path:info.outputPath('S06-first-flame.png')});
 await use(page,350);expect((await read(page)).save.completedObjectiveIds).toContain('S06.vine');await use(page,550);const coins=(await read(page)).save.coins;await page.keyboard.press('e');expect((await read(page)).save.coins).toBe(coins);
 await use(page,3750);await page.getByRole('button',{name:'다음 스테이지'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S07');
 for(const [i,x] of [900,1900,2900].entries()){
   await use(page,x);await expect.poll(async()=>(await read(page)).save.completedObjectiveIds.includes(`S07.wave.${i+1}`)).toBe(true);
   if(i===0){await page.screenshot({path:info.outputPath('S07-boat.png')});await use(page,1410);}
 }
 await use(page,3500);await expect(page.getByTestId('dialogue-text')).toBeVisible();s=await read(page);expect(s.save.flags).toContain('genieCave');await page.reload();await page.getByRole('button',{name:'이어하기 · S07'}).click();await expect.poll(async()=>(await read(page)).submerged).toBe(true);await page.waitForTimeout(11000);expect((await read(page)).air).toBe(10000);await page.screenshot({path:info.outputPath('S07-cave-resume.png')});
 await use(page,3980);await page.getByRole('button',{name:'이번 항해 기록 보기'}).click();await expect(page.locator('[data-stage="S08"]')).toBeDisabled();expect((await read(page)).save.clearedStageIds).toContain('S07');expect(errors).toEqual([]);
});
test('flame MP/cooldown pause, free ignition and W03 lingering damage',async({page})=>{
 await seed(page,'S06',true);await use(page,350);const before=(await read(page)).mp;await page.keyboard.press('r');await page.waitForTimeout(180);expect((await read(page)).mp).toBe(before-15);await page.keyboard.press('r');expect((await read(page)).mp).toBe(before-15);
 await page.getByRole('button',{name:'일시정지'}).click();const paused=await read(page);await page.waitForTimeout(4300);expect((await read(page)).sim).toBe(paused.sim);expect((await read(page)).mp).toBe(paused.mp);await page.getByRole('button',{name:'모험 계속',exact:true}).click();await page.waitForTimeout(2500);expect((await read(page)).mp).toBeGreaterThan(paused.mp);
 await walk(page,1020);await expect.poll(async()=>!!(await read(page)).player?.grounded).toBe(true);await page.keyboard.press('Digit3');await page.keyboard.down('d');await page.waitForTimeout(25);await page.keyboard.up('d');await page.keyboard.press('j');await page.waitForTimeout(250);const enemy=()=>read(page).then(s=>s.enemies.find((e:{id:string})=>e.id==='S06.enemy.spirit.2'));expect((await enemy()).burn).toBeTruthy();const hp=(await enemy()).hp;await page.waitForTimeout(1100);expect((await enemy()).hp).toBeLessThan(hp);
});
test('missed wave deals limited damage, preserves treasure and allows another attempt',async({page},info)=>{
 await seed(page,'S07',true);await walk(page,900);await expect.poll(async()=>!!(await read(page)).player?.grounded).toBe(true);const hp=(await read(page)).player.hp;
 await page.screenshot({path:info.outputPath('S07-wave-warning.png')});await expect.poll(async()=>(await read(page)).player.hp).toBeLessThan(hp);
 let s=await read(page);expect(s.save.completedObjectiveIds).not.toContain('S07.wave.1');expect(s.save.treasures).toContain('T01');expect(hp-s.player.hp).toBeLessThanOrEqual(10);
 await use(page,900);await expect.poll(async()=>(await read(page)).save.completedObjectiveIds.includes('S07.wave.1')).toBe(true);
 await walk(page,620);await page.keyboard.down('a');await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__').player?.y>720,undefined,{polling:'raf',timeout:10000});await page.keyboard.up('a');await expect.poll(async()=>(await read(page)).player.y).toBeLessThan(620);s=await read(page);expect(s.player.hp).toBeGreaterThan(0);expect(s.save.treasures).toContain('T01');
});
