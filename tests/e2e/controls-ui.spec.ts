import { expect, test, type Page } from '@playwright/test';

interface TestState {
    player:{x:number;y:number};
    enemies:{id:string;x:number;state:string;visible:boolean}[];
}
const state = (page: Page) => page.evaluate(() => (window as unknown as {__SINBAD_TEST__: TestState}).__SINBAD_TEST__);

test('simple controls jump, smart action attacks, monster fades, and phone UI fits', async ({page}) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.getByRole('button',{name:'새 모험 시작'}).click();
    await expect.poll(async()=>!!(await state(page)).player).toBe(true);
    const startY=(await state(page)).player.y;
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(150);
    expect((await state(page)).player.y).toBeLessThan(startY-15);
    await page.keyboard.up('ArrowUp');
    await page.keyboard.down('d');
    for(let i=0;i<16&&(await state(page)).player.x<900;i++){await page.keyboard.press('ArrowUp');await page.waitForTimeout(420);}
    expect((await state(page)).player.x).toBeGreaterThan(900);
    await page.keyboard.up('d');
    for(let i=0;i<14;i++){
        const current=await state(page), enemy=current.enemies.find(entry=>entry.id==='S01.enemy.skeleton.01')!;
        if(enemy.state==='defeated')break;
        const delta=enemy.x-current.player.x;
        const key=delta>0?'d':'a';await page.keyboard.down(key);await page.waitForTimeout(Math.abs(delta)>70?120:35);await page.keyboard.up(key);
        await page.keyboard.press('Space');await page.waitForTimeout(340);
    }
    await expect.poll(async()=>(await state(page)).enemies.find(enemy=>enemy.id==='S01.enemy.skeleton.01')?.state).toBe('defeated');
    await expect.poll(async()=>(await state(page)).enemies.find(enemy=>enemy.id==='S01.enemy.skeleton.01')?.visible).toBe(false);
    await page.setViewportSize({width:844,height:390});
    const controls=page.locator('#touch button:visible');
    await expect(controls).toHaveCount(4);
    for(const button of await controls.all()){
        const box=await button.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.x+box!.width).toBeLessThanOrEqual(844);expect(box!.y+box!.height).toBeLessThanOrEqual(390);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({path:'docs/screenshots/mobile-polished.png'});
});
