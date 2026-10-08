import Phaser from 'phaser';
import { maps, type FlightHazard, type MapDef, type ObjectDef, type Spawn } from '../content/maps';
import { assets } from '../content/assets.manifest';
import {objectTexture,sceneWorldPropKeys,worldPropTexture} from '../content/worldProps';
import { type WeaponId } from '../content/items';
import { Combat } from '../core/combat';
import { maxHp, maxMp, type Reward, type Save } from '../core/state';
import type { Input } from './input';
import { canBreatheUnderwater, movingPlatformX, movingPlatformY, objectiveReward, rescueEquipment, shieldBlocks } from '../core/adventure';
import {canCastFlame,flameCost,flameCooldown,flameDamage,ignite} from '../core/flame';
import {connectedMirrors,crystalSafeStart,mirrorSolution,mirrorSymbols,rotateMirror} from '../core/crystal';
import type { Platform } from '../content/maps';
import campaign from '../content/stageIndex';
import {channelProgress,deviceDirections,rotateDevice,treasureTrialAllowed} from '../core/storyMechanics';
import {poisonDuration,cargoSpeed,plantDamage} from '../core/passives';
import {controlText,type ControlMode} from './controlText';
import {swingPose,weaponLooks,availableWeaponTexture} from './weapons';
import {ensureTerrainTextures,terrainStyleFor} from './terrain';
import {terrainAssetKeys} from '../content/terrainStyles';
import {actionFrame,actionHand,heroActionCells,heroDisplaySize} from './heroArt';
import {actionDefeatKind,enemyActionLayout,enemyActionTexture,type EnemyActionKey} from '../content/enemyActions';
import {rocFlightFrame,rocFlightLayout} from '../content/rocArt';
import {rocBossId,rocCoresBroken,rocCoreReward,rocCoreOpen,rocPatterns,rocZone,insideRocZone} from '../core/rocBoss';
import {canGlide,glideFallSpeed} from '../core/glide';
import {batFlightBounds,batPatrol,batFlightTarget,batSwoop,type FlightPoint} from '../core/batFlight';
import {riverRoute,raftPrepared,riverStop,advanceRaft,swimmingInRiver} from '../core/river';
import {projectileArtFor,sceneEffectKeys,projectileFrame,effectFrame,effectDuration,type EffectArtKey} from '../content/effects';
const FONT='"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
// What the touch action button would do right now, so its icon can match.
export type ActionContext={kind:'attack'|'talk'|'use'|'exit';label:string};
export interface Host {
    save: Save;
    hp: number;
    mp: number;
    input: Input;
    controlMode: ControlMode;
    textScale(): number;
    context(action: ActionContext): void;
    loading(progress: number): void;
    ready(): void;
    reward(r: Reward): void;
    objective(id: string): void;
    persist(): void;
    changed(): void;
    notice(text: string): void;
    dialogue(id: string, done: () => void): void;
    pause(): void;
    map(): void;
    damage(base: number, element?: 'normal' | 'lightning' | 'poison'): boolean;
    heart(id: string, large: boolean): void;
    sound(kind: 'jump' | 'attack' | 'hurt' | 'heart' | 'reward' | 'warning'): void;
    clearStage(): void;
}
interface Enemy {
    flightPhase?: number;
    flightOrigin?: FlightPoint;
    coreStruck?: boolean;
    art?: EnemyActionKey;
    bodyHeight?: number;
    bodyWidth?: number;
    footOffset?: number;
    burn?: {until:number;next:number};
    def: Spawn;
    sprite: Phaser.GameObjects.Image;
    label: Phaser.GameObjects.Text;
    hp: number;
    maxHp: number;
    state: 'idle' | 'telegraph' | 'attack' | 'recover' | 'defeated';
    until: number;
    target: number;
    targetY: number;
    pattern: number;
}
interface Projectile {
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc;
    glyph?: Phaser.GameObjects.Text;
    start: number;
    vx: number;
    vy: number;
    until: number;
    wave: boolean;
}
export class Stage extends Phaser.Scene {
    private heroArt?:Phaser.GameObjects.Image;
    private weaponArt?:Phaser.GameObjects.Image;
    private heroShadow?:Phaser.GameObjects.Ellipse;
    private backdrop?:Phaser.GameObjects.Image;
    private hpBars!:Phaser.GameObjects.Graphics;
    private hurtAt=-Infinity;
    private joyfulUntil=0;
    private lastGroundY=612;
    private actionKey='';
    private skins=new Map<Phaser.GameObjects.Rectangle,Phaser.GameObjects.TileSprite>();
    private chef?:{sprite:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text;next:number;mark?:{x:number;at:number}};
    private poisonUntil=0;
    private poisonTick=0;
    private plantReady=0;
    private companion?:Phaser.GameObjects.Image;
    private deviceStates=new Map<string,{value:number;elapsed:number;active:boolean;carrying:boolean}>();
    private storyFx!:Phaser.GameObjects.Graphics;
    private friendshipAt=20000;
    private bridgeBody?:Phaser.GameObjects.Rectangle;
    private riverRaft?:{rect:Phaser.GameObjects.Rectangle;body:Phaser.Physics.Arcade.Body;art:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text;riding:boolean};
    private wasRiverSwimming=false;
    private flightMount?: Phaser.GameObjects.Image;
    private flightPassenger?: Phaser.GameObjects.Image;
    private flightHazards: {def:FlightHazard;sprite:Phaser.GameObjects.Image;label:Phaser.GameObjects.Text}[]=[];
    private hazardNoticeAt=0;
    private flightAttackId=100000;
    private flightAttackReady=0;
    private extraJump=false;
    private gliding=false;
    private rocGlyph?:Phaser.GameObjects.Graphics;
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
    private moving: {def:Platform;rect:Phaser.GameObjects.Rectangle;top:Phaser.GameObjects.TileSprite;body:Phaser.Physics.Arcade.Body}[]=[];
    private doors: {id:string;rect:Phaser.GameObjects.Rectangle;glow:Phaser.GameObjects.TileSprite;returnOnly?:boolean}[]=[];
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
    private effects: {sprite:Phaser.GameObjects.Sprite;start:number;duration:number}[] = [];
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
    // Every in-game caption: one Korean font, touch-friendly wording, and
    // larger letters on small screens where the 1280x720 canvas is shrunk.
    private txt(x:number,y:number,text:string|string[],style:Phaser.Types.GameObjects.Text.TextStyle={}){
        const scale=this.host.textScale();
        const size=parseFloat(String(style.fontSize??'18px'))*scale;
        const wrap=style.wordWrap?.width?{...style.wordWrap,width:style.wordWrap.width*scale}:style.wordWrap;
        const ctl=(value:string|string[])=>controlText(Array.isArray(value)?value.join('\n'):value,this.host.controlMode);
        const label=this.add.text(x,y,ctl(text),{...style,fontFamily:FONT,fontSize:`${Math.round(size)}px`,wordWrap:wrap});
        const setText=label.setText.bind(label);
        label.setText=(value:string|string[])=>setText(ctl(value));
        return label;
    }
    private sceneAssets(){
        const id=this.host.save.checkpoint.stageId;
        const chapter=campaign.find(stage=>stage.id===id)?.chapter??1;
        const characters=['hero-webtoon',...(maps[id].mode!=='flight'?['hero-run','hero-action']:[]),...maps[id].spawns.flatMap(spawn=>spawn.actionArt?[enemyActionTexture(spawn.actionArt)]:[]),...(maps[id].spawns.some(spawn=>!spawn.actionArt&&(spawn.texture==='enemy-atlas'||['skeleton','archer','captain','bandit','beast'].includes(spawn.kind)))?['enemy-atlas']:[]),...maps[id].objects.map(object=>object.texture),...(['S09','S10','S33'].includes(id)?['roc-webtoon']:[]),...(['S05','S07','S16'].includes(id)?['naira-webtoon']:[]),...(id==='S08'?['genie-webtoon']:[]),...(['S32','S33','S34','S35','S36'].includes(id)?['ariana-webtoon']:[]),...(['S19','S31'].includes(id)?['kuura-webtoon']:[])];
        if(id==='S04')characters.push('whale-webtoon');
        if(maps[id].mode==='flight')characters.push('roc-actions');
        if(id==='S15')characters.push('chef-webtoon');
        if(id==='S02')characters.push('siren-webtoon');
        if(id==='S06')characters.push('rah-webtoon');
        if(maps[id].spawns.some(spawn=>spawn.kind==='crab'&&!spawn.actionArt))characters.push('crab-webtoon');
        characters.push(...terrainAssetKeys(terrainStyleFor(maps[id])));
        characters.push(...sceneEffectKeys(maps[id].spawns.map(spawn=>spawn.kind),id));
        characters.push(...sceneWorldPropKeys(maps[id]));
        return assets.filter(asset=>asset.kind==='svg'||asset.key.startsWith('weapon-')||asset.key===`chapter-${chapter}`||characters.includes(asset.key));
    }
    preload() {
        this.load.off('progress');
        this.load.on('progress',(value:number)=>this.host.loading(value));
        const required=this.sceneAssets();const keys=new Set(required.map(asset=>asset.key));
        for(const asset of assets)if(asset.kind!=='svg'&&!keys.has(asset.key)&&this.textures.exists(asset.key))this.textures.remove(asset.key);
        for (const asset of required) {
        if(this.textures.exists(asset.key))continue;
        if(asset.kind==='svg')this.load.svg(asset.key, asset.path);
        else if(asset.kind==='sheet')this.load.spritesheet(asset.key,asset.path,{frameWidth:asset.frame??512,frameHeight:asset.frame??512});
        else this.load.image(asset.key,asset.path);
    }
        if(this.load.list.size>0)this.host.loading(0);
    }
    create() {
        this.mapDef = maps[this.host.save.checkpoint.stageId];
        this.deviceStates.clear();this.friendshipAt=20000;this.bridgeBody=undefined;this.poisonUntil=0;this.poisonTick=0;this.plantReady=0;
        this.riverRaft=undefined;this.wasRiverSwimming=false;
        this.mirrorDirections=this.done('S08.light')?[...mirrorSolution]:[0,0,0];
        this.moving=[];this.doors=[];this.wakeAt=null;this.air=10000;this.waterTick=0;
        this.flameReady=0;this.flameUsed=-Infinity;this.pulse=null;this.wave=null;this.grip=null;this.sinkAt=null;
        this.sim = 0; this.extraJump=false; this.gliding=false; this.rocGlyph=undefined; this.bridgeUntil=0;
        this.hurtAt=-Infinity;this.joyfulUntil=0;
        this.direction = 1;
        this.enemies = [];
        this.flightHazards=[];this.hazardNoticeAt=0;this.flightAttackId=100000;this.flightAttackReady=0;
        this.objects = [];
        this.hearts = [];
        this.projectiles = [];
        this.effects = [];
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
        for (const asset of this.sceneAssets())
            if (!this.textures.exists(asset.key)&&!asset.key.startsWith('chapter-')&&!asset.key.startsWith('terrain-')&&!asset.key.startsWith('weapon-')&&!asset.key.startsWith('prop-')&&asset.kind!=='sheet') {
                const g = this.make.graphics({ x: 0, y: 0 });
                g.fillStyle(0xeac28b).fillCircle(48, 24, 18);
                g.fillStyle(0x285069).fillRect(27, 43, 42, 43);
                g.fillStyle(0xe7d5a5).fillRect(28, 86, 15, 35).fillRect(55, 86, 15, 35);
                g.generateTexture(asset.key, 96, 128);
                g.destroy();
            }
        this.backdrop=undefined;
        this.background();
        this.chef=undefined;
        if(this.mapDef.id==='S04')this.add.image(this.mapDef.width/2,620,'whale-webtoon').setDisplaySize(this.mapDef.width-140,720).setDepth(-4);
        if(this.mapDef.id==='S15'){
            const x=this.mapDef.width-570;
            this.chef={sprite:this.add.image(x,608,'chef-webtoon').setOrigin(.5,1).setDisplaySize(220,330).setDepth(2),label:this.txt(x,240,'거인 요리사 · 국자 증기를 피하세요',{fontSize:'18px',color:'#fff2cc',backgroundColor:'#173b46',padding:{x:7,y:4}}).setOrigin(.5).setDepth(7),next:5000};
        }
        this.land = this.physics.add.staticGroup();
        const adventurePalette:Record<string,[number,number,number]>={sky:[0x496f7d,0x8db6ad,0xdde0af],volcano:[0x563b45,0xa8614b,0xf0a562],village:[0x5f786c,0x9eb489,0xead49a],warehouse:[0x574c43,0x8c7155,0xe3b875],ocean:[0x285e75,0x438a91,0x9ce0ca],pirate:[0x3a4354,0x715449,0xd7ad69],shadow:[0x3b3d59,0x67648a,0xc4b4dd],jungle:[0x355b4d,0x62845d,0xc5cf82],temple:[0x514963,0x827562,0xe1ca8f],garden:[0x557765,0x83ad86,0xf0c7cf],tower:[0x343b59,0x616a89,0xded3a3],kingdom:[0x547a80,0x87aaa3,0xf0d294]};
        const [side,topColor,edge]=this.mapDef.theme==='adventure'?adventurePalette[this.mapDef.visual??'sky']:this.mapDef.theme==='reef'?[0x477976,0x78a392,0xd4d5a2]:[0x6b5548,0x9a7857,0xe5c487];
        void side;void topColor;void edge;
        const terrain=ensureTerrainTextures(this,terrainStyleFor(this.mapDef));
        this.skins.clear();
        for (const p of this.mapDef.platforms) {
            this.add.rectangle(p.x+p.w/2+6,p.y+p.h/2+8,p.w,p.h,0x0b1f2b,.28).setDepth(-1);
            // The physics box stays invisible; the textured skin is what players see.
            const rect = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x000000, 0);
            const skin=this.add.tileSprite(p.x+p.w/2,p.y+p.h/2,p.w,p.h,terrain.fillKey).setDepth(0);
            if(p.h<=30)skin.setVisible(false);
            if(this.mapDef.id==='S04')skin.setAlpha(.22);
            this.skins.set(rect,skin);
            if(this.mapDef.id==='S07'&&p.motion&&!p.requiredGround)this.txt(p.x+p.w/2,p.y-35,'유목 · 점프',{fontSize:'18px',color:'#fbe2ad'}).setOrigin(.5);
            const top=this.add.tileSprite(p.x + p.w / 2, p.y + 13, p.w, 34, terrain.topKey).setDepth(1);
            if(this.mapDef.id==='S04')top.setAlpha(.55);
            if(p.motion){this.physics.add.existing(rect);const body=rect.body as Phaser.Physics.Arcade.Body;body.setAllowGravity(false).setImmovable(true);this.moving.push({def:p,rect,top,body});}else {this.land.add(rect);if(p.oneWay){const platformBody=rect.body as Phaser.Physics.Arcade.StaticBody;platformBody.checkCollision.left=false;platformBody.checkCollision.right=false;platformBody.checkCollision.down=false;}}
        }
        const cp = this.mapDef.checkpoints.find(c => c.id === this.host.save.checkpoint.checkpointId) ?? this.mapDef.checkpoints[0];
        this.safe = { x: cp.x, y: cp.y };
        this.player = this.physics.add.sprite(cp.x, cp.y, 'player').setDepth(10);
        this.heroShadow=this.add.ellipse(cp.x,cp.y+62,62,14,0x08202c,.35).setDepth(2);
        this.heroArt=this.add.image(cp.x,cp.y+64,'hero-webtoon').setOrigin(.5,1).setDisplaySize(96,132).setDepth(10);
        this.weaponArt=this.add.image(cp.x,cp.y,availableWeaponTexture('W01',key=>this.textures.exists(key))??'__MISSING').setDepth(11).setVisible(false);
        this.companion=['S32','S34','S35','S36'].includes(this.mapDef.id)?this.add.image(cp.x-65,cp.y+64,'ariana-webtoon').setOrigin(.5,1).setDisplaySize(86,128).setDepth(9):undefined;
        this.flightMount=this.mapDef.mode==='flight'?this.add.image(cp.x,cp.y+15,this.textures.exists('roc-actions')?'roc-actions':'roc-webtoon',this.textures.exists('roc-actions')?4:undefined).setDisplaySize(240,160).setDepth(9):undefined;
        this.flightPassenger=this.mapDef.id==='S33'?this.add.image(cp.x,cp.y+10,'ariana-webtoon').setOrigin(.5,1).setDisplaySize(64,100).setDepth(10):undefined;
        this.player.body?.setSize(42, 84);
        this.player.body?.setOffset(27, 42);
        this.player.setMaxVelocity(300, 1000).setDragX(2600);
        if(this.freeMovement()){(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);this.player.setDragY(1800).setMaxVelocity(330,330);}
        this.physics.add.collider(this.player, this.land);
        for(const platform of this.moving)this.physics.add.collider(this.player,platform.rect);
        if(this.mapDef.river)this.createRiver(cp.id);
        for(const o of this.mapDef.objects.filter(o=>['gate','lightGate','vision'].includes(o.kind))){const rect=this.add.rectangle(o.x+48,440,28,336,0xc892aa,0);this.land.add(rect);const glow=this.add.tileSprite(o.x+48,440,44,336,this.barrierTexture(o.kind)).setDepth(3).setAlpha(.85);this.doors.push({id:o.id,rect,glow});if(this.done(o.id)){(rect.body as Phaser.Physics.Arcade.StaticBody).enable=false;rect.setVisible(false);glow.setVisible(false);}}
        this.physics.world.setBounds(0, -200, this.mapDef.width, 1400);
        this.cameras.main.setBounds(0, 0, this.mapDef.width, 720);
        this.cameras.main.startFollow(this.player, true, this.host.save.settings.reducedMotion ? 1 : 0.12, this.host.save.settings.reducedMotion ? 1 : 0.12, 0, 0);
        for (const def of this.mapDef.spawns) {
            const boss = def.kind === 'captain' || def.kind === 'siren' || def.kind === 'boss';
            if (((boss || this.mapDef.id==='S06') && this.done(def.id)) || (def.flightPath&&this.host.save.claimedRewardIds.includes(def.id)))
                continue;
            const fallbackTexture=def.kind==='captain'||def.kind==='archer'?'skeleton':def.kind;
            let texture=def.texture==='roc'?'roc-webtoon':def.texture??fallbackTexture;let frame=def.frame;
            if(!def.texture&&['siren','crab'].includes(def.kind))texture=`${def.kind}-webtoon`;
            if(!def.texture&&['skeleton','archer','captain','bandit','beast'].includes(def.kind)&&this.textures.exists('enemy-atlas')){texture='enemy-atlas';frame=def.kind==='bandit'?4:def.kind==='beast'?0:5;}
            const art = def.actionArt && this.textures.exists(enemyActionTexture(def.actionArt)) ? def.actionArt : undefined;
            if(art){texture=enemyActionTexture(art);frame=enemyActionLayout(art,'idle',130,65).frame;}
            if(!this.textures.exists(texture)){texture=fallbackTexture;frame=undefined;}
            const sprite = this.add.image(def.x, def.y, texture,frame).setDisplaySize(texture==='roc-webtoon'?220:texture==='enemy-atlas'?(def.kind==='boss'?172:130):def.kind==='boss'?124:96,texture==='roc-webtoon'?145:texture==='enemy-atlas'?(def.kind==='boss'?172:130):def.kind==='boss'?156:128).setOrigin(.5,def.kind==='boss'?.65:.5).setDepth(5);
            if(texture.endsWith('-webtoon')&&texture!=='roc-webtoon'&&def.kind!=='crab'){const source=this.textures.get(texture).getSourceImage();sprite.setDisplaySize(sprite.displayHeight*source.width/source.height,sprite.displayHeight);}
            if(def.kind==='crab')sprite.setDisplaySize(128,128).setOrigin(.5,.35);
            if(this.mapDef.id==='S06')sprite.setTint(0xffaa65);
            if (def.kind === 'captain')
                sprite.setTint(0xffd98e).setDisplaySize(texture==='enemy-atlas'?150:110,texture==='enemy-atlas'?150:147);
            const hp = def.id===rocBossId?3-rocCoresBroken(this.host.save):Math.round(def.hp * (this.host.save.settings.difficulty === 'relaxed' ? 0.85 : 1));
            const label = this.txt(def.x, def.y - (def.kind==='boss'?125:87), '', { fontSize: '19px', color: '#fff5cf', backgroundColor: '#173746', padding:{x:6,y:3} }).setOrigin(0.5).setDepth(6);
            const enemy:Enemy = { def, sprite, label, hp, maxHp: hp, state: 'idle', until: 0, target: def.x, targetY:def.y, pattern: 0, art };
            if(art){
                enemy.bodyHeight=art==='roc'?145:['kite','siren','crab','bat','spirit'].includes(def.kind)?128:def.kind==='boss'?172:def.kind==='captain'?150:130;
                const support=this.mapDef.platforms.filter(p=>!p.oneWay&&!p.motion&&def.x>=p.x&&def.x<=p.x+p.w&&p.y>=def.y).sort((a,b)=>a.y-b.y)[0];
                enemy.footOffset=art==='roc'?145*.35:['bat','spirit'].includes(def.kind)?64:def.kind==='kite'?0:support?support.y-def.y+2:def.kind==='boss'?172*.35:enemy.bodyHeight*.5;
                this.setEnemyPose(enemy);
            }
            this.enemies.push(enemy);
        }
        for(const def of this.mapDef.flightHazards??[]){
            const texture=worldPropTexture(def.kind==='gust'?'stormCloud':'debris',key=>this.textures.exists(key));
            const sprite=this.add.image(def.x,def.y,texture).setDepth(7).setScale(def.kind==='gust'?.95:.7);
            const label=this.txt(def.x,def.y-def.radius-35,def.kind==='gust'?'돌풍 · 위아래로 피하기':'낙하 파편 · 피하기',{fontSize:'17px',color:'#fff2cb',backgroundColor:'#28485a',padding:{x:7,y:4}}).setOrigin(.5).setDepth(8);
            this.flightHazards.push({def,sprite,label});
        }
        for (const original of this.mapDef.objects) {
            const def={...original};
            const texture=objectTexture(def,this.mapDef.id);
            const scale=def.flightRing ? 1.35 : ['npc','rescue','truthGift'].includes(def.kind)?1:def.kind === 'checkpoint' ? 0.42 : 0.68;
            const portraitTexture=texture==='roc'?'roc-webtoon':texture==='naira'?'naira-webtoon':texture==='genie'?'genie-webtoon':texture==='player'?'hero-webtoon':texture;
            const displayTexture=texture==='siren'?'siren-webtoon':texture==='rah'?'rah-webtoon':portraitTexture;
            const propTexture=worldPropTexture(displayTexture,key=>this.textures.exists(key),def.id);
            const shownTexture=this.textures.exists(propTexture)?propTexture:texture;
            const sprite = this.add.image(def.x, def.y, shownTexture).setDisplaySize(96*scale,128*scale).setDepth(4);
            // Painted characters keep their own proportions instead of being squeezed into 3:4.
            if(shownTexture.endsWith('-webtoon')){const source=this.textures.get(shownTexture).getSourceImage();sprite.setDisplaySize(128*scale*source.width/source.height,128*scale);}
            if(def.breakWeapon&&this.done(def.id))sprite.setVisible(false);
            if (def.kind === 'npc'&&!displayTexture.endsWith('-webtoon'))
                sprite.setTint(0xe1d498);
            const label = this.txt(def.x, def.y - 64, def.label, { wordWrap:['S06','S07','S08'].includes(this.mapDef.id)?{width:210,useAdvancedWrap:true}:undefined, fontSize: ['S06','S07','S08'].includes(this.mapDef.id)?'18px':'20px', color: '#fff2cc', backgroundColor: '#173b46', padding: { x: 7, y: 4 } }).setOrigin(0.5).setDepth(7);
            if(['captain-webtoon','sailor-webtoon'].includes(shownTexture))label.setY(sprite.y-sprite.displayHeight/2-label.height/2-8);
            this.objects.push({ def, sprite, label });
        }
        for (const h of this.mapDef.hearts)
            this.hearts.push({ id: h.id, large: !!h.large, sprite: this.add.image(h.x, h.y, worldPropTexture('heart',key=>this.textures.exists(key))).setScale(h.large ? 0.5 : 0.36).setDepth(5) });
        this.slash = this.add.graphics().setDepth(12);
        this.storyFx=this.add.graphics().setDepth(8);
        this.crystalArt=this.add.graphics().setDepth(6);
        this.flameArt=this.add.graphics().setDepth(12);
        this.waveArt=this.add.graphics().setDepth(8);
        this.bubble=this.add.graphics().setDepth(11);
        this.journey=this.txt(640,186,'',{fontSize:this.host.controlMode==='touch'?'15px':'18px',color:'#fff1c8',backgroundColor:'#24475bdd',padding:{x:10,y:6},wordWrap:{width:760,useAdvancedWrap:true},align:'center'}).setOrigin(.5).setScrollFactor(0).setDepth(19).setVisible(['S04','S05','S06','S07','S08'].includes(this.mapDef.id)||this.mapDef.mode==='flight');
        this.warnings = this.add.graphics().setDepth(3);
        if(this.mapDef.id==='S09')this.rocGlyph=this.add.graphics().setDepth(9);
        this.bossText = this.txt(640, 142, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#fce8bc', backgroundColor: '#173643', padding: { x: 12, y: 7 } }).setOrigin(0.5).setScrollFactor(0).setDepth(20).setVisible(false);
        this.hint = this.txt(640, 648, '', { fontFamily: 'sans-serif', fontSize: '22px', color: '#fff3d2', backgroundColor: '#153847', padding: { x: 14, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        // On touch screens the action button itself shows what will happen, and
        // the bottom of the canvas sits under the thumbs, so the key hint is hidden.
        this.hint.setVisible(this.host.controlMode==='keyboard');
        this.hpBars=this.add.graphics().setDepth(6);
        this.actionKey='';
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.host.input.clear(); this.projectiles = []; this.effects = []; this.attack = null; });
        this.host.changed();
        this.host.ready();
        const stageInfo=campaign.find(info=>info.id===this.mapDef.id);
        if(stageInfo){const card=this.add.container(640,285).setScrollFactor(0).setDepth(30);const plate=this.add.rectangle(0,0,Math.min(900,500*this.host.textScale()),104*this.host.textScale(),0x102f40,.9).setStrokeStyle(2,0xe8c77f);const title=this.txt(0,-16*this.host.textScale(),`${stageInfo.id} · ${stageInfo.title}`,{fontSize:'29px',fontStyle:'bold',color:'#fff1cf'}).setOrigin(.5);const chapter=this.txt(0,24*this.host.textScale(),`${stageInfo.chapter}장 · ${this.mapDef.peaceful?'평화로운 이야기':'새로운 항해'}`,{fontSize:'15px',color:'#bed8d5'}).setOrigin(.5);card.add([plate,title,chapter]);if(!this.host.save.settings.reducedMotion)this.tweens.add({targets:card,alpha:0,y:270,delay:1800,duration:600,onComplete:()=>card.destroy()});else this.time.delayedCall(1200,()=>card.destroy());}
    }
    private background() {
        const chapter=campaign.find(stage=>stage.id===this.mapDef.id)!.chapter;
        const backgroundKey=`chapter-${chapter}`;
        if(this.textures.exists(backgroundKey)){
            this.cameras.main.setBackgroundColor('#203b51');
            // The 3:2 painting keeps its proportions (it used to be squeezed to
            // 16:9) and is a little wider than the screen so it can drift with
            // the camera instead of standing still while the ground slides by.
            this.backdrop=this.add.image(640,360,backgroundKey).setDisplaySize(1440,960).setOrigin(.5,.5).setScrollFactor(0).setDepth(-20);
            this.backdrop.setY(360+60);
            // A subdued floor band preserves visible collision boundaries.
            this.add.rectangle(640,638,1280,164,0x122b3c,.18).setScrollFactor(0).setDepth(-19);
            this.add.graphics().setDepth(-18).setScrollFactor(.12).lineStyle(2,0xffecc1,.12).lineBetween(0,530,this.mapDef.width,530);
            return;
        }
        const theme = this.mapDef.theme;
        if(theme==='adventure'){
            const palettes:Record<string,[number,number,number]>={sky:[0x86b8cb,0xeedca4,0x416c82],volcano:[0x422f43,0xe28b55,0x6d4343],village:[0xb9d5bd,0xf2ce91,0x6d8d82],warehouse:[0x5f574f,0xd0a56f,0x3a4a4e],ocean:[0x39768b,0x8cd8cf,0x244e68],pirate:[0x273e55,0xd5a966,0x734f45],shadow:[0x292d46,0xb5a9d6,0x51516f],jungle:[0x315c50,0xc6c77a,0x658152],temple:[0x564b72,0xd8c38e,0x82735d],garden:[0x5a8b76,0xf1c8d2,0x8e7181],tower:[0x242f4c,0xe1d5a5,0x566080],kingdom:[0x78a6ad,0xf3d18f,0x7f6e76]};
            const [sky,glow,land]=palettes[this.mapDef.visual??'sky'];this.cameras.main.setBackgroundColor(sky);
            const far=this.add.graphics().setDepth(-12).setScrollFactor(.08);far.fillStyle(glow,.26).fillCircle(1010,155,92);
            for(let x=-100;x<this.mapDef.width;x+=430){far.fillStyle(land,.28).fillTriangle(x,585,x+220,270+(x%5)*18,x+470,585);far.fillStyle(0xffffff,.12).fillEllipse(x+120,180+(x%4)*28,150,34);far.fillEllipse(x+205,180+(x%4)*28,110,27);}
            const g=this.add.graphics().setDepth(-10).setScrollFactor(.25);g.fillStyle(glow,.18).fillRect(0,480,this.mapDef.width,160);
            for(let x=0;x<this.mapDef.width;x+=330){g.fillStyle(land,.82).fillTriangle(x,570,x+150,220+(x%4)*36,x+320,570);g.lineStyle(3,glow,.35).lineBetween(x+30,460,x+260,460);g.fillStyle(glow,.25).fillCircle(x+95,145+(x%5)*38,24);g.fillStyle(glow,.18).fillEllipse(x+165,535,270,32);}
            const motif=this.add.graphics().setDepth(-9).setScrollFactor(.18);
            switch(this.mapDef.visual){
                case 'volcano':
                    for(let x=180;x<this.mapDef.width;x+=520){motif.fillStyle(0x321e31,.72).fillTriangle(x,560,x+155,210,x+320,560);motif.lineStyle(10,0xf08b58,.55).lineBetween(x+155,420,x+190,560);motif.fillStyle(0xffc56f,.35).fillCircle(x+155,210,16);}
                    break;
                case 'village':
                    for(let x=130;x<this.mapDef.width;x+=390){motif.fillStyle(0x8f6257,.8).fillRect(x,380,180,120);motif.fillStyle(0xe08b70,.9).fillTriangle(x-18,380,x+90,285,x+198,380);motif.fillStyle(0xf4df9b,.75).fillRect(x+35,420,30,35).fillRect(x+115,420,30,35);motif.lineStyle(5,0xf8d78f,.5).lineBetween(x+90,315,x+90,260);motif.fillTriangle(x+90,265,x+125,280,x+90,296);}
                    break;
                case 'warehouse':
                    for(let x=90;x<this.mapDef.width;x+=460){motif.fillStyle(0x433c40,.75).fillRect(x,330,280,180);motif.fillStyle(0xb98255,.6).fillRect(x+28,360,70,52).fillRect(x+108,420,70,52).fillRect(x+188,360,70,52);motif.lineStyle(6,0xe2bb75,.45).lineBetween(x,330,x+280,510);}
                    break;
                case 'ocean':
                    for(let x=20;x<this.mapDef.width;x+=260){motif.lineStyle(6,0xb8f0df,.3).strokeEllipse(x+100,430,230,55);motif.lineStyle(3,0xe2fff1,.4).strokeEllipse(x+170,305,100,28);motif.fillStyle(0xd2fff0,.45).fillCircle(x+215,220+(x%140),5).fillCircle(x+240,185+(x%100),3);}
                    break;
                case 'pirate':
                    for(let x=210;x<this.mapDef.width;x+=560){motif.lineStyle(9,0x3d3041,.85).lineBetween(x,520,x,240);motif.lineStyle(5,0xd6b16a,.65).lineBetween(x,245,x+180,415);motif.fillStyle(0x9b5b58,.65).fillTriangle(x+8,255,x+150,300,x+8,345);motif.fillStyle(0xd5b063,.55).fillTriangle(x+8,350,x+125,380,x+8,410);}
                    break;
                case 'shadow':
                    for(let x=100;x<this.mapDef.width;x+=330){motif.fillStyle(0xe2d9ff,.18).fillCircle(x+100,300,58);motif.fillStyle(0x1e2340,.6).fillTriangle(x+40,500,x+100,360,x+160,500);motif.lineStyle(3,0xf0e6ff,.3).strokeCircle(x+100,300,78);}
                    break;
                case 'jungle':
                    for(let x=45;x<this.mapDef.width;x+=300){motif.lineStyle(14,0x173f3c,.8).beginPath();motif.moveTo(x,0);motif.lineTo(x+45,240);motif.lineTo(x-15,460);motif.strokePath();motif.lineStyle(5,0xa9c579,.7).lineBetween(x+42,190,x+140,275);motif.lineBetween(x+15,340,x-70,420);motif.fillStyle(0x8ab075,.7).fillEllipse(x+120,275,90,30).fillEllipse(x-55,420,110,32);}
                    break;
                case 'temple':
                    motif.fillStyle(0xf4dca9,.45).fillCircle(1020,170,70);for(let x=120;x<this.mapDef.width;x+=430){motif.fillStyle(0x3b3c59,.8).fillRect(x,300,90,250).fillTriangle(x-18,300,x+45,235,x+108,300);motif.lineStyle(6,0xe4c98d,.35).lineBetween(x-15,305,x+105,305);}
                    break;
                case 'garden':
                    for(let x=100;x<this.mapDef.width;x+=280){motif.lineStyle(6,0x355d4e,.8).lineBetween(x,560,x+45,375);motif.fillStyle(0xf6c4d5,.8).fillCircle(x+35,365,18).fillStyle(0xffe5a0,.9).fillCircle(x+35,365,6);motif.fillStyle(0x86c08e,.65).fillEllipse(x+115,450,160,45);}
                    break;
                case 'tower':
                    for(let x=80;x<this.mapDef.width;x+=245){motif.fillStyle(0xffefbb,.8).fillCircle(x+40,160+(x%140),3).fillCircle(x+150,210+(x%100),4).fillCircle(x+210,120+(x%180),2);motif.lineStyle(3,0xd5d4ff,.25).lineBetween(x+40,160+(x%140),x+150,210+(x%100));}
                    break;
                case 'kingdom':
                    for(let x=140;x<this.mapDef.width;x+=500){motif.fillStyle(0x52717a,.9).fillRect(x,350,230,190);motif.fillStyle(0xd59b73,.8).fillTriangle(x-20,350,x+115,240,x+250,350);motif.lineStyle(5,0xf4d28b,.65).lineBetween(x+115,250,x+115,190);motif.fillTriangle(x+115,195,x+180,215,x+115,235);}
                    break;
            }
            if(this.mapDef.mode==='swim')g.fillStyle(0x75d6d0,.25).fillRect(0,100,this.mapDef.width,520);
            this.txt(42,205,`${this.mapDef.id} · ${this.mapDef.objective}`,{fontSize:'21px',color:'#fff1ce',backgroundColor:'#263d51',padding:{x:10,y:7},wordWrap:{width:720}}).setScrollFactor(.3).setDepth(-5);
            return;
        }
        if(theme==='crystal'){
            this.cameras.main.setBackgroundColor('#303550');
            const g=this.add.graphics().setDepth(-10).setScrollFactor(.4);
            for(let x=0;x<this.mapDef.width;x+=230){g.fillStyle(0x56597e).fillTriangle(x,0,x+110,260,x+205,0);g.fillStyle(0x63849c,.65).fillTriangle(x,608,x+90,345,x+170,608);g.lineStyle(3,0xb9bfe1,.5).lineBetween(x+90,345,x+105,600);g.fillStyle(0xddd3ff,.75).fillCircle(x+140,240+(x%130),3);}
            this.txt(crystalSafeStart,330,'✧ 안전한 퍼즐 구역\n벽화의 별자리: ① →   ② ←   ③ ↓\nE 회전 · 위쪽 거울 초기화 버튼\n미완성 배치는 재접속 시 초기화됩니다',{fontSize:'19px',color:'#e2dcff',backgroundColor:'#353952',padding:{x:12,y:9}});
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
            for(const w of this.mapDef.water??[]){const water=this.add.graphics().setDepth(9);water.fillStyle(0x86d6d7,.18).fillRect(w.x,w.y,w.w,w.h);water.lineStyle(3,0xbcebe1,.8).lineBetween(w.x,w.y,w.x+w.w,w.y);this.txt(w.x+12,w.y-32,'공기방울로 숨 쉬는 길',{fontSize:'18px',color:'#e2fff0'});}
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
        this.txt(42, 187, `${this.mapDef.id} / ${theme === 'harbor' ? '첫 출항' : theme === 'reef' ? '안개 너머' : '폭풍의 밤'}`, { fontSize: '23px', fontFamily: 'sans-serif', color: theme === 'storm' ? '#b8cdd3' : '#385e63' }).setScrollFactor(0.3).setDepth(-5);
    }
    private done(id: string) { return this.host.save.completedObjectiveIds.includes(id); }
    private freeMovement(){return this.mapDef?.mode==='flight'||(this.mapDef?.mode==='swim'&&this.host.save.treasures.includes('T04')&&(!this.mapDef.river||!!this.player&&swimmingInRiver(this.player.x,this.player.y)));}
    protect(ms: number) { this.invulnerableUntil = Math.max(this.invulnerableUntil, this.sim + ms); }
    freeze(value: boolean) { this.stopped = value; this.host.input.clear(); if (value) {
        this.physics.pause();
        this.player?.setVelocity(0, 0);
    }
    else
        this.physics.resume(); }
    private artSnapshot(){
        const roc=this.enemies.find(e=>e.def.id===rocBossId);
        return {
            gliding:this.gliding,
            river:this.riverRaft?{prepared:raftPrepared(this.host.save),x:this.riverRaft.rect.x,top:riverRoute.top,riding:this.riverRaft.riding,stop:riverStop(this.host.save),gates:this.doors.filter(d=>d.id.startsWith('S26.quest.')).map(d=>({id:d.id,closed:(d.rect.body as Phaser.Physics.Arcade.StaticBody).enable}))}:null,
            batFlights:this.enemies.filter(e=>e.def.flightPath).map(e=>({id:e.def.id,bounds:batFlightBounds(e.def,e.def.flightPath!),target:{x:e.target,y:e.targetY},phase:e.flightPhase??0})),
            extraJump:this.extraJump,
            rocEncounter:roc?{pattern:roc.pattern,patternName:rocPatterns[roc.pattern].name,remaining:Math.max(0,roc.until-this.sim),
                coresBroken:rocCoresBroken(this.host.save),core:this.rocCore(roc),
                coreOpen:rocCoreOpen(roc.state,!!roc.coreStruck,this.host.save.treasures.includes('T02')),
                zone:rocZone(roc.pattern,roc.def.x,roc.target)}:null,
            projectileArt:this.projectiles.map(p=>({x:p.sprite.x,y:p.sprite.y,vx:p.vx,vy:p.vy,wave:p.wave,start:p.start,remaining:p.until-this.sim,
                type:p.sprite.type,texture:p.sprite instanceof Phaser.GameObjects.Sprite?p.sprite.texture.key:'legacy-arc',
                frame:p.sprite instanceof Phaser.GameObjects.Sprite?Number(p.sprite.frame.name):null,
                flipX:p.sprite instanceof Phaser.GameObjects.Sprite?p.sprite.flipX:false,rotation:p.sprite.rotation,
                displayWidth:p.sprite.displayWidth,displayHeight:p.sprite.displayHeight,glyph:p.glyph?.text??null})),
            effectArt:this.effects.map(e=>({x:e.sprite.x,y:e.sprite.y,texture:e.sprite.texture.key,frame:Number(e.sprite.frame.name),start:e.start,remaining:e.duration-(this.sim-e.start),displayWidth:e.sprite.displayWidth,displayHeight:e.sprite.displayHeight})),
            cachedEffectKeys:this.textures.getTextureKeys().filter(key=>key.startsWith('projectile-')||key.startsWith('effect-')),
            cachedActionKeys:this.textures.getTextureKeys().filter(key=>key.endsWith('-actions')),
        };
    }
    snapshot() {
        // Scene restart disposes old frames before preload/create rebuild them.
        // Keep the read-only observer from dereferencing disposed textures.
        if (!this.sys.isActive() || !this.player?.active || !this.player.body)
            return {stage:null,player:null,save:structuredClone(this.host.save),paused:true,loading:true,sim:this.sim,enemies:[],storyDevices:[],freeMovement:false};
        const style = terrainStyleFor(this.mapDef);
        const propArt={cachedKeys:this.textures.getTextureKeys().filter(key=>key.startsWith('prop-')),
            objects:this.objects.map(object=>({id:object.def.id,kind:object.def.kind,texture:object.sprite.texture.key,x:object.sprite.x,y:object.sprite.y,width:object.sprite.displayWidth,height:object.sprite.displayHeight,visible:object.sprite.visible,done:this.done(object.def.id)})),
            chests:this.objects.filter(object=>object.def.kind==='chest').map(object=>({id:object.def.id,texture:object.sprite.texture.key,x:object.sprite.x,y:object.sprite.y,width:object.sprite.displayWidth,height:object.sprite.displayHeight,done:this.done(object.def.id)})),
            hearts:this.hearts.map(heart=>({id:heart.id,large:heart.large,active:heart.sprite.active,
                ...(heart.sprite.active?{texture:heart.sprite.texture.key,x:heart.sprite.x,y:heart.sprite.y,width:heart.sprite.displayWidth,height:heart.sprite.displayHeight}:{})}))};
        const terrain = {style, cachedKeys:this.textures.getTextureKeys().filter(key=>key.startsWith('terrain-')),
            textures:terrainAssetKeys(style).map(key=>{const image=this.textures.get(key).getSourceImage() as HTMLImageElement|HTMLCanvasElement;return {key,width:image.width,height:image.height,source:image instanceof HTMLImageElement?image.currentSrc:'generated'};}),
            // TileSprite.texture is its private render canvas; displayTexture is
            // the original fill pattern in the pinned Phaser 3.90 runtime.
            platforms:[...this.skins].map(([rect,skin])=>({x:rect.x,y:rect.y,width:rect.width,height:rect.height,texture:(Reflect.get(skin,'displayTexture') as Phaser.Textures.Texture).key,visible:skin.visible,skinX:skin.x,skinY:skin.y,skinWidth:skin.width,skinHeight:skin.height})),
            tops:this.children.list.filter(child=>child instanceof Phaser.GameObjects.TileSprite&&(Reflect.get(child,'displayTexture') as Phaser.Textures.Texture).key===`terrain-${style}-top`).map(child=>{const top=child as Phaser.GameObjects.TileSprite;return {x:top.x,y:top.y,width:top.width,height:top.height,texture:(Reflect.get(top,'displayTexture') as Phaser.Textures.Texture).key};})};
        return { ...this.artSnapshot(), terrain, propArt, flightArt:this.flightArtSnapshot(), heroArt:this.heroArt?{texture:this.heroArt.texture.key,frame:Number(this.heroArt.frame.name),x:this.heroArt.x,y:this.heroArt.y,flipX:this.heroArt.flipX,originY:this.heroArt.originY}:null, weaponArt:this.weaponArt?{visible:this.weaponArt.visible,x:this.weaponArt.x,y:this.weaponArt.y,texture:this.weaponArt.texture.key,angle:this.weaponArt.angle}:null, storyDevices:this.objects.filter(o=>o.def.mechanic).map(o=>({id:o.def.id,x:o.def.x,y:o.def.y,mechanic:o.def.mechanic,done:this.done(o.def.id),state:this.deviceStates.get(o.def.id)})), freeMovement:this.freeMovement(), stage: this.mapDef?.id, player: this.player ? { x: this.player.x, y: this.player.y, grounded: ((this.player.body as Phaser.Physics.Arcade.Body)?.blocked.down||(this.player.body as Phaser.Physics.Arcade.Body)?.touching.down), vx: this.player.body?.velocity.x, vy: this.player.body?.velocity.y, hp: this.host.hp, maxHp: maxHp(this.host.save), bodyWidth: this.player.body?.width, bodyHeight: this.player.body?.height } : null, save: structuredClone(this.host.save), sim: this.sim, paused: this.stopped, enemies: this.enemies.map(e => ({ id: e.def.id, x: e.sprite.x, y: e.sprite.y, hp: e.hp, state: e.state, visible:e.sprite.visible, alpha:e.sprite.alpha, burn:e.burn, art:e.def.actionArt, texture:e.sprite.texture.key, frame:Number(e.sprite.frame.name), flipX:e.sprite.flipX, originX:e.sprite.originX, originY:e.sprite.originY, displayHeight:e.sprite.displayHeight, footOffset:e.footOffset, label:e.label.text })), flightHazards:this.flightHazards.map(h=>({id:h.def.id,x:h.sprite.x,y:h.sprite.y,kind:h.def.kind,radius:h.def.radius,texture:h.sprite.texture.key,width:h.sprite.displayWidth,height:h.sprite.displayHeight,rotation:h.sprite.rotation,scale:h.sprite.scaleX})), projectiles: this.projectiles.length, boomerang: !!this.boom, attack: this.attack?.id ?? null, air: this.air, submerged:this.submerged, bubbleProtected: canBreatheUnderwater(this.host.save), movingPlatforms: this.moving.map(p=>({x:p.rect.x,y:p.rect.y-p.def.h/2,w:p.def.w})), mp:this.host.mp, flameReady:this.flameReady, pulse:!!this.pulse, wave:this.wave?{id:this.wave.def.id,at:this.wave.at}:null, grip:this.grip?.id??null, mirrors:[...this.mirrorDirections], connectedMirrors:connectedMirrors(this.mirrorDirections), puzzleSafe:this.mapDef?.id==='S08'&&!!this.player&&this.player.x>=crystalSafeStart, frameMs: this.lastFrame }; }
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
        const freeMove=this.freeMovement();
        if(this.mapDef.river&&this.wasRiverSwimming&&!freeMove&&input.held('jump'))this.player.setVelocityY(-640);
        this.wasRiverSwimming=!!this.mapDef.river&&!!freeMove;
        body.setAllowGravity(!freeMove);
        if(this.mapDef.river)this.player.setDragY(freeMove?1800:0);
        if(freeMove&&this.player.y<120){this.player.setY(120);this.player.setVelocityY(Math.max(0,body.velocity.y));}
        if(input.held('jump')&&freeMove&&this.player.y>120)this.player.setVelocityY(-245);
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
        else {
            const carrying=[...this.deviceStates.values()].some(state=>state.carrying);
            this.player.setMaxVelocity(carrying?cargoSpeed(this.host.save):this.mapDef.id==='S23'&&!this.done('S23.quest.3')?195:300, 1000).setAccelerationX(move * 2200);
        }
        this.gliding=canGlide(this.host.save.treasures.includes('T03'),input.held('jump'),!!freeMove,body.blocked.down||body.touching.down,body.velocity.y);
        // Arcade adds gravity on its next fixed step. Its velocity cap, as
        // well as this immediate clamp, keeps the actual fall at <=180px/s.
        if(this.gliding){body.maxVelocity.y=glideFallSpeed;body.velocity.y=Math.min(body.velocity.y,glideFallSpeed);}
        this.player.setFlipX(this.direction < 0);
        this.flightPassenger?.setPosition(this.player.x+this.direction*3,this.player.y+10).setFlipX(this.direction<0);
        this.player.setAlpha(0);
        if (input.consume('cycle')&&this.mapDef.mode!=='flight') {
            const list = this.host.save.weapons;
            this.host.save.equippedWeapon = list[(list.indexOf(this.host.save.equippedWeapon) + 1) % list.length];
            this.showWeaponChange();
            this.host.persist();
            this.host.changed();
        }
        if (input.digits !== null) {
            const id = `W0${input.digits}` as WeaponId;
            if (this.mapDef.mode!=='flight'&&this.host.save.weapons.includes(id)) {
                this.host.save.equippedWeapon = id;
                this.showWeaponChange();
                this.host.persist();
                this.host.changed();
            }
            input.digits = null;
        }
        const primary=input.consume('primary');
        let nearby=this.nearbyObject();
        const primaryAttacks=primary&&this.actionAttacks(nearby);
        if ((input.consume('attack')||primaryAttacks) && !this.boom && !this.attack) {
            if(this.host.save.settings.aimAssist&&!move&&this.mapDef.mode!=='flight'){const target=this.closeThreat(true);if(target)this.direction=Math.sign(target.sprite.x-this.player.x)||this.direction;}
            const a = this.mapDef.mode==='flight'
                ? this.sim>=this.flightAttackReady?{id:++this.flightAttackId,weapon:'W01' as const,damage:22,combo:1}:null
                : this.combat.start(this.host.save, this.sim);
            if (a) {
                if(this.mapDef.mode==='flight')this.flightAttackReady=this.sim+420;
                this.attack = { ...a, start: this.sim, x: this.player.x, direction: this.direction };
                this.host.sound('attack');
                if (['W02','W05'].includes(a.weapon))
                    this.boom = this.add.image(this.player.x, this.player.y, a.weapon==='W05'?'arrow':'boomerang').setDisplaySize(a.weapon==='W05'?90:55,a.weapon==='W05'?40:55).setDepth(12);
            }
        }
        // Select the pose after starting/aiming the attack, so the first weapon
        // frame uses the same fist and facing as the character in this tick.
        this.updateHeroArt();
        this.updateFlightMountArt();
        this.updateAttack();
        this.updateFlame(dt);
        this.updateEnemies(dt);
        this.updateProjectiles(dt);
        this.updateEffects();
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
            if(obj.def.kind==='rocCore'){obj.sprite.setVisible(false);obj.label.setVisible(false);continue;}
            if(obj.def.flightRing&&!this.done(obj.def.id)&&Math.hypot((obj.def.x-this.player.x)/65,(obj.def.y-this.player.y)/80)<1)this.activate(obj.def);
            const done = this.done(obj.def.id);
            // Far-away captions are hidden so the screen is not a wall of labels on a phone.
            const close=Math.abs(obj.def.x-this.player.x)<(this.host.controlMode==='touch'?520:700);
            if(obj.def.flightRing){obj.sprite.setVisible(!done);obj.label.setVisible(!done&&close);}
            else obj.label.setVisible(close);
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
        this.updateStory(dt);
        nearby=this.nearbyObject();
        const hint = nearby ? `Space 행동 · ${nearby.def.label}` : freeMove ? '← → 이동  ·  ↑ 상승  ↓ 하강  ·  Space 행동' : '← → 이동  ·  ↑ 점프  ·  Space 행동';
        if (hint !== this.latestHint) {
            this.hint.setText(hint);
            this.latestHint = hint;
        }
        this.declutterLabels();
        this.reportAction(nearby);
        if ((input.consume('interact')||(primary&&!primaryAttacks)) && nearby)
            this.interact(nearby.def);
        // Give a falling child a generous visible recovery window before
        // returning to the last safe deck. This also avoids a one-frame
        // instant reset when the camera or browser is under load.
        if (this.player.y > 1020) {
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
        if(this.backdrop){const span=Math.max(1,this.mapDef.width-1280);const t=Phaser.Math.Clamp(this.cameras.main.scrollX/span,0,1);this.backdrop.setX(720-160*t);}
        if(this.sim-this.hurtAt<220)this.heroArt?.setTint(0xff9d8f);
    }
    private flightArtSnapshot(){
        const view=(image:Phaser.GameObjects.Image)=>({texture:image.texture.key,frame:Number(image.frame.name),x:image.x,y:image.y,originX:image.originX,originY:image.originY,displayWidth:image.displayWidth,displayHeight:image.displayHeight,flipX:image.flipX});
        return this.flightMount?{mount:view(this.flightMount),rider:this.heroArt?view(this.heroArt):null,passenger:this.flightPassenger?view(this.flightPassenger):null}:null;
    }
    private updateFlightMountArt(){
        if(!this.flightMount)return;
        const flipX=this.direction<0;
        if(this.flightMount.texture.key!=='roc-actions'){
            this.flightMount.setPosition(this.player.x,this.player.y+15).setFlipX(flipX).setDisplaySize(240,160+Math.sin(this.sim/160)*12);return;
        }
        const frame=rocFlightFrame(this.sim,this.attack?this.sim-this.attack.start:null,this.host.save.settings.reducedMotion);
        const layout=rocFlightLayout(frame,flipX);
        this.flightMount.setFrame(frame).setFlipX(flipX).setDisplaySize(layout.displaySize,layout.displaySize)
            .setOrigin(layout.originX,layout.originY).setPosition(this.player.x+this.direction*36,this.player.y+10);
    }
    celebrate() { this.joyfulUntil=this.sim+1000; if(this.heroArt?.active)this.updateHeroArt(); }
    private updateHeroArt(){
        const body=this.player.body as Phaser.Physics.Arcade.Body;
        const reduced=this.host.save.settings.reducedMotion;
        const grounded=body.blocked.down||body.touching.down;
        const freeMove=this.freeMovement();
        const move=Number(this.host.input.held('right'))-Number(this.host.input.held('left'));
        const facing=this.attack?.direction??this.direction;
        if(grounded)this.lastGroundY=body.bottom;
        const attackAge=this.attack?this.sim-this.attack.start:Infinity;
        const hurtAge=this.sim-this.hurtAt;
        const joyful=this.sim<this.joyfulUntil;
        const running=!!move&&grounded&&!this.attack&&hurtAge>=280&&!joyful&&this.textures.exists('hero-run')&&!reduced;
        const hasAction=this.textures.exists('hero-action')&&!this.flightMount;
        const frame=running?Math.floor(this.sim/95)%6:hasAction?actionFrame(attackAge,hurtAge,joyful,!grounded&&!freeMove,body.velocity.y,this.sim,reduced):-1;
        const texture=running?'hero-run':hasAction?'hero-action':'hero-webtoon';
        const baseline=running?[498,498,498,474,469,470][frame]:hasAction?heroActionCells[frame].baseline:512;
        const bounce=reduced||!grounded||this.attack||hurtAge<280?0:running?Math.abs(Math.sin(this.sim/95))*5:Math.sin(this.sim/400)*1.5;
        const lunge=reduced||this.flightMount?0:attackAge<240?Math.sin(attackAge/240*Math.PI)*14*facing:0;
        const recoil=reduced?0:hurtAge<280?-facing*Math.sin(hurtAge/280*Math.PI)*12:0;
        this.heroArt?.setTexture(texture,frame>=0?frame:undefined).setDisplaySize(frame>=0?heroDisplaySize:96,frame>=0?heroDisplaySize:132).setOrigin(.5,baseline/512).setPosition(this.player.x+lunge+recoil,this.player.y+64-bounce).setFlipX(facing<0).setAlpha(this.sim<this.invulnerableUntil?.65:1).setAngle(0);
        if(this.flightMount)this.heroArt?.setDisplaySize(86,110).setPosition(this.player.x+this.direction*36,this.player.y+10);
        const lift=Math.max(0,this.lastGroundY-body.bottom);
        this.heroShadow?.setVisible(!freeMove&&!this.flightMount).setPosition(this.player.x,this.lastGroundY-2).setScale(Phaser.Math.Clamp(1-lift/360,.35,1));
        if(this.companion){const rescued=this.mapDef.id!=='S32'||this.done('S32.quest.4');this.companion.setVisible(rescued).setPosition(this.player.x-this.direction*70,this.player.y+64-bounce*.7).setFlipX(this.direction<0);}
    }
    // Captions are drawn large on phones, so neighbours would pile on top of
    // each other. Enemy warnings win, then the captions closest to the hero;
    // anything that would overlap an already shown caption waits its turn.
    private declutterLabels(){
        const shown:Phaser.Geom.Rectangle[]=[];
        // Screen-fixed banners claim their space first (converted to world space).
        const camera=this.cameras.main;
        for(const banner of [this.journey,this.bossText])if(banner.visible&&banner.text){const box=banner.getBounds();box.x+=camera.scrollX;box.y+=camera.scrollY;shown.push(box);}
        const keep=(label:Phaser.GameObjects.Text)=>{
            if(!label.visible||!label.text)return;
            const box=label.getBounds();
            Phaser.Geom.Rectangle.Inflate(box,4,2);
            if(shown.some(other=>Phaser.Geom.Rectangle.Overlaps(other,box)))label.setVisible(false);
            else shown.push(box);
        };
        for(const e of this.enemies)if(e.state==='telegraph'||e.state==='attack')keep(e.label);
        const byDistance=[...this.objects].sort((a,b)=>Math.abs(a.def.x-this.player.x)-Math.abs(b.def.x-this.player.x));
        for(const o of byDistance)keep(o.label);
        for(const e of this.enemies)if(e.state!=='telegraph'&&e.state!=='attack')keep(e.label);
    }
    // Locked gates are a column of drifting light instead of a flat bar:
    // coral pink for keys, starlight for the crystal gates.
    private barrierTexture(kind:string){
        const key=`barrier-${kind}`;
        if(this.textures.exists(key))return key;
        const [base,light]=kind==='gate'?[0xd77f98,0xffd6e0]:[0x8f86d8,0xf3ecff];
        const g=this.make.graphics({x:0,y:0},false);
        g.fillStyle(base,.35).fillRect(0,0,44,64);
        g.fillStyle(base,.55).fillRect(14,0,16,64);
        g.fillStyle(light,.8).fillRect(20,0,4,64);
        for(const [x,y,r] of [[10,12,3],[33,30,2],[16,50,2.5],[28,6,1.5]])g.fillStyle(light,.9).fillCircle(x,y,r);
        g.generateTexture(key,44,64);g.destroy();
        return key;
    }
    private nearbyObject(){
        return this.objects.filter(o=>!o.def.flightRing&&o.def.kind!=='rocCore'&&o.def.kind!=='checkpoint'&&!(['S26.raftWood','S26.raftRope'].includes(o.def.id)&&this.done(o.def.id))&&Math.abs(o.def.x-this.player.x)<90&&Math.abs(o.def.y-this.player.y)<95).sort((a,b)=>Math.abs(a.def.x-this.player.x)-Math.abs(b.def.x-this.player.x))[0];
    }
    // An enemy close enough that the action button should swing at it: one
    // that is winding up or striking. `any` also accepts calm enemies, for
    // turning toward the nearest target.
    private closeThreat(any=false){
        const shellsDone=[1,2,3].every(n=>this.done(`S02.shell.${n}`));
        return this.enemies.filter(e=>e.state!=='defeated'&&e.sprite.visible&&(any||e.state==='telegraph'||e.state==='attack')&&!(e.def.kind==='siren'&&!shellsDone)&&Math.abs(e.sprite.x-this.player.x)<(any?220:180)&&Math.abs(e.sprite.y-this.player.y)<130).sort((a,b)=>Math.abs(a.sprite.x-this.player.x)-Math.abs(b.sprite.x-this.player.x))[0];
    }
    // The single touch action button talks or uses what is in reach. It swings
    // instead when the thing in reach is a target, when an enemy beside the
    // hero is winding up, or when the friend in reach was already talked to
    // and an enemy is near (otherwise the same hint would reopen forever).
    // Story steps, gifts and exits always win; flight keeps its own rules.
    private actionAttacks(nearby:Stage['objects'][number]|undefined){
        if(!nearby)return true;
        const def=nearby.def;
        if(def.kind==='shell'||def.kind==='remote'||def.breakWeapon)return true;
        if(this.mapDef.mode==='flight')return false;
        const mustInteract=!!def.mechanic||['exit','ending','rescue','crisis','rope','gift','raft','bridge'].includes(def.kind);
        if(mustInteract&&!this.done(def.id))return false;
        if(this.closeThreat())return true;
        return this.done(def.id)&&['npc','truthGift','flameGift','journal','vision'].includes(def.kind)&&!!this.closeThreat(true);
    }
    private reportAction(nearby:Stage['objects'][number]|undefined){
        const kind=this.actionAttacks(nearby)?'attack':['exit','ending'].includes(nearby!.def.kind)?'exit':['npc','rescue','truthGift','flameGift','gift','descent','crisis'].includes(nearby!.def.kind)?'talk':'use';
        const label=kind==='attack'?'':(nearby?.def.label??'').replace(/ · E$/,'');
        const key=`${kind}|${label}`;
        if(key===this.actionKey)return;
        this.actionKey=key;
        this.host.context({kind,label});
    }
    private showWeaponChange(){
        const id=this.host.save.equippedWeapon;
        const texture=availableWeaponTexture(id,key=>this.textures.exists(key));
        if(!texture)return;
        const look=weaponLooks[id];
        const icon=this.add.image(this.player.x,this.player.y-96,texture).setDisplaySize(look.style==='draw'?36:look.width*.7,look.style==='draw'?72:look.height*.7).setDepth(14).setAngle(look.style==='draw'?0:-35);
        this.tweens.add({targets:icon,y:icon.y-26,alpha:0,duration:this.host.save.settings.reducedMotion?0:700,delay:250,onComplete:()=>icon.destroy()});
    }
    resetMirrors(){
        if(this.mapDef.id!=='S08'||this.stopped)return;
        if(this.done('S08.light')){this.host.notice('완성한 빛 연결과 보물은 그대로 유지돼요.');return;}
        this.mirrorDirections=[0,0,0];this.host.notice('거울을 모두 ↑ 방향으로 초기화했어요.');
    }
    private deviceState(id:string){
        let state=this.deviceStates.get(id);
        if(!state){state={value:0,elapsed:0,active:false,carrying:false};this.deviceStates.set(id,state);}
        return state;
    }
    private updateStory(dt:number){
        this.storyFx.clear();
        for(const object of this.objects){
            const mechanic=object.def.mechanic;
            if(!mechanic||this.done(object.def.id))continue;
            const state=this.deviceState(object.def.id);
            if(mechanic.type==='rotate'){
                object.label.setText(`${mechanic.symbol} ${deviceDirections[state.value]} → ${deviceDirections[mechanic.target]} · 행동`);
                object.sprite.setRotation(state.value*Math.PI/2);
            }
            if(mechanic.type==='carry'&&state.carrying){
                object.sprite.setPosition(this.player.x,this.player.y-80);
                object.label.setPosition(object.def.x,object.def.y-70).setText('↓ 배달 위치 · 행동');
                this.storyFx.lineStyle(3,0xffe1a0,.8).strokeEllipse(object.def.x,596,90,18);
            }
            if((mechanic.type==='channel'||mechanic.type==='treasure')&&state.active){
                if(object.def.id==='S25.quest.4'){
                    object.label.setText('↑ 점프 → 달빛 다리 위의 오른쪽 빛으로');
                    const feet=(this.player.body as Phaser.Physics.Arcade.Body).bottom;
                    this.storyFx.lineStyle(4,0xffe6ab,.9).strokeCircle(object.def.x+250,495,18);
                    if(this.bridgeBody&&this.sim<this.bridgeUntil&&this.player.x>object.def.x+210&&this.player.x<object.def.x+305&&Math.abs(feet-512)<12){state.active=false;this.activate(object.def);}
                    continue;
                }
                const duration=mechanic.type==='channel'?mechanic.duration:900;
                const near=Math.abs(object.def.x-this.player.x)<100&&Math.abs(object.def.y-this.player.y)<180;
                const progress=channelProgress(state.elapsed,dt,near,duration);state.elapsed=progress.next;
                object.label.setText(`${mechanic.symbol} · ${Math.round(state.elapsed/duration*100)}% · 가까이 머무르기`);
                this.storyFx.lineStyle(5,0xffe6ab,.9).beginPath().arc(object.def.x,object.def.y,48,-Math.PI/2,-Math.PI/2+state.elapsed/duration*Math.PI*2).strokePath();
                if(progress.complete){state.active=false;this.activate(object.def);}
                else if(!near){state.active=false;this.host.notice('장치 가까이에서 행동을 누르면 다시 시작해요.');}
            }
        }
        if(this.bridgeBody){
            const onBridge=Math.abs(this.player.x-this.bridgeBody.x)<155&&Math.abs((this.player.body as Phaser.Physics.Arcade.Body).bottom-(this.bridgeBody.y-12))<12;
            if(onBridge)this.bridgeUntil=Math.max(this.bridgeUntil,this.sim+600);
            this.bridgeBody.setVisible(this.sim<this.bridgeUntil);
            (this.bridgeBody.body as Phaser.Physics.Arcade.StaticBody).enable=this.sim<this.bridgeUntil;
        }
        for(const hazard of this.mapDef.plantHazards??[]){
            if(hazard.clearedBy&&this.done(hazard.clearedBy))continue;
            const color=hazard.kind==='poison'?0x91e7ac:0xc5da86;
            this.storyFx.fillStyle(color,.25).fillEllipse(hazard.x+hazard.w/2,587,hazard.w,42);
            for(let i=0;i<5;i++){const x=hazard.x+15+i*(hazard.w-30)/4;this.storyFx.lineStyle(3,color,.75).lineBetween(x,606,x+Math.sin(this.sim/600+i)*10,570-(i%2)*14);}
            if(this.player.x>=hazard.x&&this.player.x<=hazard.x+hazard.w&&this.player.y>505&&this.sim>=this.plantReady&&this.sim>=this.invulnerableUntil){
                this.plantReady=this.sim+3000;
                if(hazard.kind==='poison'){this.poisonUntil=this.sim+poisonDuration(this.host.save);this.poisonTick=this.sim+1000;this.host.notice('독안개! 점프로 피하거나 장치를 정화하세요. 독만으로 쓰러지지 않아요.');}
                else this.hurt(plantDamage(this.host.save,8));
            }
        }
        if(this.sim<this.poisonUntil&&this.sim>=this.poisonTick&&this.sim>=this.invulnerableUntil){this.poisonTick=this.sim+1000;this.host.damage(3,'poison');this.host.changed();}
        if(this.sim<this.poisonUntil)this.heroArt?.setTint(0xb2ebbb);else this.heroArt?.clearTint();
        if(this.chef){
            const chef=this.chef;
            if(!chef.mark&&this.sim>=chef.next&&Math.abs(this.player.x-chef.sprite.x)<700){chef.mark={x:this.player.x,at:this.sim+1200};chef.label.setText('⚠ 국자 증기 · 옆으로 피하거나 점프');this.host.sound('warning');}
            if(chef.mark){
                this.storyFx.lineStyle(4,0xffd390,.9).strokeEllipse(chef.mark.x,581,160,100);
                if(this.sim>=chef.mark.at){
                    this.storyFx.fillStyle(0xffe9ba,.5).fillEllipse(chef.mark.x,566,160,125);
                    if(Math.abs(this.player.x-chef.mark.x)<80&&this.player.y>465)this.hurt(8);
                    chef.mark=undefined;chef.next=this.sim+6000;chef.label.setText('거인 요리사 · 국자 증기를 피하세요');
                }
            }
        }
        if(this.host.save.relics.includes('R05')&&this.mapDef.mode!=='flight'){
            const unopened=this.objects.filter(object=>['chest','golden'].includes(object.def.kind)&&!this.done(object.def.id)).sort((a,b)=>Math.abs(a.def.x-this.player.x)-Math.abs(b.def.x-this.player.x))[0];
            if(unopened)this.journey.setVisible(true).setText(`보물 지도 ${unopened.def.x>this.player.x?'→':'←'} · 미개봉 선택 보물 ${Math.round(Math.abs(unopened.def.x-this.player.x))}px`);
            else if(!['S04','S05','S06','S07','S08'].includes(this.mapDef.id))this.journey.setVisible(false);
        }
        if(this.host.save.relics.includes('R07')&&['S32','S33','S34','S35','S36'].includes(this.mapDef.id)&&this.sim>=this.friendshipAt){this.friendshipAt=this.sim+20000;this.host.hp=Math.min(maxHp(this.host.save),this.host.hp+10);this.host.changed();}
    }
    private storyInteract(def:ObjectDef){
        const mechanic=def.mechanic;if(!mechanic||this.done(def.id))return false;
        const state=this.deviceState(def.id);
        if(mechanic.type==='rotate'){
            const rotation=rotateDevice(state.value,mechanic.target);state.value=rotation.next;this.host.sound('reward');
            if(rotation.complete)this.activate(def);
            else this.host.notice(`${mechanic.symbol}: ${deviceDirections[state.value]} → 목표 ${deviceDirections[mechanic.target]} · 행동으로 회전`);
        }else if(mechanic.type==='carry'){
            if(!state.carrying){state.carrying=true;def.x+=mechanic.distance;this.host.notice('물건을 들었어요. 오른쪽 빛나는 배달 위치로 이동해 행동을 누르세요.');}
            else {state.carrying=false;const object=this.objects.find(object=>object.def.id===def.id)!;object.sprite.setPosition(def.x,def.y);this.activate(def);}
        }else if(mechanic.type==='memory'){
            this.activate(def);this.host.notice(mechanic.text);
        }else {
            if(mechanic.type==='treasure'&&!treasureTrialAllowed(this.host.save,mechanic.item)){this.host.notice(`${mechanic.item}의 원래 획득 항로를 지도에서 다시 방문하세요.`);return true;}
            state.active=true;
            if(def.id==='S25.quest.4'){this.createMoonBridge(def.x);this.host.notice('↑ 점프로 다리에 올라 → 오른쪽 빛까지 이동하세요. 다리 위에 서면 12초 제한이 유지돼요.');return true;}
            this.host.notice(`${mechanic.symbol} · 빛이 완성될 때까지 가까이 머무르세요.`);
            if(mechanic.type==='treasure'){
                if(mechanic.item==='T03')this.player.setVelocityY(-570);
                if(mechanic.item==='T05')this.createMoonBridge(def.x);
                if(mechanic.item==='T06')this.invulnerableUntil=this.sim+2200;
                if(mechanic.item==='T01'||mechanic.item==='T07')this.pulse={x:def.x,y:def.y,direction:1,damage:20,until:this.sim+650,hits:new Set()};
            }
        }
        return true;
    }
    private createMoonBridge(x:number){
        const top=this.mapDef.river?560:512;
        this.bridgeUntil=this.sim+12000;
        if(!this.bridgeBody){this.bridgeBody=this.add.rectangle(x+160,top+12,300,24,0xb9def2,.75).setStrokeStyle(3,0xffe8af).setDepth(3);this.land.add(this.bridgeBody);const body=this.bridgeBody.body as Phaser.Physics.Arcade.StaticBody;body.checkCollision.left=false;body.checkCollision.right=false;body.checkCollision.down=false;}
        else {this.bridgeBody.setPosition(x+160,top+12);(this.bridgeBody.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();}
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
    private createRiver(checkpointId:string){
        const g=this.make.graphics({x:0,y:0});
        if(!this.textures.exists('river-raft')){
            g.fillStyle(0x152c40,.5).fillEllipse(130,26,260,32);
            for(let i=0;i<6;i++)g.fillStyle(i%2?0x9e754b:0xb68c58).fillRoundedRect(8+i*41,2,40,26,9);
            g.lineStyle(5,0xe6cc95).lineBetween(30,3,30,28).lineBetween(228,3,228,28);
            g.generateTexture('river-raft',260,40);
        }g.destroy();
        const x=checkpointId==='middle'?riverRoute.middle:riverRoute.start;
        const rect=this.add.rectangle(x,riverRoute.top+12,riverRoute.width,24,0,0);
        this.physics.add.existing(rect);const body=rect.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false).setImmovable(true);body.checkCollision.left=false;body.checkCollision.right=false;body.checkCollision.down=false;
        body.friction.x=0;
        const art=this.add.image(x,riverRoute.top+12,'river-raft').setDepth(3);
        const label=this.txt(x,riverRoute.top+42,'뗏목 · ↑ 올라타기 / ↓ 수영',{fontSize:'16px',color:'#fff1c8',backgroundColor:'#183d50',padding:{x:6,y:3}}).setOrigin(.5).setDepth(12);
        this.riverRaft={rect,body,art,label,riding:false};
        this.physics.add.collider(this.player,rect,undefined,()=>raftPrepared(this.host.save)&&!this.host.input.held('down')&&(this.player.body as Phaser.Physics.Arcade.Body).bottom<=riverRoute.top+20);
        for(const [id,x] of [['S26.quest.1',1150],['S26.quest.2',1720]] as const){
            const rect=this.add.rectangle(x,484,32,248,0,0);this.land.add(rect);
            const glow=this.add.tileSprite(x,484,38,248,this.barrierTexture('gate')).setDepth(3);
            this.doors.push({id,rect,glow,returnOnly:checkpointId==='middle'&&x<riverRoute.middle});
        }
        this.add.rectangle(1570,420,360,840,0x243d5a,.12).setDepth(-8);
        this.add.rectangle(1570,450,2180,2,0xa3e0e2,.8).setDepth(4);
        this.txt(720,335,'낮은 천장 · 점프 대신 뗏목으로',{fontSize:'17px',color:'#fff1c8'}).setDepth(5);
        this.txt(1760,572,'↓ 수중 옆동굴\n← 같은 입구로 복귀',{fontSize:'16px',color:'#d6ffff',backgroundColor:'#163c52',padding:{x:5,y:3}}).setDepth(5);
        this.txt(2320,350,'↑ 선택 금화방 · 막다른 길\n↓ 별 지도 출구 →',{fontSize:'16px',color:'#fff1c8',backgroundColor:'#163c52',padding:{x:5,y:3}}).setDepth(5);
    }
    private updateRiver(dt:number){
        const raft=this.riverRaft!,body=this.player.body as Phaser.Physics.Arcade.Body;
        const ready=raftPrepared(this.host.save);
        raft.body.enable=ready;raft.art.setVisible(ready);raft.label.setVisible(ready&&Math.abs(raft.rect.x-this.player.x)<600);
        raft.riding=ready&&!this.host.input.held('down')&&Math.abs(body.bottom-riverRoute.top)<12&&Math.abs(this.player.x-raft.rect.x)<riverRoute.width/2+12&&body.velocity.y>=0;
        const next=advanceRaft(raft.rect.x,riverStop(this.host.save),dt,raft.riding);
        // A rock shelf may also support the feet. Carry once explicitly so
        // Arcade choosing that static contact cannot leave the rider behind.
        if(raft.riding){body.position.x+=next-raft.rect.x;body.updateCenter();}
        raft.body.setVelocityX((next-raft.rect.x)/Math.max(dt,1)*1000);
        raft.art.setPosition(raft.rect.x,riverRoute.top+12);raft.label.setX(raft.rect.x);
        for(const door of this.doors.filter(d=>d.id.startsWith('S26.quest.'))){
            if(door.returnOnly&&this.player.x<door.rect.x-60)door.returnOnly=false;
            const open=this.done(door.id)||!!door.returnOnly;
            (door.rect.body as Phaser.Physics.Arcade.StaticBody).enable=!open;
            door.glow.setVisible(!open);
        }
    }
    private updateAdventure(dt:number) {
        if(this.mapDef.river)this.updateRiver(dt);
        if(this.mapDef.mode==='flight')this.updateFlight();
        if(this.mapDef.id==='S07'){
            if(this.done('S07.wave.3')&&this.sinkAt===null)this.sinkAt=this.sim;
            for(const p of this.moving){p.body.setVelocity((movingPlatformX(p.def,this.sim)+p.def.w/2-p.rect.x)/Math.max(dt,1)*1000,(movingPlatformY(p.def,this.sim)+(p.def.x>=2600&&p.def.x<3300&&this.sinkAt!==null?Math.min(32,(this.sim-this.sinkAt)/3000*32):0)+p.def.h/2-p.rect.y)/Math.max(dt,1)*1000);p.top.setPosition(p.rect.x,p.rect.y-p.def.h/2+13);this.skins.get(p.rect)?.setPosition(p.rect.x,p.rect.y);}
            this.updateWaves();
        }
        if(this.mapDef.id==='S06')this.journey.setText(this.host.save.treasures.includes('T01')?'영원의 불씨 · R 파동 / E 무료 점화 · 입구 덩굴을 다시 살펴보세요':`화로 ${[1,2,3].filter(n=>this.done('S06.furnace.'+n)).length}/3 · 진정한 정령 ${[1,2,3,4,5].filter(n=>this.done('S06.enemy.spirit.'+n)).length}/5`);
        if(this.mapDef.id==='S04'){
            const count=rescueEquipment.filter(id=>this.done(id)).length;
            if(count===3 && this.wakeAt===null){this.wakeAt=this.sim+2400;this.host.notice('⚠ 고래가 깨어나요! 잠시 뒤 발판이 천천히 오르내려요. 시간 제한은 없어요.');}
            this.journey.setText(`구명 장비 ${count} / 3${this.wakeAt===null?' · 고래를 공격하지 마세요':this.sim<this.wakeAt?' · ⚠ 발판이 곧 움직여요':' · 움직이는 등을 지나 구조 보트로'}`);
            for(const p of this.moving){const desired=movingPlatformY(p.def,this.wakeAt===null?0:this.sim-this.wakeAt);p.body.setVelocityY((desired+p.def.h/2-p.rect.y)/Math.max(dt,1)*1000);p.top.setPosition(p.rect.x,p.rect.y-p.def.h/2+13);this.skins.get(p.rect)?.setPosition(p.rect.x,p.rect.y);}
        }
        for(const d of this.doors){
            if(!this.done(d.id)){if(!this.host.save.settings.reducedMotion)d.glow.tilePositionY-=dt*.06;continue;}
            (d.rect.body as Phaser.Physics.Arcade.StaticBody).enable=false;d.rect.setVisible(false);
            // An opened gate fades out once instead of vanishing.
            if(d.glow.visible&&!d.glow.getData('opening')){d.glow.setData('opening',true);this.tweens.add({targets:d.glow,alpha:0,duration:this.host.save.settings.reducedMotion?0:400,onComplete:()=>d.glow.setVisible(false)});}
        }
        this.bubble.clear();
        const wet=(this.mapDef.water??[]).some(w=>this.player.x>w.x&&this.player.x<w.x+w.w&&this.player.y>w.y+18&&this.player.y<w.y+w.h);
        this.submerged=wet;
        if(wet){
            if(canBreatheUnderwater(this.host.save)){this.air=10000;this.bubble.lineStyle(3,0xbceff0,.8).strokeEllipse(this.player.x,this.player.y,104,142);}
            else{this.air=Math.max(0,this.air-dt);if(this.air===0&&this.sim>=this.waterTick){this.waterTick=this.sim+1600;this.hurt(12);}}
        }else this.air=10000;
        if(this.mapDef.id==='S05')this.journey.setText(wet?(canBreatheUnderwater(this.host.save)?'○ 공기방울 보호 · 숨 쉬기 가능 / 자유 수영 아님':`숨 ${Math.ceil(this.air/1000)}초 · 물 밖으로 나가세요`):this.done('S05.rescue')?'나이라 구출 완료 · 선택 산호방과 바닷길이 열렸어요':'열쇠 → 왕관 장식 → 산호문 → 나이라');
    }
    private updateFlight(){
        const middle=this.mapDef.checkpoints.find(checkpoint=>checkpoint.id==='middle');
        if(middle&&this.player.x>=middle.x&&this.host.save.checkpoint.checkpointId==='start'){
            this.checkpoint('middle');
            this.host.notice('하늘 쉼터에 저장했어요. 여기서 안전하게 이어갈 수 있어요.');
        }
        for(const hazard of this.flightHazards){
            const {def,sprite,label}=hazard;
            if(def.kind==='debris')sprite.y=120+((this.sim*.085+def.y*1.7)%410);
            else sprite.y=def.y+Math.sin(this.sim/420+def.x)*14;
            const pulse=1+Math.sin(this.sim/180+def.x)*.04;
            sprite.setScale((def.kind==='gust'?.95:.7)*pulse).setRotation(def.kind==='debris'?Math.sin(this.sim/500+def.x)*.16:0);
            label.setPosition(sprite.x,Phaser.Math.Clamp(sprite.y+def.radius+16,170,570)).setAlpha(.78+.2*Math.sin(this.sim/260+def.x)).setVisible(Math.abs(this.player.x-sprite.x)<440);
            if(this.sim>=this.invulnerableUntil&&Math.abs(this.player.x-sprite.x)<def.radius+28&&Math.abs(this.player.y-sprite.y)<def.radius){
                this.hurt(8);
                this.player.setVelocityX(-190).setVelocityY(this.player.y<sprite.y?-170:170);
                if(this.sim>=this.hazardNoticeAt){this.hazardNoticeAt=this.sim+1800;this.host.notice(def.kind==='gust'?'돌풍에 밀렸어요. 위나 아래의 넓은 길로 가세요.':'파편에 스쳤어요. 빛나는 예고선을 보고 피하세요.');}
            }
        }
        const rings=this.mapDef.objects.filter(object=>object.flightRing);
        const collected=rings.filter(ring=>this.done(ring.id)).length;
        const calmed=this.enemies.filter(enemy=>enemy.def.kind==='kite'&&enemy.state==='defeated').length;
        this.journey.setText(`선택 고리 ${collected}/${rings.length} · 연 ${calmed}/${this.enemies.filter(enemy=>enemy.def.kind==='kite').length} · Space 날개 공격 · 오른쪽 착륙장`);
    }
    private checkpoint(id: string) { this.host.save.checkpoint = { stageId: this.mapDef.id, checkpointId: id }; this.host.persist(); this.host.changed(); }
    private hurt(base: number, element: 'normal' | 'lightning' = 'normal') { if ((this.mapDef.id==='S08'&&this.player.x>=crystalSafeStart)||this.sim < this.invulnerableUntil)
        return; this.hurtAt=this.sim; if(!this.host.save.settings.reducedMotion)this.cameras.main.shake(110,.004); const died = this.host.damage(base, element); this.invulnerableUntil = this.sim + (this.host.save.settings.difficulty === 'relaxed' ? 1500 : 1000); this.host.sound('hurt'); if (died) {
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
            if(this.mapDef.mode==='flight'){this.host.notice('비행 중에는 로크새의 날개 공격을 사용해요.');return;}
            const skill=this.host.save.equippedSkill;
            if(skill==='moonBridge'&&this.host.save.treasures.includes('T05')&&this.host.mp>=12&&this.sim>=this.flameReady){this.host.mp-=12;this.flameReady=this.sim+3000;this.createMoonBridge(this.player.x);this.flameUsed=this.sim;this.host.notice('달빛 다리가 12초 동안 이어져요.');this.host.changed();}
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
    private damageEnemy(e:Enemy,damage:number,coreStrike=false){
        if(e.state==='defeated')return;
        if(e.def.id===rocBossId){
            if(!coreStrike||!rocCoreOpen(e.state,!!e.coreStruck,this.host.save.treasures.includes('T02')))return;
            e.coreStruck=true;damage=1;
            const broken=rocCoresBroken(this.host.save);
            // The final core and boss reward are one saved transaction below.
            if(broken<2)this.host.reward(rocCoreReward(broken));
        }
        if(e.def.id==='S31.enemy.3'&&(!this.done('S31.quest.1')||!this.done('S31.quest.2'))){e.label.setText('봉인석 두 개를 먼저 정화하세요');return;}
        e.hp=Math.max(0,e.hp-damage);e.sprite.setTintFill(0xfff4d6);this.time.delayedCall(70,()=>{if(e.state!=='defeated'&&e.sprite.active)e.sprite.setTint(0xffefb0);});this.hitPop(e,damage);
        if(e.hp===0){e.state='defeated';const defeat=e.def.actionArt?actionDefeatKind(e.def.actionArt):undefined;const human=defeat?defeat==='human':['bandit','captain','archer'].includes(e.def.kind)||(this.mapDef.id==='S18'&&e.def.kind==='boss');const animal=defeat?defeat==='animal':['siren','crab','bat','beast'].includes(e.def.kind)||['S09','S12','S21','S22'].includes(this.mapDef.id);e.label.setText(human?'항복했어요':animal?'저주가 풀렸어!':'빛으로 돌아갔어요');this.defeatEffect(e,human,animal);
            const boss=['captain','siren','boss'].includes(e.def.kind);
            if(boss){this.projectiles.forEach(p=>{p.sprite.destroy();p.glyph?.destroy();});this.projectiles=[];}
            const bossCheckpoint=this.mapDef.checkpoints.some(checkpoint=>checkpoint.id==='boss')?'boss':this.mapDef.checkpoints.at(-1)!.id;
            this.host.reward(e.def.id===rocBossId?rocCoreReward(2):{id:e.def.id,xp:e.def.kind==='captain'?30:e.def.kind==='siren'?50:6,coins:3,objectives:boss||this.mapDef.id==='S06'?[e.def.id]:[],checkpoint:boss?{stageId:this.mapDef.id,checkpointId:bossCheckpoint}:undefined});
            if(e.def.kind==='siren'){this.projectiles.forEach(p=>{p.sprite.destroy();p.glyph?.destroy();});this.projectiles=[];this.host.dialogue('freed',()=>{});}
        }
        this.host.changed();
    }
    // Damage number and a small star burst where the blow landed.
    private hitPop(e:Enemy,damage:number){
        const top=e.sprite.y-(e.bodyHeight??e.sprite.displayHeight)*.42;
        const number=this.txt(e.sprite.x,top,`${damage}`,{fontSize:'26px',fontStyle:'bold',color:'#ffe27a',stroke:'#3a2318',strokeThickness:5}).setOrigin(.5).setDepth(15);
        this.tweens.add({targets:number,y:top-46,alpha:0,duration:650,ease:'Quad.easeOut',onComplete:()=>number.destroy()});
        if(this.host.save.settings.reducedMotion)return;
        const x=e.sprite.x-Math.sign(e.sprite.x-this.player.x)*24,y=e.sprite.y-10;
        if(!this.playEffect('effect-hit-spark',x,y)){
            const spark=this.add.star(x,y,6,8,26,0xfff1b8).setDepth(14).setAlpha(.95);
            this.tweens.add({targets:spark,scale:1.6,alpha:0,angle:45,duration:180,onComplete:()=>spark.destroy()});
        }
        this.cameras.main.shake(60,.0018);
    }
    private playEffect(key:EffectArtKey,x:number,y:number){
        if(this.host.save.settings.reducedMotion||!this.textures.exists(key))return false;
        // Bound only the visual pool; no combat or reward state depends on it.
        if(this.effects.length>=24)this.effects.shift()!.sprite.destroy();
        const sprite=this.add.sprite(x,y,key,0).setDisplaySize(128,128).setDepth(14);
        this.effects.push({sprite,start:this.sim,duration:effectDuration[key]});
        return true;
    }
    private updateEffects(){
        if(this.host.save.settings.reducedMotion){this.effects.forEach(effect=>effect.sprite.destroy());this.effects=[];return;}
        for(const effect of this.effects){
            const age=this.sim-effect.start;
            if(age>=effect.duration)effect.sprite.destroy();
            else effect.sprite.setFrame(effectFrame(age,effect.duration));
        }
        this.effects=this.effects.filter(effect=>effect.sprite.active);
    }
    private setEnemyPose(e:Enemy){
        if(!e.art)return;
        const layout=enemyActionLayout(e.art,e.state,e.bodyHeight!,e.footOffset!);
        // Phaser mirrors frame coordinates: mirror the measured origin too so
        // the sail stays on the unchanged flight target when facing left.
        const originX=e.sprite.flipX?1-layout.originX:layout.originX;
        e.sprite.setFrame(layout.frame).setDisplaySize(layout.displaySize,layout.displaySize).setOrigin(originX,layout.originY);
        e.bodyWidth=layout.bodyWidth;
    }
    private defeatEffect(e:Enemy,human:boolean,animal:boolean){
        this.tweens.killTweensOf(e.sprite);
        this.setEnemyPose(e);
        e.sprite.clearTint();
        if(human){this.playEffect('effect-surrender-flag',e.sprite.x,e.sprite.y-48);this.tweens.add({targets:e.sprite,alpha:.8,duration:this.host.save.settings.reducedMotion?0:260});return;}
        const color=e.def.kind==='boss'?0xffe5a4:0x9eeadd;
        if(!this.playEffect('effect-purify-light',e.sprite.x,e.sprite.y-24)&&!this.host.save.settings.reducedMotion)for(let i=0;i<9;i++){const mote=this.add.circle(e.sprite.x,e.sprite.y,3+(i%3),color,.9).setDepth(8);this.tweens.add({targets:mote,x:e.sprite.x+Math.cos(i*.7)*55,y:e.sprite.y-30-Math.sin(i*.8)*50,alpha:0,scale:1.8,duration:500+i*45,onComplete:()=>mote.destroy()});}
        const hold=e.art?(animal?900:300):0;
        this.tweens.add({targets:e.sprite,alpha:0,scaleX:e.sprite.scaleX*1.25,scaleY:e.sprite.scaleY*1.25,y:e.sprite.y-25,delay:hold,duration:this.host.save.settings.reducedMotion?0:520,onComplete:()=>e.sprite.setVisible(false)});
        this.tweens.add({targets:e.label,alpha:0,delay:hold+650,duration:350,onComplete:()=>e.label.setVisible(false)});
    }
    private updateAttack() {
        this.slash.clear();
        if (!this.attack){
            this.weaponArt?.setVisible(false);
            return;
        }
        const a = this.attack;
        const age = this.sim - a.start;
        this.drawWeapon(a.weapon,age,a.direction);
        if (['W02','W05'].includes(a.weapon) && this.boom) {
            const phase = age < 600 ? 'out' : 'return';
            const duration=a.weapon==='W02'?1200:700;const distance=a.weapon==='W05'?650:a.weapon==='W04'?520:380;
            const t = Math.min(age / duration, 1);
            const x = a.weapon==='W02'?(t < 0.5 ? a.x + a.direction * distance * t * 2 : Phaser.Math.Linear(a.x + a.direction * distance, this.player.x, (t - 0.5) * 2)):a.x+a.direction*distance*t;
            this.boom.setPosition(x, this.player.y - 4).setRotation(a.weapon==='W02'?age/85:a.direction>0?0:Math.PI);
            if(!this.host.save.settings.reducedMotion)this.slash.fillStyle(weaponLooks[a.weapon].trail,.35).fillEllipse(x-a.direction*26,this.player.y-4,44,10);
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
            if(this.mapDef.mode==='flight'){
                // The roc's wing gust keeps its own wide teal sweep.
                this.slash.lineStyle(13,0xa8f2ed,.85).beginPath().arc(this.player.x,this.player.y,100,a.direction>0?-0.9:Math.PI-0.9,a.direction>0?0.9:Math.PI+0.9).strokePath();
            }
            if(a.weapon==='W06')this.slash.lineStyle(4,0xdbccff,.7).strokeCircle(x,this.player.y+40,35+age/8);
            this.hitAt(x, this.player.y, a.weapon==='W04'?130:a.weapon==='W06'?105:a.weapon==='W03'?85:90, 90, a, 'melee');
        }
        if (age > 280)
            this.attack = null;
    }
    // Shows the equipped weapon in the hero's hand for the length of the swing
    // and paints a crescent trail behind the blade. Purely visual: damage still
    // comes from the hit window above.
    private drawWeapon(id:WeaponId,age:number,direction:number){
        const art=this.weaponArt;
        if(!art)return;
        const look=weaponLooks[id];
        const flight=this.mapDef.mode==='flight';
        const visibleFor=look.style==='draw'?300:look.style==='throw'?110:260;
        const texture=availableWeaponTexture(id,key=>this.textures.exists(key));
        if(flight||age>visibleFor||!texture){art.setVisible(false);return;}
        const reduced=this.host.save.settings.reducedMotion;
        const pose=swingPose(look,reduced?1:age/200);
        if(this.heroArt?.texture.key!=='hero-action'){art.setVisible(false);return;}
        const hand=actionHand(Number(this.heroArt.frame.name),this.heroArt.x,this.heroArt.y,direction);
        const handX=hand.x;
        const handY=hand.y;
        art.setTexture(texture).setVisible(true).setDisplaySize(look.width,look.height).setOrigin(look.originX,.5).setPosition(handX,handY).setAlpha(age>visibleFor-60?Math.max(0,(visibleFor-age)/60):1);
        art.scaleX=Math.abs(art.scaleX)*direction;
        art.setAngle(direction>0?pose.angle:-pose.angle);
        if(reduced||look.style==='draw'||look.style==='throw')return;
        if(look.style==='thrust'){
            if(age>40&&age<220)this.slash.fillStyle(look.trail,.4).fillTriangle(handX+direction*look.width*.55,handY-12,handX+direction*(look.width*.95),handY,handX+direction*look.width*.55,handY+12);
            return;
        }
        // Crescent along the path the blade tip has travelled so far.
        const from=Phaser.Math.DegToRad(look.from),to=Phaser.Math.DegToRad(pose.angle);
        if(age<40||age>230||to<=from)return;
        const outer=look.width*.92,inner=outer-26,steps=10,points:Phaser.Types.Math.Vector2Like[]=[];
        const sweepStart=Math.max(from,to-1.9);
        for(let i=0;i<=steps;i++){const t=sweepStart+(to-sweepStart)*i/steps;points.push({x:handX+Math.cos(t)*outer*direction,y:handY+Math.sin(t)*outer});}
        for(let i=steps;i>=0;i--){const t=sweepStart+(to-sweepStart)*i/steps;const r=inner+(outer-inner)*(1-i/steps);points.push({x:handX+Math.cos(t)*r*direction,y:handY+Math.sin(t)*r});}
        this.slash.fillStyle(look.trail,.5*(1-Math.max(0,age-160)/70)).fillPoints(points,true);
    }
    private hitAt(x: number, y: number, width: number, height: number, a: NonNullable<Stage['attack']>, phase: string) {
        for (const e of this.enemies) {
            const core=e.def.id===rocBossId;
            const target=core?this.rocCore(e):{x:e.sprite.x,y:e.sprite.y};
            if (e.state === 'defeated' || Math.abs(target.x - x) > width || Math.abs(target.y - y) > height)
                continue;
            if (e.def.kind === 'siren' && ![1, 2, 3].every(n => this.done(`S02.shell.${n}`)))
                continue;
            if(e.def.kind==='guardian' && a.weapon!=='W07' && shieldBlocks(e.state,this.player.x,e.sprite.x,e.target)){e.label.setText('방패! 뒤나 빈틈을 노리세요');continue;}
            if (!this.combat.hit(a.id, e.def.id, phase))
                continue;
            this.damageEnemy(e,a.damage,core);
            if(a.weapon==='W03'&&e.hp>0&&!core)e.burn=ignite(this.sim,e.burn);
            if(e.hp>0&&!e.def.flightPath&&!['siren','captain'].includes(e.def.kind)&&e.def.kind!=='boss'){const push=a.direction*(a.weapon==='W06'?68:14);this.tweens.add({targets:e.sprite,x:Phaser.Math.Clamp(e.sprite.x+push,40,this.mapDef.width-40),duration:this.host.save.settings.reducedMotion?0:140,ease:'Quad.easeOut'});}
        }
        for (const o of this.objects) {
            if ((!['shell', 'remote'].includes(o.def.kind)&&!o.def.breakWeapon) || this.done(o.def.id) || Math.abs(o.def.x - x) > width || Math.abs(o.def.y - y) > height)
                continue;
            if(o.def.breakWeapon&&a.weapon!==o.def.breakWeapon){o.label.setText('달빛 방망이의 강한 충격이 필요해요');continue;}
            if (o.def.kind === 'remote' && a.weapon !== 'W02')
                continue;
            this.activate(o.def);
            if(o.def.breakWeapon)o.sprite.setVisible(false);
        }
    }
    private rocCore(e:Enemy){return {x:e.sprite.x+(e.sprite.flipX?-28:28),y:e.sprite.y-26};}
    private updateRoc(e:Enemy,dt:number){
        const pattern=rocPatterns[e.pattern];
        const distance=Math.abs(this.player.x-e.sprite.x);
        if(e.state==='idle'){
            e.sprite.x=Phaser.Math.Linear(e.sprite.x,e.def.x,Math.min(1,dt/160));e.sprite.y=e.def.y;e.sprite.clearTint();
            if(distance<520&&this.sim>=e.until){
                e.state='telegraph';e.until=this.sim+pattern.telegraph*(this.host.save.settings.difficulty==='relaxed'?1.3:1);
                e.target=Phaser.Math.Clamp(this.player.x,e.def.x-420,e.def.x+420);e.targetY=this.player.y;
                e.sprite.setFlipX(e.target<e.def.x);this.host.sound('warning');
            }
        }else if(e.state==='telegraph'){
            e.sprite.setTint(0xffc773);
            if(e.pattern===2){const duration=pattern.telegraph*(this.host.save.settings.difficulty==='relaxed'?1.3:1);e.sprite.y=e.def.y-160*(1-(e.until-this.sim)/duration);}
            if(this.sim>=e.until){e.state='attack';e.until=this.sim+pattern.attack;}
        }else if(e.state==='attack'){
            const progress=Phaser.Math.Clamp(1-(e.until-this.sim)/pattern.attack,0,1);
            if(e.pattern===2){e.sprite.x=Phaser.Math.Linear(e.def.x,e.target,progress);e.sprite.y=e.def.y-160*(1-progress);}
            const zone=rocZone(e.pattern,e.def.x,e.target);
            // A dive hurts at landing; its whole warning is safe to leave.
            // Leave enough time after the wind starts for a normal jump's
            // 42px-tall half-body to clear it, including input/frame latency.
            const active=e.pattern===2?progress>=.72:e.pattern===1?progress>=.4&&progress<=.75:true;
            if(active&&insideRocZone(zone,this.player.x,this.player.y)){
                this.hurt(e.pattern===2?18:14);
                if(e.pattern===1)this.player.setVelocityX((Math.sign(e.target-e.def.x)||1)*240);
            }
            if(this.sim>=e.until){e.state='recover';e.until=this.sim+pattern.recover;e.sprite.y=e.def.y;e.sprite.clearTint();}
        }else if(e.state==='recover'&&this.sim>=e.until){
            e.state='idle';e.until=this.sim+800;e.pattern=(e.pattern+1)%3;e.coreStruck=false;
        }
        this.setEnemyPose(e);
        const open=rocCoreOpen(e.state,!!e.coreStruck,this.host.save.treasures.includes('T02'));
        const advice=e.state==='telegraph'?`⚠ ${pattern.name} · ${e.pattern===1?'점프':e.pattern===2?'표시 밖으로':'뒤로 피하기'}`:
            e.state==='recover'?(open?'수정구슬 → 빛나는 핵 공격':e.coreStruck?'핵이 맑아졌어요':'T02 수정구슬이 필요해요'):
            e.state==='attack'?pattern.name:'';
        e.label.setText(advice).setPosition(e.sprite.x,e.sprite.y-140).setVisible(distance<620&&!!advice);
        if(distance<850)this.bossText.setText(`로크새 · 저주 핵 ${rocCoresBroken(this.host.save)} / 3 · ${advice||'공격 예고를 살펴요'}`).setVisible(true);
    }
    private updateFlyingBat(e:Enemy,dt:number){
        const path=e.def.flightPath!;
        const distance=Phaser.Math.Distance.Between(this.player.x,this.player.y,e.sprite.x,e.sprite.y);
        e.label.setVisible(distance<620&&e.state!=='idle');
        if(e.state==='idle'){
            e.sprite.clearTint();e.flightPhase=(e.flightPhase??0)+dt;
            const next=batPatrol(e.def,path,e.flightPhase);
            e.sprite.setFlipX(next.x<e.sprite.x).setPosition(next.x,next.y);
            if(distance<170){
                e.state='telegraph';e.until=this.sim+1200*(this.host.save.settings.difficulty==='relaxed'?1.3:1);
                e.flightOrigin={x:e.sprite.x,y:e.sprite.y};
                const target=batFlightTarget(e.def,path,this.player);e.target=target.x;e.targetY=target.y;
                e.sprite.setFlipX(e.target<e.sprite.x);
            }
        }else if(e.state==='telegraph'){
            e.sprite.setTint(0xffc773);e.label.setText('⚠ 박쥐 돌진 예고 · 옆으로 피하세요');
            if(this.sim>=e.until){e.state='attack';e.until=this.sim+500;}
        }else if(e.state==='attack'){
            const progress=1-(e.until-this.sim)/500;
            const next=batSwoop(e.flightOrigin!,{x:e.target,y:e.targetY},progress);e.sprite.setPosition(next.x,next.y);
            e.label.setText('✦');
            if(progress>.18&&progress<.82&&Math.abs(this.player.x-next.x)<64&&Math.abs(this.player.y-next.y)<56)this.hurt(14);
            if(this.sim>=e.until){e.sprite.setPosition(e.flightOrigin!.x,e.flightOrigin!.y);e.state='recover';e.until=this.sim+1100;}
        }else if(e.state==='recover'){
            e.sprite.clearTint();e.label.setText('빈틈 · 공격');
            if(this.sim>=e.until)e.state='idle';
        }
        this.setEnemyPose(e);this.paintEnemyHud(e,distance);
    }
    private paintEnemyHud(e:Enemy,distance:number){
        const barY=e.sprite.y-(e.bodyHeight??e.sprite.displayHeight)*(e.def.kind==='boss'?.62:.5)-10;
        if(distance<620&&e.sprite.visible){const w=e.def.kind==='boss'?110:64,ratio=e.hp/e.maxHp;this.hpBars.fillStyle(0x10212c,.75).fillRoundedRect(e.sprite.x-w/2-2,barY-2,w+4,11,4).fillStyle(ratio>.5?0x8be38f:ratio>.25?0xffd36e:0xff8f7a).fillRoundedRect(e.sprite.x-w/2,barY,Math.max(3,w*ratio),7,3);}
        e.label.setPosition(e.sprite.x,barY-24);
    }
    private updateEnemies(dt: number) {
        let boss = '';
        this.hpBars.clear();
        if(this.mapDef.id==='S08'&&this.player.x>=crystalSafeStart){for(const e of this.enemies)if(e.state!=='defeated'){e.state='idle';e.sprite.clearTint();this.setEnemyPose(e);e.label.setVisible(false);}this.bossText.setVisible(false);return;}
        for (const e of this.enemies) {
            if (e.state === 'defeated')
                continue;
            if(e.def.flightPath){this.updateFlyingBat(e,dt);continue;}
            if(e.def.id===rocBossId){this.updateRoc(e,dt);return;}
            if(e.def.kind==='kite'&&e.state==='idle')e.sprite.y=e.def.y+Math.sin(this.sim/360+e.def.x)*18;
            const distance = e.def.kind==='kite'?Phaser.Math.Distance.Between(this.player.x,this.player.y,e.sprite.x,e.sprite.y):Math.abs(this.player.x - e.sprite.x);
            e.label.setVisible(distance<620);
            if (distance > 850)
                continue;
            const isBoss = e.def.kind === 'captain' || e.def.kind === 'siren' || e.def.kind === 'boss';
            if (isBoss)
                boss = `${e.def.name??(e.def.kind === 'siren' ? '세이렌 · 저주' : e.def.kind==='boss'?'저주의 핵':'해골 대장')} ${this.mapDef.id==='S31'?`· ${e.hp/e.maxHp>.65?1:e.hp/e.maxHp>.3?2:3}단계`:''}  ${e.hp} / ${e.maxHp}  ${e.state === 'telegraph' ? '⚠ 공격 예고' : e.state === 'recover' ? '지금이 기회!' : ''}`;
            if (e.def.kind === 'siren' && ![1, 2, 3].every(n => this.done(`S02.shell.${n}`))) {
                e.label.setText('조개 종 3개로 방벽 해제');
                continue;
            }
            if (e.state === 'idle') {
                if(e.def.kind==='guardian')e.target=this.player.x;
                e.sprite.clearTint();
                if(this.mapDef.id==='S06')e.sprite.setTint(0xffaa65);
                if (distance < (e.def.kind === 'archer' || e.def.kind === 'siren' || e.def.kind==='kite' ? 580 : 170)) {
                    e.state = 'telegraph';
                    e.until = this.sim + (e.def.kind === 'captain' ? 1500 : 1200) * (this.host.save.settings.difficulty === 'relaxed' ? 1.3 : 1);
                    e.target = this.player.x;
                    e.targetY = this.player.y;
                }
                else if (distance < 500 && e.def.kind !== 'siren' && e.def.kind !== 'archer' && e.def.kind!=='kite') {
                    e.sprite.x += Math.sign(this.player.x - e.sprite.x) * Math.min(dt * 0.045, Math.abs(e.def.x - e.sprite.x) < 90 ? dt * 0.045 : 0);
                }
            }
            else if (e.state === 'telegraph') {
                e.sprite.setTint(0xffc773);
                e.label.setText(e.def.kind==='kite'?'⚠ 바람탄 예고… 피하세요!':'⚠ 준비… 피하세요!');
                if (this.sim >= e.until) {
                    e.state = 'attack';
                    e.until = this.sim + 250;
                    if(!['archer','siren','kite'].includes(e.def.kind)&&!this.host.save.settings.reducedMotion)this.tweens.add({targets:e.sprite,x:e.sprite.x+Math.sign(this.player.x-e.sprite.x)*20,duration:110,yoyo:true,ease:'Quad.easeOut'});
                    if (e.def.kind === 'siren') {
                        if (e.pattern++ % 2 === 0)
                            this.projectile(e.sprite.x, e.sprite.y + 35, Math.sign(e.target - e.sprite.x) * 230, 0, true,e.def.kind);
                        else
                            for (const vy of [-140, -55, 35])
                                this.projectile(e.sprite.x, e.sprite.y, Math.sign(e.target - e.sprite.x) * 190, vy, false,e.def.kind);
                    }
                    else if (e.def.kind === 'kite'){
                        const angle=Phaser.Math.Angle.Between(e.sprite.x,e.sprite.y,e.target,e.targetY);
                        this.projectile(e.sprite.x,e.sprite.y,Math.cos(angle)*220,Math.sin(angle)*220,true,e.def.kind);
                    }
                    else if (e.def.kind === 'archer')
                        this.projectile(e.sprite.x, e.sprite.y, Math.sign(e.target - e.sprite.x) * 250, 0, false,e.def.kind);
                    else if(e.def.kind==='boss'&&this.mapDef.id==='S31'){
                        const phase=e.hp/e.maxHp>.65?1:e.hp/e.maxHp>.3?2:3;
                        for(const vy of phase===2?[-95,0,95]:[0])this.projectile(e.sprite.x,e.sprite.y,Math.sign(e.target-e.sprite.x)*(phase===3?135:210),vy,phase===3,e.def.kind);
                        e.pattern++;
                    }
                }
            }
            else if (e.state === 'attack') {
                e.label.setText('✦');
                if (!['archer', 'siren','kite'].includes(e.def.kind) && Math.abs(this.player.x - e.sprite.x) < 112 && Math.abs(this.player.y - e.sprite.y) < 95)
                    this.hurt(this.mapDef.id === 'S01' && !this.host.save.claimedRewardIds.includes('S01.heart.01') ? 10 : 14);
                if (this.sim >= e.until) {
                    e.state = 'recover';
                    e.until = this.sim + (isBoss ? 1800 : 1100);
                }
            }
            else if (e.state === 'recover') {
                e.label.setText(`빈틈 · ${this.mapDef.mode==='flight'?'Space':'J'} 공격`);
                if (this.sim >= e.until)
                    e.state = 'idle';
            }
            // Calm enemies show a small health bar instead of a "24 / 24" caption.
            if (e.state === 'idle')
                e.label.setVisible(false);
            e.sprite.setFlipX((e.def.kind==='guardian'?e.target:this.player.x) < e.sprite.x);
            this.setEnemyPose(e);
            this.paintEnemyHud(e,distance);
        }
        this.bossText.setText(boss).setVisible(!!boss);
    }
    private projectile(x: number, y: number, vx: number, vy: number, wave: boolean,kind:string) {
        const key=projectileArtFor(kind,wave);
        let sprite:Phaser.GameObjects.Sprite|Phaser.GameObjects.Arc;
        let glyph:Phaser.GameObjects.Text|undefined;
        if(this.textures.exists(key)){
            sprite=this.add.sprite(x,y,key,0).setDisplaySize(64,64).setDepth(8);
            if(kind==='kite')sprite.setRotation(Math.atan2(vy,vx));
            else if(key==='projectile-siren-wave')sprite.setFlipX(vx<0);
        }else{
            sprite=this.add.circle(x, y, wave ? 18 : 11, wave ? 0x85ece0 : 0xe7b9f3).setStrokeStyle(3, 0x244f64).setDepth(8);
            glyph=this.txt(x, y, wave ? '≋' : '♪', {fontSize:'23px',color:'#183948',fontFamily:'sans-serif'}).setOrigin(0.5).setDepth(9);
        }
        this.projectiles.push({ sprite, glyph, vx, vy, start:this.sim, until: this.sim + 4000, wave });
    }
    private updateProjectiles(dt: number) { for (const p of this.projectiles) {
        p.sprite.x += p.vx * dt / 1000;
    p.sprite.y += p.vy * dt / 1000;
    p.glyph?.setPosition(p.sprite.x, p.sprite.y);
    if(p.sprite instanceof Phaser.GameObjects.Sprite)p.sprite.setFrame(projectileFrame(this.sim-p.start,this.host.save.settings.reducedMotion));
        if (Math.abs(p.sprite.x - this.player.x) < 34 && Math.abs(p.sprite.y - this.player.y) < (p.wave ? 42 : 48)) {
            this.hurt(14);
            p.until = 0;
        }
    if (this.sim >= p.until) {
        p.sprite.destroy();
        p.glyph?.destroy();
    }
    } this.projectiles = this.projectiles.filter(p => p.sprite.active); }
    private updateLightning() {
        this.warnings.clear();
        this.rocGlyph?.clear();
        for (const enemy of this.enemies) {
            if(enemy.state==='defeated'||!enemy.sprite.visible)continue;
            const feet=enemy.sprite.y+(enemy.footOffset??enemy.sprite.displayHeight*(1-enemy.sprite.originY))-4;
            const flying=enemy.def.kind==='kite'||this.mapDef.mode==='flight'||this.mapDef.mode==='swim';
            if(!flying)this.warnings.fillStyle(0x08202c,.3).fillEllipse(enemy.sprite.x,feet,(enemy.bodyWidth??enemy.sprite.displayWidth)*.55,14);
            if(enemy.def.id===rocBossId){
                if(enemy.state==='telegraph'||enemy.state==='attack'){
                    const zone=rocZone(enemy.pattern,enemy.def.x,enemy.target);
                    this.warnings.fillStyle(0xffb35c,enemy.state==='attack'?.35:.16).fillRect(zone.x-zone.width/2,zone.y-zone.height/2,zone.width,zone.height);
                    this.warnings.lineStyle(3,0xffd28d,.9).strokeRect(zone.x-zone.width/2,zone.y-zone.height/2,zone.width,zone.height);
                    if(enemy.pattern===2)this.warnings.lineStyle(4,0xffd28d,.9).lineBetween(zone.x,320,zone.x,zone.y+zone.height/2);
                }
                if(rocCoreOpen(enemy.state,!!enemy.coreStruck,this.host.save.treasures.includes('T02'))){
                    const core=this.rocCore(enemy);
                    this.rocGlyph?.fillStyle(0xe9fdf2,1).fillCircle(core.x,core.y,18).lineStyle(4,0x77eadc,1).strokeCircle(core.x,core.y,24);
                }
                continue;
            }
            if(enemy.def.flightPath){
                if(enemy.state==='telegraph'||enemy.state==='attack'){
                    this.warnings.lineStyle(3,0xffd28d,.9).strokeCircle(enemy.target,enemy.targetY,70);
                    this.warnings.lineBetween(enemy.sprite.x,enemy.sprite.y,enemy.target,enemy.targetY);
                }
                continue;
            }
            // Wind-up warning painted on the ground where the strike will land.
            if (enemy.state === 'telegraph' && !['siren', 'archer','kite'].includes(enemy.def.kind)) {
                const pulse=.55+.35*Math.sin(this.sim/90);
                this.warnings.fillStyle(0xffb35c,.16+.12*pulse).fillEllipse(enemy.sprite.x,feet,224,34);
                this.warnings.lineStyle(3,0xffd28d,.5+.4*pulse).strokeEllipse(enemy.sprite.x,feet,224,34);
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
        if((def.mechanic||def.breakWeapon)&&!this.host.save.settings.reducedMotion)for(let i=0;i<8;i++){const spark=this.add.star(def.x,def.y,4,3,8,0xffe7aa).setDepth(13);this.tweens.add({targets:spark,x:def.x+Math.cos(i*Math.PI/4)*72,y:def.y-40+Math.sin(i*Math.PI/4)*50,alpha:0,angle:120,duration:650,onComplete:()=>spark.destroy()});}
        if(def.reward?.startsWith('G')){this.host.hp=maxHp(this.host.save);this.host.changed();}
        if(def.kind==='flameGift'||def.id==='S13.reward'||def.id==='S16.reward'){this.host.hp=maxHp(this.host.save);this.host.mp=maxMp(this.host.save);this.host.changed();}
        this.host.sound('reward');
        this.host.notice(def.reward==='W02'?'바람 부메랑 획득! Q로 바꿔 J로 던져 보세요.':def.reward?.startsWith('G')?'황금 하트! 최대 체력 +10, 완전 회복':def.kind==='rescue'?'공기방울 보호를 저장했어요. 아직 자유 수영은 아니에요.':`${def.label} · 완료`);
    }    private interact(def: ObjectDef) {
        if(def.kind==='rocCore')return;
        if(def.kind==='raft'){
            if(!raftPrepared(this.host.save)){this.host.notice('나무를 운반하고 밧줄을 묶으면 뗏목이 준비돼요.');return;}
            const raft=this.riverRaft!;
            if(!raft.riding){raft.body.reset(def.x===470?riverRoute.start:def.x,riverRoute.top+12);raft.body.setVelocity(0);}
            this.host.notice('뗏목이 왔어요. ↑로 올라타고, ↓로 내려 수영해요.');return;
        }
        if(def.breakWeapon){this.host.notice('달빛 방망이를 장착하고 Space 또는 J로 금 간 바위를 공격하세요.');return;}
        if (def.needs?.some(id => !this.done(id))) {
            this.host.notice('아직 할 일이 있어요. ' + this.mapDef.objective);
            return;
        }
        if(def.requiresItems?.some(id=>!this.host.save.treasures.includes(id))){this.host.notice(`${def.requiresItems.join(' · ')} 보물을 얻은 뒤 다시 와 주세요.`);return;}
        if(this.storyInteract(def))return;
        if(def.kind==='bridge'&&!this.done(def.id)){
            if(!this.host.save.treasures.includes('T05')){this.host.notice('도깨비의 방울을 얻으면 이 길을 열 수 있어요.');return;}
            if(this.sim>=this.bridgeUntil){
                if(this.host.mp<12){this.host.notice('보물의 힘이 회복되고 있어요. 잠시 뒤 행동을 눌러 주세요.');return;}
                this.host.mp-=12;this.bridgeUntil=this.sim+12000;this.flameUsed=this.sim;
                this.createMoonBridge(def.x);
                this.host.sound('reward');this.host.changed();
            }
        }
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
