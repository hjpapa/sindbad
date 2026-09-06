import {test,expect} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
test('fall recovery resets physics onto a safe platform instead of inside the floor',async({page},info)=>{
 const s=freshSave();s.checkpoint={stageId:'S02',checkpointId:'start'};s.clearedStageIds=['S01'];
 await page.addInitScript(({key,value})=>localStorage.setItem(key,value),{key:SAVE_KEY,value:JSON.stringify(s)});await page.goto('/');await page.getByRole('button',{name:'이어하기 · S02'}).click();
 const read=()=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__')) as Promise<{stage:string;player:{x:number;y:number;hp:number}}>;
 await expect.poll(async()=>(await read()).stage).toBe('S02');await page.keyboard.down('d');let previous=120;let restored=false;for(let i=0;i<70;i++){await page.waitForTimeout(100);const p=(await read()).player;if(previous>620&&p.x<previous-50){restored=true;break;}previous=p.x;}
 await page.keyboard.up('d');expect(restored).toBe(true);await page.waitForTimeout(500);const p=(await read()).player;expect(p.y).toBeLessThan(600);expect(p.x).toBeLessThan(650);expect(p.hp).toBeGreaterThan(0);await page.screenshot({path:info.outputPath('fall-recovery.png')});
});
