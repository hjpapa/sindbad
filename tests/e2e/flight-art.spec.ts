import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import campaign from '../../src/content/stageIndex';
import {maps} from '../../src/content/maps';
import {sceneWorldPropKeys} from '../../src/content/worldProps';
import {evidencePath} from './art-evidence';
import {moveJourney} from './journey-bot';

const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
const flightKeys=['prop-flight-ring','prop-gust-cloud','prop-falling-debris'];
async function enter(page:Page,id:string){
    await page.locator('#bag').click();await page.locator(`[data-stage="${id}"]`).click();
    await page.waitForFunction(id=>Reflect.get(window,'__SINBAD_TEST__')?.stage===id,id);
    await page.waitForTimeout(2600); // Let the scene intro card leave the capture.
}
async function resume(page:Page,id:string){
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${id}`}).click();
    await page.waitForFunction(id=>Reflect.get(window,'__SINBAD_TEST__')?.stage===id,id);
    await page.waitForTimeout(2600);
}
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    for(const fallback of [false,true])test(`${device} flight art ${fallback?'missing SVG recovery':'webtoon'} preserves rings, hazards and resume`,async({page})=>{
        test.setTimeout(4*60*1000);await page.setViewportSize(viewport);
        const errors:string[]=[],requested:string[]=[],blocked:string[]=[],screens:string[]=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('console',message=>{if(message.type()==='error'&&!(fallback&&message.text().includes('ERR_FAILED')))errors.push(message.text());});
        page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
        page.on('request',request=>{if(flightKeys.some(key=>request.url().endsWith(`${key}.webp`)))requested.push(request.url());});
        if(fallback)for(const key of flightKeys)await page.route(`**/assets/webtoon/${key}.webp`,route=>{blocked.push(route.request().url());return route.abort();});
        // Explicit stage/treasure and claimed-reward fixtures. Ordinary flying
        // enemies respawn and remain active; no combat or damage bypass.
        const save=freshSave();const prior=campaign.slice(0,32);
        save.checkpoint={stageId:'S10',checkpointId:'start'};save.clearedStageIds=prior.map(stage=>stage.id);
        save.treasures=['T01','T02','T03','T04','T05','T06','T07'];
        save.flags=[...new Set(prior.flatMap(stage=>stage.rewardFlags))];
        save.claimedRewardIds=['S10','S33'].flatMap(id=>maps[id].spawns.map(enemy=>enemy.id));
        save.completedObjectiveIds=[...save.claimedRewardIds];
        await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(save)});
        mkdirSync(evidencePath('m6-flight'),{recursive:true});await page.goto('/');
        await page.getByRole('button',{name:'이어하기 · S10'}).click();
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.stage==='S10');
        await page.waitForTimeout(2600);
        const observations:unknown[]=[];
        const capture=async(label:string)=>{const path=evidencePath(`m6-flight/${device}-${fallback?'fallback':'normal'}-${label}.png`);await page.screenshot({path});screens.push(path);};
        const inspect=async(id:string)=>{
            const state=await read(page);
            const expected=sceneWorldPropKeys(maps[id]).filter(key=>!fallback||!flightKeys.includes(key));
            expect(state.propArt.cachedKeys.sort()).toEqual(expected.sort());
            const rings=state.propArt.objects.filter((object:{id:string})=>maps[id].objects.some(def=>def.flightRing&&def.id===object.id));
            expect(rings).toHaveLength(id==='S10'?3:5);
            for(const ring of rings){expect(ring.texture).toBe(fallback?'flightRing':'prop-flight-ring');expect(ring.width).toBeCloseTo(129.6);expect(ring.height).toBeCloseTo(172.8);}
            expect(state.flightHazards).toHaveLength(id==='S10'?3:5);
            for(const hazard of state.flightHazards){
                const def=maps[id].flightHazards!.find(def=>def.id===hazard.id)!;
                expect(hazard.radius).toBe(def.radius);expect(hazard.x).toBe(def.x);
                expect(hazard.texture).toBe(fallback?(def.kind==='gust'?'stormCloud':'debris'):(def.kind==='gust'?'prop-gust-cloud':'prop-falling-debris'));
                const scale=(def.kind==='gust'?.95:.7)*(1+Math.sin(state.sim/180+def.x)*.04);
                expect(hazard.width).toBeCloseTo(96*scale,5);expect(hazard.height).toBeCloseTo(128*scale,5);
                const y=def.kind==='gust'?def.y+Math.sin(state.sim/420+def.x)*14:120+((state.sim*.085+def.y*1.7)%410);
                expect(hazard.y).toBeCloseTo(y,5);
                expect(hazard.rotation).toBeCloseTo(def.kind==='debris'?Math.sin(state.sim/500+def.x)*.16:0,5);
            }
            observations.push({id,sim:state.sim,rings,hazards:state.flightHazards,cachedKeys:state.propArt.cachedKeys});return state;
        };
        await inspect('S10');const initial=await read(page);
        await moveJourney(page,530,360);await capture('S10-ring-approach');
        await moveJourney(page,700,360);await expect.poll(async()=>(await read(page)).save.completedObjectiveIds).toContain('S10.quest.1');
        await capture('S10-ring-collected');const collected=await read(page);
        expect(collected.save.coins).toBeGreaterThan(initial.save.coins);
        expect(collected.propArt.objects.find((object:{id:string})=>object.id==='S10.quest.1').visible).toBe(false);
        await moveJourney(page,550,360);await moveJourney(page,700,360);
        expect((await read(page)).save.coins).toBe(collected.save.coins);
        await resume(page,'S10');expect((await read(page)).save.claimedRewardIds).toEqual(collected.save.claimedRewardIds);
        expect((await read(page)).save.coins).toBe(collected.save.coins);
        await moveJourney(page,maps.S10.checkpoints.find(checkpoint=>checkpoint.id==='middle')!.x+60,535);
        expect((await read(page)).save.checkpoint.checkpointId).toBe('middle');
        await resume(page,'S10');expect((await read(page)).save.completedObjectiveIds).toContain('S10.quest.1');
        const beforeDamage=(await read(page)).player.hp;
        await moveJourney(page,1680,300);await expect.poll(async()=>(await read(page)).player.hp).toBeLessThan(beforeDamage);
        const damaged=await read(page);await capture('S10-gust-contact');await moveJourney(page,1550,535);
        await page.locator('#pause').click();const paused=await read(page);await page.waitForTimeout(400);
        expect((await read(page)).sim).toBe(paused.sim);expect((await read(page)).flightHazards).toEqual(paused.flightHazards);
        await page.locator('#resume').click();await page.waitForTimeout(300);await inspect('S10');
        // Fresh S33 scene uses the other hazard, releases the gust texture,
        // and shares the ring art. Real movement collects a return ring.
        await enter(page,'S33');const returnStart=await inspect('S33');
        await page.waitForTimeout(500);const moving=await inspect('S33');
        expect(moving.flightHazards[0].y).not.toBe(returnStart.flightHazards[0].y);
        await moveJourney(page,530,360);await capture('S33-ring-approach');
        await moveJourney(page,700,360);await expect.poll(async()=>(await read(page)).save.completedObjectiveIds).toContain('S33.quest.1');await capture('S33-ring');
        await moveJourney(page,1650,535);await capture('S33-debris');
        const saved=(await read(page)).save;expect(saved.checkpoint.checkpointId).toBe('middle');
        await resume(page,'S33');expect((await read(page)).save.claimedRewardIds).toEqual(saved.claimedRewardIds);
        expect((await read(page)).save.completedObjectiveIds).toEqual(saved.completedObjectiveIds);
        await moveJourney(page,2480,545);await page.keyboard.press('Space');await expect(page.getByTestId('dialogue-text')).toBeVisible();
        expect((await read(page)).save.flags).toContain('kingdomReturn');
        expect((await read(page)).save.completedObjectiveIds).not.toContain('S33.quest.2');
        await page.getByRole('button',{name:'전체 생략'}).click();
        await enter(page,'S01');expect((await read(page)).propArt.cachedKeys.some((key:string)=>flightKeys.includes(key))).toBe(false);
        await enter(page,'S10');await inspect('S10');await capture('S10-revisit');
        for(const key of flightKeys)expect(requested.some(url=>url.endsWith(`${key}.webp`))).toBe(true);
        expect(errors).toEqual([]);
        writeFileSync(`docs/validation/m6-flight-${device}-${fallback?'fallback':'normal'}.json`,JSON.stringify({date:new Date().toISOString(),pass:true,method:'explicit stage/treasure/claimed-reward save fixtures; live respawned enemies; actual keyboard/menu movement; not a fresh campaign or physical touch test',observations,damage:{before:beforeDamage,after:damaged.player.hp},ringCoins:{before:initial.save.coins,after:collected.save.coins},pauseSim:paused.sim,saved,requested,blocked,screens,errors},null,2));
    });
}
