import type Phaser from 'phaser';
import type { MapDef } from '../content/maps';
import {terrainAssetKeys, type TerrainStyleKey} from '../content/terrainStyles';

// Painted chapter backdrops look wrong behind flat brown boxes, so every map
// gets a surface that belongs to its place: dock planks in the harbor, basalt
// in the fire cave, mossy earth in the jungle. Textures are drawn once per
// style. Generated image tiles are preferred; Graphics stays as a local fallback.
type Pattern = 'plank' | 'stone' | 'earth' | 'brick' | 'coral' | 'crystal' | 'cloud';
interface TerrainStyle { pattern: Pattern; base: number; dark: number; light: number; top: number; accent: number }

const styles: Record<string, TerrainStyle> = {
    dock: { pattern: 'plank', base: 0x8a5a3a, dark: 0x5a3622, light: 0xb98455, top: 0xc99a62, accent: 0x3b2618 },
    deck: { pattern: 'plank', base: 0x6e4a36, dark: 0x45291d, light: 0x9a6b4b, top: 0xb08259, accent: 0x2d1b14 },
    reef: { pattern: 'coral', base: 0x5d7f80, dark: 0x3c5a5f, light: 0x8fb3a6, top: 0x9fd0b7, accent: 0xe08aa0 },
    coral: { pattern: 'coral', base: 0x6a6f8e, dark: 0x464b6b, light: 0x9aa2c3, top: 0xf0a6b6, accent: 0x8de0cf },
    whale: { pattern: 'stone', base: 0x5d7c87, dark: 0x3f5a66, light: 0x8eaab0, top: 0xa9c4c0, accent: 0x2f4650 },
    basalt: { pattern: 'stone', base: 0x4b3a44, dark: 0x2e2229, light: 0x6e5560, top: 0xe58a52, accent: 0xff9a4d },
    crystal: { pattern: 'crystal', base: 0x45486e, dark: 0x2c2e4c, light: 0x6c70a3, top: 0xb7a8ee, accent: 0xe4dcff },
    cloud: { pattern: 'cloud', base: 0xd9e6ea, dark: 0xa9bfc8, light: 0xffffff, top: 0xf5fbff, accent: 0x9fc0cf },
    village: { pattern: 'brick', base: 0x9c7a5c, dark: 0x6d533e, light: 0xc9a47d, top: 0x7fae6a, accent: 0x5b8a4c },
    warehouse: { pattern: 'plank', base: 0x7a5a40, dark: 0x4c3626, light: 0xa77e58, top: 0xbe925f, accent: 0x33241a },
    sand: { pattern: 'coral', base: 0xb59b74, dark: 0x8a7354, light: 0xdcc59a, top: 0xe8d6a8, accent: 0x7fd3c4 },
    shadow: { pattern: 'brick', base: 0x3c3a56, dark: 0x25233a, light: 0x5c5a80, top: 0x8f86c4, accent: 0xc7b3fc },
    jungle: { pattern: 'earth', base: 0x6a4b33, dark: 0x45301f, light: 0x8e6a4a, top: 0x5f9a4e, accent: 0x3e6f39 },
    temple: { pattern: 'brick', base: 0xb08c64, dark: 0x7e6346, light: 0xd8b98b, top: 0xe6cf98, accent: 0x8f6e4c },
    garden: { pattern: 'earth', base: 0x7a5b40, dark: 0x51392a, light: 0x9e7a58, top: 0x83c27a, accent: 0xf6c4d5 },
    tower: { pattern: 'brick', base: 0x3f4566, dark: 0x282d47, light: 0x5d6690, top: 0x9aa3cf, accent: 0xded3a3 },
    kingdom: { pattern: 'brick', base: 0xd6cbb6, dark: 0xa89c86, light: 0xf3ead8, top: 0xf0d294, accent: 0x7f9fa6 },
};

export function terrainStyleFor(map: MapDef): TerrainStyleKey {
    if (map.theme === 'harbor') return 'dock';
    if (map.theme === 'storm' || map.theme === 'waves') return 'deck';
    if (map.theme === 'reef') return 'reef';
    if (map.theme === 'coral') return 'coral';
    if (map.theme === 'whale') return 'whale';
    if (map.theme === 'flame') return 'basalt';
    if (map.theme === 'crystal') return 'crystal';
    const byVisual: Record<string, TerrainStyleKey> = { sky: 'cloud', volcano: 'basalt', village: 'village', warehouse: 'warehouse', ocean: 'sand', pirate: 'deck', shadow: 'shadow', jungle: 'jungle', temple: 'temple', garden: 'garden', tower: 'tower', kingdom: 'kingdom' };
    return byVisual[map.visual ?? 'sky'] ?? 'dock';
}

// Deterministic jitter so the pattern does not shimmer between restarts.
const rand = (seed: number) => { const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); };

