import {test,expect} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';

test('3D scene survives save reload and restart with aligned canvases',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.screenshot({path:info.outputPath('3d-title.png')});
  await page.getByRole('button',{name:'새 모험 시작'}).click();
  const read=()=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
  await expect.poll(async()=>(await read()).renderer.mode).toBe('3d');
  await expect(page.locator('.world-3d')).toHaveCount(1);
  await expect.poll(async()=>(await read()).renderer.triangles).toBeGreaterThan(1000);
  await page.keyboard.down('d');await page.keyboard.press('Space');await page.waitForTimeout(650);await page.keyboard.up('d');
  expect((await read()).player.x).toBeGreaterThan(200);
  await page.screenshot({path:info.outputPath('3d-harbor-jump.png')});
  await page.getByRole('button',{name:'일시정지',exact:true}).click();await page.getByRole('button',{name:'체크포인트 저장',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'이어하기 · S01'}).click();
  await expect.poll(async()=>(await read()).renderer.mode).toBe('3d');
  for(let i=0;i<3;i++){
    await page.getByRole('button',{name:'일시정지',exact:true}).click();await page.getByRole('button',{name:'체크포인트에서 재시작',exact:true}).click();
    await expect(page.locator('.world-3d')).toHaveCount(1);
    await expect.poll(async()=>(await read()).renderer.mode).toBe('3d');
  }
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);
  const rects=await page.locator('#game canvas').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
  expect(rects).toHaveLength(2);for(const key of ['x','y','w','h'] as const)expect(Math.abs(rects[0][key]-rects[1][key])).toBeLessThan(2);
  await page.screenshot({path:info.outputPath('3d-mobile.png')});expect(errors).toEqual([]);
});
for(const id of ['S02','S03'])test(`3D ${id} theme loads from existing save`,async({page},info)=>{
  const s=freshSave();s.checkpoint={stageId:id,checkpointId:'start'};s.clearedStageIds=id==='S02'?['S01']:['S01','S02'];s.weapons.push('W02');
  await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(s)});
  await page.goto('/');await page.getByRole('button',{name:`이어하기 · ${id}`}).click();
  await expect.poll(async()=>await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').renderer.mode)).toBe('3d');
  await page.waitForTimeout(700);await page.screenshot({path:info.outputPath(`3d-${id}.png`)});
});

test('3D context loss pauses safely and checkpoint restart recovers',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();
  await expect(page.locator('.world-3d')).toHaveCount(1);
  await page.locator('.world-3d').evaluate(node=>{const gl=(node as HTMLCanvasElement).getContext('webgl2');const extension=gl?.getExtension('WEBGL_lose_context');if(!extension)throw Error('Context loss extension unavailable');extension.loseContext();});
  await expect(page.getByRole('status')).toContainText('그래픽 연결');
  await expect(page.getByRole('button',{name:'체크포인트에서 재시작',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'체크포인트에서 재시작',exact:true}).click();
  await expect.poll(async()=>await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').renderer.mode)).toBe('3d');
  await page.keyboard.down('d');await page.waitForTimeout(350);await page.keyboard.up('d');
  expect(await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').player.x)).toBeGreaterThan(120);
});

test('unavailable 3D context falls back to playable Phaser graphics',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,options?:unknown){if((options as WebGLContextAttributes|undefined)?.powerPreference==='high-performance')return null;return Reflect.apply(original,this,[type,options]);} as typeof original;});
  await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();
  await expect.poll(async()=>await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').renderer.mode)).toBe('2d');
  await expect(page.getByRole('status')).toContainText('기본 그래픽');await expect(page.locator('.world-3d')).toHaveCount(0);
  await page.keyboard.down('d');await page.waitForTimeout(350);await page.keyboard.up('d');expect(await page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__').player.x)).toBeGreaterThan(120);
});

