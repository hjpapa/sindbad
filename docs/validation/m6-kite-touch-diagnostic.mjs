import {chromium} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});const report=[];
const root='docs/screenshots/m6-kite/touch-diagnostic';mkdirSync(root,{recursive:true});
for(const [device,viewport] of Object.entries({phone:{width:844,height:390},tablet:{width:1180,height:820}})){
    for(const scenario of ['open-space','after-walk-slide']){
        const context=await browser.newContext({viewport,deviceScaleFactor:device==='phone'?3:2,hasTouch:true,isMobile:true});
        const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
        const cdp=await context.newCDPSession(page),read=()=>page.evaluate(()=>window.__SINBAD_TEST__);
        const center=async action=>{const b=await page.locator(`[data-action="${action}"]`).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
        const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
        const hold=async(action,ms)=>{await touch('touchStart',[{...await center(action),id:1}]);await page.waitForTimeout(ms);await touch('touchEnd',[]);};
        await page.goto('http://127.0.0.1:5175');await page.getByRole('button',{name:'새 모험 시작'}).tap();
        await page.waitForFunction(()=>window.__SINBAD_TEST__?.player);await page.waitForTimeout(2600);
        const right=await center('right'),left=await center('left'),jump=await center('jump');
        if(scenario==='after-walk-slide'){
            await hold('right',900);await touch('touchStart',[{...right,id:2}]);await page.waitForTimeout(400);
            await touch('touchMove',[{...left,id:2}]);await page.waitForTimeout(500);await touch('touchEnd',[]);
        }
        const before=(await read()).player;
        await page.screenshot({path:`${root}/${device}-${scenario}-before.png`});
        await touch('touchStart',[{...right,id:3},{...jump,id:4}]);await page.waitForTimeout(260);
        const air=(await read()).player;await touch('touchEnd',[]);
        await page.screenshot({path:`${root}/${device}-${scenario}-air.png`});
        report.push({device,scenario,before,air,dx:air.x-before.x,dy:air.y-before.y,errors});await context.close();
    }
}
await browser.close();writeFileSync('docs/validation/m6-kite-touch-diagnostic.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report.map(({device,scenario,dx,dy,before,air})=>({device,scenario,dx,dy,before,air})),null,2));
