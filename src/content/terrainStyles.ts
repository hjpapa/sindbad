export const terrainStyleKeys = ['dock','deck','reef','coral','whale','basalt','crystal','cloud','village','warehouse','sand','shadow','jungle','temple','garden','tower','kingdom'] as const;
export type TerrainStyleKey = typeof terrainStyleKeys[number];
export function terrainAssetKeys(style: string) {
    return [`terrain-${style}-fill`, `terrain-${style}-top`] as const;
}
