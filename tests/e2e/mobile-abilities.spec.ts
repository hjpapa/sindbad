import {test,expect,type Page} from '@playwright/test';
import {freshSave} from '../../src/core/state';
import {SAVE_KEY} from '../../src/core/save';
import campaign from '../../src/content/stageIndex';
import {maps} from '../../src/content/maps';

const read=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__'));
async function hold(page:Page,action:string,ms:number){
    const button=page.locator(`[data-action="${action}"]`);
    const box=await button.boundingBox();expect(box).not.toBeNull();
    await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
    await page.mouse.down();await page.waitForTimeout(ms);await page.mouse.up();
}
test('phone can descend, cast its selected treasure, and open S26 bridge using action',async({page})=>{
    const save=freshSave();const prior=campaign.slice(0,25);
    save.checkpoint={stageId:'S26',checkpointId:'start'};
    save.clearedStageIds=prior.map(stage=>stage.id);
    save.treasures=['T01','T02','T03','T04','T05'];save.weapons=['W01','W02','W03','W04','W05','W06'];
    save.flags=[...new Set(prior.flatMap(stage=>stage.rewardFlags))];save.equippedSkill='flamePulse';
    await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:SAVE_KEY,value:JSON.stringify(save)});
    await page.setViewportSize({width:360,height:740});await page.goto('/');
    await page.getByRole('button',{name:'이어하기 · S26'}).click();
    await expect.poll(async()=>!!(await read(page)).player).toBe(true);
    const visible=page.locator('#touch button:visible');await expect(visible).toHaveCount(6);
    for(const button of await visible.all()){
        const box=(await button.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(360);
        expect(box.y+box.height).toBeLessThanOrEqual(740);
    }
    await expect(page.getByRole('button',{name:'가방과 지도'})).toBeVisible();
    const y=(await read(page)).player.y;
    await hold(page,'jump',500);expect((await read(page)).player.y).toBeLessThan(y-60);
    const high=(await read(page)).player.y;
    await hold(page,'down',600);expect((await read(page)).player.y).toBeGreaterThan(high+60);
    await hold(page,'down',300);
    const mp=(await read(page)).mp;await hold(page,'skill',60);
    await expect.poll(async()=>(await read(page)).mp).toBeLessThan(mp-10);
    const target=maps.S26.objects.find(object=>object.kind==='bridge')!;
    const deadline=Date.now()+16000;
    while(Math.abs((await read(page)).player.x-target.x)>25){
        expect(Date.now()).toBeLessThan(deadline);
        await hold(page,(await read(page)).player.x<target.x?'right':'left',120);
    }
    await hold(page,'primary',60);
    await expect.poll(async()=>(await read(page)).save.completedObjectiveIds).toContain(target.id);
    expect((await read(page)).save.equippedSkill).toBe('flamePulse');
    await page.reload();await page.getByRole('button',{name:'이어하기 · S26'}).click();
    await expect.poll(async()=>(await read(page)).save.completedObjectiveIds).toContain(target.id);
});
