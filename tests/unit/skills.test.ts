import {describe,expect,it} from 'vitest';
import {activeSkills,ownedActiveSkills,selectActiveSkill} from '../../src/core/skills';
import {freshSave} from '../../src/core/state';

describe('active treasure skill selection',()=>{
 it('only lists skills backed by owned treasures',()=>{
  const save=freshSave();save.treasures=['T01','T06'];
  expect(ownedActiveSkills(save).map(([id])=>id)).toEqual(['flamePulse','lotusShield']);
 });
 it('rejects an unowned skill and selects an owned one without changing inventory',()=>{
  const save=freshSave();save.treasures=['T01'];
  expect(selectActiveSkill(save,'dawnWave')).toBe(save);
  const selected=selectActiveSkill(save,'flamePulse');
  expect(selected.equippedSkill).toBe('flamePulse');
  expect(selected.treasures).toEqual(['T01']);
 });
 it('keeps stable treasure bindings for all four active abilities',()=>{
  expect(Object.values(activeSkills).map(skill=>skill.treasure)).toEqual(['T01','T05','T06','T07']);
 });
});
