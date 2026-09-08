import {objectiveReward} from './adventure';
import { maps } from '../content/maps';
import campaign from '../content/stageIndex';
import { goldenHearts, relics, treasures, weapons, type WeaponId } from '../content/items';
import { freshSave, type Save } from './state';
export const SAVE_KEY = 'sinbad.sevenTreasures.v1.slot1';
export const SAVE_WARNING = '이 브라우저에서는 저장하지 못했어요. 파일로 보관해 주세요.';
const checkpointIds: Record<string, string[]> = Object.fromEntries(campaign.map(s => [s.id, maps[s.id]?.checkpoints.map(c => c.id) ?? ['start']]));
const knownObjectives = new Set(Object.values(maps).flatMap(m => [...m.objects.map(o => o.id), ...m.spawns.map(e => e.id)]));
const knownRewards = new Set(['S01.reward.start', ...campaign.map(s => s.rewardId), ...campaign.flatMap(s => [...s.mandatoryItems, ...s.optionalItems].map(id => `${s.id}.reward.${id}`)), ...Object.values(maps).flatMap(m => [...m.spawns.map(e => e.id), ...m.hearts.map(h => h.id), ...m.objects.flatMap(o => [`${o.id}.reward`,objectiveReward(o).id])]), ...campaign.flatMap(s => s.optionalItems.filter(x => x.startsWith('G')).map(x => `${s.id}.golden.${x}`))]);
const knownFlags = new Set(campaign.flatMap(s => s.rewardFlags));
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const number = (v: unknown, max = 1e9) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
const strings = (v: unknown, allowed?: (id: string) => boolean): v is string[] => Array.isArray(v) && v.length <= 20000 && v.every(x => typeof x === 'string' && x.length <= 150 && /^[\w.-]+$/.test(x) && (!allowed || allowed(x))) && new Set(v).size === v.length;
export function parseSave(raw: string): Save {
    if (new TextEncoder().encode(raw).length > 256 * 1024)
        throw Error('저장 파일이 256KiB보다 큽니다.');
    const v: unknown = JSON.parse(raw);
    if (!record(v) || v.schemaVersion !== 1)
        throw Error('지원하지 않는 저장 버전입니다. 원본을 보존합니다.');
    if (!record(v.checkpoint) || typeof v.checkpoint.stageId !== 'string' || typeof v.checkpoint.checkpointId !== 'string' || !checkpointIds[v.checkpoint.stageId]?.includes(v.checkpoint.checkpointId))
        throw Error('알 수 없는 체크포인트입니다.');
    if (!number(v.totalXp) || !Number.isInteger(v.totalXp) || !number(v.coins) || !Number.isInteger(v.coins))
        throw Error('잘못된 성장 수치입니다.');
    if (!strings(v.weapons, x => x in weapons) || !v.weapons.includes('W01') || typeof v.equippedWeapon !== 'string' || !v.weapons.includes(v.equippedWeapon))
        throw Error('잘못된 무기입니다.');
    if (!strings(v.treasures, x => x in treasures) || !strings(v.relics, x => x in relics) || !strings(v.goldenHearts, x => (goldenHearts as readonly string[]).includes(x)))
        throw Error('알 수 없는 보물입니다.');
    if (!strings(v.clearedStageIds, x => campaign.some(s => s.id === x)) || !strings(v.claimedRewardIds, x => knownRewards.has(x)) || !strings(v.completedObjectiveIds, x => knownObjectives.has(x)) || !strings(v.flags, x => knownFlags.has(x)) || !strings(v.journalPageIds, x => campaign.some(s => x === `${s.id}.journal`)))
        throw Error('잘못된 진행 기록입니다.');
    if (!record(v.upgrades) || !Object.entries(v.upgrades).every(([k, n]) => k in weapons && (n === 0 || n === 1 || n === 2)))
        throw Error('잘못된 강화입니다.');
    if (v.equippedSkill !== null && !['flamePulse', 'lotusShield', 'dawnWave'].includes(String(v.equippedSkill)))
        throw Error('잘못된 스킬입니다.');
    if (!record(v.settings) || !['relaxed', 'normal'].includes(String(v.settings.difficulty)) || !number(v.settings.musicVolume, 1) || !number(v.settings.sfxVolume, 1) || !['reducedMotion', 'largeText', 'aimAssist'].every(x => typeof (v.settings as Record<string, unknown>)[x] === 'boolean'))
        throw Error('잘못된 설정입니다.');
    // Explicit allow-list: never copy arbitrary properties or executable markup from imported JSON.
    const s = freshSave();
    s.checkpoint = { stageId: v.checkpoint.stageId, checkpointId: v.checkpoint.checkpointId };
    s.totalXp = v.totalXp as number;
    s.coins = v.coins as number;
    s.weapons = v.weapons as WeaponId[];
    s.equippedWeapon = v.equippedWeapon as WeaponId;
    s.treasures = v.treasures;
    s.relics = v.relics;
    s.goldenHearts = v.goldenHearts;
    s.clearedStageIds = v.clearedStageIds;
    s.claimedRewardIds = v.claimedRewardIds;
    s.completedObjectiveIds = v.completedObjectiveIds;
    s.flags = v.flags;
    s.journalPageIds = v.journalPageIds;
    s.upgrades = { ...v.upgrades } as Save['upgrades'];
    s.equippedSkill = v.equippedSkill as Save['equippedSkill'];
    s.settings = { difficulty: v.settings.difficulty as 'relaxed' | 'normal', musicVolume: v.settings.musicVolume as number, sfxVolume: v.settings.sfxVolume as number, reducedMotion: v.settings.reducedMotion as boolean, largeText: v.settings.largeText as boolean, aimAssist: v.settings.aimAssist as boolean };
    return s;
}
export interface StoragePort {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export class SaveStore {
    blocked = false;
    constructor(private storage: () => StoragePort, private warn: (message: string) => void) { }
    inspect(): {
        save: Save | null;
        backup: Save | null;
        problem: string | null;
    } {
        let raw: string | null;
        try {
            raw = this.storage().getItem(SAVE_KEY);
        }
        catch {
            this.warn(SAVE_WARNING);
            return { save: null, backup: null, problem: SAVE_WARNING };
        }
        if (!raw)
            return { save: null, backup: null, problem: null };
        try {
            return { save: parseSave(raw), backup: null, problem: null };
        }
        catch (error) {
            this.blocked = true;
            let backup: Save | null = null;
            try {
                const b = this.storage().getItem(SAVE_KEY + '.backup');
                if (b)
                    backup = parseSave(b);
            }
            catch { /* Keep invalid original untouched. */ }
            return { save: null, backup, problem: String(error) };
        }
    }
    write(s: Save) {
        if (this.blocked)
            return false;
        try {
            const storage = this.storage();
            const old = storage.getItem(SAVE_KEY);
            if (old) {
                try {
                    parseSave(old);
                    storage.setItem(SAVE_KEY + '.backup', old);
                }
                catch { /* Invalid source is never used as backup. */ }
            }
            storage.setItem(SAVE_KEY, JSON.stringify({ ...s, writtenAt: new Date().toISOString() }));
            return true;
        }
        catch {
            this.warn(SAVE_WARNING);
            return false;
        }
    }
}
