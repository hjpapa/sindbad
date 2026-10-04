import {evidencePath} from './art-evidence';
import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {maps} from '../../src/content/maps';
import campaign from '../../src/content/stageIndex';
import {terrainStyleKeys,terrainAssetKeys} from '../../src/content/terrainStyles';
import {terrainStyleFor} from '../../src/game/terrain';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {fightJourney,readJourney,skipJourneyDialogue} from './journey-bot';

type Observation={style:string;cachedKeys:string[];textures:{key:string;width:number;height:number;source:string}[];platforms:{x:number;y:number;width:number;height:number;texture:string;visible:boolean;skinX:number;skinY:number;skinWidth:number;skinHeight:number}[];tops:{x:number;y:number;width:number;height:number;texture:string}[]};
const observe=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').terrain) as Promise<Observation>;
const ready=(page:Page,id:string)=>page.waitForFunction(id=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.stage===id&&s?.player;},id);

test('17 real terrain styles load only their pair and preserve platform geometry on phone/tablet',async({page})=>{
    test.setTimeout(8*60*1000);
    const errors:string[]=[],requests:string[]=[],checks:unknown[]=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
    page.on('request',request=>{if(request.url().includes('/assets/terrain/'))requests.push(request.url());});
    mkdirSync(evidencePath('art-a5'),{recursive:true});
    for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
        await page.setViewportSize(viewport);await page.goto('/');
        const save=freshSave();save.totalXp=10000;save.weapons=['W01','W02','W03','W04','W05','W06','W07'];save.treasures=['T01','T02','T03','T04','T05','T06','T07'];
        save.flags=[...new Set(campaign.flatMap(stage=>stage.rewardFlags))];
        save.clearedStageIds=Object.keys(maps);save.claimedRewardIds=Object.values(maps).flatMap(map=>map.spawns.map(spawn=>spawn.id));
        save.completedObjectiveIds=[...save.claimedRewardIds,...Object.values(maps).flatMap(map=>map.objects.filter(object=>object.kind==='quest').map(object=>object.id))];
        await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});await page.reload();
        await page.getByRole('button',{name:'이어하기 · S01'}).click();await ready(page,'S01');
        for(const style of terrainStyleKeys){
            const map=Object.values(maps).find(map=>terrainStyleFor(map)===style)!;
            if((await readJourney(page)).stage!==map.id){await page.locator('#bag').click();await page.locator(`[data-stage="${map.id}"]`).click();await ready(page,map.id);}
            await skipJourneyDialogue(page);await page.waitForTimeout(2100);
            const observed=await observe(page),keys=terrainAssetKeys(style);
            expect(observed.style).toBe(style);expect(observed.cachedKeys.sort()).toEqual([...keys].sort());
            expect(observed.textures).toHaveLength(2);
            for(const texture of observed.textures){expect(texture.width).toBe(128);expect(texture.height).toBe(texture.key.endsWith('-fill')?128:34);expect(texture.source).toMatch(/^(blob:)?http/);expect(requests.some(url=>url.endsWith(`/assets/terrain/${texture.key}.webp`))).toBe(true);}
            expect(observed.platforms).toHaveLength(map.platforms.length);expect(observed.tops).toHaveLength(map.platforms.length);
            for(const [index,platform] of observed.platforms.entries()){
                const def=map.platforms[index],top=observed.tops[index];
                expect(platform.width).toBe(def.w);expect(platform.height).toBe(def.h);expect(platform.texture).toBe(keys[0]);
                expect(platform.skinX).toBeCloseTo(platform.x,3);expect(platform.skinY).toBeCloseTo(platform.y,3);expect(platform.skinWidth).toBe(def.w);expect(platform.skinHeight).toBe(def.h);
                expect(platform.visible).toBe(def.h>30);expect(top.texture).toBe(keys[1]);expect(top.width).toBe(def.w);expect(top.height).toBe(34);
                expect(top.x).toBeCloseTo(platform.x,3);expect(top.y).toBeCloseTo(platform.y-def.h/2+13,3);
            }
            const before=(await readJourney(page)).player.x;await page.keyboard.down('d');await page.keyboard.press('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('d');await page.keyboard.up('ArrowUp');
            expect((await readJourney(page)).player.x).toBeGreaterThan(before+8);
            const path=evidencePath(`art-a5/${device}-${map.id}-${style}.png`);await page.screenshot({path});checks.push({device,stage:map.id,style,observed,path});
        }
        console.log(`A5 ${device}: 17 styles / 34 image tiles / actual map transitions / moving-platform alignment passed`);
    }
    expect(new Set(requests.map(url=>new URL(url).pathname)).size).toBe(34);expect(errors).toEqual([]);
    writeFileSync('docs/validation/terrain-art.json',JSON.stringify({date:new Date().toISOString(),pass:true,method:'explicit unlocked-stage/item save fixture; real map buttons and keyboard move/jump; phone/tablet viewport emulation; read-only texture and platform observations, not fresh campaign',checks,requests,errors},null,2));
});

for(const missing of ['fill','top','both'])test(`missing terrain ${missing} keeps the loaded half and a playable generated fallback`,async({page})=>{
    const failures:string[]=[],errors:string[]=[];page.on('requestfailed',request=>failures.push(request.url()));page.on('pageerror',error=>errors.push(error.message));
    await page.setViewportSize({width:844,height:390});
    await page.route('**/terrain-dock-*.webp',route=>missing==='both'||route.request().url().endsWith(`-${missing}.webp`)?route.abort():route.continue());
    await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();await ready(page,'S01');
    const observed=await observe(page);
    for(const texture of observed.textures){expect(texture.width).toBe(128);expect(texture.height).toBe(texture.key.endsWith('-fill')?128:34);const fallback=missing==='both'||texture.key.endsWith(`-${missing}`);expect(texture.source=== 'generated').toBe(fallback);}
    const enemy=maps.S01.spawns.find(spawn=>spawn.id==='S01.enemy.skeleton.01')!;await fightJourney(page,enemy.id);
    const saved=(await readJourney(page)).save;expect(saved.claimedRewardIds).toContain(enemy.id);
    const path=evidencePath(`art-a5/phone-missing-${missing}.png`);await page.screenshot({path});
    await page.reload();await page.getByRole('button',{name:'이어하기 · S01'}).click();await ready(page,'S01');
    expect((await readJourney(page)).save.claimedRewardIds).toEqual(saved.claimedRewardIds);expect((await readJourney(page)).save.totalXp).toBe(saved.totalXp);expect(errors).toEqual([]);
    expect(failures.filter(url=>url.includes('/assets/terrain/')).length).toBeGreaterThanOrEqual(missing==='both'?2:1);
    writeFileSync(`docs/validation/terrain-fallback-${missing}.json`,JSON.stringify({pass:true,missing,observed,expectedAbortedRequests:failures,path,errors},null,2));
});
