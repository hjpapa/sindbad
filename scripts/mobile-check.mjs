// Phone/tablet smoke check with real touch events (CDP), against a running dev
// server: `npm run dev` then `node scripts/mobile-check.mjs [baseUrl]`.
// Saves screenshots to docs/screenshots/mobile-*.png and prints a JSON report.
import {chromium} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
const base=process.argv[2]??'http://127.0.0.1:5173';
// Optional evidence folder preserves previous runs when validating new art.
const output=process.argv[3]??'docs/screenshots';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const report={};
const devices={phone:{width:844,height:390,scale:3},tablet:{width:1180,height:820,scale:2}};
for(const [name,d] of Object.entries(devices)){
  const context=await browser.newContext({viewport:{width:d.width,height:d.height},deviceScaleFactor:d.scale,hasTouch:true,isMobile:true});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const cdp=await context.newCDPSession(page);
  const state=()=>page.evaluate(()=>window.__SINBAD_TEST__);
  const center=async action=>{const b=await page.locator(`[data-action="${action}"]`).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
  const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  const hold=async(action,ms)=>{const p=await center(action);await touch('touchStart',[{...p,id:1}]);await page.waitForTimeout(ms);await touch('touchEnd',[]);};
  // Two thumbs: keep walking and press jump partway through, like a child hopping a crate.
  const hop=async(action,ms)=>{const p=await center(action),j=await center('jump');await touch('touchStart',[{...p,id:8},{...j,id:9}]);await page.waitForTimeout(160);await touch('touchEnd',[]);await touch('touchStart',[{...p,id:10}]);await page.waitForTimeout(ms);await touch('touchEnd',[]);};
  await page.addInitScript(()=>localStorage.clear());
  await page.goto(base);
  await page.getByRole('button',{name:'새 모험 시작'}).tap();
  await page.waitForFunction(()=>!!window.__SINBAD_TEST__?.player);
  await page.waitForTimeout(2600);
  const r={};
  r.visibleButtons=await page.locator('#touch button:visible').evaluateAll(list=>list.map(b=>b.dataset.action));
  r.touchMode=await page.evaluate(()=>document.getElementById('app').classList.contains('touch-mode'));
  await page.screenshot({path:join(output,`mobile-${name}-start.png`)});
  let s=await state();const x0=s.player.x;
  await hold('right',900);s=await state();r.walkRight=Math.round(s.player.x-x0);
  // Slide the same finger from ▶ to ◀ without lifting it.
  const right=await center('right'),left=await center('left');
  await touch('touchStart',[{...right,id:2}]);await page.waitForTimeout(400);const mid=(await state()).player.x;
  await touch('touchMove',[{...left,id:2}]);await page.waitForTimeout(500);const after=(await state()).player.x;await touch('touchEnd',[]);
  r.slideReverses=after<mid-20;
  // Run and jump with two thumbs at once.
  const jump=await center('jump');s=await state();const y0=s.player.y,x1=s.player.x;
  await touch('touchStart',[{...right,id:3},{...jump,id:4}]);await page.waitForTimeout(260);const air=await state();await touch('touchEnd',[]);
  r.runJump={dx:Math.round(air.player.x-x1),dy:Math.round(air.player.y-y0)};
  await page.waitForTimeout(700);
  // Walk to the first skeleton, then swing with the action button.
  for(let i=0;i<30;i++){s=await state();const e=s.enemies.find(x=>x.state!=='defeated');if(!e||Math.abs(e.x-s.player.x)<120)break;await (i%2?hop:hold)(e.x>s.player.x?'right':'left',260);}
  const primary=await center('primary');
  await touch('touchStart',[{...primary,id:5}]);await touch('touchEnd',[]);await page.waitForTimeout(130);
  await page.screenshot({path:join(output,`mobile-${name}-swing.png`)});
  for(let i=0;i<14;i++){s=await state();const e=s.enemies.find(x=>x.id==='S01.enemy.skeleton.01');if(e.state==='defeated')break;const dx=e.x-s.player.x;if(Math.abs(dx)>100||s.player.y<500)await hold(dx>0?'right':'left',140);await touch('touchStart',[{...primary,id:6}]);await touch('touchEnd',[]);await page.waitForTimeout(400);}
  s=await state();r.firstSkeleton=s.enemies.find(x=>x.id==='S01.enemy.skeleton.01').state;
  // Back to the captain: the action button should switch to "대화" and open the speech box.
  const npc=250; // S01.captainTalk
  for(let i=0;i<40;i++){s=await state();if(Math.abs(s.player.x-npc)<50)break;await (i%2?hop:hold)(s.player.x>npc?'left':'right',Math.min(380,Math.abs(s.player.x-npc)*1.6));}
  await page.waitForFunction(()=>window.__SINBAD_TEST__.player.grounded,null,{timeout:3000}).catch(()=>{});await page.waitForTimeout(150);
  r.walkBack=Math.round((await state()).player.x);
  r.actionKind=await page.locator('[data-action="primary"]').getAttribute('data-kind');
  await touch('touchStart',[{...primary,id:7}]);await touch('touchEnd',[]);await page.waitForTimeout(300);
  r.dialogue=await page.getByTestId('dialogue-text').textContent().catch(()=>null);
  await page.screenshot({path:join(output,`mobile-${name}-dialogue.png`)});
  r.errors=errors;
  report[name]=r;
  await context.close();
}
console.log(JSON.stringify(report,null,1));
await browser.close();
