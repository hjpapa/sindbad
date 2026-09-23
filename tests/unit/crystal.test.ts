import {describe,it,expect} from 'vitest';
import {connectedMirrors,mirrorSolution,rotateMirror} from '../../src/core/crystal';
import {freshSave,grantReward,canEnter} from '../../src/core/state';
import {objectiveReward} from '../../src/core/adventure';
import {maps} from '../../src/content/maps';
import {parseSave} from '../../src/core/save';
describe('S08 mirrors and truth orb',()=>{
 it('has exactly one solution among all 64 orientations, without ownership requirements',()=>{let solutions=0;for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++)if(connectedMirrors([a,b,c])===3)solutions++;expect(solutions).toBe(1);expect(connectedMirrors(mirrorSolution)).toBe(3);expect(connectedMirrors([1,0,2])).toBe(1);expect(maps.S08.objects.filter(o=>o.kind==='mirror').every(o=>!o.requiresItems)).toBe(true);});
 it('rotates only one mirror, wraps after four presses, without mutating input',()=>{const initial=[0,0,0];let state=initial;for(let n=0;n<4;n++)state=rotateMirror(state,1);expect(state).toEqual(initial);expect(initial).toEqual([0,0,0]);expect(rotateMirror(initial,2)).toEqual([0,0,1]);});
 it('grants T02 and safe checkpoint once, keeping the chosen active skill',()=>{const initial=freshSave();initial.treasures=['T01'];initial.equippedSkill='flamePulse';const r=objectiveReward(maps.S08.objects.find(o=>o.kind==='truthGift')!);const saved=parseSave(JSON.stringify(grantReward(initial,r)));expect(saved.treasures).toEqual(['T01','T02']);expect(saved.equippedSkill).toBe('flamePulse');expect(saved.checkpoint).toEqual({stageId:'S08',checkpointId:'gift'});expect(grantReward(saved,r)).toBe(saved);});
 it('keeps journal discovery separate from the mandatory treasure and deduplicates reload',()=>{const def=maps.S08.objects.find(o=>o.kind==='journal')!;expect(def.requiresItems).toEqual(['T02']);const r=objectiveReward(def);const saved=parseSave(JSON.stringify(grantReward(freshSave(),r)));expect(saved.journalPageIds).toEqual(['S08.journal']);expect(saved.treasures).toEqual([]);expect(grantReward(saved,r)).toBe(saved);expect(maps.S08.objects.find(o=>o.kind==='exit')!.needs).not.toContain(def.id);});
 it('requires T01 and S07 completion at entry',()=>{const s=freshSave();s.clearedStageIds=['S07'];expect(canEnter(s,'S08')).toBe(false);s.treasures=['T01'];expect(canEnter(s,'S08')).toBe(true);});
});
