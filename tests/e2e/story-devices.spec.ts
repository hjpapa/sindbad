import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import campaign from '../../src/content/stageIndex';
import {maps} from '../../src/content/maps';
import {readJourney,moveJourney,useJourney,skipJourneyDialogue,fightJourney,finishJourneyStage} from './journey-bot';

// Edge can close after a prior context's download teardown. Give story checks
// their own browser process so save/export regressions cannot invalidate them.
test.use({launchOptions:{channel:'msedge',args:['--disable-background-networking','--disable-component-update']}});

async function loadChapter(page:Page,id:string){
 const prior=campaign.slice(0,Number(id.slice(1))-1);const save=freshSave();
 save.checkpoint={stageId:id,checkpointId:'start'};save.clearedStageIds=prior.map(stage=>stage.id);
 save.treasures=prior.flatMap(stage=>stage.mandatoryItems.filter(item=>item.startsWith('T')));
 save.weapons=['W01',...prior.flatMap(stage=>stage.mandatoryItems.filter(item=>item.startsWith('W')&&item!=='W01'))] as typeof save.weapons;
 save.flags=[...new Set(prior.flatMap(stage=>stage.rewardFlags))];save.totalXp=prior.reduce((total,stage)=>total+stage.clearXp,0);
 await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(save)});
 await page.goto('/');await page.getByRole('button',{name:`이어하기 · ${id}`}).click();
 await expect.poll(async()=>!!(await readJourney(page)).player).toBe(true);
}

test('S16 protected entrance earns pearl before actual swim practice and survives reload',async({page})=>{
 await loadChapter(page,'S16');expect((await readJourney(page)).freeMovement).toBe(false);
 const map=maps.S16;
 for(let i=1;i<=3;i++)await useJourney(page,map.objects.find(object=>object.id===`S16.quest.${i}`)!);
 await useJourney(page,map.objects.find(object=>object.id==='S16.reward')!);await skipJourneyDialogue(page);
 expect((await readJourney(page)).save.treasures).toContain('T04');expect((await readJourney(page)).freeMovement).toBe(true);
 const y=(await readJourney(page)).player.y;
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(600);await page.keyboard.up('ArrowUp');
 expect((await readJourney(page)).player.y).toBeLessThan(y-60);
 await useJourney(page,map.objects.find(object=>object.id==='S16.quest.4')!);
 const claimed=(await readJourney(page)).save.claimedRewardIds;
 await page.reload();await page.getByRole('button',{name:'이어하기 · S16'}).click();
 await expect.poll(async()=>(await readJourney(page)).save.claimedRewardIds).toEqual(claimed);
 await expect.poll(async()=>(await readJourney(page)).freeMovement).toBe(true);
});

test('carried wood resets safely on reload and only delivery grants progress',async({page})=>{
 await loadChapter(page,'S25');const wood=maps.S25.objects.find(object=>object.id==='S25.quest.1')!;
 await moveJourney(page,wood.x,wood.y);await page.keyboard.press('e');await page.waitForTimeout(100);
 expect((await readJourney(page)).save.completedObjectiveIds).not.toContain(wood.id);
 expect((await readJourney(page)).storyDevices.find(device=>device.id===wood.id)!.x).toBeGreaterThan(wood.x);
 await page.reload();await page.getByRole('button',{name:'이어하기 · S25'}).click();
 await expect.poll(async()=>(await readJourney(page)).storyDevices.find(device=>device.id===wood.id)?.x).toBe(wood.x);
 await useJourney(page,wood);const rewards=(await readJourney(page)).save.claimedRewardIds;
 await moveJourney(page,wood.x+100,wood.y);await page.keyboard.press('e');
 expect((await readJourney(page)).save.claimedRewardIds).toEqual(rewards);
});

