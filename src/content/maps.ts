export interface Platform {
    x: number;
    y: number;
    w: number;
    h: number;
    requiredGround?: boolean;
}
export interface Spawn {
    id: string;
    x: number;
    y: number;
    kind: 'skeleton' | 'archer' | 'captain' | 'crab' | 'siren' | 'spirit';
    hp: number;
}
export interface ObjectDef {
    id: string;
    x: number;
    y: number;
    kind: 'npc' | 'bell' | 'shell' | 'chest' | 'exit' | 'rod' | 'crisis' | 'checkpoint' | 'remote';
    label: string;
    needs?: string[];
    reward?: string;
    dialogue?: string;
}
export interface MapDef {
    id: string;
    width: number;
    theme: 'harbor' | 'reef' | 'storm';
    platforms: Platform[];
    spawns: Spawn[];
    objects: ObjectDef[];
    hearts: {
        id: string;
        x: number;
        y: number;
        large?: boolean;
    }[];
    checkpoints: {
        id: string;
        x: number;
        y: number;
    }[];
    objective: string;
}
const ground = (x: number, w: number, y = 608): Platform => ({ x, y, w, h: 112, requiredGround: true });
export const maps: Record<string, MapDef> = {
    S01: { id: 'S01', width: 4800, theme: 'harbor', objective: '선장과 대화 → 해골 대장 격파 → 출항 종 울리기',
        platforms: [ground(0, 4800), { x: 480, y: 536, w: 160, h: 72 }, { x: 680, y: 464, w: 192, h: 144 }, { x: 1330, y: 544, w: 192, h: 64 }, { x: 2000, y: 528, w: 256, h: 80 }, { x: 2670, y: 544, w: 192, h: 64 }, { x: 3400, y: 544, w: 192, h: 64 }],
        spawns: [{ id: 'S01.enemy.skeleton.01', x: 1000, y: 560, kind: 'skeleton', hp: 28 }, { id: 'S01.enemy.skeleton.02', x: 1690, y: 560, kind: 'skeleton', hp: 28 }, { id: 'S01.enemy.skeleton.03', x: 2420, y: 560, kind: 'skeleton', hp: 28 }, { id: 'S01.enemy.skeleton.04', x: 3070, y: 560, kind: 'skeleton', hp: 28 }, { id: 'S01.enemy.archer.01', x: 3660, y: 560, kind: 'archer', hp: 24 }, { id: 'S01.enemy.captain', x: 4220, y: 550, kind: 'captain', hp: 80 }],
        objects: [{ id: 'S01.captainTalk', x: 250, y: 554, kind: 'npc', label: '선장 · E 대화', dialogue: 'captain' }, { id: 'S01.medal', x: 774, y: 424, kind: 'chest', label: '항해자의 메달', reward: 'R01' }, { id: 'S01.cp.boss', x: 3870, y: 570, kind: 'checkpoint', label: '대장 앞 쉼터' }, { id: 'S01.exit', x: 4610, y: 550, kind: 'exit', label: '출항 종 · E', needs: ['S01.captainTalk', 'S01.enemy.captain'] }],
        hearts: [{ id: 'S01.heart.01', x: 1160, y: 567 }, { id: 'S01.heart.02', x: 2850, y: 506 }, { id: 'S01.heart.03', x: 3930, y: 566, large: true }], checkpoints: [{ id: 'start', x: 120, y: 548 }, { id: 'boss', x: 3870, y: 548 }], },
    S02: { id: 'S02', width: 4800, theme: 'reef', objective: '조개 종 3개 공격 → 세이렌 저주 해제 → 보물함 → 등대',
        platforms: [ground(0, 650), ground(770, 640, 576), ground(1540, 610), ground(2270, 660, 552), ground(3060, 1740), { x: 4300, y: 520, w: 200, h: 24 }],
        spawns: [{ id: 'S02.enemy.crab.01', x: 510, y: 570, kind: 'crab', hp: 28 }, { id: 'S02.enemy.crab.02', x: 1160, y: 540, kind: 'crab', hp: 28 }, { id: 'S02.enemy.crab.03', x: 1830, y: 570, kind: 'crab', hp: 28 }, { id: 'S02.enemy.crab.04', x: 2680, y: 510, kind: 'crab', hp: 28 }, { id: 'S02.enemy.siren', x: 3770, y: 552, kind: 'siren', hp: 160 }],
        objects: [{ id: 'S02.shell.1', x: 960, y: 523, kind: 'shell', label: '조개 종 ① · J' }, { id: 'S02.shell.2', x: 1930, y: 555, kind: 'shell', label: '조개 종 ② · J' }, { id: 'S02.shell.3', x: 2830, y: 499, kind: 'shell', label: '조개 종 ③ · J' }, { id: 'S02.cp.boss', x: 3270, y: 570, kind: 'checkpoint', label: '안개 속 쉼터' }, { id: 'S02.sirenTalk', x: 3450, y: 554, kind: 'npc', label: '세이렌의 목소리 · E', dialogue: 'siren' }, { id: 'S02.boomerang', x: 4050, y: 560, kind: 'chest', label: '바람 부메랑 · E', needs: ['S02.enemy.siren'], reward: 'W02' }, { id: 'S02.remote', x: 4440, y: 465, kind: 'remote', label: '먼 조개 · 부메랑', reward: 'coins' }, { id: 'S02.exit', x: 4630, y: 554, kind: 'exit', label: '등대 불 · E', needs: ['S02.enemy.siren', 'S02.boomerang'] }],
        hearts: [{ id: 'S02.heart.01', x: 1600, y: 560 }, { id: 'S02.heart.02', x: 3320, y: 560, large: true }], checkpoints: [{ id: 'start', x: 120, y: 548 }, { id: 'boss', x: 3270, y: 548 }], },
    S03: { id: 'S03', width: 4800, theme: 'storm', objective: '피뢰 장치 2개 수리 → 폭풍 수정 → 돛대 위기 → 구명 밧줄',
        platforms: [ground(0, 1700), ground(1820, 1430), ground(3370, 1430), { x: 740, y: 528, w: 240, h: 80 }, { x: 2100, y: 528, w: 256, h: 80 }, { x: 2630, y: 448, w: 200, h: 24 }, { x: 3920, y: 528, w: 200, h: 80 }],
        spawns: [{ id: 'S03.enemy.spirit.01', x: 1180, y: 552, kind: 'spirit', hp: 32 }, { id: 'S03.enemy.spirit.02', x: 2450, y: 552, kind: 'spirit', hp: 32 }, { id: 'S03.enemy.spirit.03', x: 3570, y: 552, kind: 'spirit', hp: 32 }],
        objects: [{ id: 'S03.captainTalk', x: 250, y: 554, kind: 'npc', label: '선장 · E 대화', dialogue: 'storm' }, { id: 'S03.rod.1', x: 860, y: 477, kind: 'rod', label: '피뢰 장치 ① · E' }, { id: 'S03.cp.middle', x: 1920, y: 570, kind: 'checkpoint', label: '갑판 쉼터' }, { id: 'S03.rod.2', x: 2210, y: 477, kind: 'rod', label: '피뢰 장치 ② · E' }, { id: 'S03.coins', x: 2730, y: 404, kind: 'chest', label: '돛대의 금화', reward: 'coins' }, { id: 'S03.crystal', x: 3020, y: 554, kind: 'chest', label: '폭풍 수정 · E', needs: ['S03.rod.1', 'S03.rod.2'], reward: 'R02' }, { id: 'S03.crisis', x: 3730, y: 554, kind: 'crisis', label: '돛대의 균열 · E', needs: ['S03.crystal'], dialogue: 'crisis' }, { id: 'S03.exit', x: 4620, y: 554, kind: 'exit', label: '구명 밧줄 · E', needs: ['S03.rod.1', 'S03.rod.2', 'S03.crystal', 'S03.crisis'] }],
        hearts: [{ id: 'S03.heart.01', x: 1460, y: 560 }, { id: 'S03.heart.02', x: 1970, y: 560, large: true }, { id: 'S03.heart.crisis', x: 3800, y: 560, large: true }], checkpoints: [{ id: 'start', x: 120, y: 548 }, { id: 'middle', x: 1920, y: 548 }, { id: 'crisis', x: 3770, y: 548 }], },
};
