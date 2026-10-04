import Phaser from 'phaser';
import './styles.css';
import './mobile.css';
import campaign from './content/stageIndex';
import { maps } from './content/maps';
import { dialogues } from './content/dialogues.ko';
import { relics, treasures, weapons, type WeaponId } from './content/items';
import { canEnter, collectHeart, equip, freshSave, grantReward, maxHp, maxMp, progression, takeDamage, type Reward, type Save } from './core/state';
import { parseSave, SAVE_KEY, SaveStore } from './core/save';
import { Input } from './game/input';
import { Stage, type ActionContext, type Host } from './game/stage';
import { Audio } from './game/audio';
import { activeSkills, ownedActiveSkills, selectActiveSkill, type ActiveSkillId } from './core/skills';
import { controlText, detectControlMode, type ControlMode } from './game/controlText';
import { TouchControls } from './game/touch';
import { weaponIcon, installWeaponIconFallback } from './game/weapons';
import { dialogueArt, expressionNames } from './game/dialogueArt';
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const root = el('app'), overlay = el('overlay'), hud = el('hud'), touch = el('touch'), canvas = el('game'), loadingBox = el('loading');
installWeaponIconFallback(root);
const audio = new Audio();
let game: Phaser.Game | null = null;
let stage: Stage;
let hudCache = '';
let noticeTimer = 0;
let controlMode: ControlMode = detectControlMode();
const ctl = (text: string) => controlText(text, controlMode);
const notice = (text: string) => { el('notice').textContent = ctl(text); window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(() => el('notice').textContent = '', 6000); };
const store = new SaveStore(() => localStorage, notice);
function portraitPath(id:string){
    const character=['captain','storm'].includes(id)?'captain-webtoon':id==='whale'?'sailor-webtoon':['siren','freed'].includes(id)?'siren-webtoon':['rah','flameHint'].includes(id)?'rah-webtoon':['naira','nairaHint','waveHint','descent'].includes(id)?'naira-webtoon':['hazil','crystalHint'].includes(id)?'genie-webtoon':maps[id.split('.')[0]]?.objects.find(object=>object.kind==='npc')?.texture;
    if(character?.endsWith('-webtoon'))return `/assets/webtoon/${character}.webp`;
    const path=character?({'ariana-webtoon':'webtoon/ariana-webtoon.webp',king:'story/king.svg',mira:'story/mira.svg',baru:'story/baru.svg',villager:'story/villager.svg',lotusShrine:'story/lotusShrine.svg',elephant:'story/elephant.svg',naira:'draft/naira.svg',genie:'draft/genie.svg',roc:'webtoon/roc-webtoon.webp',starMap:'draft/starMap.svg'} as Record<string,string>)[character]:undefined;
    if(id==='starMap')return '/assets/draft/starMap.svg';
    if(id==='crystalJournal')return '/assets/draft/journal.svg';
    return `/assets/${path??'webtoon/hero-webtoon.webp'}`;
}
// Canvas text gets bigger when the 1280x720 game is drawn small on a phone.
function textScale() {
    const shown = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    const base = controlMode === 'touch' ? (shown < 0.55 ? 1.45 : shown < 0.8 ? 1.3 : 1.1) : 1;
    return base * (host.save.settings.largeText ? 1.2 : 1);
}
function setControlMode(mode: ControlMode) {
    if (mode === controlMode) return;
    controlMode = mode;
    host.controlMode = mode;
    root.classList.toggle('touch-mode', mode === 'touch');
    hudCache = '';
    if (game && overlay.hidden) host.changed();
}
const host: Host = {
    save: freshSave(), hp: 100, mp: 60, input: new Input(root), controlMode,
    textScale,
    context(action: ActionContext) { touchControls.setContext(action, maps[host.save.checkpoint.stageId]?.mode === 'flight'); },
    loading(progress: number) { loadingBox.hidden = progress >= 1; el<HTMLProgressElement>('loading-bar').value = progress; },
    ready() { loadingBox.hidden = true; touch.hidden = false; },
    reward(r: Reward) { const before = progression(this.save.totalXp).level, beforeSkill=this.save.equippedSkill, newlyClaimed=!this.save.claimedRewardIds.includes(r.id); this.save = grantReward(this.save, r); if(newlyClaimed&&[r.treasures,r.weapons,r.relics,r.goldenHearts].some(items=>items?.length))stage?.celebrate(); if(beforeSkill!==this.save.equippedSkill)hudCache=''; if (progression(this.save.totalXp).level > before) {
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
    dialogue(id: string, done: () => void) {
        stage.freeze(true);
        const d = dialogues[id];
        let line = 0;
        const finish = () => { done(); resume(); };
        const show = () => {
            const art = dialogueArt(id, d.name, d.lines[line], line, portraitPath(id));
            const text = ctl(art.text);
            panel(`<div class="dialogue"><span class="dialogue-portrait" role="img" aria-label="${art.speaker} · ${art.character ? expressionNames[art.expression] : '기본'}" data-character="${art.character ?? 'static'}" data-expression="${art.character ? art.expression : 'neutral'}" data-frame="${art.frame}" data-sheet="${Boolean(art.character)}"><img src="${art.src}" alt="" style="left:${-art.frame * 100}%"></span><div><p class="eyebrow">항해의 대화</p><h2>${art.speaker}</h2><p data-testid="dialogue-text">${text}</p><small>${line + 1} / ${d.lines.length}${controlMode === 'touch' ? ' · 화면을 눌러 계속' : ''}</small></div></div><div class="buttons"><button id="next">${line === d.lines.length - 1 ? '대화 마치기' : '다음'}</button><button class="secondary" id="skip">전체 생략</button></div>`, 'talk');
            const image = overlay.querySelector<HTMLImageElement>('.dialogue-portrait img')!;
            image.onerror = () => {
                image.onerror = null;
                const portrait = image.parentElement!;
                portrait.dataset.sheet = 'false'; portrait.dataset.expression = 'neutral'; portrait.dataset.frame = '0';
                portrait.setAttribute('aria-label', `${art.speaker} · 기본`);
                image.style.left = '0'; image.src = art.fallback;
            };
            el('next').onclick = () => { if (++line < d.lines.length) show(); else finish(); };
            el('skip').onclick = finish;
            // Tapping anywhere on the speech box advances, like turning a page.
            overlay.querySelector<HTMLElement>('.panel')!.addEventListener('click', e => { if (!(e.target as HTMLElement).closest('button')) el('next').click(); });
        };
        show();
    },
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
        this.save.clearedStageIds.push(s.id); this.persist(); stage.freeze(true); panel(`<p class="eyebrow">항로를 열었어요</p><h1>${s.title}</h1><p>첫 완료 보상 ${s.clearXp} XP · 보물과 진행을 저장했어요.</p><div class="buttons"><button id="next-stage">${!maps[s.nextStageId ?? ''] ? '이번 항해 기록 보기' : '다음 스테이지'}</button><button class="secondary" id="world">항해 지도</button></div>`); el('next-stage').onclick = () => { if (!maps[s.nextStageId ?? ''])
        mapMenu();
    else
        startStage(s.nextStageId!); }; el('world').onclick = mapMenu;
        if(s.id==='S36'){
            panel(`<p class="eyebrow">THE END · 그리고 새로운 시작</p><h1>함께 여는 새로운 항해</h1><div class="ending-portraits"><img src="/assets/webtoon/hero-webtoon.webp" alt="성인 항해사 신밧드"><img src="/assets/webtoon/ariana-webtoon.webp" alt="성인 지도 제작자 아리아나"></div><p>두 사람은 항해 도서관을 함께 운영하며 행복하게 살아갔어요.<br>새로운 바닷길에는 언제나 친구들의 이야기가 함께했답니다.</p><p>기획 · 아이의 24개 모험 장면<br>이야기·프로그래밍·독자 벡터 아트 · 신밧드 프로젝트<br>장별 일러스트 · OpenAI imagegen<br>음악·효과음 · 프로젝트 자체 합성</p><p>엔딩과 보물을 저장했어요. 선택 보물을 모두 모으지 않아도 모험은 완성돼요.</p><div class="buttons"><button id="free-explore">자유 탐험 계속</button><button id="world" class="secondary">항해 지도 · 다시 방문</button></div>`);
            el('free-explore').onclick=resume;el('world').onclick=mapMenu;
        }
    },
};
root.classList.toggle('touch-mode', controlMode === 'touch');
// A finger lifted from the action button also fires a click at the same spot.
// If that tap just opened a speech box or menu, the click would land on it and
// skip the first line, so clicks right after a control touch are swallowed.
let ghostClickUntil = 0;
const touchControls = new TouchControls(touch, host.input, () => { audio.unlock(); setControlMode('touch'); }, () => { ghostClickUntil = performance.now() + 450; });
overlay.addEventListener('click', e => { if (performance.now() < ghostClickUntil) { e.preventDefault(); e.stopPropagation(); } }, true);
window.addEventListener('keydown', e => { if (!e.repeat && e.key.length <= 6 && !['Tab', 'Enter'].includes(e.key)) setControlMode('keyboard'); }, { capture: true });
function panel(html: string, variant = '') {
    audio.setPaused(true);
    if(html.includes('<div class="equipment">')){
        html=html.replace('<button id="flame-skill" class="selected">','<button id="flame-skill" data-skill="flamePulse" class="'+(host.save.equippedSkill==='flamePulse'?'selected':'')+'">');
        const late=ownedActiveSkills(host.save).filter(([id])=>id!=='flamePulse').map(([id,skill])=>`<button data-skill="${id}" ${host.save.equippedSkill===id?'class="selected"':''}>${skill.name}<small>${skill.detail}</small></button>`).join('');
        html=html.replace('<p>항해 일지',`${late?'<h3>핵심 보물 능력</h3>'+late:''}<p>항해 일지`);
    }
    overlay.hidden = false;
    overlay.className = variant;
    overlay.innerHTML = `<section class="panel" role="dialog" aria-modal="true" aria-label="게임 메뉴">${html}</section>`;
    host.input.clear();
    overlay.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
}
function resume() { overlay.hidden = true; overlay.className = ''; stage.freeze(false); audio.setPaused(false); canvas.focus(); host.changed(); }
function boot(s: Save) { host.save = s; host.hp = maxHp(s); host.mp = maxMp(s); audio.unlock(); audio.setMusic(s.settings.musicVolume); audio.setPaused(false); overlay.hidden = true; overlay.className = ''; hud.hidden = false; touch.hidden = true; loadingBox.hidden = false; hudCache = ''; if (game) {
    stage.scene.restart();
    canvas.focus();
    return;
} stage = new Stage(host); game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 1280, height: 720, backgroundColor: '#123744', scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1500 }, debug: false } }, input: { keyboard: false }, scene: [stage], render: { antialias: true }, audio: { noAudio: true } }); canvas.focus(); }
function startStage(id: string) { if (!maps[id] || !canEnter(host.save, id)) {
    notice('아직 개발 중이거나 앞선 항로를 먼저 완료해야 해요.');
    return;
} host.save.checkpoint = { stageId: id, checkpointId: 'start' }; host.persist(); boot(host.save); }
const fullscreenAvailable = () => !!document.fullscreenEnabled;
async function toggleFullscreen() {
    try {
        if (document.fullscreenElement) { await document.exitFullscreen(); return; }
        await root.requestFullscreen({ navigationUI: 'hide' });
        const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        await orientation.lock?.('landscape').catch(() => undefined);
    } catch { notice('이 기기에서는 전체 화면을 쓸 수 없어요. 홈 화면에 추가하면 넓게 볼 수 있어요.'); }
}
function renderHud() {
    const s = host.save, p = progression(s.totalXp), def = campaign.find(x => x.id === s.checkpoint.stageId)!;
    const mode = maps[def.id]?.mode;
    const flight = mode === 'flight';
    const free = flight || (mode === 'swim' && s.treasures.includes('T04'));
    const skill = s.equippedSkill ? activeSkills[s.equippedSkill] : null;
    const list = s.weapons, next = list[(list.indexOf(s.equippedWeapon) + 1) % list.length];
    const hpRatio = Math.max(0, Math.min(1, host.hp / maxHp(s))), mpRatio = Math.max(0, Math.min(1, host.mp / maxMp(s)));
    const weaponName = flight ? '로크의 날개' : weapons[s.equippedWeapon].name;
    const chipKeys = flight ? 'Space 공격' : s.weapons.length > 1 ? 'Q 교체' : 'J 공격';
    const html = `<div class="stats"><span class="stage-number">${def.id}</span><div class="vitals"><b class="hp-line"><span class="heart" aria-hidden="true">♥</span>${Math.ceil(host.hp)}<span class="max"> / ${maxHp(s)}</span></b><meter aria-label="체력" min="0" max="${maxHp(s)}" value="${host.hp}" ${hpRatio < .3 ? 'class="low"' : ''}></meter><span class="mp-bar" aria-label="마력 ${Math.floor(host.mp)} / ${maxMp(s)}"><i style="width:${Math.round(mpRatio * 100)}%"></i></span></div><div class="level"><b>Lv.${p.level}</b><small>XP ${p.xpIntoLevel} / ${p.nextXp || 'MAX'} · MP ${Math.floor(host.mp)} / ${maxMp(s)}</small></div></div><div class="mission"><small>현재 항로</small><strong>${def.title}</strong><span>${ctl(maps[def.id]?.objective ?? '개발 중')}</span></div><div class="hud-actions">${def.id==='S08'?'<button id="reset-mirrors">거울 초기화</button>':''}<span class="coins">◈ ${s.coins}</span>${controlMode === 'touch' && fullscreenAvailable() ? `<button id="fullscreen" aria-label="전체 화면">${document.fullscreenElement ? '⤡' : '⛶'}</button>` : ''}<button id="bag" aria-label="가방과 지도"><span aria-hidden="true">🎒</span><span class="key-label"> 가방 M</span></button><button id="pause" aria-label="일시정지">Ⅱ</button></div><div class="weapon-chip">${!flight && s.weapons.length ? `<img src="${weaponIcon(s.equippedWeapon)}" alt="">` : ''}${weaponName} <span>${ctl(chipKeys)}</span>${!flight && skill ? ` · ${ctl(`${skill.short} R`)}` : ''}${s.relics.filter(r=>r==='R01'||r==='R02').map(r => ` · ${r === 'R01' ? '메달' : '폭풍 수정'}`).join('')}</div>`;
    root.classList.toggle('large-text', s.settings.largeText);
    if (html === hudCache) return;
    hudCache = html;
    hud.innerHTML = html;
    touchControls.setMode(free);
    touchControls.setSkill(!flight && skill ? skill.short : null, skill?.name ?? '보물 능력', s.equippedSkill);
    touchControls.setWeapons(weaponIcon(s.equippedWeapon), !flight && list.length > 1 ? weaponIcon(next) : null, weapons[s.equippedWeapon].name);
    if (def.id === 'S08') el('reset-mirrors').onclick = () => { stage.resetMirrors(); canvas.focus(); };
    el('bag').onclick = mapMenu;
    el('pause').onclick = pauseMenu;
    if (document.getElementById('fullscreen')) el('fullscreen').onclick = () => { void toggleFullscreen(); };
    hud.querySelector<HTMLElement>('.mission')!.onclick = () => notice(maps[def.id]?.objective ?? '');
}
document.addEventListener('fullscreenchange', () => { hudCache = ''; if (game) host.changed(); });
function exportSave(s: Save = host.save) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })); a.download = 'sinbad-save.json'; a.click(); window.setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
function confirmReplace(text: string, accept: () => void, back: () => void) { panel(`<h2>저장 변경 확인</h2><p>${text}</p><p>현재 기록을 먼저 파일로 보관할 수 있어요.</p><div class="buttons"><button id="backup-export">현재 기록 내보내기</button><button id="confirm" class="secondary">기존 기록을 바꾸고 진행</button><button id="cancel" class="secondary">취소</button></div>`); el('backup-export').onclick = () => exportSave(); el('confirm').onclick = accept; el('cancel').onclick = back; }
async function importFile(file: File) { try {
    if (file.size > 256 * 1024)
        throw Error('256KiB 이하 파일만 가져올 수 있어요.');
    const s = parseSave(await file.text());
    if (!maps[s.checkpoint.stageId])
        throw Error('이 버전에 등록되지 않은 스테이지 저장이에요.');
    confirmReplace('가져온 파일로 이 브라우저의 진행을 바꿀까요?', () => { store.blocked = false; host.save = s; host.persist(); boot(s); }, () => game ? pauseMenu() : title());
}
catch (e) {
    notice(`가져오기 실패: ${String(e)}`);
} }
function saveControls() { el('export').onclick = () => exportSave(); el<HTMLInputElement>('import').onchange = e => { const file = (e.target as HTMLInputElement).files?.[0]; if (file)
    void importFile(file); }; }
