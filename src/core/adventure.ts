import type {ObjectDef, Platform} from '../content/maps';
import {type Reward,type Save} from './state';
export function objectiveReward(def:ObjectDef):Reward {
  const golden=def.reward?.startsWith('G')?def.reward:undefined;
  return {id:golden?`${def.id.split('.')[0]}.golden.${golden}`:`${def.id}.reward`,objectives:[def.id],goldenHearts:golden?[golden]:[],xp:golden?15:0,coins:def.reward==='coins'?25:0,weapons:def.reward==='W02'?['W02']:[],relics:def.reward?.startsWith('R')?[def.reward]:[],flags:def.rewardFlags??[],checkpoint:def.kind==='rescue'?{stageId:'S05',checkpointId:'rescue'}:undefined};
}
export const canBreatheUnderwater=(s:Save)=>s.flags.includes('bubbleBlessing')||s.treasures.includes('T04');
export const canSwimFreely=(s:Save)=>s.treasures.includes('T04');
export const rescueEquipment=['S04.gear.1','S04.gear.2','S04.gear.3'];
export const movingPlatformY=(p:Platform,elapsed:number)=>p.y-(p.motion?.rise??0)*(1-Math.cos(Math.max(0,elapsed)/(p.motion?.period??5000)*Math.PI*2))/2;
export function shieldBlocks(state:string,playerX:number,enemyX:number,targetX:number){return state!=='recover' && Math.sign(playerX-enemyX)===Math.sign(targetX-enemyX);}
