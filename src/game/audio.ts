export class Audio {
    private context: AudioContext | null = null;
    unlock() { try {
        this.context ??= new AudioContext();
        void this.context.resume().catch(() => { });
    }
    catch { /* Silent fallback. */ } }
    play(kind: 'jump' | 'attack' | 'hurt' | 'heart' | 'reward' | 'warning', volume: number) { if (!this.context || volume === 0)
        return; try {
        const oscillator = this.context.createOscillator(), gain = this.context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = { jump: 420, attack: 210, hurt: 140, heart: 660, reward: 880, warning: 300 }[kind];
        gain.gain.setValueAtTime(volume * 0.12, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.16);
    }
    catch { /* Audio must never block gameplay. */ } }
}
