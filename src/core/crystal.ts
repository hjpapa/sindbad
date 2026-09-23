export const mirrorSolution = [1, 3, 2] as const;
export const mirrorSymbols = ['↑', '→', '↓', '←'] as const;
export function rotateMirror(directions: readonly number[], index: number): number[] {
    return directions.map((value, i) => i === index ? (value + 1) % 4 : value);
}
export function connectedMirrors(directions: readonly number[]): number {
    const blocked = mirrorSolution.findIndex((value, i) => directions[i] !== value);
    return blocked < 0 ? 3 : blocked;
}
export const crystalSafeStart = 1400;
