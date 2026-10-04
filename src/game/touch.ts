import type { Action, Input } from './input';
import type { ActionContext } from './stage';
import type {ActiveSkillId} from '../core/skills';
import {skillIcons,touchIconPath,type TouchIconKey} from '../content/touchIcons';

// On-screen controls for phones and tablets.
// Left thumb: a direction pad that follows the finger, so sliding from ◀ to ▶
// changes direction without lifting. In swimming and flying it becomes a
// four-way pad. Right thumb: a big action button that shows what it will do,
// a jump button, and small treasure-skill and weapon buttons.
interface ButtonSpec { key: string; action: Action; label: string; aria: string; group: 'pad' | 'act' }
const specs: ButtonSpec[] = [
    { key: 'left', action: 'left', label: '◀', aria: '터치 ←', group: 'pad' },
    { key: 'right', action: 'right', label: '▶', aria: '터치 →', group: 'pad' },
    { key: 'up', action: 'jump', label: '▲', aria: '터치 위로', group: 'pad' },
    { key: 'down', action: 'down', label: '▼', aria: '터치 ↓', group: 'pad' },
    { key: 'jump', action: 'jump', label: '▲', aria: '터치 ↑', group: 'act' },
    { key: 'skill', action: 'skill', label: '능력', aria: '터치 능력', group: 'act' },
    { key: 'cycle', action: 'cycle', label: '무기', aria: '터치 무기 바꾸기', group: 'act' },
    { key: 'primary', action: 'primary', label: '행동', aria: '터치 행동', group: 'act' },
];
const contextIcon: Record<ActionContext['kind'], [TouchIconKey|null, string, string]> = {
    attack: [null, '공격', '⚔'], talk: ['ui-talk', '대화', '💬'], use: ['ui-inspect', '살펴보기', '✋'], exit: ['ui-depart', '출발', '⛵'],
};

export class TouchControls {
    readonly buttons = new Map<string, HTMLButtonElement>();
    private pad: HTMLDivElement;
    private padOwner = new Map<number, string>();
    private weaponIcon = '';
    private context: { action: ActionContext; flight: boolean } | null = null;

    constructor(private root: HTMLElement, private input: Input, private onPress: () => void, private onTouchRelease: () => void = () => undefined) {
        this.pad = document.createElement('div');
        this.pad.className = 'pad';
        const act = document.createElement('div');
        act.className = 'act';
        for (const spec of specs) {
            const b = document.createElement('button');
            b.type = 'button';
            b.dataset.action = spec.key;
            b.setAttribute('aria-label', spec.aria);
            b.innerHTML = `<span class="glyph">${spec.label}</span>`;
            if(spec.key==='jump')this.renderIcon(b,'ui-jump','▲');
            (spec.group === 'pad' ? this.pad : act).append(b);
            this.buttons.set(spec.key, b);
            if (spec.group === 'act') this.bindButton(b, spec.action);
        }
        this.bindPad();
        root.append(this.pad, act);
        root.addEventListener('contextmenu', e => e.preventDefault());
    }

    // Keep the button and pointer handlers stable. A failed image only restores
    // its old glyph; captions, accessible names and actual actions stay intact.
    private renderIcon(button:HTMLButtonElement,key:TouchIconKey,fallback:string,caption?:string){
        if(button.dataset.icon!==key){
            const frame=document.createElement('span');frame.className='icon-frame';frame.setAttribute('aria-hidden','true');
            const image=document.createElement('img');image.className='touch-icon';image.alt='';image.width=128;image.height=128;
            const glyph=document.createElement('span');glyph.className='glyph';glyph.textContent=fallback;glyph.hidden=true;
            image.addEventListener('error',()=>{image.hidden=true;glyph.hidden=false;frame.dataset.fallback='true';},{once:true});
            image.src=`/${touchIconPath(key)}`;
            frame.append(image,glyph);button.replaceChildren(frame);button.dataset.icon=key;
            if(caption!==undefined){const label=document.createElement('span');label.className='caption';button.append(label);}
        }
        const label=button.querySelector('.caption');if(label&&caption!==undefined)label.textContent=caption;
    }

    private source(pointerId: number) { return `touch-${pointerId}`; }

