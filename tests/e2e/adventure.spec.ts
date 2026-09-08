import { test, expect, type Page } from '@playwright/test';
import { freshSave } from '../../src/core/state';
import { SAVE_KEY } from '../../src/core/save';
import { maps } from '../../src/content/maps';
interface Snapshot {
    stage: string;
    player: {
        x: number;
        y: number;
        hp: number;
        maxHp: number;
        vx: number;
        vy: number;
    };
    save: ReturnType<typeof freshSave>;
    paused: boolean;
    sim: number;
    enemies: {
        id: string;
        x: number;
        y: number;
        hp: number;
        state: string;
    }[];
    boomerang: boolean;
}
const state = (page: Page) => page.evaluate(() => Reflect.get(window, '__SINBAD_TEST__')) as Promise<Snapshot>;
async function move(page: Page, x: number) { let snap = await state(page); let jumpAt = 0; const until = Date.now() + 22000; while (Math.abs(snap.player.x - x) > 15) {
    if (Date.now() > until)
        throw Error(`Could not reach ${x}: ${JSON.stringify(snap.player)}`);
    const direction = snap.player.x < x ? 'd' : 'a';
    await page.keyboard.down(direction);
    await page.keyboard.up(direction === 'd' ? 'a' : 'd');
    const terrain = maps[snap.stage].platforms;
    const feet = snap.player.y + 62;
    const supporting = terrain.find(p => Math.abs(p.y - feet) < 10 && snap.player.x >= p.x && snap.player.x <= p.x + p.w);
    const edge = supporting && (direction === 'd' ? supporting.x + supporting.w - snap.player.x < 65 : snap.player.x - supporting.x < 65);
    const step = terrain.some(p => p.y < feet - 10 && p.y >= feet - 150 && (direction === 'd' ? p.x - snap.player.x > 0 && p.x - snap.player.x < 95 : snap.player.x - p.x - p.w > 0 && snap.player.x - p.x - p.w < 95));
    if (supporting && (edge || step) && Date.now() - jumpAt > 250) {
        await page.keyboard.press('Space');
        jumpAt = Date.now();
    }
    await page.waitForTimeout(80);
    snap = await state(page);
} await page.keyboard.up('a'); await page.keyboard.up('d'); await page.waitForTimeout(650); }
async function dialogue(page: Page, skip = true) { await page.keyboard.press('e'); await expect(page.getByTestId('dialogue-text')).toBeVisible(); if (skip)
    await page.getByRole('button', { name: '전체 생략' }).click();
else {
    while (await page.getByRole('button', { name: '다음', exact: true }).isVisible())
        await page.getByRole('button', { name: '다음', exact: true }).click();
    await page.getByRole('button', { name: '대화 마치기' }).click();
} }
async function fight(page: Page, id: string) { let snap = await state(page); const enemy = snap.enemies.find(e => e.id === id); if (!enemy || enemy.hp <= 0)
    return; await move(page, enemy.x - 65); await page.keyboard.down('d'); await page.waitForTimeout(60); await page.keyboard.up('d'); for (let i = 0; i < 40; i++) {
    snap = await state(page);
    const target = snap.enemies.find(e => e.id === id);
    if (!target || target.hp <= 0) return;
    if (Math.abs(target.x - snap.player.x) > 120) await move(page, target.x - 60);
    const facing = target.x < (await state(page)).player.x ? 'a' : 'd';
    await page.keyboard.down(facing);
    await page.waitForTimeout(40);
    await page.keyboard.up(facing);
    await page.keyboard.press('j');
    await page.waitForTimeout(420);
    if (await page.getByRole('button', { name: '전체 생략' }).isVisible())
        await page.getByRole('button', { name: '전체 생략' }).click();
    snap = await state(page);
    if (snap.enemies.find(e => e.id === id)?.hp === 0 || !snap.enemies.some(e => e.id === id))
        return;
} throw Error(`Enemy still alive ${id}`); }
async function use(page: Page, x: number) { await move(page, x); await page.keyboard.press('e'); await page.waitForTimeout(150); }
test('new game → S01 → S02 → S03 with real keyboard inputs and checkpoint reload', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400)
        errors.push(`${r.status()} ${r.url()}`); });
    await page.goto('/');
    await expect(page.getByRole('button', { name: '이어하기', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: '새 모험 시작' }).click();
    await expect.poll(async () => (await state(page)).stage).toBe('S01');
    const first = await state(page);
    await page.keyboard.down('d');
    await page.waitForTimeout(250);
    await page.keyboard.press('Space');
    await page.waitForTimeout(180);
    const jumped = await state(page);
    expect(jumped.player.x).toBeGreaterThan(first.player.x);
    expect(jumped.player.y).toBeLessThan(first.player.y);
    await page.keyboard.up('d');
    await page.waitForTimeout(800);
    await move(page, 250);
    await dialogue(page, false);
    await use(page, 774);
    expect((await state(page)).save.relics).toContain('R01');
    for (const id of ['skeleton.01', 'skeleton.02', 'skeleton.03', 'skeleton.04', 'archer.01'])
        await fight(page, `S01.enemy.${id}`);
    await move(page, 3900);
    expect((await state(page)).save.checkpoint.checkpointId).toBe('boss');
    const before = await state(page);
    await page.reload();
    await page.getByRole('button', { name: '이어하기 · S01' }).click();
    await expect.poll(async () => (await state(page)).stage).toBe('S01');
    expect((await state(page)).player.x).toBeCloseTo(3870, -1);
    expect((await state(page)).save.claimedRewardIds).toEqual(before.save.claimedRewardIds);
    expect((await state(page)).player.hp).toBe((await state(page)).player.maxHp);
    await fight(page, 'S01.enemy.captain');
    await page.screenshot({ path: info.outputPath('S01-boss-cleared.png') });
    await use(page, 4610);
    await page.getByRole('button', { name: '다음 스테이지' }).click();
    await expect.poll(async () => (await state(page)).stage).toBe('S02');
    for (const [index, x] of [960, 1930, 2830].entries()) {
        await move(page, x - 45);
        await page.keyboard.down('d'); await page.waitForTimeout(60); await page.keyboard.up('d');
        await page.keyboard.press('j');
        await page.waitForTimeout(350);
        expect((await state(page)).save.completedObjectiveIds).toContain(`S02.shell.${index + 1}`);
    }
    await move(page, 3270);
    await use(page, 3450);
    await page.getByRole('button', { name: '전체 생략' }).click();
    await fight(page, 'S02.enemy.siren');
    await use(page, 4050);
    expect((await state(page)).save.weapons).toContain('W02');
    await page.keyboard.press('q');
    await expect.poll(async () => (await state(page)).save.equippedWeapon).toBe('W02');
    await page.keyboard.press('j');
    await page.waitForTimeout(200);
    expect((await state(page)).boomerang).toBe(true);
    await page.waitForTimeout(1200);
    expect((await state(page)).boomerang).toBe(false);
    await page.screenshot({ path: info.outputPath('S02-boomerang.png') });
    await use(page, 4630);
    await page.getByRole('button', { name: '다음 스테이지' }).click();
    await expect.poll(async () => (await state(page)).stage).toBe('S03');
    await use(page, 860);
    await use(page, 2210);
    await use(page, 3020);
    expect((await state(page)).save.relics).toContain('R02');
    await use(page, 3730);
    await page.getByRole('button', { name: '전체 생략' }).click();
    await move(page, 3800);
    await page.screenshot({ path: info.outputPath('S03-storm-crystal.png') });
    await use(page, 4620);
    await page.getByRole('button', { name: '항해 지도' }).click();
    await expect(page.getByRole('heading', { name: 'M1 · 첫 항해를 마쳤어요' })).toBeVisible();
    await expect(page.locator('[data-stage="S04"]')).toBeEnabled();
    expect((await state(page)).save.clearedStageIds).toEqual(['S01', 'S02', 'S03']);
    expect((await state(page)).save.totalXp).toBeGreaterThanOrEqual(140);
    expect(errors).toEqual([]);
    await page.screenshot({ path: info.outputPath('M1-complete.png') });
    await page.locator('[data-stage="S04"]').click();
    await expect.poll(async()=>(await state(page)).stage).toBe('S04');
});
test('pause freezes world; export/import and real touch pointer combination', async ({ page }, info) => {
    await page.goto('/');
    await page.getByRole('button', { name: '새 모험 시작' }).click();
    await expect.poll(async () => (await state(page)).stage).toBe('S01');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '일시정지', exact: true }).click();
    const before = await state(page);
    await page.waitForTimeout(400);
    expect((await state(page)).sim).toBe(before.sim);
    expect((await state(page)).player.hp).toBe(before.player.hp);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '저장 내보내기' }).click();
    const download = await downloadPromise;
    await download.saveAs(info.outputPath('save.json'));
    await page.locator('#import').setInputFiles(info.outputPath('save.json'));
    await page.getByRole('button', { name: '기존 기록을 바꾸고 진행' }).click();
    await expect.poll(async () => (await state(page)).paused).toBe(false);
    await page.setViewportSize({ width: 844, height: 390 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 3 });
    const right = await page.locator('[data-action="right"]').boundingBox(), jump = await page.locator('[data-action="jump"]').boundingBox();
    const p = await state(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: right!.x + 25, y: right!.y + 24, id: 1 }, { x: jump!.x + 25, y: jump!.y + 24, id: 2 }] });
    await page.waitForTimeout(300);
    const moved = await state(page);
    expect(moved.player.x).toBeGreaterThan(p.player.x);
    expect(moved.player.y).toBeLessThan(p.player.y);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(500);
    await page.screenshot({ path: info.outputPath('mobile-844x390.png') });
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('button', { name: '모험 계속' })).toBeVisible();
    expect((await state(page)).paused).toBe(true);
});
test('missing sprite fallback loads; corrupt and future saves stay untouched', async ({ page }) => {
    await page.addInitScript(([key]) => localStorage.setItem(key, '{"schemaVersion":99}'), [SAVE_KEY]);
    await page.goto('/');
    await expect(page.getByText('저장 기록을 읽지 못했어요. 원본은 보존됩니다.')).toBeVisible();
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe('{"schemaVersion":99}');
    await page.getByRole('button', { name: '새 모험 시작' }).click();
    await page.getByRole('button', { name: '취소', exact: true }).click();
    expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe('{"schemaVersion":99}');
    await page.route('**/assets/draft/player.svg', r => r.abort());
    await page.getByRole('button', { name: '새 모험 시작' }).click();
    await page.getByRole('button', { name: '기존 기록을 바꾸고 진행' }).click();
    await expect.poll(async () => (await state(page)).stage).toBe('S01');
    expect((await state(page)).player.hp).toBe(100);
});
