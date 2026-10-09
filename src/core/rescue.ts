import type {Platform} from '../content/maps';
import type {Save} from './state';
import {channelProgress} from './storyMechanics';

export const arianaReleased=(save:Save)=>['S32.quest.4','S32.reward'].some(id=>save.completedObjectiveIds.includes(id))||save.clearedStageIds.includes('S32');
export function cooperationProgress(elapsed:number,delta:number,near:boolean,duration:number){
    const progress=channelProgress(elapsed,delta,near,duration);
    return {...progress,innerReady:progress.next>=duration/3};
}
// A companion has no HP/body. Snap her feet to an authored safe platform,
// including when the player jumps or moves across the balcony step.
export function safeCompanionPosition(player:{x:number;y:number},direction:number,platforms:Platform[]){
    const x=Math.max(40,Math.min(Math.max(...platforms.map(p=>p.x+p.w))-40,player.x-direction*70));
    const support=platforms.filter(p=>!p.motion&&x>=p.x&&x<=p.x+p.w)
        .sort((a,b)=>Math.abs(a.y-(player.y+62))-Math.abs(b.y-(player.y+62)))[0];
    return {x,y:support?.y??608};
}
export function escortArrived(player:{x:number;y:number;grounded:boolean},partner:{x:number;y:number;visible:boolean},target:{x:number;y:number}){
    return player.grounded&&partner.visible&&Math.abs(player.x-target.x)<90&&Math.abs(partner.x-target.x)<160&&Math.abs(partner.y-(player.y+62))<24;
}
