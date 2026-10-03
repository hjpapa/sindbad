import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import {enemyActionRows,actionDefeatKind,type EnemyActionKey} from '../../src/content/enemyActions';
import {moveJourney} from './journey-bot';

interface EnemyView {id:string;x:number;y:number;hp:number;state:string;visible:boolean;alpha:number;art:EnemyActionKey;texture:string;frame:number;flipX:boolean;originY:number;displayHeight:number;footOffset:number;label:string}
interface ArtState {stage:string;player:{x:number;y:number;grounded:boolean};enemies:EnemyView[];save:Save;attack:number|null}
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__')) as Promise<ArtState>;
const cases: [EnemyActionKey,string][]=[['skeleton','S01'],['bandit','S11'],['guard','S05'],['pirate','S18'],['snake','S20'],['tiger','S22'],['dragon','S12'],['crab','S04'],['stone','S24'],['kuura','S19']];
const fixtures=(stage:string,x:number)=>{
    const save=freshSave();
    save.checkpoint={stageId:stage,checkpointId:maps[stage].checkpoints.filter(cp=>cp.x<x-250).sort((a,b)=>b.x-a.x)[0]?.id??'start'};
    save.totalXp=10000;save.weapons=['W01','W02','W03','W04','W05','W06','W07'];save.equippedWeapon='W07';save.treasures=['T01','T02','T03','T04','T05','T06','T07'];
    return save;
};
async function load(page:Page,save:Save){
    await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${save.checkpoint.stageId}`}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);
}

// Explicit stage/item fixtures isolate artwork; this is not a campaign completion
// claim. Movement, attacks, enemy timing, rewards and reload are real game flows.
test('40 enemy poses, mirrored direction, safe defeat and save reload on phone/tablet',async({page})=>{
    test.setTimeout(12*60*1000);
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.goto('/');
    mkdirSync('docs/screenshots/art-a3',{recursive:true});
    const checks:unknown[]=[];
    for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
        await page.setViewportSize(viewport);
        for(const [key,stage] of cases){
            const candidates=maps[stage].spawns.filter(spawn=>spawn.actionArt===key);
            const def=candidates.find(spawn=>spawn.kind==='boss')??candidates[0];
            await load(page,fixtures(stage,def.x));
            const enemy=async()=>(await read(page)).enemies.find(e=>e.id===def.id)!;
            const row=enemyActionRows.find(row=>row.key===key)!;
            const captures:unknown[]=[];
            const capture=async(state:string,pose:number)=>{
                await page.waitForFunction(({id,state})=>Reflect.get(window,'__SINBAD_TEST__')?.enemies.find((e:EnemyView)=>e.id===id)?.state===state,{id:def.id,state});
                const observed=await enemy();expect(observed.texture).toBe('enemy-actions');expect(observed.frame).toBe(row.row*4+pose);
                const feet=(row.baseline[pose]/512-observed.originY)*observed.displayHeight;
                expect(feet).toBeCloseTo(observed.footOffset,5);
                const path=`docs/screenshots/art-a3/${device}-${key}-${state}.png`;
                await page.screenshot({path});captures.push({state,path,observed});
            };
            // S01's optional crate top is 126px above the enemy centre; the
            // inspection can stand there before stepping down on its right.
            const approachY=stage==='S01'?500:def.y;
            await moveJourney(page,def.x-340,approachY);await capture('idle',0);
            await moveJourney(page,(await enemy()).x-130,approachY);await capture('telegraph',1);await capture('attack',2);await capture('recover',0);
            expect((await enemy()).flipX).toBe(true);
            await moveJourney(page,(await enemy()).x+130,def.y);
            await expect.poll(async()=>(await enemy()).flipX,{timeout:12000}).toBe(false);
            const rightPath=`docs/screenshots/art-a3/${device}-${key}-right.png`;await page.screenshot({path:rightPath});
            for(let attempt=0;attempt<8&&(await enemy()).hp>0;attempt++){
                const target=await enemy();await moveJourney(page,target.x+55,target.y);
                await page.keyboard.down('a');await page.waitForTimeout(35);await page.keyboard.up('a');
                await page.keyboard.press('j');await page.waitForTimeout(125);
                if((await enemy()).hp>0)await page.waitForTimeout(500);
            }
            await capture('defeated',3);
            const defeat=actionDefeatKind(key),last=await enemy();
            expect(last.label).toBe(defeat==='human'?'항복했어요':defeat==='animal'?'저주가 풀렸어!':'빛으로 돌아갔어요');
            await page.waitForTimeout(1700);
            expect((await enemy()).visible).toBe(defeat==='human');
            const before=(await read(page)).save;expect(before.claimedRewardIds).toContain(def.id);
            await page.reload();await page.getByRole('button',{name:`이어하기 · ${before.checkpoint.stageId}`}).click();
            await expect.poll(async()=>(await read(page)).save.totalXp).toBe(before.totalXp);
            expect((await read(page)).save.claimedRewardIds).toEqual(before.claimedRewardIds);
            if(def.kind==='boss')expect((await read(page)).enemies.some(e=>e.id===def.id)).toBe(false);
            checks.push({device,key,stage,enemyId:def.id,captures,rightPath,defeat,reloadRewardsUnchanged:true});
            console.log(`ART ${device} ${key}: poses / direction / ${defeat} / reload passed`);
        }
    }
    expect(errors).toEqual([]);
    writeFileSync('docs/validation/enemy-art.json',JSON.stringify({date:new Date().toISOString(),method:'stage/item save fixtures; real keyboard movement/combat; read-only snapshots; Edge phone/tablet viewport emulation',pass:true,checks,errors},null,2));
});

test('missing action atlas retains a playable fallback and magical skeleton defeat',async({page})=>{
    await page.route('**/enemy-actions.webp',route=>route.abort());
    await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);
    const skeleton=(await read(page)).enemies[0];expect(skeleton.texture).toBe('skeleton');
    await moveJourney(page,skeleton.x-60,skeleton.y);
    for(let i=0;i<7&&(await read(page)).enemies[0].hp>0;i++){await page.keyboard.press('j');await page.waitForTimeout(420);}
    await expect.poll(async()=>(await read(page)).enemies[0].state).toBe('defeated');
    expect((await read(page)).enemies[0].label).toBe('빛으로 돌아갔어요');
});
