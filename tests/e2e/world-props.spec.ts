import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {evidencePath} from './art-evidence';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import {sceneWorldPropKeys} from '../../src/content/worldProps';
import {moveJourney,readJourney,useJourney} from './journey-bot';

const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
function fixture(checkpoint='start',damage=false){
    const save=freshSave();save.checkpoint={stageId:'S01',checkpointId:checkpoint};
    save.claimedRewardIds=maps.S01.spawns.filter(enemy=>!damage||enemy.id!=='S01.enemy.skeleton.01').map(enemy=>enemy.id);
    save.completedObjectiveIds=[...save.claimedRewardIds,'S01.captainTalk'];return save;
}
async function load(page:Page,save:Save){
    await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});
    await page.reload();await page.getByRole('button',{name:'이어하기 · S01'}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);
}
async function retry(page:Page){await page.locator('#pause').click();await page.locator('#retry').click();await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);}

async function verify(page:Page,fallback:boolean){
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!(fallback&&message.text().includes('ERR_FAILED')))errors.push(message.text());});
    const requested:string[]=[];
    page.on('request',request=>{if(/prop-(chest|heart)\.webp/.test(request.url()))requested.push(request.url());});
    if(fallback)await page.route('**/assets/webtoon/prop-*.webp',route=>route.abort());
    mkdirSync(evidencePath('m6-props'),{recursive:true});await page.goto('/');
    const checks:unknown[]=[];
    for(const [device,viewport] of Object.entries(fallback?{phone:{width:844,height:390}}:{phone:{width:844,height:390},tablet:{width:1180,height:820}})){
        await page.setViewportSize(viewport);await load(page,fixture());
        const start=await read(page);expect(start.propArt.cachedKeys.sort()).toEqual(fallback?[]:['prop-bell','prop-chest','prop-heart']);
        const chest=start.propArt.chests[0];expect(chest.texture).toBe(fallback?'chest':'prop-chest');
        expect(chest.width).toBeCloseTo(65.28);expect(chest.height).toBeCloseTo(87.04);
        const heart=start.propArt.hearts[0];expect(heart.texture).toBe(fallback?'heart':'prop-heart');
        expect(heart.width).toBeCloseTo(34.56);expect(heart.height).toBeCloseTo(46.08);
        await moveJourney(page,610,480);
        const path=evidencePath(`m6-props/${device}-${fallback?'fallback-':''}chest.png`);await page.screenshot({path});
        await useJourney(page,maps.S01.objects.find(object=>object.id==='S01.medal')!);
        const rewarded=(await readJourney(page)).save;expect(rewarded.relics).toContain('R01');
        expect(rewarded.claimedRewardIds.filter(id=>id==='S01.medal.reward')).toHaveLength(1);
        await moveJourney(page,1030,550);
        const normalPath=evidencePath(`m6-props/${device}-${fallback?'fallback-':''}normal-heart.png`);await page.screenshot({path:normalPath});
        const before=await read(page);await moveJourney(page,1160,550);const after=await read(page);
        expect(after.save.totalXp).toBe(before.save.totalXp+2);expect(after.player.hp).toBe(after.player.maxHp);
        expect(after.propArt.hearts.find((h:{id:string})=>h.id==='S01.heart.01').active).toBe(false);
        await retry(page);await useJourney(page,maps.S01.objects.find(object=>object.id==='S01.medal')!);
        await moveJourney(page,1160,550);expect((await read(page)).save.totalXp).toBe(after.save.totalXp);
        await page.reload();await page.getByRole('button',{name:'이어하기 · S01'}).click();
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);
        expect((await read(page)).save.claimedRewardIds).toEqual(after.save.claimedRewardIds);
        await load(page,fixture('boss'));const largeBefore=await read(page);
        const large=largeBefore.propArt.hearts.find((h:{large:boolean})=>h.large);expect(large.width).toBeCloseTo(48);expect(large.height).toBeCloseTo(64);
        const largePath=evidencePath(`m6-props/${device}-${fallback?'fallback-':''}large-heart.png`);await page.screenshot({path:largePath});
        await moveJourney(page,3930,550);const largeAfter=await read(page);
        expect(largeAfter.save.totalXp).toBe(largeBefore.save.totalXp+5);expect(largeAfter.player.hp).toBe(largeAfter.player.maxHp);
        await retry(page);await moveJourney(page,3930,550);expect((await read(page)).save.totalXp).toBe(largeAfter.save.totalXp);
        checks.push({device,fallback,chest,heart,large,paths:[path,normalPath,largePath],normalXp:2,largeXp:5,retryDuplicateXp:0,reloadRewardIds:after.save.claimedRewardIds});
    }
    // Isolated fresh S01 fixture, keep the first enemy; real damage then pickup.
    await load(page,fixture('start',true));await moveJourney(page,1000,550);
    await expect.poll(async()=>(await read(page)).player.hp).toBeLessThan(100);
    const damaged=await read(page);await moveJourney(page,1160,550);const healed=await read(page);
    expect(healed.player.hp).toBeGreaterThan(damaged.player.hp);expect(healed.player.hp).toBeLessThanOrEqual(healed.player.maxHp);
    expect(healed.save.totalXp).toBe(damaged.save.totalXp+2);
    const recoveredPath=evidencePath(`m6-props/${fallback?'fallback-':''}actual-healing.png`);await page.screenshot({path:recoveredPath});
    expect(errors).toEqual([]);expect(requested.length).toBeGreaterThanOrEqual(2);
    writeFileSync(`docs/validation/m6-interact-chest-${fallback?'fallback':'play'}.json`,JSON.stringify({date:new Date().toISOString(),pass:true,method:'explicit checkpoint/enemy fixtures; real keyboard movement, interaction, damage, pickup, pause retry and reload; not a fresh campaign',checks,damageRecovery:{before:damaged.player.hp,after:healed.player.hp,path:recoveredPath},requested,errors},null,2));
}
test('world props retain dimensions, real reward/healing, retry and reload on phone/tablet',async({page})=>{test.setTimeout(6*60*1000);await verify(page,false);});
test('missing world props use preserved SVGs and retain real interactions',async({page})=>{test.setTimeout(4*60*1000);await verify(page,true);});

test('map revisit releases unused props and reloads them when returning',async({page})=>{
    const save=fixture();save.clearedStageIds=Array.from({length:12},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
    await page.goto('/');await load(page,save);
    expect((await read(page)).propArt.cachedKeys.sort()).toEqual(['prop-bell','prop-chest','prop-heart']);
    await page.locator('#bag').click();await page.locator('[data-stage="S13"]').click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.stage==='S13');
    expect((await read(page)).propArt.cachedKeys.sort()).toEqual(sceneWorldPropKeys(maps.S13).sort());
    expect((await read(page)).propArt.cachedKeys).not.toContain('prop-chest');
    expect((await read(page)).propArt.cachedKeys).not.toContain('prop-heart');
    await page.locator('#bag').click();await page.locator('[data-stage="S01"]').click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.stage==='S01');
    expect((await read(page)).propArt.cachedKeys.sort()).toEqual(['prop-bell','prop-chest','prop-heart']);
});
