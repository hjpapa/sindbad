import {describe,it,expect} from 'vitest';
import {rocFlightFrame,rocFlightLayout} from '../../src/content/rocArt';
import {enemyActionLayout,actionDefeatKind} from '../../src/content/enemyActions';
import roc from '../../src/content/roc-actions.generated.json' with {type:'json'};
import {maps} from '../../src/content/maps';

describe('roc saddle and combat invariants',()=>{
    it('keeps rider feet at the saddle through every flight pose and facing',()=>{
        for(const frame of [2,4,5])for(const flip of [false,true]){
            const layout=rocFlightLayout(frame,flip),seat=roc.frames[frame].seat;
            const mirroredX=flip?1-seat[0]/512:seat[0]/512;
            expect((mirroredX-layout.originX)*layout.displaySize).toBeCloseTo(0,10);
            expect((seat[1]/512-layout.originY)*layout.displaySize).toBeCloseTo(0,10);
            expect(layout.displaySize).toBe(307.2);
        }
        expect(rocFlightFrame(160,null,false)).toBe(5);
        expect(rocFlightFrame(320,null,false)).toBe(4);
        expect(rocFlightFrame(160,null,true)).toBe(4);
        expect(rocFlightFrame(160,280,true)).toBe(2);
        expect(rocFlightFrame(160,281,true)).toBe(4);
    });
    it('retains the S09 resting feet, target width and treasure prerequisites',()=>{
        const layout=enemyActionLayout('roc','idle',145,50.75);
        expect((roc.frames[0].baseline/512-layout.originY)*layout.displaySize).toBeCloseTo(50.75,8);
        expect(layout.bodyWidth).toBe(220);expect(actionDefeatKind('roc')).toBe('animal');
        expect(enemyActionLayout('roc','recover',145,50.75)).toEqual(layout);
        expect(maps.S09.spawns.filter(s=>s.actionArt==='roc').map(({id,x,y,hp})=>({id,x,y,hp}))).toEqual([{id:'S09.enemy.3',x:2300,y:550,hp:3}]);
        expect(maps.S09.objects.find(o=>o.kind==='gift')?.needs).toEqual(['S09.quest.3','S09.enemy.3']);
    });
});
