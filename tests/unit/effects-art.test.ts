import {describe,it,expect} from 'vitest';
import {assets} from '../../src/content/assets.manifest';
import {effectSheets,sceneEffectKeys,projectileArtFor,projectileFrame,effectFrame,effectDuration} from '../../src/content/effects';

describe('A7 visual contracts',()=>{
    it('registers the exact 34 square runtime frames with local draft sources',()=>{
        expect(effectSheets.reduce((n,s)=>n+s.frames,0)).toBe(34);
        for(const sheet of effectSheets){
            const asset=assets.find(a=>a.key===sheet.key)!;
            expect(asset).toMatchObject({kind:'sheet',status:'draft',frame:sheet.frame,width:sheet.columns*sheet.frame,height:sheet.rows*sheet.frame,path:`assets/webtoon/${sheet.key}.webp`});
        }
    });
    it('loads only projectile types used by the current encounter',()=>{
        expect(sceneEffectKeys([],'S36')).toEqual([]);
        expect(sceneEffectKeys(['siren'],'S02').filter(k=>k.startsWith('projectile-'))).toEqual(['projectile-siren-wave','projectile-siren-note']);
        expect(sceneEffectKeys(['kite'],'S10')).toContain('projectile-kite-wind');
        expect(sceneEffectKeys(['boss'],'S19')).not.toContain('projectile-kuura-orb');
        expect(sceneEffectKeys(['boss'],'S31')).toContain('projectile-kuura-orb');
        expect(new Set(sceneEffectKeys(['siren','siren'],'S02')).size).toBe(5);
    });
    it('distinguishes source silhouettes while keeping late boss wave phases the same orb',()=>{
        expect(projectileArtFor('siren',true)).toBe('projectile-siren-wave');
        expect(projectileArtFor('siren',false)).toBe('projectile-siren-note');
        expect(projectileArtFor('kite',true)).toBe('projectile-kite-wind');
        expect(projectileArtFor('boss',false)).toBe(projectileArtFor('boss',true));
    });
    it('loops from world time and keeps a static readable reduced-motion projectile',()=>{
        expect([0,100,200,300,400].map(age=>projectileFrame(age,false))).toEqual([0,1,2,3,0]);
        expect(projectileFrame(-1,false)).toBe(0);
        expect([0,100,200,300,400].map(age=>projectileFrame(age,true))).toEqual([0,0,0,0,0]);
    });
    it('plays all six transient frames without wrapping or extending their lifetime',()=>{
        for(const duration of Object.values(effectDuration)){
            expect([0,1,2,3,4,5].map(i=>effectFrame(i*duration/6,duration))).toEqual([0,1,2,3,4,5]);
            expect(effectFrame(duration*2,duration)).toBe(5);
        }
        expect(effectDuration['effect-hit-spark']).toBe(180);
    });
});
