import {expect,type Page} from '@playwright/test';
import {maps,type ObjectDef} from '../../src/content/maps';
import campaign from '../../src/content/stageIndex';
import {mirrorSolution} from '../../src/core/crystal';
import type {Save} from '../../src/core/state';

interface State {
 stage:string;player:{x:number;y:number;vx:number;vy:number;grounded:boolean;hp:number};save:Save;freeMovement:boolean;
 enemies:{id:string;x:number;y:number;hp:number;state:string}[];
 storyDevices:{id:string;x:number;y:number;done:boolean}[];
}
export const readJourney=(page:Page)=>page.evaluate(()=>Reflect.get(window,'__SINBAD_TEST__')) as Promise<State>;
export async function skipJourneyDialogue(page:Page){const skip=page.getByRole('button',{name:'전체 생략'});if(await skip.isVisible())await skip.click();}

export async function moveJourney(page:Page,x:number,y=550){
 const deadline=Date.now()+45000;let jumpedAt=0;
 for(;;){
  await skipJourneyDialogue(page);
  const state=await readJourney(page);
  if(!state.player){await page.waitForTimeout(80);continue;}
  if(Date.now()>deadline)throw Error(`route ${state.stage} (${x},${y}): ${JSON.stringify(state.player)}`);
  const dx=x-state.player.x,dy=y-state.player.y;
  const reached=Math.abs(dx)<16&&(state.freeMovement?Math.abs(dy)<35:Math.abs(dy)<110&&state.player.grounded);
  if(reached)break;
  const direction=dx>0?'d':'a';
  await page.keyboard.up(direction==='d'?'a':'d');
  if(Math.abs(dx)>14)await page.keyboard.down(direction);else {await page.keyboard.up('d');await page.keyboard.up('a');}
  if(state.freeMovement){
   if(dy<-20){await page.keyboard.up('s');await page.keyboard.down('ArrowUp');}
   else if(dy>20){await page.keyboard.up('ArrowUp');await page.keyboard.down('s');}
   else {await page.keyboard.up('s');await page.keyboard.up('ArrowUp');}
  }else {
   const feet=state.player.y+62;
   const terrain=maps[state.stage].platforms;
   const supporting=terrain.find(platform=>Math.abs(platform.y-feet)<36&&state.player.x>=platform.x&&state.player.x<=platform.x+platform.w);
   const edge=supporting&&(dx>0?supporting.x+supporting.w-state.player.x<80:state.player.x-supporting.x<80);
   const step=terrain.some(platform=>!platform.oneWay&&platform.y<feet-10&&platform.y>=feet-150&&(dx>0?platform.x-state.player.x>0&&platform.x-state.player.x<95:state.player.x-platform.x-platform.w>0&&state.player.x-platform.x-platform.w<95));
   if(state.player.grounded&&(edge||step||dy<-110)&&Date.now()-jumpedAt>300){await page.keyboard.press('ArrowUp');jumpedAt=Date.now();}
  }
  await page.waitForTimeout(70);
 }
 for(const key of ['a','d','s','ArrowUp'])await page.keyboard.up(key);
 await page.waitForTimeout(180);
}

export async function fightJourney(page:Page,id:string){
 for(let attempt=0;attempt<100;attempt++){
  await skipJourneyDialogue(page);const state=await readJourney(page);
  const target=state.enemies.find(enemy=>enemy.id===id);
  if(!target||target.hp<=0)return;
  await moveJourney(page,target.x+(target.x>state.player.x?-55:55),target.y);
  const facing=target.x>(await readJourney(page)).player.x?'d':'a';
  await page.keyboard.down(facing);await page.waitForTimeout(35);await page.keyboard.up(facing);
  // Pick an actually acquired melee weapon through its real key binding.
  const weapon=state.save.weapons.includes('W07')?'Digit7':state.save.weapons.includes('W03')?'Digit3':'Digit1';
  await page.keyboard.press(weapon);await page.keyboard.press('j');await page.waitForTimeout(450);
 }
 throw Error(`could not defeat ${id}`);
}

export async function useJourney(page:Page,def:ObjectDef){
 for(let attempt=0;attempt<25;attempt++){
  await skipJourneyDialogue(page);const state=await readJourney(page);
  if(state.save.completedObjectiveIds.includes(def.id))return;
  const runtime=state.storyDevices?.find(device=>device.id===def.id);
  await moveJourney(page,runtime?.x??def.x,runtime?.y??def.y);
  await page.keyboard.press(def.kind==='shell'?'j':'e');
  if(def.id==='S25.quest.4'){
   await page.keyboard.press('ArrowUp');await page.keyboard.down('d');await page.waitForTimeout(820);await page.keyboard.up('d');
   await page.waitForTimeout(650);
   await moveJourney(page,def.x+250,448);
  }
  await page.waitForTimeout(def.kind==='rope'?2800:1200);
  await skipJourneyDialogue(page);
 }
 throw Error(`device ${def.id}: ${JSON.stringify(await readJourney(page))}`);
}

export async function finishJourneyStage(page:Page,beforeExit?:()=>Promise<void>){
 const state=await readJourney(page);const map=maps[state.stage];
 const completed=async(id:string)=>(await readJourney(page)).save.completedObjectiveIds.includes(id);
 async function satisfy(id:string):Promise<void>{
  if(await completed(id))return;
  const enemy=map.spawns.find(enemy=>enemy.id===id);if(enemy){await fightJourney(page,id);return;}
  const object=map.objects.find(object=>object.id===id);if(!object)throw Error(`missing objective ${id}`);
  for(const need of object.needs??[])await satisfy(need);
  await useJourney(page,object);
 }
 if(map.id==='S02')for(const shell of map.objects.filter(object=>object.kind==='shell'))await useJourney(page,shell);
 if(map.id==='S08'){
  for(const [i,mirror] of map.objects.filter(object=>object.kind==='mirror').entries()){
   await moveJourney(page,mirror.x,mirror.y);
   for(let turn=0;turn<mirrorSolution[i];turn++){await page.keyboard.press('e');await page.waitForTimeout(150);}
  }
  await expect.poll(()=>completed('S08.light')).toBe(true);
 }
 const exit=map.objects.find(object=>object.kind==='exit'||object.kind==='ending')!;
 for(const need of exit.needs??[])await satisfy(need);
 if(beforeExit)await beforeExit();
 await moveJourney(page,exit.x,exit.y);await page.keyboard.press('e');
 await expect.poll(async()=>(await readJourney(page)).save.clearedStageIds.includes(map.id)).toBe(true);
 if(map.id!=='S36'){await page.getByRole('button',{name:'다음 스테이지'}).click();await expect.poll(async()=>(await readJourney(page)).stage).toBe(campaign.find(stage=>stage.id===map.id)!.nextStageId);}
}
