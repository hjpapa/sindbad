import {describe,it,expect} from 'vitest';
import {canCastFlame,flameDamage,ignite} from '../../src/core/flame';
import {freshSave,grantReward,canEnter} from '../../src/core/state';
import {objectiveReward,movingPlatformX} from '../../src/core/adventure';
import {maps} from '../../src/content/maps';
import {parseSave} from '../../src/core/save';
describe('first treasure and waves',()=>{
 it('grants T01 and W03 with checkpoint and skill atomically, once',()=>{const r=objectiveReward(maps.S06.objects.find(o=>o.kind==='flameGift')!);const s=grantReward(freshSave(),r);expect(r.id).toBe('S06.reward.flameTreasure');expect(s.weapons).toContain('W03');expect(s.treasures).toEqual(['T01']);expect(s.equippedSkill).toBe('flamePulse');const saved=parseSave(JSON.stringify(s));expect(saved.checkpoint).toEqual({stageId:'S06',checkpointId:'gift'});expect(grantReward(saved,r)).toBe(saved);});
 it('requires ownership, equipped skill, MP and cooldown, using W01 growth',()=>{const s=freshSave();expect(canCastFlame(s,60,0,0)).toBe(false);s.treasures=['T01'];s.equippedSkill='flamePulse';expect(canCastFlame(s,14,0,0)).toBe(false);expect(canCastFlame(s,15,3999,4000)).toBe(false);expect(canCastFlame(s,15,4000,4000)).toBe(true);expect(flameDamage(s)).toBe(18);s.totalXp=60;s.upgrades.W01=2;expect(flameDamage(s)).toBe(Math.round(12*1.055*1.2*1.5));});
 it('burn refreshes duration without doubling ticks',()=>{const first=ignite(0);expect(first).toEqual({until:3000,next:1000});expect(ignite(500,first)).toEqual({until:3500,next:1000});expect(ignite(4000,first)).toEqual({until:7000,next:5000});});
 it('never requires T01 to light the three initial furnaces',()=>{for(const o of maps.S06.objects.filter(o=>/^S06.furnace\./.test(o.id))){expect(o.requiresItems).toBeUndefined();expect(o.needs).toHaveLength(1);expect(maps.S06.objects.find(t=>t.id===o.needs![0])?.kind).toBe('torch');}});
 it('requires blessing at S07 entry, and opens cave in one reward',()=>{const s=freshSave();s.clearedStageIds=['S06'];expect(canEnter(s,'S07')).toBe(false);s.flags=['bubbleBlessing'];expect(canEnter(s,'S07')).toBe(true);const r=objectiveReward(maps.S07.objects.find(o=>o.kind==='descent')!);const loaded=parseSave(JSON.stringify(grantReward(s,r)));expect(loaded.flags).toContain('genieCave');expect(loaded.checkpoint.checkpointId).toBe('cave');expect(grantReward(loaded,r)).toBe(loaded);});
 it('boat horizontal movement stays inside safe authored gap margins',()=>{for(const p of maps.S07.platforms.filter(p=>p.motion))for(let t=0;t<12000;t+=50)expect(Math.abs(movingPlatformX(p,t)-p.x)).toBeLessThanOrEqual(24);});
});
