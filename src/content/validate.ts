import campaign from './stageIndex';
import { maps } from './maps';
import { assets } from './assets.manifest';
import { dialogues } from './dialogues.ko';
import { goldenHearts, treasures, weapons } from './items';
import { itemIds } from '../core/state';
import { objectiveReward } from '../core/adventure';
export function validateContent() {
    const errors: string[] = [];
    const check = (ok: unknown, message: string) => { if (!ok)
        errors.push(message); };
    const unique = (ids: string[], label: string) => check(new Set(ids).size === ids.length, `${label}: duplicate ID`);
    check(campaign.length === 36, '36 stages required');
    unique(campaign.map(s => s.id), 'stage');
    const refs = new Set(campaign.flatMap(s => s.childSceneRefs));
    check(refs.size === 24, '24 original child scenes required');
    for (const ref of [...Array.from({ length: 23 }, (_, i) => String(i + 1)).filter(x => x !== '15'), '15a', '15b'])
        check(refs.has(ref), `missing child scene ${ref}`);
    const owned = new Set<string>(), flags = new Set<string>();
    const rewards: string[] = [];
    for (const [i, s] of campaign.entries()) {
        check(s.id === `S${String(i + 1).padStart(2, '0')}`, 'stage order');
        check(s.nextStageId === (campaign[i + 1]?.id ?? null), `${s.id}: invalid next stage`);
        check(s.clearXp === 40 + 4 * i, `${s.id}: first clear XP`);
        check(s.clearDescription.length > 0 && s.rewardDescription.length > 0, `${s.id}: missing design objectives/rewards`);
        for (const item of s.entryItems)
            check(owned.has(item), `${s.id}: ${item} required before acquisition`);
        for (const flag of s.entryFlags)
            check(flags.has(flag), `${s.id}: ${flag} required before reward`);
        for (const item of [...s.mandatoryItems, ...s.optionalItems])
            check(itemIds.has(item), `${s.id}: unknown reward ${item}`);
        s.mandatoryItems.forEach(x => owned.add(x));
        s.rewardFlags.forEach(x => flags.add(x));
        rewards.push(s.rewardId);
        check(s.status === 'planned' ? !maps[s.id] : !!maps[s.id], `${s.id}: implementation status/map mismatch`);
        if (s.status === 'planned')
            continue;
        const m = maps[s.id];
        check(m.spawns.length > 0 && m.platforms.length > 0 && m.objects.some(o => o.kind === 'exit'), `${s.id}: empty playable map`);
        unique([...m.spawns.map(x => x.id), ...m.objects.map(x => x.id), ...m.hearts.map(x => x.id)], `${s.id} entity`);
        check(m.checkpoints[0].id === 'start', `${s.id}: start checkpoint`);
        for (const p of m.platforms) {
            check(p.x >= 0 && p.x + p.w <= m.width && p.w >= 128 && p.y >= 0 && p.h > 0, `${s.id}: invalid platform`);
            if(p.motion)check(p.motion.rise>=0 && p.motion.rise<=48 && p.motion.period>=3000 && (p.motion.travel??0)>=0 && (p.motion.travel??0)<=24,`${s.id}: unsafe moving platform`);
        }
        const ground = m.platforms.filter(p => p.requiredGround).sort((a, b) => a.x - b.x);
        for (let j = 1; j < ground.length; j++) {
            check(ground[j].x - ground[j - 1].x - ground[j - 1].w + (ground[j].motion?.travel??0) + (ground[j-1].motion?.travel??0) <= 170, `${s.id}: unsafe required gap`);
            check(Math.abs(ground[j].y - ground[j - 1].y) <= 96, `${s.id}: unsafe required rise`);
            check(Math.abs(ground[j].y-(ground[j-1].y-(ground[j-1].motion?.rise??0)))<=96 && Math.abs(ground[j-1].y-(ground[j].y-(ground[j].motion?.rise??0)))<=96,`${s.id}: unsafe moving route extrema`);
        }
        for (const cp of m.checkpoints)
            check(m.platforms.some(p => !p.motion && cp.x > p.x + 30 && cp.x < p.x + p.w - 30 && Math.abs(cp.y + 60 - p.y) < 10), `${s.id}: unsafe checkpoint ${cp.id}`);
        const objectives = new Set([...m.objects.map(x => x.id), ...m.spawns.map(x => x.id)]);
        for (const o of m.objects) {
            check(o.x >= 0 && o.x <= m.width, `${o.id}: out of bounds`);
            for (const need of o.needs ?? [])
                check(objectives.has(need), `${o.id}: unknown prerequisite ${need}`);
            for(const item of o.requiresItems??[])check(itemIds.has(item),`${o.id}: unknown required item`);
            if (o.dialogue)
                check(!!dialogues[o.dialogue], `${o.id}: missing dialogue`);
            if (o.reward && o.reward !== 'coins')
                check(itemIds.has(o.reward), `${o.id}: unknown reward`);
            check((o.rewardFlags??[]).every(f=>s.rewardFlags.includes(f)),`${o.id}: unregistered flag reward`);
            rewards.push(objectiveReward(o).id);
        }
        for(const flag of s.rewardFlags)check(m.objects.some(o=>o.rewardFlags?.includes(flag)),`${s.id}: missing implemented flag reward ${flag}`);
        for(const item of s.mandatoryItems)if(item!=='W01')check(m.objects.some(o=>o.reward===item||[...(objectiveReward(o).weapons??[]),...(objectiveReward(o).treasures??[])].includes(item)),`${s.id}: missing implemented item reward ${item}`);
        const visit=(id:string,path:Set<string>)=>{if(path.has(id)){check(false,`${s.id}: prerequisite cycle at ${id}`);return;}const o=m.objects.find(o=>o.id===id);for(const need of o?.needs??[])visit(need,new Set([...path,id]));};
        for(const o of m.objects)visit(o.id,new Set());
        for(const w of m.water??[])check(w.w>0&&w.h>0&&w.x>=0&&w.x+w.w<=m.width,`${s.id}: invalid water region`);
        rewards.push(...m.spawns.map(e => e.id), ...m.hearts.map(h => h.id));
    }
    unique(rewards, 'reward');
    check(Object.keys(weapons).length === 7 && Object.keys(treasures).length === 7 && goldenHearts.length === 8, 'item counts');
    for (const [id, t] of Object.entries(treasures))
        check(campaign.find(s => s.id === t.stage)?.mandatoryItems.includes(id), `${id}: must be guaranteed`);
    check(campaign[4].rewardFlags.includes('bubbleBlessing') && !campaign[4].mandatoryItems.includes('T04'), 'S05 bubble must not grant swimming');
    check(campaign[15].entryFlags.includes('bubbleBlessing') && !campaign[15].entryItems.includes('T04') && campaign[15].mandatoryItems.includes('T04'), 'S16 protected entrance');
    check(campaign[3].optionalItems.includes('G01') && !campaign.slice(0, 3).some(s => s.optionalItems.includes('G01')), 'G01 remains S04');
    unique(assets.map(a => a.key), 'asset');
    return errors;
}
