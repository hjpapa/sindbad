// optimize-webtoon.py copies the authoritative art-source JSON here, because
// the full-resolution art-source folder is excluded from uploaded builds.
import actionCells from '../content/hero-action.generated.json';

export const heroActionCells = actionCells;
export const heroDisplaySize = 144;

// Visual timing only; the combat hit window remains independent.
export function actionFrame(attackAge: number, hurtAge: number, joyful: boolean, airborne: boolean, vy: number, sim: number, reduced: boolean) {
    if (hurtAge < 280) return 4;
    if (Number.isFinite(attackAge)) return attackAge < 80 ? 5 : attackAge < 200 ? 6 : 7;
    if (joyful) return 8;
    if (airborne) return vy < 0 ? 2 : 3;
    return reduced ? 0 : Math.floor(sim / 400) % 2;
}

export function actionHand(frame: number, x: number, y: number, facing: number) {
    const cell = heroActionCells[frame];
    const scale = heroDisplaySize / 512;
    return { x: x + facing * (cell.hand[0] - 256) * scale, y: y + (cell.hand[1] - cell.baseline) * scale };
}
