import type {Save} from './state';

export type ActiveSkillId=NonNullable<Save['equippedSkill']>;
export const activeSkills:Record<ActiveSkillId,{treasure:'T01'|'T05'|'T06'|'T07';name:string;short:string;detail:string}>={
  flamePulse:{treasure:'T01',name:'영원의 불씨',short:'불꽃',detail:'R · 15MP · 전방 불꽃 파동'},
  moonBridge:{treasure:'T05',name:'도깨비의 방울',short:'다리',detail:'R · 12MP · 12초 달빛 다리'},
  lotusShield:{treasure:'T06',name:'균형의 연꽃',short:'방패',detail:'R · 15MP · 2.2초 피해 차단'},
  dawnWave:{treasure:'T07',name:'새벽의 나침반',short:'새벽',detail:'R · 20MP · 강한 정화 파동'},
};
export const ownedActiveSkills=(save:Save)=>(Object.entries(activeSkills) as [ActiveSkillId,(typeof activeSkills)[ActiveSkillId]][]).filter(([,skill])=>save.treasures.includes(skill.treasure));
export function selectActiveSkill(save:Save,id:ActiveSkillId):Save{return save.treasures.includes(activeSkills[id].treasure)?{...save,equippedSkill:id}:save;}
