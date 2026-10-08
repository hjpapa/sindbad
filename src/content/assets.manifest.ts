import {terrainStyleKeys} from './terrainStyles';
import {effectSheets} from './effects';
import {touchIconNames,touchIconPath,type TouchIconKey} from './touchIcons';
import {worldPropKeys} from './worldProps';

export interface AssetEntry {
    key: string;
    path: string;
    width: number;
    height: number;
    kind: 'svg' | 'image' | 'sheet';
    status: 'draft';
    source: string;
    license: string;
    // Square frame edge for sprite sheets.
    frame?: number;
}
const draftAssets: AssetEntry[] = ['ariana', 'kite', 'stormCloud', 'debris', 'roc', 'flightRing', 'player', 'playerRun', 'skeleton', 'siren', 'crab', 'spirit', 'chest', 'heart', 'shell', 'rod', 'bell', 'guardian', 'naira', 'gear', 'key', 'gate', 'golden', 'rah', 'torch', 'furnace', 'vine', 'rope', 'genie', 'mirror', 'bat', 'starMap', 'journal', 'bandit', 'beast', 'boss', 'quest', 'gift', 'bridge', 'ending'].map(key => ({ key, path: `assets/draft/${key}.svg`, width: 96, height: 128, kind: 'svg', status: 'draft', source: '프로젝트 자체 제작 벡터 · scripts/make-polished-art.mjs 등', license: '이 프로젝트에서 사용·수정 가능. 외부 이미지 없음.' }));
const storyAssets: AssetEntry[] = ['cargo','starDevice','lantern','treasureAltar','elephant','snake','tiger','dragon','stoneGiant','villager','mira','king','baru','pirateCaptain','lotusShrine','arrow','boomerang','moonRock'].map(key=>({key,path:`assets/story/${key}.svg`,width:96,height:128,kind:'svg',status:'draft',source:'프로젝트 자체 제작 · scripts/make-story-art.mjs',license:'프로젝트 자체 디자인. 사용·수정 가능.'}));
// Runtime copies are resized WebP (A8 DOM icons: PNG) made by scripts/optimize-webtoon.py from
// the lossless originals kept in art-source/webtoon/. Sizes below are the runtime files.
const portrait = { width: 512, height: 768 };
const runtimeSize: Record<string, { width: number; height: number; frame?: number }> = {
    'prop-flight-ring': {width:96,height:128},
    'prop-gust-cloud': {width:96,height:128},
    'prop-falling-debris': {width:96,height:128},
    'prop-chest': {width:96,height:128},
    'prop-heart': {width:96,height:128},
    'prop-shell': {width:96,height:128},
    'prop-bell': {width:96,height:128},
    'prop-golden': {width:96,height:128},
    'prop-key': {width:96,height:128},
    'prop-lifevest': {width:96,height:128},
    'prop-rescue-rope': {width:96,height:128},
    'prop-lifering': {width:96,height:128},
    'prop-lightning-rod': {width:96,height:128},
    'prop-damaged-mast': {width:96,height:128},
    'prop-coral-gate': {width:96,height:128},
    'prop-vine': {width:96,height:128},
    'prop-torch': {width:96,height:128},
    'prop-furnace': {width:96,height:128},
    'prop-wave-rope': {width:96,height:128},
    'prop-mirror': {width:96,height:128},
    'prop-journal': {width:96,height:128},
    'prop-star-map': {width:96,height:128},
    'prop-lantern': {width:96,height:128},
    'prop-star-device': {width:96,height:128},
    'prop-cargo': {width:96,height:128},
    'prop-gift': {width:96,height:128},
    'prop-treasure-altar': {width:96,height:128},
    'prop-moon-rock': {width:96,height:128},
    'prop-lotus-shrine': {width:96,height:128},
    'prop-ending': {width:96,height:128},
    'weapon-W01': {width:160,height:64},
    'weapon-W02': {width:160,height:64},
    'weapon-W03': {width:160,height:64},
    'weapon-W04': {width:160,height:64},
    'weapon-W05': {width:80,height:160},
    'weapon-W06': {width:160,height:64},
    'weapon-W07': {width:160,height:64},
    'hero-run': { width: 768, height: 512, frame: 256 },
    'hero-action': { width: 768, height: 768, frame: 256 },
    'captain-webtoon': { width: 512, height: 768 },
    'sailor-webtoon': { width: 512, height: 768 },
    'enemy-atlas': { width: 768, height: 512, frame: 256 },
    'enemy-actions': { width: 1024, height: 2560, frame: 256 },
    'kite-actions': {width:1024,height:256,frame:256},
    'siren-actions': {width:1024,height:256,frame:256},
    'bat-actions': {width:1024,height:256,frame:256},
    'spirit-actions': {width:1024,height:256,frame:256},
    'roc-actions': {width:768,height:512,frame:256},
    'roc-webtoon': { width: 768, height: 512 },
    'whale-webtoon': { width: 1536, height: 1024 },
    'crab-webtoon': { width: 512, height: 512 },
    'elephant-webtoon': { width: 512, height: 512 },
    'naira-faces': { width: 768, height: 384 },
    'siren-faces': { width: 768, height: 384 },
    'rah-faces': { width: 768, height: 384 },
    'genie-faces': { width: 768, height: 384 },
    'ariana-faces': { width: 768, height: 384 },
    'king-faces': { width: 768, height: 384 },
    'mira-faces': { width: 768, height: 384 },
    'baru-faces': { width: 768, height: 384 },
    'captain-faces': { width: 768, height: 384 },
};
for (const sheet of effectSheets) runtimeSize[sheet.key] = {width:sheet.columns*sheet.frame,height:sheet.rows*sheet.frame,frame:sheet.frame};
const touchIconAssets: AssetEntry[] = touchIconNames.map(name => {
    const key:TouchIconKey=`ui-${name}`;
    runtimeSize[key]={width:128,height:128};
    return {key,path:touchIconPath(key),...runtimeSize[key],kind:'image',status:'draft',
        source:'2026-10-04 OpenAI built-in imagegen · docs/ART_PROMPTS.md · lossless originals art-source/webtoon',
        license:'Project original style reference. ART_DRAFT; final art and physical device approval pending.'};
});
const effectAssets: AssetEntry[] = effectSheets.map(sheet => ({key:sheet.key,path:`assets/webtoon/${sheet.key}.webp`,
    ...runtimeSize[sheet.key],kind:'sheet',status:'draft',source:'2026-10-04 OpenAI built-in imagegen · docs/ART_PROMPTS.md · lossless originals art-source/webtoon',
    license:'Project original style reference only. ART_DRAFT; final animation/art approval pending.'}));
