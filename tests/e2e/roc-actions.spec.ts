import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import roc from '../../src/content/roc-actions.generated.json' with {type:'json'};
import {evidencePath} from './art-evidence';
import {moveJourney,fightRocJourney,skipJourneyDialogue} from './journey-bot';

test.use({hasTouch:true});
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
interface EnemyView {id:string;x:number;y:number;hp:number;state:string;visible:boolean;texture:string;frame:number;flipX:boolean;originX:number;originY:number;displayHeight:number;footOffset:number;label:string}
function fixture(stage:string,reduced:boolean){
    const save=freshSave();save.checkpoint={stageId:stage,checkpointId:'start'};save.totalXp=5000;
    save.clearedStageIds=Array.from({length:Number(stage.slice(1))-1},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
    save.treasures=stage==='S09'?['T01','T02']:['T01','T02','T03'];save.weapons=['W01','W02','W03'];
    save.flags=['bubbleBlessing','genieCave'];save.settings.aimAssist=false;save.settings.reducedMotion=reduced;return save;
}
async function resume(page:Page,stage:string){
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${stage}`}).click();
    await page.waitForFunction(stage=>Reflect.get(window,'__SINBAD_TEST__')?.stage===stage&&!!Reflect.get(window,'__SINBAD_TEST__')?.player,stage);await page.waitForTimeout(2200);
}
async function load(page:Page,save:Save){
    await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});await resume(page,save.checkpoint.stageId);
}
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    for(const fallback of [false,true])test(`${device} roc ${fallback?'missing-sheet recovery':'six actions'} boss, saddle and return flight`,async({page})=>{
        test.setTimeout(8*60*1000);await page.setViewportSize(viewport);
        const errors:string[]=[],blocked:string[]=[],checks:unknown[]=[],screens:string[]=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('console',m=>{if(m.type()==='error'&&!(fallback&&m.text().includes('ERR_FAILED')))errors.push(m.text());});
        page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
        if(fallback)await page.route('**/assets/webtoon/roc-actions.webp',route=>{blocked.push(route.request().url());return route.abort();});
        await page.goto('/');mkdirSync(evidencePath('m6-roc'),{recursive:true});
        const shot=async(label:string,observed:unknown)=>{
            const path=evidencePath(`m6-roc/${device}-${fallback?'fallback':'normal'}-${label}.png`);
            await page.screenshot({path});screens.push(path);checks.push({label,observed,path});
        };
        // Stage/level fixtures isolate artwork. Boss timing, movement, touch
        // attacks, seals, treasure dialogue and save reload use normal controls.
        await load(page,fixture('S09',device==='tablet'));
        const enemy=async()=>(await read(page)).enemies.find((e:EnemyView)=>e.id==='S09.enemy.3') as EnemyView|undefined;
        const capture=async(state:string)=>{
            const h=await page.waitForFunction(state=>{
                const e=Reflect.get(window,'__SINBAD_TEST__')?.enemies.find((e:EnemyView)=>e.id==='S09.enemy.3');return e?.state===state?e:false;
            },state);const e=await h.jsonValue() as EnemyView;await h.dispose();
            expect(e.texture).toBe(fallback?'roc-webtoon':'roc-actions');
            if(!fallback){expect(e.frame).toBe(state==='telegraph'?1:state==='attack'?2:state==='defeated'?3:0);expect(e.footOffset).toBe(50.75);}
            await shot(`S09-${state}`,e);return e;
        };
        await capture('idle');expect((await enemy())!.hp).toBe(3);
        const gift=maps.S09.objects.find(o=>o.kind==='gift')!;
        await moveJourney(page,gift.x,550);await page.keyboard.press('e');await page.waitForTimeout(180);
        expect((await read(page)).save.treasures).not.toContain('T03');
        expect((await read(page)).save.treasures).not.toContain('T03');
        await moveJourney(page,(await enemy())!.x-55,550);
        // A wing gust only hits the warned side, and the dive locks its old
        // target. Use the stationary peck for this intentional-contact check.
        await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.rocEncounter?.pattern===0&&s.enemies.find((e:EnemyView)=>e.id==='S09.enemy.3')?.state==='telegraph';},undefined,{timeout:20000});
        await capture('telegraph');
        await page.locator('#pause').click();const paused=await read(page);await page.waitForTimeout(350);
        expect((await read(page)).sim).toBe(paused.sim);expect((await read(page)).enemies).toEqual(paused.enemies);
        const hp=paused.player.hp;await page.locator('#resume').click();await capture('attack');await capture('recover');
        await expect.poll(async()=>(await read(page)).player.hp).toBeLessThan(hp);
        await moveJourney(page,(await enemy())!.x+100,550);await expect.poll(async()=>(await enemy())!.flipX).toBe(false);await shot('S09-right',await enemy());
        const before=(await read(page)).save as Save;
        await fightRocJourney(page);
        const defeated=await capture('defeated');expect(defeated.label).toBe('저주가 풀렸어!');
        await expect.poll(async()=>(await enemy())!.visible).toBe(false);
        const rewarded=(await read(page)).save as Save;
        expect(rewarded.totalXp-before.totalXp).toBe(6);expect(rewarded.coins-before.coins).toBe(3);
        expect(rewarded.claimedRewardIds.filter(id=>id==='S09.enemy.3')).toHaveLength(1);expect(rewarded.treasures).not.toContain('T03');
        await moveJourney(page,gift.x,550);await page.keyboard.press('e');await expect(page.getByTestId('dialogue-text')).toBeVisible();
        const treasure=(await read(page)).save as Save;expect(treasure.treasures).toContain('T03');await shot('S09-treasure',treasure);
        await resume(page,'S09');expect(await enemy()).toBeUndefined();expect((await read(page)).save.claimedRewardIds).toEqual(treasure.claimedRewardIds);
        expect((await read(page)).save.treasures).toEqual(treasure.treasures);await shot('S09-resume',await read(page));
        await moveJourney(page,2600,550);await page.keyboard.press('ArrowUp');await page.waitForTimeout(240);
        expect((await read(page)).player.grounded).toBe(false);
        // The renewed upward velocity is brief. Observe each animation frame
        // rather than the coarse expect.poll intervals that can miss it.
        await page.keyboard.press('ArrowUp');
        const jump=await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.player.vy<-450?s:false;});
        const airborne=await jump.jsonValue();await jump.dispose();await shot('S09-double-jump',airborne);
        for(const stage of ['S10','S33']){
            await load(page,fixture(stage,device==='tablet'));
            const inspect=(s:Awaited<ReturnType<typeof read>>)=>{
                const {mount,rider,passenger}=s.flightArt;
                expect(s.player.bodyWidth).toBe(42);expect(s.player.bodyHeight).toBe(84);
                expect(mount.texture).toBe(fallback?'roc-webtoon':'roc-actions');
                if(!fallback){
                    expect([2,4,5]).toContain(mount.frame);const seat=roc.frames[mount.frame].seat;
                    expect(mount.originX).toBeCloseTo(mount.flipX?1-seat[0]/512:seat[0]/512,8);
                    expect(mount.originY).toBeCloseTo(seat[1]/512,8);
                    expect(mount.displayWidth).toBeCloseTo(307.2,8);expect(mount.displayHeight).toBeCloseTo(307.2,8);
                    expect(mount.x).toBe(rider.x);expect(mount.y).toBe(rider.y);
                    expect(rider.x-s.player.x).toBeCloseTo(mount.flipX?-36:36,8);expect(rider.y-s.player.y).toBeCloseTo(10,8);
                }
                if(stage==='S33'){expect(passenger).not.toBeNull();expect(passenger.y-s.player.y).toBeCloseTo(10,8);expect(Math.abs(passenger.x-s.player.x)).toBeCloseTo(3,8);}
                else expect(passenger).toBeNull();
            };
            for(const frame of fallback?[null]:device==='tablet'?[4]:[4,5]){
                const h=await page.waitForFunction(frame=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.flightArt&&(frame===null||s.flightArt.mount.frame===frame)?s:false;},frame);
                const s=await h.jsonValue();await h.dispose();inspect(s);await shot(`${stage}-frame${frame}`,s);
            }
            // Phaser integrates the physics body after scene update. Settle
            // momentum before comparing that body with the rendered anchors.
            await page.keyboard.down('a');await page.waitForTimeout(120);await page.keyboard.up('a');await page.waitForTimeout(180);
            const left=await read(page);inspect(left);expect(left.flightArt.mount.flipX).toBe(true);await shot(`${stage}-left`,left);
            await page.locator('#pause').click();const p=await read(page);await page.waitForTimeout(350);
            expect((await read(page)).sim).toBe(p.sim);expect((await read(page)).flightArt).toEqual(p.flightArt);await page.locator('#resume').click();
            const def=maps[stage].spawns[0];await moveJourney(page,def.x-65,def.y);
            await page.keyboard.down('d');await page.waitForTimeout(30);await page.keyboard.up('d');
            const beforeAttack=await read(page);const action=page.getByRole('button',{name:'터치 행동',exact:true});await expect(action).toHaveAttribute('data-kind','attack');await action.tap();
            if(!fallback){const h=await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.flightArt?.mount.frame===2?s:false;});const s=await h.jsonValue();await h.dispose();inspect(s);await shot(`${stage}-attack`,s);}
            await expect.poll(async()=>(await read(page)).enemies.find((e:EnemyView)=>e.id===def.id).hp).toBe(beforeAttack.enemies.find((e:EnemyView)=>e.id===def.id).hp-22);
            const cp=maps[stage].checkpoints.find(cp=>cp.id==='middle')!;await moveJourney(page,cp.x,cp.y);
            await expect.poll(async()=>(await read(page)).save.checkpoint.checkpointId).toBe('middle');const saved=(await read(page)).save;
            await resume(page,stage);inspect(await read(page));expect((await read(page)).save.claimedRewardIds).toEqual(saved.claimedRewardIds);await shot(`${stage}-resume`,await read(page));
        }
        await skipJourneyDialogue(page);await load(page,fixture('S01',false));
        expect((await read(page)).flightArt).toBeNull();expect((await read(page)).cachedActionKeys).not.toContain('roc-actions');
        if(fallback)expect(blocked.length).toBeGreaterThan(0);expect(errors).toEqual([]);
        writeFileSync(evidencePath(`m6-roc/${device}-${fallback?'fallback':'normal'}.json`),JSON.stringify({fixture:true,device,fallback,errors,blocked,checks,screens},null,2));
    });
}
