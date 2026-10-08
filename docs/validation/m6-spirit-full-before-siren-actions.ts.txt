import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import siren from '../../src/content/siren-actions.generated.json' with {type:'json'};
import {evidencePath} from './art-evidence';
import {moveJourney,useJourney,skipJourneyDialogue} from './journey-bot';
test.use({hasTouch:true});
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
interface EnemyView {id:string;x:number;y:number;hp:number;state:string;visible:boolean;texture:string;frame:number;flipX:boolean;originX:number;originY:number;displayHeight:number;footOffset:number;label:string}
interface Shot {texture:string;vx:number;vy:number;wave:boolean}
const boss=maps.S02.spawns.find(e=>e.kind==='siren')!;
async function resume(page:Page){
    await page.reload();await page.getByRole('button',{name:'이어하기 · S02'}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.stage==='S02');await page.waitForTimeout(2600);
}
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    for(const fallback of [false,true])test(`${device} siren ${fallback?'missing-sheet recovery':'four actions'} preserves shield, two songs and saved reward`,async({page})=>{
        test.setTimeout(4*60*1000);await page.setViewportSize(viewport);
        const errors:string[]=[],blocked:string[]=[],checks:unknown[]=[],screens:string[]=[];
        page.on('pageerror',error=>errors.push(error.message));
        page.on('console',message=>{if(message.type()==='error'&&!(fallback&&message.text().includes('ERR_FAILED')))errors.push(message.text());});
        page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
        if(fallback)await page.route('**/assets/webtoon/siren-actions.webp',route=>{blocked.push(route.request().url());return route.abort();});
        await page.goto('/');mkdirSync(evidencePath('m6-siren'),{recursive:true});
        // Explicit checkpoint/level and two completed shells isolate this boss.
        // Shell three, combat, weapon acquisition, dialogue and reload use real input.
        const save=freshSave();save.checkpoint={stageId:'S02',checkpointId:'boss'};
        save.totalXp=5000;save.completedObjectiveIds=['S02.shell.1','S02.shell.2'];
        save.clearedStageIds=['S01'];save.settings.aimAssist=false;save.settings.reducedMotion=device==='tablet';
        await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});await resume(page);
        const enemy=async()=>(await read(page)).enemies.find((e:EnemyView)=>e.id===boss.id) as EnemyView;
        const inspect=(e:EnemyView)=>{
            expect(e.texture).toBe(fallback?'siren-webtoon':'siren-actions');
            if(!fallback){
                const pose=e.state==='telegraph'?1:e.state==='attack'?2:e.state==='defeated'?3:0;
                expect(e.frame).toBe(pose);expect(e.originX).toBe(.5);
                if(e.state!=='defeated'){
                    expect((siren.frames[pose].baseline/512-e.originY)*e.displayHeight).toBeCloseTo(58,6);
                    expect(e.displayHeight).toBeCloseTo(128*512/siren.idleHeight,6);
                }
            }
        };
        const capture=async(label:string,state?:string)=>{
            if(state)await page.waitForFunction(({id,state})=>Reflect.get(window,'__SINBAD_TEST__')?.enemies.find((e:EnemyView)=>e.id===id)?.state===state,{id:boss.id,state});
            const observed=await enemy();inspect(observed);
            const path=evidencePath(`m6-siren/${device}-${fallback?'fallback':'normal'}-${label}.png`);
            await page.screenshot({path});screens.push(path);checks.push({label,observed,path});return observed;
        };
        await moveJourney(page,boss.x-55,boss.y);await capture('shield','idle');
        const shieldHp=(await enemy()).hp;await page.keyboard.press('j');await page.waitForTimeout(550);
        expect((await enemy()).hp).toBe(shieldHp);expect((await enemy()).label).toContain('조개 종 3개');
        await useJourney(page,maps.S02.objects.find(o=>o.id==='S02.shell.3')!);
        expect((await read(page)).save.completedObjectiveIds).toContain('S02.shell.3');
        await moveJourney(page,boss.x-700,boss.y);await capture('idle','idle');
        await moveJourney(page,boss.x-290,boss.y);await capture('telegraph','telegraph');
        await page.locator('#pause').click();const paused=await read(page);await page.waitForTimeout(400);
        expect((await read(page)).sim).toBe(paused.sim);expect((await read(page)).enemies).toEqual(paused.enemies);
        await page.locator('#resume').click();await capture('attack','attack');
        const wave=(await read(page)).projectileArt.filter((p:Shot)=>p.texture==='projectile-siren-wave');
        expect(wave).toHaveLength(1);expect(wave[0].vx).toBe(-230);expect(wave[0].vy).toBe(0);
        checks.push({pattern:'wave',shots:wave});await capture('recover','recover');
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.projectileArt.filter((p:Shot)=>p.texture==='projectile-siren-note').length===3);
        const notes=(await read(page)).projectileArt.filter((p:Shot)=>p.texture==='projectile-siren-note');
        expect(notes.map((p:Shot)=>p.vy)).toEqual([-140,-55,35]);expect(notes.every((p:Shot)=>p.vx===-190)).toBe(true);
        checks.push({pattern:'three notes',shots:notes});
        await moveJourney(page,boss.x+160,boss.y);await expect.poll(async()=>(await enemy()).flipX).toBe(false);await capture('right');
        await moveJourney(page,boss.x+55,boss.y);await page.keyboard.down('a');await page.waitForTimeout(30);await page.keyboard.up('a');
        const before=(await read(page)).save as Save;const beforeHp=(await enemy()).hp;
        await page.getByRole('button',{name:'터치 행동',exact:true}).tap();await expect.poll(async()=>(await enemy()).hp).toBeLessThan(beforeHp);
        for(let hit=0;hit<30&&(await enemy()).hp>0;hit++){await page.waitForTimeout(500);await page.keyboard.press('j');}
        expect((await enemy()).hp).toBe(0);await capture('defeated','defeated');
        expect((await enemy()).label).toBe('저주가 풀렸어!');expect((await read(page)).projectiles).toBe(0);
        await skipJourneyDialogue(page);await expect.poll(async()=>(await enemy()).visible).toBe(false);
        const rewarded=(await read(page)).save as Save;
        expect(rewarded.totalXp).toBe(before.totalXp+50);expect(rewarded.coins).toBe(before.coins+3);
        expect(rewarded.claimedRewardIds.filter(id=>id===boss.id)).toHaveLength(1);expect(rewarded.weapons).not.toContain('W02');
        await useJourney(page,maps.S02.objects.find(o=>o.id==='S02.boomerang')!);
        const acquired=(await read(page)).save as Save;expect(acquired.weapons).toContain('W02');
        expect(acquired.claimedRewardIds.filter(id=>id==='S02.boomerang.reward')).toHaveLength(1);await capture('weapon');
        await resume(page);expect((await read(page)).enemies.some((e:EnemyView)=>e.id===boss.id)).toBe(false);
        const restored=(await read(page)).save as Save;expect(restored.claimedRewardIds).toEqual(acquired.claimedRewardIds);
        expect(restored.totalXp).toBe(acquired.totalXp);expect(restored.coins).toBe(acquired.coins);expect(restored.weapons).toContain('W02');
        await moveJourney(page,4050,560);await page.keyboard.press('e');await skipJourneyDialogue(page);
        expect((await read(page)).save.claimedRewardIds).toEqual(acquired.claimedRewardIds);
        await page.locator('#bag').click();await page.locator('[data-stage="S01"]').click();
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.stage==='S01');
        expect((await read(page)).cachedActionKeys).toEqual(['enemy-actions']);if(fallback)expect(blocked.length).toBeGreaterThan(0);
        expect(errors).toEqual([]);
        writeFileSync(evidencePath(`m6-siren/${device}-${fallback?'fallback':'normal'}.json`),JSON.stringify({device,viewport,fallback,fixture:{checkpoint:'S02.boss',totalXp:5000,precompletedShells:2},checks,screens,blocked,before,rewarded,acquired,restored,cachedActionKeys:(await read(page)).cachedActionKeys,errors,artStatus:'ART_DRAFT'},null,2));
    });
}
