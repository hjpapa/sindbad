import {describe,it,expect} from 'vitest';
import {batFlightBounds,batPatrol,batFlightTarget,batSwoop} from '../../src/core/batFlight';
import {maps} from '../../src/content/maps';
import {freshSave,grantReward} from '../../src/core/state';
import {parseSave} from '../../src/core/save';

describe('S26 bounded bat encounters',()=>{
    it('keeps patrol and locked swoop inside the authored bounds even on late frames',()=>{
        for(const home of maps.S26.spawns){
            const path=home.flightPath!,b=batFlightBounds(home,path);
            for(let time=0;time<=24000;time+=73){const p=batPatrol(home,path,time);expect(p.x).toBeGreaterThanOrEqual(b.left);expect(p.x).toBeLessThanOrEqual(b.right);expect(p.y).toBeGreaterThanOrEqual(b.top);expect(p.y).toBeLessThanOrEqual(b.bottom);}
            const origin=batPatrol(home,path,937),target=batFlightTarget(home,path,{x:99999,y:99999});
            expect(target).toEqual({x:b.right,y:b.bottom});
            expect(batFlightTarget(home,path,{x:-999,y:-999})).toEqual({x:b.left,y:b.top});
            for(const progress of [-10,0,.25,.5,.75,1,10]){const p=batSwoop(origin,target,progress);expect(p.x).toBeGreaterThanOrEqual(b.left);expect(p.x).toBeLessThanOrEqual(b.right);expect(p.y).toBeGreaterThanOrEqual(b.top);expect(p.y).toBeLessThanOrEqual(b.bottom);}
            expect(batSwoop(origin,target,.5)).toEqual(target);
            expect(batSwoop(origin,target,2).x).toBeCloseTo(origin.x,10);
        }
    });
    it('preserves old enemy rewards and admits only the two added authored reward IDs',()=>{
        expect(maps.S26.spawns.map(s=>s.id)).toEqual(['S26.enemy.1','S26.enemy.2','S26.enemy.3','S26.enemy.4','S26.enemy.5']);
        expect(maps.S26.spawns.every(s=>s.kind==='bat'&&s.actionArt==='bat'&&s.hp===36&&s.flightPath)).toBe(true);
        const old=freshSave();old.checkpoint={stageId:'S26',checkpointId:'middle'};old.claimedRewardIds.push('S26.enemy.1','S26.enemy.2','S26.enemy.3');old.completedObjectiveIds=['S26.enemy.1','S26.quest.1'];old.totalXp=420;old.coins=19;
        let loaded=parseSave(JSON.stringify(old));expect(loaded.claimedRewardIds).toEqual(old.claimedRewardIds);
        loaded=grantReward(loaded,{id:'S26.enemy.1',xp:6,coins:3});expect(loaded.totalXp).toBe(420);expect(loaded.coins).toBe(19);
        for(const id of ['S26.enemy.4','S26.enemy.5'])loaded=grantReward(loaded,{id,xp:6,coins:3});
        const again=parseSave(JSON.stringify(loaded));expect(again.totalXp).toBe(432);expect(again.coins).toBe(25);expect(again.completedObjectiveIds).toEqual(old.completedObjectiveIds);
        expect(()=>parseSave(JSON.stringify({...old,claimedRewardIds:[...old.claimedRewardIds,'S26.enemy.6']}))).toThrow();
        expect(maps.S26.objects.filter(o=>o.needs?.some(id=>id.startsWith('S26.enemy.')))).toEqual([]);
        expect(maps.S08.spawns).toHaveLength(4);expect(maps.S08.spawns.every(s=>!s.flightPath)).toBe(true);
    });
});
