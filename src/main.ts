import Phaser from 'phaser';
import './styles.css';
import campaign from './content/stageIndex';
import { maps } from './content/maps';
import { dialogues } from './content/dialogues.ko';
import { relics, treasures, weapons, type WeaponId } from './content/items';
import { canEnter, collectHeart, equip, freshSave, grantReward, maxHp, maxMp, progression, takeDamage, type Reward, type Save } from './core/state';
import { parseSave, SAVE_KEY, SaveStore } from './core/save';
import { Input, type Action } from './game/input';
import { Stage, type Host } from './game/stage';
import { Audio } from './game/audio';
import { portrait3d } from './game/portrait3d';
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const root = el('app'), overlay = el('overlay'), hud = el('hud'), touch = el('touch'), canvas = el('game');
const audio = new Audio();
window.addEventListener('sinbad-renderer-lost', () => { host.pause(); notice('그래픽 연결이 끊겼어요. 체크포인트에서 재시작하면 기록을 이어갈 수 있어요.'); });
let game: Phaser.Game | null = null;
let stage: Stage;
let hudCache = '';
let noticeTimer = 0;
const notice = (text: string) => { el('notice').textContent = text; window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => el('notice').textContent = '', 7000); };
const store = new SaveStore(() => localStorage, notice);
const host: Host = {
    save: freshSave(), hp: 100, mp: 60, input: new Input(root),
    reward(r: Reward) { const before = progression(this.save.totalXp).level; this.save = grantReward(this.save, r); if (progression(this.save.totalXp).level > before) {
        this.hp = maxHp(this.save);
        this.mp = maxMp(this.save);
        stage?.protect(1500);
        notice(`레벨 업! Lv.${progression(this.save.totalXp).level} · 체력과 마력 완전 회복`);
    } this.persist(); this.changed(); },
    objective(id: string) { if (!this.save.completedObjectiveIds.includes(id)) {
        this.save = { ...this.save, completedObjectiveIds: [...this.save.completedObjectiveIds, id] };
        this.persist();
        this.changed();
    } },
    persist() { store.write(this.save); }, changed() { renderHud(); }, notice,
    dialogue(id: string, done: () => void) { stage.freeze(true); const d = dialogues[id]; let line = 0; const finish = () => { done(); resume(); }; const show = () => { panel(`<p class="eyebrow">항해의 대화</p><div class="dialogue"><img src="${portrait3d(id === 'siren' || id === 'freed' ? 'siren' : 'npc')}" alt="${d.name} 초상"><div><h2>${d.name}</h2><p data-testid="dialogue-text">${d.lines[line]}</p><small>${line + 1} / ${d.lines.length}</small></div></div><div class="buttons"><button id="next">${line === d.lines.length - 1 ? '대화 마치기' : '다음'}</button><button class="secondary" id="skip">전체 생략</button></div>`); el('next').onclick = () => { if (++line < d.lines.length)
        show();
    else
        finish(); }; el('skip').onclick = finish; }; show(); },
    pause: () => pauseMenu(), map: () => mapMenu(),
    damage(base, element = 'normal') { this.hp = takeDamage(this.save, this.hp, base, element); this.changed(); return this.hp <= 0; },
    heart(id, large) { const before = progression(this.save.totalXp).level; const result = collectHeart(this.save, this.hp, id, large); this.save = result.save; this.hp = result.hp; if (progression(this.save.totalXp).level > before) {
        this.mp = maxMp(this.save);
        stage.protect(1500);
        notice('레벨 업! 체력과 마력이 모두 회복됐어요.');
    }
    else
        notice(`하트 회복! HP ${Math.ceil(this.hp)} / ${maxHp(this.save)}`); this.sound('heart'); this.persist(); this.changed(); },
    sound(kind) { audio.play(kind, this.save.settings.sfxVolume); },
    clearStage() { const s = campaign.find(x => x.id === this.save.checkpoint.stageId)!; this.reward({ id: s.rewardId, xp: s.clearXp }); if (!this.save.clearedStageIds.includes(s.id))
        this.save.clearedStageIds.push(s.id); this.persist(); stage.freeze(true); panel(`<p class="eyebrow">항로를 열었어요</p><h1>${s.title}</h1><p>첫 완료 보상 ${s.clearXp} XP · 보물과 진행을 저장했어요.</p><div class="buttons"><button id="next-stage">${s.id === 'S03' ? '첫 항해 기록 보기' : '다음 스테이지'}</button><button class="secondary" id="world">항해 지도</button></div>`); el('next-stage').onclick = () => { if (s.id === 'S03')
        mapMenu();
    else
        startStage(s.nextStageId!); }; el('world').onclick = mapMenu; },
};
function panel(html: string) { overlay.hidden = false; overlay.innerHTML = `<section class="panel" role="dialog" aria-modal="true" aria-label="게임 메뉴">${html}</section>`; host.input.clear(); overlay.querySelector<HTMLButtonElement>('button')?.focus(); }
function resume() { overlay.hidden = true; stage.freeze(false); canvas.focus(); host.changed(); }
function boot(s: Save) { host.save = s; host.hp = maxHp(s); host.mp = maxMp(s); audio.unlock(); overlay.hidden = true; hud.hidden = false; touch.hidden = false; hudCache = ''; if (game) {
    stage.scene.restart();
    canvas.focus();
    return;
} stage = new Stage(host); game = new Phaser.Game({ type: Phaser.AUTO, transparent: true, parent: 'game', width: 1280, height: 720, backgroundColor: '#123744', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1500 }, debug: false } }, input: { keyboard: false }, scene: [stage], render: { antialias: true }, audio: { noAudio: true } }); canvas.focus(); }
function startStage(id: string) { if (!maps[id] || !canEnter(host.save, id)) {
    notice('아직 개발 중이거나 앞선 항로를 먼저 완료해야 해요.');
    return;
} host.save.checkpoint = { stageId: id, checkpointId: 'start' }; host.persist(); boot(host.save); }
function renderHud() { const s = host.save, p = progression(s.totalXp), def = campaign.find(x => x.id === s.checkpoint.stageId)!; const html = `<div class="stats"><span class="stage-number">${def.id}</span><div><b>♥ ${Math.ceil(host.hp)} <span>/ ${maxHp(s)}</span></b><meter aria-label="체력" min="0" max="${maxHp(s)}" value="${host.hp}"></meter></div><div><b>Lv.${p.level}</b><small>XP ${p.xpIntoLevel} / ${p.nextXp || 'MAX'} · MP ${Math.floor(host.mp)} / ${maxMp(s)}</small></div></div><div class="mission"><small>현재 항로</small><strong>${def.title}</strong><span>${maps[def.id]?.objective ?? '개발 중'}</span></div><div class="hud-actions"><span>◈ ${s.coins}</span><button id="bag" aria-label="가방과 지도">가방 M</button><button id="pause" aria-label="일시정지">Ⅱ</button></div><div class="weapon-chip">${weapons[s.equippedWeapon].name} <span>${s.weapons.length > 1 ? 'Q 교체' : 'J 공격'}</span>${s.relics.map(r => ` · ${r === 'R01' ? '메달' : r === 'R02' ? '폭풍 수정' : ''}`).join('')}</div>`; if (html === hudCache)
    return; hudCache = html; hud.innerHTML = html; el('bag').onclick = mapMenu; el('pause').onclick = pauseMenu; root.classList.toggle('large-text', s.settings.largeText); }
