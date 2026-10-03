// Guide text is authored with keyboard keys. On phones and tablets the same
// sentence is rewritten for the on-screen buttons so a child never reads
// "press E" on a device without a keyboard.
export type ControlMode = 'keyboard' | 'touch';

const touchRules: [RegExp, string][] = [
    [/A·D 또는 ←→로 움직이고 ↑로 뛰어 보렴\. Space는 검과 대화, L은 회피야\./g, '왼쪽 ◀ ▶로 움직이고 오른쪽 ▲로 뛰어 보렴. 큰 행동 버튼이 검과 대화를 모두 맡아.'],
    [/Q로 바꿔 J로 던져/g, '무기 버튼으로 바꿔 행동 버튼으로 던져'],
    [/Q로 검과 바꾸면/g, '무기 버튼으로 바꾸면'],
    [/Q로 /g, '무기 버튼으로 '],
    [/Q 교체/g, '무기 버튼 교체'],
    [/Space 또는 J로/g, '행동 버튼으로'],
    [/Space 날개 공격/g, '행동 버튼 날개 공격'],
    [/Space 공격/g, '행동 공격'],
    [/Space 행동 · /g, ''],
    [/Space 행동/g, '행동'],
    [/Space로 /g, '행동 버튼으로 '],
    [/J로 /g, '행동 버튼으로 '],
    [/J 공격/g, '행동 공격'],
    [/E로 /g, '행동 버튼으로 '],
    [/E를 /g, '행동 버튼을 '],
    [/E 회전/g, '행동으로 회전'],
    [/E 무료 점화/g, '행동 무료 점화'],
    [/E 또는 /g, '행동 또는 '],
    [/E 점화는/g, '행동 점화는'],
    [/밧줄 E/g, '밧줄 행동'],
    [/ · E(?=$|\n| )/g, ' · 행동'],
    [/ E$/g, ' 행동'],
    [/ · J(?=$|\n| )/g, ' · 행동 공격'],
    [/행동 버튼 날개 공격/g, '날개 공격'],
    [/R은 /g, '능력 버튼은 '],
    [/ R 파동/g, ' 능력 버튼 파동'],
    [/(\S+) R$/g, '$1 능력'],
];

export function controlText(text: string, mode: ControlMode): string {
    if (mode === 'keyboard' || !text) return text;
    return touchRules.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
}

export function detectControlMode(): ControlMode {
    if (typeof window === 'undefined') return 'keyboard';
    // ?controls=touch lets a desktop browser preview the phone layout.
    const forced = new URLSearchParams(window.location.search).get('controls');
    if (forced === 'touch' || forced === 'keyboard') return forced;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    return coarse || navigator.maxTouchPoints > 0 && !window.matchMedia?.('(pointer: fine)').matches ? 'touch' : 'keyboard';
}
