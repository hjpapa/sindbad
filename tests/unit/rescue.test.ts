import {describe,it,expect} from 'vitest';
import {arianaReleased,cooperationProgress,safeCompanionPosition,escortArrived} from '../../src/core/rescue';
import {maps} from '../../src/content/maps';
import {objectiveReward} from '../../src/core/adventure';
import {freshSave,grantReward} from '../../src/core/state';
import {parseSave} from '../../src/core/save';

describe('S32 cooperative rescue and safe escort',()=>{
    it('retains three old enemies and adds only a fourth optional curse orb',()=>{
        expect(maps.S32.spawns.map(s=>({id:s.id,x:s.x,y:s.y,hp:s.hp,kind:s.kind}))).toEqual([
            ...[800,1550,2300].map((x,i)=>({id:`S32.enemy.${i+1}`,x,y:550,hp:63,kind:'spirit'})),
            {id:'S32.enemy.4',x:480,y:550,hp:63,kind:'spirit'},
        ]);
        expect(maps.S32.spawns.every(s=>s.actionArt==='spirit')).toBe(true);
        expect(maps.S32.objects.every(o=>!o.needs?.some(id=>id.startsWith('S32.enemy.')))).toBe(true);
        expect(maps.S32.spawns.every(e=>Math.abs(e.x-1200)>260&&Math.abs(e.x-2000)>260&&Math.abs(e.x-2580)>260)).toBe(true);
    });
    it('requires the message and acquired treasures before three stars and joint release',()=>{
        const steps=maps.S32.objects.filter(o=>/^S32.quest\./.test(o.id));
        expect(steps.slice(0,3).map(o=>o.mechanic?.type==='rotate'&&o.mechanic.target)).toEqual([1,3,2]);
        expect(steps[0].needs).toEqual(['S32.intro']);
        expect(steps.slice(0,3).every(o=>o.requiresItems?.includes('T02'))).toBe(true);
        expect(steps[3].requiresItems).toEqual(['T07']);
        expect(steps[3].mechanic).toMatchObject({type:'cooperate',duration:1400,partnerX:2220});
        expect(maps.S32.objects.find(o=>o.id==='S32.seal')?.opensWith).toBe(steps[3].id);
    });
    it('resets both lights when separated, needs both, and ignores negative elapsed time',()=>{
        expect(cooperationProgress(900,100,false,1400)).toEqual({next:0,complete:false,innerReady:false});
        expect(cooperationProgress(400,0,true,1400).innerReady).toBe(false);
        expect(cooperationProgress(500,-50,true,1400)).toEqual({next:500,complete:false,innerReady:true});
        expect(cooperationProgress(1300,200,true,1400)).toEqual({next:1400,complete:true,innerReady:true});
    });
    it('snaps a companion to the actual floor during jumps and clamps the map edges',()=>{
        expect(safeCompanionPosition({x:2200,y:340},1,maps.S32.platforms)).toEqual({x:2130,y:608});
        expect(safeCompanionPosition({x:2580,y:350},1,maps.S32.platforms)).toEqual({x:2510,y:560});
        expect(safeCompanionPosition({x:2400,y:498},1,maps.S32.platforms)).toEqual({x:2330,y:560});
        expect(safeCompanionPosition({x:2990,y:498},-1,maps.S32.platforms)).toEqual({x:2960,y:560});
        expect(safeCompanionPosition({x:40,y:548},1,maps.S32.platforms)).toEqual({x:40,y:608});
        const player={x:2580,y:498,grounded:true},partner={x:2510,y:560,visible:true},target={x:2580,y:500};
        expect(escortArrived(player,partner,target)).toBe(true);
        expect(escortArrived({...player,grounded:false},partner,target)).toBe(false);
        expect(escortArrived(player,{...partner,visible:false},target)).toBe(false);
        expect(escortArrived(player,{...partner,y:608},target)).toBe(false);
    });
    it('saves release and the forward safe checkpoint, then R07 only at the balcony',()=>{
        const release=maps.S32.objects.find(o=>o.id==='S32.quest.4')!;
        const gift=maps.S32.objects.find(o=>o.id==='S32.reward')!;
        expect(gift.needs).toEqual(['S32.balcony']);
        const freed=grantReward(freshSave(),objectiveReward(release));
        expect(freed.checkpoint).toEqual({stageId:'S32',checkpointId:'rescue'});expect(arianaReleased(freed)).toBe(true);
        expect(freed.relics).not.toContain('R07');
        const awarded=grantReward(freed,objectiveReward(gift));
        expect(awarded.checkpoint).toEqual({stageId:'S32',checkpointId:'balcony'});
        expect(awarded.relics).toEqual(['R07']);expect(awarded.flags).toContain('arianaRescued');
        const loaded=parseSave(JSON.stringify(awarded));expect(grantReward(loaded,objectiveReward(gift))).toBe(loaded);
        expect(loaded.coins).toBe(0);expect(loaded.totalXp).toBe(0);
    });
    it('recognizes an old rescue reward without inventing new grants or erasing enemy rewards',()=>{
        const save=freshSave();save.checkpoint={stageId:'S32',checkpointId:'middle'};
        save.completedObjectiveIds=['S32.reward'];save.claimedRewardIds=['S01.reward.start','S32.reward.reward','S32.enemy.1'];save.relics=['R07'];save.flags=['arianaRescued'];
        const before=structuredClone(save),loaded=parseSave(JSON.stringify(save));
        expect(arianaReleased(loaded)).toBe(true);expect(loaded.completedObjectiveIds).toEqual(before.completedObjectiveIds);
        expect(loaded.claimedRewardIds).toEqual(before.claimedRewardIds);expect(loaded.relics).toEqual(before.relics);
        expect(arianaReleased(freshSave())).toBe(false);
    });
});
