import type { MapDef, Platform } from './maps';

// Stage physics: gravity 1500px/s², jump velocity -640px/s. The theoretical
// apex is 136px; these limits keep authored routes inside a forgiving margin.
export const SAFE_JUMP_RISE = 120;
export const SAFE_JUMP_GAP = 170;
export const STANDING_CENTER_OFFSET = 60;
export const INTERACT_RADIUS_Y = 95;

const horizontalGap = (a: Platform, b: Platform) =>
    Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));

const canMoveBetween = (from: Platform, to: Platform, hasFeather: boolean) => {
    const highestFrom = from.y - (from.motion?.rise ?? 0);
    const highestTo = to.y - (to.motion?.rise ?? 0);
    const rise = highestFrom - highestTo;
    const travel = (from.motion?.travel ?? 0) + (to.motion?.travel ?? 0);
    if(to.requiresTreasure==='T03')return hasFeather&&rise<=210&&horizontalGap(from,to)+travel<=260;
    return rise <= SAFE_JUMP_RISE && horizontalGap(from, to) + travel <= SAFE_JUMP_GAP;
};

export function reachablePlatformIndexes(map: MapDef, hasFeather=map.objects.some(o=>o.reward==='T03'||o.rewards?.includes('T03'))) {
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
                if (!reached.has(index) && canMoveBetween(map.platforms[from], platform, hasFeather)) {
                    reached.add(index);
                    changed = true;
                }
            });
        }
    }
    return reached;
}

const PLAYER_BODY_HEIGHT = 84;

// A solid block standing on a walkway splits it in two. The block-graph above
// treats the walkway as one platform, so it cannot see that a block taller than
// a jump traps a child on one side (for example after walking past a friend who
// must be talked to). Each such wall needs a climbable step on both sides.
export function wallIssues(map: MapDef) {
    if (map.mode === 'flight' || map.mode === 'swim') return [];
    const issues: string[] = [];
    const solid = map.platforms.filter(p => !p.oneWay && !p.motion);
    for (const walkway of solid) {
        for (const wall of solid) {
            if (wall === walkway) continue;
            const onTop = wall.x < walkway.x + walkway.w && wall.x + wall.w > walkway.x;
            const blocksBody = wall.y + wall.h > walkway.y - PLAYER_BODY_HEIGHT && wall.y < walkway.y;
            const rise = walkway.y - wall.y;
            if (!onTop || !blocksBody || rise <= SAFE_JUMP_RISE) continue;
            const stepOn = (side: 'left' | 'right') => map.platforms.some(step => {
                if (step === wall || step === walkway) return false;
                const gap = side === 'left' ? wall.x - (step.x + step.w) : step.x - (wall.x + wall.w);
                const stepTop = step.y - (step.motion?.rise ?? 0);
                return gap >= -step.w && gap <= SAFE_JUMP_GAP && stepTop - wall.y <= SAFE_JUMP_RISE && walkway.y - stepTop <= SAFE_JUMP_RISE && stepTop > wall.y;
            });
            for (const side of ['left', 'right'] as const) {
                const edge = side === 'left' ? wall.x : wall.x + wall.w;
                if (edge <= walkway.x + 30 || edge >= walkway.x + walkway.w - 30) continue;
                if (!stepOn(side)) issues.push(`${map.id}: wall at (${wall.x},${wall.y}) rises ${rise}px with no step on its ${side} side`);
            }
        }
    }
    return issues;
}

export function mapReachabilityIssues(map: MapDef) {
    const issues: string[] = [...wallIssues(map)];
    const reachable = reachablePlatformIndexes(map);
    const beforeFeather = reachablePlatformIndexes(map,false);
    map.platforms.forEach((platform, index) => {
        if (!reachable.has(index))
            issues.push(`${map.id}: unreachable platform ${index + 1} at (${platform.x},${platform.y})`);
    });
    const supported = (x: number, y: number, platforms=reachable) => (map.mode === 'flight' || map.mode === 'swim')
        ? x >= 24 && x <= map.width - 24 && y >= 120 && y <= 560
        : [...platforms].some(index => {
        const platform = map.platforms[index];
        const travel = platform.motion?.travel ?? 0;
        const withinX = x >= platform.x - 70 - travel && x <= platform.x + platform.w + 70 + travel;
        const top = platform.y - (platform.motion?.rise ?? 0);
        return withinX && Math.abs(y - (top - STANDING_CENTER_OFFSET)) < INTERACT_RADIUS_Y;
    });
    for (const object of map.objects)
        if (!supported(object.x, object.y,object.requiresItems?.includes('T03')?reachable:beforeFeather))
            issues.push(`${object.id}: no reachable interaction position`);
    for (const heart of map.hearts)
        if (!supported(heart.x, heart.y))
            issues.push(`${heart.id}: no reachable pickup position`);
    for(const hazard of map.flightHazards??[]){
        if(map.mode!=='flight')issues.push(`${hazard.id}: flight hazard outside flight map`);
        if(hazard.x-hazard.radius<30||hazard.x+hazard.radius>map.width-30||hazard.y<120||hazard.y>550)
            issues.push(`${hazard.id}: hazard outside controllable flight area`);
        const clearanceAbove=hazard.y-hazard.radius-120;
        const clearanceBelow=550-(hazard.y+hazard.radius);
        if(Math.max(clearanceAbove,clearanceBelow)<72)
            issues.push(`${hazard.id}: no child-safe route around hazard`);
    }
    return issues;
}
