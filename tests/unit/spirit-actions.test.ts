import {describe,it,expect} from 'vitest';
import {maps} from '../../src/content/maps';
import {enemyActionLayout,enemyActionTexture,actionDefeatKind,type EnemyState} from '../../src/content/enemyActions';
import spirit from '../../src/content/spirit-actions.generated.json' with {type:'json'};

describe('spirit actions preserve elemental combat and magic release',()=>{
    it('anchors every pose at its measured core and retains the old target and warning height',()=>{
        for(const [frame,state] of (['idle','telegraph','attack','defeated'] as EnemyState[]).entries()){
            const layout=enemyActionLayout('spirit',state,128,64);
            expect(layout.frame).toBe(frame);expect(layout.bodyWidth).toBe(96);
            expect(layout.originX).toBe(spirit.frames[frame].centre[0]/512);
            expect(layout.originY).toBe(spirit.frames[frame].centre[1]/512);
            expect(layout.displaySize*spirit.idleHeight/512).toBeCloseTo(116,8);
        }
        expect(enemyActionLayout('spirit','recover',128,64)).toEqual(enemyActionLayout('spirit','idle',128,64));
        expect(spirit.legacyGroundIndicatorOffset).toBe(64);
        expect(enemyActionTexture('spirit')).toBe('spirit-actions');expect(actionDefeatKind('spirit')).toBe('magic');
    });
    it('connects the fifteen actual spirits without silently adding the missing fourth S32 curse orb',()=>{
        const expected=[
            ...[1180,2450,3570].map((x,i)=>({id:`S03.enemy.spirit.0${i+1}`,x,y:552,hp:32})),
            ...[500,1100,1760,2370,2990].map((x,i)=>({id:`S06.enemy.spirit.${i+1}`,x,y:552,hp:36})),
            ...[440,1480,2440,3720].map((x,i)=>({id:`S07.enemy.spirit.${i+1}`,x,y:551,hp:36})),
            ...[800,1550,2300].map((x,i)=>({id:`S32.enemy.${i+1}`,x,y:550,hp:63})),
        ];
        const enemies=Object.values(maps).flatMap(map=>map.spawns.filter(spawn=>spawn.actionArt==='spirit'));
        expect(enemies.map(({id,x,y,hp})=>({id,x,y,hp}))).toEqual(expected);
        expect(enemies.every(spawn=>spawn.kind==='spirit')).toBe(true);
        expect(maps.S06.objects.find(o=>o.kind==='flameGift')?.needs).toEqual([
            ...[1,2,3].map(n=>`S06.furnace.${n}`),...[1,2,3,4,5].map(n=>`S06.enemy.spirit.${n}`),
        ]);
    });
});
