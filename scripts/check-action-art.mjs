// Art inspection fixtures only, not a campaign playthrough. All movement,
// swings and dialogues use real input. The game hook is read-only.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://127.0.0.1:5175';
const cells=JSON.parse(readFileSync('art-source/webtoon/hero-action.json','utf8'));
const key='sinbad.sevenTreasures.v1.slot1';
const weapons=Array.from({length:7},(_,i)=>`W0${i+1}`);
const browser=await chromium.launch({channel:'msedge',headless:true});
const report={method:'Edge phone/tablet art inspection with unlocked-weapon and stage-save fixtures, real CDP touch and keyboard input; not campaign completion',devices:{}};
mkdirSync('docs/screenshots/art-a1-a2',{recursive:true});
const state=page=>page.evaluate(()=>window.__SINBAD_TEST__);
try{
for(const [name,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    const context=await browser.newContext({viewport,hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.goto(base);await page.getByRole('button',{name:'새 모험 시작'}).tap();
    await page.waitForFunction(()=>window.__SINBAD_TEST__?.player?.grounded);
    const original=(await state(page)).save;
    const fixture={...original,weapons,equippedWeapon:'W01',settings:{...original.settings,aimAssist:false},totalXp:0};
    const load=async(stage='S01')=>{
        fixture.checkpoint={stageId:stage,checkpointId:'start'};
        fixture.clearedStageIds=stage==='S04'?['S01','S02','S03']:stage==='S03'?['S01','S02']:[];
        await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key,save:fixture});
        await page.reload();await page.getByRole('button',{name:`이어하기 · ${stage}`}).tap();
        await page.waitForFunction(()=>window.__SINBAD_TEST__?.player?.grounded);
        await page.waitForTimeout(300);
    };
    await load();
    const cdp=await context.newCDPSession(page);
    const touch=async(action,ms=0)=>{
        const b=await page.locator(`[data-action="${action}"]`).boundingBox();
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});
        if(ms)await page.waitForTimeout(ms);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    const actions=[];
    const capture=async(label,frame)=>{
        await page.waitForFunction(frame=>window.__SINBAD_TEST__?.heroArt?.frame===frame,frame);
        const observed=await state(page),path=`docs/screenshots/art-a1-a2/${name}-${label}.png`;
        assert.equal(observed.heroArt.texture,'hero-action');
        await page.screenshot({path});actions.push({label,frame,path,hero:observed.heroArt});
    };
    await page.waitForTimeout(2400);
    await capture('idle-a',0);await capture('idle-b',1);
    const boxes=await Promise.all(['right','jump'].map(action=>page.locator(`[data-action="${action}"]`).boundingBox()));
    const start=await state(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:boxes.map((b,i)=>({x:b.x+b.width/2,y:b.y+b.height/2,id:i+1}))});
    await page.waitForTimeout(240);const air=await state(page);
    const runJump={dx:air.player.x-start.player.x,dy:air.player.y-start.player.y};
    assert.ok(runJump.dx>20&&runJump.dy< -50,JSON.stringify(runJump));
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await capture('jump',2);await capture('fall',3);
    await page.waitForFunction(()=>window.__SINBAD_TEST__?.player?.grounded);
    await load();
    const shots=[];
    if(process.argv[3]==='A6'){
        await page.keyboard.down('ArrowRight');
        const deadline=Date.now()+12000;
        while((await state(page)).player.x<400){
            assert.ok(Date.now()<deadline,'could not reach weapon inspection space');
            await page.waitForTimeout(60);
        }
        await page.keyboard.up('ArrowRight');await page.waitForTimeout(180);
    }
    for(const direction of [1,-1]){
        await touch(direction>0?'right':'left',60);await page.waitForTimeout(160);
        for(let i=0;i<weapons.length;i++){
            if((await state(page)).save.equippedWeapon!==weapons[i])await touch('cycle',40);
            assert.equal((await state(page)).save.equippedWeapon,weapons[i]);
            // Let the existing weapon-change icon fade before comparing fists.
            await page.waitForTimeout(1000);
            await touch('primary',40);
            await page.waitForFunction(()=>window.__SINBAD_TEST__?.weaponArt?.visible);
            const s=await state(page),hero=s.heroArt,weapon=s.weaponArt;
            assert.equal(hero.texture,'hero-action');assert.equal(hero.flipX,direction<0);
            const cell=cells[hero.frame],scale=144/512;
            const expected={x:hero.x+direction*(cell.hand[0]-256)*scale,y:hero.y+(cell.hand[1]-cell.baseline)*scale};
            assert.ok(Math.abs(weapon.x-expected.x)<.01&&Math.abs(weapon.y-expected.y)<.01,`hand mismatch ${name} ${weapons[i]}`);
            const path=`docs/screenshots/art-a1-a2/${name}-${weapons[i]}-${direction>0?'right':'left'}.png`;
            await page.screenshot({path});
            shots.push({weapon:weapons[i],direction,frame:hero.frame,hero,hand:expected,weaponArt:weapon,path});
            await page.waitForFunction(()=>window.__SINBAD_TEST__?.attack===null);
            await page.waitForTimeout(600);
        }
    }
    const npcs=[];
    for(const [stage,texture] of [['S01','captain-faces'],['S03','captain-faces'],['S04','sailor-webtoon']]){
        await load(stage);
        await page.keyboard.down('ArrowRight');await page.waitForTimeout(320);await page.keyboard.up('ArrowRight');await page.waitForTimeout(300);
        await touch('primary');await page.getByTestId('dialogue-text').waitFor({state:'visible'});
        const src=await page.locator('.dialogue img').getAttribute('src');
        assert.equal(src,`/assets/webtoon/${texture}.webp`);
        const path=`docs/screenshots/art-a1-a2/${name}-${stage}-dialogue.png`;
        await page.screenshot({path});npcs.push({stage,src,path});
        await page.getByRole('button',{name:'전체 생략'}).tap();
    }
    await load('S03');await capture('hurt',4);
    await load('S01');
    await page.keyboard.down('ArrowRight');
    const until=Date.now()+15000;
    while((await state(page)).player.x<760){
        assert.ok(Date.now()<until,'could not reach the S01 medal');
        const s=await state(page);
        if(s.player.grounded&&s.player.x>380)await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(80);
    }
    await page.keyboard.up('ArrowRight');await page.waitForTimeout(650);
    await page.keyboard.press('e');await capture('joy',8);
    assert.ok((await state(page)).save.relics.includes('R01'));
    assert.deepEqual(errors,[]);
    report.devices[name]={shots,npcs,actions,runJump,errors};
    await context.close();
}
report.pass=true;
}catch(error){report.pass=false;report.error=String(error);throw error;}
finally{writeFileSync('docs/validation/action-art.json',JSON.stringify(report,null,2));await browser.close();}
console.log('PASS: 7 weapons × 2 directions × 2 touch viewports, measured hand anchors, S01/S03 captain and S04 sailor portraits, console/HTTP errors 0.');
