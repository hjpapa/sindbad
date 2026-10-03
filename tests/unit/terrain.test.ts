import {describe,it,expect} from 'vitest';
import {assets} from '../../src/content/assets.manifest';
import {maps} from '../../src/content/maps';
import {terrainStyleKeys,terrainAssetKeys} from '../../src/content/terrainStyles';
import {terrainStyleFor,ensureTerrainTextures} from '../../src/game/terrain';

describe('terrain image selection and partial failure recovery',()=>{
    it('covers all 36 map styles with 34 unique files at the contracted runtime size',()=>{
        expect(new Set(Object.values(maps).map(terrainStyleFor))).toEqual(new Set(terrainStyleKeys));
        const terrain=assets.filter(asset=>asset.key.startsWith('terrain-'));
        expect(terrain).toHaveLength(34);expect(new Set(terrain.map(asset=>asset.key)).size).toBe(34);
        for(const style of terrainStyleKeys)for(const key of terrainAssetKeys(style))expect(terrain.find(asset=>asset.key===key)).toMatchObject({kind:'image',width:128,height:key.endsWith('-fill')?128:34,status:'draft'});
    });
    it('keeps loaded image textures and avoids creating fallback graphics',()=>{
        const scene={textures:{exists:()=>true},make:{graphics:()=>{throw Error('loaded art overwritten');}}};
        expect(ensureTerrainTextures(scene as unknown as Parameters<typeof ensureTerrainTextures>[0],'dock')).toEqual({fillKey:'terrain-dock-fill',topKey:'terrain-dock-top'});
    });
    it.each(['fill','top','both'])('generates only missing %s textures, preserving the loaded half',missing=>{
        const generated:string[]=[];
        const graphics:object=new Proxy({}, {get:(_target,key)=>key==='generateTexture'?(name:string)=>{generated.push(name);return graphics;}:()=>graphics});
        const scene={textures:{exists:(key:string)=>missing!=='both'&&!key.endsWith(`-${missing}`)},make:{graphics:()=>graphics}};
        ensureTerrainTextures(scene as unknown as Parameters<typeof ensureTerrainTextures>[0],'jungle');
        expect(generated).toEqual(missing==='both'?['terrain-jungle-fill','terrain-jungle-top']:[`terrain-jungle-${missing}`]);
    });
});