    private bindButton(b: HTMLButtonElement, action: Action) {
        b.addEventListener('pointerdown', e => {
            e.preventDefault();
            b.setPointerCapture(e.pointerId);
            this.onPress();
            b.classList.add('down');
            this.input.press(this.source(e.pointerId), action);
        });
        const up = (e: PointerEvent) => { b.classList.remove('down'); this.input.release(this.source(e.pointerId)); if (e.pointerType === 'touch' && e.type === 'pointerup') this.onTouchRelease(); };
        for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) b.addEventListener(name, up);
    }

    // Which pad button is under (or nearest to) the finger. A finger that drifts
    // a little outside the pad keeps steering instead of letting go.
    private padKeyAt(x: number, y: number): string | null {
        let best: string | null = null, bestDistance = Infinity;
        for (const [key, b] of this.buttons) {
            if (b.parentElement !== this.pad || b.hidden) continue;
            const r = b.getBoundingClientRect();
            const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
            const distance = Math.hypot(dx, dy);
            if (distance < bestDistance) { bestDistance = distance; best = key; }
        }
        return bestDistance <= 48 ? best : null;
    }

    private setPad(pointerId: number, key: string | null) {
        const previous = this.padOwner.get(pointerId);
        if (previous === key) return;
        if (previous) this.buttons.get(previous)?.classList.remove('down');
        this.input.release(this.source(pointerId));
        if (key) {
            this.padOwner.set(pointerId, key);
            this.buttons.get(key)?.classList.add('down');
            this.input.press(this.source(pointerId), specs.find(spec => spec.key === key)!.action);
        } else this.padOwner.delete(pointerId);
    }

    private bindPad() {
        this.pad.addEventListener('pointerdown', e => {
            const key = this.padKeyAt(e.clientX, e.clientY);
            if (!key) return;
            e.preventDefault();
            this.pad.setPointerCapture(e.pointerId);
            this.onPress();
            this.setPad(e.pointerId, key);
        });
        this.pad.addEventListener('pointermove', e => {
            if (!this.padOwner.has(e.pointerId)) return;
            this.setPad(e.pointerId, this.padKeyAt(e.clientX, e.clientY));
        });
        const end = (e: PointerEvent) => {
            if (!this.padOwner.has(e.pointerId)) return;
            const key = this.padOwner.get(e.pointerId)!;
            this.buttons.get(key)?.classList.remove('down');
            this.padOwner.delete(e.pointerId);
            this.input.release(this.source(e.pointerId));
            if (e.pointerType === 'touch' && e.type === 'pointerup') this.onTouchRelease();
        };
        for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) this.pad.addEventListener(name, end);
    }

    // Swim and flight turn the pad into four directions.
    setMode(free: boolean) {
        this.root.classList.toggle('free-move', free);
        this.buttons.get('up')!.hidden = !free;
        this.buttons.get('down')!.hidden = !free;
        this.buttons.get('jump')!.querySelector('.glyph')!.textContent = '▲';
        this.buttons.get('jump')!.dataset.caption = free ? '위로' : '점프';
    }

    setSkill(label: string | null, name: string, skill:ActiveSkillId|null) {
        const b = this.buttons.get('skill')!;
        b.hidden = !label;
        if(label&&skill)this.renderIcon(b,skillIcons[skill],'✦',label);
        b.setAttribute('aria-label', `터치 ${name}`);
    }

    setWeapons(icon: string, nextIcon: string | null, name: string) {
        this.weaponIcon = icon;
        const b = this.buttons.get('cycle')!;
        b.hidden = !nextIcon;
        if (nextIcon) b.innerHTML = `<img src="${nextIcon}" alt=""><span class="caption">바꾸기</span>`;
        b.setAttribute('aria-label', `터치 무기 바꾸기 · 지금 ${name}`);
        if (this.context?.action.kind === 'attack') this.setContext(this.context.action, this.context.flight);
    }

    setContext(context: ActionContext, flight: boolean) {
        this.context = { action: context, flight };
        const b = this.buttons.get('primary')!;
        const [icon, caption, fallback] = contextIcon[context.kind];
        b.dataset.kind = context.kind;
        if(context.kind==='attack'&&flight)this.renderIcon(b,'ui-wing','🪶',caption);
        else if(icon)this.renderIcon(b,icon,fallback,caption);
        else {delete b.dataset.icon;b.innerHTML=`${this.weaponIcon ? `<img src="${this.weaponIcon}" alt="">` : '<span class="glyph">⚔</span>'}<span class="caption">${caption}</span>`;}
        b.title = context.label;
    }
}
