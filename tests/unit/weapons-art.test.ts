import {describe,it,expect} from 'vitest';
import {availableWeaponTexture,weaponLooks} from '../../src/game/weapons';
import {assets} from '../../src/content/assets.manifest';
import type {WeaponId} from '../../src/content/items';
import {readFileSync} from 'node:fs';

describe('weapon art recovery and measured hand anchors',()=>{
    it('keeps the requested weapon through primary failure and returns null if both files fail',()=>{
        const keys=new Set(['weapon-W04','weapon-fallback-W04','weapon-fallback-W05']);
        expect(availableWeaponTexture('W04',key=>keys.has(key))).toBe('weapon-W04');
        expect(availableWeaponTexture('W05',key=>keys.has(key))).toBe('weapon-fallback-W05');
        expect(availableWeaponTexture('W07',key=>keys.has(key))).toBeNull();
    });
    it('registers seven real runtime images and preserves measured pivots at both resolutions',()=>{
        const measurements:Record<string,{size:[number,number];grip:[number,number];originX:number;originY:number}>=JSON.parse(readFileSync('art-source/weapons/weapons.measurements.json','utf8'));
        expect(Object.keys(measurements)).toHaveLength(7);
        for(const [key,m] of Object.entries(measurements)){
            const id=key as WeaponId,asset=assets.find(a=>a.key===`weapon-${id}`)!;
            expect(asset.kind).toBe('image');expect(asset.path).toBe(`assets/weapons/${id}.webp`);
            expect(m.originX).toBe(weaponLooks[id].originX);expect(m.originY).toBe(.5);
            expect(m.grip).toEqual([m.size[0]*weaponLooks[id].originX,m.size[1]*.5]);
            expect([asset.width*4,asset.height*4]).toEqual(m.size);
            expect(readFileSync(`public/${asset.path}`).byteLength).toBeGreaterThan(0);
            expect(assets.find(a=>a.key===`weapon-fallback-${id}`)?.kind).toBe('svg');
        }
    });
});
