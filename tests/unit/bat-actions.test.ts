import {describe,it,expect} from 'vitest';
import {maps} from '../../src/content/maps';
import {enemyActionLayout,enemyActionTexture,actionDefeatKind,type EnemyState} from '../../src/content/enemyActions';
import bat from '../../src/content/bat-actions.generated.json' with {type:'json'};

describe('bat actions retain torso targets and animal release',()=>{
    it('anchors wing poses at the measured torso and retains the legacy target width',()=>{
        for(const [frame,state] of (['idle','telegraph','attack','defeated'] as EnemyState[]).entries()){
            const layout=enemyActionLayout('bat',state,128,64);
            expect(layout.frame).toBe(frame);expect(layout.bodyWidth).toBe(96);
            expect(layout.originX).toBe(bat.frames[frame].centre[0]/512);
            expect(layout.originY).toBe(bat.frames[frame].centre[1]/512);
            expect(layout.displaySize*bat.idleHeight/512).toBeCloseTo(84,8);
        }
        expect(enemyActionLayout('bat','recover',128,64)).toEqual(enemyActionLayout('bat','idle',128,64));
        expect(bat.legacyGroundIndicatorOffset).toBe(64);
    });
    it('adds the sheet to the four existing S08 bats without replacing IDs, positions or health',()=>{
        const enemies=Object.values(maps).flatMap(map=>map.spawns.filter(spawn=>spawn.actionArt==='bat'));
        expect(enemies.map(({id,x,y,hp,kind})=>({id,x,y,hp,kind}))).toEqual([450,790,1100,1250].map((x,i)=>({id:`S08.enemy.bat.${i+1}`,x,y:550,hp:36,kind:'bat'})));
        expect(enemyActionTexture('bat')).toBe('bat-actions');expect(actionDefeatKind('bat')).toBe('animal');
    });
});