export function ensureTerrainTextures(scene: Phaser.Scene, key: string) {
    const [fillKey, topKey] = terrainAssetKeys(key);
    const needsFill = !scene.textures.exists(fillKey), needsTop = !scene.textures.exists(topKey);
    if (!needsFill && !needsTop) return { fillKey, topKey };
    const s = styles[key] ?? styles.dock;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const size = 128;
    g.fillStyle(s.base).fillRect(0, 0, size, size);
    if (s.pattern === 'plank') {
        for (let row = 0; row < 4; row++) {
            const y = row * 32;
            g.fillStyle(row % 2 ? s.base : s.light, row % 2 ? 1 : .55).fillRect(0, y, size, 32);
            g.lineStyle(3, s.dark, .9).lineBetween(0, y, size, y);
            const seam = row % 2 ? 40 : 92;
            g.lineStyle(2, s.dark, .8).lineBetween(seam, y, seam, y + 32);
            g.fillStyle(s.accent, .8).fillCircle(seam - 6, y + 9, 2).fillCircle(seam - 6, y + 23, 2);
            for (let i = 0; i < 3; i++) { const gx = rand(row * 7 + i) * size; g.lineStyle(1, s.dark, .35).lineBetween(gx, y + 8 + i * 7, gx + 26, y + 9 + i * 7); }
        }
    } else if (s.pattern === 'brick') {
        for (let row = 0; row < 4; row++) {
            const y = row * 32, offset = row % 2 ? 32 : 0;
            for (let x = -offset; x < size; x += 64) {
                g.fillStyle(rand(row * 5 + x) > .5 ? s.light : s.base, .7).fillRoundedRect(x + 3, y + 3, 58, 26, 4);
            }
            g.lineStyle(3, s.dark, .7).lineBetween(0, y, size, y);
        }
    } else if (s.pattern === 'stone' || s.pattern === 'crystal') {
        for (let i = 0; i < 9; i++) {
            const x = rand(i + 1) * size, y = rand(i + 20) * size, r = 14 + rand(i + 40) * 18;
            g.fillStyle(rand(i + 3) > .5 ? s.light : s.dark, .45).fillEllipse(x, y, r * 1.6, r);
        }
        if (s.pattern === 'crystal') for (let i = 0; i < 4; i++) { const x = 16 + i * 32; g.fillStyle(s.accent, .35).fillTriangle(x, 120, x + 10, 70 + rand(i) * 30, x + 20, 120); }
        else for (let i = 0; i < 3; i++) { const x = rand(i + 9) * size; g.lineStyle(2, s.accent, .5).lineBetween(x, 30 + i * 30, x + 18, 44 + i * 30); }
    } else if (s.pattern === 'coral') {
        for (let i = 0; i < 12; i++) { const x = rand(i + 2) * size, y = rand(i + 30) * size; g.fillStyle(i % 3 ? s.light : s.dark, .45).fillCircle(x, y, 6 + rand(i + 50) * 10); }
        for (let i = 0; i < 3; i++) { const x = 20 + i * 42; g.lineStyle(4, s.accent, .55).lineBetween(x, 128, x + 6, 96).lineBetween(x + 6, 104, x + 16, 92); }
    } else if (s.pattern === 'earth') {
        for (let i = 0; i < 10; i++) { const x = rand(i + 4) * size, y = rand(i + 60) * size; g.fillStyle(i % 2 ? s.dark : s.light, .4).fillEllipse(x, y, 18 + rand(i) * 16, 9 + rand(i + 1) * 6); }
        for (let i = 0; i < 4; i++) { const x = rand(i + 70) * size; g.lineStyle(2, s.dark, .45).lineBetween(x, 10 + i * 30, x + 10, 30 + i * 30); }
    } else {
        for (let i = 0; i < 8; i++) { const x = rand(i + 6) * size, y = rand(i + 16) * size; g.fillStyle(i % 2 ? s.light : s.dark, .5).fillCircle(x, y, 14 + rand(i) * 14); }
    }
    if (needsFill) g.generateTexture(fillKey, size, size);
    g.clear();
    // The walkable lip: a lighter cap with a dark underside, like the edge of a plank or a grass tuft.
    g.fillStyle(s.top).fillRect(0, 0, size, 22);
    g.fillStyle(s.light, .55).fillRect(0, 0, size, 6);
    g.fillStyle(s.dark, .9).fillRect(0, 22, size, 6);
    if (s.pattern === 'earth' || key === 'village') for (let x = 4; x < size; x += 12) g.fillStyle(s.top).fillTriangle(x, 26, x + 5, 34 + (x % 3) * 3, x + 9, 26);
    if (s.pattern === 'plank') for (let x = 18; x < size; x += 44) g.fillStyle(s.accent, .9).fillCircle(x, 12, 2.5);
    if (s.pattern === 'coral' || s.pattern === 'crystal') for (let x = 10; x < size; x += 30) g.fillStyle(s.accent, .7).fillCircle(x, 8, 3);
    if (needsTop) g.generateTexture(topKey, size, 34);
    g.destroy();
    return { fillKey, topKey };
}
