import {evidencePath} from './art-evidence';
import {test, expect, type Page} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';
import {freshSave, type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import {dialogues} from '../../src/content/dialogues.ko';
import {dialogueArt, npcFaceKeys} from '../../src/game/dialogueArt';
import {controlText} from '../../src/game/controlText';
import {moveJourney, readJourney} from './journey-bot';

const fixture=(stage:string,checkpoint='start',keepEnemy='')=>{
    const save=freshSave(); save.checkpoint={stageId:stage,checkpointId:checkpoint};
    save.totalXp=10000; save.weapons=['W01','W02','W03','W04','W05','W06','W07']; save.equippedWeapon='W07';
    save.treasures=['T01','T02','T03','T04','T05','T06','T07'];
    save.claimedRewardIds=maps[stage].spawns.filter(enemy=>enemy.id!==keepEnemy).map(enemy=>enemy.id);
    save.completedObjectiveIds=[...save.claimedRewardIds,...maps[stage].objects.filter(object=>object.kind==='quest').map(object=>object.id)];
    if(stage==='S05')save.completedObjectiveIds.push('S05.key','S05.crown','S05.gate');
    return save;
};
async function load(page:Page,save:Save){
    await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});
    await page.reload(); await page.getByRole('button',{name:`이어하기 · ${save.checkpoint.stageId}`}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);
}
async function replay(page:Page){await page.locator('#bag').click();await page.locator('#replay').click();}

