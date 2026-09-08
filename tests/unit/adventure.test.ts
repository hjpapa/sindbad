import {describe,it,expect} from 'vitest';
import {maps} from '../../src/content/maps';
import {objectiveReward,canBreatheUnderwater,canSwimFreely,movingPlatformY,shieldBlocks} from '../../src/core/adventure';
import {freshSave,grantReward,maxHp} from '../../src/core/state';
import {parseSave} from '../../src/core/save';
describe('M2 rewards and ability boundary',()=>{
  it('rescue atomically saves blessing, objective and safe checkpoint before dialogue',()=>{const def=maps.S05.objects.find(o=>o.kind==='rescue')!;const r=objectiveReward(def);const s=grantReward(freshSave(),r);expect(s.flags).toContain('bubbleBlessing');expect(s.completedObjectiveIds).toContain('S05.rescue');expect(s.checkpoint).toEqual({stageId:'S05',checkpointId:'rescue'});const loaded=parseSave(JSON.stringify(s));expect(grantReward(loaded,r)).toBe(loaded);expect(canBreatheUnderwater(loaded)).toBe(true);expect(canSwimFreely(loaded)).toBe(false);expect(loaded.treasures).not.toContain('T04');});
  it.each(['S04','S05'])('%s golden heart uses stable one-time ID across reload',id=>{const r=objectiveReward(maps[id].objects.find(o=>o.kind==='golden')!);const s=grantReward(freshSave(),r);const loaded=parseSave(JSON.stringify(s));expect(maxHp(loaded)).toBe(110);expect(loaded.totalXp).toBe(15);expect(grantReward(loaded,r)).toBe(loaded);expect(r.id).toBe(`${id}.golden.${id==='S04'?'G01':'G02'}`);});
  it('only T04 enables swimming; air blessing never does',()=>{const s=freshSave();expect(canBreatheUnderwater(s)).toBe(false);s.flags=['bubbleBlessing'];expect(canSwimFreely(s)).toBe(false);s.treasures=['T04'];expect(canSwimFreely(s)).toBe(true);});
  it('moving whale platform stays in its authored safe range and starts at rest',()=>{const p=maps.S04.platforms.find(p=>p.motion)!;expect(movingPlatformY(p,-100)).toBe(p.y);for(let t=0;t<20000;t+=25){const y=movingPlatformY(p,t);expect(y).toBeGreaterThanOrEqual(p.y-48);expect(y).toBeLessThanOrEqual(p.y);}expect(movingPlatformY(p,2500)).toBe(p.y-48);});
  it('guard shield blocks front, but leaves the rear and recovery vulnerable',()=>{expect(shieldBlocks('telegraph',90,100,90)).toBe(true);expect(shieldBlocks('telegraph',120,100,90)).toBe(false);expect(shieldBlocks('recover',90,100,90)).toBe(false);});
});
