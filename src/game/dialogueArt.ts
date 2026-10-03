export const npcFaceKeys = ['naira', 'siren', 'rah', 'genie', 'ariana', 'king', 'mira', 'baru', 'captain'] as const;
export type NpcFaceKey = typeof npcFaceKeys[number];
export type DialogueExpression = 'neutral' | 'joy' | 'worried';
const aliases: Record<string, NpcFaceKey> = {
    '나이라': 'naira', '나이라의 공기방울': 'naira', '세이렌': 'siren', '라흐': 'rah',
    '지니 하질': 'genie', '하질': 'genie', '아리아나': 'ariana', '아리아나의 환영': 'ariana',
    '아리아나의 목소리': 'ariana', '아리아나와 로크새': 'ariana', '왕': 'king',
    '미라': 'mira', '탐험가 미라': 'mira', '바루': 'baru', '도깨비 바루': 'baru', '선장': 'captain',
};
const staticSpeakers: Record<string, string> = {
    '신밧드': '/assets/webtoon/hero-webtoon.webp',
    '쿠우라': '/assets/webtoon/kuura-webtoon.webp', '쿠우라의 분신': '/assets/webtoon/kuura-webtoon.webp',
    '카딘': '/assets/story/pirateCaptain.svg', '환영': '/assets/story/lotusShrine.svg',
};

export function parseDialogueLine(raw: string) {
    const tag = raw.match(/^\[(기쁨|걱정)\]/);
    const expression: DialogueExpression = tag?.[1] === '기쁨' ? 'joy' : tag ? 'worried' : 'neutral';
    const text = tag ? raw.slice(tag[0].length) : raw;
    const speaker = text.match(/^([^:]{1,24}):/)?.[1].trim();
    return {text, expression, speaker};
}

// The prefix is parsed before the speaker, and every line starts from neutral.
// Explicit speakers take priority over the dialogue's default NPC.
export function dialogueArt(id: string, name: string, raw: string, index: number, fallback: string) {
    const parsed = parseDialogueLine(raw);
    const speaker = parsed.speaker ?? (id === 'descent' ? ['신밧드', '나이라', '신밧드'][index] : name);
    const character = aliases[speaker];
    const frame = parsed.expression === 'joy' ? 1 : parsed.expression === 'worried' ? 2 : 0;
    const staticPath = character ? `/assets/webtoon/${character}-webtoon.webp` : staticSpeakers[speaker] ?? fallback;
    return {...parsed, speaker, character, frame: character ? frame : 0,
        src: character ? `/assets/webtoon/${character}-faces.webp` : staticPath, fallback: staticPath};
}

export const expressionNames: Record<DialogueExpression, string> = {neutral: '기본', joy: '기쁨', worried: '걱정'};
