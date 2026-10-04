import {evidencePath} from './art-evidence';
import {test,expect,type Browser,type Page,type CDPSession} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave,type Save} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {activeSkills,type ActiveSkillId} from '../../src/core/skills';
import {skillIcons,touchIconNames,type TouchIconKey} from '../../src/content/touchIcons';
import {maps} from '../../src/content/maps';
import campaign from '../../src/content/stageIndex';
import {moveJourney} from './journey-bot';

interface State {stage:string;sim:number;flameReady:number;mp:number;attack:number|null;save:Save;
    player:{x:number;y:number;hp:number;grounded:boolean};enemies:{id:string;x:number;y:number;hp:number}[]}
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__')) as Promise<State>;
const devices={phone:{width:844,height:390},tablet:{width:1180,height:820}};
function fixture(stage:string,x=0){
    const save=freshSave(),prior=campaign.slice(0,Number(stage.slice(1))-1);
    save.checkpoint={stageId:stage,checkpointId:maps[stage].checkpoints.filter(cp=>cp.x<x-200).sort((a,b)=>b.x-a.x)[0]?.id??'start'};
    save.clearedStageIds=prior.map(s=>s.id);save.flags=[...new Set(prior.flatMap(s=>s.rewardFlags))];
    save.totalXp=10000;save.weapons=['W01','W02','W03','W04','W05','W06','W07'];save.equippedWeapon='W07';
    save.treasures=['T01','T02','T03','T04','T05','T06','T07'];save.equippedSkill='flamePulse';
    return save;
}
async function load(page:Page,save:Save){
    await page.goto('/');await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key:SAVE_KEY,save});
    await page.reload();await page.getByRole('button',{name:`이어하기 · ${save.checkpoint.stageId}`}).tap();
    await page.waitForFunction(()=>!!Reflect.get(window,'__SINBAD_TEST__')?.player);
    await page.waitForTimeout(200);
}
async function touch(page:Page,cdp:CDPSession,action:string,ms=60){
    const button=page.locator(`#touch [data-action="${action}"]`);
    const art=button.locator('img.touch-icon:visible');
    const box=(await art.count()?await art.boundingBox():await button.boundingBox())!;
    expect(box).not.toBeNull();
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2,id:1}]});
    await page.waitForTimeout(ms);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(45);
}
async function run(browser:Browser,device:keyof typeof devices,fallback:boolean){
    const context=await browser.newContext({viewport:devices[device],hasTouch:true,isMobile:true});
    const page=await context.newPage(),cdp=await context.newCDPSession(page);
    const errors:string[]=[],consoleErrors:string[]=[],requests:string[]=[],failures:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    page.on('request',r=>{if(/\/ui-[^/]+\.png$/.test(r.url()))requests.push(r.url());});
    page.on('requestfailed',r=>{if(/\/ui-[^/]+\.png$/.test(r.url()))failures.push(r.url());});
    if(fallback)await page.route('**/assets/webtoon/ui-*.png',r=>r.abort());
    const checks:unknown[]=[],clones:string[]=[];
    async function capture(action:string,key:TouchIconKey,aria:string){
        const button=page.locator(`#touch [data-action="${action}"]`);
        await expect(button).toBeVisible();await expect(button).toHaveAttribute('data-icon',key);
        await expect(button).toHaveAttribute('aria-label',aria);
        const image=button.locator('img.touch-icon');
        if(fallback){await expect(image).toBeHidden();await expect(button.locator('.icon-frame[data-fallback="true"] .glyph')).toBeVisible();}
        else await expect.poll(()=>image.evaluate(element=>{const img=element as HTMLImageElement;return [img.complete,img.naturalWidth,img.naturalHeight];})).toEqual([true,128,128]);
        const observed=await button.evaluate(button=>{
            const img=button.querySelector<HTMLImageElement>('img.touch-icon')!,b=button.getBoundingClientRect(),i=img.getBoundingClientRect();
            return {action:button.dataset.action,key:button.dataset.icon,aria:button.getAttribute('aria-label'),caption:button.querySelector('.caption')?.textContent??button.dataset.caption,
                button:{x:b.x,y:b.y,w:b.width,h:b.height},image:{x:i.x,y:i.y,w:i.width,h:i.height,natural:img.naturalWidth,hidden:img.hidden,alt:img.alt,transform:getComputedStyle(img).transform,pointerEvents:getComputedStyle(img).pointerEvents}};
        });
        expect(observed.button.w).toBeGreaterThanOrEqual(48);expect(observed.button.h).toBeGreaterThanOrEqual(48);
        expect(observed.button.x).toBeGreaterThanOrEqual(0);expect(observed.button.x+observed.button.w).toBeLessThanOrEqual(devices[device].width);
        expect(observed.button.y+observed.button.h).toBeLessThanOrEqual(devices[device].height);
        expect(observed.image.transform).toBe('none');expect(observed.image.pointerEvents).toBe('none');expect(observed.image.alt).toBe('');
        if(!fallback){
            expect(observed.image.x).toBeGreaterThanOrEqual(observed.button.x);expect(observed.image.x+observed.image.w).toBeLessThanOrEqual(observed.button.x+observed.button.w);
            clones.push(await button.evaluate(b=>b.outerHTML));
        }
        const path=evidencePath(`art-a8/${device}-${fallback?'fallback-':''}${key}.png`);
        await page.screenshot({path});checks.push({...observed,path});
    }
    try{
        await load(page,fixture('S01'));
        await capture('jump','ui-jump','터치 ↑');
        const beforeJump=(await read(page)).player;
        const right=(await page.locator('[data-action="right"]').boundingBox())!,jump=(await page.locator('[data-action="jump"]').boundingBox())!;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:right.x+right.width/2,y:right.y+right.height/2,id:2},{x:jump.x+jump.width/2,y:jump.y+jump.height/2,id:3}]});
        await page.waitForTimeout(170);const air=(await read(page)).player;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        expect(air.x-beforeJump.x).toBeGreaterThan(20);expect(air.y-beforeJump.y).toBeLessThan(-50);
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__').player.grounded);
        const casts=[];
        for(const id of Object.keys(activeSkills) as ActiveSkillId[]){
            // The real touch release protects a newly opened overlay from its
            // synthetic click for 450ms. Let that guard expire before menu taps.
            await page.waitForTimeout(500);
            await page.getByRole('button',{name:'가방과 지도'}).tap();await page.locator(`[data-skill="${id}"]`).tap();
            await page.getByRole('button',{name:'현재 모험으로'}).tap();
            await expect(page.locator('#overlay')).toBeHidden();
            await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s.sim>=s.flameReady;});
            await capture('skill',skillIcons[id],`터치 ${activeSkills[id].name}`);
            const image=await page.locator('[data-action="skill"] img.touch-icon').elementHandle();
            const before=await read(page);await touch(page,cdp,'skill');
            const after=await read(page);expect(after.mp).toBeLessThan(before.mp-10);expect(after.save.equippedSkill).toBe(id);
            expect(await page.locator('[data-action="skill"] img.touch-icon').evaluate((img,old)=>img===old,image)).toBe(true);
            casts.push({id,beforeMp:before.mp,afterMp:after.mp});await image?.dispose();
        }
        const saved=(await read(page)).save;
        await page.reload();await page.getByRole('button',{name:'이어하기 · S01'}).tap();
        await expect(page.locator('[data-action="skill"]')).toHaveAttribute('data-icon','ui-dawn');
        expect((await read(page)).save.equippedSkill).toBe(saved.equippedSkill);
        expect((await read(page)).save.claimedRewardIds).toEqual(saved.claimedRewardIds);
        await moveJourney(page,250,554);await touch(page,cdp,'left',16);
        await capture('primary','ui-talk','터치 행동');await touch(page,cdp,'primary');
        await expect(page.getByTestId('dialogue-text')).toBeVisible();
        const dialogue=await page.getByTestId('dialogue-text').textContent();expect(dialogue).toContain('바닷길');
        await page.waitForTimeout(500);
        await page.getByRole('button',{name:'전체 생략'}).tap();
        await expect.poll(async()=>(await read(page)).save.completedObjectiveIds).toContain('S01.captainTalk');
        const bridge=maps.S26.objects.find(o=>o.kind==='bridge')!;
        await load(page,fixture('S26',bridge.x));await moveJourney(page,bridge.x,bridge.y);await touch(page,cdp,'left',16);
        await capture('primary','ui-inspect','터치 행동');await touch(page,cdp,'primary');
        await expect.poll(async()=>(await read(page)).save.completedObjectiveIds).toContain(bridge.id);
        await page.reload();await page.getByRole('button',{name:'이어하기 · S26'}).tap();
        await expect.poll(async()=>(await read(page)).save.completedObjectiveIds).toContain(bridge.id);
        const departing=fixture('S01',4610);departing.completedObjectiveIds=['S01.captainTalk','S01.enemy.captain'];
        await load(page,departing);await moveJourney(page,4610,550);await touch(page,cdp,'left',16);
        await capture('primary','ui-depart','터치 행동');await touch(page,cdp,'primary');
        await expect(page.getByRole('button',{name:'다음 스테이지'})).toBeVisible();await page.waitForTimeout(500);await page.getByRole('button',{name:'다음 스테이지'}).tap();
        await expect.poll(async()=>(await read(page)).stage).toBe('S02');expect((await read(page)).save.clearedStageIds).toContain('S01');
        const kite=maps.S10.spawns.find(e=>e.kind==='kite')!;await load(page,fixture('S10',kite.x));
        const target=(await read(page)).enemies.find(e=>e.id===kite.id)!;
        await moveJourney(page,target.x-70,target.y);await touch(page,cdp,'right',16);
        await expect(page.locator('[data-action="skill"]')).toBeHidden();await expect(page.locator('[data-action="cycle"]')).toBeHidden();
        await capture('primary','ui-wing','터치 행동');const hp=(await read(page)).enemies.find(e=>e.id===kite.id)!.hp;
        await touch(page,cdp,'primary',130);
        await expect.poll(async()=>(await read(page)).enemies.find(e=>e.id===kite.id)!.hp).toBeLessThan(hp);
        const wing=(await read(page)).enemies.find(e=>e.id===kite.id)!;
        if(!fallback){
            const gallery=await context.newPage();await gallery.goto('/');
            await gallery.setContent(`<html><head><base href="http://127.0.0.1:5174/"><link rel="stylesheet" href="src/mobile.css"><style>body{padding:18px;font-family:Malgun Gothic,sans-serif;color:#fff}#touch{position:static;display:grid;grid-template-columns:repeat(3,72px);gap:16px;pointer-events:auto}#touch button{position:static!important;width:72px!important;height:72px!important;opacity:1;animation:none}</style></head><body><p>A8 · 72px 버튼 크기 비교 · 표시 전용</p><div id="touch">${clones.join('')}</div></body></html>`);
            await expect.poll(()=>gallery.locator('img.touch-icon').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth===128))).toBe(true);
            await expect(gallery.locator('#touch button')).toHaveCount(9);
            await gallery.screenshot({path:evidencePath(`art-a8/${device}-72px-icons.png`)});await gallery.close();
        }
        expect(errors).toEqual([]);expect(consoleErrors.filter(e=>!fallback||!e.includes('net::ERR_FAILED'))).toEqual([]);
        expect(new Set(requests.map(url=>url.split('/').at(-1)))).toEqual(new Set(touchIconNames.map(name=>`ui-${name}.png`)));
        if(fallback)expect(new Set(failures.map(url=>url.split('/').at(-1))).size).toBe(9);else expect(failures).toEqual([]);
        return {device,fallback,checks,casts,jump:{dx:air.x-beforeJump.x,dy:air.y-beforeJump.y},dialogue,bridgeReload:true,departure:'S02',wingDamage:hp-wing.hp,skillReload:true,requests,expectedAborts:failures,errors,consoleErrors};
    }finally{await context.close();}
}
test('nine upright icons, 72px previews and real touch jump/dialogue/use/departure/wing/four abilities on phone/tablet',async({browser})=>{
    test.setTimeout(8*60*1000);mkdirSync(evidencePath('art-a8'),{recursive:true});
    const results=[];for(const device of Object.keys(devices) as (keyof typeof devices)[])results.push(await run(browser,device,false));
    writeFileSync('docs/validation/a8-touch-icons.json',JSON.stringify({pass:true,method:'explicit stage/gear fixtures, actual CDP touch and menu taps; 72px previews are display-only clones, not simultaneously exposed game controls',results},null,2));
});
test('all nine missing icon files restore legacy glyphs while actual actions and saved progress work',async({browser})=>{
    test.setTimeout(5*60*1000);mkdirSync(evidencePath('art-a8'),{recursive:true});
    const result=await run(browser,'phone',true);
    writeFileSync('docs/validation/a8-touch-fallback.json',JSON.stringify({pass:true,method:'nine intentional PNG request aborts; explicit fixtures, real touch actions, actual ability MP costs and reload; no save injection claimed as fresh campaign',result},null,2));
});
