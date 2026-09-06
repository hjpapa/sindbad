import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
interface ReadState {stage:string;player:{x:number;y:number;hp:number;maxHp:number};save:ReturnType<typeof freshSave>;sim:number;paused:boolean}
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__')) as Promise<ReadState>;
test('actual damage and heart recovery',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S01');
 await page.keyboard.down('d');for(let i=0;i<3;i++){await page.keyboard.press('Space');await page.waitForTimeout(800);}await page.keyboard.up('d');await page.waitForTimeout(500);
 // Remain in the first skeleton's warning/attack range, then walk to its recovery heart.
 let s=await read(page);while(s.player.x<960){await page.keyboard.down('d');await page.waitForTimeout(100);s=await read(page);}await page.keyboard.up('d');
 await expect.poll(async()=>(await read(page)).player.hp,{timeout:10000}).toBeLessThan(100);const damaged=(await read(page)).player.hp;
 await page.keyboard.down('d');await expect.poll(async()=>(await read(page)).save.claimedRewardIds.includes('S01.heart.01')).toBe(true);await page.keyboard.up('d');expect((await read(page)).player.hp).toBeGreaterThan(damaged);
});
test('natural lightning death restores checkpoint and retains rewards; immunity on restart',async({page},info)=>{
 const s=freshSave();s.settings.difficulty='normal';s.checkpoint={stageId:'S03',checkpointId:'start'};s.clearedStageIds=['S01','S02'];s.weapons.push('W02');s.relics=['R01','R02'];s.totalXp=60;s.claimedRewardIds.push('S01.medal.reward','S03.crystal.reward');s.completedObjectiveIds=['S01.medal','S03.crystal'];
 await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(s)});await page.goto('/');await page.getByRole('button',{name:'이어하기 · S03'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S03');
 await expect.poll(async()=>(await read(page)).player.hp,{timeout:7000}).toBe(90); // 105 max - 20 * .75.
 await expect.poll(async()=>(await read(page)).player.hp,{timeout:35000,intervals:[250]}).toBe(105);
 const revived=await read(page);expect(revived.save.totalXp).toBe(60);expect(revived.save.relics).toEqual(['R01','R02']);expect(revived.save.weapons).toContain('W02');expect(revived.player.x).toBe(120);await page.waitForTimeout(1000);expect((await read(page)).player.hp).toBe(105);await page.screenshot({path:info.outputPath('death-restart.png')});
});
test('boss victory reload keeps exit open without duplicating XP',async({page})=>{
 const s=freshSave();s.checkpoint={stageId:'S01',checkpointId:'boss'};s.totalXp=30;s.completedObjectiveIds=['S01.enemy.captain','S01.captainTalk'];s.claimedRewardIds.push('S01.enemy.captain');
 await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(s)});await page.goto('/');await page.getByRole('button',{name:'이어하기 · S01'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S01');await page.keyboard.down('d');await page.waitForTimeout(2600);await page.keyboard.up('d');await page.waitForTimeout(150);await page.keyboard.press('e');await expect(page.getByRole('button',{name:'다음 스테이지'})).toBeVisible();expect((await read(page)).save.totalXp).toBe(75); // 30 boss + 5 heart + 40 clear.
});
test('storage denied warns but movement and export work',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('blocked','QuotaExceededError');};});await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();await expect.poll(async()=>(await read(page)).stage).toBe('S01');await expect(page.getByRole('status')).toContainText('파일로 보관');await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');expect((await read(page)).player.x).toBeGreaterThan(120);await page.getByRole('button',{name:'일시정지',exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'저장 내보내기'}).click();expect((await download).suggestedFilename()).toBe('sinbad-save.json');
});