test('nine NPCs, three real dialogue expressions, mixed speakers and reward reload on phone/tablet',async({page})=>{
    test.setTimeout(10*60*1000);
    const errors:string[]=[]; page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
    mkdirSync(evidencePath('art-a4'),{recursive:true}); await page.goto('/');
    const checks:unknown[]=[];
    for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
        await page.setViewportSize(viewport);
        const seen=new Map(npcFaceKeys.map(key=>[key,new Set<string>()]));
        const capture=async(id:string)=>{
            await expect(page.getByTestId('dialogue-text')).toBeVisible();
            const d=dialogues[id]; const rewardBefore=(await readJourney(page)).save;
            for(const [index,raw] of d.lines.entries()){
                const expected=dialogueArt(id,d.name,raw,index,'/unused.svg');
                const portrait=page.locator('.dialogue-portrait');
                await expect(page.getByTestId('dialogue-text')).toHaveText(controlText(expected.text,'keyboard'));
                await expect(page.getByTestId('dialogue-text')).not.toContainText(/\[(기쁨|걱정)\]/);
                await expect(portrait).toHaveAttribute('data-character',expected.character??'static');
                await expect(portrait).toHaveAttribute('data-frame',String(expected.frame));
                await expect(page.locator('.dialogue h2')).toHaveText(expected.speaker);
                await expect.poll(()=>portrait.locator('img').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
                const observed=await portrait.evaluate(element=>{
                    const img=element.querySelector('img')!,box=element.getBoundingClientRect();
                    return {character:element.getAttribute('data-character'),expression:element.getAttribute('data-expression'),frame:element.getAttribute('data-frame'),src:img.getAttribute('src'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,left:img.style.left,overflow:getComputedStyle(element).overflow,box:{x:box.x,y:box.y,width:box.width,height:box.height}};
                });
                expect(observed.overflow).toBe('hidden');expect(observed.box.x).toBeGreaterThanOrEqual(0);expect(observed.box.y).toBeGreaterThanOrEqual(0);
                expect(await page.locator('#notice').evaluate(element=>Number(getComputedStyle(element).zIndex))).toBeLessThan(40);
                expect(observed.box.y+observed.box.height).toBeLessThanOrEqual(viewport.height);
                if(expected.character){
                    expect(observed.src).toBe(expected.src);expect(observed.naturalWidth).toBe(768);expect(observed.naturalHeight).toBe(384);
                    expect(observed.expression).toBe(expected.expression);expect(observed.left).toBe(`${-expected.frame*100}%`);
                    seen.get(expected.character)!.add(expected.expression);
                }
                const path=evidencePath(`art-a4/${device}-${id.replace('.','-')}-${index}-${expected.character??'static'}-${observed.expression}.png`);
                await page.screenshot({path});checks.push({device,id,index,text:expected.text,observed,path});
                const frozen=await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').sim);
                await page.keyboard.down('d');await page.waitForTimeout(120);await page.keyboard.up('d');
                expect(await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').sim)).toBe(frozen);
                await page.locator('#next').click();
            }
            await expect(page.getByTestId('dialogue-text')).toBeHidden();
            const rewardAfter=(await readJourney(page)).save;
            expect(rewardAfter.claimedRewardIds).toEqual(rewardBefore.claimedRewardIds);expect(rewardAfter.totalXp).toBe(rewardBefore.totalXp);
        };
        // Fixtures isolate visual coverage; all dialogues are opened through
        // the real map replay, NPC/gift interaction or real boss attacks.
        for(const [stage,id] of [['S01','captain'],['S06','rah'],['S08','hazil'],['S08','starMap'],['S05','nairaHint'],['S20','S20.intro'],['S27','S27.intro'],['S25','S25.intro'],['S34','S34.intro'],['S02','siren']]){
            const save=fixture(stage);if(id==='starMap')save.completedObjectiveIds.push('S08.starMap');
            await load(page,save);await replay(page);await capture(id);
        }
        for(const stage of ['S27','S25','S34','S35']){
            await load(page,fixture(stage,'middle'));
            const gift=maps[stage].objects.find(object=>object.kind==='gift')!;
            await moveJourney(page,gift.x,gift.y);await page.keyboard.press('e');await capture(`${stage}.outro`);
            const saved=(await readJourney(page)).save;
            await page.reload();await page.getByRole('button',{name:`이어하기 · ${stage}`}).click();
            expect((await readJourney(page)).save.claimedRewardIds).toEqual(saved.claimedRewardIds);
            expect((await readJourney(page)).save.totalXp).toBe(saved.totalXp);
        }
        await load(page,fixture('S05','rescue'));
        await moveJourney(page,2650,554);await page.keyboard.press('e');await capture('naira');
        const saved=(await readJourney(page)).save;expect(saved.flags).toContain('bubbleBlessing');expect(saved.claimedRewardIds).toContain('S05.rescue.reward');
        await page.reload();await page.getByRole('button',{name:'이어하기 · S05'}).click();
        await moveJourney(page,2650,554);await page.keyboard.press('e');await page.locator('#skip').click();
        expect((await readJourney(page)).save.claimedRewardIds).toEqual(saved.claimedRewardIds);expect((await readJourney(page)).save.totalXp).toBe(saved.totalXp);
        await load(page,{...fixture('S02','boss','S02.enemy.siren'),completedObjectiveIds:['S02.shell.1','S02.shell.2','S02.shell.3']});
        const siren=maps.S02.spawns.find(enemy=>enemy.kind==='siren')!;
        await moveJourney(page,siren.x-60,siren.y);
        await page.keyboard.down('d');await page.waitForTimeout(35);await page.keyboard.up('d');
        for(let attempt=0;attempt<8&&!(await page.locator('#skip').isVisible());attempt++){await page.keyboard.press('j');await page.waitForTimeout(450);}
        await capture('freed');
        for(const [character,expressions] of seen)expect([...expressions].sort(),`${device} ${character}`).toEqual(['joy','neutral','worried']);
        console.log(`A4 ${device}: nine NPCs / all 27 expressions / mixed speakers / rewards / reload passed`);
    }
    expect(errors).toEqual([]);writeFileSync('docs/validation/npc-faces.json',JSON.stringify({date:new Date().toISOString(),pass:true,method:'explicit stage/item save fixtures; real keyboard/menu/dialogue/gift/boss inputs; read-only state; Edge phone/tablet viewport emulation',checks,errors},null,2));
});

test('missing expression sheet keeps the captain portrait, dialogue and save playable',async({page})=>{
    await page.setViewportSize({width:844,height:390});await page.route('**/captain-faces.webp',route=>route.abort());
    const failures:string[]=[];page.on('requestfailed',request=>failures.push(request.url()));
    await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();
    await moveJourney(page,250,554);await page.keyboard.press('e');
    const image=page.locator('.dialogue-portrait img');
    await expect(image).toHaveAttribute('src','/assets/webtoon/captain-webtoon.webp');
    await expect.poll(()=>image.evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
    await expect(page.getByTestId('dialogue-text')).toHaveText('바닷길에 검은 마법이 드리웠구나. 먼저 이 항구를 안전하게 만들자.');
    await page.screenshot({path:evidencePath('art-a4/phone-captain-fallback.png')});
    await page.locator('#skip').click();expect((await readJourney(page)).save.completedObjectiveIds).toContain('S01.captainTalk');
    expect(failures.some(url=>url.endsWith('/captain-faces.webp'))).toBe(true);
    writeFileSync('docs/validation/npc-faces-fallback.json',JSON.stringify({pass:true,expectedAbortedRequests:failures,screenshot:evidencePath('art-a4/phone-captain-fallback.png')},null,2));
});

test('read-only observations stay safe while real scene transitions dispose textures',async({page})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/chapter-7.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,150));await route.continue();});
    await page.goto('/');const save=fixture('S01');save.clearedStageIds=Object.keys(maps);await load(page,save);
    const checks:unknown[]=[];let loadingSamples=0;
    for(const target of ['S31','S32','S31','S32','S01','S35']){
        await page.locator('#bag').click();
        const observation=page.evaluate(async()=>{
            const samples:{stage:string|null;loading:boolean}[]=[];
            for(let frame=0;frame<80;frame++){
                await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
                const state=Reflect.get(window,'__SINBAD_TEST__');samples.push({stage:state.stage,loading:state.loading===true});
            }
            return samples;
        });
        await page.locator(`[data-stage="${target}"]`).click();const samples=await observation;
        loadingSamples+=samples.filter(sample=>sample.loading).length;
        await expect.poll(async()=>(await readJourney(page)).stage).toBe(target);checks.push({target,samples});
    }
    expect(loadingSamples).toBeGreaterThan(0);expect(errors).toEqual([]);
    writeFileSync('docs/validation/a4-transition.json',JSON.stringify({pass:true,method:'explicit unlocked-stage fixture; real map buttons; 80 read-only animation-frame samples per transition; chapter-7 request delayed 150ms',loadingSamples,checks,errors},null,2));
});
