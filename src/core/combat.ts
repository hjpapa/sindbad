import { weapons, type WeaponId } from '../content/items';
import { progression, type Save } from './state';
// All times are simulation milliseconds, never wall-clock time. Pauses cannot expire cooldowns.
export class Combat {
    private next: Partial<Record<WeaponId, number>> = {};
    private globalNext = 0;
    private lastMelee = -Infinity;
    private combo = 0;
    private serial = 0;
    private hits = new Set<string>();
    start(s: Save, now: number) {
        const id = s.equippedWeapon;
        if (now < (this.next[id] ?? 0) || now < this.globalNext)
            return null;
        this.next[id] = now + weapons[id].interval;
        this.globalNext = now + 180;
        this.combo = id === 'W01' && now - this.lastMelee <= 650 ? (this.combo + 1) % 3 : 0;
        if (id === 'W01')
            this.lastMelee = now;
        this.hits.clear();
        return { id: ++this.serial, weapon: id, damage: Math.round(weapons[id].damage * (1 + 0.055 * (progression(s.totalXp).level - 1)) * (1 + 0.1 * (s.upgrades[id] ?? 0)) * [1, 1.1, 1.3][this.combo]), combo: this.combo + 1 };
    }
    hit(attack: number, target: string, phase = 'melee') { const key = `${attack}:${target}:${phase}`; if (this.hits.has(key))
        return false; this.hits.add(key); return true; }
    reset() { this.hits.clear(); this.next = {}; this.globalNext = 0; this.lastMelee = -Infinity; }
}
