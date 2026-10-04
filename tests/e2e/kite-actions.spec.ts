import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import kite from '../../src/content/kite-actions.generated.json' with {type:'json'};
import {evidencePath} from './art-evidence';
import {moveJourney} from './journey-bot';
test.use({hasTouch:true});
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
interface EnemyView {id:string;x:number;y:number;hp:number;state:string;visible:boolean;alpha:number;texture:string;frame:number;flipX:boolean;originX:number;originY:number;displayHeight:number;label:string}
const fixture=(id:string)=>{
    const save=freshSave();save.checkpoint={stageId:id,checkpointId:'start'};
    save.clearedStageIds=Array.from({length:32},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
    save.totalXp=10000;save.treasures=['T01','T02','T03','T04','T05','T06','T07'];
    save.flags=['bubbleBlessing','genieCave'];save.settings.reducedMotion=id==='S33';return save;
};
async function resume(page:Page,id:string){
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${id}`}).click();
    await page.waitForFunction(id=>Reflect.get(window,'__SINBAD_TEST__')?.stage===id,id);await page.waitForTimeout(2600);
}
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    for(const fallback of [false,true])test(`${device} kite ${fallback?'missing-sheet recovery':'four actions'} keeps flight combat, release and stable rewards`,async({page})=>{
        test.setTimeout(4*60*1000);await page.setViewportSize(viewport);
        const errors:string[]=[],requests:string[]=[],blocked:string[]=[],checks:unknown[]=[],screens:string[]=[];
        page.on('pageerror',error=>errors.push(error.message));
        page.on('console',message=>{if(message.type()==='error'&&!(fallback&&message.text().includes('ERR_FAILED')))errors.push(message.text());});
        page.on('request',request=>{if(/(?:kite-actions|enemy-actions)\.webp$/.test(request.url()))requests.push(request.url());});
        page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
        if(fallback)await page.route('**/assets/webtoon/kite-actions.webp',route=>{blocked.push(route.request().url());return route.abort();});
        await page.goto('/');mkdirSync(evidencePath('m6-kite'),{recursive:true});
        // Explicit stage/item fixtures isolate art; controls, AI timing, damage,
        // enemy rewards and reload are real. S33 exercises reduced motion.
        for(const id of ['S10','S33']){
            await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save:fixture(id)});
            await resume(page,id);const def=maps[id].spawns[0];
            const enemy=async()=>(await read(page)).enemies.find((e:EnemyView)=>e.id===def.id) as EnemyView;
            const inspect=(e:EnemyView)=>{
                expect(e.texture).toBe(fallback?'kite':'kite-actions');
                if(!fallback){
                    const pose=e.state==='telegraph'?1:e.state==='attack'?2:e.state==='defeated'?3:0;
                    expect(e.frame).toBe(pose);const centre=kite.frames[pose].centre;
                    expect(e.originX).toBeCloseTo(e.flipX?1-centre[0]/512:centre[0]/512,8);
                    expect(e.originY).toBeCloseTo(centre[1]/512,8);
                    const restingHeight=128*512/kite.idleHeight;
                    if(e.state==='defeated'){
                        // The existing safe release tween grows up to 1.25x.
                        expect(e.displayHeight).toBeGreaterThanOrEqual(restingHeight-1e-6);
                        expect(e.displayHeight).toBeLessThanOrEqual(restingHeight*1.25+1e-6);
                    }else expect(e.displayHeight).toBeCloseTo(restingHeight,6);
                }
            };
            const capture=async(state:string)=>{
                const handle=await page.waitForFunction(({id,state})=>{
                    const e=Reflect.get(window,'__SINBAD_TEST__')?.enemies.find((e:EnemyView)=>e.id===id);return e?.state===state?e:false;
                },{id:def.id,state});
                const observed=await handle.jsonValue() as EnemyView;await handle.dispose();inspect(observed);
                const path=evidencePath(`m6-kite/${device}-${fallback?'fallback':'normal'}-${id}-${state}.png`);
                await page.screenshot({path});screens.push(path);checks.push({id,state,observed,path});return observed;
            };
            expect((await read(page)).enemies).toHaveLength(id==='S10'?6:5);
            await capture('idle');await moveJourney(page,def.x-260,def.y);await capture('telegraph');
            await page.locator('#pause').click();const paused=await read(page);await page.waitForTimeout(400);
            expect((await read(page)).sim).toBe(paused.sim);expect((await read(page)).enemies).toEqual(paused.enemies);
            await page.locator('#resume').click();const attack=await capture('attack');
            expect((await read(page)).projectiles).toBeGreaterThan(0);await capture('recover');
            expect(attack.flipX).toBe(true);expect(attack.x).toBe(def.x);
            await moveJourney(page,def.x+160,def.y);
            await expect.poll(async()=>(await enemy()).flipX).toBe(false);inspect(await enemy());
            const rightPath=evidencePath(`m6-kite/${device}-${fallback?'fallback':'normal'}-${id}-right.png`);
            await page.screenshot({path:rightPath});screens.push(rightPath);
            await moveJourney(page,def.x+55,(await enemy()).y);
            await page.keyboard.down('a');await page.waitForTimeout(30);await page.keyboard.up('a');
            const beforeHp=(await enemy()).hp;await page.getByRole('button',{name:'터치 행동',exact:true}).tap();
            await expect.poll(async()=>(await enemy()).hp).toBeLessThan(beforeHp);
            if((await enemy()).hp>0){await page.waitForTimeout(440);await page.keyboard.press('Space');}
            await capture('defeated');
            expect((await enemy()).label).toBe('빛으로 돌아갔어요');
            await expect.poll(async()=>(await enemy()).visible).toBe(false);
            const before=(await read(page)).save as Save;expect(before.claimedRewardIds).toContain(def.id);
            expect(before.claimedRewardIds.filter(reward=>reward===def.id)).toHaveLength(1);
            await resume(page,id);expect((await read(page)).save.claimedRewardIds).toEqual(before.claimedRewardIds);
            expect((await read(page)).save.totalXp).toBe(before.totalXp);
            // Ordinary kites respawn; the same stable reward cannot be paid twice.
            await moveJourney(page,def.x-55,(await enemy()).y);await page.keyboard.down('d');await page.waitForTimeout(30);await page.keyboard.up('d');
            for(let hit=0;hit<3&&(await enemy()).hp>0;hit++){await page.keyboard.press('Space');await page.waitForTimeout(460);}
            expect((await enemy()).hp).toBe(0);expect((await read(page)).save.coins).toBe(before.coins);
            expect((await read(page)).save.totalXp).toBe(before.totalXp);expect((await read(page)).save.claimedRewardIds).toEqual(before.claimedRewardIds);
            console.log(`KITE ${device} ${id} ${fallback?'fallback':'webtoon'}: poses / both directions / pause / touch attack / release / reward reload passed`);
        }
        // Returning to the dock releases the flight-only sheet from the cache.
        await page.locator('#bag').click();await page.locator('[data-stage="S01"]').click();
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.stage==='S01');
        const dock=await read(page);expect(dock.enemies[0].texture).toBe('enemy-actions');
        expect(dock.cachedActionKeys).toEqual(['enemy-actions']);
        expect(requests.filter(url=>url.endsWith('enemy-actions.webp'))).toHaveLength(1);
        expect(requests.filter(url=>url.endsWith('kite-actions.webp')).length).toBeGreaterThanOrEqual(4);
        if(fallback)expect(blocked.length).toBeGreaterThanOrEqual(4);expect(errors).toEqual([]);
        writeFileSync(`docs/validation/m6-kite-${device}-${fallback?'fallback':'normal'}.json`,JSON.stringify({device,viewport,fallback,fixture:true,checks,screens,requests,blocked,errors,artStatus:'ART_DRAFT'},null,2));
    });
}
