import {progression,type Save} from './state';
export const flameCost=15;
export const flameCooldown=4000;
export function flameDamage(s:Save){return Math.round(12*(1+.055*(progression(s.totalXp).level-1))*(1+.1*(s.upgrades.W01??0))*1.5);}
export function canCastFlame(s:Save,mp:number,now:number,ready:number){return s.treasures.includes('T01')&&s.equippedSkill==='flamePulse'&&mp>=flameCost&&now>=ready;}
// A new hit refreshes duration, without multiplying damage or resetting the next tick.
export function ignite(now:number,previous?:{until:number;next:number}){return {until:now+3000,next:previous&&previous.until>now?previous.next:now+1000};}