function exportSave(s: Save = host.save) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })); a.download = 'sinbad-save.json'; a.click(); window.setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
function confirmReplace(text: string, accept: () => void, back: () => void) { panel(`<h2>저장 변경 확인</h2><p>${text}</p><p>현재 기록을 먼저 파일로 보관할 수 있어요.</p><div class="buttons"><button id="backup-export">현재 기록 내보내기</button><button id="confirm" class="secondary">기존 기록을 바꾸고 진행</button><button id="cancel" class="secondary">취소</button></div>`); el('backup-export').onclick = () => exportSave(); el('confirm').onclick = accept; el('cancel').onclick = back; }
async function importFile(file: File) { try {
    if (file.size > 256 * 1024)
        throw Error('256KiB 이하 파일만 가져올 수 있어요.');
    const s = parseSave(await file.text());
    if (!maps[s.checkpoint.stageId])
        throw Error('이 버전에서는 S01~S03 저장만 플레이할 수 있어요.');
    confirmReplace('가져온 파일로 이 브라우저의 진행을 바꿀까요?', () => { store.blocked = false; host.save = s; host.persist(); boot(s); }, () => game ? pauseMenu() : title());
}
catch (e) {
    notice(`가져오기 실패: ${String(e)}`);
} }
function saveControls() { el('export').onclick = () => exportSave(); el<HTMLInputElement>('import').onchange = e => { const file = (e.target as HTMLInputElement).files?.[0]; if (file)
    void importFile(file); }; }
