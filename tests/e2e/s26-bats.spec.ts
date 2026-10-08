import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import campaign from '../../src/content/stageIndex';
import {maps} from '../../src/content/maps';
import {moveJourney,finishJourneyStage,useJourney} from './journey-bot';
import {evidencePath} from './art-evidence';

test.use({hasTouch:true});
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
function fixture(){
    const save=freshSave();save.checkpoint={stageId:'S26',checkpointId:'start'};
    save.clearedStageIds=campaign.slice(0,25).map(s=>s.id);save.flags=[...new Set(campaign.slice(0,25).flatMap(s=>s.rewardFlags))];
    save.treasures=['T01','T02','T03','T04','T05'];save.weapons=['W01','W02','W03','W04','W05','W06'];
    save.settings.difficulty='normal';save.settings.aimAssist=false;save.totalXp=420;save.equippedSkill='flamePulse';return save;
}
async function resume(page:Page){
    await page.reload();await page.getByRole('button',{name:'이어하기 · S26'}).click();
    await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.stage==='S26'&&s.player&&s.batFlights;});
}
async function state(page:Page,phase:string){
    const h=await page.waitForFunction(phase=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.enemies.find((e:{id:string;state:string})=>e.id==='S26.enemy.1')?.state===phase?s:false;},phase,{timeout:15000});
    const observed=await h.jsonValue();await h.dispose();return observed;
}
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    test(`${device} S26 five bounded bats, locked swoop, touch release and checkpoint route`,async({page})=>{
        test.setTimeout(240000);await page.setViewportSize(viewport);const fallback=device==='tablet';const errors:string[]=[];
        page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!(fallback&&m.text().includes('ERR_FAILED')))errors.push(m.text());});
        if(fallback)await page.route('**/assets/webtoon/bat-actions.webp',route=>route.abort());
        await page.goto('/');const save=fixture();save.settings.reducedMotion=fallback;
        await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});await resume(page);
        const root=evidencePath('s26-bats');mkdirSync(root,{recursive:true});const observations:unknown[]=[];
        const shot=async(name:string)=>{const record={name,observed:await read(page)};observations.push(record);writeFileSync(`${root}/${device}-${name}.json`,JSON.stringify({fallback,errors,record},null,2));await page.screenshot({path:`${root}/${device}-${name}.png`});};
        const enemy=async()=>(await read(page)).enemies.find((e:{id:string})=>e.id==='S26.enemy.1');
        expect((await read(page)).enemies).toHaveLength(5);expect((await enemy()).texture).toBe(fallback?'bat':'bat-actions');
        const samples=await page.evaluate(async()=>{
            const samples:{id:string;x:number;y:number}[][]=[];const first=Reflect.get(window,'__SINBAD_TEST__').sim;
            while(Reflect.get(window,'__SINBAD_TEST__').sim-first<4200){
                const s=Reflect.get(window,'__SINBAD_TEST__');samples.push(s.enemies.map((e:{id:string;x:number;y:number})=>({id:e.id,x:e.x,y:e.y})));
                await new Promise(resolve=>setTimeout(resolve,50));
            }return samples;
        });
        const ranges=(await read(page)).batFlights;
        for(const flight of ranges){
            const points=samples.flat().filter(p=>p.id===flight.id),b=flight.bounds;
            expect(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))).toBeGreaterThan(150);
            for(const p of points){expect(p.x).toBeGreaterThanOrEqual(b.left);expect(p.x).toBeLessThanOrEqual(b.right);expect(p.y).toBeGreaterThanOrEqual(b.top);expect(p.y).toBeLessThanOrEqual(b.bottom);}
        }
        observations.push({patrolSamples:samples});await shot('patrol');
        await page.locator('#pause').click();const paused=await read(page);await page.waitForTimeout(350);
        expect((await read(page)).sim).toBe(paused.sim);expect((await read(page)).enemies).toEqual(paused.enemies);await page.locator('#resume').click();
        let e=await enemy();await moveJourney(page,e.x-40,e.y);const locked=await state(page,'telegraph');
        const hp=locked.player.hp,target=locked.batFlights.find((b:{id:string})=>b.id==='S26.enemy.1').target;
        // Move clear of the actual locked marker before taking a screenshot.
        // A fixed horizontal destination can cross that marker on approach.
        await page.keyboard.down('ArrowUp');await shot('warning');await page.waitForTimeout(450);await page.keyboard.up('ArrowUp');const recovered=await state(page,'recover');
        expect(recovered.player.hp).toBe(hp);expect(recovered.batFlights.find((b:{id:string})=>b.id==='S26.enemy.1').target).toEqual(target);await shot('evaded');
        e=await enemy();await moveJourney(page,e.x-30,e.y);await state(page,'telegraph');const contactHp=(await read(page)).player.hp;
        await state(page,'recover');expect((await read(page)).player.hp).toBe(contactHp-14);expect((await read(page)).projectiles).toBe(0);await shot('contact');
        const before=(await read(page)).save;let touched=false;
        for(let hit=0;hit<7&&(await enemy()).hp>0;hit++){
            e=await enemy();await moveJourney(page,e.x-35,e.y);await page.keyboard.down('d');await page.waitForTimeout(30);await page.keyboard.up('d');
            if(!touched){await expect(page.getByRole('button',{name:'터치 행동',exact:true})).toHaveAttribute('data-kind','attack');await page.getByRole('button',{name:'터치 행동',exact:true}).tap();touched=true;}
            else await page.keyboard.press('j');await page.waitForTimeout(430);
        }
        expect((await enemy()).hp).toBe(0);expect((await enemy()).label).toBe('저주가 풀렸어!');
        const rewarded=(await read(page)).save;expect(rewarded.totalXp-before.totalXp).toBe(6);expect(rewarded.coins-before.coins).toBe(3);
        expect(rewarded.claimedRewardIds.filter((id:string)=>id==='S26.enemy.1')).toHaveLength(1);await shot('released');
        await moveJourney(page,1560,550);await page.keyboard.down('s');await page.waitForTimeout(650);await page.keyboard.up('s');
        await expect.poll(async()=>(await read(page)).save.checkpoint.checkpointId).toBe('middle');
        const checkpoint=await read(page);await page.waitForTimeout(2500);expect((await read(page)).player.hp).toBe(checkpoint.player.hp);await shot('safe-checkpoint');
        const saved=(await read(page)).save;await resume(page);expect((await read(page)).enemies).toHaveLength(4);
        expect((await read(page)).enemies.some((e:{id:string})=>e.id==='S26.enemy.1')).toBe(false);
        expect((await read(page)).save.claimedRewardIds).toEqual(saved.claimedRewardIds);expect((await read(page)).player.hp).toBe((await read(page)).player.maxHp);await shot('resume');
        await finishJourneyStage(page,async()=>{await useJourney(page,maps.S26.objects.find(o=>o.id==='S26.golden')!);expect((await read(page)).save.goldenHearts).toContain('G07');await shot('golden-heart');});
        expect((await read(page)).stage).toBe('S27');expect((await read(page)).save.flags).toContain('indiaArrival');expect(errors).toEqual([]);
        writeFileSync(`${root}/${device}.json`,JSON.stringify({fallback,errors,observations},null,2));
    });
}

