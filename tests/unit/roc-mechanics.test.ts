import {describe,it,expect} from 'vitest';
import {freshSave,grantReward} from '../../src/core/state';
import {rocBossId,rocCoresBroken,rocCoreOpen,rocCoreReward,rocPatterns,rocZone,insideRocZone} from '../../src/core/rocBoss';
import {canGlide,glideFallSpeed} from '../../src/core/glide';
import {maps} from '../../src/content/maps';
import {parseSave} from '../../src/core/save';

describe('roc necklace progression and safe movement',()=>{
    it('preserves legacy channels without treating them as new core strikes',()=>{
        let save=freshSave();save.completedObjectiveIds=['S09.quest.1','S09.quest.2','S09.quest.3'];
        save.claimedRewardIds.push(...save.completedObjectiveIds.map(id=>`${id}.reward`));
        expect(rocCoresBroken(save)).toBe(0);
        for(let core=0;core<3;core++){
            const reward=rocCoreReward(core);const once=grantReward(save,reward);
            expect(grantReward(once,reward)).toEqual(once);expect(rocCoresBroken(once)).toBe(core+1);
            expect(rocCoresBroken(parseSave(JSON.stringify(once)))).toBe(core+1);save=once;
        }
        expect(save.totalXp).toBe(6);expect(save.coins).toBe(3);
        expect(save.completedObjectiveIds).toContain(rocBossId);expect(save.checkpoint).toEqual({stageId:'S09',checkpointId:'middle'});
        const oldVictory=freshSave();oldVictory.completedObjectiveIds=[rocBossId];expect(rocCoresBroken(oldVictory)).toBe(3);
        oldVictory.claimedRewardIds.push('S09.enemy.1','S09.enemy.2',rocBossId);
        oldVictory.completedObjectiveIds.push('S09.enemy.1','S09.enemy.2');
        expect(parseSave(JSON.stringify(oldVictory)).claimedRewardIds).toEqual(oldVictory.claimedRewardIds);
        expect(()=>parseSave(JSON.stringify({...oldVictory,claimedRewardIds:[...oldVictory.claimedRewardIds,'S09.roc.core.999']}))).toThrow();
        expect(()=>rocCoreReward(3)).toThrow();
    });
    it('opens only one core on an orb-revealed landing and gives each attack an avoidable zone',()=>{
        for(const state of ['idle','telegraph','attack','defeated'])expect(rocCoreOpen(state,false,true)).toBe(false);
        expect(rocCoreOpen('recover',true,true)).toBe(false);expect(rocCoreOpen('recover',false,false)).toBe(false);
        expect(rocCoreOpen('recover',false,true)).toBe(true);
        expect(rocPatterns.map(p=>p.name)).toEqual(['부리 찍기','날개 바람','급강하']);
        const peck=rocZone(0,2300,2200),wind=rocZone(1,2300,2200),dive=rocZone(2,2300,2100);
        expect(insideRocZone(peck,2240,546)).toBe(true);expect(insideRocZone(peck,2140,546)).toBe(false);
        expect(insideRocZone(wind,2000,546)).toBe(true);expect(insideRocZone(wind,2000,420)).toBe(false);
        expect(insideRocZone(dive,2100,546)).toBe(true);expect(insideRocZone(dive,2260,546)).toBe(false);
        expect(maps.S09.spawns).toHaveLength(1);expect(maps.S09.objects.filter(o=>o.kind==='rocCore')).toHaveLength(3);
        expect(maps.S09.objects.filter(o=>o.kind==='rocCore').every(o=>!o.mechanic&&o.requiresItems?.includes('T02'))).toBe(true);
    });
    it('keeps a legacy victory before any channel completable without new loot',()=>{
        const old=freshSave();old.claimedRewardIds.push(rocBossId,'S09.enemy.1','S09.enemy.2');old.totalXp=42;old.coins=19;
        const loaded=parseSave(JSON.stringify(old));
        expect(loaded.completedObjectiveIds).toEqual(expect.arrayContaining([rocBossId,'S09.quest.1','S09.quest.2','S09.quest.3']));
        expect(loaded.claimedRewardIds).toEqual(old.claimedRewardIds);expect(loaded.totalXp).toBe(42);expect(loaded.coins).toBe(19);
        expect(loaded.treasures).toEqual([]);
        const again=parseSave(JSON.stringify(loaded));
        expect(again.completedObjectiveIds).toEqual(loaded.completedObjectiveIds);expect(again.claimedRewardIds).toEqual(loaded.claimedRewardIds);
        expect(again.totalXp).toBe(42);expect(again.coins).toBe(19);
    });
    it('caps feather-held descent without granting ascent, swimming or flight',()=>{
        expect(glideFallSpeed).toBe(180);expect(canGlide(true,true,false,false,500)).toBe(true);
        for(const [feather,held,free,grounded,vy] of [[false,true,false,false,500],[true,false,false,false,500],[true,true,true,false,500],[true,true,false,true,500],[true,true,false,false,-570],[true,true,false,false,0]] as const)
            expect(canGlide(feather,held,free,grounded,vy)).toBe(false);
    });
});
