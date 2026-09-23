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

    it('accepts aerial targets but rejects targets above the controllable flight area', () => {
        const map = structuredClone(maps.S10);
        expect(map.objects.filter(o => o.flightRing)).toHaveLength(3);
        expect(maps.S33.objects.filter(o => o.flightRing)).toHaveLength(5);
        expect(map.objects.find(o => o.kind === 'gift')?.needs).toEqual([]);
        expect(mapReachabilityIssues(map)).toEqual([]);
        map.objects[1].y = 60;
        expect(mapReachabilityIssues(map)).toContain(`${map.objects[1].id}: no reachable interaction position`);
    });

    it('rejects flight hazards that leave no child-safe route',()=>{
        const map=structuredClone(maps.S10);
        map.flightHazards![0]={id:'blocked.sky',x:900,y:335,radius:150,kind:'gust'};
        expect(mapReachabilityIssues(map)).toContain('blocked.sky: no child-safe route around hazard');
    });

    it('rejects a platform above the safe single-jump rise', () => {
        const map = structuredClone(maps.S01);
        const y = 464 - SAFE_JUMP_RISE - 1;
        map.platforms.push({ x: 1000, y, w: 160, h: 24 });
        expect(mapReachabilityIssues(map)).toContain(`${map.id}: unreachable platform ${map.platforms.length} at (1000,${y})`);
    });
});
