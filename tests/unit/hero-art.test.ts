import {describe,expect,it} from 'vitest';
import {actionFrame,actionHand,heroActionCells} from '../../src/game/heroArt';

describe('hero action sheet',()=>{
    it('switches at the specified attack boundaries and preserves hurt/jump/joy states',()=>{
        expect([0,79,80,199,200,280].map(age=>actionFrame(age,Infinity,false,false,0,0,false))).toEqual([5,5,6,6,7,7]);
        expect(actionFrame(100,0,false,false,0,0,false)).toBe(4);
        expect(actionFrame(Infinity,Infinity,true,false,0,0,false)).toBe(8);
        expect(actionFrame(Infinity,Infinity,false,true,-100,0,false)).toBe(2);
        expect(actionFrame(Infinity,Infinity,false,true,100,0,false)).toBe(3);
        expect(actionFrame(Infinity,Infinity,false,false,0,400,false)).toBe(1);
        expect(actionFrame(Infinity,Infinity,false,false,0,400,true)).toBe(0);
    });
    it('mounts weapons at measured fists relative to the feet and mirrors around the hero',()=>{
        expect(heroActionCells).toHaveLength(9);
        for(let frame=0;frame<9;frame++){
            const right=actionHand(frame,100,600,1),left=actionHand(frame,100,600,-1);
            expect(right.x+left.x).toBeCloseTo(200);
            expect(right.y).toBe(left.y);
        }
        expect(actionHand(6,100,600,1)).toEqual({x:155.96875,y:515.90625});
    });
});
