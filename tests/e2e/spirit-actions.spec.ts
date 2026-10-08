import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import spirit from '../../src/content/spirit-actions.generated.json' with {type:'json'};
import {evidencePath} from './art-evidence';
import {moveJourney,useJourney} from './journey-bot';

test.use({hasTouch:true});
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
interface EnemyView {id:string;x:number;y:number;hp:number;state:string;visible:boolean;texture:string;frame:number;flipX:boolean;originX:number;originY:number;displayHeight:number;footOffset?:number;label:string}
const fixture=(stage:string,reducedMotion:boolean)=>{
    const save=freshSave();save.checkpoint={stageId:stage,checkpointId:'start'};
    save.clearedStageIds=Array.from({length:Number(stage.slice(1))-1},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
    save.totalXp=5000;save.flags=['bubbleBlessing'];
    if(stage==='S07')save.treasures=['T01'];
    if(stage==='S32'){save.treasures=['T01','T02','T03','T04','T05','T06','T07'];save.weapons=['W01','W02','W03','W04','W05','W06','W07'];}
    save.settings.reducedMotion=reducedMotion;save.settings.aimAssist=false;return save;
};
async function resume(page:Page,stage:string){
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${stage}`}).click();
    await page.waitForFunction(stage=>Reflect.get(window,'__SINBAD_TEST__')?.stage===stage,stage);await page.waitForTimeout(2600);
}
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    for(const fallback of [false,true])test(`${device} spirits ${fallback?'missing-sheet recovery':'four actions'} in storm, flame, waves and final tower`,async({page})=>{
        test.setTimeout(12*60*1000);await page.setViewportSize(viewport);
        const errors:string[]=[],requests:string[]=[],blocked:string[]=[],checks:unknown[]=[],screens:string[]=[];
        page.on('pageerror',error=>errors.push(error.message));
        page.on('console',message=>{if(message.type()==='error'&&!(fallback&&message.text().includes('ERR_FAILED')))errors.push(message.text());});
        page.on('request',request=>{if(request.url().endsWith('spirit-actions.webp'))requests.push(request.url());});
        page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
        if(fallback)await page.route('**/assets/webtoon/spirit-actions.webp',route=>{blocked.push(route.request().url());return route.abort();});
        await page.goto('/');mkdirSync(evidencePath('m6-spirit'),{recursive:true});
        for(const stage of ['S03','S06','S07','S32']){
            // Explicit stage/level/item fixture isolates art. All movement,
            // contact damage, touch attacks, rewards and resume use the game.
            await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save:fixture(stage,device==='tablet')});
            await resume(page,stage);const def=maps[stage].spawns[0];
            const enemy=async()=>(await read(page)).enemies.find((e:EnemyView)=>e.id===def.id) as EnemyView|undefined;
            const inspect=(e:EnemyView)=>{
                expect(e.texture).toBe(fallback?'spirit':'spirit-actions');
                if(!fallback){
                    const pose=e.state==='telegraph'?1:e.state==='attack'?2:e.state==='defeated'?3:0;
                    expect(e.frame).toBe(pose);const centre=spirit.frames[pose].centre;
                    expect(e.originX).toBeCloseTo(e.flipX?1-centre[0]/512:centre[0]/512,8);
                    expect(e.originY).toBeCloseTo(centre[1]/512,8);
                    const size=116*512/spirit.idleHeight;
                    if(e.state==='defeated'){expect(e.displayHeight).toBeGreaterThanOrEqual(size-1e-6);expect(e.displayHeight).toBeLessThanOrEqual(size*1.25+1e-6);}
                    else expect(e.displayHeight).toBeCloseTo(size,6);
                    expect(e.footOffset).toBe(64);
                }
            };
            const shot=async(label:string,observed:unknown)=>{
                const path=evidencePath(`m6-spirit/${device}-${fallback?'fallback':'normal'}-${stage}-${label}.png`);
                await page.screenshot({path});screens.push(path);checks.push({stage,label,observed,path});
            };
            const capture=async(state:string)=>{
                const handle=await page.waitForFunction(({id,state})=>{
                    const e=Reflect.get(window,'__SINBAD_TEST__')?.enemies.find((e:EnemyView)=>e.id===id);return e?.state===state?e:false;
                },{id:def.id,state});
                const observed=await handle.jsonValue() as EnemyView;await handle.dispose();inspect(observed);await shot(state,observed);return observed;
            };
            expect((await read(page)).enemies).toHaveLength(maps[stage].spawns.length);
            for(const e of (await read(page)).enemies)inspect(e);
            await capture('idle');
            // Read the target again after its approach, so momentum cannot
            // carry the hero across a moving spirit before the left-facing check.
            await moveJourney(page,(await enemy())!.x-140,552);
            await moveJourney(page,(await enemy())!.x-85,552);await capture('telegraph');
            await page.locator('#pause').click();const paused=await read(page);await page.waitForTimeout(400);
            expect((await read(page)).sim).toBe(paused.sim);expect((await read(page)).enemies).toEqual(paused.enemies);
            const hpBefore=(await read(page)).player.hp;await page.locator('#resume').click();const attack=await capture('attack');
            expect(attack.flipX).toBe(true);expect(attack.y).toBe(def.y);
            await capture('recover');const hpAtFirstRecovery=(await read(page)).player.hp;
            // An earlier hit can leave the hero invulnerable for this cycle.
            // Observe subsequent real cycles without changing the damage rule;
            // S03 also has its existing lightning (not isolated contact damage).
            if(hpAtFirstRecovery>=hpBefore)await expect.poll(async()=>(await read(page)).player.hp).toBeLessThan(hpBefore);
            const hpAfter=(await read(page)).player.hp;expect(hpAfter).toBeLessThan(hpBefore);expect((await read(page)).projectiles).toBe(0);
            await moveJourney(page,(await enemy())!.x+130,552);
            await expect.poll(async()=>(await enemy())!.flipX).toBe(false);inspect((await enemy())!);await shot('right',(await enemy())!);
            const before=(await read(page)).save as Save;
            for(let hit=0;hit<8&&(await enemy())!.hp>0;hit++){
                await moveJourney(page,(await enemy())!.x-55,552);
                // The spirit can approach past the first destination while we
                // walk. Re-read its live position, settle, then face the target
                // so a touch attack cannot turn into inspecting the nearby vine.
                await moveJourney(page,(await enemy())!.x-55,552);
                const aimed=await read(page),target=aimed.enemies.find((e:EnemyView)=>e.id===def.id);
                const facing=target.x>aimed.player.x?'d':'a';
                await page.keyboard.down(facing);await page.waitForTimeout(30);await page.keyboard.up(facing);
                const hp=(await enemy())!.hp;
                if(hit===0){
                    // The nearby vine/hint can make the primary button inspect.
                    // Wait for the game to offer attack during the next wind-up.
                    const action=page.getByRole('button',{name:'터치 행동',exact:true});
                    await expect(action).toHaveAttribute('data-kind','attack');await action.tap();
                }else await page.keyboard.press('j');
                await expect.poll(async()=>(await enemy())!.hp).toBeLessThan(hp);
                if((await enemy())!.hp>0)await page.waitForTimeout(440);
            }
            await capture('defeated');expect((await enemy())!.label).toBe('빛으로 돌아갔어요');
            await expect.poll(async()=>(await enemy())!.visible).toBe(false);
            const rewarded=(await read(page)).save as Save;
            expect(rewarded.claimedRewardIds.filter(id=>id===def.id)).toHaveLength(1);
            expect(rewarded.totalXp-before.totalXp).toBe(6);expect(rewarded.coins-before.coins).toBe(3);
            await resume(page,stage);const restored=(await read(page)).save as Save;
            expect(restored.claimedRewardIds).toEqual(rewarded.claimedRewardIds);expect(restored.totalXp).toBe(rewarded.totalXp);expect(restored.coins).toBe(rewarded.coins);
            if(stage==='S06'){
                expect(await enemy()).toBeUndefined();expect((await read(page)).enemies).toHaveLength(4);
                expect(restored.completedObjectiveIds).toContain(def.id);expect(restored.treasures).not.toContain('T01');
                // One calmed spirit does not grant the first treasure early.
                await moveJourney(page,3300,552);await page.keyboard.press('e');await page.waitForTimeout(150);
                expect((await read(page)).save.treasures).not.toContain('T01');
                const checkpoint=maps.S06.checkpoints.find(cp=>cp.id==='middle')!;
                await moveJourney(page,checkpoint.x,552);
                await expect.poll(async()=>(await read(page)).save.checkpoint.checkpointId).toBe('middle');
            }else{
                // Respawning art must not pay the stable enemy reward again.
                for(let hit=0;hit<8&&(await enemy())!.hp>0;hit++){
                    await moveJourney(page,(await enemy())!.x-55,552);await page.keyboard.down('d');await page.waitForTimeout(30);await page.keyboard.up('d');
                    await page.keyboard.press('j');await page.waitForTimeout(440);
                }
                expect((await enemy())!.hp).toBe(0);
                expect((await read(page)).save.coins).toBe(rewarded.coins);expect((await read(page)).save.totalXp).toBe(rewarded.totalXp);
                if(stage==='S07'){
                    await useJourney(page,maps.S07.objects.find(o=>o.id==='S07.wave.1')!);
                    await moveJourney(page,1410,460);
                    await expect.poll(async()=>(await read(page)).save.checkpoint.checkpointId).toBe('first');
                    expect((await read(page)).save.flags).toContain('bubbleBlessing');expect((await read(page)).save.treasures).toContain('T01');
                }else{
                    const cp=maps[stage].checkpoints.find(cp=>cp.id==='middle')!;await moveJourney(page,cp.x,550);
                    await expect.poll(async()=>(await read(page)).save.checkpoint.checkpointId).toBe('middle');
                }
            }
            const checkpoint=await read(page);await shot('checkpoint',checkpoint);
            await resume(page,stage);const reopened=await read(page);
            expect(reopened.save.checkpoint).toEqual(checkpoint.save.checkpoint);
            const cp=maps[stage].checkpoints.find(cp=>cp.id===checkpoint.save.checkpoint.checkpointId)!;
            expect(reopened.player.x).toBeCloseTo(cp.x,1);expect(reopened.player.grounded).toBe(true);
            expect(reopened.save.claimedRewardIds).toEqual(checkpoint.save.claimedRewardIds);
            expect(reopened.save.treasures).toEqual(checkpoint.save.treasures);await shot('resume',reopened);
            checks.push({stage,hpBefore,hpAtFirstRecovery,hpAfter,damageIncludesLightning:stage==='S03',before,rewarded,restored,checkpoint,reopened});
        }
        await page.locator('#bag').click();await page.locator('[data-stage="S01"]').click();
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.stage==='S01');
        expect((await read(page)).cachedActionKeys).toEqual(['enemy-actions']);
        if(fallback){expect(requests.length).toBeGreaterThanOrEqual(12);expect(blocked).toEqual(requests);}else expect(requests).toHaveLength(12);
        expect(errors).toEqual([]);
        writeFileSync(evidencePath(`m6-spirit/${device}-${fallback?'fallback':'normal'}.json`),JSON.stringify({device,viewport,fallback,fixture:true,checks,screens,requests,blocked,errors,artStatus:'ART_DRAFT'},null,2));
    });
}
