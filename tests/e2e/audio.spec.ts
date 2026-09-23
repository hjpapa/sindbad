import {test,expect} from '@playwright/test';

test('browser music starts with play, stops in menus, resumes, and respects mute',async({page})=>{
    const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{
        const stats={created:0};Reflect.set(window,'__AUDIO_PROBE__',stats);
        const create=AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator=function(){stats.created++;return create.call(this);};
    });
    const count=()=>page.evaluate(()=>Reflect.get(window,'__AUDIO_PROBE__').created as number);
    await page.goto('/');expect(await count()).toBe(0);
    await page.getByRole('button',{name:'새 모험 시작'}).click();
    await expect.poll(count).toBeGreaterThan(3);
    await page.getByRole('button',{name:'일시정지',exact:true}).click();
    const paused=await count();await page.waitForTimeout(700);expect(await count()).toBe(paused);
    await page.getByRole('button',{name:'모험 계속'}).click();await expect.poll(count).toBeGreaterThan(paused);
    await page.getByRole('button',{name:'일시정지',exact:true}).click();
    await page.getByRole('button',{name:'설정·조작법'}).click();
    await page.locator('#music').fill('0');await page.getByRole('button',{name:'설정 저장 · 돌아가기'}).click();
    await page.getByRole('button',{name:'모험 계속'}).click();
    const muted=await count();await page.waitForTimeout(700);expect(await count()).toBe(muted);
    expect(errors).toEqual([]);
});
