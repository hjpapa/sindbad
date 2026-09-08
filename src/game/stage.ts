import Phaser from 'phaser';
import { maps, type MapDef, type ObjectDef, type Spawn } from '../content/maps';
import { assets } from '../content/assets.manifest';
import { type WeaponId } from '../content/items';
import { Combat } from '../core/combat';
import { maxHp, maxMp, type Reward, type Save } from '../core/state';
import type { Input } from './input';
export interface Host {
    save: Save;
    hp: number;
    mp: number;
    input: Input;
    reward(r: Reward): void;
    objective(id: string): void;
    persist(): void;
    changed(): void;
    notice(text: string): void;
    dialogue(id: string, done: () => void): void;
    pause(): void;
    map(): void;
    damage(base: number, element?: 'normal' | 'lightning'): boolean;
    heart(id: string, large: boolean): void;
    sound(kind: 'jump' | 'attack' | 'hurt' | 'heart' | 'reward' | 'warning'): void;
    clearStage(): void;
}
interface Enemy {
    def: Spawn;
    sprite: Phaser.GameObjects.Image;
    label: Phaser.GameObjects.Text;
    hp: number;
    maxHp: number;
    state: 'idle' | 'telegraph' | 'attack' | 'recover' | 'defeated';
    until: number;
    target: number;
    pattern: number;
}
interface Projectile {
    sprite: Phaser.GameObjects.Arc;
    glyph: Phaser.GameObjects.Text;
    vx: number;
    vy: number;
    until: number;
    wave: boolean;
}
export class Stage extends Phaser.Scene {
    mapDef!: MapDef;
    player!: Phaser.Physics.Arcade.Sprite;
    private land!: Phaser.Physics.Arcade.StaticGroup;
    private enemies: Enemy[] = [];
    private objects: {
        def: ObjectDef;
        sprite: Phaser.GameObjects.Image;
        label: Phaser.GameObjects.Text;
    }[] = [];
    private hearts: {
        id: string;
        large: boolean;
        sprite: Phaser.GameObjects.Image;
    }[] = [];
    private projectiles: Projectile[] = [];
    private combat = new Combat();
    private sim = 0;
    private direction = 1;
    private jumpAt = -Infinity;
    private groundedAt = -Infinity;
    private invulnerableUntil = 0;
    private dodgeUntil = 0;
    private dodgeReady = 0;
    private safe = { x: 120, y: 548 };
    private attack: {
        id: number;
        weapon: WeaponId;
        damage: number;
        combo: number;
        start: number;
        x: number;
        direction: number;
    } | null = null;
    private boom: Phaser.GameObjects.Image | null = null;
    private slash!: Phaser.GameObjects.Graphics;
    private warnings!: Phaser.GameObjects.Graphics;
    private lightningAt = 2500;
    private lightning: {
        x: number;
        at: number;
    } | null = null;
    private bossText!: Phaser.GameObjects.Text;
    private hint!: Phaser.GameObjects.Text;
    private stopped = false;
    private latestHint = '';
    private lastFrame = 0;
    constructor(private host: Host) { super('stage'); }
    preload() { for (const asset of assets)
        this.load.svg(asset.key, asset.path); }
    create() {
        this.mapDef = maps[this.host.save.checkpoint.stageId];
        this.sim = 0;
        this.direction = 1;
        this.enemies = [];
        this.objects = [];
        this.hearts = [];
        this.projectiles = [];
        this.attack = null;
        this.boom = null;
        this.combat.reset();
        this.stopped = false;
        this.invulnerableUntil = 1500;
        this.dodgeUntil = 0;
        this.dodgeReady = 0;
        this.groundedAt = -Infinity;
        this.jumpAt = -Infinity;
        this.lightning = null;
        this.lightningAt = 2500;
        this.latestHint = '';
        this.host.input.clear();
        // Missing files fall back to a real, generated sailor-shaped texture, never an absent URL.
        for (const asset of assets)
            if (!this.textures.exists(asset.key)) {
                const g = this.make.graphics({ x: 0, y: 0 });
                g.fillStyle(0xeac28b).fillCircle(48, 24, 18);
                g.fillStyle(0x285069).fillRect(27, 43, 42, 43);
                g.fillStyle(0xe7d5a5).fillRect(28, 86, 15, 35).fillRect(55, 86, 15, 35);
                g.generateTexture(asset.key, 96, 128);
                g.destroy();
            }
        this.background();
        this.land = this.physics.add.staticGroup();
        for (const p of this.mapDef.platforms) {
            const rect = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, this.mapDef.theme === 'reef' ? 0x477976 : 0x795d46).setStrokeStyle(3, 0xd8c08c);
            this.land.add(rect);
            this.add.rectangle(p.x + p.w / 2, p.y + 4, p.w, 8, this.mapDef.theme === 'reef' ? 0x9fc7a8 : 0xd2aa70);
        }
        const cp = this.mapDef.checkpoints.find(c => c.id === this.host.save.checkpoint.checkpointId) ?? this.mapDef.checkpoints[0];
        this.safe = { x: cp.x, y: cp.y };
        this.player = this.physics.add.sprite(cp.x, cp.y, 'player').setDepth(10);
        this.player.body?.setSize(42, 84);
        this.player.body?.setOffset(27, 42);
        this.player.setMaxVelocity(300, 1000).setDragX(2600);
        this.physics.add.collider(this.player, this.land);
        this.physics.world.setBounds(0, -200, this.mapDef.width, 1400);
        this.cameras.main.setBounds(0, 0, this.mapDef.width, 720);
        this.cameras.main.startFollow(this.player, true, this.host.save.settings.reducedMotion ? 1 : 0.12, this.host.save.settings.reducedMotion ? 1 : 0.12, 0, 0);
        for (const def of this.mapDef.spawns) {
            const boss = def.kind === 'captain' || def.kind === 'siren';
            if (boss && this.done(def.id))
                continue;
            const texture = def.kind === 'captain' || def.kind === 'archer' ? 'skeleton' : def.kind;
            const sprite = this.add.image(def.x, def.y, texture).setDepth(5);
            if (def.kind === 'captain')
                sprite.setTint(0xffd98e).setScale(1.15);
            const hp = Math.round(def.hp * (this.host.save.settings.difficulty === 'relaxed' ? 0.85 : 1));
            const label = this.add.text(def.x, def.y - 87, '', { fontSize: '19px', fontFamily: 'sans-serif', color: '#fff5cf', backgroundColor: '#173746' }).setOrigin(0.5).setDepth(6);
            this.enemies.push({ def, sprite, label, hp, maxHp: hp, state: 'idle', until: 0, target: def.x, pattern: 0 });
        }
        for (const def of this.mapDef.objects) {
            const texture = def.kind === 'chest' ? 'chest' : def.kind === 'npc' ? (this.mapDef.id === 'S02' ? 'siren' : 'player') : def.kind === 'shell' || def.kind === 'remote' ? 'shell' : def.kind === 'rod' || def.kind === 'crisis' ? 'rod' : 'bell';
            const sprite = this.add.image(def.x, def.y, texture).setScale(def.kind === 'checkpoint' ? 0.42 : 0.68).setDepth(4);
            if (def.kind === 'npc')
                sprite.setTint(0xe1d498);
            const label = this.add.text(def.x, def.y - 64, def.label, { fontSize: '20px', color: '#fff2cc', backgroundColor: '#173b46', padding: { x: 7, y: 4 } }).setOrigin(0.5).setDepth(7);
            this.objects.push({ def, sprite, label });
        }
        for (const h of this.mapDef.hearts)
            this.hearts.push({ id: h.id, large: !!h.large, sprite: this.add.image(h.x, h.y, 'heart').setScale(h.large ? 0.5 : 0.36).setDepth(5) });
        this.slash = this.add.graphics().setDepth(12);
        this.warnings = this.add.graphics().setDepth(3);
        this.bossText = this.add.text(640, 142, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#fce8bc', backgroundColor: '#173643', padding: { x: 12, y: 7 } }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        this.hint = this.add.text(640, 648, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#fff3d2', backgroundColor: '#153847', padding: { x: 14, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.host.input.clear(); this.projectiles = []; this.attack = null; });
        this.host.changed();
    }
    private background() {
        const theme = this.mapDef.theme;
        this.cameras.main.setBackgroundColor(theme === 'storm' ? '#233d53' : theme === 'reef' ? '#7bacb2' : '#bed8c8');
        const g = this.add.graphics().setScrollFactor(0).setDepth(-10);
        g.fillStyle(theme === 'storm' ? 0x2d5369 : 0x70aeb0).fillRect(0, 410, 1280, 310);
        g.fillStyle(theme === 'storm' ? 0x729398 : 0xf8db98).fillCircle(1010, 200, 62);
        for (let i = 0; i < 10; i++) {
            g.lineStyle(2, 0xc6e1ca, 0.2).lineBetween(i * 148, 470 + (i % 4) * 37, i * 148 + 100, 470 + (i % 4) * 37);
        }
        const far = this.add.graphics().setScrollFactor(0.2).setDepth(-8);
        for (let x = 0; x < this.mapDef.width; x += 370) {
            if (theme === 'harbor') {
                far.fillStyle(0x8cafaa).fillRect(x, 285 + (x % 3) * 20, 170, 200);
                far.fillStyle(0x547d80).fillTriangle(x - 15, 295, x + 80, 210, x + 185, 295);
                far.lineStyle(8, 0x52737a).lineBetween(x + 270, 460, x + 270, 230);
                far.fillStyle(0xebdfb7).fillTriangle(x + 278, 240, x + 355, 377, x + 278, 377);
            }
            else if (theme === 'reef') {
                far.fillStyle(0x719996).fillTriangle(x, 500, x + 180, 260, x + 330, 500);
                far.fillStyle(0xd3e3cf, 0.25).fillEllipse(x + 180, 370, 330, 75);
            }
            else {
                far.lineStyle(12, 0x516b76).lineBetween(x + 100, 230, x + 100, 590);
                far.lineStyle(3, 0x81989a).lineBetween(x + 100, 240, x + 330, 590);
                far.fillStyle(0x405d70).fillTriangle(x + 108, 250, x + 250, 435, x + 108, 435);
            }
        }
        this.add.text(42, 187, `${this.mapDef.id} / ${theme === 'harbor' ? '첫 출항' : theme === 'reef' ? '안개 너머' : '폭풍의 밤'}`, { fontSize: '23px', fontFamily: 'sans-serif', color: theme === 'storm' ? '#b8cdd3' : '#385e63' }).setScrollFactor(0.3).setDepth(-5);
    }
    private done(id: string) { return this.host.save.completedObjectiveIds.includes(id); }
    protect(ms: number) { this.invulnerableUntil = Math.max(this.invulnerableUntil, this.sim + ms); }
    freeze(value: boolean) { this.stopped = value; this.host.input.clear(); if (value) {
        this.physics.pause();
        this.player?.setVelocity(0, 0);
    }
    else
        this.physics.resume(); }
    snapshot() { return { stage: this.mapDef?.id, player: this.player ? { x: this.player.x, y: this.player.y, vx: this.player.body?.velocity.x, vy: this.player.body?.velocity.y, hp: this.host.hp, maxHp: maxHp(this.host.save), bodyWidth: this.player.body?.width, bodyHeight: this.player.body?.height } : null, save: structuredClone(this.host.save), sim: this.sim, paused: this.stopped, enemies: this.enemies.map(e => ({ id: e.def.id, x: e.sprite.x, y: e.sprite.y, hp: e.hp, state: e.state })), projectiles: this.projectiles.length, boomerang: !!this.boom, attack: this.attack?.id ?? null, frameMs: this.lastFrame }; }
    update(_time: number, delta: number) {
        if (this.stopped || !this.player)
            return;
        const input = this.host.input;
        if (input.consume('pause')) {
            this.host.pause();
            return;
        }
        if (input.consume('map')) {
            this.host.map();
            return;
        }
        const dt = Math.min(delta, 50);
        this.sim += dt;
        this.lastFrame = delta;
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (body.blocked.down) {
            this.groundedAt = this.sim;
            const nearDanger = this.lightning && Math.abs(this.lightning.x - this.player.x) < 140;
            const solid = this.mapDef.platforms.find(p => this.player.x > p.x + 35 && this.player.x < p.x + p.w - 35 && Math.abs(body.bottom - p.y) < 8);
            if (solid && !nearDanger)
                this.safe = { x: this.player.x, y: this.player.y - 2 };
        }
        if (input.consume('jump'))
            this.jumpAt = this.sim;
        if (this.sim - this.jumpAt <= 150 && this.sim - this.groundedAt <= 120) {
            this.player.setVelocityY(-640);
            this.jumpAt = -Infinity;
            this.groundedAt = -Infinity;
            this.host.sound('jump');
        }
        const move = Number(input.held('right')) - Number(input.held('left'));
        if (move)
            this.direction = move;
        if (input.consume('dodge') && this.sim >= this.dodgeReady) {
            this.dodgeUntil = this.sim + 220;
            this.dodgeReady = this.sim + 700;
            this.invulnerableUntil = Math.max(this.invulnerableUntil, this.sim + 140);
        }
        if (this.sim < this.dodgeUntil)
            this.player.setMaxVelocity(530, 1000).setVelocityX(this.direction * 530).setAccelerationX(0);
        else
            this.player.setMaxVelocity(300, 1000).setAccelerationX(move * 2200);
        this.player.setFlipX(this.direction < 0);
        this.player.setTexture(move && body.blocked.down && Math.floor(this.sim / 130) % 2 === 1 ? 'playerRun' : 'player');
        this.player.setAlpha(this.sim < this.invulnerableUntil ? 0.65 : 1);
        if (input.consume('cycle')) {
            const list = this.host.save.weapons;
            this.host.save.equippedWeapon = list[(list.indexOf(this.host.save.equippedWeapon) + 1) % list.length];
            this.host.persist();
            this.host.changed();
        }
        if (input.digits !== null) {
            const id = `W0${input.digits}` as WeaponId;
            if (this.host.save.weapons.includes(id)) {
                this.host.save.equippedWeapon = id;
                this.host.persist();
                this.host.changed();
            }
            input.digits = null;
        }
        if (input.consume('attack') && !this.boom && !this.attack) {
            const a = this.combat.start(this.host.save, this.sim);
            if (a) {
                this.attack = { ...a, start: this.sim, x: this.player.x, direction: this.direction };
                this.host.sound('attack');
                if (a.weapon === 'W02')
                    this.boom = this.add.image(this.player.x, this.player.y, 'shell').setScale(0.32).setDepth(12).setTint(0xb3eed6);
            }
        }
        this.updateAttack();
        this.updateEnemies(dt);
        this.updateProjectiles(dt);
        this.updateLightning();
        for (const h of this.hearts) {
            if (!h.sprite.active)
                continue;
            if (h.id === 'S03.heart.crisis' && !this.done('S03.crisis'))
                continue;
            const radius = this.host.save.relics.includes('R01') ? 96 : 48;
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, h.sprite.x, h.sprite.y) < radius) {
                this.host.heart(h.id, h.large);
                h.sprite.destroy();
            }
        }
        for (const obj of this.objects) {
            const done = this.done(obj.def.id);
            obj.sprite.setAlpha(done ? 0.45 : 1);
            obj.label.setText(`${done ? '✓ ' : ''}${obj.def.label}`);
            if (obj.def.kind === 'checkpoint' && Math.abs(obj.def.x - this.player.x) < 65 && body.blocked.down) {
                const cp = this.mapDef.checkpoints.find(c => obj.def.id.endsWith(c.id));
                if (cp && this.host.save.checkpoint.checkpointId !== cp.id) {
                    this.checkpoint(cp.id);
                    this.host.notice('쉼터에 저장했어요. 이어할 때 체력이 회복돼요.');
                }
            }
        }
        const nearby = this.objects.filter(o => o.def.kind !== 'checkpoint' && Math.abs(o.def.x - this.player.x) < 90 && Math.abs(o.def.y - this.player.y) < 95).sort((a, b) => Math.abs(a.def.x - this.player.x) - Math.abs(b.def.x - this.player.x))[0];
        const hint = nearby ? `${nearby.def.kind === 'shell' || nearby.def.kind === 'remote' ? 'J 공격' : 'E 조사'} · ${nearby.def.label}` : 'A D 이동  ·  Space 점프  ·  J 공격  ·  L 회피';
        if (hint !== this.latestHint) {
            this.hint.setText(hint);
            this.latestHint = hint;
        }
        if (input.consume('interact') && nearby)
            this.interact(nearby.def);
        if (this.player.y > 820) {
            this.hurt(10);
            if (this.host.hp > 0) {
                body.reset(this.safe.x, this.safe.y);
                this.player.setVelocity(0, 0);
                this.groundedAt = -Infinity;
                this.jumpAt = -Infinity;
                this.invulnerableUntil = this.sim + 1500;
            }
        }
        this.player.x = Phaser.Math.Clamp(this.player.x, 30, this.mapDef.width - 30);
    }
    private checkpoint(id: string) { this.host.save.checkpoint = { stageId: this.mapDef.id, checkpointId: id }; this.host.persist(); this.host.changed(); }
    private hurt(base: number, element: 'normal' | 'lightning' = 'normal') { if (this.sim < this.invulnerableUntil)
        return; const died = this.host.damage(base, element); this.invulnerableUntil = this.sim + (this.host.save.settings.difficulty === 'relaxed' ? 1500 : 1000); this.host.sound('hurt'); if (died) {
        this.host.hp = maxHp(this.host.save);
        this.host.mp = maxMp(this.host.save);
        this.host.notice('잠깐 쉬고 다시 출발! 보물과 경험치는 그대로예요.');
        this.scene.restart();
    } }
    private updateAttack() {
        this.slash.clear();
        if (!this.attack)
            return;
        const a = this.attack;
        const age = this.sim - a.start;
        if (a.weapon === 'W02' && this.boom) {
            const phase = age < 600 ? 'out' : 'return';
            const t = Math.min(age / 1200, 1);
            const x = t < 0.5 ? a.x + a.direction * 380 * t * 2 : Phaser.Math.Linear(a.x + a.direction * 380, this.player.x, (t - 0.5) * 2);
            this.boom.setPosition(x, this.player.y - 4).setRotation(age / 85);
            this.hitAt(x, this.player.y, 38, 70, a, phase);
            if (age >= 1200) {
                this.boom.destroy();
                this.boom = null;
                this.attack = null;
            }
            return;
        }
        if (age >= 80 && age < 200) {
            const x = this.player.x + a.direction * 65;
            this.slash.lineStyle(8, 0xffe4a0, 0.85);
            this.slash.beginPath();
            this.slash.arc(this.player.x, this.player.y, 100, a.direction > 0 ? -0.9 : Math.PI - 0.9, a.direction > 0 ? 0.9 : Math.PI + 0.9);
            this.slash.strokePath();
            this.hitAt(x, this.player.y, 80, 90, a, 'melee');
        }
        if (age > 280)
            this.attack = null;
    }
    private hitAt(x: number, y: number, width: number, height: number, a: NonNullable<Stage['attack']>, phase: string) {
        for (const e of this.enemies) {
            if (e.state === 'defeated' || Math.abs(e.sprite.x - x) > width || Math.abs(e.sprite.y - y) > height)
                continue;
            if (e.def.kind === 'siren' && ![1, 2, 3].every(n => this.done(`S02.shell.${n}`)))
                continue;
            if (!this.combat.hit(a.id, e.def.id, phase))
                continue;
            e.hp = Math.max(0, e.hp - a.damage);
            e.sprite.setTint(0xffefb0);
            if (e.hp === 0) {
                e.state = 'defeated';
                e.label.setText(e.def.kind === 'siren' ? '저주가 풀렸어!' : '빛으로 돌아갔어요');
                e.sprite.setAlpha(0.25);
                this.host.reward({ id: e.def.id, xp: e.def.kind === 'captain' ? 30 : e.def.kind === 'siren' ? 50 : 6, coins: 3, objectives: ['captain', 'siren'].includes(e.def.kind) ? [e.def.id] : [], checkpoint: ['captain', 'siren'].includes(e.def.kind) ? { stageId: this.mapDef.id, checkpointId: 'boss' } : undefined });
                if (e.def.kind === 'captain' || e.def.kind === 'siren') {
                    if (e.def.kind === 'siren') {
                        this.projectiles.forEach(p => { p.sprite.destroy(); p.glyph.destroy(); });
                        this.projectiles = [];
                        this.host.dialogue('freed', () => { });
                    }
                }
            }
            else if (e.def.kind !== 'siren' && e.def.kind !== 'captain')
                e.sprite.x += a.direction * 14;
            this.host.changed();
        }
        for (const o of this.objects) {
            if (!['shell', 'remote'].includes(o.def.kind) || this.done(o.def.id) || Math.abs(o.def.x - x) > width || Math.abs(o.def.y - y) > height)
                continue;
            if (o.def.kind === 'remote' && a.weapon !== 'W02')
                continue;
            this.activate(o.def);
        }
    }
    private updateEnemies(dt: number) {
        let boss = '';
        for (const e of this.enemies) {
            if (e.state === 'defeated')
                continue;
            const distance = Math.abs(this.player.x - e.sprite.x);
            if (distance > 850)
                continue;
            const isBoss = e.def.kind === 'captain' || e.def.kind === 'siren';
            if (isBoss)
                boss = `${e.def.kind === 'siren' ? '세이렌 · 저주' : '해골 대장'}  ${e.hp} / ${e.maxHp}  ${e.state === 'telegraph' ? '⚠ 공격 예고' : e.state === 'recover' ? '지금이 기회!' : ''}`;
            if (e.def.kind === 'siren' && ![1, 2, 3].every(n => this.done(`S02.shell.${n}`))) {
                e.label.setText('조개 종 3개로 방벽 해제');
                continue;
            }
            if (e.state === 'idle') {
                e.sprite.clearTint();
                if (distance < (e.def.kind === 'archer' || e.def.kind === 'siren' ? 580 : 170)) {
                    e.state = 'telegraph';
                    e.until = this.sim + (e.def.kind === 'captain' ? 1500 : 1200) * (this.host.save.settings.difficulty === 'relaxed' ? 1.3 : 1);
                    e.target = this.player.x;
                }
                else if (distance < 500 && e.def.kind !== 'siren' && e.def.kind !== 'archer') {
                    e.sprite.x += Math.sign(this.player.x - e.sprite.x) * Math.min(dt * 0.045, Math.abs(e.def.x - e.sprite.x) < 90 ? dt * 0.045 : 0);
                }
            }
            else if (e.state === 'telegraph') {
                e.sprite.setTint(0xffc773);
                e.label.setText('⚠ 준비… 피하세요!');
                if (this.sim >= e.until) {
                    e.state = 'attack';
                    e.until = this.sim + 250;
                    if (e.def.kind === 'siren') {
                        if (e.pattern++ % 2 === 0)
                            this.projectile(e.sprite.x, e.sprite.y + 35, Math.sign(e.target - e.sprite.x) * 230, 0, true);
                        else
                            for (const vy of [-140, -55, 35])
                                this.projectile(e.sprite.x, e.sprite.y, Math.sign(e.target - e.sprite.x) * 190, vy, false);
                    }
                    else if (e.def.kind === 'archer')
                        this.projectile(e.sprite.x, e.sprite.y, Math.sign(e.target - e.sprite.x) * 250, 0, false);
                }
            }
            else if (e.state === 'attack') {
                e.label.setText('✦');
                if (!['archer', 'siren'].includes(e.def.kind) && Math.abs(this.player.x - e.sprite.x) < 112 && Math.abs(this.player.y - e.sprite.y) < 95)
                    this.hurt(this.mapDef.id === 'S01' && !this.host.save.claimedRewardIds.includes('S01.heart.01') ? 10 : 14);
                if (this.sim >= e.until) {
                    e.state = 'recover';
                    e.until = this.sim + (isBoss ? 1800 : 1100);
                }
            }
            else if (e.state === 'recover') {
                e.label.setText('빈틈 · J 공격');
                if (this.sim >= e.until)
                    e.state = 'idle';
            }
            if (e.state === 'idle')
                e.label.setText(`${e.hp} / ${e.maxHp}`);
            e.label.setPosition(e.sprite.x, e.sprite.y - 88);
            e.sprite.setFlipX(this.player.x < e.sprite.x);
        }
        this.bossText.setText(boss).setVisible(!!boss);
    }
    private projectile(x: number, y: number, vx: number, vy: number, wave: boolean) {
        const sprite = this.add.circle(x, y, wave ? 18 : 11, wave ? 0x85ece0 : 0xe7b9f3).setStrokeStyle(3, 0x244f64).setDepth(8);
        const glyph = this.add.text(x, y, wave ? '≋' : '♪', {fontSize:'23px',color:'#183948',fontFamily:'sans-serif'}).setOrigin(0.5).setDepth(9);
        this.projectiles.push({ sprite, glyph, vx, vy, until: this.sim + 4000, wave });
    }
    private updateProjectiles(dt: number) { for (const p of this.projectiles) {
        p.sprite.x += p.vx * dt / 1000;
    p.sprite.y += p.vy * dt / 1000;
    p.glyph.setPosition(p.sprite.x, p.sprite.y);
        if (Math.abs(p.sprite.x - this.player.x) < 34 && Math.abs(p.sprite.y - this.player.y) < (p.wave ? 42 : 48)) {
            this.hurt(14);
            p.until = 0;
        }
    if (this.sim >= p.until) {
        p.sprite.destroy();
        p.glyph.destroy();
    }
    } this.projectiles = this.projectiles.filter(p => p.sprite.active); }
    private updateLightning() {
        this.warnings.clear();
        for (const enemy of this.enemies) {
            if (enemy.state === 'telegraph' && !['siren', 'archer'].includes(enemy.def.kind)) {
                this.warnings.lineStyle(3, 0xffd28d).strokeRect(enemy.sprite.x - 112, enemy.sprite.y - 60, 224, 110);
            }
        }
        if (this.mapDef.theme !== 'storm')
            return;
        if (!this.lightning && this.sim >= this.lightningAt) {
            this.lightning = { x: this.player.x, at: this.sim + 1400 };
            this.host.sound('warning');
        }
        if (this.lightning) {
            const l = this.lightning;
            this.warnings.lineStyle(4, 0xffd28d).strokeRect(l.x - 72, 270, 144, 338);
            this.warnings.fillStyle(0xfad18a, 0.14).fillRect(l.x - 72, 270, 144, 338);
            this.warnings.lineStyle(7, 0xffdb89).lineBetween(l.x + 12, 350, l.x - 12, 390).lineBetween(l.x - 12, 390, l.x + 15, 390).lineBetween(l.x + 15, 390, l.x - 12, 435);
            if (this.sim >= l.at) {
                if (Math.abs(this.player.x - l.x) < 72)
                    this.hurt(20, 'lightning');
                this.lightning = null;
                this.lightningAt = this.sim + 2400;
            }
        }
    }
    private activate(def: ObjectDef) { if (this.done(def.id))
        return; this.host.reward({ id: `${def.id}.reward`, coins: def.reward === 'coins' ? 25 : 0, weapons: def.reward === 'W02' ? ['W02'] : [], relics: def.reward?.startsWith('R') ? [def.reward] : [], objectives: [def.id] }); this.host.sound('reward'); this.host.notice(def.reward === 'W02' ? '바람 부메랑 획득! Q로 바꿔 J로 던져 보세요.' : def.reward === 'R01' ? '항해자의 메달! 하트를 96px 거리에서 주워요.' : def.reward === 'R02' ? '폭풍 수정! 번개 피해가 25% 줄어요.' : `${def.label} · 완료`); }
    private interact(def: ObjectDef) {
        if (def.needs?.some(id => !this.done(id))) {
            this.host.notice('아직 할 일이 있어요. ' + this.mapDef.objective);
            return;
        }
        if (def.kind === 'npc') {
            this.host.dialogue(def.dialogue ?? 'captain', () => this.host.objective(def.id));
            return;
        }
        if (def.kind === 'shell' || def.kind === 'remote') {
            this.host.notice('J로 이 조개를 쳐 보세요.');
            return;
        }
        if (def.kind === 'exit') {
            this.host.clearStage();
            return;
        }
        if (def.kind === 'crisis') {
            if (this.done(def.id)) {
                this.host.notice('오른쪽 구명 밧줄로 가자!');
                return;
            }
            this.activate(def);
            this.checkpoint('crisis');
            this.host.dialogue('crisis', () => { this.invulnerableUntil = this.sim + 3000; });
            return;
        }
        this.activate(def);
    }
}
