import {it,expect} from 'vitest';
import {maps} from '../../src/content/maps';
import {sceneWorldPropKeys,worldPropTexture,objectTexture} from '../../src/content/worldProps';

it('loads only used world props and preserves custom story textures and missing-file fallbacks',()=>{
    expect(sceneWorldPropKeys(maps.S01)).toEqual(['prop-chest','prop-bell','prop-heart']);
    const custom={...maps.S01,objects:[{...maps.S01.objects[1],texture:'custom-story-prop'}],hearts:[]};
    expect(sceneWorldPropKeys(custom)).toEqual([]);
    expect(worldPropTexture('custom-story-prop',()=>true)).toBe('custom-story-prop');
    expect(worldPropTexture('chest',()=>false)).toBe('chest');
    expect(worldPropTexture('heart',()=>false)).toBe('heart');
});

it('distinguishes rescue equipment, rods, mast and departure bell by stable object ID',()=>{
    expect(worldPropTexture('gear',()=>true,'S04.gear.1')).toBe('prop-lifevest');
    expect(worldPropTexture('gear',()=>true,'S04.gear.2')).toBe('prop-rescue-rope');
    expect(worldPropTexture('gear',()=>true,'S04.gear.3')).toBe('prop-lifering');
    expect(worldPropTexture('rod',()=>true,'S03.rod.2')).toBe('prop-lightning-rod');
    expect(worldPropTexture('rod',()=>true,'S03.crisis')).toBe('prop-damaged-mast');
    expect(worldPropTexture('bell',()=>true,'S01.exit')).toBe('prop-bell');
    expect(worldPropTexture('bell',()=>true,'S01.cp.boss')).toBe('bell');
    expect(worldPropTexture('bell',()=>true,'S02.exit')).toBe('bell');
    expect(worldPropTexture('gear',()=>false,'S04.gear.1')).toBe('gear');
});

it('loads illustrated story props without replacing explicit character or custom textures',()=>{
    expect(sceneWorldPropKeys(maps.S02)).toContain('prop-shell');
    expect(sceneWorldPropKeys(maps.S04)).toEqual(expect.arrayContaining(['prop-lifevest','prop-rescue-rope','prop-lifering','prop-golden']));
    expect(sceneWorldPropKeys(maps.S13)).toEqual(expect.arrayContaining(['prop-cargo','prop-journal','prop-gift']));
    expect(objectTexture(maps.S01.objects[0],'S01')).toBe('captain-webtoon');
    expect(sceneWorldPropKeys({...maps.S01,objects:[],hearts:[]})).toEqual([]);
});

it('loads flight hazards only where present and preserves missing or custom flight textures',()=>{
    for(const id of ['S10','S33'])for(const ring of maps[id].objects.filter(object=>object.flightRing))expect(objectTexture(ring,id)).toBe('flightRing');
    expect(sceneWorldPropKeys(maps.S10)).toEqual(expect.arrayContaining(['prop-flight-ring','prop-gust-cloud','prop-heart']));
    expect(sceneWorldPropKeys(maps.S10)).not.toContain('prop-falling-debris');
    expect(sceneWorldPropKeys(maps.S33)).toEqual(expect.arrayContaining(['prop-flight-ring','prop-falling-debris','prop-heart']));
    expect(sceneWorldPropKeys(maps.S33)).not.toContain('prop-gust-cloud');
    expect(sceneWorldPropKeys(maps.S01)).not.toContain('prop-flight-ring');
    for(const legacy of ['flightRing','stormCloud','debris'])expect(worldPropTexture(legacy,()=>false)).toBe(legacy);
    expect(worldPropTexture('custom-flight-ring',()=>true)).toBe('custom-flight-ring');
});