function pauseMenu() { if (!game)
    return; stage.freeze(true); panel(`<p class="eyebrow">잠시 닻을 내리고</p><h1>쉬어 가도 괜찮아</h1><p>이 브라우저의 안전 체크포인트에 저장합니다.<br>다른 기기로 자동 동기화되지는 않아요.</p><div class="buttons"><button id="resume">모험 계속</button><button id="save">체크포인트 저장</button><button id="retry" class="secondary">체크포인트에서 재시작</button><button id="settings" class="secondary">설정·조작법</button><button id="export" class="secondary">저장 내보내기</button><label class="file-button">저장 가져오기<input id="import" type="file" accept=".json,application/json"></label><button id="home" class="secondary">제목으로</button></div>`); el('resume').onclick = resume; el('save').onclick = () => { host.persist(); notice(store.blocked ? '저장이 보호되어 있어요. 파일로 내보내 주세요.' : '체크포인트 기록을 저장했어요.'); }; el('retry').onclick = () => boot(host.save); el('settings').onclick = () => settings(pauseMenu); el('home').onclick = title; saveControls(); }
function settings(back: () => void) { const s = host.save.settings; panel(`<p class="eyebrow">나에게 맞는 모험</p><h2>설정과 조작법</h2><p>A D / ← → 이동 · Space / K 점프 · J 공격<br>L / Shift 회피 · E 조사 · Q / 1~7 무기 · M 가방 · Esc 멈춤</p><p>적의 ⚠ 예고를 보고 피하세요. 하트는 체력 회복, 레벨업은 완전 회복! S01~S03에는 액티브 스킬이 아직 없어요.</p><label>난이도 <select id="difficulty"><option value="relaxed">편안한 모험</option><option value="normal">일반 모험</option></select></label><label>효과음 <input id="volume" type="range" min="0" max="1" step="0.05" value="${s.sfxVolume}"></label><label><input id="motion" type="checkbox" ${s.reducedMotion ? 'checked' : ''}> 연출 줄이기</label><label><input id="large" type="checkbox" ${s.largeText ? 'checked' : ''}> 글자 크게</label><p class="muted">배경 음악은 제작 예정이며, 현재 3D 아트는 프리뷰입니다.</p><button id="back">설정 저장 · 돌아가기</button>`); el<HTMLSelectElement>('difficulty').value = s.difficulty; el('back').onclick = () => { s.difficulty = el<HTMLSelectElement>('difficulty').value as 'relaxed' | 'normal'; s.sfxVolume = Number(el<HTMLInputElement>('volume').value); s.reducedMotion = el<HTMLInputElement>('motion').checked; s.largeText = el<HTMLInputElement>('large').checked; if (game)
    host.persist(); host.changed(); back(); }; }
function mapMenu() { if (!game)
    return; stage.freeze(true); const s = host.save; panel(`<p class="eyebrow">일곱 보물과 바다의 약속</p><h2>${s.clearedStageIds.includes('S03') ? 'M1 · 첫 항해를 마쳤어요' : '항해 지도와 가방'}</h2><p>S01~S03 플레이 가능 · S04~S36 개발 중<br>수집한 무기와 유물은 잃지 않아요.</p><div class="equipment">${s.weapons.map(w => `<button data-weapon="${w}" ${w === s.equippedWeapon ? 'class="selected"' : ''}>${weapons[w].name}<small>${weapons[w].description}</small></button>`).join('')}${s.relics.map(r => `<p>✧ ${relics[r as keyof typeof relics]}</p>`).join('')}<p>핵심 보물 ${s.treasures.length} / 7 · ${Object.values(treasures).map(t => `${t.name}(${t.stage})`).join(' · ')}</p></div><div class="stage-grid">${campaign.map(d => `<button data-stage="${d.id}" ${d.status === 'planned' || !canEnter(s, d.id) ? 'disabled' : ''}><b>${d.id}</b> ${d.title}<small>${d.status === 'planned' ? '개발 중' : s.clearedStageIds.includes(d.id) ? '완료 · 재방문' : canEnter(s, d.id) ? '항해 가능' : '잠김'} · ${d.chapter}장</small></button>`).join('')}</div><div class="buttons"><button id="back">현재 모험으로</button><button id="replay" class="secondary">대화 다시 보기</button></div>`); overlay.querySelectorAll<HTMLButtonElement>('[data-stage]').forEach(b => b.onclick = () => startStage(b.dataset.stage!)); overlay.querySelectorAll<HTMLButtonElement>('[data-weapon]').forEach(b => b.onclick = () => { host.save = equip(s, b.dataset.weapon as WeaponId); host.persist(); host.changed(); mapMenu(); }); el('back').onclick = resume; el('replay').onclick = () => host.dialogue(s.checkpoint.stageId === 'S01' ? 'captain' : s.checkpoint.stageId === 'S02' ? 'siren' : 'storm', () => { }); }
