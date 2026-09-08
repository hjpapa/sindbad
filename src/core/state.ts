import campaign from '../content/stageIndex';
import { goldenHearts, relics, treasures, weapons, type WeaponId } from '../content/items';
export interface Save {
    schemaVersion: 1;
    buildVersion: string;
    writtenAt: string;
    checkpoint: {
        stageId: string;
        checkpointId: string;
    };
    totalXp: number;
    coins: number;
    weapons: WeaponId[];
    equippedWeapon: WeaponId;
    upgrades: Partial<Record<WeaponId, 0 | 1 | 2>>;
    treasures: string[];
    relics: string[];
    goldenHearts: string[];
    equippedSkill: 'flamePulse' | 'lotusShield' | 'dawnWave' | null;
    clearedStageIds: string[];
    claimedRewardIds: string[];
    completedObjectiveIds: string[];
    flags: string[];
    journalPageIds: string[];
    settings: {
        difficulty: 'relaxed' | 'normal';
        musicVolume: number;
        sfxVolume: number;
        reducedMotion: boolean;
        largeText: boolean;
        aimAssist: boolean;
    };
}
export interface Reward {
    id: string;
    xp?: number;
    coins?: number;
    weapons?: WeaponId[];
    treasures?: string[];
    relics?: string[];
    goldenHearts?: string[];
    flags?: string[];
    objectives?: string[];
    checkpoint?: Save['checkpoint'];
}
export function freshSave(): Save { return { schemaVersion: 1, buildVersion: '0.1.0', writtenAt: new Date().toISOString(), checkpoint: { stageId: 'S01', checkpointId: 'start' }, totalXp: 0, coins: 0, weapons: ['W01'], equippedWeapon: 'W01', upgrades: {}, treasures: [], relics: [], goldenHearts: [], equippedSkill: null, clearedStageIds: [], claimedRewardIds: ['S01.reward.start'], completedObjectiveIds: [], flags: [], journalPageIds: [], settings: { difficulty: 'relaxed', musicVolume: 0, sfxVolume: 0.25, reducedMotion: false, largeText: false, aimAssist: true } }; }
export function progression(totalXp: number) { let level = 1, remaining = totalXp; while (level < 20 && remaining >= 60 + 20 * (level - 1)) {
    remaining -= 60 + 20 * (level - 1);
    level++;
} return { level, xpIntoLevel: remaining, nextXp: level === 20 ? 0 : 60 + 20 * (level - 1) }; }
export const maxHp = (s: Save) => 100 + 5 * (progression(s.totalXp).level - 1) + 10 * s.goldenHearts.length;
export const maxMp = (s: Save) => 60 + 2 * (progression(s.totalXp).level - 1);
const union = <T>(a: T[], b: T[] = []) => [...new Set([...a, ...b])];
export function grantReward(s: Save, r: Reward): Save {
    if (s.claimedRewardIds.includes(r.id))
        return s;
    return { ...s, equippedSkill:s.equippedSkill??(r.treasures?.includes('T01')?'flamePulse':null), checkpoint: r.checkpoint ?? s.checkpoint, totalXp: s.totalXp + (r.xp ?? 0), coins: s.coins + (r.coins ?? 0), claimedRewardIds: [...s.claimedRewardIds, r.id], weapons: union(s.weapons, r.weapons), treasures: union(s.treasures, r.treasures), relics: union(s.relics, r.relics), goldenHearts: union(s.goldenHearts, r.goldenHearts), flags: union(s.flags, r.flags), completedObjectiveIds: union(s.completedObjectiveIds, r.objectives) };
}
export function collectHeart(s: Save, hp: number, id: string, large = false) { const next = grantReward(s, { id, xp: large ? 5 : 2 }); return { save: next, hp: progression(next.totalXp).level > progression(s.totalXp).level ? maxHp(next) : Math.min(maxHp(next), hp + (large ? 60 : 25)) }; }
export function equip(s: Save, id: WeaponId): Save { return s.weapons.includes(id) ? { ...s, equippedWeapon: id } : s; }
export function damageAmount(s: Save, base: number, element: 'normal' | 'lightning' | 'poison' = 'normal') { return base * (s.settings.difficulty === 'relaxed' ? 0.6 : 1) * (element === 'lightning' && s.relics.includes('R02') ? 0.75 : 1); }
export function takeDamage(s: Save, hp: number, base: number, element: 'normal' | 'lightning' | 'poison' = 'normal') { return Math.max(element === 'poison' ? 1 : 0, hp - damageAmount(s, base, element)); }
export function canEnter(s: Save, id: string) { const i = campaign.findIndex(x => x.id === id); if (i < 0)
    return false; const stage = campaign[i]; return (i === 0 || s.clearedStageIds.includes(campaign[i - 1].id)) && stage.entryItems.every(x => [...s.weapons, ...s.treasures].includes(x)) && stage.entryFlags.every(x => s.flags.includes(x)); }
export const itemIds = new Set([...Object.keys(weapons), ...Object.keys(treasures), ...Object.keys(relics), ...goldenHearts]);
