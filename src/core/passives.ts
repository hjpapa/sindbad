import type {Save} from './state';
export const poisonDuration=(save:Save)=>save.relics.includes('R03')?2000:4000;
export const cargoSpeed=(save:Save)=>120*(save.relics.includes('R04')?1.5:1);
export const plantDamage=(save:Save,base:number)=>base*(save.relics.includes('R06')?.8:1);
