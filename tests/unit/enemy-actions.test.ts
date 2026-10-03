import {describe,expect,it} from 'vitest';
import {maps} from '../../src/content/maps';
import {actionDefeatKind,enemyActionLayout,enemyActionRows,type EnemyActionKey,type EnemyState} from '../../src/content/enemyActions';

describe('enemy action artwork preserves combat and safe defeat semantics',()=>{
    it('covers all 40 distinct frames and preserves the resting foot position through every pose',()=>{
        const frames=new Set<number>();
        for(const row of enemyActionRows)for(const state of ['idle','telegraph','attack','defeated'] as EnemyState[]){
            const layout=enemyActionLayout(row.key as EnemyActionKey,state,130,65);
            frames.add(layout.frame);
            const pose=layout.frame%4;
            const feet=(row.baseline[pose]/512-layout.originY)*layout.displaySize;
            expect(feet).toBeCloseTo(65,8);
            expect(enemyActionLayout(row.key as EnemyActionKey,'recover',130,65).frame).toBe(row.row*4);
        }
        expect(frames.size).toBe(40);
    });
    it('skeleton archers/captains are magical; human guards/pirates surrender and beasts are cleansed',()=>{
        for(const spawn of maps.S01.spawns){expect(spawn.actionArt).toBe('skeleton');expect(actionDefeatKind(spawn.actionArt!)).toBe('magic');}
        for(const spawn of maps.S05.spawns)expect(actionDefeatKind(spawn.actionArt!)).toBe('human');
        for(const [stage,key] of Object.entries({S12:'dragon',S18:'pirate',S19:'kuura',S21:'snake',S22:'tiger',S24:'stone',S31:'kuura'}))
            expect(maps[stage].spawns.at(-1)?.actionArt).toBe(key);
        expect(actionDefeatKind('crab')).toBe('animal');
        expect(actionDefeatKind('pirate')).toBe('human');
        expect(actionDefeatKind('kuura')).toBe('magic');
        expect(maps.S09.spawns.at(-1)?.actionArt).toBeUndefined();
        expect(maps.S10.spawns.every(spawn=>!spawn.actionArt)).toBe(true);
    });
});
