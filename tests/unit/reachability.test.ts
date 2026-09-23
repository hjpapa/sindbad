import { describe, expect, it } from 'vitest';
import { maps } from '../../src/content/maps';
import { mapReachabilityIssues, reachablePlatformIndexes, SAFE_JUMP_RISE } from '../../src/content/reachability';

describe('authored map jump routes', () => {
    it('keeps every visible platform and interaction reachable in all 36 stages', () => {
        expect(Object.values(maps).flatMap(mapReachabilityIssues)).toEqual([]);
    });

    it('includes the formerly unreachable S03 mast platform in the route graph', () => {
        const mastIndex = maps.S03.platforms.findIndex(platform => platform.x === 2630);
        expect(reachablePlatformIndexes(maps.S03).has(mastIndex)).toBe(true);
    });

    it('rejects a platform above the safe single-jump rise', () => {
        const map = structuredClone(maps.S01);
        const y = 464 - SAFE_JUMP_RISE - 1;
        map.platforms.push({ x: 1000, y, w: 160, h: 24 });
        expect(mapReachabilityIssues(map)).toContain(`${map.id}: unreachable platform ${map.platforms.length} at (1000,${y})`);
    });
});
