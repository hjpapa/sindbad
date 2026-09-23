import Phaser from 'phaser';
import { maps, type MapDef, type ObjectDef, type Spawn } from '../content/maps';
import { assets } from '../content/assets.manifest';
import { type WeaponId } from '../content/items';
import { Combat } from '../core/combat';
import { maxHp, maxMp, type Reward, type Save } from '../core/state';
import type { Input } from './input';
import { canBreatheUnderwater, movingPlatformX, movingPlatformY, objectiveReward, rescueEquipment, shieldBlocks } from '../core/adventure';
import {canCastFlame,flameCost,flameCooldown,flameDamage,ignite} from '../core/flame';
import {connectedMirrors,crystalSafeStart,mirrorSolution,mirrorSymbols,rotateMirror} from '../core/crystal';
import type { Platform } from '../content/maps';
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
    burn?: {until:number;next:number};
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
    private extraJump=false;
    private bridgeUntil=0;
    private mirrorDirections:number[]=[0,0,0];
    private crystalArt!:Phaser.GameObjects.Graphics;
    private flameReady=0;
    private flameUsed=-Infinity;
    private pulse:{x:number;y:number;direction:number;damage:number;until:number;hits:Set<string>}|null=null;
    private flameArt!:Phaser.GameObjects.Graphics;
    private wave:{def:ObjectDef;at:number}|null=null;
    private grip:{id:string;until:number}|null=null;
    private sinkAt:number|null=null;
    private waveArt!:Phaser.GameObjects.Graphics;
    private moving: {def:Platform;rect:Phaser.GameObjects.Rectangle;top:Phaser.GameObjects.Rectangle;body:Phaser.Physics.Arcade.Body}[]=[];
    private doors: {id:string;rect:Phaser.GameObjects.Rectangle}[]=[];
    private wakeAt:number|null=null;
    private air=10000;
    private waterTick=0;
    private submerged=false;
    private bubble!:Phaser.GameObjects.Graphics;
    private journey!:Phaser.GameObjects.Text;
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
        this.mirrorDirections=this.done('S08.light')?[...mirrorSolution]:[0,0,0];
        this.moving=[];this.doors=[];this.wakeAt=null;this.air=10000;this.waterTick=0;
        this.flameReady=0;this.flameUsed=-Infinity;this.pulse=null;this.wave=null;this.grip=null;this.sinkAt=null;
        this.sim = 0; this.extraJump=false; this.bridgeUntil=0;
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
            if(this.mapDef.id==='S07'&&p.motion&&!p.requiredGround)this.add.text(p.x+p.w/2,p.y-35,'유목 · 점프',{fontSize:'18px',color:'#fbe2ad'}).setOrigin(.5);
            const top=this.add.rectangle(p.x + p.w / 2, p.y + 4, p.w, 8, this.mapDef.theme === 'reef' ? 0x9fc7a8 : 0xd2aa70);
            if(p.motion){this.physics.add.existing(rect);const body=rect.body as Phaser.Physics.Arcade.Body;body.setAllowGravity(false).setImmovable(true);this.moving.push({def:p,rect,top,body});}else this.land.add(rect);
        }
        const cp = this.mapDef.checkpoints.find(c => c.id === this.host.save.checkpoint.checkpointId) ?? this.mapDef.checkpoints[0];
        this.safe = { x: cp.x, y: cp.y };
        this.player = this.physics.add.sprite(cp.x, cp.y, 'player').setDepth(10);
        this.player.body?.setSize(42, 84);
        this.player.body?.setOffset(27, 42);
        this.player.setMaxVelocity(300, 1000).setDragX(2600);
        if(this.mapDef.mode==='flight'||this.mapDef.mode==='swim'){(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);this.player.setDragY(1800).setMaxVelocity(330,330);}
        this.physics.add.collider(this.player, this.land);
        for(const platform of this.moving)this.physics.add.collider(this.player,platform.rect);
        for(const o of this.mapDef.objects.filter(o=>['gate','lightGate','vision'].includes(o.kind))){const rect=this.add.rectangle(o.x+48,440,28,336,0xc892aa,.65);this.land.add(rect);this.doors.push({id:o.id,rect});if(this.done(o.id)){(rect.body as Phaser.Physics.Arcade.StaticBody).enable=false;rect.setVisible(false);}}
        this.physics.world.setBounds(0, -200, this.mapDef.width, 1400);
        this.cameras.main.setBounds(0, 0, this.mapDef.width, 720);
        this.cameras.main.startFollow(this.player, true, this.host.save.settings.reducedMotion ? 1 : 0.12, this.host.save.settings.reducedMotion ? 1 : 0.12, 0, 0);
        for (const def of this.mapDef.spawns) {
            const boss = def.kind === 'captain' || def.kind === 'siren' || def.kind === 'boss';
            if ((boss || this.mapDef.id==='S06') && this.done(def.id))
                continue;
            const texture = def.kind === 'captain' || def.kind === 'archer' ? 'skeleton' : def.kind;
            const sprite = this.add.image(def.x, def.y, texture).setDepth(5);
            if(this.mapDef.id==='S06')sprite.setTint(0xffaa65);
            if (def.kind === 'captain')
                sprite.setTint(0xffd98e).setScale(1.15);
            const hp = Math.round(def.hp * (this.host.save.settings.difficulty === 'relaxed' ? 0.85 : 1));
            const label = this.add.text(def.x, def.y - 87, '', { fontSize: '19px', fontFamily: 'sans-serif', color: '#fff5cf', backgroundColor: '#173746' }).setOrigin(0.5).setDepth(6);
            this.enemies.push({ def, sprite, label, hp, maxHp: hp, state: 'idle', until: 0, target: def.x, pattern: 0 });
        }
        for (const def of this.mapDef.objects) {
            const texture = def.kind==='truthGift'?'genie':def.kind==='mirror'?'mirror':def.kind==='vision'?'starMap':def.kind==='journal'?'journal':def.kind==='flameGift'?'rah':['torch','furnace','vine','rope','quest','gift','bridge','ending'].includes(def.kind)?def.kind:['gear','key','gate','golden'].includes(def.kind)?def.kind:def.kind==='rescue'?'naira':def.kind === 'chest' ? 'chest' : def.kind === 'npc' ? (this.mapDef.id==='S08'?'genie':this.mapDef.id==='S06'?'rah':this.mapDef.id === 'S05'||this.mapDef.id==='S07'?'naira':this.mapDef.id === 'S02' ? 'siren' : 'player') : def.kind === 'shell' || def.kind === 'remote' ? 'shell' : def.kind === 'rod' || def.kind === 'crisis' ? 'rod' : 'bell';
            const sprite = this.add.image(def.x, def.y, texture).setScale(def.kind === 'checkpoint' ? 0.42 : 0.68).setDepth(4);
            if (def.kind === 'npc')
                sprite.setTint(0xe1d498);
            const label = this.add.text(def.x, def.y - 64, def.label, { wordWrap:['S06','S07','S08'].includes(this.mapDef.id)?{width:210,useAdvancedWrap:true}:undefined, fontSize: ['S06','S07','S08'].includes(this.mapDef.id)?'18px':'20px', color: '#fff2cc', backgroundColor: '#173b46', padding: { x: 7, y: 4 } }).setOrigin(0.5).setDepth(7);
            this.objects.push({ def, sprite, label });
        }
        for (const h of this.mapDef.hearts)
            this.hearts.push({ id: h.id, large: !!h.large, sprite: this.add.image(h.x, h.y, 'heart').setScale(h.large ? 0.5 : 0.36).setDepth(5) });
        this.slash = this.add.graphics().setDepth(12);
        this.crystalArt=this.add.graphics().setDepth(6);
        this.flameArt=this.add.graphics().setDepth(12);
        this.waveArt=this.add.graphics().setDepth(8);
        this.bubble=this.add.graphics().setDepth(11);
        this.journey=this.add.text(640,186,'',{fontSize:'18px',color:'#fff1c8',backgroundColor:'#24475b',padding:{x:10,y:6}}).setOrigin(.5).setScrollFactor(0).setDepth(19);
        this.warnings = this.add.graphics().setDepth(3);
        this.bossText = this.add.text(640, 142, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#fce8bc', backgroundColor: '#173643', padding: { x: 12, y: 7 } }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        this.hint = this.add.text(640, 648, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#fff3d2', backgroundColor: '#153847', padding: { x: 14, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.host.input.clear(); this.projectiles = []; this.attack = null; });
        this.host.changed();
    }
    private background() {
        const theme = this.mapDef.theme;
        if(theme==='adventure'){
            const palettes:Record<string,[number,number,number]>={sky:[0x86b8cb,0xeedca4,0x416c82],volcano:[0x422f43,0xe28b55,0x6d4343],village:[0xb9d5bd,0xf2ce91,0x6d8d82],warehouse:[0x5f574f,0xd0a56f,0x3a4a4e],ocean:[0x39768b,0x8cd8cf,0x244e68],pirate:[0x273e55,0xd5a966,0x734f45],shadow:[0x292d46,0xb5a9d6,0x51516f],jungle:[0x315c50,0xc6c77a,0x658152],temple:[0x564b72,0xd8c38e,0x82735d],garden:[0x5a8b76,0xf1c8d2,0x8e7181],tower:[0x242f4c,0xe1d5a5,0x566080],kingdom:[0x78a6ad,0xf3d18f,0x7f6e76]};
            const [sky,glow,land]=palettes[this.mapDef.visual??'sky'];this.cameras.main.setBackgroundColor(sky);
            const g=this.add.graphics().setDepth(-10).setScrollFactor(.25);g.fillStyle(glow,.42).fillCircle(1010,160,85);
            for(let x=0;x<this.mapDef.width;x+=330){g.fillStyle(land,.82).fillTriangle(x,570,x+150,220+(x%4)*36,x+320,570);g.lineStyle(3,glow,.35).lineBetween(x+30,460,x+260,460);g.fillStyle(glow,.25).fillCircle(x+95,145+(x%5)*38,24);}
            if(this.mapDef.mode==='flight')for(let x=300;x<this.mapDef.width;x+=520)g.lineStyle(10,glow,.7).strokeCircle(x,350+(x%3)*75,65);
            if(this.mapDef.mode==='swim')g.fillStyle(0x75d6d0,.25).fillRect(0,100,this.mapDef.width,520);
            this.add.text(42,205,`${this.mapDef.id} · ${this.mapDef.objective}`,{fontSize:'21px',color:'#fff1ce',backgroundColor:'#263d51',padding:{x:10,y:7},wordWrap:{width:720}}).setScrollFactor(.3).setDepth(-5);
            return;
        }
        if(theme==='crystal'){
            this.cameras.main.setBackgroundColor('#303550');
            const g=this.add.graphics().setDepth(-10).setScrollFactor(.4);
            for(let x=0;x<this.mapDef.width;x+=230){g.fillStyle(0x56597e).fillTriangle(x,0,x+110,260,x+205,0);g.fillStyle(0x63849c,.65).fillTriangle(x,608,x+90,345,x+170,608);g.lineStyle(3,0xb9bfe1,.5).lineBetween(x+90,345,x+105,600);g.fillStyle(0xddd3ff,.75).fillCircle(x+140,240+(x%130),3);}
            this.add.text(crystalSafeStart,330,'✧ 안전한 퍼즐 구역\n벽화의 별자리: ① →   ② ←   ③ ↓\nE 회전 · 위쪽 거울 초기화 버튼\n미완성 배치는 재접속 시 초기화됩니다',{fontSize:'19px',color:'#e2dcff',backgroundColor:'#353952',padding:{x:12,y:9}});
            return;
        }
        if(theme==='flame'||theme==='waves'){
            this.cameras.main.setBackgroundColor(theme==='flame'?'#332e43':'#294f67');
            const g=this.add.graphics().setDepth(-10).setScrollFactor(.35);
            if(theme==='flame'){
                for(let x=0;x<this.mapDef.width;x+=280){g.fillStyle(0x534054).fillTriangle(x,0,x+80,250,x+210,0);g.fillStyle(0x77534e).fillEllipse(x+110,620,220,320);g.fillStyle(0xe79157,.2).fillCircle(x+130,410,100);g.lineStyle(4,0xf3ba79,.35).lineBetween(x+20,540,x+80,430);}
            }else{
                g.fillStyle(0x548fa3).fillRect(0,460,this.mapDef.width,260);
                for(let x=0;x<this.mapDef.width;x+=400){g.fillStyle(0x183b50).fillTriangle(x,720,x+90,160,x+250,720);g.lineStyle(4,0xbde4d7,.45).lineBetween(x,490,x+150,490);g.lineStyle(10,0x71939a).lineBetween(x+240,330,x+240,600);g.fillStyle(0x9ebdb7).fillTriangle(x+250,340,x+350,460,x+250,460);}
            }
            for(const w of this.mapDef.water??[])this.add.rectangle(w.x+w.w/2,w.y+w.h/2,w.w,w.h,0x8ce3df,.22).setDepth(9);
            return;
        }
        if(theme==='whale'||theme==='coral'){
            this.cameras.main.setBackgroundColor(theme==='whale'?'#a4c9bf':'#5a8793');
            const g=this.add.graphics().setDepth(-10).setScrollFactor(theme==='whale'?.9:.25);
            if(theme==='whale'){
                g.fillStyle(0x4e8698).fillRect(0,410,this.mapDef.width,500);
                g.fillStyle(0x587b83).fillEllipse(1800,740,3700,780);
                g.fillStyle(0x708c85).fillEllipse(1700,640,3000,530);
                g.fillStyle(0x183c53).fillCircle(3220,530,25);g.fillStyle(0xd1e1c4).fillCircle(3215,522,7);
                g.fillStyle(0x547e86).fillTriangle(20,600,100,250,340,620);
                g.lineStyle(9,0xd2eee3,.8).lineBetween(3060,310,3060,235).lineBetween(3060,235,3030,210).lineBetween(3060,235,3090,210);
                g.fillStyle(0xbac7a1).fillEllipse(880,448,260,125);
            }else{
                g.fillStyle(0x254b66).fillRect(0,0,this.mapDef.width,200);
                for(let x=0;x<this.mapDef.width;x+=230){g.fillStyle(0x456f7d).fillTriangle(x,160,x+90,325,x+190,160);g.lineStyle(12,0xb990a6,.65).lineBetween(x,620,x+30,400).lineBetween(x+22,480,x+82,430);g.fillStyle(0x97c0ad).fillCircle(x+130,590,44);}
            }
            for(const w of this.mapDef.water??[]){const water=this.add.graphics().setDepth(9);water.fillStyle(0x86d6d7,.18).fillRect(w.x,w.y,w.w,w.h);water.lineStyle(3,0xbcebe1,.8).lineBetween(w.x,w.y,w.x+w.w,w.y);this.add.text(w.x+12,w.y-32,'공기방울로 숨 쉬는 길',{fontSize:'18px',color:'#e2fff0'});}
            return;
        }
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
    snapshot() { return { stage: this.mapDef?.id, player: this.player ? { x: this.player.x, y: this.player.y, grounded: ((this.player.body as Phaser.Physics.Arcade.Body)?.blocked.down||(this.player.body as Phaser.Physics.Arcade.Body)?.touching.down), vx: this.player.body?.velocity.x, vy: this.player.body?.velocity.y, hp: this.host.hp, maxHp: maxHp(this.host.save), bodyWidth: this.player.body?.width, bodyHeight: this.player.body?.height } : null, save: structuredClone(this.host.save), sim: this.sim, paused: this.stopped, enemies: this.enemies.map(e => ({ id: e.def.id, x: e.sprite.x, y: e.sprite.y, hp: e.hp, state: e.state, burn:e.burn })), projectiles: this.projectiles.length, boomerang: !!this.boom, attack: this.attack?.id ?? null, air: this.air, submerged:this.submerged, bubbleProtected: canBreatheUnderwater(this.host.save), movingPlatforms: this.moving.map(p=>({x:p.rect.x,y:p.rect.y-p.def.h/2,w:p.def.w})), mp:this.host.mp, flameReady:this.flameReady, pulse:!!this.pulse, wave:this.wave?{id:this.wave.def.id,at:this.wave.at}:null, grip:this.grip?.id??null, mirrors:[...this.mirrorDirections], connectedMirrors:connectedMirrors(this.mirrorDirections), puzzleSafe:this.mapDef?.id==='S08'&&!!this.player&&this.player.x>=crystalSafeStart, frameMs: this.lastFrame }; }
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
        this.updateAdventure(dt);
        if ((body.blocked.down||body.touching.down)) {
            this.groundedAt = this.sim;
            this.extraJump=false;
            const nearDanger = this.lightning && Math.abs(this.lightning.x - this.player.x) < 140;
            const solid = this.mapDef.platforms.find(p => !p.motion && this.player.x > p.x + 35 && this.player.x < p.x + p.w - 35 && Math.abs(body.bottom - p.y) < 8);
            if (solid && !nearDanger)
                this.safe = { x: this.player.x, y: this.player.y - 2 };
        }
        const freeMove=this.mapDef.mode==='flight'||this.mapDef.mode==='swim';
        if(input.held('jump')&&freeMove)this.player.setVelocityY(-245);
        else if(input.held('down')&&freeMove)this.player.setVelocityY(245);
        if (input.consume('jump')) {
            this.jumpAt = this.sim;
            if(!freeMove&&this.sim-this.groundedAt>120&&this.host.save.treasures.includes('T03')&&!this.extraJump){
                this.player.setVelocityY(-570);this.extraJump=true;this.jumpAt=-Infinity;this.host.sound('jump');
            }
        }
        if (!freeMove&&this.sim - this.jumpAt <= 150 && this.sim - this.groundedAt <= 120) {
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
        else if(freeMove)
            this.player.setMaxVelocity(330,330).setAccelerationX(move*1700);
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
                if (['W02','W04','W05'].includes(a.weapon))
                    this.boom = this.add.image(this.player.x, this.player.y, 'shell').setScale(a.weapon==='W02'?0.32:0.22).setDepth(12).setTint(a.weapon==='W05'?0x82dcff:a.weapon==='W04'?0xffd66e:0xb3eed6);
            }
        }
        this.updateAttack();
        this.updateFlame(dt);
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
            if (obj.def.kind === 'checkpoint' && !(obj.def.needs??[]).some(id=>!this.done(id)) && Math.abs(obj.def.x - this.player.x) < 65 && body.blocked.down) {
                const cp = this.mapDef.checkpoints.find(c => obj.def.id.endsWith(c.id));
                if (cp && this.host.save.checkpoint.checkpointId !== cp.id) {
                    this.checkpoint(cp.id);
                    this.host.notice('쉼터에 저장했어요. 이어할 때 체력이 회복돼요.');
                }
            }
        }
        this.updateCrystal();
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
                if(this.mapDef.id==='S07'){
                    const deck=this.moving.filter(p=>p.def.requiredGround).sort((a,b)=>Math.abs(a.rect.x-this.player.x)-Math.abs(b.rect.x-this.player.x))[0];
                    body.reset(deck.rect.x,deck.rect.y-deck.def.h/2-60);
                }else body.reset(this.safe.x, this.safe.y);
                this.player.setVelocity(0, 0);
                this.groundedAt = -Infinity;
                this.jumpAt = -Infinity;
                this.invulnerableUntil = this.sim + 1500;
            }
        }
        this.player.x = Phaser.Math.Clamp(this.player.x, 30, this.mapDef.width - 30);
    }
    resetMirrors(){
        if(this.mapDef.id!=='S08'||this.stopped)return;
        if(this.done('S08.light')){this.host.notice('완성한 빛 연결과 보물은 그대로 유지돼요.');return;}
        this.mirrorDirections=[0,0,0];this.host.notice('거울을 모두 ↑ 방향으로 초기화했어요.');
    }
    private updateCrystal(){
        if(this.mapDef.id!=='S08')return;
        this.crystalArt.clear();
        const linked=connectedMirrors(this.mirrorDirections);
        this.journey.setText(this.done('S08.light')?'별빛 연결 완료 · 지니와 대화하고 구슬로 환영을 살펴보세요':`별빛 연결 ${linked}/3 · 벽화의 화살표를 따라 E 회전`);
        const mirrors=this.objects.filter(o=>o.def.kind==='mirror');
        let from=1470;
        for(const [i,o] of mirrors.entries()){
            o.label.setText(`${i+1} ${mirrorSymbols[this.mirrorDirections[i]]} · E`);
            this.crystalArt.lineStyle(5,i<=linked?0xfbe9ae:0x70768f,i<=linked?.9:.35).lineBetween(from,430,o.def.x,430);
            this.crystalArt.lineStyle(3,0xc4b8ef).lineBetween(o.def.x,430,o.def.x,510);
            o.sprite.setRotation(this.mirrorDirections[i]*Math.PI/2);from=o.def.x;
        }
        if(linked===3)this.crystalArt.lineStyle(6,0xfbe9ae).lineBetween(from,430,2508,430);
        for(const o of this.objects.filter(o=>o.def.kind==='checkpoint'))o.label.setText('쉼터');
        for(const o of this.objects.filter(o=>o.def.kind==='journal'||o.def.kind==='vision')){
            const title=o.def.kind==='journal'?'일지 · E':o.def.label;
            const visible=this.host.save.treasures.includes('T02');const near=Math.abs(o.def.x-this.player.x)<300;
            o.label.setText(this.done(o.def.id)?`✓ ${title}`:visible&&near?`✧ ${title}`:'흐릿한 수정 벽');
            o.sprite.setAlpha(this.done(o.def.id)?.45:visible&&near?1:.12);
            if(visible&&near&&!this.done(o.def.id)){const size=10+3*Math.sin(this.sim/250);this.crystalArt.lineStyle(3,0xe2d4ff).strokeCircle(o.def.x,o.def.y-15,size);}
        }
    }
    private updateAdventure(dt:number) {
        if(this.mapDef.id==='S07'){
            if(this.done('S07.wave.3')&&this.sinkAt===null)this.sinkAt=this.sim;
            for(const p of this.moving){p.body.setVelocity((movingPlatformX(p.def,this.sim)+p.def.w/2-p.rect.x)/Math.max(dt,1)*1000,(movingPlatformY(p.def,this.sim)+(p.def.x>=2600&&p.def.x<3300&&this.sinkAt!==null?Math.min(32,(this.sim-this.sinkAt)/3000*32):0)+p.def.h/2-p.rect.y)/Math.max(dt,1)*1000);p.top.setPosition(p.rect.x,p.rect.y-p.def.h/2+4);}
            this.updateWaves();
        }
        if(this.mapDef.id==='S06')this.journey.setText(this.host.save.treasures.includes('T01')?'영원의 불씨 · R 파동 / E 무료 점화 · 입구 덩굴을 다시 살펴보세요':`화로 ${[1,2,3].filter(n=>this.done('S06.furnace.'+n)).length}/3 · 진정한 정령 ${[1,2,3,4,5].filter(n=>this.done('S06.enemy.spirit.'+n)).length}/5`);
        if(this.mapDef.id==='S04'){
            const count=rescueEquipment.filter(id=>this.done(id)).length;
            if(count===3 && this.wakeAt===null){this.wakeAt=this.sim+2400;this.host.notice('⚠ 고래가 깨어나요! 잠시 뒤 발판이 천천히 오르내려요. 시간 제한은 없어요.');}
            this.journey.setText(`구명 장비 ${count} / 3${this.wakeAt===null?' · 고래를 공격하지 마세요':this.sim<this.wakeAt?' · ⚠ 발판이 곧 움직여요':' · 움직이는 등을 지나 구조 보트로'}`);
            for(const p of this.moving){const desired=movingPlatformY(p.def,this.wakeAt===null?0:this.sim-this.wakeAt);p.body.setVelocityY((desired+p.def.h/2-p.rect.y)/Math.max(dt,1)*1000);p.top.setPosition(p.rect.x,p.rect.y-p.def.h/2+4);}
        }
        for(const d of this.doors)if(this.done(d.id)){(d.rect.body as Phaser.Physics.Arcade.StaticBody).enable=false;d.rect.setVisible(false);}
        this.bubble.clear();
        const wet=(this.mapDef.water??[]).some(w=>this.player.x>w.x&&this.player.x<w.x+w.w&&this.player.y>w.y+18&&this.player.y<w.y+w.h);
        this.submerged=wet;
        if(wet){
            if(canBreatheUnderwater(this.host.save)){this.air=10000;this.bubble.lineStyle(3,0xbceff0,.8).strokeEllipse(this.player.x,this.player.y,104,142);}
            else{this.air=Math.max(0,this.air-dt);if(this.air===0&&this.sim>=this.waterTick){this.waterTick=this.sim+1600;this.hurt(12);}}
        }else this.air=10000;
        if(this.mapDef.id==='S05')this.journey.setText(wet?(canBreatheUnderwater(this.host.save)?'○ 공기방울 보호 · 숨 쉬기 가능 / 자유 수영 아님':`숨 ${Math.ceil(this.air/1000)}초 · 물 밖으로 나가세요`):this.done('S05.rescue')?'나이라 구출 완료 · 선택 산호방과 바닷길이 열렸어요':'열쇠 → 왕관 장식 → 산호문 → 나이라');
    }
    private checkpoint(id: string) { this.host.save.checkpoint = { stageId: this.mapDef.id, checkpointId: id }; this.host.persist(); this.host.changed(); }
    private hurt(base: number, element: 'normal' | 'lightning' = 'normal') { if ((this.mapDef.id==='S08'&&this.player.x>=crystalSafeStart)||this.sim < this.invulnerableUntil)
        return; const died = this.host.damage(base, element); this.invulnerableUntil = this.sim + (this.host.save.settings.difficulty === 'relaxed' ? 1500 : 1000); this.host.sound('hurt'); if (died) {
        this.host.hp = maxHp(this.host.save);
        this.host.mp = maxMp(this.host.save);
        this.host.notice('잠깐 쉬고 다시 출발! 보물과 경험치는 그대로예요.');
        this.scene.restart();
    } }
    private updateWaves(){
        const ropes=this.mapDef.objects.filter(o=>o.kind==='rope');
        this.waveArt.clear();
        if(!this.wave){const def=ropes.find(o=>!this.done(o.id)&&!(o.needs??[]).some(id=>!this.done(id))&&Math.abs(this.player.x-o.x)<170);if(def){this.wave={def,at:this.sim+2200};this.host.sound('warning');this.host.notice('⚠ 큰 파도! 밧줄 가까이에서 E로 붙잡거나 파도가 닿을 때 점프하세요.');}}
        if(this.wave){const w=this.wave;const left=Math.max(0,w.at-this.sim);this.waveArt.lineStyle(7,0xa4eee7,.9).strokeEllipse(w.def.x,640,480,150);this.waveArt.fillStyle(0x81e3e3,.18).fillRect(w.def.x-260,470,520,140);this.journey.setText(`⚠ 파도 ${Math.ceil(left/1000)}초 · ${this.grip?.id===w.def.id?'밧줄을 잡았어요 · 가만히 기다리세요':'밧줄 E / 점프'}`);
            if(this.sim>=w.at){const close=Math.abs(this.player.x-w.def.x)<210;const held=this.grip?.id===w.def.id&&this.grip.until>=this.sim&&Math.abs(this.player.x-w.def.x)<90;const jumped=close&&this.player.y<445;if(held||jumped){this.activate(w.def);}else{this.hurt(10);if(this.host.hp>0)(this.player.body as Phaser.Physics.Arcade.Body).reset(this.safe.x,this.safe.y);this.host.notice('파도에 밀렸어요. 보물은 그대로! 다음 예고에 밧줄 E를 눌러 보세요.');}this.wave=null;this.grip=null;}
        }else this.journey.setText(`파도 ${ropes.filter(o=>this.done(o.id)).length}/3 · ${canBreatheUnderwater(this.host.save)?'공기방울 보호':'나이라의 보호가 필요해요'} · 오른쪽 닻으로`);
    }
    private updateFlame(dt:number){
        if(this.host.input.consume('skill')){
            const skill=this.host.save.equippedSkill;
            if(skill==='moonBridge'&&this.host.save.treasures.includes('T05')&&this.host.mp>=12&&this.sim>=this.flameReady){this.host.mp-=12;this.flameReady=this.sim+3000;this.bridgeUntil=this.sim+12000;this.flameUsed=this.sim;this.host.notice('달빛 다리가 12초 동안 이어져요.');this.host.changed();}
            else if(skill==='lotusShield'&&this.host.save.treasures.includes('T06')&&this.host.mp>=15&&this.sim>=this.flameReady){this.host.mp-=15;this.flameReady=this.sim+5000;this.invulnerableUntil=Math.max(this.invulnerableUntil,this.sim+2200);this.flameUsed=this.sim;this.host.notice('연꽃 방패가 2.2초 동안 피해를 막아요.');this.host.changed();}
            else if(skill==='dawnWave'&&this.host.save.treasures.includes('T07')&&this.host.mp>=20&&this.sim>=this.flameReady){this.host.mp-=20;this.flameReady=this.sim+4500;this.flameUsed=this.sim;this.pulse={x:this.player.x,y:this.player.y,direction:this.direction,damage:Math.round(flameDamage(this.host.save)*1.45),until:this.sim+900,hits:new Set()};this.host.sound('attack');this.host.changed();}
            else if(canCastFlame(this.host.save,this.host.mp,this.sim,this.flameReady)){
                this.host.mp-=flameCost;this.flameReady=this.sim+flameCooldown;this.flameUsed=this.sim;
                this.pulse={x:this.player.x,y:this.player.y,direction:this.direction,damage:flameDamage(this.host.save),until:this.sim+750,hits:new Set()};this.host.sound('attack');this.host.changed();
            }else this.host.notice(!skill?'가방에서 핵심 보물 능력을 선택하세요.':this.host.mp<15?'마력이 회복될 때까지 기다려 주세요.':'보물 능력이 준비 중이에요.');
        }
        if(this.sim-this.flameUsed>2000&&this.host.mp<maxMp(this.host.save)){this.host.mp=Math.min(maxMp(this.host.save),this.host.mp+dt*.005);this.host.changed();}
        this.flameArt.clear();
        const p=this.pulse;
        if(p){p.x+=p.direction*520*dt/1000;this.flameArt.fillStyle(0xf49b53,.7).fillEllipse(p.x,p.y,100,100);this.flameArt.lineStyle(4,0xffe2a3).strokeCircle(p.x,p.y,35);
            for(const e of this.enemies)if(e.state!=='defeated'&&!p.hits.has(e.def.id)&&Math.abs(e.sprite.x-p.x)<70&&Math.abs(e.sprite.y-p.y)<85){p.hits.add(e.def.id);this.damageEnemy(e,p.damage);}
            if(this.sim>=p.until)this.pulse=null;
        }
        for(const e of this.enemies)if(e.state!=='defeated'&&e.burn){while(e.burn.next<=this.sim&&e.burn.next<=e.burn.until&&e.hp>0){e.burn.next+=1000;this.damageEnemy(e,2);}if(this.sim>=e.burn.until)e.burn=undefined;}
    }
    private damageEnemy(e:Enemy,damage:number){
        if(e.state==='defeated')return;
        e.hp=Math.max(0,e.hp-damage);e.sprite.setTint(0xffefb0);
        if(e.hp===0){e.state='defeated';e.label.setText(e.def.kind==='bandit'?'항복했어요':(['siren','crab','bat','beast','boss'].includes(e.def.kind)?'저주가 풀렸어!':'빛으로 돌아갔어요'));e.sprite.setAlpha(.25);
            const boss=['captain','siren','boss'].includes(e.def.kind);
            this.host.reward({id:e.def.id,xp:e.def.kind==='captain'?30:e.def.kind==='siren'?50:6,coins:3,objectives:boss||this.mapDef.id==='S06'?[e.def.id]:[],checkpoint:boss?{stageId:this.mapDef.id,checkpointId:'boss'}:undefined});
            if(e.def.kind==='siren'){this.projectiles.forEach(p=>{p.sprite.destroy();p.glyph.destroy();});this.projectiles=[];this.host.dialogue('freed',()=>{});}
        }
        this.host.changed();
    }
    private updateAttack() {
        this.slash.clear();
        if (!this.attack)
            return;
        const a = this.attack;
        const age = this.sim - a.start;
        if (['W02','W04','W05'].includes(a.weapon) && this.boom) {
            const phase = age < 600 ? 'out' : 'return';
            const duration=a.weapon==='W02'?1200:700;const distance=a.weapon==='W05'?650:a.weapon==='W04'?520:380;
            const t = Math.min(age / duration, 1);
            const x = a.weapon==='W02'?(t < 0.5 ? a.x + a.direction * distance * t * 2 : Phaser.Math.Linear(a.x + a.direction * distance, this.player.x, (t - 0.5) * 2)):a.x+a.direction*distance*t;
            this.boom.setPosition(x, this.player.y - 4).setRotation(age / 85);
            this.hitAt(x, this.player.y, 38, 70, a, phase);
            if (age >= duration) {
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
            this.hitAt(x, this.player.y, a.weapon==='W04'?130:a.weapon==='W06'?105:a.weapon==='W03'?85:90, 90, a, 'melee');
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
            if(e.def.kind==='guardian' && shieldBlocks(e.state,this.player.x,e.sprite.x,e.target)){e.label.setText('방패! 뒤나 빈틈을 노리세요');continue;}
            if (!this.combat.hit(a.id, e.def.id, phase))
                continue;
            this.damageEnemy(e,a.damage);
            if(a.weapon==='W03'&&e.hp>0)e.burn=ignite(this.sim,e.burn);
            if(e.hp>0&&!['siren','captain'].includes(e.def.kind))e.sprite.x+=a.direction*14;
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
        if(this.mapDef.id==='S08'&&this.player.x>=crystalSafeStart){for(const e of this.enemies)if(e.state!=='defeated'){e.state='idle';e.label.setVisible(false);}this.bossText.setVisible(false);return;}
        for (const e of this.enemies) {
            if (e.state === 'defeated')
                continue;
            e.label.setVisible(true);
            const distance = Math.abs(this.player.x - e.sprite.x);
            if (distance > 850)
                continue;
            const isBoss = e.def.kind === 'captain' || e.def.kind === 'siren' || e.def.kind === 'boss';
            if (isBoss)
                boss = `${e.def.kind === 'siren' ? '세이렌 · 저주' : e.def.kind==='boss'?'저주의 핵':'해골 대장'}  ${e.hp} / ${e.maxHp}  ${e.state === 'telegraph' ? '⚠ 공격 예고' : e.state === 'recover' ? '지금이 기회!' : ''}`;
            if (e.def.kind === 'siren' && ![1, 2, 3].every(n => this.done(`S02.shell.${n}`))) {
                e.label.setText('조개 종 3개로 방벽 해제');
                continue;
            }
            if (e.state === 'idle') {
                if(e.def.kind==='guardian')e.target=this.player.x;
                e.sprite.clearTint();
                if(this.mapDef.id==='S06')e.sprite.setTint(0xffaa65);
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
            e.sprite.setFlipX((e.def.kind==='guardian'?e.target:this.player.x) < e.sprite.x);
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
    private activate(def: ObjectDef) {
        if(this.done(def.id))return;
        if(def.reward?.startsWith('G') && this.host.save.goldenHearts.includes(def.reward)){this.host.objective(def.id);return;}
        this.host.reward(objectiveReward(def));
        if(def.reward?.startsWith('G')){this.host.hp=maxHp(this.host.save);this.host.changed();}
        if(def.kind==='flameGift'||def.id==='S13.reward'){this.host.hp=maxHp(this.host.save);this.host.mp=maxMp(this.host.save);this.host.changed();}
        this.host.sound('reward');
        this.host.notice(def.reward==='W02'?'바람 부메랑 획득! Q로 바꿔 J로 던져 보세요.':def.reward?.startsWith('G')?'황금 하트! 최대 체력 +10, 완전 회복':def.kind==='rescue'?'공기방울 보호를 저장했어요. 아직 자유 수영은 아니에요.':`${def.label} · 완료`);
    }    private interact(def: ObjectDef) {
        if (def.needs?.some(id => !this.done(id))) {
            this.host.notice('아직 할 일이 있어요. ' + this.mapDef.objective);
            return;
        }
        if(def.requiresItems?.some(id=>!this.host.save.treasures.includes(id))){this.host.notice(`${def.requiresItems.join(' · ')} 보물을 얻은 뒤 다시 와 주세요.`);return;}
        if(def.kind==='bridge'&&(!this.host.save.treasures.includes('T05')||this.sim>=this.bridgeUntil)){this.host.notice('가방에서 도깨비의 방울을 선택하고 R로 달빛 다리를 만드세요.');return;}
        if(def.kind==='mirror'){if(this.done('S08.light')){this.host.notice('별빛 문은 이미 열려 있어요. 연결은 유지됩니다.');return;}const index=Number(def.id.at(-1))-1;this.mirrorDirections=rotateMirror(this.mirrorDirections,index);this.host.sound('reward');if(connectedMirrors(this.mirrorDirections)===3)this.activate(this.mapDef.objects.find(o=>o.id==='S08.light')!);return;}
        if(def.kind==='lightGate'){this.host.notice(this.done(def.id)?'별빛이 문을 열었어요.':'벽화의 별자리를 보고 거울 세 개를 E로 회전하세요.');return;}
        if(['truthGift','vision','journal','gift'].includes(def.kind)){this.activate(def);this.host.dialogue(def.dialogue!,()=>{this.invulnerableUntil=this.sim+2000;});return;}
        if(def.kind==='rope'){if(this.done(def.id))return;this.grip={id:def.id,until:this.sim+3500};this.host.notice('밧줄을 잡았어요. 파도가 지나갈 때까지 가까이 머무르세요.');return;}
        if(def.kind==='flameGift'||def.kind==='descent'){this.activate(def);this.host.dialogue(def.dialogue!,()=>{this.invulnerableUntil=this.sim+2000;});return;}
        if(def.kind==='rescue'){this.activate(def);this.host.dialogue(def.dialogue??'naira',()=>{this.invulnerableUntil=this.sim+2000;});return;}
        if (def.kind === 'npc') {
            this.host.dialogue(def.dialogue ?? 'captain', () => this.host.objective(def.id));
            return;
        }
        if (def.kind === 'shell' || def.kind === 'remote') {
            this.host.notice('J로 이 조개를 쳐 보세요.');
            return;
        }
        if (def.kind === 'exit' || def.kind==='ending') {
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