function pauseMenu() { if (!game)
    return; stage.freeze(true); panel(`<p class="eyebrow">잠시 닻을 내리고</p><h1>쉬어 가도 괜찮아</h1><p>이 브라우저의 안전 체크포인트에 저장합니다.<br>다른 기기로 자동 동기화되지는 않아요.</p><div class="buttons"><button id="resume">모험 계속</button><button id="save">체크포인트 저장</button><button id="retry" class="secondary">체크포인트에서 재시작</button><button id="settings" class="secondary">설정·조작법</button><button id="export" class="secondary">저장 내보내기</button><label class="file-button">저장 가져오기<input id="import" type="file" accept=".json,application/json"></label><button id="home" class="secondary">제목으로</button></div>`); el('resume').onclick = resume; el('save').onclick = () => { host.persist(); notice(store.blocked ? '저장이 보호되어 있어요. 파일로 내보내 주세요.' : '체크포인트 기록을 저장했어요.'); }; el('retry').onclick = () => boot(host.save); el('settings').onclick = () => settings(pauseMenu); el('home').onclick = title; saveControls(); }
function settings(back: () => void) {
    const s = host.save.settings;
    const guide = controlMode === 'touch'
        ? '<div class="control-guide"><b>◀ ▶</b><span>왼손 · 이동 (손가락을 밀어도 돼요)</span><b>▲</b><span>오른손 · 점프 / 위로</span><b>행동</b><span>공격 · 대화 · 살펴보기</span><b>✦ / 바꾸기</b><span>보물 능력 · 무기 교체</span></div><p>큰 <b>행동</b> 버튼의 그림이 지금 할 일을 알려 줘요. 적이 공격을 준비하면 행동 버튼은 먼저 공격해요.</p>'
        : '<div class="control-guide"><b>← →</b><span>이동</span><b>↑ / W</b><span>점프</span><b>Space</b><span>공격·대화·도구</span><b>Q · R</b><span>무기 교체 · 보물 능력</span></div><p>J 공격, E 대화, L 회피도 쓸 수 있어요. 휴대폰에서는 이동·점프와 <b>행동</b> 버튼만으로 충분해요.</p>';
    panel(`<p class="eyebrow">나에게 맞는 모험</p><h2>간단 조작</h2>${guide}<label>난이도 <select id="difficulty"><option value="relaxed">편안한 모험</option><option value="normal">일반 모험</option></select></label><label>배경 음악 <input id="music" type="range" min="0" max="1" step="0.05" value="${s.musicVolume}"></label><label>효과음 <input id="volume" type="range" min="0" max="1" step="0.05" value="${s.sfxVolume}"></label><label><input id="aim" type="checkbox" ${s.aimAssist ? 'checked' : ''}> 공격할 때 가까운 적 쪽으로 돌아보기</label><label><input id="motion" type="checkbox" ${s.reducedMotion ? 'checked' : ''}> 연출 줄이기</label><label><input id="large" type="checkbox" ${s.largeText ? 'checked' : ''}> 글자 크게</label><button id="back">설정 저장 · 돌아가기</button>`);
    el<HTMLSelectElement>('difficulty').value = s.difficulty;
    el('back').onclick = () => { s.difficulty = el<HTMLSelectElement>('difficulty').value as 'relaxed' | 'normal'; s.musicVolume = Number(el<HTMLInputElement>('music').value); s.sfxVolume = Number(el<HTMLInputElement>('volume').value); s.aimAssist = el<HTMLInputElement>('aim').checked; s.reducedMotion = el<HTMLInputElement>('motion').checked; s.largeText = el<HTMLInputElement>('large').checked; audio.setMusic(s.musicVolume); if (game)
        host.persist(); host.changed(); back(); };
}
function mapMenu() { if (!game)
    return; stage.freeze(true); const s = host.save; panel(`<p class="eyebrow">일곱 보물과 바다의 약속</p><h2>항해 지도 · 완료 ${s.clearedStageIds.length} / 36</h2><p>수집한 무기와 유물은 잃지 않아요. 무기를 눌러 바꿀 수 있어요.</p><div class="equipment">${s.weapons.map(w => `<button data-weapon="${w}" ${w === s.equippedWeapon ? 'class="selected"' : ''}><img src="${weaponIcon(w)}" alt="">${weapons[w].name}<small>${weapons[w].description}</small></button>`).join('')}${s.relics.map(r => `<p>✧ ${relics[r as keyof typeof relics]}</p>`).join('')}<p>황금 하트 ${s.goldenHearts.length} / 8 · ${s.flags.includes('bubbleBlessing') ? '공기방울 보호 획득' : '공기방울 보호 미획득'}${s.treasures.includes('T04') ? ' · 진주로 자유 수영' : ''}</p>${s.treasures.includes('T01')?'<button id="flame-skill" class="selected">선택 스킬 · 영원의 불씨<small>R · 15MP · 4초 / E 점화는 무료</small></button>':''}<p>항해 일지 ${s.journalPageIds.length}장</p>${s.journalPageIds.includes('S08.journal')?'<button id="read-journal">수정 동굴 일지 읽기</button>':''}<p>핵심 보물 ${s.treasures.length} / 7 · ${Object.values(treasures).map(t => `${t.name}(${t.stage})`).join(' · ')}</p></div><div class="stage-grid">${campaign.map(d => `<button data-stage="${d.id}" ${d.status === 'planned' || !canEnter(s, d.id) ? 'disabled' : ''}><b>${d.id}</b> ${d.title}<small>${d.status === 'planned' ? '개발 중' : s.clearedStageIds.includes(d.id) ? '완료 · 재방문' : canEnter(s, d.id) ? '항해 가능' : '잠김'} · ${d.chapter}장</small></button>`).join('')}</div><div class="buttons"><button id="back">현재 모험으로</button><button id="replay" class="secondary">대화 다시 보기</button></div>`); overlay.querySelectorAll<HTMLButtonElement>('[data-stage]').forEach(b => b.onclick = () => startStage(b.dataset.stage!)); overlay.querySelectorAll<HTMLButtonElement>('[data-weapon]').forEach(b => b.onclick = () => { host.save = equip(s, b.dataset.weapon as WeaponId); host.persist(); host.changed(); mapMenu(); }); if(s.treasures.includes('T01'))el('flame-skill').onclick=()=>{host.save.equippedSkill='flamePulse';host.persist();host.changed();}; if(s.journalPageIds.includes('S08.journal'))el('read-journal').onclick=()=>host.dialogue('crystalJournal',()=>{}); el('back').onclick = resume; el('replay').onclick = () => host.dialogue(Number(s.checkpoint.stageId.slice(1))>=9?`${s.checkpoint.stageId}.intro`:s.checkpoint.stageId === 'S08' ? (s.completedObjectiveIds.includes('S08.starMap')?'starMap':s.treasures.includes('T02')?'hazil':'crystalHint') : s.checkpoint.stageId === 'S06' ? 'rah' : s.checkpoint.stageId === 'S07' ? 'waveHint' : s.checkpoint.stageId === 'S01' ? 'captain' : s.checkpoint.stageId === 'S02' ? 'siren' : s.checkpoint.stageId === 'S04' ? 'whale' : s.checkpoint.stageId === 'S05' ? 'nairaHint' : 'storm', () => { }); }
