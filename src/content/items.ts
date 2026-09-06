export const weapons = {
    W01: { name: '여행자의 곡도', damage: 12, interval: 380, range: 80, stage: 'S01', description: '빠른 3타 연속 공격' },
    W02: { name: '바람 부메랑', damage: 9, interval: 700, range: 380, stage: 'S02', description: '나갈 때와 돌아올 때 각각 한 번 타격' },
    W03: { name: '불꽃 곡도', damage: 14, interval: 460, range: 85, stage: 'S06', description: '불꽃 지속 피해' },
    W04: { name: '폭풍의 창', damage: 17, interval: 600, range: 130, stage: 'S11', description: '긴 사거리와 관통' },
    W05: { name: '파도의 활', damage: 13, interval: 450, range: 650, stage: 'S16', description: '수중에서도 쓰는 무한 화살' },
    W06: { name: '달빛 방망이', damage: 24, interval: 800, range: 95, stage: 'S25', description: '강한 넉백과 바위 파괴' },
    W07: { name: '새벽의 검', damage: 21, interval: 420, range: 90, stage: 'S30', description: '저주 보호막에 강한 검' },
} as const;
export type WeaponId = keyof typeof weapons;
export const treasures = {
    T01: { name: '영원의 불씨', stage: 'S06', ability: '불꽃 파동 · 점화' }, T02: { name: '진실의 수정구슬', stage: 'S08', ability: '숨은 문 · 환영 보기' },
    T03: { name: '로크의 깃털', stage: 'S09', ability: '이단 점프 · 활공 · 지정 비행' }, T04: { name: '심해의 진주', stage: 'S16', ability: '자유 수영' },
    T05: { name: '도깨비의 방울', stage: 'S25', ability: '마법 다리' }, T06: { name: '균형의 연꽃', stage: 'S28', ability: '보호막' }, T07: { name: '새벽의 나침반', stage: 'S29', ability: '새벽 파동 · 정화' },
} as const;
export const relics = { R01: '항해자의 메달 · 줍기 반경 96px', R02: '폭풍 수정 · 번개 피해 25% 감소', R03: '해독의 잎', R04: '거인의 장화', R05: '해적의 보물 지도', R06: '숲의 휘장', R07: '우정의 매듭' } as const;
export const goldenHearts = ['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08'] as const;
