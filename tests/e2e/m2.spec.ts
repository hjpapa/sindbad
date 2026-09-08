import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
async function walk(page:Page,x:number){const until=Date.now()+25000;let jump=0;while(true){const s=await read(page);if(!s.player){if(Date.now()>until)throw Error("Player did not load");await page.waitForTimeout(50);continue;}if(Math.abs(s.player.x-x)<12)break;if(Date.now()>until)throw Error(`Unreachable ${x}: ${JSON.stringify(s.player)}`);const key=s.player.x<x?'d':'a';await page.keyboard.up(key==='d'?'a':'d');await page.keyboard.down(key);if(Date.now()-jump>430){await page.keyboard.press('Space');jump=Date.now();}await page.waitForTimeout(65);}await page.keyboard.up('a');await page.keyboard.up('d');await page.waitForTimeout(600);}
async function use(page:Page,x:number){await walk(page,x);await expect.poll(async()=>{const s=await read(page);const o=maps[s.stage]?.objects.find(o=>o.x===x);return !!s.player?.grounded && !!o && Math.abs(s.player.x-x)<85 && Math.abs(s.player.y-o.y)<90;}).toBe(true);await page.keyboard.press('e');await page.waitForTimeout(150);}
async function existingM1(page:Page){const s=freshSave();s.clearedStageIds=['S01','S02','S03'];s.checkpoint={stageId:'S03',checkpointId:'crisis'};s.weapons.push('W02');s.totalXp=150;s.relics=['R01','R02'];await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(s)});await page.goto('/');await page.getByRole('button',{name:'이어하기 · S03'}).click();await page.getByRole('button',{name:'가방과 지도'}).click();await page.locator('[data-stage="S04"]').click();await expect.poll(async()=>(await read(page)).stage).toBe('S04');}
test('existing M1 save → whale rescue, moving deck, G01 → coral rescue, G02 and blessing',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});await existingM1(page);
 await use(page,250);await page.getByRole('button',{name:'전체 생략'}).click();
 await use(page,560);await use(page,860);await walk(page,1040);await use(page,1270);expect((await read(page)).save.goldenHearts).toContain('G01');
 await use(page,1500);expect((await read(page)).save.completedObjectiveIds).toEqual(expect.arrayContaining(['S04.gear.1','S04.gear.2','S04.gear.3']));
 await walk(page,1840);await page.waitForTimeout(800);const p1=(await read(page)).movingPlatforms[0].y;await page.waitForTimeout(900);expect(Math.abs((await read(page)).movingPlatforms[0].y-p1)).toBeGreaterThan(2);
 await page.screenshot({path:info.outputPath('S04-moving-whale.png')});await walk(page,2300);await page.reload();await page.getByRole('button',{name:'이어하기 · S04'}).click();expect((await read(page)).save.goldenHearts).toContain('G01');
 await use(page,3690);await page.getByRole('button',{name:'다음 스테이지'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S05');
 await walk(page,680);await use(page,960);expect((await read(page)).save.completedObjectiveIds).toContain('S05.key');await use(page,1870);await use(page,2460);await use(page,2650);
 await expect(page.getByTestId('dialogue-text')).toBeVisible();const rescue=await read(page);expect(rescue.save.flags).toContain('bubbleBlessing');expect(rescue.save.treasures).not.toContain('T04');
 // Reload during the rescue dialogue proves rewards precede animation/skip.
 await page.reload();await page.getByRole('button',{name:'이어하기 · S05'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S05');expect((await read(page)).save.checkpoint.checkpointId).toBe('rescue');
 await use(page,2650);await page.getByRole('button',{name:'전체 생략'}).click();expect((await read(page)).save.flags.filter((x:string)=>x==='bubbleBlessing')).toHaveLength(1);
 await use(page,3200);expect((await read(page)).save.goldenHearts).toEqual(['G01','G02']);await walk(page,3360);await expect.poll(async()=>(await read(page)).submerged).toBe(true);await page.waitForTimeout(11000);expect((await read(page)).air).toBe(10000);expect((await read(page)).bubbleProtected).toBe(true);
 await page.screenshot({path:info.outputPath('S05-bubble-golden.png')});const xp=(await read(page)).save.totalXp;await page.keyboard.press('e');expect((await read(page)).save.totalXp).toBe(xp);
 await use(page,3880);await page.getByRole('button',{name:'항해 지도'}).click();await expect(page.locator('[data-stage="S06"]')).toBeEnabled();expect((await read(page)).save.clearedStageIds).toContain('S05');expect(errors).toEqual([]);await page.screenshot({path:info.outputPath('M2-part-one.png')});
});

test('coral gate rejects missing crown; guardian blocks frontal attacks and exposes recovery',async({page})=>{
 const s=freshSave();s.clearedStageIds=['S01','S02','S03','S04'];s.checkpoint={stageId:'S05',checkpointId:'start'};
 await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(s)});await page.goto('/');await page.getByRole('button',{name:'이어하기 · S05'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S05');
 await walk(page,350);const enemy=()=>read(page).then(s=>s.enemies.find((e:{id:string})=>e.id==='S05.enemy.guardian.1'));
 await page.keyboard.down('d');await page.waitForTimeout(30);await page.keyboard.up('d');const hp=(await enemy()).hp;await page.keyboard.press('j');await page.waitForTimeout(230);expect((await enemy()).hp).toBe(hp);
 await expect.poll(async()=>(await enemy()).state).toBe('recover');await page.keyboard.press('j');await expect.poll(async()=>(await enemy()).hp).toBeLessThan(hp);
 await use(page,1870);expect((await read(page)).save.completedObjectiveIds).not.toContain('S05.crown');
 await use(page,2460);expect((await read(page)).save.completedObjectiveIds).not.toContain('S05.gate');await page.keyboard.down('d');await page.keyboard.press('Space');await page.waitForTimeout(1100);await page.keyboard.up('d');expect((await read(page)).player.x).toBeLessThan(2500);
 expect((await read(page)).save.flags).not.toContain('bubbleBlessing');
});
