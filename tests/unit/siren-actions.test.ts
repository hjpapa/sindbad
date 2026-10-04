import {describe,it,expect} from 'vitest';
import {maps} from '../../src/content/maps';
import {enemyActionLayout,enemyActionTexture,actionDefeatKind,type EnemyState} from '../../src/content/enemyActions';
import siren from '../../src/content/siren-actions.generated.json' with {type:'json'};
describe('siren actions keep the existing target, support and curse release',()=>{
    it('anchors every foot baseline to the same supported floor and recovers to idle',()=>{
        for(const [frame,state] of (['idle','telegraph','attack','defeated'] as EnemyState[]).entries()){
            const layout=enemyActionLayout('siren',state,128,58);
            expect(layout.frame).toBe(frame);expect(layout.originX).toBe(.5);
            expect((siren.frames[frame].baseline/512-layout.originY)*layout.displaySize).toBeCloseTo(58,8);
            expect(layout.displaySize*siren.idleHeight/512).toBe(128);
        }
        expect(enemyActionLayout('siren','recover',128,58)).toEqual(enemyActionLayout('siren','idle',128,58));
    });
    it('adds a separate sheet to only the S02 boss and preserves its stable ID and curse semantics',()=>{
        const enemies=Object.values(maps).flatMap(map=>map.spawns.filter(spawn=>spawn.actionArt==='siren'));
        expect(enemies).toHaveLength(1);expect(enemies[0]).toMatchObject({id:'S02.enemy.siren',kind:'siren',x:3770,y:552,hp:160});
        expect(enemyActionTexture('siren')).toBe('siren-actions');expect(actionDefeatKind('siren')).toBe('animal');
        expect(maps.S02.objects.filter(object=>object.kind==='shell').map(object=>object.id)).toEqual(['S02.shell.1','S02.shell.2','S02.shell.3']);
        expect(maps.S02.objects.find(object=>object.id==='S02.boomerang')!.needs).toContain('S02.enemy.siren');
    });
});