const weaponAssets: AssetEntry[] = ['W01','W02','W03','W04','W05','W06','W07'].flatMap(id=>[
    {key:`weapon-${id}`,path:`assets/weapons/${id}.webp`,...runtimeSize[`weapon-${id}`],kind:'image' as const,status:'draft' as const,
        source:'2026-10-03 OpenAI built-in imagegen · docs/ART_PROMPTS.md · lossless originals art-source/weapons',
        license:'Project original weapon/style references only. ART_DRAFT; final art approval pending.'},
    {key:`weapon-fallback-${id}`,path:`assets/weapons/${id}.svg`,...runtimeSize[`weapon-${id}`],kind:'svg' as const,status:'draft' as const,
        source:'Preserved project SVG · scripts/make-weapon-art.mjs',license:'Project original design; use and modification allowed.'},
]);
const illustratedAssets: AssetEntry[] = [...Array.from({length:7},(_,i)=>`chapter-${i+1}`),'hero-webtoon','hero-action','captain-webtoon','sailor-webtoon','ariana-webtoon','kuura-webtoon','naira-webtoon','mira-webtoon','baru-webtoon','king-webtoon','villager-webtoon','genie-webtoon','roc-webtoon','elephant-webtoon','hero-run','enemy-atlas','enemy-actions','kite-actions','siren-actions','bat-actions','spirit-actions','roc-actions','whale-webtoon','chef-webtoon','siren-webtoon','rah-webtoon','crab-webtoon'].map(key=>{
    const size=key.startsWith('chapter')?{width:1536,height:1024}:runtimeSize[key]??portrait;
    return {key,path:`assets/webtoon/${key}.webp`,...size,kind:size.frame?'sheet':'image',status:'draft',source:`${key==='roc-actions'?'2026-10-07':['bat-actions','spirit-actions'].includes(key)?'2026-10-06':'2026-10-01~04'} OpenAI built-in imagegen · docs/ART_PROMPTS.md · 원본 art-source/webtoon (무손실)`,license:'본 프로젝트용 AI 생성 원본. 특정 작품·작가 참조 없음. 최종 아트 QA·애니메이션 승인 전.'};
});
// Rectangular expression sheets are cropped by the DOM portrait, never eagerly
// preloaded into a Phaser scene. Each runtime cell is 256x384.
const faceAssets: AssetEntry[] = ['naira','siren','rah','genie','ariana','king','mira','baru','captain'].map(character => {
    const key = `${character}-faces`;
    return {key, path:`assets/webtoon/${key}.webp`, ...runtimeSize[key], kind:'image', status:'draft',
        source:'2026-10-03 OpenAI built-in imagegen · docs/ART_PROMPTS.md · original art-source/webtoon (lossless)',
        license:'Project AI artwork. Original project character/style references only. ART_DRAFT; final art approval pending.'};
});
for (const style of terrainStyleKeys) {
    runtimeSize[`terrain-${style}-fill`] = {width:128,height:128};
    runtimeSize[`terrain-${style}-top`] = {width:128,height:34};
}
const terrainAssets: AssetEntry[] = terrainStyleKeys.flatMap(style => ['fill','top'].map(part => {
    const key = `terrain-${style}-${part}`;
    return {key,path:`assets/terrain/${key}.webp`,...runtimeSize[key],kind:'image' as const,status:'draft' as const,
        source:'2026-10-03 OpenAI built-in imagegen · docs/ART_PROMPTS.md · originals art-source/terrain (lossless)',
        license:'Project original material art. Only project style reference. ART_DRAFT; final art approval pending.'};
}));
const worldPropAssets:AssetEntry[]=worldPropKeys.map(key=>({key,path:`assets/webtoon/${key}.webp`,...runtimeSize[key],kind:'image',status:'draft',
    source:'2026-10-04 OpenAI built-in imagegen · docs/ART_PROMPTS.md · lossless originals art-source/webtoon',
    license:'Original project style reference. ART_DRAFT; final art approval pending.'}));
export const assets: AssetEntry[] = [...draftAssets, ...storyAssets, ...weaponAssets, ...illustratedAssets, ...faceAssets, ...terrainAssets, ...effectAssets, ...touchIconAssets,...worldPropAssets];
