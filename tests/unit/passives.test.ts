import {describe,it,expect} from 'vitest';
import {freshSave,takeDamage} from '../../src/core/state';
import {poisonDuration,cargoSpeed,plantDamage} from '../../src/core/passives';
describe('relic passive effects',()=>{
 it('shortens poison from four to two seconds while poison cannot kill',()=>{
  const save=freshSave();expect(poisonDuration(save)).toBe(4000);save.relics=['R03'];expect(poisonDuration(save)).toBe(2000);
  expect(takeDamage(save,2,20,'poison')).toBe(1);
 });
 it('boosts crate movement by 50 percent and reduces plant damage by 20 percent once',()=>{
  const save=freshSave();expect(cargoSpeed(save)).toBe(120);expect(plantDamage(save,10)).toBe(10);
  save.relics=['R04','R06','R06'];expect(cargoSpeed(save)).toBe(180);expect(plantDamage(save,10)).toBe(8);
 });
});
