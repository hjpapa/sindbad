import { describe, expect, it } from 'vitest';
import { collectHeart, freshSave, grantReward, maxHp, progression, equip, takeDamage, canEnter } from '../../src/core/state';
import { Combat } from '../../src/core/combat';
import { parseSave, SAVE_KEY, SaveStore } from '../../src/core/save';
import { validateContent } from '../../src/content/validate';
import { Input } from '../../src/game/input';
describe('progression and rewards', () => {
    it.each([[59, 1], [60, 2], [139, 2], [140, 3], [4560, 20], [9000, 20]])('XP %i → level %i', (xp, l) => expect(progression(xp).level).toBe(l));
    it('heals without exceeding maximum; full HP still grants XP only once', () => { const s = freshSave(), a = collectHeart(s, 100, 'S01.heart.01'); expect(a.hp).toBe(100); expect(a.save.totalXp).toBe(2); const b = collectHeart(a.save, 50, 'S01.heart.01'); expect(b.hp).toBe(75); expect(b.save.totalXp).toBe(2); });
    it('level-up from a heart fully heals', () => { const s = freshSave(); s.totalXp = 59; const a = collectHeart(s, 1, 'S01.heart.01'); expect(a.hp).toBe(105); });
    it('golden heart fixture and batch are idempotent', () => { const s = freshSave(); const r = { id: 'S04.golden.G01', goldenHearts: ['G01'], xp: 15, coins: 10 }; const a = grantReward(s, r); expect(maxHp(a)).toBe(110); expect(grantReward(a, r)).toBe(a); expect(a.goldenHearts).toEqual(['G01']); });
    it('reward atomically records weapon and objective', () => { const s = grantReward(freshSave(), { id: 'S02.boomerang.reward', weapons: ['W02'], objectives: ['S02.boomerang'] }); expect(s.weapons).toContain('W02'); expect(s.completedObjectiveIds).toContain('S02.boomerang'); expect(parseSave(JSON.stringify(s))).toMatchObject({ weapons: s.weapons, completedObjectiveIds: s.completedObjectiveIds }); });
    it('poison cannot kill and R02 reduces actual lightning damage by 25%', () => { const s = freshSave(); s.settings.difficulty = 'normal'; expect(takeDamage(s, 3, 10, 'poison')).toBe(1); expect(takeDamage(s, 100, 20, 'lightning')).toBe(80); s.relics = ['R02']; expect(takeDamage(s, 100, 20, 'lightning')).toBe(85); });
});
describe('combat', () => {
    it('rejects unavailable weapon and retains cooldown when switching', () => { let s = freshSave(); expect(equip(s, 'W02')).toBe(s); s.weapons.push('W02'); const c = new Combat(); expect(c.start(s, 0)).not.toBeNull(); s = equip(s, 'W02'); expect(c.start(s, 100)).toBeNull(); expect(c.start(s, 200)).not.toBeNull(); s = equip(s, 'W01'); expect(c.start(s, 300)).toBeNull(); expect(c.start(s, 400)).not.toBeNull(); });
    it('deduplicates melee and each boomerang phase; next throw allowed after cooldown', () => { const c = new Combat(), s = freshSave(); s.weapons.push('W02'); s.equippedWeapon = 'W02'; const a = c.start(s, 0)!; expect(c.hit(a.id, 'enemy', 'out')).toBe(true); expect(c.hit(a.id, 'enemy', 'out')).toBe(false); expect(c.hit(a.id, 'enemy', 'return')).toBe(true); expect(c.hit(a.id, 'enemy', 'return')).toBe(false); expect(c.start(s, 1200)).not.toBeNull(); });
    it('produces three melee combo damages and resets after a gap', () => { const c = new Combat(), s = freshSave(); expect([0, 400, 800, 1800].map(t => c.start(s, t)?.damage)).toEqual([12, 13, 16, 12]); });
    it('simulation time staying fixed preserves cooldown during pause', () => { const c = new Combat(), s = freshSave(); c.start(s, 10); for (let i = 0; i < 10; i++)
        expect(c.start(s, 10)).toBeNull(); expect(c.start(s, 390)).not.toBeNull(); });
});
describe('save integrity', () => {
    it('round trips canonical state, level derived from totalXP', () => { const s = freshSave(); s.totalXp = 140; expect(progression(parseSave(JSON.stringify(s)).totalXp).level).toBe(3); });
    it.each([{ schemaVersion: 2 }, { totalXp: -2 }, { totalXp: Infinity }, { weapons: ['W99'] }, { checkpoint: { stageId: 'S03', checkpointId: 'lava' } }, { relics: ['R99'] }, { goldenHearts: ['G01', 'G01'] }, { equippedWeapon: 'W02' }, { settings: { difficulty: 'relaxed', musicVolume: 10 } }])('rejects invalid save %j', change => expect(() => parseSave(JSON.stringify({ ...freshSave(), ...change }))).toThrow());
    it('drops unknown imported properties and rejects oversized input', () => { expect(parseSave(JSON.stringify({ ...freshSave(), html: '<script>bad</script>' }))).not.toHaveProperty('html'); expect(() => parseSave(' '.repeat(300000))).toThrow(); });
    it('storage exceptions remain recoverable with exported memory state', () => { const notices: string[] = []; const store = new SaveStore(() => { throw Error('blocked'); }, s => notices.push(s)); expect(store.write(freshSave())).toBe(false); expect(notices[0]).toContain('파일'); expect(() => parseSave(JSON.stringify(freshSave()))).not.toThrow(); });
    it('offers backup while preserving corrupt primary and future version', () => { const data = new Map([[SAVE_KEY, '{"schemaVersion":99}'], [SAVE_KEY + '.backup', JSON.stringify(freshSave())]]); const store = new SaveStore(() => ({ getItem: k => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); } }), () => { }); expect(store.inspect().backup?.checkpoint.stageId).toBe('S01'); expect(store.write(freshSave())).toBe(false); expect(data.get(SAVE_KEY)).toBe('{"schemaVersion":99}'); });
    it('writes a validated previous snapshot as backup', () => { const data = new Map<string, string>(); const store = new SaveStore(() => ({ getItem: k => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); } }), () => { }); const s = freshSave(); store.write(s); s.totalXp = 60; store.write(s); expect(parseSave(data.get(SAVE_KEY + '.backup')!).totalXp).toBe(0); });
});
describe('campaign and input', () => {
    it('all content references and ability acquisition paths are valid', () => expect(validateContent()).toEqual([]));
    it('stage locks are derived from prior completion', () => { const s = freshSave(); expect(canEnter(s, 'S02')).toBe(false); s.clearedStageIds.push('S01'); expect(canEnter(s, 'S02')).toBe(true); expect(canEnter(s, 'S30')).toBe(false); });
    it('touch sources support simultaneous actions and clearing', () => { const root = { addEventListener() { }, removeEventListener() { } } as unknown as HTMLElement; const input = new Input(root); input.press('finger1', 'left'); input.press('finger2', 'jump'); expect(input.held('left')).toBe(true); expect(input.consume('jump')).toBe(true); expect(input.consume('jump')).toBe(false); input.release('finger2'); expect(input.held('left')).toBe(true); input.clear(); expect(input.held('left')).toBe(false); input.destroy(); });
});
