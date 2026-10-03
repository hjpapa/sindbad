import {describe, expect, it} from 'vitest';
import {dialogueArt, npcFaceKeys, parseDialogueLine} from '../../src/game/dialogueArt';
import {dialogues} from '../../src/content/dialogues.ko';
import {assets} from '../../src/content/assets.manifest';
import {maps} from '../../src/content/maps';

describe('NPC dialogue expression and speaker contract', () => {
    it('removes only a valid leading tag and preserves every spoken character', () => {
        expect(parseDialogueLine('[기쁨]아리아나: 함께해요!')).toEqual({text:'아리아나: 함께해요!',expression:'joy',speaker:'아리아나'});
        expect(parseDialogueLine('[걱정]길이 막혔어요.').text).toBe('길이 막혔어요.');
        expect(parseDialogueLine('문장 안의 [기쁨]은 그대로예요.').text).toBe('문장 안의 [기쁨]은 그대로예요.');
        expect(parseDialogueLine('[다른 태그]원문').text).toBe('[다른 태그]원문');
    });
    it('switches speakers after a tag and resets the next untagged line', () => {
        const art=(raw:string)=>dialogueArt('S35.outro','아리아나',raw,0,'/fallback.svg');
        expect(art('[기쁨]왕: 축복하노라.')).toMatchObject({character:'king',frame:1,src:'/assets/webtoon/king-faces.webp'});
        expect(art('아리아나: 고마워요.')).toMatchObject({character:'ariana',frame:0,expression:'neutral'});
        expect(art('[걱정]신밧드: 조심해요.')).toMatchObject({character:undefined,frame:0,src:'/assets/webtoon/hero-webtoon.webp'});
    });
    it('does not impersonate an unknown speaker, a deity or a journal', () => {
        expect(dialogueArt('S35.outro','아리아나','낯선 사람: 안녕',0,'/fallback.svg').src).toBe('/fallback.svg');
        expect(dialogueArt('S28.outro','비슈누의 평온한 환영','환영: 지킬 대상을 잊지 말아라.',0,'/fallback.svg').src).toBe('/assets/story/lotusShrine.svg');
        expect(dialogueArt('crystalJournal','숨은 항해 일지','페이지를 찾았다.',0,'/assets/draft/journal.svg').character).toBeUndefined();
        expect(dialogueArt('descent','신밧드와 공기방울','숨 쉴 길을 지켜 드릴게요.',1,'/fallback.svg').character).toBe('naira');
    });
    it('registers all nine sheets at 256x384 per runtime cell with a static fallback', () => {
        for(const key of npcFaceKeys){
            expect(assets.find(asset=>asset.key===`${key}-faces`)).toMatchObject({width:768,height:384,status:'draft'});
            expect(assets.some(asset=>asset.key===`${key}-webtoon`)).toBe(true);
        }
        expect(maps.S20.objects.find(object=>object.kind==='npc')?.texture).toBe('mira-webtoon');
    });
    it('uses all three expressions in real dialogue content for each NPC', () => {
        const seen=new Map(npcFaceKeys.map(key=>[key,new Set<string>()]));
        for(const [id,dialogue] of Object.entries(dialogues))for(const [index,line] of dialogue.lines.entries()){
            const art=dialogueArt(id,dialogue.name,line,index,'/fallback.svg');
            if(art.character)seen.get(art.character)!.add(art.expression);
        }
        for(const expressions of seen.values())expect([...expressions].sort()).toEqual(['joy','neutral','worried']);
    });
});
