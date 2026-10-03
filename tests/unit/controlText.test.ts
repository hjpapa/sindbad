import { describe, expect, it } from 'vitest';
import { controlText } from '../../src/game/controlText';
import { maps } from '../../src/content/maps';
import { dialogues } from '../../src/content/dialogues.ko';

describe('touch wording for on-screen buttons', () => {
    it('leaves keyboard text untouched', () => {
        expect(controlText('선장 · E 대화', 'keyboard')).toBe('선장 · E 대화');
    });

    it('rewrites key names into the touch buttons', () => {
        expect(controlText('선장 · E 대화', 'touch')).toBe('선장 · 행동 대화');
        expect(controlText('조개 종 · E', 'touch')).toBe('조개 종 · 행동');
        expect(controlText('입구 덩굴 · 불씨를 옮긴 뒤 E', 'touch')).toBe('입구 덩굴 · 불씨를 옮긴 뒤 행동');
        expect(controlText('바람 부메랑 획득! Q로 바꿔 J로 던져 보세요.', 'touch')).toBe('바람 부메랑 획득! 무기 버튼으로 바꿔 행동 버튼으로 던져 보세요.');
        expect(controlText('빈틈 · J 공격', 'touch')).toBe('빈틈 · 행동 공격');
        expect(controlText('밧줄 E / 점프', 'touch')).toBe('밧줄 행동 / 점프');
    });

    it('never shows a bare keyboard key in touch captions or dialogue', () => {
        const captions = Object.values(maps).flatMap(map => [map.objective, ...map.objects.map(object => object.label)]);
        const lines = Object.values(dialogues).flatMap(d => d.lines);
        const leftovers = [...captions, ...lines].map(text => controlText(text, 'touch')).filter(text => /(^|[\s·(])(E|J|Q|Space)(?=$|[\s로를·)])/.test(text));
        expect(leftovers).toEqual([]);
    });
});
