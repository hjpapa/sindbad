import {describe,it,expect} from 'vitest';
import {advanceRaft,riverRoute,riverStop,raftPrepared,swimmingInRiver} from '../../src/core/river';
import {freshSave,grantReward} from '../../src/core/state';
import {parseSave} from '../../src/core/save';
import {objectiveReward} from '../../src/core/adventure';
import {maps} from '../../src/content/maps';
import {riverGeometryIssues} from '../../src/content/reachability';

describe('S26 raft and return paths',()=>{
    it('waits without a rider and stops at unopened devices without snapping backwards',()=>{
        const save=freshSave();expect(raftPrepared(save)).toBe(false);expect(riverStop(save)).toBe(1000);
        expect(advanceRaft(530,1000,50,false)).toBe(530);expect(advanceRaft(999,1000,9999,true)).toBe(1000);
        expect(advanceRaft(1560,1000,50,true)).toBe(1560);expect(advanceRaft(530,1000,-1,true)).toBe(530);
        save.completedObjectiveIds=['S26.quest.1'];expect(raftPrepared(save)).toBe(true);expect(riverStop(save)).toBe(1640);
        save.completedObjectiveIds.push('S26.quest.2');expect(riverStop(save)).toBe(riverRoute.end);
    });
    it('keeps delivered preparation once and preserves old bridge saves without a migration reward',()=>{
        const save=freshSave();save.checkpoint={stageId:'S26',checkpointId:'middle'};save.completedObjectiveIds=['S26.quest.1'];
        const legacy=parseSave(JSON.stringify(save));expect(raftPrepared(legacy)).toBe(true);expect(legacy.claimedRewardIds).toEqual(save.claimedRewardIds);
        let prepared=freshSave();prepared.checkpoint.stageId='S26';
        for(const id of ['S26.raftWood','S26.raftRope']){const r=objectiveReward(maps.S26.objects.find(o=>o.id===id)!);prepared=grantReward(grantReward(prepared,r),r);}
        expect(raftPrepared(parseSave(JSON.stringify(prepared)))).toBe(true);expect(prepared.claimedRewardIds.filter(id=>id.startsWith('S26.'))).toHaveLength(2);expect(prepared.coins).toBe(freshSave().coins);
    });
    it('has a dry raft, underwater side chamber and an optional bonus branch outside the exit chain',()=>{
        expect(swimmingInRiver(530,riverRoute.top-62)).toBe(false);expect(swimmingInRiver(1760,642)).toBe(true);expect(swimmingInRiver(2700,550)).toBe(false);
        const map=maps.S26,roof=map.platforms.find(p=>p.x===1860)!,floor=map.platforms.find(p=>p.x===1740)!;
        expect(roof.x-floor.x).toBeGreaterThanOrEqual(96);expect(floor.y-roof.y-roof.h).toBeGreaterThanOrEqual(140);
        expect(map.objects.find(o=>o.id==='S26.golden')?.y).toBeGreaterThan(roof.y+roof.h+42);
        expect(map.objects.filter(o=>o.needs?.some(id=>['S26.golden','S26.branchCoins'].includes(id)))).toEqual([]);
        expect(map.objects.find(o=>o.id==='S26.quest.1')?.needs).toEqual(['S26.raftRope']);
        expect(map.objects.find(o=>o.id==='S26.raftRope')?.needs).toEqual(['S26.raftWood']);
        const exitDevice=map.objects.find(o=>o.id==='S26.quest.3')!;
        expect(exitDevice.x).toBeGreaterThan(2548+42);expect(Math.abs(exitDevice.y-(riverRoute.top-62))).toBeLessThan(95);
    });
    it('rejects an optional cave that removes its return opening or squeezes the player',()=>{
        const narrow=structuredClone(maps.S26);narrow.platforms.find(p=>p.x===1860)!.x=1780;
        expect(riverGeometryIssues(narrow)).toHaveLength(1);
        const low=structuredClone(maps.S26);low.platforms.find(p=>p.x===1860)!.h=100;
        expect(riverGeometryIssues(low)).toHaveLength(1);expect(riverGeometryIssues(maps.S26)).toEqual([]);
    });
});
