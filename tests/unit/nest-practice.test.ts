import {describe,it,expect} from 'vitest';
import {maps} from '../../src/content/maps';
import {mapReachabilityIssues,reachablePlatformIndexes} from '../../src/content/reachability';
import {objectiveReward} from '../../src/core/adventure';
import {freshSave,grantReward} from '../../src/core/state';
import {parseSave} from '../../src/core/save';

describe('optional feather practice route',()=>{
    it('requires the acquired feather for upper ledges, while the gift and exit stay on the base route',()=>{
        const map=maps.S09,base=reachablePlatformIndexes(map,false),withFeather=reachablePlatformIndexes(map,true);
        const upper=map.platforms.map((p,i)=>({p,i})).filter(({p})=>p.requiresTreasure==='T03');
        expect(upper).toHaveLength(2);
        for(const {p,i} of upper){expect(p.oneWay).toBe(true);expect(base.has(i)).toBe(false);expect(withFeather.has(i)).toBe(true);}
        expect(mapReachabilityIssues(map)).toEqual([]);
        const misplaced=structuredClone(map);misplaced.objects.find(o=>o.id==='S09.reward')!.y=284;
        expect(mapReachabilityIssues(misplaced)).toContain('S09.reward: no reachable interaction position');
        expect(map.objects.find(o=>o.kind==='exit')!.needs).toEqual(['S09.reward']);
        expect(map.platforms[0]).toMatchObject({x:0,w:3000,y:608,requiredGround:true});
    });
    it('saves the optional gem once without changing required treasures or old progress',()=>{
        const gem=maps.S09.objects.find(o=>o.id==='S09.nestGem')!;
        expect(gem.needs).toEqual(['S09.reward']);expect(gem.requiresItems).toEqual(['T03']);
        const old=freshSave();old.treasures=['T01','T02','T03'];old.completedObjectiveIds=['S09.enemy.3','S09.reward'];old.coins=19;
        const once=grantReward(parseSave(JSON.stringify(old)),objectiveReward(gem));
        const loaded=parseSave(JSON.stringify(once));const again=grantReward(loaded,objectiveReward(gem));
        expect(loaded.coins).toBe(44);expect(again.coins).toBe(44);
        expect(again.claimedRewardIds.filter(id=>id==='S09.nestGem.reward')).toHaveLength(1);
        expect(again.treasures).toEqual(old.treasures);expect(again.totalXp).toBe(old.totalXp);
        expect(again.checkpoint).toEqual(old.checkpoint);
    });
});
