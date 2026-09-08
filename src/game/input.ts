export type Action = 'left' | 'right' | 'jump' | 'attack' | 'dodge' | 'interact' | 'cycle' | 'pause' | 'map' | 'skill';
const keymap: Record<string, Action> = { KeyR: 'skill', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', KeyK: 'jump', KeyW: 'jump', ArrowUp: 'jump', KeyJ: 'attack', KeyL: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge', KeyE: 'interact', KeyQ: 'cycle', Escape: 'pause', KeyM: 'map' };
export class Input {
    private sources = new Map<string, Action>();
    private edges = new Set<Action>();
    digits: number | null = null;
    constructor(private root: HTMLElement) { root.addEventListener('keydown', this.down); root.addEventListener('keyup', this.up); }
    private down = (e: KeyboardEvent) => { if ((e.target as HTMLElement).closest('button,input,select'))
        return; const a = keymap[e.code]; if (a) {
        e.preventDefault();
        if (!e.repeat)
            this.press(e.code, a);
    } if (/^Digit[1-7]$/.test(e.code) && !e.repeat)
        this.digits = Number(e.code.at(-1)); };
    private up = (e: KeyboardEvent) => { this.release(e.code); };
    press(source: string, a: Action) { if (!this.sources.has(source)) {
        this.sources.set(source, a);
        this.edges.add(a);
    } }
    release(source: string) { this.sources.delete(source); }
    held(a: Action) { return [...this.sources.values()].includes(a); }
    consume(a: Action) { const present = this.edges.has(a); this.edges.delete(a); return present; }
    clear() { this.sources.clear(); this.edges.clear(); this.digits = null; }
    destroy() { this.root.removeEventListener('keydown', this.down); this.root.removeEventListener('keyup', this.up); this.clear(); }
}