function title() { if (game)
    stage.freeze(true); hud.hidden = true; touch.hidden = true; loadingBox.hidden = true; const existing = store.inspect(); if (existing.save)
    host.save = existing.save; panel(`<div class="title-art" aria-hidden="true"><span class="orbit">✦</span><img src="/assets/webtoon/hero-webtoon.webp" alt=""></div><p class="eyebrow">SINBAD · THE SEVEN TREASURES</p><h1>신밧드</h1><h2>일곱 보물과 바다의 약속</h2><p>안개 너머의 친구들, 폭풍 너머의 보물.<br>새로운 바닷길을 함께 열어 볼까요?</p><div class="buttons"><button id="new">새 모험 시작</button><button id="continue" class="secondary" ${existing.save ? '' : 'disabled'}>이어하기${existing.save ? ' · ' + existing.save.checkpoint.stageId : ''}</button><button id="settings" class="secondary">설정·조작법</button><button id="export" class="secondary">저장 내보내기</button><label class="file-button">저장 가져오기<input id="import" type="file" accept=".json,application/json"></label>${existing.backup ? '<button id="recover">백업 복구</button>' : ''}</div><p class="muted">${existing.problem ? '저장 기록을 읽지 못했어요. 원본은 보존됩니다.' : existing.save ? '안전 체크포인트에서 완전 회복하여 이어갑니다.' : '저장된 모험이 아직 없어요.'}</p><footer>S01–S36 플레이 가능 · M6 검수 중<br>ART_DRAFT · 장별 웹툰 원화·자체 제작 벡터</footer>`, 'title'); el('new').onclick = () => { const start = () => { store.blocked = false; const s = freshSave(); s.settings = { ...host.save.settings }; host.save = s; host.persist(); boot(s); }; if (existing.save || existing.problem)
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
overlay.addEventListener('click',e=>{const button=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-skill]');if(!button)return;host.save=selectActiveSkill(host.save,button.dataset.skill as ActiveSkillId);hudCache='';host.persist();host.changed();mapMenu();});
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
