import type { MapDef, Platform } from './maps';

// Stage physics: gravity 1500px/s², jump velocity -640px/s. The theoretical
// apex is 136px; these limits keep authored routes inside a forgiving margin.
export const SAFE_JUMP_RISE = 120;
export const SAFE_JUMP_GAP = 170;
export const STANDING_CENTER_OFFSET = 60;
export const INTERACT_RADIUS_Y = 95;

const horizontalGap = (a: Platform, b: Platform) =>
    Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));

const canMoveBetween = (from: Platform, to: Platform) => {
    const highestFrom = from.y - (from.motion?.rise ?? 0);
    const highestTo = to.y - (to.motion?.rise ?? 0);
    const rise = highestFrom - highestTo;
    const travel = (from.motion?.travel ?? 0) + (to.motion?.travel ?? 0);
    return rise <= SAFE_JUMP_RISE && horizontalGap(from, to) + travel <= SAFE_JUMP_GAP;
};

export function reachablePlatformIndexes(map: MapDef) {
    if (map.mode === 'flight' || map.mode === 'swim')
        return new Set(map.platforms.map((_, index) => index));
    const start = map.checkpoints[0];
    const reached = new Set<number>();
    map.platforms.forEach((platform, index) => {
        if (start.x >= platform.x && start.x <= platform.x + platform.w && Math.abs(start.y + STANDING_CENTER_OFFSET - platform.y) <= 12)
            reached.add(index);
    });
    let changed = true;
    while (changed) {
        changed = false;
        for (const from of [...reached]) {
            map.platforms.forEach((platform, index) => {
                if (!reached.has(index) && canMoveBetween(map.platforms[from], platform)) {
                    reached.add(index);
                    changed = true;
                }
            });
        }
    }
    return reached;
}

export function mapReachabilityIssues(map: MapDef) {
    const issues: string[] = [];
    const reachable = reachablePlatformIndexes(map);
    map.platforms.forEach((platform, index) => {
        if (!reachable.has(index))
            issues.push(`${map.id}: unreachable platform ${index + 1} at (${platform.x},${platform.y})`);
    });
    const supported = (x: number, y: number) => [...reachable].some(index => {
        const platform = map.platforms[index];
        const travel = platform.motion?.travel ?? 0;
        const withinX = x >= platform.x - 70 - travel && x <= platform.x + platform.w + 70 + travel;
        const top = platform.y - (platform.motion?.rise ?? 0);
        return withinX && Math.abs(y - (top - STANDING_CENTER_OFFSET)) < INTERACT_RADIUS_Y;
    });
    for (const object of map.objects)
        if (!supported(object.x, object.y))
            issues.push(`${object.id}: no reachable interaction position`);
    for (const heart of map.hearts)
        if (!supported(heart.x, heart.y))
            issues.push(`${heart.id}: no reachable pickup position`);
    return issues;
}
