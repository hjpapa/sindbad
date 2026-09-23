import type {ObjectDef, Platform} from '../content/maps';
import {type Reward,type Save} from './state';
export function objectiveReward(def:ObjectDef):Reward {
  if(def.kind==='truthGift')return {id:def.id,objectives:[def.id],treasures:['T02'],checkpoint:{stageId:'S08',checkpointId:'gift'}};
  if(def.kind==='journal')return {id:def.id+'.reward',objectives:[def.id],journalPageIds:[def.id]};
  if(def.kind==='flameGift')return {id:def.id,objectives:[def.id],treasures:['T01'],weapons:['W03'],checkpoint:{stageId:'S06',checkpointId:'gift'}};
  if(def.kind==='descent')return {id:def.id+'.reward',objectives:[def.id],flags:def.rewardFlags??[],checkpoint:{stageId:'S07',checkpointId:'cave'}};
  const rewardIds=[...(def.rewards??[]),...(def.reward?[def.reward]:[])];
  const golden=rewardIds.find(id=>id.startsWith('G'));
  return {id:golden?`${def.id.split('.')[0]}.golden.${golden}`:`${def.id}.reward`,objectives:[def.id],goldenHearts:golden?[golden]:[],xp:golden?15:0,coins:def.reward==='coins'?25:0,weapons:rewardIds.filter(id=>id.startsWith('W')) as Reward['weapons'],treasures:rewardIds.filter(id=>id.startsWith('T')),relics:rewardIds.filter(id=>id.startsWith('R')),flags:def.rewardFlags??[],checkpoint:def.kind==='rescue'?{stageId:'S05',checkpointId:'rescue'}:undefined};
}
export const canBreatheUnderwater=(s:Save)=>s.flags.includes('bubbleBlessing')||s.treasures.includes('T04');
export const canSwimFreely=(s:Save)=>s.treasures.includes('T04');
export const rescueEquipment=['S04.gear.1','S04.gear.2','S04.gear.3'];
export const movingPlatformY=(p:Platform,elapsed:number)=>p.y-(p.motion?.rise??0)*(1-Math.cos(Math.max(0,elapsed)/(p.motion?.period??5000)*Math.PI*2))/2;
export const movingPlatformX=(p:Platform,elapsed:number)=>p.x+(p.motion?.travel??0)*Math.sin(Math.max(0,elapsed)/(p.motion?.period??6000)*Math.PI*2);
export function shieldBlocks(state:string,playerX:number,enemyX:number,targetX:number){return state!=='recover' && Math.sign(playerX-enemyX)===Math.sign(targetX-enemyX);}
