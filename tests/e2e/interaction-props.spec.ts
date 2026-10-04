import {test,expect,type Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {maps} from '../../src/content/maps';
import {worldPropDefinitions,objectTexture,illustratedWorldProp,sceneWorldPropKeys} from '../../src/content/worldProps';
import {freshSave,type Save} from '../../src/core/state';
import {weapons,treasures,relics} from '../../src/content/items';
import {SAVE_KEY} from '../../src/core/save';
import {moveJourney,useJourney} from './journey-bot';
import {evidencePath} from './art-evidence';

const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
function fixture(stage:string):Save {
    const save=freshSave();save.checkpoint={stageId:stage,checkpointId:'start'};
    save.clearedStageIds=Object.keys(maps).filter(id=>id<stage);
    save.claimedRewardIds.push(...maps[stage].spawns.map(enemy=>enemy.id),...maps[stage].hearts.map(heart=>heart.id));
    save.completedObjectiveIds=maps[stage].spawns.map(enemy=>enemy.id);
    return save;
}
async function load(page:Page,save:Save){
    await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${save.checkpoint.stageId}`}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player);
}
function captureErrors(page:Page,fallback=false){
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&!(fallback&&message.text().includes('ERR_FAILED')))errors.push(message.text());});
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
    return errors;
}

for(const fallback of [false,true])test(`interaction props retain actual map textures, IDs and dimensions${fallback?' with all artwork missing':''}`,async({page})=>{
    test.setTimeout(8*60*1000);const errors=captureErrors(page,fallback);
    if(fallback)await page.route('**/assets/webtoon/prop-*.webp',route=>route.abort());
    await page.goto('/');
    const uncovered=new Set(worldPropDefinitions.filter(prop=>!['prop-chest','prop-heart'].includes(prop.key)).map(prop=>prop.key));
    const checks:unknown[]=[];
    for(const map of Object.values(maps)){
        const needed=sceneWorldPropKeys(map);if(!needed.some(key=>uncovered.has(key)))continue;
        const save=fixture(map.id);save.weapons=Object.keys(weapons) as Save['weapons'];save.treasures=Object.keys(treasures);save.relics=Object.keys(relics);
        await page.setViewportSize(map.id==='S04'?{width:1180,height:820}:{width:844,height:390});
        await load(page,save);const state=await read(page);
        expect(state.propArt.cachedKeys.sort()).toEqual(fallback?[]:needed.sort());
        const objects=[];
        for(const def of map.objects){
            const key=illustratedWorldProp(objectTexture(def,map.id),def.id);if(!key)continue;
            const shown=state.propArt.objects.find((object:{id:string})=>object.id===def.id);
            expect(shown.texture).toBe(fallback?objectTexture(def,map.id):key);
            const scale=def.flightRing?1.35:['npc','rescue','truthGift'].includes(def.kind)?1:def.kind==='checkpoint'?0.42:0.68;
            expect(shown.width).toBeCloseTo(96*scale);expect(shown.height).toBeCloseTo(128*scale);
            objects.push(shown);uncovered.delete(key);
        }
        const hazards=[];
        for(const def of map.flightHazards??[]){
            const legacy=def.kind==='gust'?'stormCloud':'debris';const key=illustratedWorldProp(legacy)!;
            const shown=state.flightHazards.find((hazard:{id:string})=>hazard.id===def.id);
            expect(shown.texture).toBe(fallback?legacy:key);expect(shown.radius).toBe(def.radius);
            expect(shown.width).toBeCloseTo(96*shown.scale);expect(shown.height).toBeCloseTo(128*shown.scale);
            hazards.push(shown);uncovered.delete(key);
        }
        const path=evidencePath(`m6-interact/${fallback?'fallback-':''}${map.id}-scene-start.png`);await page.screenshot({path});
        checks.push({stage:map.id,objects,hazards,path,caption:'real map at saved start; snapshot verifies all mapped textures, screenshot shows only the current viewport'});
    }
    expect([...uncovered]).toEqual([]);expect(errors).toEqual([]);
    writeFileSync(`docs/validation/m6-interact-map-${fallback?'fallback':'normal'}.json`,JSON.stringify({pass:true,method:'explicit progression/enemy fixtures; actual loaded scene textures and dimensions, no teleport or game-state hooks; spawn screenshots do not show every offscreen object',checks,errors},null,2));
});

for(const fallback of [false,true])test(`rescue equipment and golden heart retain real pickup, retry and reload${fallback?' when artwork is missing':''}`,async({page})=>{
    test.setTimeout(5*60*1000);const errors=captureErrors(page,fallback);
    if(fallback)await page.route('**/assets/webtoon/prop-*.webp',route=>route.abort());
    await page.setViewportSize({width:1180,height:820});await page.goto('/');await load(page,fixture('S04'));
    const state=await read(page);const checks:unknown[]=[];
    for(const [id,key] of [['S04.gear.1','prop-lifevest'],['S04.gear.2','prop-rescue-rope'],['S04.gear.3','prop-lifering']]){
        const object=state.propArt.objects.find((object:{id:string})=>object.id===id);
        expect(object.texture).toBe(fallback?'gear':key);
        const def=maps.S04.objects.find(object=>object.id===id)!;
        await moveJourney(page,def.x-80,def.y);
        const path=evidencePath(`m6-interact/${fallback?'fallback-':''}${key}.png`);await page.screenshot({path});
        await useJourney(page,def);expect((await read(page)).save.completedObjectiveIds).toContain(id);
        checks.push({id,texture:object.texture,path});
    }
    const golden=maps.S04.objects.find(object=>object.id==='S04.golden')!;
    await moveJourney(page,1180,440);const before=await read(page);
    const path=evidencePath(`m6-interact/${fallback?'fallback-':''}golden-before.png`);await page.screenshot({path});
    await useJourney(page,golden);const after=await read(page);
    expect(after.save.goldenHearts).toEqual(['G01']);expect(after.player.maxHp).toBe(before.player.maxHp+10);
    expect(after.save.totalXp).toBe(before.save.totalXp+15);expect(after.player.hp).toBe(after.player.maxHp);
    await page.locator('#pause').click();await page.locator('#retry').click();await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player);
    await useJourney(page,golden);expect((await read(page)).save.totalXp).toBe(after.save.totalXp);
    await page.reload();await page.getByRole('button',{name:'이어하기 · S04'}).click();await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player);
    expect((await read(page)).save.claimedRewardIds).toEqual(after.save.claimedRewardIds);expect((await read(page)).save.goldenHearts).toEqual(['G01']);
    expect(errors).toEqual([]);
    writeFileSync(`docs/validation/m6-interact-rescue-${fallback?'fallback':'normal'}.json`,JSON.stringify({pass:true,method:'S04 explicit enemy/hearts fixture; real movement, interaction, pause retry and reload',checks,golden:{path,before:before.player,after:after.player,xpGain:15,retryDuplicateXp:0},rewardIds:after.save.claimedRewardIds,errors},null,2));
});
