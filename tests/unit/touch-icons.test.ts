import {describe,it,expect} from 'vitest';
import {assets} from '../../src/content/assets.manifest';
import {touchIconNames,touchIconPath,skillIcons} from '../../src/content/touchIcons';
import {activeSkills} from '../../src/core/skills';

describe('touch artwork content contracts',()=>{
    it('registers all nine DOM icons as separate transparent PNG-sized images',()=>{
        const icons=assets.filter(asset=>asset.key.startsWith('ui-'));
        expect(icons).toHaveLength(9);
        expect(new Set(icons.map(asset=>asset.key)).size).toBe(9);
        for(const name of touchIconNames){
            const asset=icons.find(a=>a.key===`ui-${name}`)!;
            expect(asset.path).toBe(touchIconPath(`ui-${name}`));
            expect(asset).toMatchObject({width:128,height:128,kind:'image',status:'draft'});
            expect(asset.frame).toBeUndefined();
        }
    });
    it('covers the existing four active abilities with different silhouettes',()=>{
        expect(Object.keys(skillIcons).sort()).toEqual(Object.keys(activeSkills).sort());
        expect(skillIcons).toEqual({flamePulse:'ui-flame',moonBridge:'ui-bridge',lotusShield:'ui-shield',dawnWave:'ui-dawn'});
        expect(new Set(Object.values(skillIcons)).size).toBe(4);
    });
});
