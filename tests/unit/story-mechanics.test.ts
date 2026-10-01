import {describe,expect,it} from 'vitest';
import {channelProgress,rotateDevice,treasureTrialAllowed} from '../../src/core/storyMechanics';
import {freshSave,grantReward} from '../../src/core/state';
import {parseSave} from '../../src/core/save';
import {maps} from '../../src/content/maps';
import {objectiveReward} from '../../src/core/adventure';

describe('story devices and compatible saves',()=>{
 it('saves a chapter gift and safe checkpoint atomically without rolling later progress back',()=>{
  const gift=maps.S25.objects.find(object=>object.id==='S25.reward')!;
  const reward=objectiveReward(gift);const once=grantReward(freshSave(),reward);
  expect(once.treasures).toContain('T05');expect(once.weapons).toContain('W06');
  expect(once.completedObjectiveIds).toContain(gift.id);
  expect(once.checkpoint).toEqual({stageId:'S25',checkpointId:'middle'});
  const later={...once,checkpoint:{stageId:'S26',checkpointId:'start'}};
  expect(grantReward(later,reward)).toEqual(later);
 });
 it('rotates through visible directions and only completes the target',()=>{
  expect(rotateDevice(0,3)).toEqual({next:1,complete:false});
  expect(rotateDevice(2,3)).toEqual({next:3,complete:true});
  expect(rotateDevice(3,1)).toEqual({next:0,complete:false});
 });
 it('requires continuous proximity for channeling and resets a left device',()=>{
  expect(channelProgress(800,100,false,900)).toEqual({next:0,complete:false});
  expect(channelProgress(800,150,true,900)).toEqual({next:900,complete:true});
  expect(channelProgress(500,-100,true,900)).toEqual({next:500,complete:false});
 });
 it('does not consume treasures or MP during mandatory gate trials',()=>{
  const save=freshSave();save.treasures=['T01','T02','T03','T04','T05','T06','T07'];
  const before=structuredClone(save);
  for(const object of maps.S30.objects.filter(object=>object.mechanic?.type==='treasure')){
   expect(treasureTrialAllowed(save,object.requiresItems![0])).toBe(true);
  }
  expect(save).toEqual(before);expect(treasureTrialAllowed(freshSave(),'T07')).toBe(false);
 });
 it('grants swimming and bridge before their same-stage practice, with no dependency cycles',()=>{
  for(const [id,item] of [['S16','T04'],['S25','T05']]){
   const map=maps[id];const practice=map.objects.find(object=>object.id===`${id}.quest.4`)!;
   const gift=map.objects.find(object=>object.id===`${id}.reward`)!;
   expect(gift.needs).not.toContain(practice.id);expect(practice.needs).toContain(gift.id);
   expect(grantReward(freshSave(),objectiveReward(gift)).treasures).toContain(item);
  }
 });
 it('round-trips selected moon bridge and final rewards without duplicating',()=>{
  const save=freshSave();save.treasures=['T05'];save.equippedSkill='moonBridge';
  expect(parseSave(JSON.stringify(save)).equippedSkill).toBe('moonBridge');
  const reward=objectiveReward(maps.S36.objects.find(object=>object.kind==='gift')!);
  const once=grantReward(save,reward);expect(grantReward(once,reward)).toEqual(once);
  expect(parseSave(JSON.stringify(once)).flags).toContain('ending');
 });
});
