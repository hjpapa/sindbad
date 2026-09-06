import {expect,it} from 'vitest';
import {freshSave,grantReward,maxHp} from '../../src/core/state';
import {parseSave} from '../../src/core/save';
it('boss XP, victory and safe checkpoint survive in the same serialized batch',()=>{
 const s=grantReward(freshSave(),{id:'S01.enemy.captain',xp:30,objectives:['S01.enemy.captain'],checkpoint:{stageId:'S01',checkpointId:'boss'}});
 const loaded=parseSave(JSON.stringify(s));expect(loaded.checkpoint.checkpointId).toBe('boss');expect(loaded.completedObjectiveIds).toContain('S01.enemy.captain');expect(loaded.totalXp).toBe(30);expect(grantReward(loaded,{id:'S01.enemy.captain',xp:30})).toBe(loaded);
});
it('golden-heart identity cannot be doubled by a different batch',()=>{
 const a=grantReward(freshSave(),{id:'S04.golden.G01',goldenHearts:['G01']});const b=grantReward(a,{id:'S04.reward.G01',goldenHearts:['G01']});expect(maxHp(b)).toBe(110);
});
it.each([{claimedRewardIds:['fabricated.reward']},{completedObjectiveIds:['missing.objective']},{flags:['swimmingForFree']}])('rejects unregistered reference %j',change=>expect(()=>parseSave(JSON.stringify({...freshSave(),...change}))).toThrow());