test('legacy S26 bandit rewards stay claimed and new optional bats do not block the exit',async({page})=>{
    const save=fixture();save.checkpoint.checkpointId='middle';save.claimedRewardIds.push('S26.enemy.1','S26.enemy.2','S26.enemy.3','S26.reward.reward');
    save.completedObjectiveIds=['S26.quest.1','S26.quest.2','S26.quest.3','S26.reward'];save.flags.push('indiaArrival');save.coins=19;
    await page.goto('/');await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});await resume(page);
    expect((await read(page)).enemies.map((e:{id:string})=>e.id)).toEqual(['S26.enemy.4','S26.enemy.5']);
    expect((await read(page)).save.coins).toBe(19);expect((await read(page)).save.totalXp).toBe(420);expect((await read(page)).save.completedObjectiveIds).toEqual(save.completedObjectiveIds);
    const root=evidencePath('s26-bats');mkdirSync(root,{recursive:true});await page.screenshot({path:`${root}/legacy-rewards.png`});
    await finishJourneyStage(page);expect((await read(page)).stage).toBe('S27');
    expect((await read(page)).save.claimedRewardIds.filter((id:string)=>id.startsWith('S26.enemy.'))).toEqual(['S26.enemy.1','S26.enemy.2','S26.enemy.3']);
});
