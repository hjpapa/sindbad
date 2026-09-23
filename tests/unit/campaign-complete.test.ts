import {describe,expect,it} from 'vitest';
import campaign from '../../src/content/stageIndex';
import {finalBlueprints} from '../../src/content/finalStages';
import {maps} from '../../src/content/maps';
import {objectiveReward} from '../../src/core/adventure';
import {freshSave,grantReward} from '../../src/core/state';

describe('complete campaign implementation',()=>{
  it('registers every stage as a distinct playable map',()=>{
    expect(campaign).toHaveLength(36);
    expect(campaign.every(stage=>stage.status==='implemented')).toBe(true);
    expect(Object.keys(maps)).toHaveLength(36);
    expect(new Set(finalBlueprints.map(stage=>stage.steps.join('|'))).size).toBe(28);
    for(const stage of campaign){
      expect(maps[stage.id].objects.some(object=>object.kind==='exit'||object.kind==='ending')).toBe(true);
      expect(maps[stage.id].objective.length).toBeGreaterThan(8);
    }
  });

  it('implements the flight, swimming, peaceful and final sequences',()=>{
    expect(maps.S10.mode).toBe('flight');
    expect(maps.S16.mode).toBe('swim');
    expect(maps.S28.peaceful).toBe(true);
    expect(maps.S28.spawns).toHaveLength(0);
    expect(maps.S36.objects.at(-1)?.kind).toBe('ending');
  });

  it('grants every late-game mandatory reward exactly once and selects its ability',()=>{
    let save=freshSave();
    for(const id of ['S09','S11','S12','S15','S16','S18','S22','S25','S28','S29','S30','S32']){
      const gift=maps[id].objects.find(object=>object.kind==='gift')!;
      const reward=objectiveReward(gift);
      const once=grantReward(save,reward);
      expect(grantReward(once,reward)).toEqual(once);
      save=once;
    }
    expect(save.weapons).toEqual(['W01','W04','W05','W06','W07']);
    expect(save.treasures).toEqual(['T03','T04','T05','T06','T07']);
    expect(save.relics).toEqual(['R03','R04','R05','R06','R07']);
    expect(save.equippedSkill).toBe('dawnWave');
  });
});
