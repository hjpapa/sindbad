import {describe,it,expect} from 'vitest';
import {maps} from '../../src/content/maps';
import {enemyActionLayout,enemyActionTexture,actionDefeatKind,type EnemyState} from '../../src/content/enemyActions';
import kite from '../../src/content/kite-actions.generated.json' with {type:'json'};
describe('flying kite poses preserve logical flight targets',()=>{
    it('uses each measured sail centre while keeping the original flight body dimensions',()=>{
        for(const [frame,state] of (['idle','telegraph','attack','defeated'] as EnemyState[]).entries()){
            const layout=enemyActionLayout('kite',state,128,0),centre=kite.frames[frame].centre;
            expect(layout.frame).toBe(frame);
            expect((centre[0]/512-layout.originX)*layout.displaySize).toBeCloseTo(0);
            expect((centre[1]/512-layout.originY)*layout.displaySize).toBeCloseTo(0);
            expect(layout.displaySize*kite.idleHeight/512).toBe(128);
            expect(layout.bodyWidth).toBe(96);
        }
        expect(enemyActionLayout('kite','recover',128,0)).toEqual(enemyActionLayout('kite','idle',128,0));
    });
    it('loads its own sheet only on the two flight maps, with magical release semantics',()=>{
        expect(enemyActionTexture('kite')).toBe('kite-actions');
        expect(enemyActionTexture('skeleton')).toBe('enemy-actions');expect(actionDefeatKind('kite')).toBe('magic');
        expect(Object.values(maps).flatMap(map=>map.spawns.filter(spawn=>spawn.actionArt==='kite'))).toHaveLength(11);
        for(const [id,count] of [['S10',6],['S33',5]] as const){
            expect(maps[id].spawns).toHaveLength(count);
            expect(maps[id].spawns.every(spawn=>spawn.actionArt==='kite'&&spawn.kind==='kite')).toBe(true);
        }
        expect(maps.S01.spawns.every(spawn=>enemyActionTexture(spawn.actionArt!)==='enemy-actions')).toBe(true);
    });
});
