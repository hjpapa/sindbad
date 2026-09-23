// Original pentatonic voyage theme; no recordings or network requests.
const melody = [69,72,76,79,76,72,74,76,72,69,67,64,67,69,72,0,
    74,76,79,81,79,76,74,72,69,67,64,67,69,72,69,0];
const roots = [45,41,48,43];
const beat = 60 / 92 / 2;
export class Audio {
    private context: AudioContext | null = null;
    private musicGain: GainNode | null = null;
    private voices = new Set<OscillatorNode>();
    private timer: ReturnType<typeof setInterval> | null = null;
    private volume = 0;
    private paused = true;
    private step = 0;
    private nextNote = 0;
    unlock() {
        try {
            this.context ??= new AudioContext();
            void this.context.resume().then(() => this.startMusic()).catch(() => {});
        } catch { /* Unsupported audio must not prevent gameplay. */ }
    }
    setMusic(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.musicGain && this.context)
            this.musicGain.gain.setTargetAtTime(this.volume * .18, this.context.currentTime, .1);
        if (!this.volume) this.stopMusic();
        else this.startMusic();
    }
    setPaused(paused: boolean) {
        this.paused = paused;
        if (paused) this.stopMusic();
        else this.startMusic();
    }
    private startMusic() {
        const context = this.context;
        if (!context || context.state !== 'running' || this.paused || !this.volume || this.timer !== null) return;
        if (!this.musicGain) {
            this.musicGain = context.createGain();
            this.musicGain.connect(context.destination);
        }
        this.musicGain.gain.setValueAtTime(this.volume * .18, context.currentTime);
        this.nextNote = context.currentTime + .05;
        this.schedule();
        this.timer = setInterval(() => this.schedule(), 100);
    }
    private schedule() {
        const context = this.context;
        if (!context || context.state !== 'running' || !this.musicGain) return;
        // Skip stale beats after tab suspension instead of queuing a burst.
        if (this.nextNote < context.currentTime) this.nextNote = context.currentTime + .05;
        while (this.nextNote < context.currentTime + .2) {
            const note = melody[this.step % melody.length];
            const root = roots[Math.floor(this.step / 8) % roots.length];
            if (note) this.note(note, this.nextNote, beat * .85, .48, 'triangle');
            if (this.step % 2 === 0) this.note(root + (this.step % 4 === 0 ? 0 : 7), this.nextNote, beat * 1.7, .45, 'sine');
            this.step = (this.step + 1) % melody.length;
            this.nextNote += beat;
        }
    }
    private note(midi: number, at: number, duration: number, volume: number, type: OscillatorType) {
        const context = this.context!;
        const oscillator = context.createOscillator(), gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.linearRampToValueAtTime(volume, at + .025);
        gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
        oscillator.connect(gain);gain.connect(this.musicGain!);
        this.voices.add(oscillator);
        oscillator.onended = () => { oscillator.disconnect();gain.disconnect();this.voices.delete(oscillator); };
        oscillator.start(at);oscillator.stop(at + duration + .03);
    }
    private stopMusic() {
        if (this.timer !== null) clearInterval(this.timer);
        this.timer = null;
        if (this.musicGain && this.context) this.musicGain.gain.setTargetAtTime(0, this.context.currentTime, .03);
        for (const voice of this.voices) { try { voice.stop(); } catch { /* Already ended. */ } }
        this.voices.clear();
    }
    play(kind: 'jump' | 'attack' | 'hurt' | 'heart' | 'reward' | 'warning', volume: number) {
        if (!this.context || volume === 0) return;
        try {
            const oscillator = this.context.createOscillator(), gain = this.context.createGain();
            const at = this.context.currentTime;
            const pitch = {jump:420,attack:210,hurt:140,heart:660,reward:880,warning:300}[kind];
            oscillator.type = kind === 'attack' ? 'triangle' : 'sine';
            oscillator.frequency.setValueAtTime(pitch, at);
            oscillator.frequency.exponentialRampToValueAtTime(pitch * (kind === 'jump' || kind === 'heart' ? 1.6 : .65), at + .15);
            gain.gain.setValueAtTime(volume * .12, at);
            gain.gain.exponentialRampToValueAtTime(.001, at + .15);
            oscillator.connect(gain);gain.connect(this.context.destination);
            oscillator.onended = () => { oscillator.disconnect();gain.disconnect(); };
            oscillator.start();oscillator.stop(at + .16);
        } catch { /* Audio must never block gameplay. */ }
    }
}
