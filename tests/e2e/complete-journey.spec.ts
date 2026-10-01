import {test,expect} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
import {finishJourneyStage,readJourney} from './journey-bot';

// Isolate this long campaign's browser from later regression contexts.
test.use({launchOptions:{channel:'msedge',args:['--disable-background-networking']}});

test('new game completes all 36 stages using real controls and no injected save',async({page},info)=>{
 test.setTimeout(35*60*1000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
 await page.goto('/');await page.getByRole('button',{name:'새 모험 시작'}).click();
 await expect.poll(async()=>(await readJourney(page)).stage).toBe('S01');
 const stages:{id:string;elapsedSeconds:number}[]=[];const began=Date.now();
 for(let number=1;number<=36;number++){
  const id=`S${String(number).padStart(2,'0')}`;
  await expect.poll(async()=>(await readJourney(page)).stage).toBe(id);
  await finishJourneyStage(page,[5,10,15,19,25,29,36].includes(number)?async()=>{await page.screenshot({path:info.outputPath(`${id}-route.png`)});}:undefined);stages.push({id,elapsedSeconds:Math.round((Date.now()-began)/1000)});
  console.log(`JOURNEY ${id} cleared; ${number}/36`);
  if(number===16||number===32){
   const before=(await readJourney(page)).save;
   await page.reload();await page.getByRole('button',{name:`이어하기 · ${before.checkpoint.stageId}`}).click();
   await expect.poll(async()=>(await readJourney(page)).save.claimedRewardIds).toEqual(before.claimedRewardIds);
  }
 }
 const result=await readJourney(page);
 expect(result.save.clearedStageIds).toHaveLength(36);expect(result.save.treasures).toHaveLength(7);expect(result.save.weapons).toHaveLength(7);expect(result.save.flags).toContain('ending');
 await page.getByRole('button',{name:'자유 탐험 계속'}).click();
 await page.getByRole('button',{name:'가방과 지도'}).click();await page.locator('[data-stage="S01"]').click();await expect.poll(async()=>(await readJourney(page)).stage).toBe('S01');
 expect(errors).toEqual([]);
 mkdirSync('docs/validation',{recursive:true});writeFileSync('docs/validation/complete-journey.json',JSON.stringify({date:new Date().toISOString(),input:'normal keyboard, fresh game, no seed/save injection',stages,errors,save:result.save},null,2));
});
