import type {ActiveSkillId} from '../core/skills';

export const touchIconNames = ['jump','talk','inspect','depart','wing','flame','bridge','shield','dawn'] as const;
export type TouchIconKey = `ui-${typeof touchIconNames[number]}`;
export const touchIconPath = (key:TouchIconKey) => `assets/webtoon/${key}.png`;
export const skillIcons:Record<ActiveSkillId,TouchIconKey> = {
    flamePulse:'ui-flame',moonBridge:'ui-bridge',lotusShield:'ui-shield',dawnWave:'ui-dawn',
};
