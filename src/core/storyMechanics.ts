import type { Save } from './state';

export type StoryMechanic =
    | { type: 'rotate'; target: number; symbol: string }
    | { type: 'carry'; distance: number }
    | { type: 'channel'; duration: number; symbol: string }
    | { type: 'treasure'; item: string; symbol: string }
    | { type: 'memory'; text: string };

// Device progress is local until completion. Only the stable objective reward
// is saved, so abandoning a device cannot duplicate a grant or corrupt a save.
export function rotateDevice(current: number, target: number) {
    const next = (current + 1) % 4;
    return { next, complete: next === target };
}
export function channelProgress(elapsed: number, delta: number, near: boolean, duration: number) {
    const next = near ? Math.min(duration, elapsed + Math.max(0, delta)) : 0;
    return { next, complete: next >= duration };
}
export function treasureTrialAllowed(save: Save, item: string) {
    return save.treasures.includes(item);
}
export const deviceDirections = ['↑', '→', '↓', '←'];
