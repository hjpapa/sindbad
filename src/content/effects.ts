export const projectileArtKeys = ['projectile-siren-wave', 'projectile-siren-note', 'projectile-kite-wind', 'projectile-kuura-orb'] as const;
export const effectArtKeys = ['effect-hit-spark', 'effect-purify-light', 'effect-surrender-flag'] as const;
export type ProjectileArtKey = typeof projectileArtKeys[number];
export type EffectArtKey = typeof effectArtKeys[number];
export const effectSheets = [
    ...projectileArtKeys.map(key => ({key, columns:2, rows:2, frames:4, frame:64})),
    ...effectArtKeys.map(key => ({key, columns:3, rows:2, frames:6, frame:128})),
];

export function projectileArtFor(kind:string, wave:boolean):ProjectileArtKey {
    if (kind === 'kite') return 'projectile-kite-wind';
    if (kind === 'boss') return 'projectile-kuura-orb';
    // Archers keep their existing note-shaped visual, now drawn as a sprite.
    return wave ? 'projectile-siren-wave' : 'projectile-siren-note';
}

export function sceneEffectKeys(kinds:readonly string[], stage:string):string[] {
    const keys = new Set<string>(kinds.length ? effectArtKeys : []);
    for (const kind of kinds) {
        if (kind === 'siren') {keys.add(projectileArtKeys[0]); keys.add(projectileArtKeys[1]);}
        if (kind === 'archer') keys.add(projectileArtKeys[1]);
        if (kind === 'kite') keys.add(projectileArtKeys[2]);
        if (kind === 'boss' && stage === 'S31') keys.add(projectileArtKeys[3]);
    }
    return [...keys];
}

// Use the paused world clock; reduced motion keeps the silhouette without pulsing.
export function projectileFrame(age:number, reducedMotion:boolean):number {
    return reducedMotion ? 0 : Math.floor(Math.max(0, age) / 100) % 4;
}
export const effectDuration:Record<EffectArtKey,number> = {
    'effect-hit-spark':180,
    'effect-purify-light':650,
    'effect-surrender-flag':650,
};
export function effectFrame(age:number, duration:number):number {
    return Math.min(5, Math.floor(Math.max(0, age) * 6 / duration));
}
