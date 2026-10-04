import {evidencePath} from './art-evidence';
import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import campaign from '../../src/content/stageIndex';
import {moveJourney,fightJourney,skipJourneyDialogue} from './journey-bot';

interface ProjectileView {x:number;y:number;vx:number;vy:number;wave:boolean;start:number;remaining:number;type:string;texture:string;frame:number|null;flipX:boolean;rotation:number;displayWidth:number;displayHeight:number;glyph:string|null}
interface EffectView {texture:string;frame:number;start:number;remaining:number;displayWidth:number;displayHeight:number}
interface ArtState {stage:string;sim:number;paused:boolean;player:{x:number;y:number;hp:number};save:Save;
    projectileArt:ProjectileView[];effectArt:EffectView[];cachedEffectKeys:string[];
    enemies:{id:string;x:number;y:number;hp:number;state:string;visible:boolean;label:string}[]}
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__')) as Promise<ArtState>;
const devices={phone:{width:844,height:390},tablet:{width:1180,height:820}};
const shot=(device:string,name:string)=>evidencePath(`art-a7/${device}-${name}.png`);
function fixture(stage:string,targetX:number,reduced=false){
    const save=freshSave(),prior=campaign.slice(0,Number(stage.slice(1))-1);
    save.checkpoint={stageId:stage,checkpointId:maps[stage].checkpoints.filter(cp=>cp.x<targetX-250).sort((a,b)=>b.x-a.x)[0]?.id??'start'};
    save.clearedStageIds=prior.map(s=>s.id);save.flags=[...new Set(prior.flatMap(s=>s.rewardFlags))];
    save.totalXp=10000;save.weapons=['W01','W02','W03','W04','W05','W06','W07'];save.equippedWeapon='W07';
    save.treasures=['T01','T02','T03','T04','T05','T06','T07'];save.settings.reducedMotion=reduced;
    save.settings.aimAssist=true;
    if(stage==='S02')save.completedObjectiveIds=['S02.shell.1','S02.shell.2','S02.shell.3'];
    return save;
}
async function load(page:Page,save:Save){
    await page.goto('/');await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${save.checkpoint.stageId}`}).click();
    await page.waitForFunction(()=>!!Reflect.get(window,'__SINBAD_TEST__')?.player);
}
async function approachCaster(page:Page,stage:string,reduced=false){
    const kind=stage==='S02'?'siren':stage==='S10'?'kite':'boss';
    const def=maps[stage].spawns.find(e=>e.kind===kind)!;
    await load(page,fixture(stage,def.x,reduced));
    if(stage==='S31'){
        await moveJourney(page,def.x-130,def.y);
        // Kuura can walk 90px before winding up. Observe the real first
        // recovery, park within his actual range, then retreat on a fresh
        // telegraph instead of assuming the map's spawn X is still his X.
        await page.waitForFunction(id=>Reflect.get(window,'__SINBAD_TEST__')?.enemies.find((e:{id:string;state:string})=>e.id===id)?.state==='recover',def.id);
        let caster=(await read(page)).enemies.find(e=>e.id===def.id)!;
        await moveJourney(page,caster.x-125,def.y);
        await page.waitForFunction(id=>Reflect.get(window,'__SINBAD_TEST__')?.enemies.find((e:{id:string;state:string})=>e.id===id)?.state==='telegraph',def.id);
        caster=(await read(page)).enemies.find(e=>e.id===def.id)!;
        await moveJourney(page,caster.x-430,def.y);
    }else await moveJourney(page,def.x-360,def.y);
    return def;
}
async function sampleProjectile(page:Page,key:string,device:string,reduced=false,vxSign=0){
    await page.waitForFunction(({key,vxSign})=>Reflect.get(window,'__SINBAD_TEST__')?.projectileArt?.some((p:ProjectileView)=>p.texture===key&&p.remaining>3700&&(!vxSign||Math.sign(p.vx)===vxSign)),{key,vxSign},{timeout:15000});
    const state=await read(page),anchor=state.projectileArt.find(p=>p.texture===key&&(!vxSign||Math.sign(p.vx)===vxSign))!;
    expect(anchor.type).toBe('Sprite');expect(anchor.glyph).toBeNull();expect(anchor.displayWidth).toBe(64);expect(anchor.displayHeight).toBe(64);
    if(key==='projectile-siren-wave')expect(anchor.flipX).toBe(anchor.vx<0);
    if(key==='projectile-kite-wind')expect(anchor.rotation).toBeCloseTo(Math.atan2(anchor.vy,anchor.vx),6);
    // Capture after the projectile separates from its caster's silhouette.
    await page.waitForTimeout(280);
    const path=shot(device,`${reduced?'reduced-':''}${key}${vxSign>0?'-right':''}`);await page.screenshot({path});
    const samples=await page.evaluate(({anchor})=>new Promise<{sim:number;p:ProjectileView}[]>(resolve=>{
        const samples:{sim:number;p:ProjectileView}[]=[];const start=performance.now();
        function tick(){
            const s=Reflect.get(window,'__SINBAD_TEST__') as ArtState|undefined;
            const p=s?.projectileArt?.find(p=>p.texture===anchor.texture&&p.start===anchor.start&&p.vx===anchor.vx&&p.vy===anchor.vy);
            if(p)samples.push({sim:s!.sim,p});
            if(performance.now()-start>=650)resolve(samples);else requestAnimationFrame(tick);
        }tick();
    }),{anchor});
    expect(samples.length).toBeGreaterThan(8);
    expect([...new Set(samples.map(s=>s.p.frame))].sort()).toEqual(reduced?[0]:[0,1,2,3]);
    for(let i=1;i<samples.length;i++){
        const a=samples[i-1],b=samples[i],dt=(b.sim-a.sim)/1000;
        expect(b.p.x-a.p.x).toBeCloseTo(a.p.vx*dt,6);expect(b.p.y-a.p.y).toBeCloseTo(a.p.vy*dt,6);
        expect(b.p.remaining-a.p.remaining).toBeCloseTo(-(b.sim-a.sim),6);
    }
    return {key,path,anchor,samples};
}

test('four looping projectiles, directions, paused clock and reduced-motion boss cleanup on phone/tablet',async({page})=>{
    test.setTimeout(7*60*1000);
    mkdirSync(evidencePath('art-a7'),{recursive:true});const errors:string[]=[],requests:string[]=[],checks:unknown[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    page.on('request',r=>{if(/\/(projectile-|effect-)[^/]+\.webp$/.test(r.url()))requests.push(r.url());});
    for(const [device,viewport] of Object.entries(devices)){
        await page.setViewportSize(viewport);const siren=await approachCaster(page,'S02');
        checks.push(await sampleProjectile(page,'projectile-siren-wave',device));
        await page.getByRole('button',{name:'일시정지',exact:true}).click();const paused=await read(page);
        await page.waitForTimeout(250);const held=await read(page);
        expect(held.sim).toBe(paused.sim);expect(held.projectileArt).toEqual(paused.projectileArt);
        await page.getByRole('button',{name:'모험 계속'}).click();
        checks.push(await sampleProjectile(page,'projectile-siren-note',device));
        await moveJourney(page,siren.x+360,siren.y);
        checks.push(await sampleProjectile(page,'projectile-siren-wave',device,false,1));
        await approachCaster(page,'S10');expect((await read(page)).cachedEffectKeys).not.toContain('projectile-siren-note');
        checks.push(await sampleProjectile(page,'projectile-kite-wind',device));
        await approachCaster(page,'S31');expect((await read(page)).cachedEffectKeys).not.toContain('projectile-kite-wind');
        checks.push(await sampleProjectile(page,'projectile-kuura-orb',device));
        const reducedBoss=await approachCaster(page,'S02',true);
        checks.push(await sampleProjectile(page,'projectile-siren-wave',device,true));
        await fightJourney(page,reducedBoss.id);await skipJourneyDialogue(page);
        const earned=await read(page);expect(earned.projectileArt).toEqual([]);expect(earned.effectArt).toEqual([]);
        expect(earned.save.claimedRewardIds).toContain(reducedBoss.id);
        await page.reload();await page.getByRole('button',{name:'이어하기 · S02'}).click();
        await page.waitForFunction(()=>!!Reflect.get(window,'__SINBAD_TEST__')?.player);
        const resumed=await read(page);expect(resumed.save.claimedRewardIds).toEqual(earned.save.claimedRewardIds);
        expect(resumed.enemies.some(e=>e.id===reducedBoss.id)).toBe(false);
        checks.push({device,pauseHeld:true,reducedBossReward:earned.save.claimedRewardIds,bossProjectilesCleared:true,reloadRewardUnchanged:true});
    }
    for(const key of ['projectile-siren-wave','projectile-siren-note','projectile-kite-wind','projectile-kuura-orb','effect-hit-spark','effect-purify-light','effect-surrender-flag'])expect(requests.some(url=>url.endsWith(`/${key}.webp`))).toBe(true);
    expect(errors).toEqual([]);writeFileSync('docs/validation/a7-projectiles.json',JSON.stringify({pass:true,method:'explicit stage/gear and S02 shell fixtures; real keys, real enemy wind-up/motion, pause/reduced settings, boss combat/reload; not fresh campaign',checks,requests,errors},null,2));
});

test('six impact and safe defeat frames expire after real hits on phone/tablet',async({page})=>{
    test.setTimeout(5*60*1000);mkdirSync(evidencePath('art-a7'),{recursive:true});const checks:unknown[]=[],errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    for(const [device,viewport] of Object.entries(devices))for(const [stage,kind,defeatKey,label] of [
        ['S01','skeleton','effect-purify-light','빛으로 돌아갔어요'],['S11','bandit','effect-surrender-flag','항복했어요'],['S04','crab','effect-purify-light','저주가 풀렸어!']]){
        await page.setViewportSize(viewport);const def=maps[stage].spawns.find(e=>e.kind===kind)!;
        await load(page,fixture(stage,def.x));await moveJourney(page,def.x-55,def.y);
        const sampling=page.evaluate(()=>new Promise<EffectView[]>(resolve=>{
            const samples:EffectView[]=[],started=performance.now();
            function tick(){const s=Reflect.get(window,'__SINBAD_TEST__') as ArtState|undefined;samples.push(...s?.effectArt??[]);
                if(performance.now()-started>=1200)resolve(samples);else requestAnimationFrame(tick);}
            tick();
        }));
        await page.keyboard.press('j');
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.effectArt?.length>0);
        // Let the short impact expire so the peaceful defeat effect is clear.
        await page.waitForFunction(key=>Reflect.get(window,'__SINBAD_TEST__')?.effectArt?.some((e:EffectView)=>e.texture===key&&e.remaining<420),defeatKey);
        const path=shot(device,`${stage}-${kind}-defeat`);await page.screenshot({path});
        const samples=await sampling;
        for(const key of ['effect-hit-spark',defeatKey]){
            const frames=[...new Set(samples.filter(s=>s.texture===key).map(s=>s.frame))].sort();expect(frames).toEqual([0,1,2,3,4,5]);
        }
        expect(samples.every(s=>s.displayWidth===128&&s.displayHeight===128)).toBe(true);
        const result=await read(page),enemy=result.enemies.find(e=>e.id===def.id)!;
        expect(enemy.hp).toBe(0);expect(enemy.label).toBe(label);expect(result.effectArt).toEqual([]);
        expect(result.save.claimedRewardIds).toContain(def.id);
        await page.waitForTimeout(600);expect((await read(page)).enemies.find(e=>e.id===def.id)!.visible).toBe(kind==='bandit');
        checks.push({device,stage,kind,path,samples,earned:result.save.claimedRewardIds,label});
    }
    expect(errors).toEqual([]);writeFileSync('docs/validation/a7-effects.json',JSON.stringify({pass:true,method:'explicit level/gear fixtures, actual one-hit combat, rAF read-only sampling of all six frames; safe surrender/curse/light defeat and visual cleanup',checks,errors},null,2));
});

test('missing seven sheets retain legacy projectiles, damage, safe defeat and saved rewards',async({page})=>{
    test.setTimeout(5*60*1000);mkdirSync(evidencePath('art-a7'),{recursive:true});const failures:string[]=[],errors:string[]=[],checks:unknown[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failures.push(r.url()));
    await page.route('**/assets/webtoon/*.webp',route=>/\/(projectile-|effect-)/.test(route.request().url())?route.abort():route.continue());
    await page.setViewportSize(devices.phone);
    for(const stage of ['S02','S10','S31']){
        await approachCaster(page,stage);
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.projectileArt?.length>0);
        const observed=await read(page);expect(observed.projectileArt.every(p=>p.type==='Arc'&&p.texture==='legacy-arc'&&p.glyph)).toBe(true);
        const path=shot('phone',`${stage}-missing-sheets`);await page.screenshot({path});checks.push({stage,path,projectiles:observed.projectileArt});
        if(stage==='S02'){
            const hp=observed.player.hp;await expect.poll(async()=>(await read(page)).player.hp,{timeout:10000}).toBeLessThan(hp);
            checks.push({fallbackActualDamage:true,hpBefore:hp,hpAfter:(await read(page)).player.hp});
        }
    }
    for(const [stage,kind,label] of [['S01','skeleton','빛으로 돌아갔어요'],['S11','bandit','항복했어요']]){
        const def=maps[stage].spawns.find(e=>e.kind===kind)!;await load(page,fixture(stage,def.x));await fightJourney(page,def.id);
        const earned=await read(page);expect(earned.enemies.find(e=>e.id===def.id)!.label).toBe(label);expect(earned.effectArt).toEqual([]);
        expect(earned.save.claimedRewardIds).toContain(def.id);
        const path=shot('phone',`${stage}-fallback-defeat`);await page.screenshot({path});
        await page.reload();await page.getByRole('button',{name:`이어하기 · ${earned.save.checkpoint.stageId}`}).click();
        await page.waitForFunction(()=>!!Reflect.get(window,'__SINBAD_TEST__')?.player);
        const resumed=await read(page);expect(resumed.save.claimedRewardIds).toEqual(earned.save.claimedRewardIds);expect(resumed.save.totalXp).toBe(earned.save.totalXp);
        checks.push({stage,path,label,reloadRewardUnchanged:true});
    }
    expect(errors).toEqual([]);expect(new Set(failures.filter(url=>/\/(projectile-|effect-)/.test(url)).map(url=>url.split('/').at(-1))).size).toBe(7);
    writeFileSync('docs/validation/a7-effects-fallback.json',JSON.stringify({pass:true,method:'intentional seven sheet request aborts; actual legacy projectile damage and safe combat/reload; explicit fixtures',expectedAbortedRequests:failures,checks,errors},null,2));
});
