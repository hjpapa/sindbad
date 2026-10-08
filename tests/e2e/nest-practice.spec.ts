import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import {fightRocJourney,moveJourney,skipJourneyDialogue} from './journey-bot';
import {evidencePath} from './art-evidence';

test.use({hasTouch:true});
const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
async function ready(page:Page){
    await page.getByRole('button',{name:'이어하기 · S09'}).click();
    await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s?.stage==='S09'&&s.player;});
}
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    test(`${device} optional nest gem uses double jump and glide, saves once and leaves a safe return`,async({page})=>{
        test.setTimeout(180000);await page.setViewportSize(viewport);const errors:string[]=[];
        page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
        const save=freshSave();save.checkpoint={stageId:'S09',checkpointId:'start'};save.treasures=['T01','T02'];save.settings.difficulty='normal';
        save.clearedStageIds=Array.from({length:8},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
        await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(save)});
        await page.goto('/');await ready(page);
        const root=evidencePath('s09-nest');mkdirSync(root,{recursive:true});const observations:unknown[]=[];
        const shot=async(name:string)=>{observations.push({name,observed:await read(page)});await page.screenshot({path:`${root}/${device}-${name}.png`});};
        await moveJourney(page,2530);await page.keyboard.press('k');
        await page.waitForTimeout(700);expect((await read(page)).extraJump).toBe(false);
        expect((await read(page)).save.claimedRewardIds).not.toContain('S09.nestGem.reward');
        await shot('before-feather');await fightRocJourney(page);await moveJourney(page,2480);await page.keyboard.press('e');
        await expect(page.getByTestId('dialogue-text')).toBeVisible();await skipJourneyDialogue(page);
        expect((await read(page)).save.treasures).toContain('T03');
        await moveJourney(page,2530);const hp=(await read(page)).player.hp;
        await page.keyboard.press('k');await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s.player.y<440&&s.player.vy>-100;});
        await page.keyboard.press('k');await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__').extraJump);
        await shot('double-jump');
        await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s.player.grounded&&Math.abs(s.player.y-354)<10;});
        await shot('first-landing');await page.keyboard.press('e');await expect(page.getByTestId('dialogue-text')).toContainText('첫 발판까지 이단 점프 성공');
        await skipJourneyDialogue(page);
        await moveJourney(page,2595,354);
        const jump=page.getByRole('button',{name:'터치 ↑',exact:true});const box=await jump.boundingBox();expect(box).not.toBeNull();
        const cdp=device==='tablet'?await page.context().newCDPSession(page):null;
        const hold=async(down:boolean)=>{if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:down?'touchStart':'touchCancel',touchPoints:down?[{x:box!.x+box!.width/2,y:box!.y+box!.height/2,id:3}]:[]});else if(down)await page.keyboard.down('k');else await page.keyboard.up('k');};
        await page.keyboard.down('d');await hold(true);
        await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__').gliding);
        const glide=await read(page);expect(glide.player.vy).toBeLessThanOrEqual(180.01);await shot('glide-crossing');
        await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s.player.x>2825&&s.player.grounded&&Math.abs(s.player.y-282)<10;});
        await page.keyboard.up('d');await hold(false);await shot('upper-nest');
        const before=(await read(page)).save;await page.getByRole('button',{name:'터치 행동',exact:true}).tap();
        await expect.poll(async()=>(await read(page)).save.claimedRewardIds.includes('S09.nestGem.reward')).toBe(true);
        const claimed=(await read(page)).save;expect(claimed.coins-before.coins).toBe(25);expect((await read(page)).player.hp).toBe(hp);
        await shot('gem-collected');await page.reload();await ready(page);
        expect((await read(page)).save.claimedRewardIds).toEqual(claimed.claimedRewardIds);expect((await read(page)).save.coins).toBe(claimed.coins);
        expect((await read(page)).enemies).toHaveLength(0);await shot('checkpoint-resume');
        // Return to the optional reward through the same normal inputs.
        await moveJourney(page,2530);await page.keyboard.press('k');await page.waitForTimeout(360);await page.keyboard.press('k');
        await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s.player.grounded&&Math.abs(s.player.y-354)<10;});
        await moveJourney(page,2595,354);await page.keyboard.down('d');await page.keyboard.down('k');
        await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s.player.x>2825&&s.player.grounded&&Math.abs(s.player.y-282)<10;});
        await page.keyboard.up('d');await page.keyboard.up('k');await page.keyboard.press('e');
        expect((await read(page)).save.coins).toBe(claimed.coins);
        await page.keyboard.down('a');await page.waitForFunction(()=>Reflect.get(window,'__SINBAD_TEST__').player.x<2720);await page.keyboard.up('a');
        await page.waitForFunction(()=>{const s=Reflect.get(window,'__SINBAD_TEST__');return s.player.grounded&&s.player.y>530;});
        expect((await read(page)).player.hp).toBe((await read(page)).player.maxHp);await shot('safe-floor-return');
        expect(errors).toEqual([]);writeFileSync(`${root}/${device}.json`,JSON.stringify({errors,observations},null,2));
    });
}

test('the next stage remains reachable without collecting the optional nest gem',async({page})=>{
    const save=freshSave();save.checkpoint={stageId:'S09',checkpointId:'middle'};save.treasures=['T01','T02','T03'];
    save.completedObjectiveIds=['S09.enemy.3','S09.reward'];save.claimedRewardIds.push('S09.enemy.3','S09.reward.reward');
    save.clearedStageIds=Array.from({length:8},(_,i)=>`S${String(i+1).padStart(2,'0')}`);
    await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(save)});
    await page.goto('/');await ready(page);await moveJourney(page,2840);await page.keyboard.press('e');
    await page.getByRole('button',{name:'다음 스테이지'}).click();
    await expect.poll(async()=>(await read(page)).stage).toBe('S10');
    expect((await read(page)).save.claimedRewardIds).not.toContain('S09.nestGem.reward');
});
