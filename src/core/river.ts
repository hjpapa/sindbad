import type {Save} from './state';

export const riverRoute={start:530,middle:1560,end:2480,top:512,width:260,speed:100} as const;
// Old bridge completions already prove the former preparation step. Derive
// compatibility without inventing new rewards or mutating an imported save.
export const raftPrepared=(save:Save)=>['S26.raftRope','S26.quest.1','S26.quest.2','S26.quest.3','S26.reward'].some(id=>save.completedObjectiveIds.includes(id));
export const riverStop=(save:Save)=>!save.completedObjectiveIds.includes('S26.quest.1')?1000:!save.completedObjectiveIds.includes('S26.quest.2')?1640:riverRoute.end;
export const advanceRaft=(x:number,stop:number,dt:number,riding:boolean)=>riding?Math.max(x,Math.min(stop,x+riverRoute.speed*Math.max(0,Math.min(dt,50))/1000)):x;
export const swimmingInRiver=(x:number,y:number)=>x>480&&x<2660&&y>468&&y<720;
