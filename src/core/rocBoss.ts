import type {Reward, Save} from './state';

export const rocBossId='S09.enemy.3';
export const rocCoreProofs=['S09.roc.core.1','S09.roc.core.2',rocBossId] as const;
export const retiredRocEnemyIds=['S09.enemy.1','S09.enemy.2'] as const;
export const rocPatterns=[
    {name:'부리 찍기',telegraph:1200,attack:350,recover:2600},
    {name:'날개 바람',telegraph:1400,attack:700,recover:2600},
    {name:'급강하',telegraph:1700,attack:500,recover:3000},
] as const;

// Old channel objectives are not evidence of core strikes. A previously
// defeated boss remains defeated; no schema migration removes old rewards.
export function rocCoresBroken(save:Save){
    if(save.claimedRewardIds.includes(rocBossId)||save.completedObjectiveIds.includes(rocBossId))return 3;
    return rocCoreProofs.slice(0,2).filter(id=>save.claimedRewardIds.includes(id)).length;
}
export function rocCoreReward(index:number):Reward{
    if(!Number.isInteger(index)||index<0||index>2)throw Error('Invalid roc core');
    return {id:rocCoreProofs[index],objectives:[`S09.quest.${index+1}`,...(index===2?[rocBossId]:[])],
        ...(index===2?{xp:6,coins:3,checkpoint:{stageId:'S09',checkpointId:'middle'}}:{})};
}
export function rocCoreOpen(state:string,struck:boolean,hasOrb:boolean){return state==='recover'&&!struck&&hasOrb;}
export function rocZone(pattern:number,originX:number,targetX:number){
    if(pattern===1){const direction=Math.sign(targetX-originX)||1;return {x:originX+direction*235,y:565,width:470,height:86};}
    return {x:pattern===2?targetX:originX,y:550,width:pattern===2?180:210,height:116};
}
export function insideRocZone(zone:ReturnType<typeof rocZone>,x:number,y:number){
    return Math.abs(x-zone.x)<zone.width/2+21&&Math.abs(y-zone.y)<zone.height/2+42;
}
