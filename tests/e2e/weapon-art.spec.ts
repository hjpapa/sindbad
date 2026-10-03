import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {weaponLooks,swingPose} from '../../src/game/weapons';
import type {WeaponId} from '../../src/content/items';
import cells from '../../src/content/hero-action.generated.json' with {type:'json'};
import {fightJourney,readJourney,moveJourney} from './journey-bot';

const ids:WeaponId[]=['W01','W02','W03','W04','W05','W06','W07'];
interface ArtState {save:Save;heroArt:{texture:string;frame:number;x:number;y:number;flipX:boolean};
    weaponArt:{visible:boolean;texture:string;x:number;y:number;angle:number};attack:number|null}
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__')) as Promise<ArtState>;
async function load(page:Page){
    await page.goto('/');
    const save=freshSave();save.weapons=ids;save.settings.aimAssist=false;save.settings.reducedMotion=true;
    await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});
    await page.reload();await page.getByRole('button',{name:'이어하기 · S01'}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);
    // Inspect both directions away from the viewport edge, using real movement.
    await moveJourney(page,400,560);
}
async function inspect(page:Page,fallback:boolean,device:string){
    const shots:unknown[]=[];
    await page.locator('#bag').click();
    for(const id of ids){
        const image=page.locator(`[data-weapon="${id}"] img`);
        await expect.poll(()=>image.evaluate(img=>img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0)).toBe(true);
        await expect(image).toHaveAttribute('src',`/assets/weapons/${id}.${fallback?'svg':'webp'}`);
    }
    await page.locator('#back').click();
    for(const direction of [1,-1]){
        await page.keyboard.down(direction>0?'ArrowRight':'ArrowLeft');
        await page.waitForTimeout(60);await page.keyboard.up(direction>0?'ArrowRight':'ArrowLeft');await page.waitForTimeout(160);
        for(const [index,id] of ids.entries()){
            await page.keyboard.press(String(index+1));await page.waitForTimeout(1050);
            await page.keyboard.down('j');
            await page.waitForFunction(({id,fallback})=>{
                const art=Reflect.get(window,'__SINBAD_TEST__')?.weaponArt;
                return art?.visible&&art.texture===`weapon-${fallback?'fallback-':''}${id}`;
            },{id,fallback});
            const observed=await read(page),hero=observed.heroArt,art=observed.weaponArt,cell=cells[hero.frame];
            expect(hero.texture).toBe('hero-action');expect(hero.flipX).toBe(direction<0);
            const hand={x:hero.x+direction*(cell.hand[0]-256)*144/512,y:hero.y+(cell.hand[1]-cell.baseline)*144/512};
            expect(art.x).toBeCloseTo(hand.x,4);expect(art.y).toBeCloseTo(hand.y,4);
            expect(art.angle).toBeCloseTo(direction*swingPose(weaponLooks[id],1).angle,4);
            const path=`docs/screenshots/art-a6/${device}-${fallback?'fallback-':''}${id}-${direction>0?'right':'left'}.png`;
            await page.screenshot({path});
            await page.keyboard.up('j');
            shots.push({id,direction,hand,observed:art,hero,path});
            await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.attack===null);await page.waitForTimeout(750);
        }
    }
    return shots;
}

test('seven raster weapons and icons stay attached to JSON fists on phone and tablet',async({page})=>{
    test.setTimeout(4*60*1000);
    const errors:string[]=[],requests:string[]=[],checks:unknown[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    page.on('request',r=>{if(/\/assets\/weapons\/W0[1-7]\.webp$/.test(r.url()))requests.push(r.url());});
    mkdirSync('docs/screenshots/art-a6',{recursive:true});
    for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
        await page.setViewportSize(viewport);await load(page);
        checks.push({device,shots:await inspect(page,false,device)});
        for(const id of ids)expect(requests.some(url=>url.endsWith(`/${id}.webp`))).toBe(true);
    }
    expect(errors).toEqual([]);
    writeFileSync('docs/validation/a6-weapon-art.json',JSON.stringify({pass:true,method:'unlocked-weapon fixture, real keys, 28 mirrored poses and icons; not campaign completion',checks,requests,errors},null,2));
});
test('all seven missing rasters retain SVG weapons and icons, combat rewards and reload',async({page})=>{
    test.setTimeout(4*60*1000);
    const errors:string[]=[],failures:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>failures.push(r.url()));
    await page.route('**/assets/weapons/*.webp',route=>route.abort());
    mkdirSync('docs/screenshots/art-a6',{recursive:true});
    await page.setViewportSize({width:844,height:390});await load(page);
    const shots=await inspect(page,true,'phone');
    const before=await readJourney(page);
    // Bow/boomerang inspection can already defeat the first patrol. Fight a
    // still-living enemy instead of expecting its reward a second time.
    const target=before.enemies.find(enemy=>enemy.hp>0);
    expect(target).toBeTruthy();
    await fightJourney(page,target!.id);
    const earned=await readJourney(page);
    expect(earned.save.claimedRewardIds).toContain(target!.id);expect(earned.save.totalXp).toBeGreaterThan(before.save.totalXp);
    await page.reload();await page.getByRole('button',{name:'이어하기 · S01'}).click();
    await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__')?.player?.grounded);
    const resumed=await readJourney(page);
    expect(resumed.save.claimedRewardIds).toEqual(earned.save.claimedRewardIds);expect(resumed.save.totalXp).toBe(earned.save.totalXp);
    expect(errors).toEqual([]);expect(failures.filter(url=>url.includes('/assets/weapons/')).length).toBeGreaterThanOrEqual(7);
    writeFileSync('docs/validation/a6-weapon-fallback.json',JSON.stringify({pass:true,method:'intentional seven raster request aborts, SVG recovery, real keys/combat and save reload',shots,expectedAbortedRequests:failures,earned:earned.save,resumed:resumed.save,errors},null,2));
});