function title() { if (game)
    stage.freeze(true); hud.hidden = true; touch.hidden = true; const existing = store.inspect(); if (existing.save)
    host.save = existing.save; panel(`<div class="title-art" aria-hidden="true"><span class="art-badge">THE FIRST VOYAGE</span><span class="orbit">✦</span><img src="${portrait3d()}" alt=""><span class="art-caption">작은 용기, 커다란 모험.</span></div><p class="eyebrow">SINBAD · THE SEVEN TREASURES</p><h1>신밧드</h1><h2>일곱 보물과 바다의 약속</h2><p>안개 너머의 친구들, 폭풍 너머의 보물.<br>새로운 바닷길을 함께 열어 볼까요?</p><div class="buttons"><button id="new">새 모험 시작</button><button id="continue" class="secondary" ${existing.save ? '' : 'disabled'}>이어하기${existing.save ? ' · ' + existing.save.checkpoint.stageId : ''}</button><button id="settings" class="secondary">설정·조작법</button><button id="export" class="secondary">저장 내보내기</button><label class="file-button">저장 가져오기<input id="import" type="file" accept=".json,application/json"></label>${existing.backup ? '<button id="recover">백업 복구</button>' : ''}</div><p class="muted">${existing.problem ? '저장 기록을 읽지 못했어요. 원본은 보존됩니다.' : existing.save ? '안전 체크포인트에서 완전 회복하여 이어갑니다.' : '저장된 모험이 아직 없어요.'}</p><footer><span>01 — 03 &nbsp; 첫 번째 항해</span><span>3D 아트 프리뷰 · 진행 자동 저장</span></footer>`); el('new').onclick = () => { const start = () => { store.blocked = false; const s = freshSave(); s.settings = { ...host.save.settings }; host.save = s; host.persist(); boot(s); }; if (existing.save || existing.problem)
    confirmReplace('새 모험을 시작하면 현재 브라우저의 진행이 바뀝니다.', start, title);
else
    start(); }; el('continue').onclick = () => { if (existing.save) {
    if (!maps[existing.save.checkpoint.stageId]) {
        notice('이 저장의 스테이지는 아직 개발 중입니다.');
        return;
    }
    boot(existing.save);
} }; el('settings').onclick = () => settings(title); saveControls(); if (existing.backup)
    el('recover').onclick = () => confirmReplace('정상 백업으로 현재 기록을 복구합니다.', () => { store.blocked = false; host.save = existing.backup!; host.persist(); boot(host.save); }, title); }
const actions: [
    Action,
    string
][] = [['left', '←'], ['right', '→'], ['jump', '점프'], ['attack', '공격'], ['dodge', '회피'], ['interact', '조사'], ['cycle', '교체']];
for (const [action, label] of actions) {
    const b = document.createElement('button');
    b.textContent = label;
    b.dataset.action = action;
    b.setAttribute('aria-label', `터치 ${label}`);
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); audio.unlock(); host.input.press(`touch-${e.pointerId}`, action); });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'])
        b.addEventListener(event, e => host.input.release(`touch-${(e as PointerEvent).pointerId}`));
    touch.append(b);
}
window.addEventListener('blur', () => { host.input.clear(); if (game && overlay.hidden)
    pauseMenu(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && game && overlay.hidden)
    pauseMenu(); });
window.addEventListener('storage', e => { if (e.key === SAVE_KEY) {
    store.blocked = true;
    if (game)
        pauseMenu();
    notice('다른 창에서 진행이 바뀌었어요. 자동 저장을 멈췄어요. 파일로 보관 후 새로고침해 주세요.');
} });
overlay.addEventListener('keydown', e => { if (e.key !== 'Tab')
    return; const nodes = [...overlay.querySelectorAll<HTMLElement>('button:not(:disabled),input,select')]; const first = nodes[0], last = nodes.at(-1); if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last?.focus();
}
else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first?.focus();
} });
if (import.meta.env.DEV) {
    Object.defineProperty(window, '__SINBAD_TEST__', { get: () => stage?.snapshot() ?? { stage: null, save: structuredClone(host.save) }, configurable: false });
}
title();
