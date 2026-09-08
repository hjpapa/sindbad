export interface Platform {
    x: number;
    y: number;
    w: number;
    h: number;
    requiredGround?: boolean;
    motion?: { rise: number; period: number };
}
export interface Spawn {
    id: string;
    x: number;
    y: number;
    kind: 'skeleton' | 'archer' | 'captain' | 'crab' | 'siren' | 'spirit' | 'guardian';
    hp: number;
}
export interface ObjectDef {
    id: string;
    x: number;
    y: number;
    kind: 'npc' | 'bell' | 'shell' | 'chest' | 'exit' | 'rod' | 'crisis' | 'checkpoint' | 'remote' | 'gear' | 'key' | 'gate' | 'rescue' | 'golden';
    label: string;
    needs?: string[];
    reward?: string;
    rewardFlags?: string[];
    dialogue?: string;
}
export interface MapDef {
    id: string;
    width: number;
    theme: 'harbor' | 'reef' | 'storm' | 'whale' | 'coral';
    water?: { x:number; y:number; w:number; h:number }[];
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

    S04: {id:'S04',width:3900,theme:'whale',objective:'구명 장비 3개 수집 → 깨어난 고래의 발판 → 구조 보트에 전달',
      platforms:[ground(0,700),ground(800,750,584),{...ground(1660,420),motion:{rise:48,period:5000}},ground(2200,620,560),ground(2940,960),{x:960,y:512,w:176,h:24},{x:1180,y:440,w:192,h:24},{x:3180,y:536,w:192,h:72}],
      spawns:[{id:'S04.enemy.crab.1',kind:'crab',x:520,y:565,hp:30},{id:'S04.enemy.crab.2',kind:'crab',x:1420,y:540,hp:30},{id:'S04.enemy.crab.3',kind:'crab',x:2580,y:520,hp:30},{id:'S04.enemy.crab.4',kind:'crab',x:3400,y:565,hp:30}],
      objects:[{id:'S04.sailor',kind:'npc',x:250,y:552,label:'선원 · E 대화',dialogue:'whale'},{id:'S04.gear.1',kind:'gear',x:560,y:553,label:'구명 조끼 ① · E'},{id:'S04.gear.2',kind:'gear',x:860,y:532,label:'구명 밧줄 ② · E'},{id:'S04.gear.3',kind:'gear',x:1500,y:532,label:'구명 튜브 ③ · E'},{id:'S04.golden',kind:'golden',x:1270,y:392,label:'바위 아치의 황금 하트 · E',reward:'G01'},{id:'S04.cp.escape',kind:'checkpoint',x:2300,y:520,label:'깨어난 고래의 쉼터'},{id:'S04.exit',kind:'exit',x:3690,y:550,label:'구조 보트 · 장비 전달 E',needs:['S04.gear.1','S04.gear.2','S04.gear.3']}],
      hearts:[{id:'S04.heart.1',x:1610,y:500},{id:'S04.heart.2',x:3000,y:560,large:true}],checkpoints:[{id:'start',x:120,y:548},{id:'escape',x:2300,y:500}]},
    S05: {id:'S05',width:4100,theme:'coral',objective:'산호 열쇠 → 왕관 장식 → 산호문 → 나이라 구출 → 바닷길',
      platforms:[ground(0,4100),{x:600,y:536,w:192,h:72},{x:860,y:464,w:192,h:24},{x:1440,y:528,w:192,h:80},{x:1980,y:536,w:192,h:72},{x:3100,y:536,w:192,h:72}],
      water:[{x:2900,y:466,w:560,h:254}],
      spawns:[{id:'S05.enemy.guardian.1',kind:'guardian',x:430,y:558,hp:38},{id:'S05.enemy.guardian.2',kind:'guardian',x:1200,y:558,hp:38},{id:'S05.enemy.guardian.3',kind:'guardian',x:1790,y:558,hp:38},{id:'S05.enemy.guardian.4',kind:'guardian',x:2270,y:558,hp:38},{id:'S05.enemy.guardian.5',kind:'guardian',x:3580,y:558,hp:38}],
      objects:[{id:'S05.hint',kind:'npc',x:240,y:551,label:'나이라의 목소리 · E',dialogue:'nairaHint'},{id:'S05.key',kind:'key',x:960,y:414,label:'산호 열쇠 · E'},{id:'S05.crown',kind:'chest',x:1870,y:554,label:'왕관 장식 보물함 · E',needs:['S05.key']},{id:'S05.gate',kind:'gate',x:2460,y:543,label:'산호문 · 장식 끼우기 E',needs:['S05.crown']},{id:'S05.rescue',kind:'rescue',x:2650,y:554,label:'나이라 구출 · E',needs:['S05.gate'],dialogue:'naira',rewardFlags:['bubbleBlessing']},{id:'S05.cp.rescue',kind:'checkpoint',x:2760,y:562,label:'산호문 밖 쉼터',needs:['S05.rescue']},{id:'S05.golden',kind:'golden',x:3200,y:487,label:'선택 산호방 · 황금 하트 E',needs:['S05.rescue'],reward:'G02'},{id:'S05.exit',kind:'exit',x:3880,y:554,label:'열린 바닷길 · E',needs:['S05.crown','S05.gate','S05.rescue']}],
      hearts:[{id:'S05.heart.1',x:1600,y:480},{id:'S05.heart.2',x:2800,y:563,large:true}],checkpoints:[{id:'start',x:120,y:548},{id:'rescue',x:2760,y:548}]},
};