test('S25 bridge requires real crossing and standing extends its lifetime',async({page},info)=>{
 await loadChapter(page,'S25');
 for(let i=1;i<=3;i++)await useJourney(page,maps.S25.objects.find(object=>object.id===`S25.quest.${i}`)!);
 await useJourney(page,maps.S25.objects.find(object=>object.kind==='gift')!);await skipJourneyDialogue(page);
 const practice=maps.S25.objects.find(object=>object.id==='S25.quest.4')!;
 await moveJourney(page,practice.x,550);await page.keyboard.press('e');await page.waitForTimeout(1200);
 expect((await readJourney(page)).save.completedObjectiveIds).not.toContain(practice.id);
 await useJourney(page,practice);expect((await readJourney(page)).player.y).toBeLessThan(470);
 await page.waitForTimeout(12500);
 expect((await readJourney(page)).player.y).toBeLessThan(470);expect((await readJourney(page)).player.grounded).toBe(true);
 await page.screenshot({path:info.outputPath('S25-physical-bridge.png')});
 await page.reload();await page.getByRole('button',{name:'이어하기 · S25'}).click();
 await expect.poll(async()=>(await readJourney(page)).save.checkpoint.checkpointId).toBe('middle');
 expect((await readJourney(page)).save.treasures).toContain('T05');
});

test('S15 kitchen rescues sailors and saves the earned boots checkpoint',async({page},info)=>{
 await loadChapter(page,'S15');const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await finishJourneyStage(page,async()=>{
  expect((await readJourney(page)).save.relics).toContain('R04');
  expect((await readJourney(page)).save.checkpoint).toEqual({stageId:'S15',checkpointId:'middle'});
  await page.screenshot({path:info.outputPath('S15-kitchen.png')});
 });
 expect((await readJourney(page)).stage).toBe('S16');expect(errors).toEqual([]);
});

test('W06 breaks optional moon rock with one real attack and never duplicates its reward',async({page},info)=>{
 await loadChapter(page,'S25');
 for(let i=1;i<=3;i++)await useJourney(page,maps.S25.objects.find(object=>object.id===`S25.quest.${i}`)!);
 await useJourney(page,maps.S25.objects.find(object=>object.kind==='gift')!);await skipJourneyDialogue(page);
 const rock=maps.S25.objects.find(object=>object.breakWeapon==='W06')!;
 await moveJourney(page,rock.x-45,550);await page.keyboard.down('d');await page.waitForTimeout(25);await page.keyboard.up('d');
 await page.keyboard.press('Digit1');await page.keyboard.press('j');await page.waitForTimeout(500);
 expect((await readJourney(page)).save.completedObjectiveIds).not.toContain(rock.id);
 await page.keyboard.press('Digit6');await page.keyboard.press('Space');await page.waitForTimeout(1000);
 expect((await readJourney(page)).save.completedObjectiveIds).toContain(rock.id);
 expect((await readJourney(page)).save.coins).toBeGreaterThanOrEqual(25);
 await page.screenshot({path:info.outputPath('S25-moon-rock.png')});
 await page.reload();await page.getByRole('button',{name:'이어하기 · S25'}).click();
 await moveJourney(page,rock.x-45,550);await page.keyboard.press('Digit6');await page.keyboard.press('j');await page.waitForTimeout(1000);
 expect((await readJourney(page)).save.claimedRewardIds.filter(id=>id===`${rock.id}.reward`)).toHaveLength(1);
});

test('Kuura shield requires two seals, final combat opens the saved reward',async({page},info)=>{
 await loadChapter(page,'S31');await page.keyboard.press('Digit7');const id='S31.enemy.3';
 await moveJourney(page,maps.S31.spawns.at(-1)!.x-55,550);
 const before=(await readJourney(page)).enemies.find(enemy=>enemy.id===id)!.hp;
 for(let hit=0;hit<3;hit++){await page.keyboard.press('j');await page.waitForTimeout(450);}
 expect((await readJourney(page)).enemies.find(enemy=>enemy.id===id)!.hp).toBe(before);
 for(let i=1;i<=3;i++)await useJourney(page,maps.S31.objects.find(object=>object.id===`S31.quest.${i}`)!);
 await page.screenshot({path:info.outputPath('S31-boss.png')});
 await fightJourney(page,id);
 await useJourney(page,maps.S31.objects.find(object=>object.kind==='gift')!);await skipJourneyDialogue(page);
 expect((await readJourney(page)).save.flags).toContain('kuuraSealed');
 await page.reload();await page.getByRole('button',{name:'이어하기 · S31'}).click();
 await expect.poll(async()=>(await readJourney(page)).enemies.some(enemy=>enemy.id===id)).toBe(false);
});
